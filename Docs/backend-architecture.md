# Backend Architecture Document

# Project

SICP – Societal Innovation Collaboration Platform

Backend Stack

* FastAPI
* Python 3.12
* PostgreSQL + PostGIS
* Redis
* Celery
* RabbitMQ
* MinIO / S3
* JWT Authentication
* Docker

Architecture Style

Modular Monolith → Event-Driven Microservices Ready

---

# 1. Backend Goals

The backend must:

* Handle millions of citizen reports
* Support AI-driven workflows
* Enable stakeholder collaboration
* Process large media uploads
* Provide real-time updates
* Remain horizontally scalable

---

# 2. High-Level Architecture

```
                Client Apps
                       │
                       ▼
                 API Gateway
                       │
```

┌────────────┬────────────┬────────────┬────────────┐
▼            ▼            ▼            ▼
Auth      Problem      Project     Analytics
Service    Service     Service      Service
│            │            │            │
└──────┬─────┴──────┬─────┴────────────┘
▼            ▼
AI Service   Recommendation Service
│            │
└──────┬─────┘
▼
PostgreSQL + Redis
│
▼
Message Queue
│
▼
Background Jobs

---

# 3. Service Boundaries

## Authentication Service

Responsibilities

* Registration
* Login
* JWT Issuance
* OTP Verification
* RBAC

Owns

* users
* roles
* permissions
* sessions

Never Handles

* AI
* Projects
* Analytics

---

## Problem Service

Responsibilities

* Problem Submission
* Media Upload
* Status Tracking
* Verification Workflow

Owns

* problems
* problem_media
* verification_records

Events Published

ProblemCreated

ProblemVerified

ProblemUpdated

---

## AI Service

Responsibilities

* Classification
* Duplicate Detection
* Priority Scoring
* Summarization

Owns

* embeddings
* ai_results

Consumes

ProblemCreated

Produces

ProblemAnalyzed

---

## Recommendation Service

Responsibilities

* University Matching
* Faculty Matching
* Student Matching
* Industry Matching

Consumes

ProblemAnalyzed

Produces

RecommendationGenerated

---

## Project Service

Responsibilities

* Team Formation
* Project Lifecycle
* Milestones
* Deliverables

Consumes

RecommendationGenerated

Produces

ProjectCreated

MilestoneCompleted

---

## Industry Service

Responsibilities

* Sponsorship
* Mentorship
* Partnerships

Consumes

ProjectCreated

Produces

IndustryPartnershipCreated

---

## Analytics Service

Responsibilities

* KPIs
* Reports
* Dashboards
* Impact Metrics

Consumes

All Platform Events

Produces

Aggregated Metrics

---

## Notification Service

Responsibilities

* Email
* SMS
* Push Notifications
* In-App Notifications

Consumes

System Events

Produces

User Notifications

---

# 4. API Gateway Layer

Responsibilities

* Authentication
* Request Validation
* Rate Limiting
* Request Logging
* Routing

Benefits

Single Entry Point

Consistent Security

Central Monitoring

---

# 5. Event-Driven Architecture

Why?

Avoid tightly coupled services.

Example

Citizen submits problem

Instead of:

Problem Service
↓
AI Service
↓
Recommendation Service
↓
Notification Service

Use:

ProblemCreated Event

Each service reacts independently.

---

# 6. Event Flow

Citizen Report

ProblemCreated
│
▼
AI Service
│
▼
ProblemAnalyzed
│
▼
Recommendation Service
│
▼
RecommendationGenerated
│
▼
Project Service

---

# 7. Event Catalog

ProblemCreated

Payload

{
"problem_id":"uuid"
}

---

ProblemAnalyzed

{
"problem_id":"uuid",
"category":"Water",
"priority":92
}

---

RecommendationGenerated

{
"problem_id":"uuid",
"university_id":"uuid"
}

---

ProjectCreated

{
"project_id":"uuid"
}

---

MilestoneCompleted

{
"project_id":"uuid",
"milestone_id":"uuid"
}

---

IndustryPartnershipCreated

{
"project_id":"uuid",
"industry_id":"uuid"
}

---

# 8. Queue Architecture

Message Broker

RabbitMQ

