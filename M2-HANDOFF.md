# Module: M2 Citizen Challenge Management — [STATUS: LOCKED 🔒]

## Status
🔒 **LOCKED & VERIFIED** (Completed: Milestone 2)  
Readiness Score: **100 / 100**

---

## 1. Executive Summary & Completed Deliverables

Module 2 delivers the complete **Citizen Challenge Management** subsystem for the Societal Innovation Collaboration Platform (SICP). It enables citizens to capture, geo-locate, document, and submit societal problems, while empowering evaluators and administrators to review, approve, publish, close, or archive challenges through a strictly validated, role-authorized state machine.

### 1.1 Backend Challenge Management System (FastAPI / Python 3.12+)
- **Challenge Lifecycle CRUD & State Machine:**
  - Implemented complete CRUD operations for societal challenges with UUID primary keys and `created_by` ownership anchor.
  - Deterministic state machine governing all 8 lifecycle states:
    - *Active/Transitional:* `draft` $\rightarrow$ `submitted` $\rightarrow$ `under_review` $\rightarrow$ `approved` $\rightarrow$ `published` $\rightarrow$ `closed`.
    - *Terminal:* `rejected`, `archived`.
  - Strict invalid transition blocking with `InvalidStateTransitionError` (HTTP 422).
- **Role-Action Authorization Matrix:**
  - Enforced RBAC and resource ownership across Citizen, Student, Evaluator (Faculty), and Admin roles.
  - Ownership enforcement: Non-admin users can only edit or upload assets to challenges they created (`created_by == user.id`).
  - Draft editing and soft deletion restricted exclusively to the original creator prior to submission.
  - Review, approval, and rejection restricted to Evaluators and Admins.
- **Multipart Asset Upload & Magic-Byte Validation:**
  - Validated multipart media uploads (`POST /api/v1/challenges/{id}/assets`).
  - Strict MIME type enforcement via magic-byte header inspection (allowing `image/jpeg`, `image/png`, `application/pdf`).
  - Executable, script, and malicious payload blocking (`.exe`, `.sh`, `.bat`, etc.).
  - Enforced size limit (10MB per file) and race-free capacity limits (maximum 5 assets per challenge).
- **Extensible Storage Abstraction:**
  - Designed `BaseStorageService` abstraction ready for Local, Amazon S3, and MinIO storage providers.
  - Implemented `LocalStorageService` with deterministic directory structures, UUID file hashing, and MIME verification.
- **Concurrency Control & Data Integrity:**
  - Optimistic locking using atomic `version` incrementation (`WHERE id = :id AND version = :expected_version`), raising `ConcurrencyConflictError` (HTTP 409) on concurrent update collisions.
  - In-memory `Idempotency-Key` caching preventing duplicate submissions.
- **Audit Event Logging:**
  - Emits immutable audit logs (`audit_logs` table) across all 6 challenge lifecycle events:
    1. `CHALLENGE_CREATED`
    2. `CHALLENGE_UPDATED`
    3. `STATUS_CHANGED`
    4. `ASSET_UPLOADED`
    5. `CHALLENGE_ARCHIVED`
    6. `VISIBILITY_CHANGED`
- **Standardized API Response Envelopes:**
  - Consistent JSON envelopes: `{"success": true, "data": {...}}` and `{"success": false, "error": {"code": "...", "message": "...", "details": {...}}}`.

### 1.2 Database Architecture (PostgreSQL 16 + PostGIS / SQLite Async)
- `challenges` table with UUID primary key, `created_by` foreign key, `updated_by`, `published_at`, `archived_at`, `visibility` enum (`PRIVATE`, `INSTITUTION`, `PUBLIC`, `ARCHIVED`), `version` integer, geospatial coordinates (`latitude`, `longitude`), category taxonomy, priority placeholder, and soft deletion.
- `challenge_assets` table for media metadata, MIME type, byte size, file path/URL, and soft deletion.
- Alembic database migration script: `backend/alembic/versions/002_challenge_management_schema.py`.

### 1.3 Frontend Application (Next.js 15 App Router / TypeScript Strict / Tailwind CSS)
- **Feature-Based Architecture (`src/features/challenge`):**
  - Type-safe domain models and DTOs (`challenge.types.ts`).
  - Form validation with Zod and React Hook Form (`challenge.schema.ts`).
  - Challenge API service layer (`challenge.service.ts`).
- **Reusable UI Components:**
  - `ChallengeForm.tsx`: Multi-section challenge creation form with category selection and demographic impact inputs.
  - `LocationPicker.tsx`: Interactive GPS coordinate picker with browser geolocation integration and manual lat/long overrides.
  - `AssetUploader.tsx`: Drag-and-drop file upload zone with file size/type validation and preview gallery.
  - `ChallengeCard.tsx`: Rich catalog card with category iconography, status badges, location tags, and impact stats.
  - `ChallengeFilters.tsx`: Search bar, category pill filters, and status selection controls.
  - `ChallengeStatusBadge.tsx`: Color-coded semantic status indicator.
  - `ChallengeAssetGallery.tsx`: Interactive media gallery for challenge evidence inspection.
