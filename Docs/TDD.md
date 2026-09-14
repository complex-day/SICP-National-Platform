# Test Specification Document (test-spec.md)

# Testing Philosophy

Implementation is considered complete only when all tests pass.

Priority Order:

1. Security
2. Functional Correctness
3. Data Integrity
4. Performance
5. Scalability
6. AI Accuracy

---

# Test Suite Structure

tests/
├── auth/
├── problems/
├── ai/
├── recommendation/
├── projects/
├── impact/
├── analytics/
├── security/
├── performance/
└── integration/

---

# AUTHENTICATION TESTS

## AUTH-001

Title

User Registration

Expected

New user successfully created.

Test

Given valid details
When register endpoint called
Then user record created

Pass Criteria

201 Created

---

## AUTH-002

Title

Duplicate Email

Expected

Registration rejected.

Pass Criteria

409 Conflict

---

## AUTH-003

Title

Invalid Password

Expected

Registration rejected.

Pass Criteria

400 Bad Request

---

## AUTH-004

Title

JWT Validation

Expected

Protected endpoint inaccessible without token.

Pass Criteria

401 Unauthorized

---

# PROBLEM SUBMISSION TESTS

## PROB-001

Submit Valid Problem

Expected

Problem stored successfully.

Pass Criteria

Problem ID generated.

---

## PROB-002

Missing Title

Expected

Validation error.

Pass Criteria

400 Response

---

## PROB-003

Missing Description

Expected

Validation error.

Pass Criteria

400 Response

---

## PROB-004

Invalid Coordinates

Expected

Rejected.

Pass Criteria

400 Response

---

## PROB-005

Large Image Upload

Input

25MB image

Expected

System handles correctly.

Pass Criteria

Upload succeeds within limits.

---

# DUPLICATE DETECTION TESTS

## AI-DUP-001

Two identical reports

Expected

Same cluster assigned.

Pass Criteria

Similarity > 0.85

---

## AI-DUP-002

Different categories

Expected

No clustering.

Pass Criteria

Similarity < threshold

---

## AI-DUP-003

1000 Similar Reports

Expected

Processed successfully.

Pass Criteria

No timeout.

---

# AI CLASSIFICATION TESTS

## AI-CLS-001

Water Contamination Text

Expected

Category = Water

---

## AI-CLS-002

Road Damage Report

Expected

Category = Infrastructure

---

## AI-CLS-003

Healthcare Complaint

Expected

Category = Healthcare

---

## AI-CLS-004

Multilingual Hindi Input

Input

"गांव में पानी गंदा आ रहा है"

Expected

Water Category

---

## AI-CLS-005

Mixed Language Input

Input

"Village me water contamination issue hai"

Expected

Water Category

---

# PRIORITY ENGINE TESTS

## PRI-001

Critical Healthcare Issue

Expected

Priority > 90

---

## PRI-002

Minor Streetlight Issue

Expected

Priority < 50

---

## PRI-003

High Population Impact

Expected

Score increases.

---

# UNIVERSITY MATCHING TESTS

## UNI-001

Civil Engineering Challenge

Expected

Civil-focused university ranked highest.

---

## UNI-002

No Matching Expertise

Expected

Fallback recommendation generated.

---

## UNI-003

Inactive University

Expected

Excluded from recommendations.

---

# FACULTY MATCHING TESTS

## FAC-001

Relevant Expertise

Expected

Faculty appears in Top 5.

---

## FAC-002

Unavailable Faculty

Expected

Excluded.

---

# STUDENT MATCHING TESTS

## STU-001

Required ML Skill

Expected

ML-skilled student recommended.

---

## STU-002

Insufficient Skill Match

Expected

Not recommended.

---

# PROJECT LIFECYCLE TESTS

## PROJ-001

Create Project

Expected

Project record created.

---

## PROJ-002

Move Status Forward

Allowed

Submitted → Verified

Verified → Assigned

