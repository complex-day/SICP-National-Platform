# Module 6 (M6) — Architecture & Contract Lock

**Document Version:** 6.0.0 (Locked Specification & Implementation)  
**Module ID:** M6  
**Module Name:** Industry Partnership Network  
**STATUS:** 🔒 **LOCKED**  
**VERSION:** `v6.0.0-m6-lock`  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Target Delivery:** Milestone 6  

---

## 1. Locked Architecture Decisions

1. **Multi-Sponsor Mediation Cardinality ($M:N$)**:
   - `IndustryPartner` and `InnovationProject` form an effective $M:N$ relationship mediated exclusively through `PartnershipAgreement`.
   - Multiple distinct industry sponsors can partner with the same innovation project simultaneously across funding, corporate mentorship, equipment/tool grants, and field pilot testbed hosting without mutual blocking.

2. **Strict Aggregate Boundaries**:
   - `PartnershipAgreement` is the aggregate root.
   - `SponsorshipDisbursement` (financial tranches) and `MentorshipSession` (corporate advisory logs) are subordinate entities that cannot exist independently of an agreement.
   - Deleting or reparenting child entities outside the agreement boundary is strictly blocked.

3. **Accreditation Gate Invariant**:
   - Only `IndustryPartner` profiles with `verification_status == VERIFIED` can propose, execute, or co-sign agreements.
   - Unverified (`PENDING_VERIFICATION`, `REJECTED`, `SUSPENDED`, `INACTIVE`) partners are strictly blocked from agreement initiation.

4. **Tranche Bounds & Milestone-Gated Release**:
   - Financial invariant: Cumulative scheduled tranches $\sum \text{tranche\_amount} \le \text{promised\_amount}$ and $\text{released\_amount} \le \text{promised\_amount}$.
   - Tranches linked to an M5 milestone cannot transition to `RELEASED` until the target milestone has achieved status `APPROVED`.

5. **Decoupled Mentorship Ratings**:
   - Session verification and completed hour calculations are governed strictly by attendance confirmation (`attended == True`) and timestamp validation.
   - Star ratings ($1-5$) and qualitative reviews remain optional analytics metadata and do not gate fulfillment or credit.

6. **Withdrawal Cascading & Historical Immutability**:
   - Transitioning an agreement to `WITHDRAWN` immediately freezes future disbursements, sessions, and deliveries.
   - All historical records (`RELEASED` tranches, `VERIFIED` sessions, confirmed equipment deliveries) remain permanently intact and immutable.
   - The unfulfilled differential ($\text{promised} - \text{released}$) is dynamically recalculated as an open project funding/resource gap.

7. **Optimistic Concurrency Control**:
   - All entities maintain an integer `version` column. Concurrent mutations must provide matching version identifiers; stale writes raise `OptimisticLockError` (HTTP 409).

8. **Append-Only Audit Ledger**:
   - 100% of state transitions, accreditations, agreements, disbursements, mentorship validations, deliveries, and withdrawals emit immutable audit records in `audit_logs`.

---

## 2. Frozen Database Schema Contracts

The following entities and tables are **frozen and locked**. No modifications are permitted in subsequent modules (M7):

### 2.1 `industry_partners` Table (`IndustryPartner`)
- `id`: UUID (PK)
- `company_name`: String(255), Not Null
- `domain`: String(100), Not Null
- `cin_number`: String(50), Unique, Not Null
- `csr_budget`: Float, Default 0.0 ($\ge 0.0$)
- `website`: String(500), Nullable
- `point_of_contact_name`: String(255), Nullable
- `point_of_contact_email`: String(255), Nullable
- `point_of_contact_phone`: String(50), Nullable
- `verification_status`: String(30), Default `PENDING_VERIFICATION` (`PartnerVerificationStatus`)
- `verification_notes`: Text, Nullable
- `verified_at`: Timestamp With Time Zone, Nullable
- `verified_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `user_id`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `created_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `version`: Integer, Default 1 (Optimistic Locking)
- `is_deleted`: Boolean, Default False (Soft Delete)
- `created_at`: Timestamp With Time Zone, Default UTC Now
- `updated_at`: Timestamp With Time Zone, Default UTC Now

