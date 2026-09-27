# Module 3 (Team Formation & Collaboration) - Comprehensive Failure & Root Cause Analysis

**Document ID:** `DOC-REL-M3-FAILURE-ANALYSIS-v2.0`  
**Date:** 2026-09-15  
**Target:** Milestone 3 (Team Formation & Collaboration)  

---

## 1. Executive Summary of Root Causes

The test run errors and failures in Milestone 3 stemmed from four distinct, isolated issues:

1. **Fixture & E2E Challenge Status Versioning (19 Errors):**
   - The frozen Module 2 `ChallengeStatusUpdate` schema strictly requires `version: int` for optimistic concurrency locking. The `sample_challenge` fixture in `conftest.py` and the E2E lifecycle test in `test_team_e2e.py` called `PATCH /api/v1/challenges/{id}/status` without the `"version"` field, triggering HTTP `400 Bad Request` validation rejections during challenge publication setup.
2. **Audit Repository Method Signature (1 Failure):**
   - `TeamService` invoked `self.audit_repo.create_log(...)`, whereas the frozen Module 1 `AuditRepository` defines `log(action, entity_type, user_id, entity_id, metadata)`. This caused an `AttributeError` during E2E test execution.
3. **User Model Field Name (5 Failures):**
   - In `backend/tests/teams/test_team_repository.py`, `_create_test_user` instantiated `User(name="Test User", ...)` instead of `User(full_name="Test User", ...)`. The SQLAlchemy declarative constructor raised `TypeError: 'name' is an invalid keyword argument for User`.
4. **Foreign Key Integrity for Challenge Creator (Repository Tests):**
   - In `test_team_repository.py`, `Challenge.citizen_id` has a strict foreign key to `citizens.user_id`. Creating challenges without an associated `CitizenProfile` record triggered SQLite/Postgres `IntegrityError: FOREIGN KEY constraint failed`.

---

## 2. Detailed Breakdown for Every Failure & Error

### 2.1 The 19 Test Errors (Fixture Challenge Setup)
* **Affected Tests:**
  1. `test_team_audit.py::TestTeamAuditLogging::test_all_17_audit_actions_emitted`
  2. `test_team_auth_matrix.py::TestTeamAuthMatrix::test_team_creation_role_restrictions`
  3. `test_team_auth_matrix.py::TestTeamAuthMatrix::test_team_admin_and_member_permissions`
  4. `test_team_auth_matrix.py::TestTeamAuthMatrix::test_mentor_invitation_platform_role_check`
  5. `test_team_capacity_concurrency.py::TestTeamCapacityConcurrency::test_mentor_capacity_limit_max_2_mentors`
  6. `test_team_capacity_concurrency.py::TestTeamCapacityConcurrency::test_single_team_ownership_per_challenge`
  7. `test_team_capacity_concurrency.py::TestTeamCapacityConcurrency::test_single_active_participation_per_challenge`
  8. `test_team_capacity_concurrency.py::TestTeamCapacityConcurrency::test_contributor_capacity_overflow_rejection`
  9. `test_team_membership_lifecycle.py::TestTeamMembershipLifecycle::test_join_request_and_applicant_withdrawal`
  10. `test_team_membership_lifecycle.py::TestTeamMembershipLifecycle::test_join_request_accept_and_reject`
  11. `test_team_membership_lifecycle.py::TestTeamMembershipLifecycle::test_invitation_lifecycle_and_expiration`
  12. `test_team_membership_lifecycle.py::TestTeamMembershipLifecycle::test_cross_channel_membership_integrity_rules`
  13. `test_team_membership_lifecycle.py::TestTeamMembershipLifecycle::test_member_removal_and_sole_leader_exit_prevention`
  14. `test_team_state_machine.py::TestTeamStateMachine::test_team_creation_initial_state_open`
  15. `test_team_state_machine.py::TestTeamStateMachine::test_team_transitions_to_full_and_back_to_open`
  16. `test_team_state_machine.py::TestTeamStateMachine::test_team_lock_and_unlock`
  17. `test_team_state_machine.py::TestTeamStateMachine::test_disbanded_team_protection_rules`
  18. `test_team_state_machine.py::TestTeamStateMachine::test_join_request_on_locked_team`
  19. `test_teams_api.py::TestTeamsAPI::test_api_crud_and_envelopes`
