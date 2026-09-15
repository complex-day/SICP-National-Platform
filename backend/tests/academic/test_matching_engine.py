import pytest
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.academic_service import AcademicService
from app.services.matching_service import MatchingService
from app.schemas.academic import (
    UniversityCreate,
    UniversityStatusUpdate,
    DepartmentCreate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
)
from app.core.constants import UniversityStatus


@pytest.mark.asyncio
async def test_matching_engine_5_factor_formula_and_explainability(
    db_session: AsyncSession, faculty_user, second_faculty_user, platform_admin, published_challenge
):
    # Register and verify university in the SAME state (West Bengal) and domain (Water)
    univ_data = UniversityCreate(
        name="Jadavpur Institute of Technology",
        code="JIT",
        district="Nadia",  # EXACT match with published_challenge.district
        state="West Bengal",
        contact_email="admin@jit.edu",
        domain_expertise=["Water Purification", "Groundwater Remediation"],
    )
    univ = await AcademicService.register_university(db_session, univ_data, faculty_user)
    await AcademicService.update_university_status(
        db_session, univ.id, UniversityStatusUpdate(status=UniversityStatus.VERIFIED, version=1), platform_admin
    )

    dept = await AcademicService.create_department(
        db_session, univ.id, DepartmentCreate(name="Water Resources", code="WATER", specializations=["Arsenic Removal"]), faculty_user
    )

    aff = await AcademicService.request_faculty_affiliation(
        db_session,
        FacultyAffiliationCreate(university_id=univ.id, department_id=dept.id, designation="Professor"),
        second_faculty_user,
    )
    await AcademicService.verify_faculty_affiliation(
        db_session, aff.id, FacultyAffiliationVerify(action="APPROVE"), faculty_user
    )

    # Execute matching engine
    ranked_univs = await MatchingService.rank_universities_for_challenge(db_session, published_challenge.id)
    assert len(ranked_univs) >= 1

    top_match = ranked_univs[0]
    assert top_match.university_id == univ.id
    assert top_match.breakdown.proximity_score == 100.0  # Same district
    assert top_match.breakdown.domain_expertise_score >= 80.0
    assert "Evaluated" in top_match.explanation

    # Rank faculty mentors
    faculty_matches = await MatchingService.rank_faculty_mentors_for_challenge(
        db_session, published_challenge.id, university_id=univ.id
    )
    assert len(faculty_matches) == 1
    assert faculty_matches[0].faculty_id == second_faculty_user.id
    assert faculty_matches[0].match_score > 50.0
