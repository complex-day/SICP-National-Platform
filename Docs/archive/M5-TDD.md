# Test-Driven Development (TDD) Specification — Module 5: Innovation Project Lifecycle

**Document Version:** 1.0 (Specification Only)  
**Module ID:** M5  
**Module Name:** Innovation Project Lifecycle  
**Status:** 📋 **PROPOSED SPECIFICATION (PENDING APPROVAL)**  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Target Delivery:** Milestone 5  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒 `v1.0.0-m1-lock`]
- M2: Citizen Challenge Management [LOCKED 🔒 `v2.0.0-m2-lock`]
- M3: Team Formation & Collaboration [LOCKED 🔒 `v3.0.0-m3-lock`]
- M4: Academic Collaboration Hub [LOCKED 🔒 `v4.0.0-m4-lock`]

---

## 1. TDD Strategy & Quality Goals

Module 5 adheres strictly to the **TDD Red-Green-Refactor Lifecycle**:
1. **Red Phase**: Write failing unit, schema, repository, service, and API integration test suites first.
2. **Green Phase**: Implement minimal models, repositories, services, and API endpoints to satisfy all assertions.
3. **Refactor Phase**: Optimize queries (eliminate N+1 queries with eager loading), enforce clean domain encapsulation, and verify optimistic locking.

### Quality Benchmarks:
* **Test Pass Rate**: 100% (Zero failures, Zero errors).
* **Code Coverage**: $\ge 90\%$ line and branch coverage across all Module 5 files (`app/api/v1/endpoints/projects.py`, `app/models/project.py`, `app/repositories/project_repository.py`, `app/services/project_service.py`).
* **Platform Regression**: Zero regressions across M1 (IAM), M2 (Challenges), M3 (Teams), and M4 (Academic Hub).

---

## 2. Test Suite Architecture (`backend/tests/project/`)

```
backend/tests/project/
├── conftest.py                             # Shared M5 fixtures (intake allocations, teams, mentors, projects)
├── test_project_creation.py                # Instantiation, validation, duplicate allocation prevention
├── test_project_state_machine.py           # Valid & invalid lifecycle transitions, stage progression
├── test_project_milestones.py              # Sequence, weight sum invariant, approval lock, progress calc
├── test_project_deliverables.py            # Upload verification, SHA-256 integrity, version chains
├── test_project_reviews.py                 # Faculty evaluation, rubric validation, changes requested loop
├── test_project_auth_matrix.py             # Role-based & tenant-scoped access control guards
├── test_project_concurrency.py             # Concurrent updates, race conditions, atomic state changes
├── test_project_optimistic_locking.py      # Version mismatch handling and conflict detection
├── test_project_audit.py                   # Persistent emission and immutability of all 15 audit events
├── test_project_e2e.py                     # Full end-to-end multi-stakeholder project lifecycle
├── test_project_performance.py             # Catalog latency, query limits, indexing complexity
└── test_project_edge_cases.py              # Withdrawn intake, deleted users, duplicate uploads
```

---

## 3. Failing Test Specifications (Specifications Only)

### 3.1 Project Creation (`test_project_creation.py`)

#### `test_valid_project_instantiation_from_allocation()`
* **Scenario**: An authenticated Team Leader of an active M4 `intake_team_allocations` submits a project initialization request with valid `title`, `abstract`, `tech_stack`, and `target_completion_date`.
* **Expected Outcome**:
  - Returns HTTP 201 `Created`.
  - Initial `status` is `PROPOSAL` and `current_stage` is `CONCEPT_RESEARCH`.
  - `progress_percentage` initializes to `0`.
  - `primary_faculty_mentor_id` is automatically populated from the allocation record.
  - Emits audit action `PROJECT_CREATED`.

#### `test_invalid_project_creation_unallocated_team()`
* **Scenario**: A student team leader attempts to create a project using a `team_id` that is not part of any verified M4 `intake_team_allocations`.
* **Expected Outcome**: Returns HTTP 400 `INVALID_ALLOCATION_BINDING` with error envelope.

#### `test_prevent_duplicate_project_for_same_allocation()`
* **Scenario**: A team leader attempts to instantiate a second project referencing an `intake_team_allocation_id` that already has an active project.
* **Expected Outcome**:
  - Database unique index `idx_projects_unique_allocation` blocks insertion.
  - Service layer catches violation and returns HTTP 409 `DUPLICATE_PROJECT_ALLOCATION`.

