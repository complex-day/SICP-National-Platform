# Module 3: Team Formation & Collaboration — Implementation Checklist

**Module ID:** M3  
**Module Title:** Team Formation & Collaboration  
**Status:** ✅ **COMPLETED (STRICT TDD IMPLEMENTATION & QUALITY VERIFICATION)**  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Dependencies:** M1 (IAM) [LOCKED 🔒], M2 (Challenges) [LOCKED 🔒]

---

## 1. Governance & Immutability Rules
- [x] M1 source code, schemas, and tests remain 100% untouched.
- [x] M2 source code, schemas, and tests remain 100% untouched.
- [x] `challenge_id` is strictly mandatory (`NOT NULL`) on all teams.
- [x] Zero scope expansion (No M4 recommendations, M5 blueprints, M6 sponsorships, notifications, leaderboards, or certificates).
- [x] Target test coverage: $\ge 90\%$ across all M3 components.

---

## 2. Implementation Execution Sequence

### Phase 1: Constants & Domain Exceptions
- [x] `app/core/constants.py`:
  - [x] `TeamStatus`: `OPEN`, `FULL`, `LOCKED`, `DISBANDED`
  - [x] `TeamVisibility`: `PUBLIC`, `PRIVATE`, `INVITE_ONLY`
  - [x] `TeamMemberRole`: `LEADER`, `CO_LEADER`, `MEMBER`, `MENTOR`
  - [x] `TeamMemberStatus`: `ACTIVE`, `INVITED`, `REQUESTED`, `WITHDRAWN`, `EXPIRED`, `REJECTED`, `LEFT`, `REMOVED`
  - [x] Split `TEAM_STATUS_CHANGED` into `TEAM_LOCKED` and `TEAM_UNLOCKED` in `AuditAction`
  - [x] 17 total M3 `AuditAction` entries registered
- [x] `app/core/exceptions.py`:
  - [x] `DuplicateTeamMembershipError` (HTTP 409 Conflict, code `DUPLICATE_TEAM_MEMBERSHIP`)
  - [x] `DuplicateTeamOwnershipError` (HTTP 409 Conflict, code `DUPLICATE_ACTIVE_TEAM_OWNERSHIP`)
  - [x] `TeamCapacityExceededError` (HTTP 409 Conflict, code `TEAM_CAPACITY_EXCEEDED`)
  - [x] `MentorCapacityExceededError` (HTTP 409 Conflict, code `MENTOR_CAPACITY_EXCEEDED`)
  - [x] `InvalidTeamStateError` (HTTP 400 Bad Request, code `INVALID_TEAM_STATE`)
  - [x] `InvitationExpiredError` (HTTP 409 Conflict, code `INVITATION_EXPIRED`)

### Phase 2: Schema Validation Tests (TDD RED)
- [x] `tests/teams/test_team_schemas.py`:
  - [x] Valid team creation payload with mandatory `challenge_id`
  - [x] Missing or null `challenge_id` validation rejection
  - [x] Team name bounds (3–100 chars)
  - [x] Description bounds (20–1000 chars)
  - [x] Max members bounds (2–6 contributors)
  - [x] Skills list length cap (max 10 items)
  - [x] Visibility and role enum validations
  - [x] Join request message length limit (500 chars)

### Phase 3: Database Migration & Schema
- [x] `alembic/versions/003_team_collaboration_schema.py`:
  - [x] `teams` table (`id`, `name`, `description`, `challenge_id NOT NULL`, `created_by NOT NULL`, `max_members`, `status`, `visibility`, `skills_needed`, `version`, `created_at`, `updated_at`, `is_deleted`)
  - [x] `team_members` table (`id`, `team_id NOT NULL`, `user_id NOT NULL`, `role`, `status`, `invited_by`, `message`, `expires_at`, `joined_at`, `created_at`, `updated_at`, `is_deleted`)
  - [x] Partial Unique Index `idx_teams_unique_active_owner` (`(challenge_id, created_by) WHERE is_deleted = false AND status != 'DISBANDED'`)
  - [x] Partial Unique Index `idx_unique_active_user_team` (`(team_id, user_id) WHERE is_deleted = false AND status IN ('ACTIVE', 'INVITED', 'REQUESTED')`)
  - [x] Performance indexes (`idx_teams_created_by`, `idx_teams_status`, `idx_teams_challenge_status`, `idx_team_members_status`, `idx_team_members_team_status`)

### Phase 4: SQLAlchemy Models & Pydantic Schemas
- [x] `app/models/team.py`:
  - [x] `Team` model with optimistic locking (`version`) and relationships
  - [x] `TeamMember` model with `expires_at` and role/status enums
- [x] `app/models/__init__.py`:
  - [x] Register `Team` and `TeamMember` in ORM metadata exports
- [x] `app/schemas/team.py`:
  - [x] `TeamCreateRequest`, `TeamUpdateRequest`, `TeamStatusUpdateRequest`
  - [x] `TeamJoinRequestCreate`, `TeamJoinRequestAction`
  - [x] `TeamInviteCreate`, `TeamInviteAction`
  - [x] `TeamMemberRoleUpdate`, `TeamTransferLeadershipRequest`
  - [x] `TeamResponseData`, `TeamSummaryData`, `TeamDetailData`, `TeamMemberData`
  - [x] `PaginatedTeamsData`

