# Technical Architecture & Domain Design — Module 6: Industry Partnership Network

**Document Version:** 1.1 (Refined Conceptual & Domain Design Specification)  
**Module ID:** M6  
**Module Name:** Industry Partnership Network  
**Status:** 📋 **PROPOSED SPECIFICATION (PENDING APPROVAL)**  
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

## 1. Domain Architecture & Aggregate Boundaries

The Module 6 domain model establishes an institutional collaboration and resource-allocation network between corporate industry entities and student-led innovation projects.

```mermaid
graph TD
    subgraph "Aggregate Root 1: IndustryPartner"
        IP["<b>IndustryPartner (Entity / Aggregate Root)</b><br/>• Verification Status<br/>• Corporate Identity & CIN<br/>• CSR Budget & Domain Focus"]
    end

    subgraph "Aggregate Root 2: PartnershipAgreement (Central Aggregate)"
        PA["<b>PartnershipAgreement (Aggregate Root)</b><br/>• Project Binding (M5)<br/>• Partner Binding (M6)<br/>• Partnership Type<br/>• Commitment Lifecycle<br/>• MoU Terms & Bounds<br/>• Optimistic Concurrency"]
        
        subgraph "Exclusive Child Entities & Manifests"
            SD["<b>SponsorshipDisbursement (Child Entity)</b><br/>• Exclusive to Agreement<br/>• Milestone Linkage (M5)<br/>• Tranche Index & Amount<br/>• Disbursement State"]
            
            MS["<b>MentorshipSession (Child Entity)</b><br/>• Exclusive to Agreement<br/>• Mentor Identity (M1)<br/>• Duration & Topics<br/>• Verification State"]
            
            EM["<b>EquipmentManifest (Value Object)</b><br/>• Itemized Promised Units<br/>• Verified Delivered Units"]
            
            PD["<b>PilotScope (Value Object)</b><br/>• Location & Facility Bounds<br/>• Deployment Evidence"]
        end
    end

    subgraph "M5 Innovation Project (External Aggregate Root)"
        Proj["<b>InnovationProject (M5 Aggregate Root)</b><br/>Status ∈ {PROPOSAL, ACTIVE, PROTOTYPE, PILOT, REVIEW_READY}"]
        Milestone["<b>ProjectMilestone (M5 Entity)</b><br/>Status: APPROVED (Tranche Gate)"]
    end

    IP -->|1:N| PA
    PA -->|N:1| Proj
    PA *-- SD
    PA *-- MS
    PA *-- EM
    PA *-- PD
    SD -.->|Gated by| Milestone
```

### 1.1 Cardinality & Many-to-Many ($M:N$) Architecture

To prevent single-sponsor misconceptions, the domain model explicitly defines:
1. **`IndustryPartner (1) <---> (N) PartnershipAgreement`**: An industry partner can sponsor multiple projects simultaneously.
2. **`InnovationProject (1) <---> (N) PartnershipAgreement`**: An innovation project can receive multiple sponsorships simultaneously across funding, equipment, mentorship, and pilot testbeds.
3. **Derived Association**:
   $$\text{IndustryPartner} \xleftrightarrow{M:N} \text{InnovationProject}$$
   *The many-to-many relationship between Industry Partners and Innovation Projects is mediated exclusively through the `PartnershipAgreement` aggregate.*

### 1.2 Aggregate Boundaries & Exclusive Child Ownership

#### A. Aggregate Root: `IndustryPartner`
* **Boundary**: Manages corporate profile identity, accreditation records, verification lifecycle, and corporate contact bindings.
* **Invariants Enforced by Root**:
  - Only organizations with `PartnerVerificationStatus.VERIFIED` can initiate partnership proposals, enter agreements, or assign corporate mentors.
  - Profile updates do not mutate historical agreements or completed disbursements.

