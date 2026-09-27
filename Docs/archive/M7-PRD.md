# Module 7 (M7) — Product Requirements Document (PRD)

**Document Version:** 2.0 (Lock-Ready Specification)  
**Module ID:** M7  
**Module Name:** Governance & Impact Intelligence  
**Status:** 🔒 **LOCKED SPECIFICATION** (`v7.0.0-m7-lock`)  
**Author:** SICP Product & Architecture Core Team  
**Parent Project:** Societal Innovation Collaboration Platform (SICP)  
**Dependencies:** 
- M1: Identity & Access Management (IAM) [LOCKED 🔒 `v1.0.0-m1-lock`]
- M2: Citizen Challenge Management [LOCKED 🔒 `v2.0.0-m2-lock`]
- M3: Team Formation & Collaboration [LOCKED 🔒 `v3.0.0-m3-lock`]
- M4: Academic Collaboration Hub [LOCKED 🔒 `v4.0.0-m4-lock`]
- M5: Innovation Project Lifecycle [LOCKED 🔒 `v5.0.0-m5-lock`]
- M6: Industry Partnership Network [LOCKED 🔒 `v6.0.0-m6-lock`]

---

## 1. Problem Statement & Vision

### 1.1 Problem Statement
1. **Opaque Public Problem-Solving**: Citizens submit local issues (M2), but government administrators lack unified, real-time visibility into whether academic and corporate talent is solving them.
2. **Unverifiable Impact Claims**: Traditional societal CSR programs measure success by "funds spent" rather than tangible societal return on investment (SROI), verified beneficiaries, or validated field deployments.
3. **Regional Innovation Disparities**: Innovation funding and academic talent concentrate in tier-1 metros, leaving aspirational rural districts without measurable technological interventions.
4. **Disjointed Academic Recognition**: Universities lack verifiable, tamper-proof ledgers of faculty research translation and student innovation to present to accreditation bodies (NAAC, NIRF, AICTE).

### 1.2 Vision & Core Purpose
Module 7 (M7) provides a unified **Governance & Impact Intelligence Engine** for the SICP platform. It transforms granular operational events from Modules 1–6 into macro-societal intelligence, enabling:
- **District Collectors and State Innovation Missions** to monitor problem resolution velocity, regional innovation disparities, and public ROI.
- **Industry CSR Leaders** to track capital utilization efficiency, beneficiary reach, and social impact indicators.
- **University Leadership** to evaluate faculty and student research translation indices.
- **Citizens and Evaluators** to access an open, cryptographically auditable transparency portal.

---

## 2. Governance Stakeholders & Analytics Consumers

| Stakeholder Role | Platform Persona | Primary Analytical Needs & Capabilities |
| :--- | :--- | :--- |
| **District Administration** | `government` (District Collector / DM) | District-level problem heatmaps, solved vs. pending challenges, active student innovation teams, deployed local pilots, vulnerable population coverage. |
| **State Innovation Mission** | `government` (State Principal Secretary / Director) | State-level comparative district indices, macro SROI, inter-university performance, statewide CSR capital deployment, policy gap analysis. |
| **Central Ministries / NITI Aayog**| `government` (National Planner / Evaluator) | Nationwide SDG impact rollups, national challenge leaderboards, cross-state resource allocation efficiency. |
| **Corporate CSR Leadership** | `industry` (CSR Director / ESG Officer) | CSR capital utilization rate, verified beneficiary metrics, SROI per project, MCA CSR-1 compliance reports, Sponsor Reliability Index. |
| **University Leadership** | `faculty` / Institutional Admin (VC / Dean / HOD) | University Participation Index (UPI), student startup conversion, faculty mentorship hours, NIRF/NAAC innovation evidence packages. |
| **General Public & Civil Society** | `citizen` / Unauthenticated Public | Open Data Portal, challenge resolution tracker, verified case studies, transparency audit trail. |
| **Platform Super Admin** | `admin` (SICP Platform Governance) | Cross-module health telemetry, fraud/anomaly detection, snapshot re-calculation triggers, system-wide audit queries. |

---

## 3. Core Impact Metric Definitions & Formulas

