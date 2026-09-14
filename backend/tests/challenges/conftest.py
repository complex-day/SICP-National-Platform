import pytest_asyncio
from httpx import AsyncClient
from typing import Dict, Any


@pytest_asyncio.fixture(scope="function")
async def citizen_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login a citizen, returning headers & user data."""
    reg_payload = {
        "full_name": "Ramesh Patel",
        "email": "ramesh.citizen@example.com",
        "phone": "9876543201",
        "password": "CitizenPassword#2026",
        "role": "citizen",
        "district": "Ranchi",
        "state": "Jharkhand"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "ramesh.citizen@example.com",
        "password": "CitizenPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "ramesh.citizen@example.com",
        "name": "Ramesh Patel"
    }


@pytest_asyncio.fixture(scope="function")
async def citizen2_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login a second citizen."""
    reg_payload = {
        "full_name": "Suresh Kumar",
        "email": "suresh.citizen@example.com",
        "phone": "9876543202",
        "password": "CitizenPassword#2026",
        "role": "citizen",
        "district": "Dhanbad",
        "state": "Jharkhand"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "suresh.citizen@example.com",
        "password": "CitizenPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "suresh.citizen@example.com",
        "name": "Suresh Kumar"
    }


@pytest_asyncio.fixture(scope="function")
async def evaluator_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login an evaluator (faculty)."""
    reg_payload = {
        "full_name": "Dr. Anita Roy",
        "email": "anita.evaluator@university.ac.in",
        "phone": "9876543203",
        "password": "FacultyPassword#2026",
        "role": "faculty",
        "specialization": "Water Resource Management"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "anita.evaluator@university.ac.in",
        "password": "FacultyPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "anita.evaluator@university.ac.in",
        "name": "Dr. Anita Roy"
    }


@pytest_asyncio.fixture(scope="function")
async def student_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login a student."""
    reg_payload = {
        "full_name": "Vikas Singh",
        "email": "vikas.student@university.ac.in",
        "phone": "9876543204",
        "password": "StudentPassword#2026",
        "role": "student"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "vikas.student@university.ac.in",
        "password": "StudentPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "vikas.student@university.ac.in",
        "name": "Vikas Singh"
    }


@pytest_asyncio.fixture(scope="function")
async def admin_auth(client: AsyncClient) -> Dict[str, Any]:
    """Helper fixture to register and login an administrator."""
    reg_payload = {
        "full_name": "Super Administrator",
        "email": "admin.m2@sicp.gov.in",
        "phone": "9876543205",
        "password": "AdminPassword#2026",
        "role": "admin"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    user_id = reg_res.json()["data"]["user_id"]

    login_res = await client.post("/api/v1/auth/login", json={
        "email": "admin.m2@sicp.gov.in",
        "password": "AdminPassword#2026"
    })
    token = login_res.json()["data"]["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "email": "admin.m2@sicp.gov.in",
        "name": "Super Administrator"
    }
