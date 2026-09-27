# Product Requirements Document (PRD) — Module 3: Team Formation & Collaboration

**Document Version:** 1.1 (Final)  
**Module ID:** M3  
**Module Name:** Team Formation & Collaboration  
**Status:** 🔒 **LOCKED**  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Target Delivery:** Milestone 3  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒]
- M2: Citizen Challenge Management [LOCKED 🔒]

---

## 1. Executive Summary & Problem Definition

### 1.1 Context & Background
In the SICP ecosystem, real-world societal problems are captured and curated as validated **Challenges** (via Module 2). However, solving multidisciplinary societal challenges—such as community water filtration, rural telehealth distribution, or precision agro-irrigation—requires cohesive, skilled, and diverse student teams guided by academic and industrial mentors.

**Module 3 (Team Formation & Collaboration)** provides the core structural backbone for multi-stakeholder collaboration. It empowers students, faculty mentors, and innovators to discover open challenges, form multidisciplinary teams, advertise skill vacancies, invite collaborators, process join requests, manage team roles, and enforce capacity boundaries before transitioning to innovation project lifecycles.

### 1.2 Module Objectives
1. **Facilitate Team Formation**: Provide a seamless, self-service mechanism for students to create teams strictly anchored to verified societal challenges.
2. **Team Discovery & Skill Matching**: Enable granular discovery of teams seeking specific skill sets (e.g., IoT, Full Stack, Embedded Systems, Data Science, Public Health).
3. **Dual-Channel Recruitment**:
   - *Inbound Channel (Join Requests)*: Students can request to join open teams with personalized notes and skill declarations, with full withdrawal capability.
   - *Outbound Channel (Invitations)*: Team leaders can proactively recruit specific platform users with automatic 14-day expiration windows.
4. **Lifecycle & Capacity Governance**: Deterministic state models for teams and memberships, enforcing atomic student contributor limits (2–6 members), dedicated mentor capacity (max 2 mentors), single active team participation per challenge, and single team ownership per challenge.
5. **Role-Based Team Permissions**: Granular hierarchical team roles (`LEADER`, `CO_LEADER`, `MEMBER`, `MENTOR`) with clear administrative and operational privileges.
6. **Complete Auditability**: Immutable audit trail generation across all 16 team creation, recruitment, membership transitions, expiration, and disbandment actions.

---

## 2. Scope & Strict Boundaries

### 2.1 In-Scope (Module 3 Deliverables)

* **Team Entity Management (`teams` table)**:
  - Team creation, profile updates, mandatory challenge linkage (`challenge_id NOT NULL`), vacancy management, and soft-delete/disbandment.
  - Core properties: `name`, `description`, `challenge_id` (Mandatory FK $\rightarrow$ `challenges.id`), `created_by`, `max_members` (2–6 contributors), `status` (`OPEN`, `FULL`, `LOCKED`, `DISBANDED`), `visibility` (`PUBLIC`, `PRIVATE`, `INVITE_ONLY`), `skills_needed` (JSON/Array).
* **Team Ownership & Multiplicity Constraints**:
  - Single team ownership per challenge: A user cannot create or own more than one active (`OPEN`, `FULL`, `LOCKED`) team per challenge.
  - Single active team participation per challenge: A user cannot be an `ACTIVE` member of more than one team per challenge.
* **Mentor Capacity Governance**:
  - Mentors (`role = 'MENTOR'`) are decoupled from student contributor capacity (`max_members`).
  - Teams permit a strict maximum of **2 active mentors**.
* **Team Membership & Recruitment Management (`team_members` table)**:
  - Membership records with role designations: `LEADER`, `CO_LEADER`, `MEMBER`, `MENTOR`.
  - Membership status lifecycle: `ACTIVE`, `INVITED`, `REQUESTED`, `WITHDRAWN`, `EXPIRED`, `REJECTED`, `LEFT`, `REMOVED`.
  - 14-day automatic expiration on outbound invitations (`expires_at = created_at + 14 days`).
  - Applicant withdrawal of inbound join requests (`REQUESTED -> WITHDRAWN`).
* **Cross-Channel Membership Integrity**:
  - Mutual exclusion across active, invited, and requested states to prevent duplicate or conflicting pipeline states.
* **Disbanded Team State Protection**:
  - Terminal protection of `DISBANDED` teams against any subsequent mutations, invitations, join requests, or governance actions.
* **Team Discovery & Search API**:
  - Filterable team directory by challenge ID, required skills, status (`OPEN`), district/state, and search keywords.
* **Audit Trail Integration**:
  - Emitting structured audit logs for all 16 team and membership lifecycle actions.