### 3.1 Primary Direct Impact Indicators
1. **Direct Beneficiary Count (`people_benefited`)**:
   $$\text{Total Beneficiaries} = \sum_{c \in \text{Solved Challenges}} \text{c.affected\_population} + \sum_{p \in \text{Active Pilots}} \text{p.pilot\_target\_population}$$
2. **Economic Value Created / Civic Cost Savings (`economic_value_inr`)**:
   - Quantified economic savings generated for the civic administration (e.g. reduction in water tanker expenditure, operational labor automation, fuel savings).
3. **Domain-Specific Physical Impact Indicators**:
   - `water_conserved_liters`: Liters of clean potable water treated, conserved, or distributed.
   - `energy_saved_kwh`: Units of renewable/solar energy generated or kilowatt-hours saved.
   - `agricultural_yield_gain_pct`: Percentage productivity gain for local farmers.
   - `waste_diverted_kg`: Kilograms of municipal solid/organic waste diverted from landfills.
   - `healthcare_consultations_enabled`: Number of rural diagnostic telemetry tests conducted.

---

### 3.2 SROI (Social Return on Investment) Methodology

The platform calculates SROI using the standardized 6-stage Social Value International framework:

$$\text{SROI Ratio} = \frac{\text{Net Present Value of Societal Benefits (PV)}}{\text{Total Innovation Capital Invested (I)}}$$

Where:
1. **Total Capital Invested ($I$)**:
   $$I = \text{Total CSR Grants Released (M6)} + \text{University/Government Grants Allocated (M4)} + \text{Equipment Valuation}$$
   *(Boundary safety: if $I \le 0$, $I = 1.00$ baseline is used to prevent division by zero).*
2. **Net Present Value of Societal Benefits ($PV$)**:
   $$PV = \sum_{t=1}^{N} \frac{\text{Gross Societal Value}_t \times (1 - \text{Deadweight}) \times (1 - \text{Displacement}) \times (1 - \text{Drop-off})^t}{(1 + r)^t}$$
   - **Deadweight Factor ($DW \in [0.15, 0.25]$)**: Impact that would have occurred anyway without the platform (default $0.20$).
   - **Displacement Factor ($DP \in [0.05, 0.10]$)**: Impact displaced from another existing community/program (default $0.05$).
   - **Drop-off Rate ($DO \in [0.10, 0.20]/\text{year}$)**: Deterioration of impact over time (default $0.15$).
   - **Discount Rate ($r = 8\%$ standard)**: Standard social discount rate ($0.08$).
   - **Time Horizon ($N = 3$ years standard)**.

---

### 3.3 Sponsor Reliability Index (SRI)

An automated scorecard ($0-100$ scale) evaluating corporate partners based on transactional performance:

$$\text{SRI} = 0.40 \times S_{\text{fulfillment}} + 0.30 \times S_{\text{timeliness}} + 0.20 \times S_{\text{retention}} + 0.10 \times S_{\text{mentorship}}$$

Where:
- $S_{\text{fulfillment}} = \min\left(100.0, \frac{\text{Total Released Funds}}{\text{Total Promised Funds}} \times 100\right) \quad (\text{if promised} = 0, S_{\text{fulfillment}} = 100.0)$
- $S_{\text{timeliness}} = \frac{\text{Tranches Released Within 14 Days of Milestone Approval}}{\text{Total Approved Tranches}} \times 100 \quad (\text{default } 100.0)$
- $S_{\text{retention}} = \max\left(0.0, 100.0 - \frac{\text{Withdrawn Agreements}}{\text{Total Executed Agreements}} \times 100\right)$
- $S_{\text{mentorship}} = \min\left(100.0, \frac{\text{Completed Mentorship Hours}}{\text{Promised Mentorship Hours}} \times 100\right) \quad (\text{if promised} = 0, S_{\text{mentorship}} = 100.0)$

---

### 3.4 University Participation & Performance Index (UPI)

A comprehensive benchmark ($0-100$ scale) measuring institutional societal research translation:

