# Module: M2 Citizen Challenge Management — [STATUS: LOCKED 🔒]

## Status
🔒 **LOCKED & VERIFIED** (Completed: Milestone 2)  
Readiness Score: **100 / 100**  
Verification: **58 / 58 Tests Passing**  
Date: **2026-09-14**  

---

## 1. What M2 Provides

Module 2 delivers the complete **Citizen Challenge Management** subsystem for the Societal Innovation Collaboration Platform (SICP). It enables citizens to capture, geo-locate, document, and submit societal problems, while empowering evaluators and administrators to review, approve, publish, close, or archive challenges through a strictly validated, role-authorized state machine.

### Core Capabilities:
1. **Challenge Capture & Lifecycle:** Complete CRUD capabilities for societal challenges with UUID primary keys and `created_by` ownership anchoring.
2. **Deterministic State Machine:** Strict validation of 8 lifecycle states (`draft`, `submitted`, `under_review`, `approved`, `published`, `closed`, `rejected`, `archived`) preventing illegal transitions.
3. **Role-Action Authorization Matrix:** Fine-grained access control ensuring citizens only mutate their own drafts, while evaluation and publishing are reserved for evaluators and admins.
4. **Multipart Evidence Uploads:** Safe media asset attachments with magic-byte MIME type inspection (JPEG, PNG, PDF), executable rejection (`.exe`, `.sh`), 10MB file caps, and maximum 5 assets per challenge.
5. **Storage Abstraction:** Storage layer (`BaseStorageService` and `LocalStorageService`) engineered for seamless drop-in extension to AWS S3 and MinIO.
6. **Optimistic Locking & Concurrency Safeguards:** `version` column compare-and-swap update semantics rejecting conflicting updates (HTTP 409) and double-submission protection.
7. **Comprehensive Audit Trails:** Automatic logging of 6 key lifecycle actions (`CHALLENGE_CREATED`, `CHALLENGE_UPDATED`, `STATUS_CHANGED`, `ASSET_UPLOADED`, `CHALLENGE_ARCHIVED`, `VISIBILITY_CHANGED`).
8. **Frontend Citizen Workspace:** Complete Next.js 15 App Router interface including interactive map coordinate picker, media uploader, personal management dashboard, public challenge catalog, and detailed view pages.

---

## 2. API Endpoints

All endpoints conform to standard JSON envelopes:
- Success: `{"success": true, "data": {...}}`
- Error: `{"success": false, "error": {"code": "...", "message": "...", "details": {...}}}`

| HTTP Method | Route | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/challenges` | Create a new challenge (`draft` or `submitted`) | Yes | `citizen`, `admin` |
| `GET` | `/api/v1/challenges` | List published challenges with filters & pagination | Optional / Public | All |
| `GET` | `/api/v1/challenges/my-challenges` | List challenges created by the current user | Yes | Any authenticated user |
| `GET` | `/api/v1/challenges/{id}` | Retrieve challenge details & asset attachments | Yes / Public | Author, Evaluator, Admin (Public if `published`) |
| `PATCH` | `/api/v1/challenges/{id}` | Update draft challenge fields with optimistic locking | Yes | Author (if `draft`), `admin` |
| `PATCH` | `/api/v1/challenges/{id}/status` | Execute validated state machine transition | Yes | Governed by Authorization Matrix |
| `POST` | `/api/v1/challenges/{id}/assets` | Upload multipart image/PDF evidence (max 5 assets) | Yes | Author (if `draft`), `admin` |
| `DELETE` | `/api/v1/challenges/{id}` | Soft-delete a draft challenge | Yes | Author (if `draft`), `admin` |

---

## 3. Database Tables

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

## 4. State Machine

```
               ┌───────────┐
               │   draft   │◄───────── (Creator Creates Draft)
               └─────┬─────┘
                     │ (Creator Submits)
                     ▼
               ┌───────────┐
      ┌───────►│ submitted │
      │        └─────┬─────┘
      │              │ (Evaluator Starts Review)
      │              ▼
      │        ┌──────────────┐
