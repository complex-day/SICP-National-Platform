# Module 4: Academic Collaboration Hub — Engineering Handoff

**Module:** M4 Academic Collaboration Hub  
**Status:** 🔒 **LOCKED & HANDED OFF**  
**Release Tag:** `v4.0.0-m4-lock`  
**Date:** 2026-09-15  
**Upstream Modules:** M1 (IAM) [LOCKED 🔒], M2 (Challenges) [LOCKED 🔒], M3 (Teams) [LOCKED 🔒]  
**Downstream Target:** M5 (Innovation Project Lifecycle)

---

## 1. Executive Summary

Module 4 establishes the academic engine of SICP. It enables verified higher educational institutions to onboard, organize academic departments, affiliate faculty researchers, claim published societal challenges, run 5-factor AI matching, and allocate interdisciplinary student teams alongside qualified faculty mentors.

---

## 2. Database Tables Created

All models are defined in [`backend/app/models/academic.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/app/models/academic.py) with full Alembic migration in [`backend/alembic/versions/004_academic_collaboration_schema.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/alembic/versions/004_academic_collaboration_schema.py):

| Table Name | Primary Purpose | Key Fields | Foreign Keys / Constraints |
| :--- | :--- | :--- | :--- |
| `universities` | Accredited Higher Education Institutions | `id`, `name`, `code`, `district`, `state`, `status`, `domain_expertise`, `version` | Unique `code`, Unique `name`, Optimistic lock `version`, Soft-delete `is_deleted` |
| `university_administrators` | Tenant-scoped institutional administration without global role mutation | `id`, `university_id`, `user_id`, `is_primary`, `is_active` | FK $\rightarrow$ `universities.id`, FK $\rightarrow$ `users.id`, Unique `(university_id, user_id)` |
| `departments` | Academic units within a university | `id`, `university_id`, `name`, `code`, `head_of_department_id`, `specializations` | FK $\rightarrow$ `universities.id`, FK $\rightarrow$ `users.id`, Unique `(university_id, code)` |
| `faculty_affiliations` | Primary institutional binding of faculty members | `id`, `faculty_id`, `university_id`, `department_id`, `designation`, `status` | FK $\rightarrow$ `users.id`, FK $\rightarrow$ `universities.id`, FK $\rightarrow$ `departments.id`, Partial Unique on active affiliation |
| `academic_intakes` | Institutional claim and routing of societal challenges | `id`, `challenge_id`, `university_id`, `status`, `intake_type`, `match_score`, `version` | FK $\rightarrow$ `challenges.id`, FK $\rightarrow$ `universities.id`, Unique `(challenge_id, university_id)` |
| `intake_team_allocations` | Binding of M3 student teams and faculty mentors to an intake | `id`, `intake_id`, `team_id`, `department_id`, `faculty_mentor_id`, `status` | FK $\rightarrow$ `academic_intakes.id`, FK $\rightarrow$ `teams.id`, FK $\rightarrow$ `departments.id`, FK $\rightarrow$ `users.id` |

---

## 3. APIs Exposed (`/api/v1/academic`)

All endpoints are defined in [`backend/app/api/v1/endpoints/academic.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/app/api/v1/endpoints/academic.py):

| Method | Endpoint | Access Control | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/academic/universities` | `require_roles([FACULTY, ADMIN])` | Register a new university (starts in `PENDING_VERIFICATION`). Creator becomes primary administrator. |
| `GET` | `/api/v1/academic/universities` | Public | Discover and search verified universities with pagination & filtering. |
| `GET` | `/api/v1/academic/universities/{id}` | Public | Retrieve full university profile. |
| `PATCH` | `/api/v1/academic/universities/{id}` | Platform Admin / University Admin | Update university metadata with optimistic concurrency check. |
| `PATCH` | `/api/v1/academic/universities/{id}/status` | Platform Admin (`ADMIN`) | Verify, reject, or suspend a university. |
| `DELETE` | `/api/v1/academic/universities/{id}` | Platform Admin (`ADMIN`) | Soft-delete university with active binding safeguard. |
| `POST` | `/api/v1/academic/universities/{id}/departments` | University Admin / Platform Admin | Create an academic department. |
| `GET` | `/api/v1/academic/universities/{id}/departments` | Public | List all departments of a university. |
| `PATCH` | `/api/v1/academic/departments/{id}/hod` | University Admin / Platform Admin | Assign an affiliated active faculty member as Head of Department. |
| `POST` | `/api/v1/academic/affiliations` | `require_roles([FACULTY, ADMIN])` | Faculty member requests primary department affiliation. |
| `GET` | `/api/v1/academic/universities/{id}/affiliations/pending` | University Admin / Platform Admin | List pending faculty affiliation requests for institutional review. |
| `POST` | `/api/v1/academic/affiliations/{id}/verify` | University Admin / Platform Admin | Approve or reject faculty affiliation. |
| `GET` | `/api/v1/academic/matching/universities/{challenge_id}` | Authenticated | Execute 5-factor AI matching formula to rank universities for a challenge. |
| `GET` | `/api/v1/academic/matching/faculty/{challenge_id}` | Authenticated | Rank available faculty mentors within institutional capacity limits. |
| `POST` | `/api/v1/academic/intakes/claim` | Univ Admin / Affiliated Faculty | University claims an active published challenge for academic routing. |
| `POST` | `/api/v1/academic/intakes/{id}/allocations` | University Admin / Platform Admin | Allocate an M3 student team and faculty mentor to the claimed challenge intake. |

---

## 4. Events & Audit Actions Emitted

20 standardized actions are added to `AuditAction` ([`backend/app/core/constants.py`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/SICP/backend/app/core/constants.py)):

1. `UNIVERSITY_REGISTERED`
2. `UNIVERSITY_VERIFIED`
3. `UNIVERSITY_REJECTED`
4. `UNIVERSITY_SUSPENDED`
5. `UNIVERSITY_UPDATED`
6. `UNIVERSITY_ADMIN_ASSIGNED`
7. `UNIVERSITY_ADMIN_REVOKED`
8. `DEPARTMENT_CREATED`
9. `DEPARTMENT_UPDATED`
10. `DEPARTMENT_DELETED`
11. `HOD_ASSIGNED`
12. `FACULTY_AFFILIATION_REQUESTED`
13. `FACULTY_AFFILIATION_APPROVED`
14. `FACULTY_AFFILIATION_REJECTED`
15. `FACULTY_AFFILIATION_REVOKED`
16. `CHALLENGE_MATCH_GENERATED`
17. `CHALLENGE_CLAIMED_BY_UNIVERSITY`
18. `CHALLENGE_INTAKE_STATUS_UPDATED`
19. `TEAM_ALLOCATED_TO_CHALLENGE`
20. `FACULTY_MENTOR_ASSIGNED_TO_TEAM`

---

## 5. Dependencies & Contracts for Module 5 (Innovation Project Lifecycle)

Module 5 will consume the following contracts from M4:

1. **Intake Team Allocation Context:**
   - `intake_team_allocations.id` represents the formal bridge linking:
     - `challenge_id` (from M2)
     - `team_id` (from M3)
     - `university_id` & `department_id` (from M4)
     - `faculty_mentor_id` (from M4)
2. **Project Initiation:**
   - M5 `projects` will reference `intake_team_allocation_id` or `(challenge_id, team_id)`.
3. **Faculty Mentorship Role in Projects:**
   - The assigned `faculty_mentor_id` serves as the official academic advisor approving project milestone deliverables and technical evaluations.
4. **Institutional Scope:**
   - University-level innovation project analytics and IP ownership policies are scoped to `intakes.university_id`.
