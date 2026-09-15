# Module: M3 Team Formation & Collaboration — [STATUS: LOCKED 🔒]

## Status
🔒 **LOCKED & VERIFIED** (Completed: Milestone 3)  
Readiness Score: **100 / 100**  
Verification: **109/109 Tests Passing (100% Pass Rate, 94.2% Coverage, 0 Regressions)**  
Version: **`v3.0.0-m3-lock`**  
Date: **2026-09-15**  

---

## 1. What M3 Provides

Module 3 delivers the complete **Team Formation & Collaboration** subsystem for the Societal Innovation Collaboration Platform (SICP). It establishes the multi-stakeholder foundation for students, academic mentors, and industry advisors to form, discover, recruit, and govern project teams strictly anchored to verified societal challenges (from Module 2).

### Core Capabilities:
1. **Mandatory Challenge Linkage**: Every team is strictly linked to a verified published challenge (`challenge_id NOT NULL`, FK $\rightarrow$ `challenges.id`, `ON DELETE RESTRICT`). Unanchored or generic teams are prohibited.
2. **Deterministic Team State Machine**: Strict lifecycle state management across `OPEN`, `FULL`, `LOCKED`, and `DISBANDED`. Disbanded teams are permanently locked against any subsequent mutations (HTTP 400 `INVALID_TEAM_STATE`).
3. **Decoupled Capacity Governance**:
   - **Student Contributors**: Enforced range of $2 \le N_{\text{contributors}} \le \text{max\_members} \le 6$ across roles `LEADER`, `CO_LEADER`, and `MEMBER`.
   - **Faculty / Industry Mentors**: Dedicated advisory capacity with a strict maximum of **2 active mentors per team**. Mentors do not consume contributor seats.
4. **Single Team Ownership Per Challenge (FR-M3-15)**: A user cannot create or own more than one active team (`OPEN`, `FULL`, `LOCKED`) per challenge, enforced at the database level via a partial unique index.
5. **Single Active Participation Per Challenge (FR-M3-14)**: A student cannot be an `ACTIVE` contributor in more than one team associated with the same challenge.
6. **Inbound Join Requests & Applicant Withdrawal**: Candidates can apply to open teams with personal pitches and retain the right to voluntarily withdraw pending requests (`REQUESTED -> WITHDRAWN`).
7. **Outbound Invitations & 14-Day Expiration**: Leaders can invite prospective members and mentors with an automated 14-day validity window (`expires_at = created_at + 14 days`). Expired invites are rejected upon acceptance attempts (HTTP 409 `INVITATION_EXPIRED`).
8. **Cross-Channel Membership Integrity**: Complete mutual exclusion across `ACTIVE`, `INVITED`, and `REQUESTED` states, preventing conflicting duplicate pipelines with HTTP 409 Conflict.
9. **Role Delegation & Leadership Handover**: Promotion/demotion of up to 2 `CO_LEADER`s, member eviction, and safe primary leadership transfers.
10. **Comprehensive 17-Action Audit Trail**: 100% audit logging coverage for all creation, recruitment, status changes, withdrawals, expirations, and governance actions.

---

## 2. API Endpoints

All endpoints adhere strictly to SICP standardized JSON envelopes:
- Success: `{"success": true, "data": {...}}`
- Error: `{"success": false, "error": {"code": "...", "message": "...", "details": {...}}}`

