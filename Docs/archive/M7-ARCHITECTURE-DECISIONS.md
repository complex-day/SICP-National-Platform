# Module 7 (M7) — Architecture Decision Records (ADRs)

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

## 1. Executive Summary

Module 7 (M7) serves as the macro-intelligence, governance, and societal validation layer of the SICP platform. It synthesizes operational events, academic deliverables, challenge progress, and industry investments from Modules 1–6 into verified societal impact metrics, district/state heatmaps, university performance indices, sponsor reliability scorecards, Project Success Indices (PSI), CSR capital utilization metrics, and verifiable Social Return on Investment (SROI) computations.

This document establishes the frozen architectural principles and architectural decision records (ADRs) governing M7.

---

## 2. Architecture Decision Records (ADRs)

### ADR-M7-001: Read-Optimized Asynchronous Analytical Layer & CQRS Pattern

* **Context**: 
  - Modules 1–6 handle high-frequency transactional workflows (OLTP), emitting append-only records to `audit_logs` and state transitions on operational entities (`challenges`, `projects`, `partnership_agreements`).
  - Governance queries (e.g. State-level heatmaps, SROI calculations, NIRF/NAAC academic rankings) require complex, multi-table aggregations across millions of data points with sub-second response times.
* **Decision**: 
  - Implement a Command Query Responsibility Segregation (CQRS) analytical architecture.
  - Transactional tables remain isolated in OLTP schemas.
  - M7 maintains dedicated read-optimized logical analytical read models (`DistrictImpactSnapshot`, `UniversityPerformanceSnapshot`, `SponsorReliabilitySnapshot`, `ProjectImpactReport`) updated via scheduled/event-driven aggregation pipelines.
  - Real-time queries use fast materialized rollups with cache TTLs rather than scanning operational tables on every dashboard load.
* **Consequences**:
  - Zero performance degradation on transactional workflows in M1–M6.
  - Instantaneous dashboard rendering for Government, CSR, and University stakeholders.
  - Requires deterministic idempotency in snapshot generation.

---

### ADR-M7-002: SROI (Social Return on Investment) Standardization Framework

* **Context**: 
  - Societal innovation platforms often suffer from vague or unverified "impact claims" (e.g. subjective estimates of lives touched).
  - Government and CSR leaders require standard, auditable economic valuation methodologies to justify capital deployment.
* **Decision**: 
  - Adopt the international standard **SROI Framework (Cabinet Office / Social Value International)**:
    $$\text{SROI Ratio} = \frac{\text{Present Value of Net Societal Benefits (PV)}}{\text{Total Innovation Capital Invested}}$$
  - Societal Benefits are quantified through domain-specific, verifiable proxy indicators (e.g. cost per liter of clean water, health expenditure reduction per capita, energy savings per kWh) discounted by deadweight, displacement, and drop-off factors.
  - Capital invested includes CSR funding released (M6), university grant allocations (M4), and verified equipment valuation.
* **Consequences**:
  - Transparent, reproducible, and audit-proof SROI metrics for government reports and CSR compliance.
  - Subjective self-reporting is rejected; all impact claims must link to verified M5 milestones and M6 pilot deployment evidence.

---

### ADR-M7-003: Multi-Level Hierarchical Geographic Aggregation (`District` $\rightarrow$ `State` $\rightarrow$ `National`)

* **Context**: 
  - Administrative governance follows strict jurisdictional hierarchies in India: Local District Administrations (District Magistrate / Collectorate) $\rightarrow$ State Innovation Missions (State Government) $\rightarrow$ National Portals (Central Government / NITI Aayog).
* **Decision**: 
  - All impact data rolls up hierarchically using standardized LGD (Local Government Directory) district and state codes established in M2.
  - Multi-district projects partition impact proportionally by target population.
  - Out-of-state universities accrue academic index credit to their home institution state while societal impact accrues to the origin district of the challenge.
  - Aggregations are calculated at three strict tiers:
    1. **District Tier**: Problem resolution rate, active teams per 100k population, local CSR capital deployed.
    2. **State Tier**: Inter-district performance index, university participation coverage, statewide SROI.
    3. **National Tier**: Macro societal indicators, macro SROI, national challenge leaderboard.
* **Consequences**:
  - District Collectors receive localized district scorecards.
  - State and Central officials receive macro heatmaps and comparative disparity indicators without metric leakage.

---

### ADR-M7-004: Sponsor Reliability Index (SRI) and Capital Transparency

* **Context**: 
  - In M6, sponsors may promise large funding amounts but delay tranche releases or withdraw mid-project.
  - Governance bodies require objective partner quality metrics to distinguish reliable CSR partners from delinquent entities.
