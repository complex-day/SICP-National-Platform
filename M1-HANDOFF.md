# Module: M1 Identity & Access Management (IAM) — [STATUS: LOCKED]

## Status
🔒 **LOCKED & VERIFIED** (Completed: Day 1)  
Readiness Score: **100 / 100**

---

## 1. Completed Deliverables

### 1.1 Backend Authentication System (FastAPI / Python 3.12+)
- User registration supporting all 6 roles (`citizen`, `student`, `faculty`, `industry`, `government`, `admin`).
- Secure credential authentication with Argon2id password hashing.
- JWT token issuance with 15-minute access tokens and 7-day refresh tokens.
- Refresh token exchange and session rotation.
- Token revocation and logout with audit trail tracking.
- RBAC dependency injection middleware (`require_roles`).
- Standardized JSON response envelopes (`success: true/false`, `data`, `error`).
- Password change endpoint with current password verification.
- Forgot password & reset password endpoint stubs.
- Shared constants module (`app.core.constants`) for Roles, User Status, Audit Actions, and Notification Types.
- OpenAPI schema export script (`backend/scripts/export_openapi.py`).

### 1.2 Database Architecture (PostgreSQL 16 + PostGIS Ready / SQLite Async)
- `users` table with UUID primary keys, role enums, account statuses (`ACTIVE`, `PENDING`, `SUSPENDED`, `BANNED`), verification fields, and trust score.
- `audit_logs` table for tracking all authentication, registration, and administrative actions.
- `notifications` table for system notifications.
- Role-specific profile tables: `citizens`, `faculty`, `students`, `industries`.
- Alembic migration scripts (`001_initial_iam_schema.py`) and schema configuration.

### 1.3 Frontend Application (Next.js 15 App Router / TypeScript Strict / Tailwind CSS)
- Feature-based structure (`src/features/auth`).
- Type-safe forms with React Hook Form & Zod (`loginSchema`, `registerSchema`, `changePasswordSchema`).
- Persistent authentication state managed with Zustand (`authStore.ts`).
- Centralized API layer (`api.ts` & `auth.service.ts`).
- Shared constants module (`src/constants/auth.constants.ts`).
- Modern responsive UI: Landing Page, Login, Multi-Role Registration, Profile Card, Role-Specific Dashboard Landing, Forgot Password, and Settings.

---

## 2. Frozen Architectural Contracts (DO NOT MODIFY IN M2-M7)

The following contracts are permanently locked from M1 onwards:
1. **User Schema & Profile Models:** `User`, `CitizenProfile`, `FacultyProfile`, `StudentProfile`, `IndustryProfile`, `AuditLog`, `Notification`.
2. **Role Enum:** `citizen`, `student`, `faculty`, `industry`, `government`, `admin` (`app.core.constants.UserRole`).
3. **Status Enum:** `ACTIVE`, `PENDING`, `SUSPENDED`, `BANNED` (`app.core.constants.UserStatus`).
4. **Standard API Response Envelopes:**
   - Success: `{"success": true, "data": {}}`
   - Error: `{"success": false, "error": {"code": "...", "message": "...", "details": {}}}`
5. **JWT Payload Structure:**
   - Access Token: `sub` (UUID), `role`, `type: "access"`, `email`, `name`, `exp` (15 mins).
   - Refresh Token: `sub` (UUID), `type: "refresh"`, `exp` (7 days).
6. **RBAC Middleware Contract:** `require_roles(["role1", "role2"])` with `admin` bypass.

---

## 3. Database Schema

- `users`: `id` (UUID PK), `full_name`, `email` (UNIQUE), `phone` (UNIQUE), `password_hash`, `role`, `status`, `is_verified`, `verification_token`, `verification_expires`, `trust_score`, `created_at`, `updated_at`, `is_deleted`.
- `audit_logs`: `id` (UUID PK), `user_id` (UUID FK nullable), `action`, `entity_type`, `entity_id` (UUID nullable), `metadata_json` (JSON nullable), `created_at`.
- `notifications`: `id` (UUID PK), `user_id` (UUID FK), `title`, `message`, `is_read`, `created_at`.
- `citizens`: `user_id` (UUID PK FK), `district`, `state`, `total_reports`.
- `faculty`: `user_id` (UUID PK FK), `university_id`, `department_id`, `specialization`, `experience_years`.
- `students`: `user_id` (UUID PK FK), `university_id`, `department_id`, `skills` (JSON), `graduation_year`.
- `industries`: `id` (UUID PK), `user_id` (UUID FK nullable), `company_name`, `domain`, `csr_budget`, `website`.

