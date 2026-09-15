# Test-Driven Development (TDD) Specification — Module 4: Academic Collaboration Hub

**Document Version:** 1.1 (Hardened Test Specification)  
**Module ID:** M4  
**Module Name:** Academic Collaboration Hub  
**Status:** 📋 **PROPOSED & HARDENED (PENDING FINAL APPROVAL)**  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Target Delivery:** Milestone 4  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒]
- M2: Citizen Challenge Management [LOCKED 🔒]
- M3: Team Formation & Collaboration [LOCKED 🔒]

---

## 1. TDD Strategy & Quality Goals

Module 4 executes in strict accordance with the **TDD Red-Green-Refactor Lifecycle**:
1. **Red Phase**: Write failing unit, schema, repository, service, and API integration test suites first.
2. **Green Phase**: Implement minimal models, migrations, repositories, services, and API endpoints to satisfy all assertions.
3. **Refactor Phase**: Optimize database queries, eliminate N+1 queries with eager loading, and enforce clean domain encapsulation.

### Quality Benchmarks:
* **Test Pass Rate**: 100% (Zero failures, Zero errors).
* **Code Coverage**: $\ge 90\%$ line and branch coverage across all Module 4 files (`app/api/v1/endpoints/academic.py`, `app/models/academic.py`, `app/repositories/academic_repository.py`, `app/services/academic_service.py`, `app/services/matching_service.py`).
* **Platform Regression**: Zero regressions across M1 (IAM), M2 (Challenges), and M3 (Teams).

---

## 2. Test Suite Architecture (`backend/tests/academic/`)

```
backend/tests/academic/
├── conftest.py                       # Shared M4 fixtures (institutions, depts, faculty, challenges, teams)
├── test_academic_schemas.py          # Pydantic validation: accreditation formatting, domain tag bounds
├── test_university_lifecycle.py      # Registration, Platform Admin verification, suspension, updates
├── test_department_management.py     # Department CRUD, unique code/name per university, HOD validation
├── test_faculty_affiliation.py       # Affiliation requests, admin approval/rejection, single active uniqueness
├── test_matching_engine.py           # 5-factor formula tests, explainability payload validation
├── test_academic_intake_workflow.py  # Multi-university challenge claiming, routing, and 1:N team allocations
├── test_academic_auth_matrix.py      # Tenant-scoped RBAC validation (require_university_admin, HOD guards)
├── test_academic_concurrency.py      # Optimistic locking on university updates and claim race conditions
├── test_academic_audit.py            # Verification of all 20 audit events in persistent audit logs
└── test_academic_e2e.py              # End-to-end multi-stakeholder academic collaboration flow
```

---

## 3. Detailed Test Scenarios

### 3.1 Schema Validation Tests (`test_academic_schemas.py`)
- `test_valid_university_create_schema()`: Valid name, code, state, district, contact email.
- `test_invalid_university_code_format()`: Fails on spaces or lowercase in university code.
- `test_domain_expertise_bounds()`: Enforces maximum 15 domain expertise tags.
- `test_department_unique_code_schema()`: Validates department code formatting (uppercase alphanumeric).

### 3.2 Tenant-Scoped Authorization Tests (`test_academic_auth_matrix.py`)
- `test_platform_admin_can_verify_university()`: Platform Admin verifies university (`status -> VERIFIED`).
- `test_non_admin_cannot_verify_university()`: Regular faculty or student attempting verification receives HTTP 403 `FORBIDDEN`.
- `test_university_admin_scoped_access()`: University Admin can only create departments in their own institution.
- `test_unauthorized_department_creation_rejected()`: Faculty from University A attempting to create department in University B receives HTTP 403 `FORBIDDEN`.

### 3.3 HOD Integrity & Department Tests (`test_department_management.py`)
- `test_assign_valid_affiliated_faculty_as_hod()`: Successfully assigns an active affiliated faculty member as HOD.
- `test_reject_non_affiliated_faculty_as_hod()`: Attempting to assign faculty not affiliated with that department/university receives HTTP 400 `INVALID_HOD_AFFILIATION`.
- `test_prevent_duplicate_department_code_in_same_university()`: Adding duplicate department code in same university raises HTTP 409 `DUPLICATE_DEPARTMENT_CODE`.

