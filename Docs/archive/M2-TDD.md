# Test-Driven Development Specification (TDD) — Module 2: Citizen Challenge Management [LOCKED 🔒]

**Document Version:** 2.1 (Final)  
**Module ID:** M2  
**Module Name:** Citizen Challenge Management  
**Status:** 🔒 **LOCKED & APPROVED**  
**Author:** SICP Architecture & Quality Assurance Core Team  
**Parent Architecture:** `Docs/TDD.md`, `Docs/agent-rules.md`, `Docs/security.md`  
**Dependencies:** M1: Identity & Access Management (IAM) [LOCKED 🔒]  

---

## 1. Testing Philosophy & Quality Gateways

### 1.1 Quality Standards
In accordance with `Docs/agent-rules.md` and `Docs/TDD.md`:
* **Zero M1 Regressions**: The complete M1 test suite ($9/9$ tests) must continue to pass at 100% without modification.
* **Code Coverage Threshold**: Minimum **90% coverage** on all new Module 2 services (`challenge_service.py`, `storage_service.py`), repositories (`challenge_repository.py`), state machine validators, and API endpoints.
* **TDD Sequencing**: All test suites specified in this document MUST be written as failing tests before implementation begins.

```
       ┌────────────────────────────────────────────────────────┐
       │                   Test Pyramid (M2)                    │
       ├────────────────────────────────────────────────────────┤
       │  [E2E Journey Tests]     - Full Challenge Lifecycle    │
       │  [Concurrency Tests]     - Optimistic Locks & Races    │
       │  [Auth Matrix Tests]     - RBAC & Ownership Perms      │
       │  [State Machine Tests]   - Valid & Invalid Transitions │
       │  [Audit Event Tests]     - Immutable Action Tracking   │
       │  [API Endpoint Tests]    - REST Contracts & Uploads    │
       │  [Repository Tests]      - Database Queries & Filters  │
       │  [Unit Tests]            - Schema & Bounds Validation  │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Test Suite Structure

```
backend/tests/challenges/
├── conftest.py                       # Shared test fixtures, mock storage, and authenticated tokens
├── test_challenge_schemas.py         # Unit tests for Pydantic input/output schemas
├── test_challenge_state_machine.py   # State machine valid, invalid, and role ownership transition tests
├── test_challenge_auth_matrix.py     # Role-action authorization matrix tests
├── test_challenge_audit.py           # Verification of all 6 required audit events
├── test_challenge_concurrency.py     # Simultaneous updates, double submission, race conditions
├── test_challenge_benchmarks.py      # Latency & query performance benchmark checks
├── test_challenge_repository.py      # Repository database integration tests
├── test_challenges_api.py            # REST API endpoints & query filter tests
├── test_challenge_assets_api.py      # File upload, MIME check & size limit tests
└── test_challenge_e2e.py             # Full Citizen Challenge Lifecycle Integration
```

---

## 3. Detailed Test Case Catalog

### 3.1 Unit Tests: Schema Validation & Domain Rules (`test_challenge_schemas.py`)

| Test ID | Test Name | Input Description | Expected Outcome | Pass Criteria |
|---|---|---|---|---|
| **CHAL-UNIT-001** | Valid Challenge Schema | Complete valid challenge payload with required fields | Successful validation & model instantiation | Valid `ChallengeCreate` instance |
| **CHAL-UNIT-002** | Title Too Short | Title with 5 characters ($<10$) | Pydantic `ValidationError` | Error on `title`: min_length |
| **CHAL-UNIT-003** | Title Too Long | Title with 501 characters ($>500$) | Pydantic `ValidationError` | Error on `title`: max_length |
| **CHAL-UNIT-004** | Description Too Short | Description with 15 characters ($<30$) | Pydantic `ValidationError` | Error on `description`: min_length |
| **CHAL-UNIT-005** | Invalid Category | Category = `InvalidCategoryXYZ` | Pydantic `ValidationError` | Value error on `category` |
| **CHAL-UNIT-006** | Negative Population | `affected_population: -10` | Pydantic `ValidationError` | Error on `affected_population`: gt 0 |
| **CHAL-UNIT-007** | Zero Population | `affected_population: 0` | Pydantic `ValidationError` | Error on `affected_population`: gt 0 |
| **CHAL-UNIT-008** | Latitude Out of Range | `lat: 95.5` ($>90$) or `-92.0` ($<-90$) | Pydantic `ValidationError` | Error on `location.lat` |
| **CHAL-UNIT-009** | Longitude Out of Range | `lng: 185.0` ($>180$) or `-190.0` ($<-180$) | Pydantic `ValidationError` | Error on `location.lng` |
| **CHAL-UNIT-010** | Visibility Enum Check | `visibility="INVALID_VISIBILITY"` | Pydantic `ValidationError` | Value error on `visibility` |
| **CHAL-UNIT-011** | Future-Proofing Defaults | New challenge initialized | `visibility="PUBLIC"`, `version=1` | Accurate schema defaults |

---

### 3.2 State Machine & Role Ownership Tests (`test_challenge_state_machine.py`)

| Test ID | Test Name | Initial State | Target State | Role & Ownership | Expected Result |
|---|---|---|---|---|---|
| **STATE-001** | Submit Draft (Author) | `draft` | `submitted` | Author (`citizen`) | Allowed (200 OK) |
| **STATE-002** | Submit Draft (Non-Author) | `draft` | `submitted` | Non-Author (`citizen`) | Forbidden (403) |
| **STATE-003** | Start Review (Evaluator) | `submitted` | `under_review` | `faculty` (evaluator) | Allowed (200 OK) |
| **STATE-004** | Start Review (Citizen) | `submitted` | `under_review` | `citizen` | Forbidden (403) |
| **STATE-005** | Approve (Evaluator) | `under_review` | `approved` | `faculty` (evaluator) | Allowed (200 OK) |
| **STATE-006** | Request Revision | `under_review` | `submitted` | `faculty` (evaluator) | Allowed (200 OK) |
| **STATE-007** | Publish (Admin) | `approved` | `published` | `admin` | Allowed (200 OK, `published_at` set) |
| **STATE-008** | Close (Admin) | `published` | `closed` | `admin` | Allowed (200 OK) |
| **STATE-009** | Archive Draft (Author) | `draft` | `archived` | Author (`citizen`) | Allowed (200 OK, `archived_at` set) |
| **STATE-010** | Invalid: Closed to Draft | `closed` | `draft` | `admin` | Rejected (400 `InvalidStateTransitionError`) |
| **STATE-011** | Invalid: Draft to Published | `draft` | `published` | `admin` | Rejected (400 `InvalidStateTransitionError`) |
| **STATE-012** | Invalid: Rejected to Approved | `rejected` | `approved` | `admin` | Rejected (400 `InvalidStateTransitionError` - Terminal) |
| **STATE-013** | Invalid: Archived to Under Review| `archived`| `under_review` | `admin` | Rejected (400 `InvalidStateTransitionError` - Terminal) |

---

### 3.3 Role-Action Authorization Matrix Tests (`test_challenge_auth_matrix.py`)

| Test ID | Role Under Test | Action Attempted | Expected Status | Security Verification |
|---|---|---|---|---|
| **AUTH-MAT-001** | Citizen (Author) | Create Challenge (`POST /challenges`) | `201 Created` | Author identity set to current user |
| **AUTH-MAT-002** | Student | Create Challenge (`POST /challenges`) | `403 Forbidden` | Only citizens/admins can submit |
| **AUTH-MAT-003** | Citizen (Non-Author) | Edit Challenge (`PATCH /challenges/{id}`) | `403 Forbidden` | Ownership guard denies modification |
| **AUTH-MAT-004** | Citizen (Author) | Edit Challenge in `draft` | `200 OK` | Author permitted to edit draft |
| **AUTH-MAT-005** | Citizen (Author) | Edit Challenge in `closed` | `400 Bad Request` | Cannot edit closed challenge |
| **AUTH-MAT-006** | Evaluator (Faculty) | Review Challenge (`PATCH /challenges/{id}/status -> under_review`) | `200 OK` | Evaluator permitted to review |
| **AUTH-MAT-007** | Evaluator (Faculty) | Approve Challenge (`PATCH /challenges/{id}/status -> approved`) | `200 OK` | Evaluator permitted to approve |
| **AUTH-MAT-008** | Citizen (Author) | Approve Challenge (`PATCH /challenges/{id}/status -> approved`) | `403 Forbidden` | Citizens cannot approve own challenge |
| **AUTH-MAT-009** | Admin | Full Status Override (Any valid transition) | `200 OK` | Admin bypass permitted |
| **AUTH-MAT-010** | Student | View Unpublished Draft | `404 / 403 Forbidden` | Draft hidden from non-author |
| **AUTH-MAT-011** | Student | View Published Challenge | `200 OK` | Open catalog access |
| **AUTH-MAT-012** | Citizen (Author) | Delete Challenge in `draft` | `200 OK` | Author can soft-delete draft |
| **AUTH-MAT-013** | Citizen (Author) | Delete Challenge in `published` | `403 / 400 Bad Request` | Published challenge cannot be deleted by author |

---

### 3.4 Audit Event Generation Tests (`test_challenge_audit.py`)

| Test ID | Action Triggered | Target Audit Action | Verified Fields in `audit_logs` Table |
|---|---|---|---|
| **AUDIT-001** | Challenge Creation | `CHALLENGE_CREATED` | `user_id == author_id`, `action == "CHALLENGE_CREATED"`, `entity_type == "challenge"` |
| **AUDIT-002** | Challenge Update | `CHALLENGE_UPDATED` | `user_id == editor_id`, `action == "CHALLENGE_UPDATED"`, `new_value.version == 2` |
| **AUDIT-003** | Status Transition | `STATUS_CHANGED` | `old_value.status == "submitted"`, `new_value.status == "under_review"` |
| **AUDIT-004** | Asset Uploaded | `ASSET_UPLOADED` | `entity_id == asset_id`, `metadata.media_type == "image"` |
| **AUDIT-005** | Challenge Archived | `CHALLENGE_ARCHIVED`| `action == "CHALLENGE_ARCHIVED"`, `entity_id == challenge_id` |
| **AUDIT-006** | Visibility Changed | `VISIBILITY_CHANGED`| `old_value.visibility == "PUBLIC"`, `new_value.visibility == "PRIVATE"` |

---

### 3.5 Concurrency & Race Condition Tests (`test_challenge_concurrency.py`)

| Test ID | Test Scenario | Execution Details | Expected Concurrency Behavior |
|---|---|---|---|
| **CONC-001** | Simultaneous Updates (Optimistic Lock) | Two concurrent requests send `PATCH /challenges/{id}` with `expected_version=1` | One succeeds (version becomes 2); second fails with `409 Conflict` (`CONCURRENCY_CONFLICT`) |
| **CONC-002** | Double Submission Prevention | Two identical `POST /challenges` sent concurrently with identical `Idempotency-Key` | Single challenge created in database; second request returns identical `200/201` without duplicate row |
| **CONC-003** | Concurrent Asset Ingestion (Max 5) | 10 concurrent requests attempt to upload images to a challenge with 0 assets | Exactly 5 assets are saved; 5 requests are rejected with `400 Bad Request` (`MAX_ASSETS_EXCEEDED`) |
| **CONC-004** | Archive During Active Update | Thread A archives challenge while Thread B attempts to update description | Either archive completes first (causing update to fail with 409/400) or update completes first then archive completes cleanly |

---

### 3.6 Performance Benchmarks (`test_challenge_benchmarks.py`)

* **BM-001**: Verify list endpoint response latency is within benchmark criteria under simulated concurrency.
* **BM-002**: Verify challenge creation response latency meets target criteria.
* **BM-003**: Verify pagination query execution time.
* **BM-004**: Verify multipart asset upload ingestion time.

---

### 3.7 End-to-End Problem Journey Test (`test_challenge_e2e.py`)

* **Test Identifier**: `CHAL-E2E-001: Full Citizen Challenge Lifecycle Journey`
* **Execution Flow**:
  1. **Step 1 (Auth)**: Register fresh citizen and evaluator accounts; receive JWT access tokens.
  2. **Step 2 (Draft Creation)**: Citizen calls `POST /api/v1/challenges` with `status: "draft"`. Verify `201 Created`, `visibility: "PUBLIC"`, and `version=1`.
  3. **Step 3 (Asset Upload)**: Citizen calls `POST /api/v1/challenges/{id}/assets` with synthetic JPEG evidence photo. Verify `201 Created`.
  4. **Step 4 (Submission)**: Citizen calls `PATCH /api/v1/challenges/{id}/status` transitioning from `draft` to `submitted`. Verify `200 OK`.
  5. **Step 5 (Review & Approval)**: Evaluator transitions status to `under_review` then `approved`. Verify `200 OK` and audit logs.
  6. **Step 6 (Publication)**: Admin transitions status to `published`. Verify `published_at` is populated.
  7. **Step 7 (Catalog Exploration)**: Query `GET /api/v1/challenges?status=published`. Confirm challenge is listed with correct metadata.
  8. **Step 8 (Closure & Archival)**: Admin transitions status to `closed`, then `archived`. Confirm `archived_at` is populated and challenge is excluded from active catalog queries.