#### B. Aggregate Root: `PartnershipAgreement` (Central Domain Aggregate)
* **Boundary**: Encapsulates the complete contractual relationship between an `IndustryPartner`, an `InnovationProject`, and a `PartnershipType`.
* **Strict Child Ownership Invariant**:
  - `SponsorshipDisbursement` and `MentorshipSession` are **strictly subordinate** to their parent `PartnershipAgreement`.
  - Child entities **cannot exist independently**, cannot be orphaned, and cannot be re-parented to another agreement or project.
  - All operations on tranches or sessions must be mediated through the `PartnershipAgreement` aggregate root.
* **Invariants Enforced by Root**:
  - **M5 Pre-condition**: An agreement can only be created against an active project in `SPONSORSHIP_ELIGIBLE_PROJECT_STATUSES` (`PROPOSAL`, `ACTIVE`, `PROTOTYPE`, `PILOT`, `REVIEW_READY`).
  - **Tranche Upper Bound**: The sum of scheduled/released tranches must never exceed `promised_amount` ($\sum \text{tranche\_amount}_j \le \text{promised\_amount}$).
  - **Financial Balance**: $\text{released\_amount} \le \text{promised\_amount}$ and $\text{remaining\_amount} = \text{promised\_amount} - \text{released\_amount}$.
  - **Equipment Bounds**: $\text{delivered\_quantity} \le \text{promised\_quantity}$.
  - **Mentorship Bounds**: $\text{completed\_hours} \le \text{promised\_hours}$.
  - **Pilot Evidence Gate**: Transition to `FULFILLED` requires verified deployment evidence.
  - **Concurrency Protection**: All mutations require version matching via optimistic concurrency control.

---

## 2. Domain State Machines & Withdrawal Propagation Rules

### 2.1 `PartnerVerificationStatus` State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_VERIFICATION: Organization Registers
    
    PENDING_VERIFICATION --> VERIFIED: Admin Verifies Credentials (CIN/CSR-1/MSME)
    PENDING_VERIFICATION --> REJECTED: Incomplete / Fraudulent Registration
    
    VERIFIED --> SUSPENDED: Admin Suspends (Policy Breach / Default)
    SUSPENDED --> VERIFIED: Compliance Issue Resolved
    
    VERIFIED --> INACTIVE: Voluntary Deactivation
    INACTIVE --> VERIFIED: Re-activated by Partner
    
    REJECTED --> [*]
```

---

### 2.2 `CommitmentStatus` State Machine (Partnership Agreement)

```mermaid
stateDiagram-v2
    [*] --> PROPOSED: Partner Submits Proposal OR Team Requests
    
    PROPOSED --> APPROVED: Bilateral Stakeholder Acceptance
    PROPOSED --> REJECTED: Declined by Team / Faculty / Partner
    PROPOSED --> EXPIRED: 30-Day Window Elapsed Without Action
    
    APPROVED --> ACTIVE: Terms Executed & Support Commenced
    APPROVED --> WITHDRAWN: Retraction Prior to Start Date
    
    ACTIVE --> FULFILLED: All Obligations Verified (Funds / Hours / Units / Pilot)
    ACTIVE --> WITHDRAWN: Partner Exits Mid-Lifecycle (Gap Calculated)
    
    FULFILLED --> [*]
    REJECTED --> [*]
    EXPIRED --> [*]
    WITHDRAWN --> [*]
```

### 2.3 Withdrawal State Rules & Child Entity Propagation

When a `PartnershipAgreement` transitions to `WITHDRAWN`:
1. **Child Entity Propagation Rules**:
   - **Financial Tranches (`SponsorshipDisbursement`)**: All pending/scheduled tranches (`SCHEDULED`, `PENDING_VERIFICATION`) are immediately **cancelled and frozen**. No future disbursements can be released under this agreement.
   - **Mentorship Sessions (`MentorshipSession`)**: No new mentorship sessions can be logged or credited toward this agreement.
   - **Equipment Deliveries**: No new equipment delivery confirmations or receipts can be accepted.
   - **Pilot Deployment**: No new pilot evidence submissions can be accepted.
2. **Historical Preservation Invariant**:
   - All historical tranches previously marked `RELEASED`, sessions previously marked `VERIFIED`, and equipment previously marked delivered **remain permanently intact and immutable**.
3. **Resource Gap Calculation**:
   - Unreleased funds ($\text{promised} - \text{released}$) are marked as a project deficit, alerting team leaders and opening re-sponsorship opportunities in the marketplace.

---

### 2.4 `DisbursementStatus` State Machine (Financial Tranches)

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Tranche Configured & Linked to Milestone
    
    SCHEDULED --> PENDING_VERIFICATION: M5 Milestone Approved (MILESTONE_APPROVED)
    PENDING_VERIFICATION --> RELEASED: Payment Reference Verified
    PENDING_VERIFICATION --> FAILED: Bank Transfer Failed / Dispute
    FAILED --> PENDING_VERIFICATION: Payment Re-initiated
    
    RELEASED --> [*]
```

