# Test-Driven Development (TDD) Specification — Module 6: Industry Partnership Network

**Document Version:** 1.1 (Specification Cleanup & Domain Purity)  
**Module ID:** M6  
**Module Name:** Industry Partnership Network  
**Status:** 📋 **SPECIFICATION COMPLETE (READY FOR IMPLEMENTATION)**  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Target Delivery:** Milestone 6 (CSR Sponsorship, Corporate Mentorship, Equipment & Pilot Support)  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒 `v1.0.0-m1-lock`]
- M2: Citizen Challenge Management [LOCKED 🔒 `v2.0.0-m2-lock`]
- M3: Team Formation & Collaboration [LOCKED 🔒 `v3.0.0-m3-lock`]
- M4: Academic Collaboration Hub [LOCKED 🔒 `v4.0.0-m4-lock`]
- M5: Innovation Project Lifecycle [LOCKED 🔒 `v5.0.0-m5-lock`]

---

## 1. TDD Strategy & Quality Goals

Module 6 adheres strictly to the **TDD Red-Green-Refactor Lifecycle**:
1. **Red Phase**: Write failing unit, domain invariant, repository, service, and API integration test suites first.
2. **Green Phase**: Implement minimal domain entities, repositories, services, and API endpoints to satisfy all assertions.
3. **Refactor Phase**: Optimize queries, enforce aggregate encapsulation, verify optimistic locking, and ensure zero regressions.

### Quality Benchmarks:
* **Test Pass Rate**: 100% (Zero failures, Zero errors).
* **Code Coverage**: $\ge 90\%$ line and branch coverage across all Module 6 components.
* **Zero Platform Regression**: 100% passing test execution across M1 (IAM: 23 tests), M2 (Challenges: 32 tests), M3 (Teams: 45 tests), M4 (Academic Hub: 19 tests), and M5 (Innovation Projects: 20 tests) — preserving all 139 existing platform tests.
* **Specification Isolation**: This document defines test scenarios, assertions, pre-conditions, and expected outcomes **strictly at the domain specification level**. Transport-specific HTTP codes and physical database queries are deferred to the implementation phase.

---

## 2. Target Test Suite Architecture (`backend/tests/partnerships/`)

```
backend/tests/partnerships/
├── conftest.py                             # Shared M6 fixtures (verified partners, active M5 projects, agreements)
├── test_partner_verification.py            # Accreditation lifecycle, CIN verification, suspension guards
├── test_partnership_invariants.py          # Financial bounds, tranche bounds, equipment/mentorship limits
├── test_partnership_state_machine.py       # Valid/invalid transitions across all 4 state machines
├── test_aggregate_ownership.py             # Exclusive child ownership of tranches and sessions
├── test_partnership_disbursements.py       # Milestone-linked tranches, release gating, balance equations
├── test_partnership_mentorship.py          # Mentor session hour logs, attendance verification, rating decoupling
├── test_partnership_equipment.py           # Manifest itemization, delivery verification, receipt hashes
├── test_partnership_pilot.py               # Pilot site commitments, deployment evidence verification gate
├── test_partnership_withdrawal.py          # Status WITHDRAWN, child entity freezing, gap calculation
├── test_partnership_concurrency.py         # Optimistic locking, double-release prevention, race conditions
├── test_partnership_audit.py               # 100% append-only audit events, immutability verification
├── test_partnership_coverage_metrics.py    # Query-time derived metrics (Funding %, Gap, Mentorship %, Equipment %)
├── test_partnership_cross_module.py        # Integration contracts with M1, M4, M5, and M7
├── test_partnership_auth_matrix.py         # Strict RBAC role guards across industry, student, faculty, admin
├── test_partnership_e2e.py                 # Multi-sponsor end-to-end innovation project lifecycle
└── test_partnership_edge_cases.py          # Zero commitments, partial deliveries, partner suspension during active agreement
```

---

## 3. Domain Invariant Test Specifications

### 3.1 Financial Funding Invariants (`test_partnership_invariants.py`)