$$\text{UPI} = 0.25 \times U_{\text{claim}} + 0.25 \times U_{\text{milestone}} + 0.20 \times U_{\text{mentorship}} + 0.15 \times U_{\text{sponsor}} + 0.15 \times U_{\text{pilot}}$$

Where:
- $U_{\text{claim}} = \min\left(100.0, \frac{\text{Allocated Team Intakes}}{\text{Direct Claim Intakes}} \times 100\right)$
- $U_{\text{milestone}} = \min\left(100.0, \frac{\text{Milestones Approved on Schedule}}{\text{Total Submitted Milestones}} \times 100\right)$
- $U_{\text{mentorship}} = \min\left(100.0, \frac{\text{Active Faculty Mentors}}{\text{Total Verified Faculty}} \times 100\right)$
- $U_{\text{sponsor}} = \min\left(100.0, \frac{\text{Projects Securing Industry Sponsorship}}{\text{Total Active Projects}} \times 100\right)$
- $U_{\text{pilot}} = \min\left(100.0, \frac{\text{Projects Transitioning to Field Pilot / Completed}}{\text{Total Active Projects}} \times 100\right)$

---

### 3.5 CSR Capital Utilization Metric Suite

To support corporate social responsibility accounting and regulatory compliance (MCA Section 135), M7 defines a complete first-class financial metric suite:

| Metric Name | Formula / Definition | Financial Purpose |
| :--- | :--- | :--- |
| **Committed Funds** | $\sum \text{Agreement.promised\_amount}$ across all agreements | Total corporate funding pledged across projects. |
| **Approved Funds** | $\sum \text{Agreement.promised\_amount}$ for agreements in `APPROVED` or `ACTIVE` status | Funds legally committed to active innovation teams. |
| **Released Funds** | $\sum \text{Disbursement.released\_amount}$ where status is `RELEASED` | Actual capital disbursed from sponsor accounts to project escrow/institution. |
| **Utilized Funds** | $\sum \text{Disbursement.released\_amount}$ associated with approved milestone deliverables (M5) | Funds converted into verified project deliverables, prototypes, or field pilots. |
| **Unutilized Funds** | $\text{Released Funds} - \text{Utilized Funds}$ | Capital disbursed to project accounts that has not yet been justified by milestone approvals. |
| **CSR Utilization %** | $\left(\frac{\text{Utilized Funds}}{\text{Released Funds}}\right) \times 100$ | Capital absorption and execution efficiency of supported innovation projects. |
| **Cost per Beneficiary** | $\frac{\text{Utilized CSR Funds}}{\text{Verified Beneficiaries Reached}}$ | Unit capital cost required to deliver tangible societal benefit to one citizen. |
| **Funding Efficiency Ratio** | $\frac{\text{Gross Economic Value Created}}{\text{Utilized CSR Funds}}$ | Leverage multiplier showing rupees of societal value generated per rupee of CSR invested. |

---

### 3.6 Project Success Index (PSI) & Quality Metrics

To assess project execution health and quality across all stages of M5, M7 defines a canonical **Project Success Index (PSI)** ($0-100$ scale):

$$\text{PSI} = 0.25 \times M_{\text{completion}} + 0.20 \times M_{\text{ontime}} + 0.20 \times M_{\text{pilot}} + 0.15 \times M_{\text{adoption}} + 0.10 \times M_{\text{review}} + 0.10 \times M_{\text{sustain}}$$

Where:
- **Milestone Completion Rate ($M_{\text{completion}}$)**: $\frac{\text{Approved Milestones}}{\text{Total Planned Milestones}} \times 100$
- **On-Time Delivery Rate ($M_{\text{ontime}}$)**: $\frac{\text{Milestones Approved Without Deadline Extension}}{\text{Total Approved Milestones}} \times 100$
- **Pilot Success Rate ($M_{\text{pilot}}$)**: Score ($0-100$) based on pilot deployment verification and field validation evidence (M5/M6).
- **Adoption / Beneficiary Reach ($M_{\text{adoption}}$)**: $\min\left(100.0, \frac{\text{Actual Verified Beneficiaries}}{\text{Target Beneficiary Population}} \times 100\right)$
- **Faculty Review Score ($M_{\text{review}}$)**: Normalized faculty/expert evaluation score ($0-100$) from milestone assessments.
- **Deployment Sustainability ($M_{\text{sustain}}$)**: Indicator ($0-100$) reflecting local civic handover, maintenance plan verification, and operational continuity post-pilot.