### Phase 5: Repository Tests & Implementation (TDD RED $\rightarrow$ GREEN)
- [x] `tests/teams/test_team_repository.py`:
  - [x] Team CRUD queries
  - [x] Active contributor count ($N_{\text{contributors}} \le \text{max\_members}$)
  - [x] Active mentor count ($N_{\text{mentors}} \le 2$)
  - [x] `check_user_active_challenge_participation` (FR-M3-14)
  - [x] `check_user_active_challenge_ownership` (FR-M3-15)
  - [x] Catalog filtering by challenge, skill, status, search, and pagination
  - [x] Pessimistic row locking (`SELECT FOR UPDATE`)
- [x] `app/repositories/team_repository.py`:
  - [x] Implement `TeamRepository` and `TeamMemberRepository` async methods

### Phase 6: Service Tests & Implementation (TDD RED $\rightarrow$ GREEN)
- [x] `tests/teams/test_team_state_machine.py`:
  - [x] Team state transitions: `OPEN` $\leftrightarrow$ `FULL`, `OPEN` $\leftrightarrow$ `LOCKED`, $\rightarrow$ `DISBANDED`
  - [x] Disbanded team lockdown guards (all mutations reject with HTTP 400 `INVALID_TEAM_STATE`)
- [x] `tests/teams/test_team_membership_lifecycle.py`:
  - [x] Inbound join requests (`REQUESTED` $\rightarrow$ `ACTIVE` / `REJECTED`)
  - [x] Join request withdrawal by applicant (`REQUESTED` $\rightarrow$ `WITHDRAWN`)
  - [x] Outbound invitations (`INVITED` with 14d expiry $\rightarrow$ `ACTIVE` / `LEFT` / `EXPIRED`)
  - [x] Cross-channel integrity conflict rejections (HTTP 409 Conflict)
  - [x] Member exit, member removal, role promote/demote (max 2 co-leaders), leadership transfer
- [x] `tests/teams/test_team_capacity_concurrency.py`:
  - [x] Contributor capacity race test (atomic 409 rejection on overflow)
  - [x] Mentor capacity limit test (max 2 mentors, separate from contributors)
  - [x] Single team ownership per challenge test (FR-M3-15)
  - [x] Single active team participation per challenge test (FR-M3-14)
  - [x] Optimistic locking version collision test
- [x] `tests/teams/test_team_audit.py`:
  - [x] 17 distinct audit events verified with complete metadata
- [x] `app/services/team_service.py`:
  - [x] Complete business logic, state machines, capacity counters, auth checks, and audit logging

### Phase 7: API Tests & Router Implementation (TDD RED $\rightarrow$ GREEN)
- [x] `tests/teams/test_team_auth_matrix.py`:
  - [x] RBAC enforcement across Leader, Co-Leader, Member, Mentor, Applicant, Invitee, Non-member student, Faculty, Admin
- [x] `tests/teams/test_teams_api.py`:
  - [x] All endpoints return standard envelope: `{"success": true, "data": ...}`
  - [x] Error responses return standard envelope: `{"success": false, "error": {...}}`
- [x] `app/api/v1/endpoints/teams.py`:
  - [x] `POST /api/v1/teams` (Create team)
  - [x] `GET /api/v1/teams` (Catalog)
  - [x] `GET /api/v1/teams/my-teams` (User teams)
  - [x] `GET /api/v1/teams/{id}` (Detail & roster)
  - [x] `PATCH /api/v1/teams/{id}` (Update metadata)
  - [x] `PATCH /api/v1/teams/{id}/status` (Lock/Unlock)
  - [x] `DELETE /api/v1/teams/{id}` (Disband team)
  - [x] `POST /api/v1/teams/{id}/join-requests` (Submit request)
  - [x] `GET /api/v1/teams/{id}/join-requests` (List pending requests)
  - [x] `POST /api/v1/teams/{id}/join-requests/{member_id}/action` (Accept/Reject)
  - [x] `POST /api/v1/teams/join-requests/{request_id}/withdraw` (Withdraw request)
  - [x] `POST /api/v1/teams/{id}/invitations` (Send invite)
  - [x] `GET /api/v1/teams/invitations/me` (My received invites)
  - [x] `POST /api/v1/teams/invitations/{member_id}/action` (Accept/Decline invite)
  - [x] `POST /api/v1/teams/{id}/leave` (Leave team)
  - [x] `DELETE /api/v1/teams/{id}/members/{user_id}` (Remove member)
  - [x] `PATCH /api/v1/teams/{id}/members/{user_id}/role` (Promote/Demote role)
  - [x] `POST /api/v1/teams/{id}/transfer-leadership` (Transfer leadership)
- [x] `app/api/v1/router.py`:
  - [x] Mount `teams.router` under `/api/v1`

### Phase 8: E2E Tests, Quality Gates & Release Lock
- [x] `tests/teams/test_team_e2e.py`:
  - [x] Complete multi-user collaborative lifecycle journey
- [x] Full Test Suite Run:
  - [x] M1 test suite: 100% passing
  - [x] M2 test suite: 100% passing
  - [x] M3 test suite: 100% passing
  - [x] Overall M3 coverage $\ge 90\%$
- [x] Release Artifacts:
  - [x] `M3-HANDOFF.md`
  - [x] `Docs/releases/M3-LOCK.md`