#### `test_invariant_released_amount_cannot_exceed_promised_amount()`
* **Scenario**: A partner creates a `FUNDING` agreement with `promised_amount = 500000.00`. Two tranches of `200000.00` and `300000.00` are executed. An attempt is made to release a third disbursement of `100000.00`.
* **Assertion / Expected Outcome**:
  - The third disbursement request is rejected with a domain validation exception (`DisbursementExceedsPromisedAmount`).
  - System verifies invariant: $\text{released\_amount} \le \text{promised\_amount}$ (`500000.00 <= 500000.00`).

#### `test_invariant_remaining_amount_exact_calculation()`
* **Scenario**: An agreement with `promised_amount = 1000000.00` has one tranche of `300000.00` released.
* **Assertion / Expected Outcome**:
  - `agreement.remaining_amount` exactly equals `700000.00`.
  - Invariant verified: $\text{remaining\_amount} = \text{promised\_amount} - \text{released\_amount}$.

#### `test_invariant_tranche_sum_cannot_exceed_promised_amount()`
* **Scenario**: A sponsor creates a `FUNDING` agreement with `promised_amount = 500000.00` and attempts to schedule tranches of `300000.00` and `300000.00` ($\sum = 600000.00$).
* **Assertion / Expected Outcome**:
  - Proposal creation is rejected with a domain validation error (`InvalidTrancheAggregation`).
  - Scheduling tranches totaling $\le 500000.00$ succeeds.
  - Invariant verified: $\sum_{j=1}^M \text{tranche\_amount}_j \le \text{promised\_amount}$.

#### `test_invariant_zero_promised_amount_rejected_for_funding()`
* **Scenario**: A sponsor attempts to initiate a `FUNDING` partnership agreement with `promised_amount = 0.00`.
* **Assertion / Expected Outcome**:
  - The proposal is strictly rejected with a domain validation exception (`FundingAmountMustBePositive`).
  - `FUNDING` agreements require a positive financial commitment ($\text{promised\_amount} > 0$). Zero-cost non-monetary support must use `MENTORSHIP`, `EQUIPMENT`, or `PILOT_DEPLOYMENT`.

---

### 3.2 Resource & Operational Invariants

#### `test_invariant_completed_mentorship_hours_cannot_exceed_promised_hours()`
* **Scenario**: A `MENTORSHIP` agreement commits `promised_hours = 20`. Mentor logs 15 hours (verified), then 5 hours (verified), reaching 20 hours. Mentor attempts to log an additional 5 hours against this agreement.
* **Assertion / Expected Outcome**:
  - Subsequent session crediting is rejected or capped with a domain validation exception (`MentorshipHoursExceeded`).
  - Invariant verified: $\text{completed\_hours} \le \text{promised\_hours}$.

#### `test_invariant_delivered_equipment_quantity_cannot_exceed_promised_quantity()`
* **Scenario**: An `EQUIPMENT` agreement promises 10 IoT sensor nodes. 10 nodes are delivered and confirmed. Team attempts to confirm delivery of 5 additional units under the same manifest item.
* **Assertion / Expected Outcome**:
  - Operation rejected with a domain validation exception (`EquipmentQuantityExceeded`).
  - Invariant verified: $\text{delivered\_quantity} \le \text{promised\_quantity}$.

#### `test_invariant_pilot_fulfillment_requires_deployment_evidence()`
* **Scenario**: A `PILOT_DEPLOYMENT` agreement is `ACTIVE`. The partner or team attempts to transition status to `FULFILLED` without uploading deployment evidence (municipal sign-off document or telemetry log URL).
* **Assertion / Expected Outcome**:
  - Transition rejected with a domain pre-condition error (`PilotEvidenceRequired`).
  - When valid deployment evidence with a 64-character SHA-256 checksum is uploaded, transition to `FULFILLED` succeeds.
  - Invariant verified: $\text{FULFILLED Pilot} \implies \text{Deployment Evidence Verified}$.

---

### 3.3 Eligibility & Pre-condition Invariants

#### `test_invariant_unverified_partner_cannot_create_agreement()`
* **Scenario**: An industry partner with status `PENDING_VERIFICATION`, `REJECTED`, or `SUSPENDED` attempts to submit a sponsorship proposal to an active project.
* **Assertion / Expected Outcome**:
  - Request rejected with an authorization exception (`UnverifiedPartnerError`).
  - Only `PartnerVerificationStatus.VERIFIED` organizations can create agreements.

