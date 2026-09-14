import pytest
from pydantic import ValidationError
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, LocationSchema
from app.core.constants import ChallengeCategory, ChallengeStatus, ChallengeVisibility


def test_chal_unit_001_valid_challenge_schema():
    """CHAL-UNIT-001: Instantiation of valid challenge schema."""
    data = {
        "title": "Severe Water Contamination in Rural Supply",
        "description": "The main municipal supply line has high iron content and sewage leakage across Ward 4.",
        "category": ChallengeCategory.WATER.value,
        "subcategory": "Pipeline Leakage",
        "affected_population": 450,
        "location": {
            "lat": 23.3441,
            "lng": 85.3096,
            "address_text": "Ward 4, Near Primary School",
            "district": "Ranchi",
            "state": "Jharkhand"
        },
        "status": ChallengeStatus.SUBMITTED.value,
        "visibility": ChallengeVisibility.PUBLIC.value
    }
    schema = ChallengeCreate(**data)
    assert schema.title == data["title"]
    assert schema.affected_population == 450
    assert schema.location.lat == 23.3441
    assert schema.visibility == ChallengeVisibility.PUBLIC.value


def test_chal_unit_002_title_too_short():
    """CHAL-UNIT-002: Title with less than 10 characters fails validation."""
    data = {
        "title": "Short",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "title" in str(exc.value)


def test_chal_unit_003_title_too_long():
    """CHAL-UNIT-003: Title with more than 500 characters fails validation."""
    data = {
        "title": "A" * 501,
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "title" in str(exc.value)


def test_chal_unit_004_description_too_short():
    """CHAL-UNIT-004: Description with less than 30 characters fails validation."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Too short desc",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "description" in str(exc.value)


def test_chal_unit_005_invalid_category():
    """CHAL-UNIT-005: Unapproved category fails validation."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "InvalidCategoryXYZ",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "category" in str(exc.value)


def test_chal_unit_006_negative_population():
    """CHAL-UNIT-006: Negative affected population fails validation."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": -10,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "affected_population" in str(exc.value)


def test_chal_unit_007_zero_population():
    """CHAL-UNIT-007: Zero affected population fails validation."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": 0,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    with pytest.raises(ValidationError) as exc:
        ChallengeCreate(**data)
    assert "affected_population" in str(exc.value)


def test_chal_unit_008_latitude_out_of_range():
    """CHAL-UNIT-008: Latitude outside [-90, 90] fails validation."""
    with pytest.raises(ValidationError):
        LocationSchema(lat=95.5, lng=85.0)
    with pytest.raises(ValidationError):
        LocationSchema(lat=-92.0, lng=85.0)


def test_chal_unit_009_longitude_out_of_range():
    """CHAL-UNIT-009: Longitude outside [-180, 180] fails validation."""
    with pytest.raises(ValidationError):
        LocationSchema(lat=23.0, lng=185.0)
    with pytest.raises(ValidationError):
        LocationSchema(lat=23.0, lng=-190.0)


def test_chal_unit_010_invalid_visibility():
    """CHAL-UNIT-010: Invalid visibility enum fails validation."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0},
        "visibility": "INVALID_VIS"
    }
    with pytest.raises(ValidationError):
        ChallengeCreate(**data)


def test_chal_unit_011_future_proofing_defaults():
    """CHAL-UNIT-011: Challenge schema defaults to draft and public visibility."""
    data = {
        "title": "Valid Challenge Title Here",
        "description": "Valid description with sufficient length to pass the 30 character minimum validation requirement.",
        "category": "Water",
        "affected_population": 100,
        "location": {"lat": 23.0, "lng": 85.0}
    }
    schema = ChallengeCreate(**data)
    assert schema.status == ChallengeStatus.DRAFT.value
    assert schema.visibility == ChallengeVisibility.PUBLIC.value