* **Error Type:** `AssertionError: assert 400 == 200`
* **Exact Stack Trace:**
  ```
  backend/tests/teams/conftest.py:309: in sample_challenge
      pub_res = await client.patch(f"/api/v1/challenges/{challenge_id}/status", json={"status": "published"}, headers=admin_auth["headers"])
  E   assert pub_res.status_code == 200 (received 400 Bad Request)
  ```
* **Root Cause:** `ChallengeStatusUpdate` requires mandatory `version: int` for optimistic locking verification. Missing version field returned HTTP 400.
* **Applied Fix:** Updated `conftest.py` lines 304–309 to pass sequential optimistic locking version increments: `{"status": "submitted", "version": 1}`, `{"status": "under_review", "version": 2}`, `{"status": "approved", "version": 3}`, `{"status": "published", "version": 4}`.

---

### 2.2 Failure 1: End-to-End Collaborative Lifecycle Test
* **Test Name:** `backend/tests/teams/test_team_e2e.py::TestTeamE2ELifecycle::test_full_collaborative_team_lifecycle`
* **Error Type:** `AttributeError: 'AuditRepository' object has no attribute 'create_log'`
* **Stack Trace:**
  ```python
  backend/app/services/team_service.py:106: in create_team
      await self.audit_repo.create_log(user_id=current_user.id, action=AuditAction.TEAM_CREATED.value, ...)
  E   AttributeError: 'AuditRepository' object has no attribute 'create_log'
  ```
* **Root Cause:** `AuditRepository` defined in frozen Module 1 exposes `log(action, entity_type, user_id, entity_id, metadata)`, not `create_log`.
* **Applied Fix:** Updated all 17 audit emissions in `backend/app/services/team_service.py` to call `await self.audit_repo.log(action=..., entity_type="team", user_id=..., entity_id=..., metadata=...)`.

---

### 2.3 Failures 2–6: Repository Layer Tests (5 Tests)
* **Test Names:**
  - `backend/tests/teams/test_team_repository.py::TestTeamRepository::test_create_and_get_team`
  - `backend/tests/teams/test_team_repository.py::TestTeamRepository::test_active_contributor_and_mentor_counts`
  - `backend/tests/teams/test_team_repository.py::TestTeamRepository::test_check_user_active_challenge_participation`
  - `backend/tests/teams/test_team_repository.py::TestTeamRepository::test_check_user_active_challenge_ownership`
  - `backend/tests/teams/test_team_repository.py::TestTeamRepository::test_list_teams_catalog`
* **Error Type:** `TypeError: 'name' is an invalid keyword argument for User`
* **Stack Trace:**
  ```python
  backend/tests/teams/test_team_repository.py:18: in _create_test_user
      user = User(email=email, password_hash="hashed_pw", name="Test User", role=role, ...)
  E   TypeError: 'name' is an invalid keyword argument for User
  ```
* **Root Cause:** `User` model column is named `full_name`, not `name`.
* **Applied Fix:** Changed `name="Test User"` to `full_name="Test User"` in `_create_test_user` and created matching `CitizenProfile`, `FacultyProfile`, or `StudentProfile` rows to satisfy relational constraints.

---

## 3. Summary of Files Modified and Fixed

| File | Change Description |
|---|---|
| [`backend/tests/teams/conftest.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/tests/teams/conftest.py) | Added nested `location` dict and `version` parameter in challenge status transitions. |
| [`backend/tests/teams/test_team_e2e.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/tests/teams/test_team_e2e.py) | Added nested `location` dict and `version` parameter in challenge status transitions. |
| [`backend/tests/teams/test_team_repository.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/tests/teams/test_team_repository.py) | Fixed `full_name` keyword on `User`, added `CitizenProfile` instantiation, and removed extra `status` kwarg on `create_team`. |
| [`backend/app/services/team_service.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/app/services/team_service.py) | Replaced `create_log` with `log` across all 17 audit calls and used `user.full_name`. |
| [`backend/app/api/v1/endpoints/teams.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/app/api/v1/endpoints/teams.py) | Replaced `user.name` with `user.full_name`. |