* **Frontend Collaboration Workspace (`features/team`)**:
  - Team Creation Wizard (`/teams/create`).
  - Team Discovery & Search Explorer (`/teams`).
  - Team Workspace / Profile Page (`/teams/[id]`).
  - My Teams Dashboard (`/teams/my-teams`).
  - Join Request & Invitation Management Modals.

### 2.2 Out-of-Scope (Strictly Prohibited in M3)

* ❌ **Project Submissions & Blueprints**: Innovation project proposals, prototype milestones, lab reports (Belongs to **M5: Innovation Project Lifecycle**).
* ❌ **Academic Department Verification / Grading**: Faculty formal grading, university credits, institutional approvals (Belongs to **M4/M5**).
* ❌ **AI Matching Algorithms**: Automated AI team recommendation engines or skill embeddings (Deferred to **M4** recommendation pipelines).
* ❌ **Industry CSR Sponsorship**: Direct corporate funding, grants, or equipment allocations (Belongs to **M6: Industry Partnership Network**).
* ❌ **Notification Dispatch Logic**: Direct transactional email/SMS/push delivery (M3 creates notification database queue entries only).
* ❌ **Leaderboards & Gamification**: Karma points, competitive rankings, badges, reward tokens.
* ❌ **Certificates & Credentialing**: Digital credential generation or completion certificates.

---

## 3. User Personas & User Stories

### 3.1 Target Personas
1. **Student Team Creator (Team Leader)**: A student wanting to solve a verified community challenge who forms a team, specifies required skills, and recruits peers.
2. **Student Collaborator (Applicant / Member)**: A student seeking impactful challenges matching their domain expertise (e.g., frontend, AI, CAD).
3. **Faculty / Industry Mentor (Advisor)**: An academic professor or industry professional attached to provide technical guidance without taking operational contributor seats.
4. **Platform Administrator**: System supervisor ensuring compliance, team integrity, and resolving disputes.

### 3.2 User Stories

| ID | As a... | I want to... | So that... |
| :--- | :--- | :--- | :--- |
| **US-M3-01** | Student | Create a new team linked to a verified published challenge | I can assemble a focused group to build a societal solution. |
| **US-M3-02** | Team Leader | Specify required skills, contributor capacity (2–6), and invite up to 2 mentors | Relevant students and mentors can discover and join our team. |
| **US-M3-03** | Student | Search and filter open teams by challenge or skills | I can find teams that match my strengths and interests. |
| **US-M3-04** | Student | Submit a join request with a statement of interest, or withdraw it if pending | The team leader can evaluate my candidacy, or I can retract my application. |
| **US-M3-05** | Team Leader | Proactively invite specific students or mentors with a 14-day validity | I can recruit talented peers and advisors directly onto our roster. |
| **US-M3-06** | Student / Mentor | Accept or decline unexpired team invitations | I control which collaborative teams I commit to before the invite expires. |
| **US-M3-07** | Team Leader | Review, accept, or reject incoming join requests | I can curate a balanced and capable team. |
| **US-M3-08** | Team Member | Leave a team voluntarily | I can withdraw if my availability or priorities change. |
| **US-M3-09** | Team Leader | Remove an inactive member or promote to Co-Leader | I can effectively administer and delegate team operations. |
| **US-M3-10** | Team Leader | Transfer leadership or disband the team | Team governance is cleanly transferred or closed down. |

---

## 4. Functional Requirements

### 4.1 Team Creation & Profile Management
* **FR-M3-01 (Team Creation & Mandatory Challenge Anchor)**:
  - Any authenticated `student` or `admin` can create a team.
  - Inputs: `name` (3–100 chars, trimmed), `description` (20–1000 chars), `challenge_id` (**MANDATORY NOT NULL UUID** FK $\rightarrow$ `challenges.id`), `max_members` (integer between 2 and 6, default 5), `visibility` (`PUBLIC`, `PRIVATE`, `INVITE_ONLY`), `skills_needed` (list of strings, max 10 skills).
  - Validation:
    - `challenge_id` must reference an existing, non-deleted challenge.
    - User must not already own an active team (`OPEN`, `FULL`, `LOCKED`) on this challenge (`FR-M3-15`).
    - User must not already be an `ACTIVE` member of any team on this challenge (`FR-M3-14`).
  - Creator is automatically assigned as `ACTIVE` member with `LEADER` role.
  - Team initial status is `OPEN`.
* **FR-M3-02 (Team Editing)**:
  - Only `LEADER` and `CO_LEADER` (or `admin`) can update team metadata (`name`, `description`, `skills_needed`, `visibility`, `max_members`).
  - Cannot decrease `max_members` below current active student contributor count.
  - Disbanded teams cannot be edited (`FR-M3-16`).
