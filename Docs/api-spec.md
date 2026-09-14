# API Specification (api-spec.md)

Version: v1

Base URL

/api/v1

Authentication

Bearer JWT Token

Authorization Header:

Authorization: Bearer <token>

---

# Authentication APIs

## Register User

POST /auth/register

Request

{
"full_name": "Rahul Kumar",
"email": "[rahul@gmail.com](mailto:rahul@gmail.com)",
"phone": "9876543210",
"password": "StrongPassword",
"role": "citizen"
}

Response

{
"user_id": "uuid",
"message": "Registration successful"
}

---

## Login

POST /auth/login

Request

{
"email": "[rahul@gmail.com](mailto:rahul@gmail.com)",
"password": "StrongPassword"
}

Response

{
"access_token": "...",
"refresh_token": "...",
"role": "citizen"
}

---

## Refresh Token

POST /auth/refresh

Response

{
"access_token": "new_token"
}

---

# Citizen Problem APIs

## Submit Problem

POST /problems

Request

{
"title": "Contaminated Drinking Water",
"description": "Water has unusual smell and color",
"location": {
"lat": 23.123,
"lng": 85.456
},
"affected_population": 500
}

Response

{
"problem_id": "uuid",
"status": "submitted"
}

---

## Upload Media

POST /problems/{problem_id}/media

Multipart Form Data

Fields

file
media_type

Response

{
"media_id": "uuid",
"url": "storage_url"
}

---

## Get Problem

GET /problems/{problem_id}

Response

{
"problem_id": "uuid",
"title": "...",
"status": "verified",
"priority_score": 89
}

---

## List Problems

GET /problems

Query Params

?page=1
&limit=20
&status=active
&category=water

Response

{
"items": [],
"total": 200
}

---

# AI Service APIs

## Classify Problem

POST /ai/classify

Request

{
"problem_id": "uuid"
}

Response

{
"category": "Water",
"subcategory": "Contamination",
"confidence": 0.94
}

---

## Priority Score

POST /ai/priority

Request

{
"problem_id": "uuid"
}

Response

{
"priority_score": 92
}

---

## Duplicate Detection

POST /ai/duplicates

Request

{
"problem_id": "uuid"
}

Response

{
"duplicates_found": true,
"similar_problems": [
{
"problem_id": "uuid",
"similarity": 0.91
}
]
}

---

## Generate Summary

POST /ai/summarize

Request

{
"problem_id": "uuid"
}

Response

{
"summary": "AI generated summary"
}

---

# University Matching APIs

## Recommend Universities

GET /recommend/universities/{problem_id}

Response

{
"recommendations": [
{
"university_id": "uuid",
"score": 95
}
]
}

---

## Recommend Faculty

GET /recommend/faculty/{problem_id}

Response

{
"faculty": [
{
"faculty_id": "uuid",
"match_score": 92
}
]
}

---

## Recommend Students

GET /recommend/students/{problem_id}

Response

{
"students": []
}

---

# University Dashboard APIs

## Accept Problem

POST /universities/problems/{problem_id}/accept

Response

{
"status": "accepted"
}

---

## Reject Problem

POST /universities/problems/{problem_id}/reject

Response

{
"status": "rejected"
}

---

## Create Project

POST /projects

Request

{
"problem_id": "uuid",
"title": "Smart Water Monitoring"
}

Response

{
"project_id": "uuid"
}

---

# Team Management APIs

## Create Team

POST /projects/{project_id}/teams

Request

{
"team_name": "Water Innovation Team"
}

Response

{
"team_id": "uuid"
}

---

## Add Member

POST /projects/{project_id}/members

Request

{
"student_id": "uuid",
"role": "ML Engineer"
}

Response

{
"success": true
}

---

# Industry APIs

## Sponsor Project

POST /industry/projects/{project_id}/sponsor

Request

{
"amount": 500000
}

Response

{
"partnership_id": "uuid"
}

---

## Assign Mentor

POST /industry/projects/{project_id}/mentor

Request

{
"mentor_id": "uuid"
}

Response

{
"success": true
}

---

# Milestone APIs

## Create Milestone

POST /projects/{project_id}/milestones

Request

{
"title": "Prototype Completion",
"due_date": "2027-01-01"
}

Response

{
"milestone_id": "uuid"
}

---

## Update Milestone

PATCH /projects/{project_id}/milestones/{id}

Request

{
"status": "completed"
}

Response

{
"success": true
}

---

# Impact APIs

## Submit Impact Metrics

POST /impact

Request

{
"project_id": "uuid",
"people_benefited": 5000,
"water_saved_liters": 20000
}

Response

{
"impact_record_id": "uuid"
}

---

## Get Impact Report

GET /impact/{project_id}

Response

{
"people_benefited": 5000,
"jobs_created": 15,
"impact_score": 89
}

---

# Government Dashboard APIs

## State Statistics

GET /analytics/state

Response

{
"total_problems": 5240,
"active_projects": 620,
"completed_projects": 235
}

---

## District Analytics

GET /analytics/district/{district}

Response

{
"district": "Ranchi",
"problems": 820,
"projects": 95
}

---

# Notifications APIs

## Get Notifications

GET /notifications

Response

{
"items": []
}

---

## Mark Read

PATCH /notifications/{id}/read

Response

{
"success": true
}

---

# Common Error Format

400 Bad Request

{
"error": {
"code": "VALIDATION_ERROR",
"message": "Invalid input"
}
}

401 Unauthorized

{
"error": {
"code": "UNAUTHORIZED"
}
}

403 Forbidden

{
"error": {
"code": "FORBIDDEN"
}
}

404 Not Found

{
"error": {
"code": "NOT_FOUND"
}
}

500 Internal Server Error

{
"error": {
"code": "SERVER_ERROR"
}
}

---

# API Standards

* RESTful Design
* JSON Payloads
* JWT Authentication
* UUID Primary Keys
* Cursor Pagination (future)
* OpenAPI 3.1 Compatible
* Rate Limiting Enabled
* Audit Logging Enabled
* Versioned APIs (/v1)