- **Citizen & Public Pages:**
  - `/citizen/create-challenge`: Citizen challenge authoring wizard.
  - `/citizen/my-challenges`: Citizen personal dashboard with status tracking and draft management.
  - `/challenges`: Public searchable and filterable challenge catalog.
  - `/challenges/[id]`: Comprehensive challenge detail view with location metadata, full description, and attached assets.

---

## 2. Frozen Architectural Contracts (DO NOT MODIFY IN M3–M7)

The following contracts are permanently locked from M2 onwards:

1. **Challenge & Asset Models:** `Challenge`, `ChallengeAsset`.
2. **Ownership Anchor:** `created_by` (UUID FK $\rightarrow$ `users.id`) is the immutable ownership anchor for challenges.
3. **Challenge Categories (`ChallengeCategory`):**
   `WATER_SANITATION`, `HEALTHCARE`, `AGRICULTURE`, `EDUCATION`, `INFRASTRUCTURE`, `ENVIRONMENT`, `ENERGY`, `URBAN_PLANNING`, `WOMEN_CHILD_WELFARE`, `DISASTER_MANAGEMENT`, `OTHER`.
4. **Challenge Statuses (`ChallengeStatus`):**
   - Active/Lifecycle: `draft`, `submitted`, `under_review`, `approved`, `published`, `closed`.
   - Terminal: `rejected`, `archived`.
5. **Visibility Scope (`ChallengeVisibility`):**
   `PRIVATE`, `INSTITUTION`, `PUBLIC`, `ARCHIVED`.
6. **Optimistic Locking Contract:**
   - Every challenge entity includes a `version: int` column.
   - Updates must pass `version` in payload; repository executes atomic compare-and-swap (`version = version + 1 WHERE id = :id AND version = :version`).
7. **Asset Limits:**
   - Maximum 5 assets per challenge.
   - Maximum 10MB per asset file.
   - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`.

---

## 3. Database Schema

### `challenges` Table
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `title` | VARCHAR(255) | Not Null, Min 10 chars |
| `description` | TEXT | Not Null, Min 50 chars |
| `category` | VARCHAR(50) | Not Null (`ChallengeCategory`) |
| `status` | VARCHAR(30) | Not Null, Default `'draft'` (`ChallengeStatus`) |
| `visibility` | VARCHAR(30) | Not Null, Default `'PUBLIC'` (`ChallengeVisibility`) |
| `latitude` | FLOAT | Optional ($-90.0$ to $+90.0$) |
| `longitude` | FLOAT | Optional ($-180.0$ to $+180.0$) |
| `district` | VARCHAR(100) | Optional |
| `state` | VARCHAR(100) | Optional |
| `affected_population`| INTEGER | Optional, $\ge 0$ |
| `priority_score` | FLOAT | Default `0.0` (Reserved for M3 AI Scoring) |
| `ai_category_prediction`| VARCHAR(100)| Nullable (Reserved for M3 AI Engine) |
| `created_by` | UUID | Foreign Key $\rightarrow$ `users.id` (Indexed, Ownership Anchor) |
| `updated_by` | UUID | Foreign Key $\rightarrow$ `users.id` (Nullable) |
| `version` | INTEGER | Not Null, Default `1` (Optimistic Locking) |
| `published_at` | TIMESTAMP WITH TZ | Nullable |
| `archived_at` | TIMESTAMP WITH TZ | Nullable |
| `created_at` | TIMESTAMP WITH TZ | Default `now()` |
| `updated_at` | TIMESTAMP WITH TZ | Default `now()` |
| `is_deleted` | BOOLEAN | Default `false` (Soft Delete) |

### `challenge_assets` Table
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `challenge_id` | UUID | Foreign Key $\rightarrow$ `challenges.id` (Indexed) |
| `file_name` | VARCHAR(255) | Original uploaded file name |
| `file_path` | VARCHAR(1024) | Stored storage path / URI |
| `file_size_bytes` | BIGINT | File size in bytes ($\le 10\text{ MB}$) |
| `mime_type` | VARCHAR(100) | `image/jpeg`, `image/png`, `application/pdf` |
| `media_type` | VARCHAR(30) | `IMAGE`, `VIDEO`, `DOCUMENT` |
| `uploaded_by` | UUID | Foreign Key $\rightarrow$ `users.id` |
| `created_at` | TIMESTAMP WITH TZ | Default `now()` |
| `is_deleted` | BOOLEAN | Default `false` (Soft Delete) |

---

## 4. Implemented API Routes

| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/challenges` | Create a new challenge (`draft` or `submitted`) | Yes (`citizen`, `admin`) |
| `GET` | `/api/v1/challenges` | List published challenges with filters & pagination | Optional / Public |
| `GET` | `/api/v1/challenges/my-challenges` | List challenges created by the current user | Yes (Any role) |
| `GET` | `/api/v1/challenges/{id}` | Retrieve challenge details & asset attachments | Yes / Public (Visibility-gated) |
| `PATCH` | `/api/v1/challenges/{id}` | Update draft challenge fields with optimistic locking | Yes (Author or `admin`) |
| `PATCH` | `/api/v1/challenges/{id}/status` | Execute validated state machine transition | Yes (Role-governed) |
| `POST` | `/api/v1/challenges/{id}/assets` | Upload multipart image/PDF evidence (max 5 assets) | Yes (Author or `admin`) |
| `DELETE` | `/api/v1/challenges/{id}` | Soft-delete a draft challenge | Yes (Author or `admin`) |