* **FR-M3-03 (Team Disbandment & Soft Delete)**:
  - Only `LEADER` (or `admin`) can disband a team.
  - Disbandment sets team status to `DISBANDED` (Terminal state) and marks all active memberships as `LEFT` with structured audit log.
  - Once disbanded, all subsequent team modifications and recruitment actions are permanently blocked.

### 4.2 Team Discovery & Search
* **FR-M3-04 (Public & Filtered Catalog)**:
  - `GET /api/v1/teams`: Lists teams where `visibility = 'PUBLIC'` and `is_deleted = false` and `status != 'DISBANDED'`.
  - Filters: `challenge_id`, `status` (`OPEN`, `FULL`, `LOCKED`), `skill` (array overlap), `search` (case-insensitive substring match on name/description), `page`, `page_size` (default 20, max 100).
  - Response includes team metadata, active contributor count, active mentor count, vacancy count, and leader profile brief.
* **FR-M3-05 (My Teams)**:
  - `GET /api/v1/teams/my-teams`: Returns all teams where the authenticated user is currently an `ACTIVE`, `INVITED`, or `REQUESTED` member.

### 4.3 Recruitment & Inbound Join Requests
* **FR-M3-06 (Create Join Request & Membership Integrity)**:
  - Authenticated user can request to join an `OPEN` team with `PUBLIC` visibility.
  - Input: Optional `message` (max 500 chars).
  - Validations (HTTP 409 Conflict if violated):
    - Team must be in `OPEN` status with active student contributors $< \text{max\_members}$.
    - Team must NOT be in `DISBANDED` status (HTTP 400 Invalid Team State).
    - User must not already be an `ACTIVE` member of this team.
    - User must not already have a pending `REQUESTED` join request for this team.
    - User must not already have a pending `INVITED` invitation for this team.
    - User must not already be an `ACTIVE` member of any other team linked to the same `challenge_id`.
  - Creates record in `team_members` with status `REQUESTED` and role `MEMBER`.
* **FR-M3-07 (Review Join Request)**:
  - `LEADER`, `CO_LEADER`, or `admin` can list pending join requests (`GET /api/v1/teams/{id}/join-requests`).
  - Action: **Accept** or **Reject** (`POST /api/v1/teams/{id}/join-requests/{member_id}/action`).
  - On **Accept**: Checks contributor capacity atomically. If team reaches capacity ($N_{\text{contributors}} == \text{max\_members}$), updates team status to `FULL` and auto-rejects remaining pending contributor requests. Status transitions to `ACTIVE`.
  - On **Reject**: Status transitions to `REJECTED` (Terminal).
* **FR-M3-08 (Join Request Withdrawal)**:
  - The applicant who submitted a join request may voluntarily withdraw it while in `REQUESTED` state (`POST /api/v1/teams/join-requests/{request_id}/withdraw`).
  - State transition: `REQUESTED -> WITHDRAWN` (Terminal).
  - Validation:
    - Only the original applicant (or `admin`) can withdraw.
    - Requests already in `ACTIVE`, `REJECTED`, or `WITHDRAWN` states cannot be withdrawn (HTTP 400/409).
  - Emits `JOIN_REQUEST_WITHDRAWN` audit event.

### 4.4 Outbound Invitations & Expiration
* **FR-M3-09 (Send Invitation & Membership Integrity)**:
  - `LEADER`, `CO_LEADER`, or `admin` can invite a user by `user_id` with an assigned role (`MEMBER` or `MENTOR`).
  - Automatic Expiration: Sets `expires_at = created_at + 14 days`.
  - Validations (HTTP 409 Conflict if violated):
    - Team must NOT be `DISBANDED` (HTTP 400 Invalid Team State) or `LOCKED`.
    - If role is `MEMBER`: active contributor count must be $< \text{max\_members}$.
    - If role is `MENTOR`: active mentor count must be $< 2$ (only `faculty` or `industry` users).
    - User must not already be an `ACTIVE` member in this team.
    - User must not already have a pending `INVITED` invitation in this team.
    - User must not already have a pending `REQUESTED` join request in this team.
    - User must not already be an `ACTIVE` member of any team linked to the same `challenge_id`.
  - Creates record in `team_members` with status `INVITED`.
* **FR-M3-10 (Respond to Invitation & Expiry Enforcement)**:
  - Authenticated invitee can view their received unexpired invitations (`GET /api/v1/teams/invitations/me`).
  - Invitee can **Accept** or **Decline** (`POST /api/v1/teams/invitations/{member_id}/action`).
  - Expiry Check: If `now() > expires_at`, invitation is marked `EXPIRED`, request is rejected with `HTTP 409 Conflict` (Code: `INVITATION_EXPIRED`), and `INVITATION_EXPIRED` audit event is emitted.
  - On **Accept**: Enforces capacity atomically (contributor capacity for `MEMBER`, max 2 for `MENTOR`). If valid, transitions status to `ACTIVE` and records `joined_at = now()`.
  - On **Decline**: Transitions status to `LEFT`.