---

### 2.5 `MentorshipSessionStatus` State Machine

```mermaid
stateDiagram-v2
    [*] --> LOGGED: Industry Mentor Logs Meeting
    
    LOGGED --> VERIFIED: Attendance & Time Confirmed by Team Lead / Faculty
    LOGGED --> DISPUTED: Team Disputes Duration or Attendance
    DISPUTED --> VERIFIED: Dispute Resolved by Faculty Mentor / Admin
    DISPUTED --> REJECTED: Session Found Invalid / No Attendance
    
    VERIFIED --> [*]: Credited Toward Agreement Completed Hours
    REJECTED --> [*]: Zero Hours Credited
```

---

## 3. Concurrency Design & Protected Race Scenarios

Module 6 employs **Optimistic Concurrency Control** (`version` checking on aggregate roots) to prevent data corruption during simultaneous operations:

### 3.1 Protected Race Scenarios

```mermaid
sequenceDiagram
    autonumber
    actor Admin1 as Platform Admin 1
    actor Admin2 as Platform Admin 2
    participant PA as PartnershipAgreement (Version = 5)
    participant DB as Persistence Layer

    Admin1->>PA: Read Agreement (Version 5) to Release Tranche 1
    Admin2->>PA: Read Agreement (Version 5) to Release Tranche 1
    
    Admin1->>DB: Commit Tranche Release (Assert Version == 5, Increment to 6)
    DB-->>Admin1: Success (Version 6 committed)
    
    Admin2->>DB: Commit Tranche Release (Assert Version == 5)
    DB-->>Admin2: ERROR 409: OPTIMISTIC_LOCK_ERROR (Current Version is 6)
    Note over Admin2: Duplicate disbursement prevented
```

1. **Scenario A: Concurrent Tranche Releases**:
   - Two administrators or corporate officers attempting to mark the same tranche as `RELEASED` simultaneously. Version checking prevents duplicate balance increments.
2. **Scenario B: Simultaneous Approval and Partner Withdrawal**:
   - Student leader approves proposal while sponsor submits withdrawal concurrently. Version conflict forces re-evaluation against the updated state.
3. **Scenario C: Concurrent Manifest / Tranche Updates**:
   - Sponsor updates tranche amounts while student lead accepts previous terms. Conflict raises HTTP `409 Conflict` (`OPTIMISTIC_LOCK_ERROR`).

---

## 4. Event Flow Diagrams

### 4.1 Funding Sponsorship & Milestone Tranche Flow

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Industry Partner
    actor Lead as Student Team Leader
    actor Mentor as Faculty Mentor
    participant M6 as Module 6 (Partnerships)
    participant M5 as Module 5 (Projects)
    participant Audit as M1 Audit Ledger

    Partner->>M6: Browse Marketplace & Select Project
    Partner->>M6: Propose FUNDING Agreement (₹5,00,000, Tranches)
    M6->>Audit: Emit PARTNERSHIP_PROPOSED
    
    Lead->>M6: Accept Agreement Terms
    Mentor->>M6: Co-sign & Approve Agreement
    M6->>Audit: Emit PARTNERSHIP_APPROVED & PARTNERSHIP_ACTIVATED
    
    Note over M5,M6: Project Team builds Milestone 1 (Sprint execution)
    Lead->>M5: Submit Milestone 1 Deliverables
    Mentor->>M5: Review & Grade Milestone 1 (APPROVED)
    M5->>Audit: Emit MILESTONE_APPROVED
    
    M5->>M6: Milestone Approved Event Trigger
    M6->>M6: Transition Tranche 1 (₹2,00,000) to PENDING_VERIFICATION
    M6->>Audit: Emit DISBURSEMENT_SCHEDULED
    
    Partner->>M6: Upload Bank Reference & Invoice
    M6->>M6: Verify & Mark RELEASED (released_amount = ₹2,00,000)
    M6->>Audit: Emit DISBURSEMENT_RELEASED
