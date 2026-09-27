# Module 7 (M7) — Test-Driven Development (TDD) Specification

**Document Version:** 2.0 (Lock-Ready Specification)  
**Module ID:** M7  
**Module Name:** Governance & Impact Intelligence  
**Status:** 🔒 **LOCKED SPECIFICATION** (`v7.0.0-m7-lock`)  
**Author:** SICP Architecture & Engineering Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒 `v1.0.0-m1-lock`]
- M2: Citizen Challenge Management [LOCKED 🔒 `v2.0.0-m2-lock`]
- M3: Team Formation & Collaboration [LOCKED 🔒 `v3.0.0-m3-lock`]
- M4: Academic Collaboration Hub [LOCKED 🔒 `v4.0.0-m4-lock`]
- M5: Innovation Project Lifecycle [LOCKED 🔒 `v5.0.0-m5-lock`]
- M6: Industry Partnership Network [LOCKED 🔒 `v6.0.0-m6-lock`]

---

## 1. Test Architecture & Directory Structure

All M7 tests will reside under `backend/tests/governance/`:

```text
backend/tests/governance/
├── conftest.py                             # Async fixtures, multi-module seed state & mock aggregations
├── test_governance_sroi.py                 # SROI mathematical invariants, NPV discounting, proxy valuation
├── test_governance_sri.py                  # Sponsor Reliability Index formulas, withdrawal penalties, tiers
├── test_governance_upi.py                  # University Participation Index, intake rates, milestone quality
├── test_governance_psi.py                  # Project Success Index formulas, completion, on-time, sustainability
├── test_governance_csr_utilization.py      # CSR committed, approved, released, utilized & efficiency ratios
├── test_governance_geo_rollup.py           # District -> State -> National rollups & edge case attribution
├── test_governance_funnel.py               # 7-stage innovation pipeline conversion & dwell time metrics
├── test_governance_transparency.py         # Public open data access, PII masking, SHA-256 digest validation
├── test_governance_reports.py              # MCA CSR-1 & NAAC/NIRF compliance export generation
├── test_governance_snapshots.py            # Materialized snapshot generation & on-demand recalculation
├── test_governance_ingest_contract.py      # Audit-event ingestion schema validation, idempotency & ordering
├── test_governance_audit.py                # 10 append-only audit event emissions & immutability
├── test_governance_auth_matrix.py          # Strict RBAC access matrix across government, industry, admin
├── test_governance_edge_cases.py           # Zero division guards, empty districts, extreme valuations
└── test_governance_e2e.py                  # Full cross-module macro-governance intelligence lifecycle
```

---

## 2. Test Suites Specification

### Suite 1: SROI & Economic Valuation Invariant Tests (`test_governance_sroi.py`)

1. **`test_sroi_mathematical_precision_and_discounting()`**:
   - **Preconditions**: Project with released CSR grant ₹5,00,000, 10,000 beneficiaries, ₹2,00,000 annual civic savings.
   - **Execution**: Query SROI valuation for the target project.
   - **Verification**:
     - Gross value per year = ₹2,00,000 + (10,000 * ₹500) = ₹52,00,000.
     - Net value year 1 = ₹52,00,000 * 0.80 * 0.95 = ₹39,52,000.
     - SROI ratio is computed strictly $> 1.0$ and rounded to 2 decimal places.
     - Returned valuation contains `capital_invested`, `net_present_value`, `sroi_ratio`, `deadweight_factor`, `discount_rate`.

2. **`test_sroi_zero_investment_boundary_safety()`**:
   - **Scenario**: A completed prototype with 0 released CSR funds (purely academic student innovation).
   - **Verification**: SROI engine substitutes baseline $I = 1.00$ to prevent division by zero; returns valid finite SROI figure without raising an exception.

---

### Suite 2: Sponsor Reliability Index (SRI) Tests (`test_governance_sri.py`)

1. **`test_sri_score_calculation_and_tiering()`**:
   - **Scenario**: 
     - Sponsor A: Promised ₹10L, Released ₹10L (Fulfillment = 100%), 0 withdrawals (Retention = 100%), 20/20 mentor hours (100%).
     - Sponsor B: Promised ₹20L, Released ₹5L (Fulfillment = 25%), 1 withdrawal (Retention = 50%), 0 mentor hours.
   - **Verification**:
     - Sponsor A achieves $\text{SRI} \ge 90.0$, assigned `reliability_tier = 'PLATINUM'`.
     - Sponsor B achieves $\text{SRI} < 50.0$, assigned `reliability_tier = 'AT_RISK'`.

2. **`test_sri_updates_upon_withdrawal()`**:
   - **Scenario**: Sponsor withdraws from an active agreement in M6.
   - **Verification**: SRI calculation immediately reflects the penalized retention score and reduced composite SRI.