---

### 3.7 Geographic Aggregation & Boundary Edge Case Rules

To ensure district $\rightarrow$ state $\rightarrow$ national rollups remain strictly conserved and free of metric drift, M7 enforces the following canonical boundary rules:

1. **Multi-District Projects**:
   - When an innovation project addresses a challenge spanning multiple districts, its impact measures (beneficiaries, economic value, pilot outcomes) are partitioned across districts **proportionally based on the target population per district** specified in the challenge.
   - If population breakdown is unspecified, impact is split equally across participating districts.
2. **Multi-State Projects**:
   - Projects spanning multiple states aggregate into constituent state tallies via their constituent district allocations without double-counting.
3. **Out-of-State Universities**:
   - Academic performance credit (UPI, research credits, faculty mentor hours) accrues strictly to the **university's registered home state and district**.
   - Societal impact credit (beneficiaries, local civic savings, physical outcomes) accrues strictly to the **district and state where the citizen challenge originated**.
4. **National Sponsors**:
   - Corporate CSR budget commitments accrue to the sponsor's corporate headquarters in national totals, while localized project grants attribute directly to the receiving project districts.
5. **Beneficiary Deduplication**:
   - Beneficiary counts for multiple milestones or iterations within the same citizen challenge are deduplicated using the unique `challenge_id` anchor. Sequential milestones update verified reach rather than summing repeatedly.

---

## 4. Canonical Governance Metric Registry

The following master registry defines all platform governance metrics, formulas, data lineage, aggregation rules, and refresh cadences:

| Metric Name | Canonical Formula / Calculation | Source Modules | Aggregation Rule | Refresh Cadence |
| :--- | :--- | :--- | :--- | :--- |
| **Social Return on Investment (SROI)** | $\text{PV}(\text{Societal Benefits}) / \text{Capital Invested}$ | M4, M5, M6 | Project $\rightarrow$ District $\rightarrow$ State $\rightarrow$ National (Capital-weighted average) | Daily Materialized / On-Demand |
| **Sponsor Reliability Index (SRI)** | $0.40 S_1 + 0.30 S_2 + 0.20 S_3 + 0.10 S_4$ | M6 | Sponsor Entity (Independent) | Daily Materialized |
| **University Participation Index (UPI)** | $0.25 U_1 + 0.25 U_2 + 0.20 U_3 + 0.15 U_4 + 0.15 U_5$ | M4, M5, M6 | University Entity (Rolls up to State Academic Leaderboard) | Daily Materialized |
| **Project Success Index (PSI)** | $0.25 M_1 + 0.20 M_2 + 0.20 M_3 + 0.15 M_4 + 0.10 M_5 + 0.10 M_6$ | M5, M6 | Project Entity (Rolls up to District Innovation Score) | Daily Materialized / On-Demand |
| **District Innovation & Resolution Index (DIRI)** | $0.40 \text{ResRate} + 0.30 \text{TeamDensity} + 0.20 \text{SponCov} + 0.10 \text{PilotRatio}$ | M2, M3, M5, M6 | District $\rightarrow$ State Comparative Heatmap | Daily Materialized |
| **CSR Capital Utilization** | $(\text{Utilized Funds} / \text{Released Funds}) \times 100$ | M6, M5 | Sponsor $\rightarrow$ Project $\rightarrow$ District $\rightarrow$ State $\rightarrow$ National (Sum-conserved) | Daily Materialized |
| **Cost per Beneficiary** | $\text{Utilized CSR Funds} / \text{Verified Beneficiaries}$ | M5, M6 | Project $\rightarrow$ District $\rightarrow$ State $\rightarrow$ National | Daily Materialized |
| **Funding Efficiency Ratio** | $\text{Gross Economic Value} / \text{Utilized CSR Funds}$ | M5, M6 | Project $\rightarrow$ District $\rightarrow$ State $\rightarrow$ National | Daily Materialized |
| **Verified Beneficiary Reach** | $\sum \text{Deduplicated Affected Population}$ | M2, M5 | District $\rightarrow$ State $\rightarrow$ National (Sum-conserved) | Real-time / Daily Rollup |
| **Innovation Pipeline Funnel Velocity** | Stage conversion rate $\eta_i$ & mean dwell time $\Delta t_i$ | M2 $\rightarrow$ M6 | National Platform Funnel | Daily Materialized |