```

---

### 4.2 Corporate Mentorship Engagement Flow

```mermaid
sequenceDiagram
    autonumber
    actor CorpMentor as Industry Mentor
    actor Lead as Student Team Leader
    actor FacMentor as Faculty Mentor
    participant M6 as Module 6 (Partnerships)
    participant Audit as M1 Audit Ledger

    Note over M6: MENTORSHIP Agreement is ACTIVE (40 Hours Committed)
    CorpMentor->>Lead: Conduct Architecture Review Meeting (2 Hours)
    CorpMentor->>M6: Log Session (Date, 2.0 Hrs, IoT Firmware Architecture)
    M6->>Audit: Emit MENTORSHIP_SESSION_LOGGED
    
    Lead->>M6: Confirm Attendance & Duration (Verified)
    M6->>M6: Increment completed_hours (+2.0 Hrs)
    Lead-->>M6: (Optional) Submit Session Rating (5/5) & Feedback
    M6->>Audit: Emit MENTORSHIP_FEEDBACK_GIVEN
```

---

### 4.3 Equipment & Asset Contribution Flow

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Industry Partner
    actor Lead as Student Team Leader
    actor FacMentor as Faculty Mentor
    participant M6 as Module 6 (Partnerships)
    participant Audit as M1 Audit Ledger

    Partner->>M6: Propose EQUIPMENT Agreement (10x LoRaWAN Sensor Nodes)
    Lead->>M6: Accept Proposal
    FacMentor->>M6: Approve Academic Compatibility (ACTIVE)
    
    Partner->>Lead: Physical Delivery / Cloud License Provisioning
    Lead->>M6: Upload Delivery Receipt & Serial Numbers
    FacMentor->>M6: Verify Physical Asset Inspection
    M6->>M6: Increment delivered_quantity (+10 Nodes)
    M6->>M6: Mark Agreement FULFILLED
    M6->>Audit: Emit EQUIPMENT_DELIVERY_CONFIRMED & PARTNERSHIP_FULFILLED
```

---

### 4.4 Pilot Deployment & Field Testing Flow

```mermaid
sequenceDiagram
    autonumber
    actor MunicipalHost as Pilot Host / Partner
    actor Lead as Student Team Leader
    actor FacMentor as Faculty Mentor
    participant M6 as Module 6 (Partnerships)
    participant M5 as Module 5 (Projects)
    participant Audit as M1 Audit Ledger

    Note over M5: Project reaches Stage: FIELD_PILOT / Status: PILOT
    MunicipalHost->>M6: Propose PILOT_DEPLOYMENT (Ward 12 Water Tank Testbed)
    Lead->>M6: Accept Pilot Site Terms
    FacMentor->>M6: Approve Safety & Academic Protocol (ACTIVE)
    
    Note over Lead,MunicipalHost: Field deployment testing conducted on-site
    Lead->>M6: Upload Field Telemetry Logs & Municipal Sign-off Document
    MunicipalHost->>M6: Verify Site Operation & Test Results
    M6->>M6: Validate Deployment Evidence Gate
    M6->>M6: Transition Agreement to FULFILLED
    M6->>Audit: Emit PILOT_EVIDENCE_SUBMITTED & PARTNERSHIP_FULFILLED
```

---