### 4.5 Governance, Capacity, and Disbandment Rules
* **FR-M3-11 (Mentor Capacity Governance)**:
  - Active student contributors ($2 \le \text{max\_members} \le 6$) comprise roles `LEADER`, `CO_LEADER`, and `MEMBER`.
  - Mentors (`role = 'MENTOR'`) are governed by a strict maximum of **2 active mentors per team**.
  - Mentors do not consume student contributor slots.
  - Attempting to accept or activate a 3rd mentor returns `HTTP 409 Conflict` (Code: `MENTOR_CAPACITY_EXCEEDED`).
* **FR-M3-12 (Role Promotion & Demotion)**:
  - `LEADER` can promote an active `MEMBER` to `CO_LEADER` or demote `CO_LEADER` to `MEMBER`.
  - Maximum of 2 `CO_LEADER`s allowed per team.
* **FR-M3-13 (Member Exit & Removal)**:
  - Any active member (except the sole `LEADER`) can voluntarily leave (`POST /api/v1/teams/{id}/leave`).
  - `LEADER` can remove any `MEMBER`, `CO_LEADER`, or `MENTOR` (`DELETE /api/v1/teams/{id}/members/{user_id}`).
  - `CO_LEADER` can remove regular `MEMBER`s.
* **FR-M3-14 (Leadership Transfer)**:
  - `LEADER` can transfer primary leadership to any `ACTIVE` `MEMBER` or `CO_LEADER` (`POST /api/v1/teams/{id}/transfer-leadership`).
  - Former leader becomes `CO_LEADER` or `MEMBER`.
* **FR-M3-15 (Single Team Ownership Per Challenge)**:
  - A user cannot create or own more than one active team (`OPEN`, `FULL`, `LOCKED`) associated with the same `challenge_id`.
  - If user already owns an active team for the challenge, team creation is rejected with `HTTP 409 Conflict` (Code: `DUPLICATE_ACTIVE_TEAM_OWNERSHIP`).
  - `DISBANDED` teams do not restrict creating a new team.
* **FR-M3-16 (Disbanded Team Protection)**:
  - Once a team is set to `DISBANDED`, all mutating actions (edit settings, send invitations, submit join requests, accept invitations, accept join requests, promote members, transfer leadership) are forbidden.
  - Any attempt returns `HTTP 400 Bad Request` (Code: `INVALID_TEAM_STATE`).

---

## 5. Non-Functional Requirements

| Requirement | Metric / Specification |
| :--- | :--- |
| **Response Latency** | 95% of team catalog and detail queries $\le 100\text{ ms}$; join/invite mutations $\le 200\text{ ms}$. |
| **Concurrency & Race Safety**| Zero capacity oversubscription during concurrent request/invite acceptance (enforced via row locks / atomic transactions). |
| **Data Integrity** | Foreign key constraints on `users` and `challenges` (`challenge_id NOT NULL`); soft deletion with cascade isolation. |
| **Audit Compliance** | 100% of team creations, membership transitions, withdrawals, expirations, role changes, and disbandments logged to `audit_logs` (16 events). |
| **Test Coverage** | Minimum 90% test coverage across schemas, state transitions, auth matrix, concurrency, and API layers. |

---

## 6. Acceptance Criteria (Definition of Done)

1. **Mandatory Challenge Linkage**: Every team is strictly linked to an existing challenge (`challenge_id NOT NULL`).
2. **Schema & Migration**: Alembic migration (`003_team_collaboration_schema.py`) applies hardened tables, check constraints, and partial unique indexes cleanly.
3. **Deterministic State Machines**: Verified handling for Teams (`OPEN`, `FULL`, `LOCKED`, `DISBANDED`) and Memberships (`INVITED`, `REQUESTED`, `WITHDRAWN`, `EXPIRED`, `ACTIVE`, `REJECTED`, `LEFT`, `REMOVED`).
4. **Capacity Governance**: Hard caps enforced for 2–6 student contributors and max 2 mentors.
5. **Ownership & Participation Guarantees**: Single active team membership per challenge and single team ownership per challenge enforced at DB and service layers.
6. **14-Day Expiration & Withdrawal**: Verified automatic expiration of invites and successful applicant withdrawal of join requests.
7. **Disbanded Team Lockdown**: 100% rejection of post-disbandment mutation attempts with HTTP 400.
8. **Audit Trail Completeness**: 16 distinct audit events emitted with zero gaps.
9. **No Regressions**: M1 and M2 test suites maintain 100% pass rate.
