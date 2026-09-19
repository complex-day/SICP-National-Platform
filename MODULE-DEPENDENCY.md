# SICP Module Dependency & Data Flow Map

**Document Version:** 6.0 (Final Platform Baseline Lock)  
**Project:** Societal Innovation Collaboration Platform (SICP)  
**Architecture Style:** Modular Monolith $\rightarrow$ Event-Driven Microservices Ready  
**Platform Release Baseline:** `v7.0.0-platform-freeze`  
**All Modules Status:** 🔒 **ALL MODULES 1–7 FULLY LOCKED & FROZEN**  

---

## 1. High-Level Dependency Graph

```mermaid
graph TD
    M1["<b>M1: Identity & Access Management (IAM) [LOCKED 🔒]</b><br/>Users, Roles, Profiles, JWT, RBAC, Audit Logs"]
    
    M2["<b>M2: Citizen Challenge Management [LOCKED 🔒]</b><br/>Problem Submission, GPS Location, Media Attachments, Tracking"]
    M1 --> M2

    M3["<b>M3: Team Formation & Collaboration [LOCKED 🔒]</b><br/>Student Teams, Roster Governance, Invitations, Join Requests"]
    M1 --> M3
    M2 --> M3

    M4["<b>M4: Academic Collaboration Hub [LOCKED 🔒]</b><br/>Universities, Departments, Faculty Mentors, AI Matching Engine, Intakes"]
    M1 --> M4
    M2 --> M4
    M3 --> M4

    M5["<b>M5: Innovation Project Lifecycle [LOCKED 🔒]</b><br/>Projects, Milestones, Deliverables, Code Repos, Sprint Tracking"]
    M1 --> M5
    M2 --> M5
    M3 --> M5
    M4 --> M5

    M6["<b>M6: Industry Partnership Network [LOCKED 🔒]</b><br/>CSR Sponsorship, Corporate Mentorship, Equipment Manifests, Field Pilots"]
    M1 --> M6
    M4 --> M6
    M5 --> M6

    M7["<b>M7: Governance & Impact Intelligence [LOCKED 🔒]</b><br/>District Analytics, SROI Engine, SRI, UPI, PSI, Open Data Portal"]
    M1 --> M7
    M2 --> M7
    M3 --> M7
    M4 --> M7
    M5 --> M7
    M6 --> M7

    classDef locked fill:#0f382c,stroke:#10b981,stroke-width:2px,color:#fff;
    class M1,M2,M3,M4,M5,M6,M7 locked;
```

---

## 2. Module Specifications & Input/Output Matrix

### Module 1: Identity & Access Management (IAM)
- **Status:** 🔒 **LOCKED & COMPLETE** (`v1.0.0-m1-lock`)
- **Dependencies:** None (Foundational Layer).
- **Core Entities Provided:**
  - `users`: Core identity, Argon2id credentials, role enums (`citizen`, `student`, `faculty`, `industry`, `government`, `admin`), account status (`ACTIVE`, `PENDING`, `SUSPENDED`, `BANNED`), trust score.
  - `audit_logs`: Immutable activity tracking for all platform mutations.
  - `notifications`: System notification queue.
  - `citizens`, `faculty`, `students`, `industries`: Role profile extensions.
- **Contracts Exported:**
  - JWT Tokens: 15-minute access token (`sub`, `role`, `email`, `name`) & 7-day refresh token.
  - RBAC Guard: `require_roles(["role1", ...])` with super admin bypass.
  - Standard Response Envelopes: `{ success: true, data: {} }` and `{ success: false, error: {} }`.
  - Shared Constants: `UserRole`, `UserStatus`, `AuditAction`, `NotificationType`.

---

### Module 2: Citizen Challenge Management
- **Status:** 🔒 **LOCKED & COMPLETE** (`v2.0.0-m2-lock`)
- **Dependencies:** **M1 (IAM)**
- **Inputs Consumed from M1:**
  - Authenticated citizen UUID (`current_user.id`).
  - `citizens` table foreign key target (`challenges.citizen_id -> citizens.user_id`).
  - RBAC guard: `require_roles(["citizen", "admin"])`.
  - `AuditRepository.create_log` for audit event generation (`CHALLENGE_CREATED`, etc.).
- **Core Entities Created:**
  - `challenges`: Title, description, category, affected population, latitude/longitude, district, state, workflow status (`draft`, `submitted`, `under_review`, `approved`, `published`, `in_progress`, `resolved`, `closed`), optimistic locking version.
  - `challenge_assets`: Storage URLs, media types (`image`, `video`, `document`), upload timestamps.
- **Events Published:**
  - `CHALLENGE_CREATED`, `CHALLENGE_SUBMITTED`, `CHALLENGE_APPROVED`, `CHALLENGE_PUBLISHED`, `CHALLENGE_ARCHIVED`.

---

### Module 3: Team Formation & Collaboration
- **Status:** 🔒 **LOCKED & COMPLETE** (`v3.0.0-m3-lock`)
- **Dependencies:** **M1 (IAM) + M2 (Challenge Management)**
- **Inputs Consumed:**
  - `challenges.id` (strictly anchors teams to published challenges).
  - Authenticated students, faculty, and industry mentors from M1.