#### `test_invariant_ineligible_project_status_rejects_agreement()`
* **Scenario**: A verified partner attempts to create a partnership proposal against projects in `COMPLETED`, `TERMINATED`, `ABANDONED`, or `SUSPENDED` status.
* **Assertion / Expected Outcome**:
  - Request rejected with a pre-condition error (`ProjectNotEligibleForSponsorship`).
  - Only projects in `SPONSORSHIP_ELIGIBLE_PROJECT_STATUSES` (`PROPOSAL`, `ACTIVE`, `PROTOTYPE`, `PILOT`, `REVIEW_READY`) are accepted.

---

## 4. State Transition Test Specifications (`test_partnership_state_machine.py`)

### 4.1 Partner Verification Lifecycle (`PartnerVerificationStatus`)
* **Valid Transitions Tested**:
  - `PENDING_VERIFICATION` $\rightarrow$ `VERIFIED` (Admin verification).
  - `PENDING_VERIFICATION` $\rightarrow$ `REJECTED` (Admin rejection).
  - `VERIFIED` $\rightarrow$ `SUSPENDED` (Admin policy enforcement).
  - `SUSPENDED` $\rightarrow$ `VERIFIED` (Compliance resolution).
  - `VERIFIED` $\rightarrow$ `INACTIVE` (Voluntary deactivation).
  - `INACTIVE` $\rightarrow$ `VERIFIED` (Reactivation).
* **Invalid Transitions Tested**:
  - `PENDING_VERIFICATION` $\rightarrow$ `ACTIVE` (Blocked).
  - `REJECTED` $\rightarrow$ `VERIFIED` (Terminal state; cannot be verified).
  - `SUSPENDED` $\rightarrow$ `INACTIVE` (Must resolve suspension first).

### 4.2 Partnership Agreement Lifecycle (`CommitmentStatus`)
* **Valid Transitions Tested**:
  - `PROPOSED` $\rightarrow$ `APPROVED` (Bilateral lead + faculty acceptance).
  - `PROPOSED` $\rightarrow$ `REJECTED` (Decline by team/partner).
  - `PROPOSED` $\rightarrow$ `EXPIRED` (30-day automated expiry).
  - `APPROVED` $\rightarrow$ `ACTIVE` (Execution / start date).
  - `APPROVED` $\rightarrow$ `WITHDRAWN` (Retraction prior to start).
  - `ACTIVE` $\rightarrow$ `FULFILLED` (All deliverables/funds verified).
  - `ACTIVE` $\rightarrow$ `WITHDRAWN` (Partner mid-lifecycle exit).
* **Invalid Transitions Tested**:
  - `PROPOSED` $\rightarrow$ `FULFILLED` (Direct jump without active execution blocked).
  - `REJECTED` $\rightarrow$ `ACTIVE` (Terminal state blocked).
  - `EXPIRED` $\rightarrow$ `APPROVED` (Expired proposal cannot be approved).
  - `FULFILLED` $\rightarrow$ `WITHDRAWN` (Completed agreement cannot be withdrawn).

### 4.3 Disbursement Lifecycle (`DisbursementStatus`)
* **Valid Transitions Tested**:
  - `SCHEDULED` $\rightarrow$ `PENDING_VERIFICATION` (Triggered upon M5 `MILESTONE_APPROVED`).
  - `PENDING_VERIFICATION` $\rightarrow$ `RELEASED` (Payment reference confirmed).
  - `PENDING_VERIFICATION` $\rightarrow$ `FAILED` (Bank failure / dispute).
  - `FAILED` $\rightarrow$ `PENDING_VERIFICATION` (Payment retry).
* **Invalid Transitions Tested**:
  - `SCHEDULED` $\rightarrow$ `RELEASED` (Cannot bypass milestone approval).
  - `RELEASED` $\rightarrow$ `SCHEDULED` (Immutable financial record).

### 4.4 Mentorship Session Lifecycle (`MentorshipSessionStatus`)
* **Valid Transitions Tested**:
  - `LOGGED` $\rightarrow$ `VERIFIED` (Attendance confirmed).
  - `LOGGED` $\rightarrow$ `DISPUTED` (Duration contested).
  - `DISPUTED` $\rightarrow$ `VERIFIED` (Resolved by faculty).
  - `DISPUTED` $\rightarrow$ `REJECTED` (Falsified session; zero hours credited).