### 4.5 Sponsor Withdrawal & Resource Gap Recovery Flow

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Industry Partner
    actor Lead as Student Team Leader
    actor FacMentor as Faculty Mentor
    actor UnivAdmin as University Admin
    participant M6 as Module 6 (Partnerships)
    participant Market as Innovation Marketplace
    participant Audit as M1 Audit Ledger

    Note over M6: Partner A has ACTIVE ₹5,00,000 Grant (₹2,00,000 Released, ₹3,00,000 Remaining)
    Partner->>M6: Request Withdrawal (Reason: Corporate Budget Reallocation)
    M6->>M6: Transition Status: ACTIVE -> WITHDRAWN (Zero Record Deletion)
    M6->>M6: Cancel All Unreleased Scheduled Tranches
    M6->>M6: Recalculate Project Active Funding: ₹2,00,000
    M6->>M6: Detect Resource Gap: ₹3,00,000 Deficit
    M6->>Audit: Emit PARTNERSHIP_WITHDRAWN (gap_amount = ₹3,00,000)
    
    M6->>Lead: Notify SPONSORSHIP_GAP_DETECTED (₹3,00,000)
    M6->>FacMentor: Notify Resource Shortfall
    M6->>UnivAdmin: Notify Departmental Funding Deficit
    
    M6->>Market: Republish ₹3,00,000 Funding Need to Marketplace
```

---

## 5. Audit Architecture & Append-Only Event Contracts

```mermaid
graph LR
    subgraph "M6 Mutating Operations"
        Op1["Partner Verification"]
        Op2["Agreement Lifecycle"]
        Op3["Tranche Disbursement"]
        Op4["Mentorship Logging"]
        Op5["Withdrawal & Expiry"]
    end

    subgraph "Append-Only Audit Engine"
        Repo["<b>AuditRepository.create_log</b><br/>(Strictly Insert-Only / No UPDATE / No DELETE)"]
    end

    subgraph "M1 Storage & M7 Intelligence"
        Log["<b>audit_logs</b> Table<br/>• action<br/>• entity_type<br/>• entity_id<br/>• user_id<br/>• metadata (JSON)<br/>• timestamp"]
        M7["<b>M7 Governance & Impact Analytics</b><br/>• Real-time CSR Deployment Index<br/>• Corporate Reliability Scoring<br/>• District SROI Aggregator"]
    end

    Op1 --> Repo
    Op2 --> Repo
    Op3 --> Repo
    Op4 --> Repo
    Op5 --> Repo
    Repo --> Log
    Log --> M7