- **Core Entities Created:**
  - `teams`: Name, description, challenge linkage, capacity limits ($2 \le \text{max\_members} \le 6$), status (`OPEN`, `FULL`, `LOCKED`, `DISBANDED`), visibility (`PUBLIC`, `PRIVATE`, `INVITE_ONLY`), skills needed.
  - `team_members`: Team membership roster, roles (`LEADER`, `CO_LEADER`, `MEMBER`, `MENTOR`), statuses (`ACTIVE`, `INVITED`, `REQUESTED`, `WITHDRAWN`, `EXPIRED`, `REJECTED`, `LEFT`, `REMOVED`), 14-day invitation expiry.
- **Governance Rules Enforced:**
  - Single active team ownership per challenge (FR-M3-15).
  - Single active challenge participation per contributor (FR-M3-14).
  - Mentor capacity limit (maximum 2 active mentors per team).
- **Events Published:**
  - 17 team lifecycle and membership audit actions.

---

### Module 4: Academic Collaboration Hub
- **Status:** 🔒 **LOCKED & COMPLETE** (`v4.0.0-m4-lock`)
- **Dependencies:** **M1 (IAM) + M2 (Challenge Management) + M3 (Teams)**
- **Inputs Consumed:**
  - Published societal challenges from **M2**.
  - Student teams from **M3**.
  - Faculty and student user profiles from **M1**.
- **Core Entities Created:**
  - `universities`: Legal name, code, district, state, domain expertise tags, verification status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`).
  - `university_administrators`: Tenant-scoped institutional administration without modifying global user roles.
  - `departments`: University department units, specializations, Head of Department assignment.
  - `faculty_affiliations`: Faculty primary institutional bindings with single active primary affiliation constraint.
  - `academic_intakes`: University challenge claims and routing statuses (`PENDING_REVIEW`, `ACCEPTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`).
  - `intake_team_allocations`: Binding of M3 student teams and faculty mentors to an academic intake.
- **Engines & Governance Rules:**
  - Multi-factor deterministic matching formula ($40\%$ domain expertise, $25\%$ faculty availability, $15\%$ proximity, $10\%$ track record, $10\%$ cohort capacity).
  - Explainable recommendation output per `AGENTS.md` Rule 6.
  - Faculty mentoring capacity limits (maximum 3 platform-wide, maximum 1 per specific challenge).
  - Strict Head of Department validation (must be active faculty in the same department and university).
- **Events Published:**
  - 20 academic audit actions (`UNIVERSITY_REGISTERED`, `FACULTY_AFFILIATION_APPROVED`, `CHALLENGE_CLAIMED_BY_UNIVERSITY`, `TEAM_ALLOCATED_TO_CHALLENGE`, `FACULTY_MENTOR_ASSIGNED_TO_TEAM`, etc.).

---

### Module 5: Innovation Project Lifecycle
- **Status:** 🔒 **LOCKED & COMPLETE** (`v5.0.0-m5-lock`)
- **Dependencies:** **M1 (IAM) + M2 (Challenge Management) + M3 (Teams) + M4 (Academic Hub)**
- **Inputs Consumed:**
  - Bound `intake_team_allocations` from **M4** linking challenge, student team, university department, and faculty mentor.
  - Team roster and leader from **M3**.
  - Verified challenge context and population metrics from **M2**.
- **Core Entities Created:**
  - `projects`: Title, description, status (`PROPOSAL`, `ACTIVE`, `PROTOTYPE`, `PILOT`, `REVIEW_READY`, `COMPLETED`, `SUSPENDED`, `TERMINATED`, `ABANDONED`), stage, project outcome (`SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`, `ABANDONED`), progress percentage, repository links.
  - `project_milestones`: Title, description, sequence, weight (sum=100), due date, acceptance criteria, review status, faculty mentor sign-off.
  - `project_deliverables`: Multi-type artifacts, code repositories, test reports, SHA-256 hashes, version chains.
  - `project_reviews`: Rubric scores, decisions (`APPROVED`, `CHANGES_REQUESTED`, `REJECTED`), feedback, immutable ledger.
  - `project_updates`: Sprint progress telemetry and blocker notes.
- **Events Published:**
  - 15 project lifecycle audit actions (`PROJECT_CREATED`, `PROJECT_ROADMAP_ACTIVATED`, `MILESTONE_APPROVED`, `PROJECT_COMPLETED`, etc.).

---

### Module 6: Industry Partnership Network
- **Status:** 🔒 **LOCKED & COMPLETE** (`v6.0.0-m6-lock`)
- **Dependencies:** **M1 (IAM) + M4 (Academic Hub) + M5 (Project Lifecycle)**
- **Inputs Consumed:**
  - `industry_partners` profile table from **M1/M6**.
  - Active innovation projects needing funding/mentorship from **M5**.
- **Core Entities Created:**
  - `industry_partners`: Company name, domain, CIN number, CSR budget, point-of-contact, accreditation status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`).
  - `partnership_agreements`: Partner ID, Project ID, partnership type (`FUNDING`, `MENTORSHIP`, `EQUIPMENT`, `PILOT_DEPLOYMENT`, `CSR_GRANT`), status, promised/released funds, promised/completed hours, equipment manifest, pilot evidence url.
  - `sponsorship_disbursements`: Agreement ID, Milestone ID, tranche number, amount, status, transaction reference.
  - `mentorship_sessions`: Agreement ID, Mentor ID, session date, duration hours, topic, summary, attendance, rating feedback.