* **Invalid Transitions Tested**:
  - `LOGGED` $\rightarrow$ `RELEASED` (Invalid status for sessions).
  - `REJECTED` $\rightarrow$ `VERIFIED` (Rejected session cannot be verified).

---

## 5. Aggregate Ownership & Cascade Tests (`test_aggregate_ownership.py`)

#### `test_disbursement_cannot_exist_without_parent_agreement()`
* **Scenario**: Attempt to instantiate or persist a `SponsorshipDisbursement` with a null or nonexistent `agreement_id`.
* **Assertion / Expected Outcome**:
  - Operation rejected with an aggregate boundary validation error.
  - Disbursement entity cannot exist outside a `PartnershipAgreement`.

#### `test_mentorship_session_cannot_exist_without_parent_agreement()`
* **Scenario**: Attempt to log a `MentorshipSession` without an active parent `PartnershipAgreement`.
* **Assertion / Expected Outcome**:
  - Operation rejected with a validation error. Session cannot exist independently.

#### `test_child_entities_cannot_be_reparented()`
* **Scenario**: Attempt to update `agreement_id` on an existing `SponsorshipDisbursement` or `MentorshipSession` to link it to a different agreement.
* **Assertion / Expected Outcome**:
  - Operation rejected with a domain immutability exception (`ImmutableAggregateParentError`).

---

## 6. Sponsor Withdrawal & Child Propagation Tests (`test_partnership_withdrawal.py`)

#### `test_withdrawal_transitions_status_and_preserves_records()`
* **Scenario**: Partner A has an active agreement with ₹5,00,000 promised, ₹2,00,000 released (Tranche 1), and ₹3,00,000 scheduled (Tranche 2). Partner submits withdrawal with reason `"Budget Cut"`.
* **Assertion / Expected Outcome**:
  - Agreement status becomes `WITHDRAWN`.
  - Record is **NOT deleted** (zero hard deletions).
  - `agreement.withdrawn_at` and `agreement.withdrawal_reason` are populated.

#### `test_withdrawal_cancels_future_disbursements()`
* **Scenario**: Upon withdrawal of the agreement above, attempt to release Tranche 2 (₹3,00,000).
* **Assertion / Expected Outcome**:
  - Disbursement release is blocked with a state exception (`AgreementWithdrawnError`).
  - Tranche 2 status becomes `CANCELLED`.

#### `test_withdrawal_blocks_new_sessions_deliveries_and_pilot_evidence()`
* **Scenario**: Following agreement withdrawal, corporate mentor attempts to log a session; team attempts to confirm equipment delivery; team attempts to submit pilot evidence.
* **Assertion / Expected Outcome**:
  - All three operations are rejected with a state exception (`AgreementWithdrawnError`).
  - Historical Tranche 1 (₹2,00,000) and past verified sessions remain intact.

---

## 7. Optimistic Concurrency & Race Condition Tests (`test_partnership_concurrency.py`)

#### `test_double_tranche_release_concurrency_race()`
* **Scenario**: Two parallel requests attempt to release the same scheduled tranche of ₹2,00,000 simultaneously against Agreement Version 5.
* **Assertion / Expected Outcome**:
  - Exactly **one request succeeds** (version increments to 6, `released_amount` increments by ₹2,00,000).
  - The second concurrent request fails with a concurrency failure (`OptimisticLockError`).
  - Cumulative `released_amount` increments exactly once (no double disbursement).

#### `test_simultaneous_approval_and_withdrawal_race()`
* **Scenario**: Student leader submits agreement approval while partner concurrently submits agreement withdrawal.
* **Assertion / Expected Outcome**:
  - First committer succeeds; second request receives a concurrency failure (`OptimisticLockError`) and must refresh state.

#### `test_concurrent_agreement_modification_race()`
* **Scenario**: Partner updates tranche schedule while team lead updates MoU terms simultaneously with stale version numbers.
* **Assertion / Expected Outcome**:
  - Stale update rejected with a concurrency failure (`OptimisticLockError`).