---

## 4. Implemented API Routes

- `POST /api/v1/auth/register` — Register a new user account across all 6 roles.
- `POST /api/v1/auth/login` — Authenticate and issue JWT access & refresh tokens.
- `POST /api/v1/auth/refresh` — Exchange refresh token for new access token.
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile & permissions.
- `POST /api/v1/auth/logout` — Revoke access & refresh tokens.
- `POST /api/v1/auth/change-password` — Change password with current password verification.
- `POST /api/v1/auth/forgot-password` — Request password reset token (stub).
- `POST /api/v1/auth/reset-password` — Reset password using token (stub).
- `GET /health` — Service health probe.

---

## 5. Frontend Pages

- `/` — Platform Landing Page with stakeholder role overviews.
- `/login` — User Sign-In with client & server validation.
- `/register` — Multi-Role Registration (Citizen, Student, Faculty, Industry, Government, Admin).
- `/profile` — Identity & Access Profile view with trust score meter and role badge.
- `/dashboard` — Authenticated dashboard landing customized by stakeholder role.
- `/forgot-password` — Password recovery initiation placeholder.
- `/settings` — Account security settings & password update interface.

---

## 6. Automated Test Suite (100% Pass)

- `test_auth_001_user_registration` — Registration verification & audit record validation.
- `test_auth_002_duplicate_email` — Rejection of duplicate email with 409 Conflict.
- `test_auth_003_invalid_password` — Rejection of weak passwords with 400 Bad Request.
- `test_auth_004_jwt_validation` — Protected endpoint blocking unauthorized requests.
- `test_login_success_and_profile_retrieval` — Login and access token validation.
- `test_logout_revokes_token` — Token revocation and 401 on reuse.
- `test_admin_role_registration` — Super admin role assignment & login.
- `test_change_password` — Password update with current hash validation.
- `test_complete_authentication_journey` (E2E Integration) — Complete multi-step journey (`Register -> Login -> Refresh -> Me -> Logout`).

---

## 7. Production Hardening Checklist (Pre-Production Deployment)

Prior to production release, the following hardening steps must be executed:
- [ ] **Redis Token Blacklist:** Connect distributed Redis cluster for horizontal token revocation and session blacklisting.
- [ ] **Rate Limiting:** Enable Redis-backed rate limiting (100 req/min for citizens, 300 req/min for authenticated, 50 req/min for admin).
- [ ] **Email Service Provider:** Wire SendGrid/AWS SES provider to the asynchronous email queue for actual transactional email dispatch.
- [ ] **Secrets Management:** Vault/AWS Secrets Manager integration for `SECRET_KEY`, database credentials, and external API keys.
- [ ] **Database Backups:** Automated daily incremental backups, weekly full backups with 90-day retention.
- [ ] **Monitoring and Alerting:** Configure Prometheus metrics (`/metrics`), Grafana dashboard, and Loki log aggregation.

---

## 8. Next Module Scope & Boundaries (Day 2 — M2: Citizen Challenge Management)

### Required Inputs from M1:
- `users` and `citizens` tables.
- Authenticated JWT Bearer token (`Authorization: Bearer <token>`).
- `require_roles(["citizen"])` for challenge creation.
- `AuditRepository.log` for audit event generation.

### Strict Scope for M2:
- **Challenge Entity (`problems` table)**: Title, description, category, affected population, location coordinates (`lat`, `lng`, PostGIS geometry), priority score placeholder, initial workflow status (`submitted`, `verified`, `assigned`, etc.).
- **Challenge CRUD APIs & Repository**: `POST /problems`, `GET /problems/{id}`, `GET /problems` (with pagination, category, status filters).
- **Multipart Media Upload**: `POST /problems/{id}/media` (storing metadata in `problem_media`).
- **Challenge UI**: Citizen Problem Submission Form, Problem Details View, My Reports Dashboard with status badges.
- **Automated Tests**: Problem submission, validation errors, location bounds, and listing filters.

### Prohibited in M2 (Belong to M3–M7):
- ❌ Rewards / Incentives
- ❌ Verification approval workflows (M2 creates initial submission state only)
- ❌ Leaderboards & Gamification
- ❌ Notification business logic
- ❌ AI classification, priority scoring, duplicate embeddings (M3)
- ❌ University / Faculty matching engines (M4)
