# AI System Design Document (ai-design.md)

# 1. AI Objectives

The AI layer is responsible for:

1. Problem Classification
2. Priority Scoring
3. Duplicate Detection
4. University Matching
5. Faculty Matching
6. Student Recommendation
7. Industry Recommendation
8. Problem Summarization
9. Impact Prediction
10. Fraud Detection

---

# 2. AI Pipeline Overview

Citizen Input
(Text / Image / Voice)
│
▼
Preprocessing Layer
│
┌──────┼──────────┐
▼      ▼          ▼
Text   Image      Voice
│      │          │
▼      ▼          ▼
NLP    CV      Speech-to-Text
│      │          │
└──────┴──────────┘
│
▼
Problem Understanding Engine
│
┌──────┼──────────────┬────────────┐
▼      ▼              ▼            ▼
Classify Priority Duplicate Summary
│
▼
Recommendation Engine
│
┌──────┼──────────────┐
▼      ▼              ▼
University Faculty Industry
│
▼
Project Assignment

---

# 3. Problem Classification Engine

Goal:

Convert raw citizen reports into structured categories.

Input:

Title
Description
Media
Location

Example

Input:

"Village water smells bad and people are getting sick"

Output

{
"category":"Water",
"subcategory":"Water Contamination",
"confidence":0.94
}

Categories

* Education
* Healthcare
* Water
* Agriculture
* Infrastructure
* Environment
* Energy
* Accessibility
* Public Services
* Rural Development
* Sanitation

Model

IndicBERT
mBERT
DistilBERT

Output Confidence Threshold

0.70

Below threshold:

Human review required

---

# 4. Priority Scoring Engine

Purpose

Determine urgency and impact.

Formula

Priority Score =
Severity Weight +
Affected Population +
Criticality +
Location Vulnerability +
Repeat Frequency

Range

0 - 100

Priority Levels

0-30 Low

31-60 Medium

61-80 High

81-100 Critical

Example

Water contamination

Severity: 25

Population: 20

Urgency: 25

Repetition: 15

Vulnerability: 10

Total = 95

Critical

---

# 5. Duplicate Detection Engine

Problem

Multiple citizens report same issue.

Solution

Semantic similarity matching.

Input

Problem Description

Embedding Generation

Sentence Transformers

Model

all-MiniLM-L6-v2

Storage

pgvector

Similarity Metric

Cosine Similarity

Threshold

0.85

Example

Problem A

Road near school damaged.

Problem B

Pothole near school road.

Similarity

0.91

Cluster Together

---

# 6. University Matching Engine

Goal

Find best university for solving a challenge.

Inputs

Problem Category

Required Expertise

Location

Historical Performance

Available Faculty

Matching Score Formula

40% Expertise Match

25% Faculty Availability

15% Geographic Proximity

10% Previous Success Rate

10% Research Capacity

Output

Top 5 Universities

Example

University A : 94%

University B : 88%

University C : 83%

---

# 7. Faculty Recommendation Engine

Goal

Recommend faculty mentors.

Features

Research Area

Publications

Past Projects

Availability

Experience

Output

Ranked Faculty List

---

# 8. Student Recommendation Engine

Goal

Build multidisciplinary teams.

Inputs

Skills

Projects

CGPA

Availability

Interests

Output

Recommended Students

Example

ML Engineer

IoT Engineer

Frontend Developer

GIS Analyst

---

# 9. Industry Recommendation Engine

Goal

Connect project with suitable organizations.

Matching Factors

Domain Match

CSR Programs

Funding Capacity

Technology Resources

Deployment Network

Output

Top Industry Partners

---

# 10. Image Analysis Engine

Purpose

Understand uploaded evidence.

Examples

Road Damage

Waste Dump

Flooding

Water Leakage

Infrastructure Damage

Model

YOLOv8

Output

{
"detected":"road_damage",
"confidence":0.91
}

---

# 11. Voice Processing Engine

Purpose

Allow low-literacy users.

Pipeline

Voice
↓
Whisper
↓
Text
↓
Classification

Supported Languages

Hindi

English

Regional Languages

---

# 12. AI Summarization Engine

Purpose

Generate concise summaries.

Input

Large report

Output

2-3 line summary

Used In

Government Dashboard

Faculty Dashboard

Notifications

---

# 13. Fraud Detection Engine

Purpose

Prevent misuse.

Signals

Spam Frequency

Bot Behavior

Location Mismatch

Repeated Content

Fake Media

Risk Levels

Low

Medium

High

Critical

High Risk Cases

Manual Verification

---

# 14. Impact Prediction Engine

Purpose

Estimate expected benefits.

Predictions

People Benefited

Cost Savings

Water Savings

Energy Savings

Job Creation

Model

Gradient Boosting

XGBoost

Random Forest

---

# 15. AI Feature Store

Stored Features

Problem Embeddings

University Profiles

Faculty Profiles

Industry Profiles

Impact Metrics

Historical Outcomes

Purpose

Recommendation reuse

Low latency inference

---

# 16. Model Serving Architecture

Client
│
▼
FastAPI AI Gateway
│
├── Classification Service
├── Similarity Service
├── Recommendation Service
├── Fraud Service
└── Summarization Service
│
▼
Model Registry
│
▼
Inference Layer

---

# 17. AI Monitoring

Metrics

Accuracy

Precision

Recall

F1 Score

Latency

False Positives

Drift Detection

Retraining Trigger

Monthly

or

10000 New Reports

---

# 18. Explainable AI

Every recommendation must include reasoning.

Example

University Match Score

Expertise Match: 40

Faculty Availability: 20

Research Capacity: 15

Location Proximity: 10

Success Rate: 9

Total: 94

Reason visible to administrators.

---

# 19. Future AI Features

* LLM-based proposal generation
* Automated project planning
* AI-powered mentor assignment
* Predictive societal risk maps
* AI co-pilot for government officers
* AI-generated impact reports

---

# 20. AI Success Metrics

Classification Accuracy > 90%

Duplicate Detection Accuracy > 85%

University Match Precision > 80%

Recommendation Acceptance Rate > 70%

Fraud Detection Recall > 85%

Average Inference Time < 2 Seconds