#### `test_non_leader_cannot_instantiate_project()`
* **Scenario**: A standard student team member (role `MEMBER`) or citizen attempts `POST /api/v1/projects`.
* **Expected Outcome**: Returns HTTP 403 `FORBIDDEN` (`ONLY_TEAM_LEADER_MAY_INITIALIZE`).

---

### 3.2 Project State Transitions (`test_project_state_machine.py`)

#### `test_valid_proposal_to_active_transition()`
* **Scenario**: Primary Faculty Mentor executes `POST /api/v1/projects/{id}/activate` after team configures milestones whose weights sum to exactly 100.
* **Expected Outcome**:
  - Project status transitions from `PROPOSAL` $\rightarrow$ `ACTIVE`.
  - All draft milestones transition from `DRAFT` $\rightarrow$ `IN_PROGRESS`.
  - Emits audit action `PROJECT_ROADMAP_ACTIVATED`.

#### `test_invalid_activation_with_incomplete_weights()`
* **Scenario**: Mentor attempts activation when milestone weights sum to 80 (or 110).
* **Expected Outcome**: Returns HTTP 422 `INVALID_MILESTONE_WEIGHT_SUM` with message "Milestone weights must sum to exactly 100".

#### `test_stage_progression_concept_to_prototype()`
* **Scenario**: Team completes all architecture milestones; mentor certifies stage transition to `PROTOTYPE_DEVELOPMENT`.
* **Expected Outcome**:
  - Project `current_stage` updates to `PROTOTYPE_DEVELOPMENT`.
  - Emits audit action `PROJECT_STAGE_CHANGED`.

#### `test_prevent_illegal_state_jump()`
* **Scenario**: Attempting to transition a project directly from `PROPOSAL` $\rightarrow$ `COMPLETED` or `PROTOTYPE` $\rightarrow$ `COMPLETED` without reaching `REVIEW_READY`.
* **Expected Outcome**: Returns HTTP 400 `ILLEGAL_STATE_TRANSITION`.

---

### 3.3 Milestone Management (`test_project_milestones.py`)

#### `test_create_valid_sequential_milestones()`
* **Scenario**: Team leader adds milestones with contiguous `sequence_index` (1, 2, 3) and valid due dates.
* **Expected Outcome**: Returns HTTP 201; milestones stored in `DRAFT` status with audit log `MILESTONE_CREATED`.

#### `test_prevent_duplicate_milestone_sequence_index()`
* **Scenario**: Attempting to add two milestones with `sequence_index = 1` to the same project.
* **Expected Outcome**: Returns HTTP 409 `DUPLICATE_MILESTONE_SEQUENCE`.

#### `test_enforce_sequential_submission_gate()`
* **Scenario**: Team leader attempts `POST .../milestones/2/submit` while Milestone 1 is still in `IN_PROGRESS` (not `APPROVED`).
* **Expected Outcome**: Returns HTTP 400 `PREVIOUS_MILESTONES_INCOMPLETE`.

#### `test_approved_milestone_attributes_are_immutable()`
* **Scenario**: Team leader or mentor attempts `PATCH .../milestones/1` after Milestone 1 status is `APPROVED`.
* **Expected Outcome**: Returns HTTP 400 `APPROVED_MILESTONE_IMMUTABLE`.

#### `test_project_progress_recalculation_on_approval()`
* **Scenario**: Milestone 1 (weight 25) and Milestone 2 (weight 35) are approved in sequence.
* **Expected Outcome**:
  - After Milestone 1 approval: `progress_percentage` is 25.
  - After Milestone 2 approval: `progress_percentage` is 60.

---

### 3.4 Deliverable Management & Versioning (`test_project_deliverables.py`)

#### `test_upload_deliverable_with_sha256_verification()`
* **Scenario**: Active student team member uploads a PDF test report with valid file size, MIME type, and SHA-256 checksum.
* **Expected Outcome**:
  - Returns HTTP 201.
  - Asset metadata and hash stored.
  - Emits audit action `DELIVERABLE_UPLOADED`.

#### `test_prevent_deliverable_upload_by_non_team_member()`
* **Scenario**: A student from a different team attempts to upload a deliverable to Project X.
* **Expected Outcome**: Returns HTTP 403 `FORBIDDEN` (`UNAUTHORIZED_TEAM_MEMBER`).

