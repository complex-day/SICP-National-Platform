# System Architecture & Design Document (DESIGN) — Module 4: Academic Collaboration Hub

**Document Version:** 1.1 (Hardened Design)  
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

## 1. Architectural Overview & Context

Module 4 delivers the **Academic Collaboration Hub** subsystem within the SICP Layered Architecture. It integrates institutional onboarding, departmental structures, faculty governance, tenant-scoped administrative authorization, multi-factor AI challenge matching, and academic problem intake with multi-team allocations.

### 1.1 Layered Architecture Pattern

```
┌────────────────────────────────────────────────────────┐
│               FastAPI API Routing Layer                │
│   /api/v1/academic (Universities, Departments, Intake) │
└───────────────────────────┬────────────────────────────┘
                            │ (Dependency Injection: require_university_admin)
┌───────────────────────────▼────────────────────────────┐
│                     Service Layer                      │
│   UniversityService, DepartmentService, IntakeService  │
│   MatchingEngineService (Multi-Factor Scoring Engine)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Async Session)
┌───────────────────────────▼────────────────────────────┐
│                   Repository Layer                     │
│   UniversityRepository, DepartmentRepository,          │
│   AffiliationRepository, AcademicIntakeRepository      │
└───────────────────────────┬────────────────────────────┘
                            │ (SQLAlchemy ORM / Async)
┌───────────────────────────▼────────────────────────────┐
│            PostgreSQL 16 Relational Engine             │
│ universities, departments, faculty_affiliations,       │
│ university_administrators, academic_intakes,           │
│ intake_team_allocations -> challenges, teams, users    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Domain Models & Database Schema

### 2.1 Enumerations (`app.core.constants`)

```python
class UniversityStatus(str, Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    SUSPENDED = "SUSPENDED"
    REJECTED = "REJECTED"

class AffiliationStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"
    REVOKED = "REVOKED"

class IntakeStatus(str, Enum):
    ROUTED = "ROUTED"
    ACCEPTED = "ACCEPTED"
    ASSIGNED = "ASSIGNED"
    DECLINED = "DECLINED"
    COMPLETED = "COMPLETED"

class IntakeType(str, Enum):
    AI_MATCHED = "AI_MATCHED"
    DIRECT_CLAIM = "DIRECT_CLAIM"
    ADMIN_ASSIGNED = "ADMIN_ASSIGNED"

class TeamAllocationStatus(str, Enum):
    ALLOCATED = "ALLOCATED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    REMOVED = "REMOVED"
```

### 2.2 Relational Entity Schemas (PostgreSQL DDL)

#### 1. `universities` Table
```sql
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    accreditation_details JSONB DEFAULT '{}'::jsonb,
    domain_expertise JSONB DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_universities_unique_name ON universities(name) WHERE is_deleted = false;
CREATE UNIQUE INDEX idx_universities_unique_code ON universities(code) WHERE is_deleted = false;
CREATE INDEX idx_universities_location ON universities(state, district) WHERE is_deleted = false;
CREATE INDEX idx_universities_status ON universities(status) WHERE is_deleted = false;
```

#### 2. `university_administrators` Table (Tenant-Scoped Authorization)
```sql
CREATE TABLE university_administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_unique_university_admin ON university_administrators(university_id, user_id) WHERE is_deleted = false;
CREATE INDEX idx_university_admin_user ON university_administrators(user_id) WHERE is_deleted = false;
```

#### 3. `departments` Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_of_department_id UUID REFERENCES users(id) ON DELETE SET NULL,
    specializations JSONB DEFAULT '[]'::jsonb,
    contact_email VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_dept_unique_name_per_univ ON departments(university_id, name) WHERE is_deleted = false;
CREATE UNIQUE INDEX idx_dept_unique_code_per_univ ON departments(university_id, code) WHERE is_deleted = false;
CREATE INDEX idx_departments_university ON departments(university_id) WHERE is_deleted = false;
```

#### 4. `faculty_affiliations` Table
```sql
CREATE TABLE faculty_affiliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforces exactly 1 active affiliation per faculty across platform
CREATE UNIQUE INDEX idx_faculty_unique_active_affiliation 
ON faculty_affiliations(faculty_id) 
WHERE is_deleted = false AND status = 'ACTIVE';

CREATE INDEX idx_faculty_dept_affiliation ON faculty_affiliations(department_id, status) WHERE is_deleted = false;
```

#### 5. `academic_intakes` Table (Challenge Adoption)
```sql
CREATE TABLE academic_intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE RESTRICT,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'ROUTED',
    intake_type VARCHAR(30) NOT NULL DEFAULT 'AI_MATCHED',
    match_score NUMERIC(5,2) DEFAULT 0.00,
    match_reasoning JSONB DEFAULT '{}'::jsonb,
    claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforces single active claim per university per challenge
CREATE UNIQUE INDEX idx_intakes_unique_univ_challenge 
ON academic_intakes(university_id, challenge_id) 
WHERE is_deleted = false AND status != 'DECLINED';

CREATE INDEX idx_intakes_challenge ON academic_intakes(challenge_id) WHERE is_deleted = false;
CREATE INDEX idx_intakes_university ON academic_intakes(university_id, status) WHERE is_deleted = false;
```

#### 6. `intake_team_allocations` Table (1:N Team & Mentor Binding)
```sql
CREATE TABLE intake_team_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_id UUID NOT NULL REFERENCES academic_intakes(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    faculty_mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'ALLOCATED',
    allocated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_unique_intake_team ON intake_team_allocations(intake_id, team_id) WHERE is_deleted = false;
CREATE INDEX idx_allocations_mentor ON intake_team_allocations(faculty_mentor_id, status) WHERE is_deleted = false;
```

---

## 3. Multi-Factor AI Matching Engine Specification

In strict compliance with `Docs/ai-design.md` and `AGENTS.md` Rule 6, matching computation is deterministic, explainable, and eliminates duplicate weights:

$$\text{Match Score} = 0.40 \times S_{\text{domain}} + 0.25 \times S_{\text{faculty}} + 0.15 \times S_{\text{proximity}} + 0.10 \times S_{\text{track\_record}} + 0.10 \times S_{\text{student\_cohort}}$$

### Sub-Score Calculation Definitions:
1. **$S_{\text{domain}}$ (40%)**: Jaccard / Cosine overlap between challenge category + tags and university/department declared domain expertise.
2. **$S_{\text{faculty}}$ (25%)**: Ratio of available faculty in relevant department with active mentoring slots $< 3$ (normalized $0 \dots 100$).
3. **$S_{\text{proximity}}$ (15%)**: Deterministic Geospatial Proximity Formula:
   - **Case 1: Administrative Match**:
     - If $\text{district}_{\text{univ}} == \text{district}_{\text{challenge}}$ (Case-insensitive): $S_{\text{proximity}} = 100.0$
     - Else if $\text{state}_{\text{univ}} == \text{state}_{\text{challenge}}$: $S_{\text{proximity}} = 75.0$
   - **Case 2: Haversine Distance $d$ (km)**:
     - $d \le 25\text{ km} \implies S_{\text{proximity}} = 100.0$
     - $25\text{ km} < d \le 100\text{ km} \implies S_{\text{proximity}} = 100.0 - 0.33 \times (d - 25)$
     - $100\text{ km} < d \le 500\text{ km} \implies S_{\text{proximity}} = 75.0 - 0.125 \times (d - 100)$
     - $d > 500\text{ km} \implies S_{\text{proximity}} = \max(0.0, 25.0 - 0.05 \times (d - 500))$
   - **Case 3: Fallback (Different State, no GPS)**: $S_{\text{proximity}} = 25.0$
4. **$S_{\text{track\_record}}$ (10%)**: Historical challenge completion ratio (completed / total adopted) by the institution.
5. **$S_{\text{student\_cohort}}$ (10%)**: Number of active multidisciplinary student teams formed in the relevant department.

### Mentoring Capacity Constraints:
- **Platform Limit**: Max 3 active mentoring allocations per faculty member across the entire platform.
- **Challenge Limit**: Max 1 team mentorship per faculty member per specific challenge.
- **Team Limit**: Max 2 active mentors per M3 student team.

### Explainability Output Schema:
```json
{
  "total_score": 88.5,
  "breakdown": {
    "domain_expertise_score": 95.0,
    "faculty_availability_score": 80.0,
    "proximity_score": 100.0,
    "track_record_score": 75.0,
    "student_cohort_score": 85.0
  },
  "explanation": "High domain match with Environmental Engineering department in same district (100% proximity), with 4 faculty members holding open mentoring capacity."
}
```

---

## 4. Tenant-Scoped RBAC & Authorization Architecture

### 4.1 Dependency Injection Helper (`require_university_admin`)
```python
async def require_university_admin(
    university_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UniversityAdministrator:
    # 1. Platform SuperAdmin bypass per AGENTS.md Rule 5
    if current_user.role == UserRole.ADMIN:
        return UniversityAdministrator(university_id=university_id, user_id=current_user.id, is_primary=True)
    
    # 2. Check institutional administration binding
    admin_record = await AcademicRepository.get_university_admin(db, university_id, current_user.id)
    if not admin_record or admin_record.is_deleted:
        raise ForbiddenError("User is not an authorized administrator of this university.")
    return admin_record
```

### 4.2 RBAC Authorization Matrix

| Endpoint | Method | Allowed Caller | Scope Enforced |
| :--- | :---: | :---: | :--- |
| `POST /academic/universities` | `POST` | `faculty`, `admin` | Global registration |
| `PATCH /academic/universities/{id}/status` | `PATCH` | `admin` | Platform Admin only |
| `PATCH /academic/universities/{id}` | `PATCH` | University Admin, `admin` | Institutional boundary |
| `POST /academic/universities/{id}/departments` | `POST` | University Admin, `admin` | Institutional boundary |
| `PATCH /academic/departments/{id}/hod` | `PATCH` | University Admin, `admin` | Validates active affiliated faculty |
| `POST /academic/affiliations` | `POST` | `faculty` | Current user faculty ID |
| `POST /academic/affiliations/{id}/verify` | `POST` | University Admin, `admin` | Department's parent university |
| `POST /academic/intakes/claim` | `POST` | University Admin, `faculty`, `admin` | Active university verification |
| `POST /academic/intakes/{id}/allocations` | `POST` | University Admin, HOD, `admin` | Validates mentor capacity (max 2) |

---

## 5. Audit Trail Architecture (20 Granular Actions)

Module 4 emits structured audit records via `AuditRepository.log`:
- **University Lifecycle**: `UNIVERSITY_REGISTERED`, `UNIVERSITY_VERIFIED`, `UNIVERSITY_REJECTED`, `UNIVERSITY_SUSPENDED`, `UNIVERSITY_UPDATED`
- **Admin Governance**: `UNIVERSITY_ADMIN_ASSIGNED`, `UNIVERSITY_ADMIN_REMOVED`
- **Department Lifecycle**: `DEPARTMENT_CREATED`, `DEPARTMENT_UPDATED`, `DEPARTMENT_DELETED`, `HOD_ASSIGNED`
- **Faculty Affiliations**: `FACULTY_AFFILIATION_REQUESTED`, `FACULTY_AFFILIATION_APPROVED`, `FACULTY_AFFILIATION_REJECTED`, `FACULTY_AFFILIATION_REVOKED`
- **Intake & Allocations**: `CHALLENGE_ROUTED_TO_UNIVERSITY`, `CHALLENGE_CLAIMED_BY_UNIVERSITY`, `CHALLENGE_DECLINED_BY_UNIVERSITY`, `TEAM_ALLOCATED_TO_CHALLENGE`, `FACULTY_MENTOR_ASSIGNED_TO_TEAM`
