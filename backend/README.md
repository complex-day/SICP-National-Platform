# SICP Backend Service

## Purpose
The SICP (Societal Innovation Collaboration Platform) Backend is an asynchronous, high-performance API service built with FastAPI and SQLAlchemy. It coordinates stakeholder interactions (Citizens, Students, Faculty, Industry, Government, Super Admins), executes RBAC access control, manages persistent state, and handles asynchronous events.

## Dependencies
- Python 3.12+
- FastAPI & Uvicorn
- SQLAlchemy 2.0+ (AsyncIO)
- PostgreSQL / PostGIS (or SQLite aiosqlite for tests)
- PyJWT & Passlib (Argon2 / bcrypt)
- Pydantic v2 & Pydantic Settings

## Module 1 (Identity & Access Management) APIs
Base URL: `/api/v1`

| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user (all roles) | Public |
| `POST` | `/auth/login` | Authenticate and obtain JWT access & refresh tokens | Public |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile & permissions | Authenticated |
| `POST` | `/auth/logout` | Revoke session tokens & log audit event | Authenticated |
| `POST` | `/auth/change-password` | Update user password with current password verification | Authenticated |
| `POST` | `/auth/forgot-password` | Request password reset token (stub) | Public |
| `POST` | `/auth/reset-password` | Reset password using token (stub) | Public |
| `GET` | `/health` | Health check probe | Public |

## Standard Response Format
Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Running the Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests
```bash
pytest tests/auth -v
```
