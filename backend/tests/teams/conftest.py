import pytest_asyncio
from httpx import AsyncClient
from typing import Dict, Any


@pytest_asyncio.fixture(scope="function")
async def leader_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login a student team creator (leader)."""
    reg_payload = {
        "full_name": "Aarav Sharma",
        "email": "aarav.leader@university.ac.in",
        "phone": "9876543101",
        "password": "LeaderPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "aarav.leader@university.ac.in",
        "password": "LeaderPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "aarav.leader@university.ac.in",
        "name": "Aarav Sharma"
    }


@pytest_asyncio.fixture(scope="function")
async def collaborator1_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for student collaborator 1."""
    reg_payload = {
        "full_name": "Priya Verma",
        "email": "priya.verma@university.ac.in",
        "phone": "9876543102",
        "password": "StudentPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "priya.verma@university.ac.in",
        "password": "StudentPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "priya.verma@university.ac.in",
        "name": "Priya Verma"
    }


@pytest_asyncio.fixture(scope="function")
async def collaborator2_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for student collaborator 2."""
    reg_payload = {
        "full_name": "Rohan Das",
        "email": "rohan.das@university.ac.in",
        "phone": "9876543103",
        "password": "StudentPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "rohan.das@university.ac.in",
        "password": "StudentPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "rohan.das@university.ac.in",
        "name": "Rohan Das"
    }


@pytest_asyncio.fixture(scope="function")
async def collaborator3_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for student collaborator 3."""
    reg_payload = {
        "full_name": "Kavita Rao",
        "email": "kavita.rao@university.ac.in",
        "phone": "9876543104",
        "password": "StudentPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "kavita.rao@university.ac.in",
        "password": "StudentPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "kavita.rao@university.ac.in",
        "name": "Kavita Rao"
    }


@pytest_asyncio.fixture(scope="function")
async def collaborator4_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for student collaborator 4."""
    reg_payload = {
        "full_name": "Deepak Joshi",
        "email": "deepak.joshi@university.ac.in",
        "phone": "9876543105",
        "password": "StudentPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "deepak.joshi@university.ac.in",
        "password": "StudentPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "deepak.joshi@university.ac.in",
        "name": "Deepak Joshi"
    }


@pytest_asyncio.fixture(scope="function")
async def mentor1_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for faculty mentor 1."""
    reg_payload = {
        "full_name": "Prof. S. N. Mukherjee",
        "email": "sn.mukherjee@university.ac.in",
        "phone": "9876543106",
        "password": "MentorPassword#2026",
        "role": "faculty",
        "department": "Civil & Environmental Engineering"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "sn.mukherjee@university.ac.in",
        "password": "MentorPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "sn.mukherjee@university.ac.in",
        "name": "Prof. S. N. Mukherjee"
    }


@pytest_asyncio.fixture(scope="function")
async def mentor2_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for faculty mentor 2."""
    reg_payload = {
        "full_name": "Dr. Meera Iyer",
        "email": "meera.iyer@university.ac.in",
        "phone": "9876543107",
        "password": "MentorPassword#2026",
        "role": "faculty",
        "department": "Computer Science & IoT"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "meera.iyer@university.ac.in",
        "password": "MentorPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "meera.iyer@university.ac.in",
        "name": "Dr. Meera Iyer"
    }


@pytest_asyncio.fixture(scope="function")
async def mentor3_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for industry advisor 3."""
    reg_payload = {
        "full_name": "Vikram Sethi",
        "email": "vikram.sethi@cleantech.com",
        "phone": "9876543108",
        "password": "IndustryPassword#2026",
        "role": "industry",
        "company_name": "CleanTech Innovations Pvt Ltd"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "vikram.sethi@cleantech.com",
        "password": "IndustryPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "vikram.sethi@cleantech.com",
        "name": "Vikram Sethi"
    }


@pytest_asyncio.fixture(scope="function")
async def citizen_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for citizen (non-student/faculty)."""
    reg_payload = {
        "full_name": "Rajesh Gupta",
        "email": "rajesh.gupta@citizen.org",
        "phone": "9876543109",
        "password": "CitizenPassword#2026",
        "role": "citizen",
        "district": "Ranchi",
        "state": "Jharkhand"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "rajesh.gupta@citizen.org",
        "password": "CitizenPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "rajesh.gupta@citizen.org",
        "name": "Rajesh Gupta"
    }


@pytest_asyncio.fixture(scope="function")
async def admin_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture for platform administrator."""
    reg_payload = {
        "full_name": "System Administrator",
        "email": "admin.m3@sicp.gov.in",
        "phone": "9876543110",
        "password": "AdminPassword#2026",
        "role": "admin"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "admin.m3@sicp.gov.in",
        "password": "AdminPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "admin.m3@sicp.gov.in",
        "name": "System Administrator"
    }


@pytest_asyncio.fixture(scope="function")
async def sample_challenge(client: AsyncClient, citizen_auth: Dict[str, Any], admin_auth: Dict[str, Any]) -> Dict[str, Any]:
    """Fixture that creates and publishes a verified challenge for teams to anchor to."""
    create_payload = {
        "title": "Arsenic Contamination in Community Groundwater Reservoirs",
        "description": "High arsenic levels detected across 12 village borewells requiring low-cost filtration solutions.",
        "category": "Water",
        "subcategory": "Groundwater Quality",
        "affected_population": 8500,
        "location": {
            "lat": 23.3441,
            "lng": 85.3096,
            "address_text": "Borewell Cluster 4, Ormanjhi Block",
            "district": "Ranchi",
            "state": "Jharkhand"
        }
    }
    res = await client.post("/api/v1/challenges", json=create_payload, headers=citizen_auth["headers"])
    assert res.status_code == 201, f"Failed to create sample challenge: {res.text}"
    challenge_data = res.json()["data"]
    challenge_id = challenge_data["id"]

    # Submit for review
    await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "submitted", "version": 1}, headers=citizen_auth["headers"])

    # Admin approves and publishes challenge
    await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "under_review", "version": 2}, headers=admin_auth["headers"])
    await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "approved", "version": 3}, headers=admin_auth["headers"])
    pub_res = await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "published", "version": 4}, headers=admin_auth["headers"])
    assert pub_res.status_code == 200

    return {
        "id": challenge_id,
        "title": create_payload["title"],
        "category": create_payload["category"]
    }