```

### 5.1 Audit Log Record Specification

Every M6 audit record adheres to the canonical M1–M5 schema:
* `action`: Standardized `AuditAction` enum member.
* `entity_type`: Canonical domain entity string (`"industry_partner"`, `"partnership_agreement"`, `"sponsorship_disbursement"`, `"mentorship_session"`).
* `entity_id`: UUID of the affected entity.
* `user_id`: UUID of the authenticated actor executing the action.
* `timestamp`: UTC timestamp with timezone.
* `metadata`: Structured context dictionary (JSON).

### 5.2 Complete M6 Audit Event Catalog (Including Expiry)

| Audit Action | Entity Type | Trigger Event | Metadata Key Payloads |
| :--- | :--- | :--- | :--- |
| `INDUSTRY_PARTNER_REGISTERED` | `industry_partner` | Enterprise profile created | `company_name`, `domain`, `website` |
| `INDUSTRY_PARTNER_VERIFIED` | `industry_partner` | Admin approves accreditation | `verified_by`, `cin_number`, `accreditation_type` |
| `INDUSTRY_PARTNER_SUSPENDED` | `industry_partner` | Admin suspends partner | `reason`, `suspended_by` |
| `PARTNERSHIP_PROPOSED` | `partnership_agreement` | Proposal submitted | `project_id`, `partner_id`, `type`, `pledged_metric` |
| `PARTNERSHIP_APPROVED` | `partnership_agreement` | Team & faculty accept | `approved_by_lead`, `approved_by_faculty` |
| `PARTNERSHIP_ACTIVATED` | `partnership_agreement` | Agreement executed | `start_date`, `end_date`, `terms_hash` |
| `PARTNERSHIP_FULFILLED` | `partnership_agreement` | All obligations verified | `fulfilled_at`, `total_delivered_metric` |
| `PARTNERSHIP_WITHDRAWN` | `partnership_agreement` | Partner exits agreement | `withdrawal_reason`, `gap_amount`, `unreleased_metric` |
| `PARTNERSHIP_REJECTED` | `partnership_agreement` | Proposal declined | `rejection_reason`, `rejected_by` |
| `PARTNERSHIP_EXPIRED` | `partnership_agreement` | 30-day window elapsed without action | `expired_at`, `original_proposal_date` |
| `DISBURSEMENT_SCHEDULED` | `sponsorship_disbursement` | Tranche configured & linked | `agreement_id`, `milestone_id`, `tranche_number`, `amount` |
| `DISBURSEMENT_RELEASED` | `sponsorship_disbursement` | Tranche funds released | `transaction_reference`, `invoice_no`, `amount` |
| `MENTORSHIP_SESSION_LOGGED` | `mentorship_session` | Mentor logs session | `agreement_id`, `duration_hours`, `topics` |
| `MENTORSHIP_FEEDBACK_GIVEN` | `mentorship_session` | Team submits feedback | `session_id`, `student_rating`, `feedback` |
| `EQUIPMENT_DELIVERY_CONFIRMED` | `partnership_agreement` | Hardware received | `item_name`, `quantity`, `receipt_ref` |
| `PILOT_EVIDENCE_SUBMITTED` | `partnership_agreement` | Field proof uploaded | `evidence_url`, `checksum`, `location` |

---

## 6. Coverage & Gap Metric Architecture (Derived Business Metrics)

Module 6 defines business analytics derived dynamically at query time to guide project discovery in the marketplace, detect funding shortfalls, and feed M7 governance dashboards.

> [!IMPORTANT]
> **Architectural Invariant on Coverage Metrics**:
> `FundingCoverage%`, `FundingGap`, `MentorshipCoverage%`, and `EquipmentCoverage%` are **strictly derived business metrics** computed dynamically at query time. They are **NOT source-of-truth fields** and must **NEVER be persisted as static/denormalized database columns**.

```mermaid
graph LR
    subgraph "Project Resource Requirements (M5)"
        Target["Project Target Budget: ₹10,00,000"]
        ReqHours["Required Mentorship: 50 Hours"]
        ReqEquip["Required Hardware: 3 Categories"]
    end

    subgraph "Active Agreements (M6)"
        A1["Partner A (Funding): ₹5,00,000 Promised"]
        A2["Partner B (Funding): ₹2,50,000 Promised"]
        A3["Partner C (Mentor): 40 Hours Promised"]
        A4["Partner D (Equip): 2 Categories Covered"]
    end

    subgraph "Dynamic Derived Metrics (Query-Time Only)"
        Cov["<b>Funding Coverage</b>: 75%<br/>(₹7,50,000 / ₹10,00,000)"]
        Gap["<b>Funding Gap</b>: ₹2,50,000<br/>(Unmet Need on Marketplace)"]
        MCov["<b>Mentorship Coverage</b>: 80%<br/>(40 / 50 Hours)"]
        ECov["<b>Equipment Coverage</b>: 66.7%<br/>(2 / 3 Categories)"]
    end

    Target & A1 & A2 --> Cov & Gap
    ReqHours & A3 --> MCov
    ReqEquip & A4 --> ECov