---

### Suite 3: University Participation Index (UPI) Tests (`test_governance_upi.py`)

1. **`test_upi_composite_formula_and_ranking()`**:
   - **Scenario**: University with 10 claims, 8 allocated teams, 6 approved milestones, 5 active faculty mentors, 3 sponsored projects.
   - **Verification**:
     - Sub-indicators $U_1 \dots U_5$ are computed within range $[0, 100]$.
     - Composite `upi_score` matches exact weighted formula $\pm 0.01$.
     - Correct `ranking_tier` (`TIER_1`, `TIER_2`, etc.) assigned.

---

### Suite 4: Project Success Index (PSI) Tests (`test_governance_psi.py`)

1. **`test_psi_composite_formula_and_indicators()`**:
   - **Scenario**: Project with 4/4 approved milestones on time, verified pilot deployment evidence, 100% target beneficiary reach, and high faculty evaluation score.
   - **Verification**:
     - Completion rate ($M_1$) = 100.0, On-time rate ($M_2$) = 100.0, Pilot score ($M_3$) = 100.0, Adoption ($M_4$) = 100.0.
     - Composite PSI score is $\ge 90.0$.
     - Each sub-indicator is strictly bounded in $[0.0, 100.0]$.

2. **`test_psi_degraded_score_for_delayed_or_stalled_projects()`**:
   - **Scenario**: Project with 1/4 approved milestones, multiple deadline extensions, and no pilot.
   - **Verification**: PSI score reflects low milestone velocity and receives $\text{PSI} < 40.0$.

---

### Suite 5: CSR Capital Utilization Tests (`test_governance_csr_utilization.py`)

1. **`test_csr_fund_breakdown_consistency()`**:
   - **Scenario**: Sponsor creates agreements with promised ₹20L, ₹15L approved, ₹10L released, and ₹6L tied to approved milestone deliverables.
   - **Verification**:
     - `committed_funds` == ₹20L.
     - `approved_funds` == ₹15L.
     - `released_funds` == ₹10L.
     - `utilized_funds` == ₹6L.
     - `unutilized_funds` == ₹4L (Released - Utilized).
     - `utilization_percentage` == 60.0%.

2. **`test_cost_per_beneficiary_and_funding_efficiency_ratio()`**:
   - **Scenario**: ₹6L utilized funds, 3,000 verified beneficiaries, ₹30L gross economic value created.
   - **Verification**:
     - `cost_per_beneficiary` == ₹200.00.
     - `funding_efficiency_ratio` == 5.0 (₹30L / ₹6L).

---

### Suite 6: Geographic Aggregation & Edge Cases (`test_governance_geo_rollup.py`)

1. **`test_district_to_state_sum_conservation()`**:
   - **Scenario**: State "Maharashtra" has 2 districts ("Pune", "Wardha") with 5 and 3 challenges respectively.
   - **Verification**:
     - State rollup reports `total_challenges == 8`.
     - State `released_csr_funds` equals sum of constituent district `released_csr_funds`.
     - No orphan or uncounted challenges.

2. **`test_multi_district_project_attribution()`**:
   - **Scenario**: Project addresses a challenge spanning District A (pop. 60,000) and District B (pop. 40,000) with ₹10L total impact.
   - **Verification**:
     - District A attributed 60% (₹6L).
     - District B attributed 40% (₹4L).
     - Total state rollup preserves conservation ($\text{District A} + \text{District B} == ₹10\text{L}$).

3. **`test_out_of_state_university_attribution()`**:
   - **Scenario**: IIT Bombay (Maharashtra) claims a challenge originating in Patna (Bihar).
   - **Verification**:
     - IIT Bombay's UPI and academic credits attribute to Maharashtra state totals.
     - Societal beneficiaries, resolved challenge count, and local civic savings attribute strictly to Patna (Bihar) state totals.

4. **`test_beneficiary_deduplication_across_milestones()`**:
   - **Scenario**: Project logs 5,000 beneficiaries in Milestone 1 and 7,500 cumulative beneficiaries in Milestone 2.
   - **Verification**:
     - District total reflects 7,500 beneficiaries (not $5,000 + 7,500 = 12,500$).

---

### Suite 7: Audit-Event Ingestion Contract Validation (`test_governance_ingest_contract.py`)

1. **`test_valid_event_schema_ingestion()`**:
   - **Execution**: Ingest standard event containing valid `event_id`, `event_type`, `actor_id`, `actor_role`, `source_module`, `entity_type`, `entity_id`, `occurred_at`, `payload`, `schema_version = "1.0"`.
   - **Verification**: Event accepted, aggregate read models updated.

2. **`test_idempotent_event_ingestion()`**:
   - **Scenario**: Re-send identical `event_id` twice to ingestion engine.
   - **Verification**: Second delivery is deduplicated; counts and financial sums are not double-incremented.