#### `test_immutable_deliverable_version_chaining()`
* **Scenario**: Team uploads a revision for an existing deliverable `D1` (v1).
* **Expected Outcome**:
  - Creates new record `D2` with `version_number = 2` and `parent_deliverable_id = D1.id`.
  - `D1` remains unchanged in the database.

#### `test_deliverable_deletion_blocked_during_active_review()`
* **Scenario**: Team member attempts to soft-delete a deliverable while the associated milestone is `SUBMITTED` or `UNDER_REVIEW`.
* **Expected Outcome**: Returns HTTP 400 `DELIVERABLE_LOCKED_FOR_REVIEW`.

---

### 3.5 Review Workflow (`test_project_reviews.py`)

#### `test_primary_faculty_mentor_submits_approved_review()`
* **Scenario**: Primary faculty mentor reviews submitted milestone deliverables, scores rubric (score: 92/100), and selects decision `APPROVED`.
* **Expected Outcome**:
  - Milestone transitions from `SUBMITTED` $\rightarrow$ `APPROVED`.
  - `completed_at` timestamp is set.
  - Emits audit action `MILESTONE_APPROVED`.

#### `test_mentor_requests_changes_loop()`
* **Scenario**: Mentor reviews submission and issues decision `CHANGES_REQUESTED` with feedback "Incomplete lab assay logs".
* **Expected Outcome**:
  - Milestone transitions to `CHANGES_REQUESTED`.
  - Team leader uploads incremented deliverable (v2) and re-submits.
  - Milestone transitions back to `SUBMITTED`.
  - Subsequent mentor evaluation creates a second `ProjectReview` record.

#### `test_non_mentor_cannot_approve_milestone()`
* **Scenario**: Student, citizen, or unassigned faculty member attempts to submit a milestone review.
* **Expected Outcome**: Returns HTTP 403 `FORBIDDEN` (`UNAUTHORIZED_REVIEWER`).

#### `test_review_records_are_strictly_immutable()`
* **Scenario**: Attempting an `UPDATE` or `DELETE` on an existing `project_reviews` row.
* **Expected Outcome**: Operation rejected by repository/service layer; no HTTP mutation route exposed.

---

### 3.6 RBAC & Authorization Matrix (`test_project_auth_matrix.py`)

#### `test_student_role_cannot_activate_project()`
* **Scenario**: Authenticated student team leader attempts to call `/api/v1/projects/{id}/activate`.
* **Expected Outcome**: Returns HTTP 403 `FORBIDDEN`.

#### `test_faculty_cannot_review_unassigned_projects()`
* **Scenario**: Dr. Smith (faculty at Univ A) attempts to submit a review on a project assigned to Dr. Jones (faculty at Univ B).
* **Expected Outcome**: Returns HTTP 403 `FORBIDDEN` (`NOT_ASSIGNED_PROJECT_MENTOR`).

#### `test_platform_admin_override_privileges()`
* **Scenario**: Platform Admin (`role = 'admin'`) suspends a project or executes an administrative review override.
* **Expected Outcome**: Action succeeds; audit log records admin actor UUID.

#### `test_public_view_project_catalog_sanitization()`
* **Scenario**: Unauthenticated / public citizen queries `GET /api/v1/projects/{id}`.
* **Expected Outcome**: Returns sanitized public view (title, abstract, stage, team name, demo URL) while redacting internal sprint blockers and draft review notes.

---

### 3.7 Concurrency & Race Conditions (`test_project_concurrency.py`)

#### `test_concurrent_milestone_review_race_condition()`
* **Scenario**: Two concurrent API requests attempt to approve Milestone 1 simultaneously with identical initial state.
* **Expected Outcome**:
  - Exactly one request succeeds with HTTP 200.
  - The conflicting request fails with HTTP 409 `CONCURRENCY_CONFLICT`.
  - Project progress is incremented exactly once (no double counting).

#### `test_concurrent_deliverable_upload_race()`
* **Scenario**: Two team members upload deliverables to the same milestone simultaneously.
* **Expected Outcome**: Both uploads succeed with independent UUIDs and correct sequence ordering without deadlocks.

---

### 3.8 Optimistic Locking (`test_project_optimistic_locking.py`)

#### `test_project_optimistic_locking_conflict()`
* **Scenario**: Client A reads Project with `version = 1`. Client B updates Project (`version` becomes 2). Client A attempts update sending stale `version = 1`.
* **Expected Outcome**: Service detects version mismatch and returns HTTP 409 `OPTIMISTIC_LOCK_ERROR`.