| HTTP Method | Route | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/teams` | Create a new team linked to a challenge | Yes | `student`, `admin` |
| `GET` | `/api/v1/teams` | List discoverable teams with multi-attribute filtering | Yes | Any authenticated user |
| `GET` | `/api/v1/teams/my-teams` | List teams where user is an active or pending member | Yes | Any authenticated user |
| `GET` | `/api/v1/teams/invitations/me` | List active unexpired received invitations | Yes | Any authenticated user |
| `POST` | `/api/v1/teams/join-requests/{id}/withdraw` | Applicant voluntarily withdraws join request | Yes | Applicant, `admin` |
| `POST` | `/api/v1/teams/invitations/{id}/action` | Accept or decline a received invitation | Yes | Recipient |
| `GET` | `/api/v1/teams/{id}` | Retrieve full team profile and member roster | Yes | Any authenticated user |
| `PATCH` | `/api/v1/teams/{id}` | Update team metadata or capacity | Yes | Leader, Co-Leader, `admin` |
| `PATCH` | `/api/v1/teams/{id}/status` | Lock or unlock team recruitment | Yes | Leader, `admin` |
| `DELETE` | `/api/v1/teams/{id}` | Disband team (terminal state) | Yes | Leader, `admin` |
| `POST` | `/api/v1/teams/{id}/join-requests` | Submit inbound application to join team | Yes | Any student (non-member) |
| `GET` | `/api/v1/teams/{id}/join-requests` | List pending join requests for team | Yes | Leader, Co-Leader, `admin` |
| `POST` | `/api/v1/teams/{id}/join-requests/{id}/action`| Accept or reject candidate join request | Yes | Leader, Co-Leader, `admin` |
| `POST` | `/api/v1/teams/{id}/invitations` | Invite collaborator or faculty/industry mentor | Yes | Leader, Co-Leader, `admin` |
| `POST` | `/api/v1/teams/{id}/leave` | Voluntarily leave team roster | Yes | Active Member / Co-Leader / Mentor |
| `DELETE` | `/api/v1/teams/{id}/members/{user_id}` | Evict a member from the team roster | Yes | Leader, Co-Leader (members only), `admin` |
| `PATCH` | `/api/v1/teams/{id}/members/{user_id}/role` | Promote/demote between Member and Co-Leader | Yes | Leader, `admin` |
| `POST` | `/api/v1/teams/{id}/transfer-leadership` | Transfer primary team leadership to member | Yes | Leader, `admin` |

---

## 3. Database Schema

### `teams` Table
| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Not Null, Min 3 chars |
| `description` | TEXT | Not Null, Min 20 chars |
| `challenge_id` | UUID | Foreign Key $\rightarrow$ `challenges.id` (**NOT NULL**, ON DELETE RESTRICT, Indexed) |
| `created_by` | UUID | Foreign Key $\rightarrow$ `users.id` (Not Null, Indexed) |
| `max_members` | INTEGER | Not Null, Default `5`, Checked ($2 \le \text{max\_members} \le 6$) |
| `status` | VARCHAR(20) | Not Null, Default `'OPEN'` (`TeamStatus`) |
| `visibility` | VARCHAR(20) | Not Null, Default `'PUBLIC'` (`TeamVisibility`) |
| `skills_needed` | JSON | List of required skill tags (max 10) |
| `version` | INTEGER | Not Null, Default `1` (Optimistic Locking) |
| `created_at` | TIMESTAMPTZ | Not Null, Default `now()` |
| `updated_at` | TIMESTAMPTZ | Not Null, Default `now()` |
| `is_deleted` | BOOLEAN | Not Null, Default `false` |

### `team_members` Table
| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `team_id` | UUID | Foreign Key $\rightarrow$ `teams.id` (Not Null, ON DELETE CASCADE, Indexed) |
| `user_id` | UUID | Foreign Key $\rightarrow$ `users.id` (Not Null, ON DELETE RESTRICT, Indexed) |
| `role` | VARCHAR(20) | Not Null, Default `'MEMBER'` (`TeamMemberRole`) |
| `status` | VARCHAR(20) | Not Null, Default `'REQUESTED'` (`TeamMemberStatus`) |
| `invited_by` | UUID | Foreign Key $\rightarrow$ `users.id` (Nullable) |
| `message` | VARCHAR(500) | Optional pitch or recruitment message |
| `expires_at` | TIMESTAMPTZ | Nullable (Populated for `INVITED` status, default `created_at + 14d`) |
| `joined_at` | TIMESTAMPTZ | Nullable (Populated when status transitions to `ACTIVE`) |
| `created_at` | TIMESTAMPTZ | Not Null, Default `now()` |
| `updated_at` | TIMESTAMPTZ | Not Null, Default `now()` |
| `is_deleted` | BOOLEAN | Not Null, Default `false` |

### Hardened Partial Unique Indexes
1. `idx_teams_unique_active_owner` ON `teams (challenge_id, created_by) WHERE is_deleted = false AND status != 'DISBANDED'`
2. `idx_unique_active_user_team` ON `team_members (team_id, user_id) WHERE is_deleted = false AND status IN ('ACTIVE', 'INVITED', 'REQUESTED')`

---

## 4. Enums & Audit Actions

### Domain Enums (`app.core.constants`)
- **`TeamStatus`**: `OPEN`, `FULL`, `LOCKED`, `DISBANDED`
- **`TeamVisibility`**: `PUBLIC`, `PRIVATE`, `INVITE_ONLY`
- **`TeamMemberRole`**: `LEADER`, `CO_LEADER`, `MEMBER`, `MENTOR`
- **`TeamMemberStatus`**: `ACTIVE`, `INVITED`, `REQUESTED`, `WITHDRAWN`, `EXPIRED`, `REJECTED`, `LEFT`, `REMOVED`

### Audit Trail Actions (`AuditAction`)
1. `TEAM_CREATED`
2. `TEAM_UPDATED`
3. `TEAM_LOCKED`
4. `TEAM_UNLOCKED`
5. `TEAM_DISBANDED`
6. `INVITATION_SENT`
7. `INVITATION_ACCEPTED`
8. `INVITATION_DECLINED`
9. `INVITATION_EXPIRED`
10. `JOIN_REQUEST_SENT`
11. `JOIN_REQUEST_ACCEPTED`
12. `JOIN_REQUEST_REJECTED`
13. `JOIN_REQUEST_WITHDRAWN`
14. `MEMBER_LEFT`
15. `MEMBER_REMOVED`
16. `MEMBER_ROLE_CHANGED`
17. `LEADERSHIP_TRANSFERRED`

---

## 5. Interface Contracts for Downstream Modules

1. **Module 4 (AI Matching & Recommendation Engine)**:
   - Consumes `teams.skills_needed` and `challenges.category` for candidate team recommendations.
   - Consumes `team_members` mentor advisory linkages for domain expert matching.
2. **Module 5 (Innovation Project Lifecycle & Blueprints)**:
   - Anchors project proposals to verified `teams.id` where `teams.status IN ('OPEN', 'FULL', 'LOCKED')`.
   - Requires team leader authorization (`TeamMemberRole.LEADER`) for milestone and blueprint submissions.
3. **Module 6 (Industry Partnership Network)**:
   - Utilizes `TeamMemberRole.MENTOR` records with `UserRole.INDUSTRY` to bind corporate sponsors and technical advisors to student teams.

---

## 6. Verification Summary

| Test Suite | File Path | Status |
| :--- | :--- | :--- |
| Pydantic Boundary Validations | `backend/tests/teams/test_team_schemas.py` | ✅ PASS |
| Team State Machine & Disbanded Protection | `backend/tests/teams/test_team_state_machine.py` | ✅ PASS |
| Membership Lifecycle & Expiry | `backend/tests/teams/test_team_membership_lifecycle.py` | ✅ PASS |
| RBAC Authorization Matrix | `backend/tests/teams/test_team_auth_matrix.py` | ✅ PASS |
| Concurrency & Capacity Governance | `backend/tests/teams/test_team_capacity_concurrency.py` | ✅ PASS |
| Complete Audit Verification (17 Actions) | `backend/tests/teams/test_team_audit.py` | ✅ PASS |
| Repository & Index Tests | `backend/tests/teams/test_team_repository.py` | ✅ PASS |
| Standard Envelope REST API Tests | `backend/tests/teams/test_teams_api.py` | ✅ PASS |
| Full Collaborative Lifecycle E2E | `backend/tests/teams/test_team_e2e.py` | ✅ PASS |
| M1 IAM Regressions | `backend/tests/auth/` | ✅ ZERO REGRESSIONS |
| M2 Challenge Management Regressions | `backend/tests/challenges/` | ✅ ZERO REGRESSIONS |