Assigned → Active

---

## PROJ-003

Invalid Status Transition

Example

Completed → Submitted

Expected

Rejected

---

# MILESTONE TESTS

## MILE-001

Create Milestone

Expected

Stored correctly.

---

## MILE-002

Past Due Date

Expected

Validation failure.

---

# INDUSTRY TESTS

## IND-001

Sponsor Project

Expected

Partnership created.

---

## IND-002

Negative Funding Amount

Expected

Rejected.

---

# IMPACT TESTS

## IMP-001

People Benefited

Expected

Stored correctly.

---

## IMP-002

Negative Impact Values

Expected

Rejected.

---

# GIS TESTS

## GIS-001

Location Stored

Expected

PostGIS coordinates valid.

---

## GIS-002

Nearby Search

Expected

Returns correct results.

Radius

10km

---

# SECURITY TESTS

## SEC-001

SQL Injection

Input

' OR 1=1 --

Expected

Rejected.

---

## SEC-002

XSS Injection

Input

<script>alert()</script>

Expected

Sanitized.

---

## SEC-003

JWT Tampering

Expected

Rejected.

---

## SEC-004

Unauthorized Access

Citizen accessing admin endpoint

Expected

403 Forbidden

---

## SEC-005

File Upload Malware

Expected

Blocked.

---

# RATE LIMITING TESTS

## RL-001

100 Requests Per Minute

Expected

Allowed

---

## RL-002

1000 Requests Per Minute

Expected

429 Too Many Requests

---

# FRAUD DETECTION TESTS

## FRAUD-001

100 Duplicate Reports

Expected

Risk score increases.

---

## FRAUD-002

Fake Location

Expected

Flagged.

---

## FRAUD-003

Bot Submission Pattern

Expected

Account flagged.

---

# PERFORMANCE TESTS

## PERF-001

Problem Submission

Expected

< 500 ms

---

## PERF-002

Classification

Expected

< 2 seconds

---

## PERF-003

University Recommendation

Expected

< 3 seconds

---

## PERF-004

Dashboard Load

Expected

< 2 seconds

---

# LOAD TESTS

## LOAD-001

10,000 Concurrent Users

Expected

System remains operational.

---

## LOAD-002

100,000 Problems

Expected

Queries remain performant.

---

# DATABASE TESTS

## DB-001

Foreign Key Integrity

Expected

No orphan records.

---

## DB-002

Cascade Delete Rules

Expected

Behave correctly.

---

## DB-003

Unique Constraints

Expected

Enforced.

---

# MEMORY TESTS

## MEM-001

Continuous Upload Test

Duration

24 Hours

Expected

No memory leak.

---

## MEM-002

AI Inference Loop

100,000 Requests

Expected

Stable memory usage.

---

# INTEGRATION TESTS

## INT-001

Citizen → Problem Submission

Expected

Complete successfully.

---

## INT-002

Problem → AI Classification

Expected

Automatic trigger.

---

## INT-003

Classification → University Match

Expected

Automatic recommendation.

---

## INT-004

University → Project Creation

Expected

Project generated.

---

## INT-005

Project → Industry Collaboration

Expected

Partnership possible.

---

## INT-006

Deployment → Impact Metrics

Expected

Impact recorded.

---

# END-TO-END TEST

Scenario

Citizen reports contaminated water.

Expected Flow

Submission
→ Verification
→ Classification
→ Priority Score
→ University Match
→ Faculty Assignment
→ Team Formation
→ Prototype
→ Industry Support
→ Deployment
→ Impact Tracking

Pass Criteria

Entire workflow completes without manual database intervention.

---

# Success Criteria

Functional Tests: 100% Pass

Security Tests: 100% Pass

Critical Bugs: 0

Memory Leaks: 0

AI Classification Accuracy: >90%

Duplicate Detection Accuracy: >85%

Average API Latency: <500ms

System Uptime Target: 99.5%
