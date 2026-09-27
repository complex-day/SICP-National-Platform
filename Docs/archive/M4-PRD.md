# Product Requirements Document (PRD) — Module 4: Academic Collaboration Hub

**Document Version:** 1.1 (Hardened Specification)  
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

## 1. Executive Summary & Problem Definition

### 1.1 Context & Background
While citizens report verified societal challenges (via Module 2) and students form collaborative innovation cohorts (via Module 3), academic institutions—universities, research departments, and faculty mentors—possess the specialized domain expertise, lab infrastructure, and accredited guidance necessary to translate ideas into rigorous, deployable solutions.

Currently, academic institutions lack a structured, verified gateway to discover community problems matching their research focus, onboard departments, manage faculty mentorship workloads, and officially adopt societal challenges.

**Module 4 (Academic Collaboration Hub)** bridges community needs and academic capacity. It provides a formal institutional governance framework for universities to onboard, structure departments, verify faculty affiliations, receive AI-matched challenge recommendations, and route community challenges to faculty mentors and student teams.

### 1.2 Module Objectives
1. **Institutional Onboarding & Verification**: Provide a standardized verification workflow for universities and educational institutions.
2. **Tenant-Scoped University Administration**: Model university administrative privileges (`university_administrators`) without altering frozen M1 global roles.
3. **Departmental Hierarchy & HOD Governance**: Model academic departments, specialization tags, and enforce strict Head of Department (HOD) integrity (must be active faculty in the same department).
4. **Faculty Affiliation Lifecycle**: Enable faculty members to establish, verify, and maintain official affiliations with accredited departments (strictly enforcing 1 active affiliation per faculty).
5. **Explainable Multi-Factor Challenge Matching**: Implement the 5-factor AI matching formula to compute transparent compatibility scores between verified challenges and universities/faculty.
6. **Academic Problem Intake & Team Allocation**: Support competitive/collaborative multi-university challenge claiming, linking institutional intakes to one or more M3 student teams and faculty mentors via `intake_team_allocations`.
7. **Comprehensive Audit Trail**: Emit immutable audit logs for all 20 institutional registration, verification, affiliation, intake, and assignment mutations.

---

## 2. Target Stakeholders & Role Matrix

| Stakeholder | Platform Role (`UserRole`) | Scope of Authority | Module 4 Capabilities |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin` | Global Platform | Verify/reject universities, suspend institutions, manual routing override, view global analytics. |
| **University Administrator** | `faculty` or `admin` | Institutional (`university_administrators`) | Manage institution profile, create/manage departments, assign HODs, verify faculty affiliation requests, claim/assign challenges. |
| **Head of Department (HOD)** | `faculty` | Departmental | Review department challenge claims, allocate faculty mentors and student teams within department. |
| **Faculty Member / Mentor** | `faculty` | Individual / Team | Request department affiliation, view matched challenges, accept mentorship allocations (max 2 active teams per M3 rule). |
| **Student Innovator** | `student` | Team | View university-affiliated challenges, collaborate under assigned faculty mentors. |
| **Citizen Reporter** | `citizen` | Challenge Creator | View academic adoption status of submitted challenges (`ROUTED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `ASSIGNED`). |

---

## 3. Functional Requirements (FR)

### 3.1 University Onboarding & Administration
* **FR-M4-01 (University Registration)**: A faculty member or platform admin can register a university with legal name, unique university code, district, state, contact email, website, and NAAC/NIRF accreditation details. Initial status is `PENDING_VERIFICATION`.
* **FR-M4-02 (Institutional Verification)**: Only Platform Admins (`admin`) can verify (`VERIFIED`), reject (`REJECTED`), or suspend (`SUSPENDED`) universities.
* **FR-M4-03 (Tenant-Scoped University Admin)**: The registrant is automatically designated the primary University Administrator. Additional administrators (`role = 'faculty'`) can be assigned via `university_administrators` table without modifying global M1 roles.
* **FR-M4-04 (Domain Expertise Profiles)**: Universities can declare up to 15 domain expertise tags (e.g., `Water Purification`, `Agro-Tech`, `Renewable Energy`, `Telemedicine`, `IoT Infrastructure`).

### 3.2 Department Management & HOD Governance
* **FR-M4-05 (Department Structure)**: Verified universities can create and manage hierarchical academic departments with unique codes (e.g., `CSE`, `MECH`, `CIVIL`, `BIOTECH`) and specialization tags.
* **FR-M4-06 (HOD Appointment & Integrity)**: A department's Head of Department (`head_of_department_id`) MUST be a user with `role = 'faculty'`, who holds an `ACTIVE` affiliation in that exact department and university. A faculty member can only be HOD of at most one department simultaneously.

### 3.3 Faculty Affiliation Lifecycle
* **FR-M4-07 (Affiliation Request)**: Authenticated faculty users can request official affiliation with a specific university department. Initial status is `PENDING`.
* **FR-M4-08 (Affiliation Verification)**: University Admins review and approve (`ACTIVE`) or reject (`REJECTED`) pending faculty affiliation requests.
* **FR-M4-09 (Single Active Affiliation Uniqueness)**: A faculty member may only hold one primary `ACTIVE` affiliation across the entire platform. Attempting to activate a second affiliation without revoking the previous one returns HTTP 409 `DUPLICATE_ACTIVE_AFFILIATION`.