#### `test_milestone_optimistic_locking_conflict()`
* **Scenario**: Mentor attempts to submit review with stale milestone version.
* **Expected Outcome**: Returns HTTP 409 `OPTIMISTIC_LOCK_ERROR` and forces client reload.

---

### 3.9 Audit Logging & Immutability (`test_project_audit.py`)

#### `test_verify_all_15_project_audit_actions()`
* **Scenario**: Full project lifecycle is executed from instantiation to completion.
* **Expected Outcome**:
  - All 15 M5 `AuditAction` enums are present in `audit_logs`.
  - Each entry contains valid `actor_id`, `resource_id`, `ip_address`, and before/after state diffs.

#### `test_audit_log_records_cannot_be_deleted()`
* **Scenario**: Direct execution of `DELETE FROM audit_logs WHERE ...` or `UPDATE audit_logs ...`.
* **Expected Outcome**: Database trigger / ORM raises exception; audit trail remains completely immutable.

---

### 3.10 End-to-End Lifecycle (`test_project_e2e.py`)

#### `test_complete_innovation_project_lifecycle_e2e()`
* **Flow**:
  1. Intake team allocation verified in M4.
  2. Team leader instantiates project (`status -> PROPOSAL`).
  3. Team creates 4 sequential milestones (weights: 20, 30, 30, 20 = 100).
  4. Primary faculty mentor activates roadmap (`status -> ACTIVE`).
  5. Team uploads code repo and architecture docs for Milestone 1; submits for review.
  6. Mentor reviews and approves Milestone 1 (`progress -> 20%`).
  7. Team develops and submits Milestone 2 (Prototype); mentor approves (`progress -> 50%`, `stage -> PROTOTYPE_DEVELOPMENT`).
  8. Team executes field pilot, uploads deployment proof for Milestone 3; mentor approves (`progress -> 80%`, `stage -> FIELD_PILOT`).
  9. Team completes final evaluation for Milestone 4; mentor approves (`progress -> 100%`, `status -> REVIEW_READY`).
  10. Team Leader requests final sign-off; Mentor and University Admin execute final completion certificate.
  11. Project status transitions to `COMPLETED`.
  12. Downstream M4 Academic Intake is notified.
* **Expected Outcome**: Entire flow completes with 100% assertion pass rate and complete audit verification.

---

### 3.11 Performance Constraints & Query Limits (`test_project_performance.py`)

#### `test_project_catalog_query_limit_and_pagination()`
* **Scenario**: Query `GET /api/v1/projects` over a seeded dataset of 2,000 projects with pagination (`limit=50, offset=0`).
* **Expected Outcome**:
  - Response time $< 100\text{ms}$.
  - Executes exactly **1 SQL query** with partial index scan (zero N+1 queries).

#### `test_eager_loading_milestones_and_deliverables()`
* **Scenario**: Fetching `GET /api/v1/projects/{id}` for a project with 10 milestones and 50 deliverables.
* **Expected Outcome**:
  - SQLAlchemy `selectin` executes exactly 3 queries (Project, Milestones, Deliverables).
  - Total latency $< 50\text{ms}$.

---

### 3.12 Edge Cases & Failure Scenarios (`test_project_edge_cases.py`)

#### `test_intake_withdrawal_cascades_project_suspension()`
* **Scenario**: Parent M4 `AcademicIntake` is transitioned to `DECLINED` by university admin.
* **Expected Outcome**: Linked project automatically transitions to `SUSPENDED` with closure reason `INTAKE_WITHDRAWN`.

#### `test_deleted_user_integrity_preservation()`
* **Scenario**: A student team member or mentor account is deactivated/soft-deleted.
* **Expected Outcome**: Foreign keys on historical deliverables and reviews remain intact (`ON DELETE RESTRICT`); past reviews remain valid.

#### `test_duplicate_file_upload_prevention()`
* **Scenario**: Attempting to upload two identical files with identical SHA-256 hash to the same milestone.
* **Expected Outcome**: Service detects duplicate hash and reuses existing asset or returns HTTP 409 `DUPLICATE_ASSET_DETECTED`.

#### `test_concurrent_dual_approval_race()`
* **Scenario**: Primary mentor and University Admin attempt to approve the final completion simultaneously.
* **Expected Outcome**: First request completes sign-off; second request gracefully acknowledges completion without double-transitioning.
