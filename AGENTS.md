# SICP Agent Rules & Guidelines

These rules are mandatory for all AI agents contributing to the SICP codebase.

## 1. Architecture Rules & Source of Truth Priority
Agents MUST strictly follow:
1. `api-spec.md` (Highest Priority)
2. `database.md`
3. `backend-architecture.md`
4. `frontend-architecture.md`
5. `prd.md`
6. `ai-design.md`, `security.md`, `TDD.md`, `design.md`

Agents must never invent architecture outside these documents.

---

## 2. Backend Rules (FastAPI / Python 3.12+)
- **Async Only:** All route handlers and I/O operations must be asynchronous.
- **Layered Architecture:** Routes -> Service Layer -> Repository Layer -> Database.
- **Dependency Injection:** Use FastAPI dependency injection for DB sessions, auth, services.
- **No Direct DB Access in Routes:** No business logic or database queries inside route definitions.
- **Distributed Caching & Revocation:** In-memory storage is used for single-instance dev; Redis is the required future dependency for horizontal token blacklist scaling, rate limiting, and session caching.
- **Forbidden:** Raw SQL in routes, global mutable state, circular imports.

---

## 3. Frontend Rules (Next.js App Router / TypeScript Strict)
- **Feature-based Architecture:** Organize code by features (`features/auth`, `features/problem`, `features/project`, etc.).
- **State Management:** React Query (TanStack Query) for server state; Zustand for global client state.
- **Validation:** Zod schemas for all forms and API response validations.
- **Components:** Reusable, clean, mobile-first design.
- **Forbidden:** Usage of `any`, calling APIs directly inside UI components, placing business logic in pages.

---

## 4. Database Rules (PostgreSQL 16 + PostGIS)
- **Primary Keys:** UUID primary keys only.
- **Integrity:** Foreign keys mandatory on all relations.
- **Deletions:** Soft deletes for critical entities (no direct cascade deletes on critical tables).
- **Migrations:** Alembic/SQL migrations required for all schema updates.
- **Forbidden:** Cascade deletes on critical entities, business logic in triggers.

---

## 5. Frozen Architectural Contracts (DO NOT MODIFY IN M2-M7)
The following contracts are finalized and locked in M1:
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

## 6. AI Rules
- Classification must follow `Docs/ai-design.md`.
- Duplicate detection must use semantic vector embeddings.
- Every recommendation (universities, faculty, industry) must return reasoning and be explainable.
- Forbidden: Hardcoded recommendations, random ranking.

---

## 7. Security Rules
- **Auth:** JWT with short-lived access tokens (15 min) and refresh tokens (7 days).
- **RBAC:** Strict role-based access control.
- **Protection:** Input validation (Zod/Pydantic), output sanitization, rate limiting, encryption at rest and in transit.
- **Forbidden:** Plain text passwords, hardcoded credentials/secrets.

---

## 8. Event-Driven Workflows
- Decouple services using asynchronous event communication (RabbitMQ / Redis / Celery).
- Primary Events: `ProblemCreated`, `ProblemAnalyzed`, `RecommendationGenerated`, `ProjectCreated`, `MilestoneCompleted`, `IndustryPartnershipCreated`.
- Forbidden: Cross-service direct database queries, tight service coupling.

---

## 9. Testing & Quality
- **Coverage:** Minimum 80% coverage across all services; 90% on critical authentication and problem services.
- **Tests Required:** Unit, Integration, and Security/E2E test suites per `Docs/TDD.md`.
- **Typing & Docs:** Full type hints (Pydantic / TS strict), structured logging, comprehensive docstrings, and `README.md` for every module.
