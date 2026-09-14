# System Design Document (design.md)

# 1. System Overview

SICP (Societal Innovation Collaboration Platform) is an AI-driven ecosystem that transforms citizen-reported societal challenges into deployable solutions through collaboration among universities, students, industry partners, and government agencies.

The platform acts as an orchestration layer between stakeholders and provides automated problem classification, prioritization, university matching, industry collaboration, project tracking, and impact measurement.

---

# 2. High-Level Architecture

```
                Citizens
                    │
                    ▼
           Frontend Portal
     (Web + Mobile Responsive)
                    │
                    ▼
              API Gateway
                    │
```

┌──────────────┬──────────────┬──────────────┐
▼              ▼              ▼              ▼
Auth       Problem       Project        Analytics
Service    Service       Service        Service
│              │              │              │
└──────┬───────┴──────┬───────┴──────────────┘
▼              ▼
AI Engine   Recommendation Engine
│              │
▼              ▼
NLP/CV Models   University Matching
│              │
└──────┬───────┘
▼
PostgreSQL + PostGIS
│
▼
Object Storage (Media)

---

# 3. User Roles

## Citizen

* Submit societal challenges
* Upload media evidence
* Track progress

## Student

* Join projects
* Submit deliverables
* Collaborate with faculty

## Faculty

* Mentor projects
* Evaluate proposals
* Approve milestones

## Industry

* Sponsor projects
* Provide mentorship
* Offer infrastructure/resources

## Government

* Monitor deployment
* Validate outcomes
* View district analytics

## Admin

* Platform management
* User moderation
* Verification workflows

---

# 4. Microservices

## Authentication Service

Responsibilities:

* Login
* Registration
* OTP Verification
* JWT Issuance
* Role Management

Endpoints:

* POST /auth/login
* POST /auth/register
* POST /auth/verify

---

## Problem Service

Responsibilities:

* Problem submission
* Media handling
* Status tracking
* Verification workflow

Endpoints:

* POST /problems
* GET /problems/{id}
* PUT /problems/{id}

---

## AI Service

Responsibilities:

* Classification
* Duplicate detection
* Priority scoring
* Keyword extraction
* Summarization

Endpoints:

* POST /ai/classify
* POST /ai/priority
* POST /ai/similarity

---

## Recommendation Service

Responsibilities:

* University matching
* Faculty recommendation
* Student recommendation
* Industry recommendation

Endpoints:

* GET /recommend/universities
* GET /recommend/faculty
* GET /recommend/industry

---

## Project Service

Responsibilities:

* Team formation
* Milestone tracking
* Lifecycle management

Endpoints:

* POST /projects
* GET /projects
* PATCH /projects/status

---

## Analytics Service

Responsibilities:

* Dashboard metrics
* Impact reporting
* District statistics

Endpoints:

* GET /analytics/dashboard
* GET /analytics/impact

---

# 5. AI Architecture

Citizen Input
(Text/Image/Voice)
│
▼
Preprocessing Layer
│
┌──────┼────────┐
▼      ▼        ▼
NLP   Vision   Speech
│      │        │
▼      ▼        ▼
Classification
Priority Score
Duplicate Detection
Entity Extraction
│
▼
Recommendation Engine
│
▼
University Matching

---

# 6. AI Models

## NLP

Purpose:

* Problem understanding
* Category prediction

Models:

* IndicBERT
* BERT
* mBERT

---

## Duplicate Detection

Purpose:

* Similar problem clustering

Models:

* Sentence Transformers
* SBERT

Output:

* Similarity Score

---

## Computer Vision

Purpose:

* Analyze uploaded images

Examples:

* Road damage
* Waste accumulation
* Water contamination indicators

Models:

* YOLOv8
* EfficientNet

---

## Speech Processing

Purpose:

* Voice submission support

Pipeline:
Speech → Text → NLP

Tools:

* Whisper
* Indic Speech Models

---

# 7. Database Design

## USERS

user_id (PK)
name
email
phone
role
trust_score
created_at

---

## PROBLEMS

problem_id (PK)
title
description
category
subcategory
priority_score
location
status
citizen_id

---

## UNIVERSITIES

university_id (PK)
name
district
expertise_tags
research_centers

---

## FACULTY

faculty_id (PK)
university_id
specialization
experience

---

## STUDENTS

student_id (PK)
university_id
skills
year

---

## PROJECTS

project_id (PK)
problem_id
university_id
status
impact_score

---

## INDUSTRIES

industry_id (PK)
domain
resources
funding_capacity

---

## COLLABORATIONS

collaboration_id (PK)
project_id
industry_id
role

---

## MILESTONES

milestone_id (PK)
project_id
title
status
deadline

---

# 8. Technology Stack

## Frontend

* Next.js
* React
* TailwindCSS
* TypeScript

---

## Backend

* FastAPI
* Python

---

## Database

* PostgreSQL
* PostGIS
* Redis

---

## AI Layer

* PyTorch
* Transformers
* Sentence Transformers
* Whisper

---

## Storage

* MinIO
* AWS S3 Compatible Storage

---

## Maps

* OpenStreetMap
* Leaflet

---

## DevOps

* Docker
* Docker Compose
* Nginx
* GitHub Actions

---

# 9. Security Architecture

Authentication:

* JWT
* Refresh Tokens

Authorization:

* RBAC

Protection:

* Rate Limiting
* Input Validation
* File Scanning
* Audit Logs

Encryption:

* HTTPS
* Password Hashing (Argon2)

---

# 10. Scalability Strategy

Phase 1:

* Single State Deployment

Phase 2:

* Multi-State Deployment

Phase 3:

* National Innovation Network

Scalability Measures:

* Stateless APIs
* Redis Caching
* Horizontal Scaling
* CDN Media Delivery

---

# 11. Deployment Architecture

Frontend
│
▼
Nginx Load Balancer
│
▼
FastAPI Services
│
┌──┴─────┐
▼        ▼
Redis   PostgreSQL
│
▼
PostGIS
│
▼
Object Storage

---

# 12. Key Innovation Components

1. AI Problem Classification
2. AI Priority Scoring
3. Semantic Duplicate Detection
4. University Matching Engine
5. Faculty Recommendation Engine
6. Industry Collaboration Engine
7. Social Impact Analytics
8. Innovation Lifecycle Tracking