Queues

problem-processing

ai-processing

recommendation-processing

project-processing

notification-processing

analytics-processing

dead-letter-queue

Purpose

Reliable asynchronous processing.

---

# 9. Background Jobs

Technology

Celery

Jobs

AI Classification

Duplicate Detection

Report Generation

Email Delivery

Media Processing

Impact Calculations

Data Exports

Scheduled Cleanup

---

# 10. Caching Strategy

Technology

Redis

---

Layer 1

Authentication Cache

TTL

15 Minutes

Stores

User Session

Permissions

Roles

---

Layer 2

Problem Cache

TTL

5 Minutes

Stores

Popular Queries

Dashboard Data

---

Layer 3

Recommendation Cache

TTL

30 Minutes

Stores

University Matches

Faculty Matches

Industry Matches

---

Layer 4

Analytics Cache

TTL

1 Hour

Stores

KPIs

District Metrics

Charts

---

# 11. Database Access Rules

Auth Service

Own Database Tables

Only

---

Problem Service

Own Database Tables

Only

---

Cross-Service Access

Not Allowed

Use

Events

Internal APIs

---

# 12. Media Processing Architecture

Upload
│
▼
Object Storage
│
▼
Virus Scan
│
▼
Metadata Extraction
│
▼
Thumbnail Generation
│
▼
AI Analysis

Storage

MinIO

or

AWS S3

---

# 13. Search Architecture

Technology

PostgreSQL Full Text Search

Future

OpenSearch

Searchable Fields

Title

Description

Category

Location

Tags

Projects

Universities

---

# 14. Real-Time Architecture

Technology

WebSockets

Use Cases

Project Updates

Milestone Updates

Notifications

Status Changes

Implementation

FastAPI WebSockets

Redis Pub/Sub

---

# 15. AI Service Architecture

AI Gateway
│
▼
Classification Engine

Priority Engine

Duplicate Engine

Recommendation Engine

Fraud Engine

Summarization Engine

Each module independently deployable.

---

# 16. Analytics Pipeline

Events
│
▼
Analytics Queue
│
▼
Aggregator Worker
│
▼
Analytics Tables
│
▼
Dashboard APIs

Purpose

Avoid expensive live queries.

---

# 17. Failure Recovery

Retry Strategy

3 Automatic Retries

Exponential Backoff

---

Dead Letter Queue

Failed Events Stored

Manual Review Possible

---

Idempotency

All Consumers Must Support:

Repeated Events

Duplicate Events

Out-of-Order Events

---

# 18. Observability

Logs

Structured JSON Logs

---

Metrics

Prometheus

Tracks

Request Rate

Error Rate

Latency

Queue Length

AI Inference Time

---

Tracing

OpenTelemetry

Request Tracking Across Services

---

# 19. Security Boundaries

Auth Service

Only service allowed to issue tokens.

---

Internal APIs

Service-to-Service Authentication

Using

Signed Service Tokens

---

Sensitive Data

Encrypted At Rest

Encrypted In Transit

---

# 20. Scalability Plan

Phase 1

Modular Monolith

Single Deployment

---

Phase 2

Extract

AI Service

Notification Service

Analytics Service

---

Phase 3

Full Microservice Architecture

Independent Scaling

---

# 21. Deployment Units

Container 1

API Gateway

Container 2

Core Backend

Container 3

AI Service

Container 4

RabbitMQ

Container 5

Redis

Container 6

PostgreSQL

Container 7

MinIO

Container 8

Worker Service

---

# 22. Backend Build Order

Step 1

Authentication Service

Step 2

Problem Service

Step 3

File Upload Service

Step 4

AI Service

Step 5

Recommendation Service

Step 6

Project Service

Step 7

Industry Service

Step 8

Notification Service

Step 9

Analytics Service

Step 10

Optimization & Scaling

---

# 23. Definition of Backend Completion

✔ All API Contracts Implemented

✔ Event Bus Operational

✔ Queue Processing Operational

✔ AI Pipeline Operational

✔ Recommendation Engine Operational

✔ Real-Time Notifications Operational

✔ Analytics Pipeline Operational

✔ Security Tests Passing

✔ Performance Targets Achieved