* **Decision**: 
  - Implement an automated, objective **Sponsor Reliability Index (SRI)** ($0-100$ scale) defined as:
    $$\text{SRI} = 0.40 \times \text{Fulfillment Rate} + 0.30 \times \text{Tranche Timeliness} + 0.20 \times (100 - \text{Withdrawal Rate}) + 0.10 \times \text{Mentorship Delivery}$$
  - Calculations are derived strictly from immutable transactional records in M6 (`sponsorship_disbursements`, `partnership_agreements`, `mentorship_sessions`).
* **Consequences**:
  - Prevents reputation inflation and protects student teams from unreliable sponsors.
  - High-SRI partners receive priority marketplace visibility and government commendations.

---

### ADR-M7-005: University Participation & Performance Index (UPI)

* **Context**: 
  - Educational authorities (UGC, AICTE, NAAC, NIRF) evaluate universities based on societal problem-solving, faculty research translation, and industry engagement.
* **Decision**: 
  - Implement the **University Participation Index (UPI)** ($0-100$ scale):
    $$\text{UPI} = 0.25 \times \text{Intake Claim Rate} + 0.25 \times \text{Milestone Success Rate} + 0.20 \times \text{Faculty Mentorship Index} + 0.15 \times \text{Industry Sponsorship Ratio} + 0.15 \times \text{Pilot Conversion Rate}$$
  - Universities can export verifiable, digitally signed NAAC/NIRF accreditation reports directly from M7.
* **Consequences**:
  - Incentivizes university leadership and faculty mentors to actively claim local challenges and maintain milestone quality.

---

### ADR-M7-006: Cryptographically Auditable Public Transparency & Export Formats

* **Context**: 
  - Public trust in civic governance requires open access to aggregate data while preserving privacy and commercial confidentiality.
* **Decision**: 
  - Public open data feeds and government report exports (PDF / CSV / JSON) include a cryptographic SHA-256 integrity hash matching platform audit state.
  - PII (Personally Identifiable Information) of student innovators and citizens is masked in public governance dashboards, while aggregate totals and anonymized case studies remain 100% open.
* **Consequences**:
  - Complete compliance with data privacy standards and RTI (Right to Information) open governance mandates.

---

### ADR-M7-007: Standardized Audit-Event Ingestion Contract & Idempotency

* **Context**: 
  - M7 must ingest events from M1 through M6 reliably without tight service coupling or fragile cross-module database foreign keys in the analytical pipeline.
* **Decision**: 
  - Enforce a strongly-typed, versioned **Audit-Event Ingestion Contract**:
    `{ event_id, event_type, actor_id, actor_role, source_module, entity_type, entity_id, occurred_at, payload, schema_version }`.
  - Ingestion processing is strictly idempotent by `event_id` and resilient to out-of-order event delivery.
* **Consequences**:
  - Decoupled analytical ingestion; safe replayability of historical operational events during snapshot recalculations.

---

### ADR-M7-008: Canonical Governance Metric Registry

* **Context**: 
  - Multiple platform stakeholders require precise, unambiguous definitions for SROI, SRI, UPI, PSI, CSR Utilization, and DIRI to prevent reporting discrepancy across state and national portals.
* **Decision**: 
  - Lock all metric formulas, source module mappings, aggregation rules, and refresh frequencies into a canonical **Governance Metric Registry** in PRD and Design.
* **Consequences**:
  - Universal consistency across all governance dashboards and export formats.

---

## 3. Architecture Sign-off Matrix

| Architecture Dimension | Selected Strategy | Justification |
| :--- | :--- | :--- |
| **Data Flow Pattern** | CQRS + Snapshot Materialization | Sub-second analytics without locking transactional tables |
| **Impact Valuation** | Standard SROI Framework | Verifiable, audit-proof, international standard |
| **Geo-Hierarchical Scale** | District $\rightarrow$ State $\rightarrow$ National Rollup | Matches administrative decision-making hierarchy with edge-case rules |
| **Sponsor Scoring** | Algorithmic Sponsor Reliability Index (SRI) | Objective, data-driven CSR transparency |
| **Academic Scoring** | University Participation Index (UPI) | Direct integration with NIRF/NAAC innovation criteria |
| **Project Quality** | Project Success Index (PSI) | Multi-indicator project execution health |
| **Financial Accounting** | CSR Capital Utilization Suite | MCA Section 135 compliance and fund transparency |
| **Event Ingestion** | Versioned Ingestion Contract (`schema_version = "1.0"`) | Idempotent, decoupled analytical event stream |
| **Audit Continuity** | Immutable Ledger Aggregation | Guaranteed cross-module traceability from M1 through M7 |