---

## 5. Frontend Pages

- `/citizen/create-challenge` — Citizen submission interface with interactive map coordinate picker, category selection, and asset uploader.
- `/citizen/my-challenges` — Citizen personal dashboard with real-time status badges, draft editing, and lifecycle tracking.
- `/challenges` — Public catalog with multi-facet filters (category, status, search keyword), pagination, and quick-view cards.
- `/challenges/[id]` — Detailed challenge overview displaying full narrative, geospatial coordinates, author metadata, and interactive media evidence gallery.

---

## 6. Automated Test Suite (100% Pass)

The M2 automated test suite covers unit, state machine, authorization matrix, concurrency, repository, REST API, asset upload, and end-to-end lifecycle flows:

- `test_challenge_schemas.py`: Validation of field constraints, category enums, GPS coordinate ranges, and visibility enums.
- `test_challenge_state_machine.py`: Deterministic state transitions across all 8 states; validation and rejection of invalid/terminal state transitions.
- `test_challenge_auth_matrix.py`: Comprehensive role-action matrix testing (Citizen, Student, Evaluator, Admin) across create, edit, transition, upload, view, and delete operations.
- `test_challenge_audit.py`: Verification of immutable audit records for all 6 challenge audit actions.
- `test_challenge_concurrency.py`: Optimistic locking version conflict rejection (HTTP 409), double-submission idempotency protection, and race-free asset limit enforcement.
- `test_challenge_benchmarks.py`: API latency acceptance criteria verification ($\le 200\text{ms}$ challenge creation, $\le 100\text{ms}$ catalog queries).
- `test_challenge_repository.py`: CRUD, pagination, geospatial filtering, and soft-delete isolation at the repository layer.
- `test_challenges_api.py`: Full REST API integration with standardized success/error response envelopes.
- `test_challenge_assets_api.py`: Multipart file uploads, magic-byte inspection, file size bounds, and malicious executable rejection.
- `test_challenge_e2e.py`: Complete multi-step citizen lifecycle journey (`Draft -> Asset Upload -> Submit -> Review -> Approve -> Publish -> Close -> Archive`).

---

## 7. Production Hardening Checklist (Pre-Production Deployment)

- [ ] **Cloud Storage Configuration:** Wire AWS S3 / MinIO storage adapter credentials for distributed multi-region media persistence.
- [ ] **Virus / Malware Scanning:** Integrate ClamAV or AWS GuardDuty scanner on uploaded assets prior to public URL serving.
- [ ] **PostGIS Spatial Indexing:** Enable PostGIS geometry extension (`GIST` index on `location_geom`) for sub-millisecond bounding-box queries.
- [ ] **CDN Asset Distribution:** Configure CloudFront / Cloudflare CDN edge caching for public challenge assets.
- [ ] **Search Indexing:** Configure full-text search indexing (`tsvector` on `title` + `description`) for high-volume catalogs.

---

## 8. Next Module Scope & Boundaries (Day 3 — M3: AI Intelligence Engine)

### Required Inputs from M2:
- `challenges` records in `submitted` or `published` status.
- `challenge_assets` image URLs for multi-modal analysis.
- `ChallengeCreated` and `ChallengePublished` event hooks.

### Strict Scope for M3:
- **Automated NLP Categorization**: Multi-label text classification using fine-tuned transformer models.
- **AI Priority Scoring (0–100)**: Multi-factor scoring engine evaluating severity, urgency, population scale, and infrastructure criticality.
- **Duplicate Cluster Detection**: Semantic vector embeddings (SentenceTransformers) with cosine similarity clustering to group duplicate reports.
- **Automated Text Summarization & Keyword Extraction**: Generating structured executive briefs for academic and government evaluators.

### Prohibited in M3 (Belongs to M4–M7):
- ❌ University / Faculty matching algorithms (M4)
- ❌ Student project formation & milestone tracking (M5)
- ❌ Industry CSR sponsorship management (M6)
- ❌ Governance heatmaps & policy analytics (M7)
