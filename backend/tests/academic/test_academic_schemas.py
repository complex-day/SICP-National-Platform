import pytest
from uuid import uuid4
from pydantic import ValidationError

from app.schemas.academic import (
    UniversityCreate,
    UniversityUpdate,
    DepartmentCreate,
    FacultyAffiliationCreate,
    FacultyAffiliationVerify,
    MatchingBreakdown,
    UniversityMatchResponse,
    AcademicIntakeClaimRequest,
    IntakeTeamAllocationCreate,
)
from app.core.constants import UniversityStatus


def test_university_create_valid():
    data = {
        "name": "Indian Institute of Technology Bombay",
        "code": "IITB",
        "district": "Mumbai",
        "state": "Maharashtra",
        "address": "Powai, Mumbai",
        "website": "https://www.iitb.ac.in",
        "contact_email": "admin@iitb.ac.in",
        "contact_phone": "+91-22-25722545",
        "accreditation_details": {"naac_grade": "A++", "nirf_rank": 3},
        "domain_expertise": ["Water Purification", "Renewable Energy", "IoT"],
    }
    schema = UniversityCreate(**data)
    assert schema.name == "Indian Institute of Technology Bombay"
    assert schema.code == "IITB"
    assert len(schema.domain_expertise) == 3


def test_university_code_normalization_and_validation():
    # Lowercase should be normalized to uppercase
    data = {
        "name": "National Institute of Technology",
        "code": "nit-trichy",
        "district": "Tiruchirappalli",
        "state": "Tamil Nadu",
        "contact_email": "dean@nitt.edu",
    }
    schema = UniversityCreate(**data)
    assert schema.code == "NIT-TRICHY"

    # Invalid code with special chars
    with pytest.raises(ValidationError):
        UniversityCreate(
            name="Sample Univ",
            code="NIT TRICHY #1",
            district="District",
            state="State",
            contact_email="test@univ.edu",
        )


def test_university_domain_expertise_limit():
    # Max 15 tags allowed
    too_many_tags = [f"Tag_{i}" for i in range(16)]
    with pytest.raises(ValidationError, match="maximum of 15 domain expertise tags"):
        UniversityCreate(
            name="Tech University",
            code="TECH-U",
            district="District",
            state="State",
            contact_email="info@tech.edu",
            domain_expertise=too_many_tags,
        )


def test_department_code_validation():
    dept = DepartmentCreate(
        name="Computer Science & Engineering",
        code="cse",
        specializations=["AI", "Distributed Systems"],
        contact_email="hod.cse@univ.edu",
    )
    assert dept.code == "CSE"

    with pytest.raises(ValidationError):
        DepartmentCreate(
            name="Invalid Dept",
            code="CSE @ 1",
            contact_email="test@univ.edu",
        )


def test_faculty_affiliation_schemas():
    univ_id = uuid4()
    dept_id = uuid4()
    aff = FacultyAffiliationCreate(
        university_id=univ_id,
        department_id=dept_id,
        designation="Associate Professor",
    )
    assert aff.designation == "Associate Professor"

    # Test verify action normalization
    verify_approve = FacultyAffiliationVerify(action="approve")
    assert verify_approve.action == "APPROVE"

    verify_reject = FacultyAffiliationVerify(action="REJECT")
    assert verify_reject.action == "REJECT"

    with pytest.raises(ValidationError):
        FacultyAffiliationVerify(action="INVALID_ACTION")


def test_matching_breakdown_schema():
    breakdown = MatchingBreakdown(
        domain_expertise_score=95.0,
        faculty_availability_score=80.0,
        proximity_score=100.0,
        track_record_score=75.0,
        student_cohort_score=85.0,
    )
    match_resp = UniversityMatchResponse(
        university_id=uuid4(),
        university_name="IIT Bombay",
        total_score=88.5,
        breakdown=breakdown,
        explanation="High domain match and same district proximity.",
    )
    assert match_resp.total_score == 88.5
    assert match_resp.breakdown.proximity_score == 100.0


def test_intake_and_allocation_schemas():
    challenge_id = uuid4()
    univ_id = uuid4()
    claim = AcademicIntakeClaimRequest(
        challenge_id=challenge_id,
        university_id=univ_id,
    )
    assert claim.challenge_id == challenge_id

    alloc = IntakeTeamAllocationCreate(
        team_id=uuid4(),
        department_id=uuid4(),
        faculty_mentor_id=uuid4(),
    )
    assert alloc.team_id is not None