- **Services Built:**
  - Partner verification and accreditation lifecycle.
  - Multi-sponsor agreement creation, bilateral approvals, and withdrawal gap processing.
  - Milestone-gated disbursement scheduling and releases.
  - Corporate mentorship logging with decoupled rating analytics.
  - Equipment delivery manifest tracking and pilot deployment evidence verification.
  - Dynamic query-time coverage % and funding gap computation.
- **Events Published:**
  - 16 partnership lifecycle audit actions (`INDUSTRY_PARTNER_REGISTERED`, `PARTNERSHIP_PROPOSED`, `DISBURSEMENT_RELEASED`, `MENTORSHIP_SESSION_LOGGED`, etc.).

---

### Module 7: Governance & Impact Intelligence
- **Status:** 🔒 **LOCKED & COMPLETE** (`v7.0.0-m7-lock`)
- **Dependencies:** **All Previous Modules (M1 $\rightarrow$ M6)**
- **Inputs Consumed:**
  - Challenges and district metrics from **M2**.
  - Student and team collaboration metrics from **M3**.
  - University intake and faculty mentorship analytics from **M4**.
  - Project completion and pilot milestones from **M5**.
  - Industry CSR funding figures, corporate mentorship, equipment, and pilot deployments from **M6**.
- **Logical Read Models Created:**
  - `DistrictImpactSnapshot`: Aggregated district KPIs, problem resolution rates, team density, local CSR funding, and DIRI scores.
  - `UniversityPerformanceSnapshot`: Institutional research translation benchmarks, active faculty mentors, and UPI rankings.
  - `SponsorReliabilitySnapshot`: Corporate CSR fulfillment rates, tranche timeliness, retention scores, and SRI indices.
  - `ProjectImpactReport`: Societal valuation, Net Present Value (NPV), proxy indicators, and SROI ratios.
- **Calculation Engines & Frameworks:**
  - SROI Calculation Engine: International standard SROI framework with NPV discounting.
  - Sponsor Reliability Index (SRI): Algorithmic $0-100$ corporate evaluation scorecard.
  - University Participation Index (UPI): Multi-factor $0-100$ academic benchmark for NAAC/NIRF reporting.
  - Project Success Index (PSI): Multi-indicator $0-100$ project execution health benchmark.
  - CSR Capital Utilization Suite: Committed, Approved, Released, Utilized breakdown and Funding Efficiency Ratio.
  - Standard Audit-Event Ingestion Pipeline: Versioned, idempotent cross-module telemetry.
- **Services Specified:**
  - Government Analytics Dashboard with District & State Comparative Heatmaps.
  - CSR Compliance & MCA Section 135 Export Packages.
  - University Institutional Research Translation Evidence Packages (NAAC/NIRF).
  - Cryptographic Public Open Data Transparency Portal (PII Masked, SHA-256 Digest).

---

## 3. Module Lock Registry

| Module | Title | Release Tag | Status | Test Suite |
| :--- | :--- | :--- | :---: | :---: |
| **M1** | Identity & Access Management (IAM) | `v1.0.0-m1-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M2** | Citizen Challenge Management | `v2.0.0-m2-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M3** | Team Formation & Collaboration | `v3.0.0-m3-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M4** | Academic Collaboration Hub | `v4.0.0-m4-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M5** | Innovation Project Lifecycle | `v5.0.0-m5-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M6** | Industry Partnership Network | `v6.0.0-m6-lock` | 🔒 **LOCKED** | Passing (100%) |
| **M7** | Governance & Impact Intelligence | `v7.0.0-m7-lock` | 🔒 **LOCKED** | Specification Locked |

---

## 4. Platform Baseline Status

```text
============================================================
           SICP PLATFORM SPECIFICATION FREEZE
============================================================
  M1: LOCKED 🔒 (v1.0.0-m1-lock)
  M2: LOCKED 🔒 (v2.0.0-m2-lock)
  M3: LOCKED 🔒 (v3.0.0-m3-lock)
  M4: LOCKED 🔒 (v4.0.0-m4-lock)
  M5: LOCKED 🔒 (v5.0.0-m5-lock)
  M6: LOCKED 🔒 (v6.0.0-m6-lock)
  M7: LOCKED 🔒 (v7.0.0-m7-lock)
============================================================
  Cumulative Regression Baseline: 163 / 163 Tests PASSING
  Architecture Stability: 100% LOCKED
============================================================
```