---

## 5. Functional Requirements

### 5.1 District & State Geographic Intelligence
* **FR-M7-01 (District Scorecard)**: Compute district-level aggregated indicators (total challenges submitted, solved percentage, active student teams, academic partner count, total CSR deployed, estimated SROI, DIRI).
* **FR-M7-02 (State Comparative Heatmap)**: Provide state-level geo-spatial telemetry aggregating all constituent districts, ranking districts by Innovation & Problem Resolution Index.
* **FR-M7-03 (National Overview)**: Aggregate all states into a national governance summary with macro SDG alignment metrics.

### 5.2 SROI & Impact Analytics
* **FR-M7-04 (Project SROI Calculation)**: Compute project-specific and aggregate SROI using verified economic valuation proxies and social discount parameters.
* **FR-M7-05 (Domain Impact Aggregation)**: Aggregate domain-specific physical metrics (`water_conserved_liters`, `energy_saved_kwh`, etc.) by district, state, and challenge category.
* **FR-M7-06 (Beneficiary Reach)**: Compute cumulative verified beneficiary counts deduplicated across multi-phase projects.

### 5.3 Stakeholder Scorecards & Leaderboards
* **FR-M7-07 (Sponsor Reliability Scorecard)**: Compute and publish the SRI for every verified corporate partner.
* **FR-M7-08 (University Performance Index)**: Compute UPI scores for universities, providing breakdown across intake claim, milestone completion, and pilot conversion.
* **FR-M7-09 (Student Innovation Leaderboard)**: Rank active student teams by verified deliverables, milestone quality scores, and pilot deployment status.

### 5.4 CSR Utilization & Compliance Exports
* **FR-M7-10 (CSR Utilization Report)**: Generate audit-proof CSR contribution summaries for enterprise sponsors, detailing promised, approved, released, and utilized grants.
* **FR-M7-11 (MCA CSR-1 Compliance Package)**: Export standardized social impact compliance packages conforming to Ministry of Corporate Affairs Section 135 requirements.
* **FR-M7-12 (NAAC/NIRF Accreditation Report)**: Export institutional innovation evidence reports for universities.

### 5.5 Public Transparency & Open Data
* **FR-M7-13 (Public Transparency Portal)**: Expose public, unauthenticated, read-only analytics views with PII masked.
* **FR-M7-14 (Open Data Export)**: Allow public download of anonymized societal impact datasets with cryptographic SHA-256 integrity digests.

### 5.6 Snapshot Materialization & Scheduled Rollups
* **FR-M7-15 (Daily Materialized Rollups)**: Scheduled background pipeline to materialize analytical snapshots by district, university, and sponsor to ensure sub-50ms response times.
* **FR-M7-16 (On-Demand Snapshot Recalculation)**: Admin trigger to recalculate analytical snapshots for specific districts or dates.

---

## 6. Non-Functional Requirements (NFRs)

1. **Performance**: Governance and public analytics queries must resolve in $< 100\text{ ms}$ for 99th percentile of requests using pre-aggregated snapshots.
2. **Deterministic Reproducibility**: Given identical transactional records in M1–M6, SROI and index calculations must yield 100% identical floating-point results rounded to 2 decimal places.
3. **Data Privacy & Anonymization**: Zero PII of citizen submitters, student innovators, or faculty evaluators exposed via public governance endpoints.
4. **Audit Immutability**: All governance snapshot generation and report export events must emit immutable audit log entries.
5. **Contract Continuity**: Zero changes to locked M1–M6 database models, enums, or REST envelopes.
