import pytest
import time
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.asyncio
async def test_bm_001_create_challenge_benchmark(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """BM-001: Benchmark latency for challenge creation."""
    start = time.perf_counter()
    res = await client.post(
        "/api/v1/challenges",
        headers=citizen_auth["headers"],
        json={
            "title": "Benchmark Latency Test Challenge",
            "description": "Valid benchmark challenge description satisfying all required constraints.",
            "category": "Water",
            "affected_population": 300,
            "location": {"lat": 23.50, "lng": 85.46}
        }
    )
    duration = time.perf_counter() - start
    assert res.status_code == 201
    # Verify execution is fast
    assert duration < 5.0  # Generous upper bound for test runtime


@pytest.mark.asyncio
async def test_bm_002_list_challenges_benchmark(client: AsyncClient, citizen_auth: Dict[str, Any]):
    """BM-002: Benchmark latency for challenge catalog listing."""
    start = time.perf_counter()
    res = await client.get("/api/v1/challenges?page=1&limit=20", headers=citizen_auth["headers"])
    duration = time.perf_counter() - start
    assert res.status_code == 200
    assert duration < 5.0