### 3.4 Multi-Factor Challenge Matching Engine
* **FR-M4-10 (Mathematical Matching Formula)**: Matching scores between Challenge $C$ and University $U$ are computed deterministically as:
  $$\text{Match Score} = 0.40 \times S_{\text{domain}} + 0.25 \times S_{\text{faculty}} + 0.15 \times S_{\text{proximity}} + 0.10 \times S_{\text{track\_record}} + 0.10 \times S_{\text{student\_cohort}}$$
  - $S_{\text{domain}}$ (40%): Overlap between challenge category/skills and university/department declared expertise tags.
  - $S_{\text{faculty}}$ (25%): Availability ratio of qualified faculty mentors with active mentoring slots $< 3$.
  - $S_{\text{proximity}}$ (15%): Deterministic geospatial proximity score ($100$ for same district / $\le 25\text{km}$, $75$ for same state / $\le 100\text{km}$, decaying by distance).
  - $S_{\text{track\_record}}$ (10%): Historical challenge completion and verification rate.
  - $S_{\text{student\_cohort}}$ (10%): Department active student enrollment and lab facilities.
* **FR-M4-11 (Explainability Compliance)**: In strict compliance with `AGENTS.md` Rule 6, every matching response must return a structured breakdown payload containing individual sub-scores and human-readable explanation strings.

### 3.5 Academic Challenge Intake, Team Allocation & Mentoring Governance
* **FR-M4-12 (Multi-University Claiming Policy)**: Multiple universities may independently claim (`ACCEPTED`) the same published challenge from Module 2 to propose parallel/competing innovations. A university may only claim a specific challenge once (`academic_intakes` uniqueness on `(university_id, challenge_id)` where `status != 'DECLINED'`).
* **FR-M4-13 (Intake State Lifecycle & Challenge Resolution Governance)**:
  $$\text{ROUTED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{COMPLETED}$$
  - An individual university can mark its own intake as `COMPLETED` upon delivering its prototype/solution.
  - The global challenge status in M2 (`challenges.status`) is closed/resolved exclusively by **Platform Admin (`admin`) or Government Authority (`government`)** in M7 after multi-stakeholder outcome verification.
* **FR-M4-14 (Faculty Mentoring Capacity Rules)**:
  - **Platform-Wide Limit**: A faculty member may actively mentor at most **3 active teams platform-wide** across all institutions and challenges.
  - **Per-Challenge Limit**: A faculty member can mentor at most **1 team per specific challenge** (preventing conflict of interest).
  - **Per-Team Limit**: Each M3 team permits at most **2 active mentors** (enforced by M3 capacity rule).
* **FR-M4-15 (Multi-Team Allocation)**: A university intake can allocate one or more student teams (from Module 3) via `intake_team_allocations`. Each allocation binds a specific M3 team (`team.challenge_id == intake.challenge_id`), a department, and an affiliated faculty mentor.

### 3.6 Institutional Safeguards & Soft-Delete Governance
* **FR-M4-16 (University Suspension Safeguards)**: Suspending a university blocks new department creation, new affiliations, and new challenge claims; existing in-progress intakes continue under observation.
* **FR-M4-17 (Decommissioning & Deletion Safeguards)**: Soft-deleting a university is strictly blocked (HTTP 409 `ACTIVE_ACADEMIC_BINDINGS_EXIST`) if active affiliations or active challenge intakes exist. All intakes must be `DECLINED` or `COMPLETED` and affiliations `REVOKED` prior to deletion.
* **FR-M4-18 (Soft-Delete Consistency & Partial Indexes)**: All entities implement `is_deleted = true` soft deletion. Uniqueness constraints are enforced via partial unique indexes (`WHERE is_deleted = false`).

---

## 5. Audit Requirements (20 Actions)
Module 4 emits structured audit logs across all 20 academic lifecycle mutations:
1. `UNIVERSITY_REGISTERED`
2. `UNIVERSITY_VERIFIED`
3. `UNIVERSITY_REJECTED`
4. `UNIVERSITY_SUSPENDED`
5. `UNIVERSITY_UPDATED`
6. `UNIVERSITY_ADMIN_ASSIGNED`
7. `UNIVERSITY_ADMIN_REMOVED`
8. `DEPARTMENT_CREATED`
9. `DEPARTMENT_UPDATED`
10. `DEPARTMENT_DELETED`
11. `HOD_ASSIGNED`
12. `FACULTY_AFFILIATION_REQUESTED`
13. `FACULTY_AFFILIATION_APPROVED`
14. `FACULTY_AFFILIATION_REJECTED`
15. `FACULTY_AFFILIATION_REVOKED`
16. `CHALLENGE_ROUTED_TO_UNIVERSITY`
17. `CHALLENGE_CLAIMED_BY_UNIVERSITY`
18. `CHALLENGE_DECLINED_BY_UNIVERSITY`
19. `TEAM_ALLOCATED_TO_CHALLENGE`
20. `FACULTY_MENTOR_ASSIGNED_TO_TEAM`

---

## 6. Acceptance Criteria

- [ ] Universities register with status `PENDING_VERIFICATION` and undergo Platform Admin verification.
- [ ] University Administrators manage institutions without requiring new M1 global roles.
- [ ] Departments enforce unique names/codes per university and validate that HOD is an active affiliated faculty member.
- [ ] Faculty members can request affiliation; single active affiliation uniqueness is enforced platform-wide.
- [ ] 5-factor matching engine computes deterministic scores with full explainability breakdown.
- [ ] Multi-university challenge intake supported, with 1:N team & mentor allocations via `intake_team_allocations`.
- [ ] All 20 audit events emitted and verified in persistent storage.
- [ ] Zero regressions across M1 (IAM), M2 (Challenges), and M3 (Teams) suites.