3. **`test_invalid_schema_version_rejection()`**:
   - **Scenario**: Ingest event with `schema_version = "99.0"`.
   - **Verification**: Event rejected gracefully with validation error; platform does not crash.

---

### Suite 8: Pipeline Conversion Funnel Tests (`test_governance_funnel.py`)

1. **`test_7_stage_conversion_funnel_consistency()`**:
   - **Verification**:
     - Total Stage 1 count $\ge$ Total Stage 2 count $\ge \dots \ge$ Total Stage 7 count.
     - Each stage returns `count`, `conversion_rate_percentage`, and `average_dwell_days`.

---

### Suite 9: Public Transparency & PII Anonymization (`test_governance_transparency.py`)

1. **`test_public_endpoint_accessible_without_auth()`**:
   - **Execution**: Query public transparency ledger.
   - **Verification**:
     - Status OK.
     - Response contains aggregate impact figures.
     - Zero user email, phone, or raw full names present in response payload.

2. **`test_open_data_sha256_digest_integrity()`**:
   - **Verification**: Public data export includes cryptographic `sha256_signature` verifying ledger state.

---

### Suite 10: Compliance Report Exports (`test_governance_reports.py`)

1. **`test_mca_csr1_compliance_report_export()`**:
   - **Verification**: MCA CSR-1 report returns CIN number, itemized project disbursements, recipient challenge categories, and MCA Section 135 compliance declaration.

2. **`test_naac_nirf_evidence_package_export()`**:
   - **Verification**: NAAC/NIRF export returns verified faculty research hours, student innovation credits, and industry co-sponsorship totals.

---

### Suite 11: Materialized Snapshot Recalculation (`test_governance_snapshots.py`)

1. **`test_admin_trigger_snapshot_recalculation()`**:
   - **Execution**: Trigger analytical recalculation.
   - **Verification**:
     - Analytical snapshots updated with fresh timestamp.
     - Emits `GOVERNANCE_DATA_RECALCULATED` audit log.

---

### Suite 12: Role-Based Access Control (`test_governance_auth_matrix.py`)

1. **`test_governance_rbac_matrix()`**:
   - `government` role: Access to state, district, funnel, and overview dashboards.
   - `industry` role: Access to CSR compliance reports, sponsor reliability scorecards.
   - `student` / `citizen`: Forbidden from internal government administrative views; access to public transparency and project SROI.
   - `admin`: Super-user access across all endpoints and recalculation triggers.

---

### Suite 13: End-to-End Macro Intelligence Lifecycle (`test_governance_e2e.py`)

1. **`test_full_platform_macro_intelligence_e2e()`**:
   - **Flow**:
     1. Citizen logs Challenge in Wardha (M2).
     2. Student Team forms (M3).
     3. IIT Bombay claims challenge and allocates team (M4).
     4. Innovation Project created, milestones approved (M5).
     5. Tata CSR sponsors project, releases ₹4L tranche, logs 10 mentorship hours (M6).
     6. Field pilot deployed with evidence (M5/M6).
     7. Query district scorecard for Wardha $\rightarrow$ verifies challenge resolved, beneficiary count updated, CSR recorded.
     8. Query SROI for project $\rightarrow$ verifies positive SROI ratio.
     9. Query university rankings $\rightarrow$ verifies IIT Bombay UPI increased.
     10. Query sponsor reliability $\rightarrow$ verifies Tata CSR SRI score is Platinum.
     11. Query public transparency ledger $\rightarrow$ verifies open ledger updated.

---

## 3. Invariant Verification Checklist

- [ ] **SROI Determinism**: Exact reproduction of SROI ratios for given project inputs.
- [ ] **Geo-Hierarchy Conservation**: State totals strictly equal sum of constituent district totals.
- [ ] **Multi-District Proportionality**: Multi-district impact correctly partitioned without duplication.
- [ ] **SRI Boundedness**: Sponsor Reliability Index strictly bounded in $[0.0, 100.0]$.
- [ ] **UPI Boundedness**: University Participation Index strictly bounded in $[0.0, 100.0]$.
- [ ] **PSI Boundedness**: Project Success Index strictly bounded in $[0.0, 100.0]$.
- [ ] **CSR Conservation**: $\text{Committed} \ge \text{Approved} \ge \text{Released} \ge \text{Utilized}$.
- [ ] **Event Ingestion Idempotency**: Deduplication by `event_id` prevents corrupted rollups.
- [ ] **PII Masking**: Public transparency feeds contain zero citizen/student PII.
- [ ] **Append-Only Governance Audits**: 100% of governance snapshot and export events emit immutable audit logs.
- [ ] **Zero Prior Module Modification**: M1–M6 schemas, models, and tests remain 100% frozen.