---

## 8. Audit Architecture Tests (`test_partnership_audit.py`)

#### `test_every_lifecycle_mutation_emits_exact_audit_event()`
* **Scenario**: Execute the complete sequence of 16 lifecycle actions:
  1. `INDUSTRY_PARTNER_REGISTERED`
  2. `INDUSTRY_PARTNER_VERIFIED`
  3. `INDUSTRY_PARTNER_SUSPENDED`
  4. `PARTNERSHIP_PROPOSED`
  5. `PARTNERSHIP_APPROVED`
  6. `PARTNERSHIP_ACTIVATED`
  7. `PARTNERSHIP_FULFILLED`
  8. `PARTNERSHIP_WITHDRAWN`
  9. `PARTNERSHIP_REJECTED`
  10. `PARTNERSHIP_EXPIRED`
  11. `DISBURSEMENT_SCHEDULED`
  12. `DISBURSEMENT_RELEASED`
  13. `MENTORSHIP_SESSION_LOGGED`
  14. `MENTORSHIP_FEEDBACK_GIVEN`
  15. `EQUIPMENT_DELIVERY_CONFIRMED`
  16. `PILOT_EVIDENCE_SUBMITTED`
* **Assertion / Expected Outcome**:
  - Exactly one immutable audit record is created per operation.
  - Record contains exact `actor_id`, `entity_type`, `entity_id`, and structured `metadata`.

#### `test_audit_records_are_append_only_and_immutable()`
* **Scenario**: Attempt to modify or delete any existing audit record.
* **Assertion / Expected Outcome**:
  - Operation fails. Audit records are strictly append-only; audit records cannot be modified; audit records cannot be deleted.

---

## 9. Dynamic Coverage Metric Tests (`test_partnership_coverage_metrics.py`)

#### `test_funding_coverage_and_gap_calculation()`
* **Scenario**: Project has target budget ₹10,00,000.
  - Agreement 1 (`ACTIVE`): ₹5,00,000 promised.
  - Agreement 2 (`ACTIVE`): ₹2,50,000 promised.
  - Agreement 3 (`WITHDRAWN`): ₹2,00,000 promised (excluded from active coverage).
* **Assertion / Expected Outcome**:
  - `Funding Coverage %` = $75.0\%$ ($\frac{7,50,000}{10,00,000} \times 100$).
  - `Funding Gap` = ₹2,50,000.
  - Assert metrics are computed dynamically at query time and not stored as physical table columns.

#### `test_mentorship_and_equipment_coverage_calculation()`
* **Scenario**: Project requires 50 mentorship hours and 3 equipment categories.
  - Active Mentor Agreement promises 40 hours.
  - Active Equipment Agreements cover 2 out of 3 categories.
* **Assertion / Expected Outcome**:
  - `Mentorship Coverage %` = $80.0\%$.
  - `Equipment Coverage %` = $66.67\%$.

---

## 10. Cross-Module Contract Tests (`test_partnership_cross_module.py`)

#### `test_m1_unverified_industry_role_guard()`
* **Scenario**: User with `role = 'student'` or `role = 'citizen'` attempts to register an industry partnership proposal.
* **Assertion / Expected Outcome**:
  - Rejected with an authorization exception (`RoleNotAuthorized`).

#### `test_m4_faculty_mentor_cosign_verification()`
* **Scenario**: A faculty user who is NOT the assigned primary faculty mentor on the project's parent `intake_team_allocations` attempts to co-sign an agreement.
* **Assertion / Expected Outcome**:
  - Rejected with an authorization exception (`UnauthorizedFacultyMentor`).

#### `test_m5_unapproved_milestone_blocks_tranche_release()`
* **Scenario**: A disbursement is linked to Milestone 2 (status: `IN_PROGRESS` or `SUBMITTED`). Partner attempts to trigger release.
* **Assertion / Expected Outcome**:
  - Release is blocked with a milestone pre-condition exception (`MilestoneNotApprovedError`).
  - Milestone must reach `MilestoneStatus.APPROVED` before disbursement can proceed.

#### `test_m7_telemetry_query_compatibility()`
* **Scenario**: Query historical audit logs and agreement outcomes to aggregate district CSR capital deployment and corporate reliability index.
* **Assertion / Expected Outcome**:
  - Query successfully calculates metrics without schema alterations.

