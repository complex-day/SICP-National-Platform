# SICP Agent Rules

# Purpose

These rules are mandatory for all AI agents contributing to the project.

Violation of these rules requires code rejection.

---

# 1. Architecture Rules

Agents MUST follow:

* prd.md
* design.md
* database.md
* api-spec.md
* ai-design.md
* backend-architecture.md
* frontend-architecture.md
* security.md

Agents must never invent architecture outside these documents.

---

# 2. Source of Truth Priority

When conflicts occur:

1. api-spec.md
2. database.md
3. backend-architecture.md
4. frontend-architecture.md
5. prd.md

Higher priority documents always win.

---

# 3. Backend Rules

Framework: FastAPI  
Language: Python 3.12+

Rules:
* Use async endpoints.
* Use dependency injection.
* No business logic inside routes.
* No direct database access from API routes.
* Service layer required.
* Repository layer required.
* Distributed Caching: In-memory for single-instance development; Redis is the required dependency for multi-pod token revocation, session caching, and rate limiting.

Forbidden:
* Raw SQL in routes
* Global mutable state
* Circular imports

---

# 4. Frozen Architectural Contracts (DO NOT MODIFY IN M2-M7)

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

# 5. Frontend Rules

Framework: Next.js App Router  
Language: TypeScript Strict Mode

Rules:
* Use feature-based architecture (`features/auth`, `features/problem`, etc.).
* Use React Query for server state.
* Use Zustand for global state.
* Use Zod validation.
* Components must be reusable.

Forbidden:
* Any usage of "any"
* API calls inside UI components
* Business logic inside pages

---

# 6. Database Rules

Database: PostgreSQL

Rules:
* UUID primary keys only.
* Foreign keys mandatory.
* Soft delete for critical records.
* Migration required for schema changes.

Forbidden:
* Cascade deletes on critical entities.
* Business logic in database triggers.

---

# 7. API Rules

Rules:
* Follow api-spec.md exactly.
* No undocumented endpoints.
* No undocumented fields.
* REST naming conventions required.

Response Format:
```json
{
  "success": true,
  "data": {}
}
```

Error Format:
```json
{
  "success": false,
  "error": {}
}
```

---

# 8. AI Rules

Classification:
* Must follow ai-design.md

Duplicate Detection:
* Must use embeddings.

Recommendation:
* Must be explainable.

Forbidden:
* Hardcoded recommendations
* Random ranking

Every recommendation must return reasoning.

---

# 9. Security Rules

Authentication: JWT  
Authorization: RBAC

Rules:
* Every endpoint protected unless public.
* Validate all inputs.
* Sanitize all outputs.
* Encrypt sensitive data.

Forbidden:
* Plain text passwords
* Exposed secrets
* Hardcoded tokens

---

# 10. Event Rules

Communication Between Services:
* Use events whenever possible.

Required Events:
* ProblemCreated
* ProblemAnalyzed
* RecommendationGenerated
* ProjectCreated

Forbidden:
* Tight coupling between services
* Cross-service database access

---

# 11. Testing Rules

All code must include:
* Unit Tests
* Integration Tests

Minimum Coverage: 80%  
Critical Services: 90%  
No feature is complete without tests.

---

# 12. Documentation Rules

Every module must contain:
* README.md

Must include:
* Purpose
* Dependencies
* API Contracts
* Usage

---

# 13. Code Quality Rules

Required:
* Type hints
* Docstrings
* Structured logging

Forbidden:
* Dead code
* Commented code blocks
* Console debugging

---

# 14. Performance Rules

* API Response: < 500 ms
* AI Response: < 2 sec
* Dashboard Load: < 2 sec
* Queries must be indexed.
* N+1 queries prohibited.

---

# 15. Agent Behavior Rules

Before generating code:
1. Read relevant architecture documents.
2. Check existing implementation.
3. Reuse existing modules.
4. Avoid duplicate code.

Agents must modify existing systems before creating new ones.

---

# 16. Completion Criteria

A task is complete only when:
✔ Builds successfully
✔ Tests pass
✔ Lint passes
✔ Architecture compliance passes
✔ Security compliance passes
✔ Documentation updated

Otherwise task remains incomplete.