```

### 6.1 Derivation Logic (Conceptual)
1. **Funding Coverage Percentage**:
   - Ratio of total active promised funding across `ACTIVE` and `FULFILLED` agreements to the project's target budget, capped at $100\%$.
2. **Funding Gap (INR)**:
   - Remaining unmet capital needed to reach the project target budget. Returns zero if fully covered.
3. **Mentorship Coverage Percentage**:
   - Ratio of active committed corporate mentorship hours to the project's required advisory hours.
4. **Equipment Coverage Percentage**:
   - Ratio of itemized equipment specifications with active/fulfilled commitments to total required equipment categories.

---

## 7. Cross-Module Dependencies & Data Flow Map

```mermaid
graph TD
    subgraph "Upstream Modules (Dependencies)"
        M1["<b>M1: Identity & Access Management</b><br/>• UserRole.INDUSTRY<br/>• RBAC: require_roles(['industry', 'admin'])<br/>• AuditRepository.create_log"]
        
        M4["<b>M4: Academic Collaboration Hub</b><br/>• University Institutional Context<br/>• Department & HOD MoUs<br/>• Faculty Mentor Affiliation"]
        
        M5["<b>M5: Innovation Project Lifecycle</b><br/>• InnovationProject Entities (Active Statuses)<br/>• ProjectMilestone (Approval Gating)<br/>• Deliverable Proof of Work"]
    end

    subgraph "Module 6: Industry Partnership Network"
        M6["<b>Module 6 Core Engine</b><br/>• Partner Accreditation<br/>• Multi-Sponsor Marketplace<br/>• Agreement Lifecycle<br/>• Milestone Tranches<br/>• Mentorship & Equipment Tracking<br/>• Withdrawal Gap Management"]
    end

    subgraph "Downstream Consumer (Future)"
        M7["<b>M7: Governance & Impact Intelligence</b><br/>• CSR Capital Deployment Analytics<br/>• Corporate Partner Reliability Index<br/>• District Impact Heatmaps (SROI)<br/>• Pilot-to-Policy Conversion Rate"]
    end

    M1 --> M6
    M4 --> M6
    M5 --> M6
    M6 --> M7
```

### 7.1 Upstream Consumed Contracts
* **M1 (IAM)**:
  - User authentication and role enforcement (`UserRole.INDUSTRY`, `UserRole.STUDENT`, `UserRole.FACULTY`, `UserRole.ADMIN`).
  - Base profile in `industries` table.
  - Append-only audit logger `AuditRepository.create_log`.
* **M4 (Academic Collaboration Hub)**:
  - Tri-partite agreement legal context linking student teams, university departments, and corporate sponsors.
  - Verification of primary faculty mentors authorized to co-sign agreements.
* **M5 (Innovation Project Lifecycle)**:
  - Target project state filtering (`SPONSORSHIP_ELIGIBLE_PROJECT_STATUSES`).
  - Milestone completion event triggers (`MILESTONE_APPROVED`) gating financial tranche releases.
  - Deliverables repository providing proof-of-work documentation for corporate CSR audit reports.

### 7.2 Downstream Emitted Contracts to M7 (Governance & Impact Intelligence)
* **Realized CSR Capital**: Exact monetary grants disbursed per district, university, and challenge domain.
* **Corporate Engagement Index**: Quantitative metrics tracking promised vs. fulfilled commitments, corporate mentor hours delivered, and partner reliability scores.
* **Pilot Conversion Velocity**: Number of prototypes transitioned from academic lab prototypes to validated municipal/industrial testbed pilots.
* **Social Return on Investment (SROI)**: Aggregated financial, technical, and equipment resources deployed per district.

---

## 8. Non-Functional Requirements (NFR)

* **Auditability & Traceability**: 100% of mutations across partner verification, agreement approvals, disbursements, sessions, and withdrawals emit append-only audit events. No historical record can be deleted.
* **Consistency & Financial Precision**: Monetary values must maintain exact decimal precision (`Numeric(15, 2)`) without floating-point artifacts. Tranche releases are strictly bounded by $\text{released} \le \text{promised}$.
* **Idempotency**: Disbursement executions and session hour verifications must be idempotent; duplicate release requests with the same transaction reference are safely rejected.
* **Concurrency Safety**: Optimistic concurrency control via version checking ensures zero lost updates during simultaneous multi-stakeholder approvals or modifications.
* **Historical Preservation**: Withdrawn partnerships and terminated proposals remain permanently queryable for historical analytics and compliance reporting.
* **Scalability**: Multi-sponsor marketplace filtering queries (across domain, district, stage, and coverage gap) must execute with sub-100ms response times at $10,000+$ concurrent projects.

---

## 9. Design Sign-Off & Review Status

- **Module ID**: M6 — Industry Partnership Network
- **Design Status**: 📋 **PROPOSED SPECIFICATION (REFINED)**
- **Next Step**: User review and approval before proceeding to **`M6-TDD.md`**.
