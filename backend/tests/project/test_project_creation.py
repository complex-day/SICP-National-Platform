import pytest
from uuid import uuid4
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.academic import IntakeTeamAllocation
from app.models.challenge import Challenge
from app.models.team import Team
from tests.project.conftest import auth_headers_for


@pytest.mark.asyncio
async def test_valid_project_instantiation(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test valid creation of InnovationProject from active M4 allocation."""
    headers = auth_headers_for(student_leader)
    payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Low-Cost Graphene Water Filtration Device",
        "abstract": "Engineering a solar-powered capacitive deionization unit using graphene oxide membranes.",
        "repository_url": "https://github.com/aquaclean/graphene-water-filter",
        "demo_url": "https://demo.aquaclean.org",
        "tech_stack": ["Embedded C", "Raspberry Pi", "IoT", "React"],
        "target_completion_date": "2026-12-31",
    }
    response = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    project = data["data"]
    assert project["title"] == payload["title"]
    assert project["status"] == "PROPOSAL"
    assert project["current_stage"] == "CONCEPT_RESEARCH"
    assert project["progress_percentage"] == 0
    assert project["intake_team_allocation_id"] == str(intake_team_allocation.id)
    assert project["primary_faculty_mentor_id"] == str(intake_team_allocation.faculty_mentor_id)


@pytest.mark.asyncio
async def test_prevent_duplicate_project_for_same_allocation(
    client: AsyncClient,
    student_leader: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test duplicate project creation on same allocation returns 409."""
    headers = auth_headers_for(student_leader)
    payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Project 1",
        "abstract": "Detailed project description exceeding minimum character requirements.",
    }
    res1 = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res1.status_code == 201

    # Second attempt
    res2 = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res2.status_code == 409
    data = res2.json()
    assert data["success"] is False
    assert data["error"]["code"] == "DUPLICATE_PROJECT_ALLOCATION"


@pytest.mark.asyncio
async def test_invalid_allocation_binding(
    client: AsyncClient,
    student_leader: User,
):
    """Test project creation with non-existent allocation returns 400."""
    headers = auth_headers_for(student_leader)
    payload = {
        "intake_team_allocation_id": str(uuid4()),
        "title": "Invalid Project",
        "abstract": "Detailed project description exceeding minimum character requirements.",
    }
    res = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_ALLOCATION_BINDING"


@pytest.mark.asyncio
async def test_non_team_leader_cannot_create_project(
    client: AsyncClient,
    student_member: User,
    intake_team_allocation: IntakeTeamAllocation,
):
    """Test standard member cannot create project (only leader/co-leader)."""
    headers = auth_headers_for(student_member)
    payload = {
        "intake_team_allocation_id": str(intake_team_allocation.id),
        "title": "Unauthorized Project",
        "abstract": "Detailed project description exceeding minimum character requirements.",
    }
    res = await client.post("/api/v1/projects", json=payload, headers=headers)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"
