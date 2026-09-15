from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.academic import (
    UniversityCreate,
    UniversityUpdate,
    UniversityStatusUpdate,
    UniversityResponse,
    UniversityListResponse,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentHODUpdate,
    DepartmentResponse,
    DepartmentListResponse,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
    FacultyAffiliationResponse,
    FacultyAffiliationListResponse,
    UniversityMatchResponse,
    FacultyMatchResponse,
    AcademicIntakeClaimRequest,
    AcademicIntakeResponse,
    IntakeTeamAllocationCreate,
    IntakeTeamAllocationResponse,
)
from app.schemas.common import StandardResponse
from app.services.academic_service import AcademicService
from app.services.matching_service import MatchingService

router = APIRouter(prefix="/academic", tags=["Academic Collaboration Hub"])


# --- University Endpoints ---

@router.post("/universities", response_model=StandardResponse[UniversityResponse], status_code=status.HTTP_201_CREATED)
async def register_university(
    data: UniversityCreate,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    univ = await AcademicService.register_university(db, data, current_user)
    return StandardResponse(data=univ)


@router.get("/universities", response_model=StandardResponse[UniversityListResponse])
async def list_universities(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    state: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    result = await AcademicService.list_universities(
        db, skip=skip, limit=limit, state=state, district=district, status=status, search=search
    )
    return StandardResponse(data=result)


@router.get("/universities/{id}", response_model=StandardResponse[UniversityResponse])
async def get_university(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    univ = await AcademicService.get_university(db, id)
    return StandardResponse(data=univ)


@router.patch("/universities/{id}", response_model=StandardResponse[UniversityResponse])
async def update_university(
    id: UUID,
    data: UniversityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await AcademicService.update_university(db, id, data, current_user)
    return StandardResponse(data=updated)


@router.patch("/universities/{id}/status", response_model=StandardResponse[UniversityResponse])
async def update_university_status(
    id: UUID,
    data: UniversityStatusUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    updated = await AcademicService.update_university_status(db, id, data, current_user)
    return StandardResponse(data=updated)


@router.delete("/universities/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_university(
    id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    await AcademicService.delete_university(db, id, current_user)
    return None


# --- Department Endpoints ---

@router.post("/universities/{id}/departments", response_model=StandardResponse[DepartmentResponse], status_code=status.HTTP_201_CREATED)
async def create_department(
    id: UUID,
    data: DepartmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dept = await AcademicService.create_department(db, id, data, current_user)
    return StandardResponse(data=dept)


@router.get("/universities/{id}/departments", response_model=StandardResponse[DepartmentListResponse])
async def list_departments(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    depts = await AcademicService.list_departments(db, id)
    return StandardResponse(data=depts)


@router.patch("/departments/{id}/hod", response_model=StandardResponse[DepartmentResponse])
async def update_department_hod(
    id: UUID,
    data: DepartmentHODUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await AcademicService.update_department_hod(db, id, data, current_user)
    return StandardResponse(data=updated)


# --- Faculty Affiliation Endpoints ---

@router.post("/affiliations", response_model=StandardResponse[FacultyAffiliationResponse], status_code=status.HTTP_201_CREATED)
async def request_faculty_affiliation(
    data: FacultyAffiliationCreate,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    aff = await AcademicService.request_faculty_affiliation(db, data, current_user)
    return StandardResponse(data=aff)


@router.get("/universities/{id}/affiliations/pending", response_model=StandardResponse[FacultyAffiliationListResponse])
async def list_pending_affiliations(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pending = await AcademicService.list_pending_affiliations(db, id, current_user)
    return StandardResponse(data=pending)


@router.post("/affiliations/{id}/verify", response_model=StandardResponse[FacultyAffiliationResponse])
async def verify_faculty_affiliation(
    id: UUID,
    data: FacultyAffiliationVerify,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    verified = await AcademicService.verify_faculty_affiliation(db, id, data, current_user)
    return StandardResponse(data=verified)


# --- Multi-Factor AI Matching Endpoints ---

@router.get("/matching/universities/{challenge_id}", response_model=StandardResponse[List[UniversityMatchResponse]])
async def match_universities(
    challenge_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    matches = await MatchingService.rank_universities_for_challenge(db, challenge_id)
    return StandardResponse(data=matches)


@router.get("/matching/faculty/{challenge_id}", response_model=StandardResponse[List[FacultyMatchResponse]])
async def match_faculty(
    challenge_id: UUID,
    university_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    faculty_matches = await MatchingService.rank_faculty_mentors_for_challenge(
        db, challenge_id, university_id=university_id
    )
    return StandardResponse(data=faculty_matches)


# --- Academic Challenge Intake & Team Allocation Endpoints ---

@router.post("/intakes/claim", response_model=StandardResponse[AcademicIntakeResponse], status_code=status.HTTP_201_CREATED)
async def claim_challenge(
    data: AcademicIntakeClaimRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    intake = await AcademicService.claim_challenge(db, data.challenge_id, data.university_id, current_user)
    return StandardResponse(data=intake)


@router.post("/intakes/{id}/allocations", response_model=StandardResponse[IntakeTeamAllocationResponse], status_code=status.HTTP_201_CREATED)
async def allocate_team(
    id: UUID,
    data: IntakeTeamAllocationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    alloc = await AcademicService.allocate_team_to_intake(db, id, data, current_user)
    return StandardResponse(data=alloc)