(Changes Req)  │ under_review ├──────────┐ (Evaluator Rejects)
      │        └─────┬────────┘          ▼
      │              │ (Evaluator) ┌───────────┐
      │              ▼             │ rejected  │ [Terminal]
      │        ┌───────────┐       └───────────┘
      └────────┤ approved  │
               └─────┬─────┘
                     │ (Admin/Evaluator Publishes)
                     ▼
               ┌───────────┐
               │ published │
               └─────┬─────┘
                     │ (Admin/Evaluator Closes)
                     ▼
               ┌───────────┐
               │  closed   │
               └─────┬─────┘
                     │ (Admin Archives)
                     ▼
               ┌───────────┐
               │ archived  │ [Terminal]
               └───────────┘
```

### Valid State Transitions Table
| Current State | Target State | Allowed Trigger Roles | Notes |
| :--- | :--- | :--- | :--- |
| `[None]` | `draft`, `submitted` | `citizen`, `admin` | Challenge creation |
| `draft` | `submitted` | Author (`citizen`), `admin` | Final submission for review |
| `submitted` | `under_review` | `faculty` (Evaluator), `admin` | Evaluator claims challenge |
| `under_review`| `approved` | `faculty` (Evaluator), `admin` | Quality criteria met |
| `under_review`| `rejected` | `faculty` (Evaluator), `admin` | Fails platform standards [Terminal] |
| `approved` | `published` | `admin`, `faculty` (Evaluator) | Challenge made visible in catalog |
| `approved` | `submitted` | `admin`, `faculty` (Evaluator) | Request author revisions |
| `published` | `closed` | `admin`, `faculty` (Evaluator) | Problem solved or intake closed |
| `closed` | `archived` | `admin` | Historical preservation [Terminal] |
| `published` | `archived` | `admin` | Historical preservation [Terminal] |

---

## 5. Authorization Matrix

| Action | Citizen (Author) | Citizen (Non-Author) | Student | Evaluator (Faculty) | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Challenge** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Edit Draft Fields** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Upload Asset** | ✅ (Draft) | ❌ | ❌ | ❌ | ✅ |
| **Submit Challenge** | ✅ (Draft) | ❌ | ❌ | ❌ | ✅ |
| **View Published** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Draft** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Start Review (`under_review`)**| ❌ | ❌ | ❌ | ✅ | ✅ |
| **Approve / Reject** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Publish Challenge** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Close Challenge** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Archive Challenge** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Soft Delete Draft** | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 6. Known Limitations

1. **Local Storage in Dev:** The active storage implementation writes to local disk (`uploads/`). S3 and MinIO drivers are architected via `BaseStorageService` and ready to configure in production deployment.
2. **Synchronous In-Memory Idempotency:** Idempotency caching for double-submission protection currently operates in-memory; horizontal scaling in production will connect to distributed Redis.
3. **Draft-Only Edits:** Challenges in `submitted`, `under_review`, or `published` states cannot have their narrative fields edited directly to preserve evaluation integrity.

---

## 7. Dependencies Exposed to M3 (AI Intelligence Engine)

Module 3 will consume the following contracts established and frozen in M2:

1. **Database Tables:**
   - `challenges`: `title`, `description`, `category`, `district`, `state`, `affected_population`, `status`.
   - `challenge_assets`: Attached media URLs and file paths for multimodal analysis.
2. **AI Fields in `challenges` Schema:**
   - `priority_score` (FLOAT): Target field where M3 will persist automated priority ratings ($0.0 - 100.0$).
   - `ai_category_prediction` (VARCHAR): Target field where M3 will store NLP-predicted categories.
3. **Event Hooks / Ingestion Triggers:**
   - Ingestion trigger on challenges transitioning to `submitted` or `published`.
   - Embeddings generator consuming `title` + `description` to populate duplicate cluster vectors.
