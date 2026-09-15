import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.academic import University, Department, FacultyAffiliation, AcademicIntake
from app.models.challenge import Challenge
from app.models.user import User, UserRole
from app.models.role_profiles import FacultyProfile
from app.core.constants import UniversityStatus, AffiliationStatus, IntakeStatus
from app.core.exceptions import NotFoundError
from app.schemas.academic import (
    MatchingBreakdown,
    UniversityMatchResponse,
    FacultyMatchResponse,
)
from app.repositories.academic_repository import AcademicRepository


class MatchingService:
    """Multi-factor AI Matching Engine for challenges, universities, and faculty mentors."""

    @staticmethod
    def calculate_proximity_score(univ_state: str, univ_district: str, challenge_state: str, challenge_district: str) -> float:
        """Deterministic geospatial proximity scoring formula."""
        if univ_district and challenge_district and univ_district.strip().lower() == challenge_district.strip().lower():
            return 100.0
        if univ_state and challenge_state and univ_state.strip().lower() == challenge_state.strip().lower():
            return 75.0
        return 25.0

    @staticmethod
    def calculate_domain_score(challenge_category: str, challenge_description: str, univ_expertise: List[str], dept_specializations: List[str]) -> float:
        """Domain and keyword overlap scoring."""
        if not univ_expertise and not dept_specializations:
            return 30.0

        all_tags = [t.lower().strip() for t in (univ_expertise or []) + (dept_specializations or [])]
        category_lower = challenge_category.lower() if challenge_category else ""
        desc_lower = challenge_description.lower() if challenge_description else ""

        matches = 0
        for tag in set(all_tags):
            if tag in category_lower or category_lower in tag:
                matches += 2
            elif tag in desc_lower:
                matches += 1

        if matches >= 3:
            return 95.0
        elif matches == 2:
            return 80.0
        elif matches == 1:
            return 60.0
        return 40.0

    @classmethod
    async def compute_university_match(cls, db: AsyncSession, challenge: Challenge, university: University) -> UniversityMatchResponse:
        # 1. Domain Score (40%)
        dept_specs = []
        for d in university.departments:
            if d.specializations and not d.is_deleted:
                dept_specs.extend(d.specializations)
        s_domain = cls.calculate_domain_score(
            str(challenge.category), challenge.description, university.domain_expertise or [], dept_specs
        )

        # 2. Faculty Availability Score (25%)
        active_affiliations = [a for a in university.affiliations if a.status == AffiliationStatus.ACTIVE and not a.is_deleted]
        available_faculty_count = 0
        for aff in active_affiliations:
            mentorship_count = await AcademicRepository.count_active_faculty_mentorships(db, aff.faculty_id)
            if mentorship_count < 3:
                available_faculty_count += 1

        if len(active_affiliations) == 0:
            s_faculty = 30.0
        else:
            ratio = available_faculty_count / len(active_affiliations)
            s_faculty = min(100.0, 40.0 + ratio * 60.0)

        # 3. Proximity Score (15%)
        s_proximity = cls.calculate_proximity_score(
            university.state, university.district, challenge.state or "", challenge.district or ""
        )

        # 4. Track Record Score (10%)
        completed_intakes = [i for i in university.intakes if i.status == IntakeStatus.COMPLETED and not i.is_deleted]
        total_intakes = [i for i in university.intakes if not i.is_deleted]
        if not total_intakes:
            s_track = 60.0  # baseline for verified institutions
        else:
            s_track = min(100.0, 50.0 + (len(completed_intakes) / len(total_intakes)) * 50.0)

        # 5. Student Cohort / Institutional Capacity (10%)
        dept_count = len([d for d in university.departments if not d.is_deleted])
        s_cohort = min(100.0, 50.0 + dept_count * 10.0)

        # Final Weighted Formula
        total_score = round(
            0.40 * s_domain + 0.25 * s_faculty + 0.15 * s_proximity + 0.10 * s_track + 0.10 * s_cohort,
            2
        )

        breakdown = MatchingBreakdown(
            domain_expertise_score=round(s_domain, 2),
            faculty_availability_score=round(s_faculty, 2),
            proximity_score=round(s_proximity, 2),
            track_record_score=round(s_track, 2),
            student_cohort_score=round(s_cohort, 2),
        )

        # Explainability string per Rule 6
        explanation = (
            f"Evaluated {university.name}: Domain match scored {breakdown.domain_expertise_score}/100 "
            f"based on institutional expertise; Geospatial proximity scored {breakdown.proximity_score}/100 "
            f"({university.district}, {university.state}); Faculty capacity scored {breakdown.faculty_availability_score}/100 "
            f"with {available_faculty_count} faculty members available for mentorship."
        )

        return UniversityMatchResponse(
            university_id=university.id,
            university_name=university.name,
            total_score=total_score,
            breakdown=breakdown,
            explanation=explanation,
        )

    @classmethod
    async def rank_universities_for_challenge(cls, db: AsyncSession, challenge_id: uuid.UUID) -> List[UniversityMatchResponse]:
        # Fetch challenge
        stmt = select(Challenge).where(and_(Challenge.id == challenge_id, Challenge.is_deleted.is_(False)))
        result = await db.execute(stmt)
        challenge = result.scalar_one_or_none()
        if not challenge:
            raise NotFoundError("Challenge not found")

        # Fetch verified universities
        univ_stmt = (
            select(University)
            .where(and_(University.status == UniversityStatus.VERIFIED, University.is_deleted.is_(False)))
            .options(
                selectinload(University.departments),
                selectinload(University.affiliations),
                selectinload(University.intakes),
            )
        )
        univ_result = await db.execute(univ_stmt)
        universities = list(univ_result.scalars().all())

        matches = []
        for univ in universities:
            match = await cls.compute_university_match(db, challenge, univ)
            matches.append(match)

        matches.sort(key=lambda x: x.total_score, reverse=True)
        return matches

    @classmethod
    async def rank_faculty_mentors_for_challenge(
        cls, db: AsyncSession, challenge_id: uuid.UUID, university_id: Optional[uuid.UUID] = None
    ) -> List[FacultyMatchResponse]:
        stmt = select(Challenge).where(and_(Challenge.id == challenge_id, Challenge.is_deleted.is_(False)))
        result = await db.execute(stmt)
        challenge = result.scalar_one_or_none()
        if not challenge:
            raise NotFoundError("Challenge not found")

        # Query active faculty affiliations
        filters = [
            FacultyAffiliation.status == AffiliationStatus.ACTIVE,
            FacultyAffiliation.is_deleted.is_(False),
        ]
        if university_id:
            filters.append(FacultyAffiliation.university_id == university_id)

        aff_stmt = (
            select(FacultyAffiliation)
            .where(and_(*filters))
            .options(
                selectinload(FacultyAffiliation.faculty),
                selectinload(FacultyAffiliation.department),
            )
        )
        aff_result = await db.execute(aff_stmt)
        affiliations = list(aff_result.scalars().all())

        results = []
        for aff in affiliations:
            faculty = aff.faculty
            # Get faculty profile
            prof_stmt = select(FacultyProfile).where(FacultyProfile.user_id == faculty.id)
            prof_res = await db.execute(prof_stmt)
            prof = prof_res.scalar_one_or_none()
            spec_text = prof.specialization if prof and prof.specialization else ""
            interests = [s.strip() for s in spec_text.split(",") if s.strip()]
            mentorship_count = await AcademicRepository.count_active_faculty_mentorships(db, faculty.id)

            if mentorship_count >= 3:
                continue  # Exceeded capacity limit

            has_challenge_mentor = await AcademicRepository.has_active_challenge_mentorship(
                db, faculty.id, challenge.id
            )
            if has_challenge_mentor:
                continue  # Prevent duplicate challenge mentorship

            # Calculate match score
            score = 60.0
            category_lower = str(challenge.category).lower()
            for item in interests:
                if item.lower() in category_lower or category_lower in item.lower():
                    score += 20.0
                elif item.lower() in challenge.description.lower():
                    score += 10.0

            score = min(100.0, score - mentorship_count * 10.0)

            explanation = (
                f"Dr. {faculty.full_name} ({aff.designation}, {aff.department.name}) matches challenge domain "
                f"with research focus in {', '.join(interests) if interests else 'relevant field'} "
                f"and {3 - mentorship_count} available mentoring capacity slot(s)."
            )

            results.append(
                FacultyMatchResponse(
                    faculty_id=faculty.id,
                    faculty_name=faculty.full_name,
                    department_id=aff.department.id,
                    department_name=aff.department.name,
                    match_score=round(score, 2),
                    active_mentorship_count=mentorship_count,
                    research_interests=interests,
                    explanation=explanation,
                )
            )

        results.sort(key=lambda x: x.match_score, reverse=True)
        return results