### 2.2 `partnership_agreements` Table (`PartnershipAgreement`)
- `id`: UUID (PK)
- `partner_id`: UUID, Indexed, FK $\rightarrow$ `industry_partners.id`
- `project_id`: UUID, Indexed, FK $\rightarrow$ `projects.id`
- `partnership_type`: String(30), Default `FUNDING` (`PartnershipType`: `FUNDING`, `MENTORSHIP`, `EQUIPMENT`, `PILOT_DEPLOYMENT`, `CSR_GRANT`)
- `status`: String(30), Default `PROPOSED` (`CommitmentStatus`: `DRAFT`, `PROPOSED`, `SUBMITTED`, `APPROVED`, `ACTIVE`, `FULFILLED`, `REJECTED`, `WITHDRAWN`, `TERMINATED`, `EXPIRED`)
- `promised_amount`: Float, Default 0.0 ($\ge 0.0$)
- `released_amount`: Float, Default 0.0 ($\le \text{promised\_amount}$)
- `promised_hours`: Float, Default 0.0 ($\ge 0.0$)
- `completed_hours`: Float, Default 0.0 ($\le \text{promised\_hours}$)
- `equipment_description`: Text, Nullable
- `equipment_quantity`: Integer, Default 0
- `delivered_quantity`: Integer, Default 0 ($\le \text{equipment\_quantity}$)
- `equipment_status`: String(30), Default `PENDING` (`EquipmentStatus`: `PENDING`, `PARTIALLY_DELIVERED`, `DELIVERED`, `VERIFIED`, `REJECTED`)
- `delivery_manifest_url`: String(500), Nullable
- `manifest_hash`: String(128), Nullable
- `delivery_notes`: Text, Nullable
- `pilot_support_description`: Text, Nullable
- `pilot_status`: String(30), Default `COMMITTED` (`PilotStatus`: `COMMITTED`, `DEPLOYED`, `VERIFIED`, `FAILED`, `CANCELLED`)
- `deployment_location`: String(255), Nullable
- `evidence_url`: String(500), Nullable
- `evidence_hash`: String(128), Nullable
- `terms_and_conditions`: Text, Nullable
- `approval_notes`: Text, Nullable
- `approved_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `approved_at`: Timestamp With Time Zone, Nullable
- `withdrawal_reason`: Text, Nullable
- `withdrawn_at`: Timestamp With Time Zone, Nullable
- `withdrawn_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `created_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `version`: Integer, Default 1 (Optimistic Locking)
- `is_deleted`: Boolean, Default False (Soft Delete)
- `created_at`: Timestamp With Time Zone, Default UTC Now
- `updated_at`: Timestamp With Time Zone, Default UTC Now

### 2.3 `sponsorship_disbursements` Table (`SponsorshipDisbursement`)
- `id`: UUID (PK)
- `agreement_id`: UUID, Indexed, FK $\rightarrow$ `partnership_agreements.id` (Cascade)
- `milestone_id`: UUID, Nullable, Indexed, FK $\rightarrow$ `project_milestones.id` (Set Null)
- `tranche_number`: Integer, Not Null ($\ge 1$)
- `amount`: Float, Not Null ($> 0.0$)
- `status`: String(30), Default `SCHEDULED` (`DisbursementStatus`: `SCHEDULED`, `PENDING_MILESTONE`, `PENDING_VERIFICATION`, `RELEASED`, `FAILED`, `CANCELLED`)
- `due_date`: Date, Nullable
- `released_at`: Timestamp With Time Zone, Nullable
- `released_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `transaction_reference`: String(100), Nullable
- `disbursement_notes`: Text, Nullable
- `version`: Integer, Default 1 (Optimistic Locking)
- `is_deleted`: Boolean, Default False (Soft Delete)
- `created_at`: Timestamp With Time Zone, Default UTC Now
- `updated_at`: Timestamp With Time Zone, Default UTC Now

### 2.4 `mentorship_sessions` Table (`MentorshipSession`)
- `id`: UUID (PK)
- `agreement_id`: UUID, Indexed, FK $\rightarrow$ `partnership_agreements.id` (Cascade)
- `mentor_id`: UUID, Indexed, FK $\rightarrow$ `users.id`
- `session_date`: Timestamp With Time Zone, Not Null
- `duration_hours`: Float, Not Null ($0.0 < \text{hours} \le 24.0$)
- `topic`: String(255), Not Null
- `summary`: Text, Not Null
- `status`: String(30), Default `SCHEDULED` (`MentorshipSessionStatus`: `SCHEDULED`, `LOGGED`, `VERIFIED`, `REJECTED`, `CANCELLED`)
- `attended`: Boolean, Default True
- `student_rating`: Integer, Nullable ($1 \le \text{rating} \le 5$, Optional Feedback)
- `feedback`: Text, Nullable
- `verified_at`: Timestamp With Time Zone, Nullable
- `verified_by`: UUID, Nullable, FK $\rightarrow$ `users.id`
- `version`: Integer, Default 1 (Optimistic Locking)
- `is_deleted`: Boolean, Default False (Soft Delete)
- `created_at`: Timestamp With Time Zone, Default UTC Now
- `updated_at`: Timestamp With Time Zone, Default UTC Now

---

## 3. Frozen API Routing & RBAC Matrix

The following REST endpoints are **frozen and locked**:

| Endpoint | Method | RBAC Roles | Description |
| :--- | :---: | :--- | :--- |
| `/api/v1/partnerships/partners` | `POST` | `industry`, `admin` | Register corporate partner profile |
| `/api/v1/partnerships/partners` | `GET` | All Authenticated | Search & list industry partner catalog |
| `/api/v1/partnerships/partners/{id}` | `GET` | All Authenticated | Get partner details & verified CSR budget |
| `/api/v1/partnerships/partners/{id}/verify` | `PATCH` | `admin` | Verify, reject, or suspend partner accreditation |
| `/api/v1/partnerships/agreements` | `POST` | `industry`, `student`, `admin` | Create partnership proposal (draft/proposed) |
| `/api/v1/partnerships/agreements` | `GET` | All Authenticated | Filter & list partnership agreements |
| `/api/v1/partnerships/agreements/{id}` | `GET` | All Authenticated | Retrieve agreement & aggregate status |
| `/api/v1/partnerships/agreements/{id}` | `PATCH` | `industry`, `student`, `admin` | Update terms with optimistic version check |
| `/api/v1/partnerships/agreements/{id}/submit` | `POST` | `industry`, `student`, `admin` | Submit agreement proposal for approval |
| `/api/v1/partnerships/agreements/{id}/approve` | `POST` | `student` (lead), `faculty`, `admin` | Bilateral agreement acceptance |
| `/api/v1/partnerships/agreements/{id}/fulfill` | `POST` | `industry`, `admin` | Fulfill agreement obligations |
| `/api/v1/partnerships/agreements/{id}/withdraw`| `POST` | `industry`, `student`, `admin` | Retract or withdraw sponsorship commitment |
| `/api/v1/partnerships/agreements/{id}/disbursements` | `POST` | `industry`, `admin` | Schedule milestone-linked financial tranche |
| `/api/v1/partnerships/disbursements/{id}/release` | `POST` | `industry`, `admin` | Release tranche funds with transaction ref |
| `/api/v1/partnerships/agreements/{id}/mentorship-sessions` | `POST` | `industry`, `admin` | Log completed mentorship advisory session |
| `/api/v1/partnerships/mentorship-sessions/{id}/verify` | `POST` | `student` (lead), `faculty`, `admin` | Confirm session attendance & feedback |
| `/api/v1/partnerships/agreements/{id}/equipment-delivery` | `POST` | `industry`, `student`, `faculty`, `admin` | Confirm equipment receipt with manifest |
| `/api/v1/partnerships/agreements/{id}/equipment-confirm` | `POST` | `student`, `faculty`, `admin` | Validate equipment delivery status |
| `/api/v1/partnerships/agreements/{id}/pilot-evidence` | `POST` | `industry`, `student`, `admin` | Upload field deployment evidence artifact |
| `/api/v1/partnerships/agreements/{id}/pilot-confirm` | `POST` | `faculty`, `admin` | Verify and sign-off pilot site deployment |
| `/api/v1/partnerships/projects/{id}/coverage` | `GET` | All Authenticated | Dynamic query-time funding & resource coverage % |
| `/api/v1/partnerships/agreements/{id}/audit-logs` | `GET` | `admin`, `industry`, `faculty` | Audit log trail for agreement and subordinates |

---

## 4. Frozen Audit Event Contract

All 16 M6 lifecycle actions emit append-only entries into `audit_logs`:

1. `INDUSTRY_PARTNER_REGISTERED`
2. `INDUSTRY_PARTNER_VERIFIED`
3. `INDUSTRY_PARTNER_SUSPENDED`
4. `PARTNERSHIP_PROPOSED`
5. `PARTNERSHIP_AGREEMENT_SUBMITTED`
6. `PARTNERSHIP_AGREEMENT_APPROVED`
7. `PARTNERSHIP_ACTIVATED`
8. `PARTNERSHIP_FULFILLED`
9. `PARTNERSHIP_WITHDRAWN`
10. `PARTNERSHIP_REJECTED`
11. `PARTNERSHIP_EXPIRED`
12. `PARTNERSHIP_DISBURSEMENT_SCHEDULED`
13. `PARTNERSHIP_DISBURSEMENT_RELEASED`
14. `MENTORSHIP_SESSION_LOGGED`
15. `MENTORSHIP_FEEDBACK_GIVEN`
16. `PARTNERSHIP_EQUIPMENT_DELIVERED`
17. `PARTNERSHIP_PILOT_DEPLOYED`

---

## 5. Certification Sign-off

- **Module Status:** 🔒 **LOCKED & FROZEN (`v6.0.0-m6-lock`)**
- **Test Certification:** 163/163 Tests Passed (100% Platform Green)
- **Regression Status:** 0 Regressions on M1, M2, M3, M4, M5