---

## 11. Edge Cases & Governance Boundary Tests (`test_partnership_edge_cases.py`)

| Test Scenario | Test Description | Expected Result / Assertion |
| :--- | :--- | :--- |
| **Zero Funding Commitment** | Proposal created with `promised_amount = 0.00` | Rejected with validation exception (`FundingAmountMustBePositive`) |
| **Zero Mentorship Hours** | Proposal created with `promised_hours = 0` | Rejected with validation exception (`HoursMustBePositive`) |
| **Partner Suspended During Active Agreement** | Partner is `VERIFIED` with an `ACTIVE` agreement; admin sets Partner to `SUSPENDED` | • Partner blocked from creating new agreements<br/>• Existing agreement remains visible with historical context<br/>• Future disbursements and session crediting are frozen pending administrative compliance resolution |
| **Partial Equipment Delivery** | 6 of 10 promised sensors delivered | Agreement remains `ACTIVE` (`delivered_quantity = 6`); does not transition to `FULFILLED` |
| **Withdrawal After Partial Disbursement** | Sponsor withdraws after ₹2L of ₹5L released | Status $\rightarrow$ `WITHDRAWN`; Gap of ₹3L marked; ₹2L preserved in M7 reporting |
| **Withdrawal After Fulfilled Mentorship** | Sponsor attempts to withdraw after all 40 hours completed | Rejected with state exception (`FulfilledAgreementCannotBeWithdrawn`) |
| **Expired Proposal Handling** | 30 days elapsed on proposed agreement | Status automatically transitions to `EXPIRED`; `PARTNERSHIP_EXPIRED` audit event emitted |
| **Multi-Sponsor Funding Aggregation** | 3 partners sponsor ₹2L, ₹3L, and ₹5L on same project | Total pledged funding = ₹10L (100% coverage); all 3 agreements tracked independently |
| **Multi-Mentorship Allocation** | 2 corporate mentors assigned from different companies | Both log independent sessions; hours aggregate toward project total |
| **Multi-Equipment Providers** | Partner A provides sensors; Partner B provides cloud credits | Both manifests tracked independently under distinct agreements |

---

## 12. Invariant Verification Checklist

- [x] **Financial Bound**: $\text{released\_amount} \le \text{promised\_amount}$
- [x] **Financial Balance**: $\text{remaining\_amount} = \text{promised\_amount} - \text{released\_amount}$
- [x] **Tranche Upper Bound**: $\sum_{j=1}^M \text{tranche\_amount}_j \le \text{promised\_amount}$
- [x] **Positive Grant Invariant**: $\text{promised\_amount} > 0$ for all `FUNDING` agreements (zero-value rejected).
- [x] **Mentorship Bound**: $\text{completed\_hours} \le \text{promised\_hours}$
- [x] **Equipment Bound**: $\text{delivered\_quantity} \le \text{promised\_quantity}$
- [x] **Pilot Evidence Gate**: $\text{FULFILLED Pilot} \implies \text{Deployment Evidence Verified}$
- [x] **Partner Verification Gate**: Only `VERIFIED` partners can create proposals or agreements.
- [x] **Project Status Gate**: Only active M5 projects (`PROPOSAL`, `ACTIVE`, `PROTOTYPE`, `PILOT`, `REVIEW_READY`) accept agreements.
- [x] **Partner Suspension Gate**: Suspension freezes new agreements and halts active disbursements pending review.
- [x] **Exclusive Child Ownership**: `SponsorshipDisbursement` and `MentorshipSession` cannot exist independently or be re-parented.
- [x] **Withdrawal Child Propagation**: Withdrawing an agreement cancels future tranches and freezes new sessions/deliveries.
- [x] **Concurrency Safety**: Double releases and race conditions rejected via version checking.
- [x] **Append-Only Auditing**: 100% of mutations emit exactly one immutable audit event (including `PARTNERSHIP_EXPIRED`).
- [x] **Derived Metrics**: Coverage metrics are computed at query time and not stored as physical columns.
- [x] **Zero Platform Regression**: All 139 existing M1–M5 platform tests preserved.