### 3.4 Faculty Affiliation Lifecycle Tests (`test_faculty_affiliation.py`)
- `test_faculty_request_affiliation()`: Faculty user submits affiliation; status defaults to `PENDING`.
- `test_university_admin_approve_affiliation()`: Affiliated university admin approves; status transitions to `ACTIVE`.
- `test_prevent_duplicate_active_affiliation()`: Attempting to activate a second affiliation while one is `ACTIVE` raises HTTP 409 `DUPLICATE_ACTIVE_AFFILIATION`.
- `test_non_faculty_affiliation_rejected()`: Student or Citizen role attempting affiliation raises HTTP 403 `ROLE_RESTRICTION_ERROR`.

### 3.5 5-Factor Matching Engine Tests (`test_matching_engine.py`)
- `test_matching_score_calculation_weights()`: Validates exact 5-factor weighting ($40\%$ domain $+ 25\%$ faculty $+ 15\%$ proximity $+ 10\%$ track record $+ 10\%$ student cohort).
- `test_matching_explainability_payload()`: Asserts output contains detailed sub-scores and human-readable explanation strings per `AGENTS.md` Rule 6.
- `test_zero_division_guard()`: Graceful handling when historical track record or faculty count is zero.

### 3.6 Multi-University Claiming & Team Allocation Tests (`test_academic_intake_workflow.py`)
- `test_multiple_universities_can_claim_same_challenge()`: University A and University B both successfully claim Challenge C (`status -> ACCEPTED`).
- `test_prevent_duplicate_claim_by_same_university()`: University A claiming Challenge C a second time returns HTTP 409 `DUPLICATE_CHALLENGE_CLAIM`.
- `test_allocate_multiple_teams_to_intake()`: Intake record allocates 2 separate M3 student teams via `intake_team_allocations`.
- `test_enforce_platform_mentor_capacity_limit()`: Assigning a faculty member with 3 active platform mentorships raises HTTP 409 `FACULTY_MENTOR_CAPACITY_EXCEEDED`.
- `test_enforce_single_mentor_per_challenge_rule()`: Assigning the same faculty member to 2 teams on the same challenge raises HTTP 409 `DUPLICATE_CHALLENGE_MENTORSHIP`.

### 3.7 Institutional Safeguard & Deletion Tests (`test_university_lifecycle.py`)
- `test_suspend_university_blocks_new_claims()`: Suspended university cannot claim new challenges or add departments.
- `test_delete_university_blocked_when_active_intakes_exist()`: Soft-deleting university with in-progress intakes raises HTTP 409 `ACTIVE_ACADEMIC_BINDINGS_EXIST`.

### 3.8 Concurrency & Audit Tests (`test_academic_concurrency.py`, `test_academic_audit.py`)
- `test_university_optimistic_locking_conflict()`: Concurrent updates with mismatched version raise HTTP 409 `CONCURRENCY_CONFLICT`.
- `test_verify_all_20_audit_actions()`: Exercises full lifecycle and asserts presence of all 20 `AuditAction` enum types in persistent logs.

---

## 4. Measurable Performance & Scalability Targets
- **Catalog Query Latency**: `GET /api/v1/academic/universities` p95 response time $< 150\text{ms}$ for paginated 50 items.
- **Matching Engine Latency**: `GET /api/v1/academic/matching/universities/{challenge_id}` p95 response time $< 250\text{ms}$ when evaluating and ranking 100 candidate institutions.
- **Indexed Lookups**: 100% of queries on university codes, state/district, and department foreign keys must utilize B-Tree partial indexes.
- **Zero N+1 Queries**: Relational fetching of university departments, administrators, and faculty affiliations must utilize `selectinload` or `joinedload`.
