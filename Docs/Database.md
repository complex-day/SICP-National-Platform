# Database Design Document (database.md)

# 1. Database Overview

Database Type: PostgreSQL 16 + PostGIS

Objectives:

* Store societal challenges
* Manage stakeholder relationships
* Support AI recommendations
* Enable geospatial search
* Track project lifecycle
* Generate impact analytics

---

# 2. Entity Relationship Overview

USERS
│
├── CITIZENS
├── STUDENTS
├── FACULTY
├── GOVERNMENT_USERS
└── INDUSTRY_USERS

PROBLEMS
│
├── PROBLEM_MEDIA
├── PROBLEM_COMMENTS
├── PROBLEM_VERIFICATION
└── PROBLEM_CLUSTERS

PROJECTS
│
├── PROJECT_TEAMS
├── PROJECT_MEMBERS
├── PROJECT_MILESTONES
├── PROJECT_DOCUMENTS
└── IMPACT_METRICS

UNIVERSITIES
│
├── DEPARTMENTS
├── FACULTY
└── STUDENTS

INDUSTRIES
│
└── INDUSTRY_PARTNERSHIPS

---

# 3. USERS

CREATE TABLE users (
id UUID PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
phone VARCHAR(20) UNIQUE,
password_hash TEXT NOT NULL,
role VARCHAR(30) NOT NULL,
is_verified BOOLEAN DEFAULT FALSE,
trust_score NUMERIC(5,2) DEFAULT 50,
created_at TIMESTAMP,
updated_at TIMESTAMP
);

Indexes

* email
* phone
* role

---

# 4. CITIZENS

CREATE TABLE citizens (
user_id UUID PRIMARY KEY REFERENCES users(id),
district VARCHAR(150),
state VARCHAR(100),
total_reports INTEGER DEFAULT 0
);

---

# 5. UNIVERSITIES

CREATE TABLE universities (
id UUID PRIMARY KEY,
name VARCHAR(255),
district VARCHAR(150),
state VARCHAR(100),
accreditation VARCHAR(50),
website TEXT,
created_at TIMESTAMP
);

Indexes

* district
* state

---

# 6. DEPARTMENTS

CREATE TABLE departments (
id UUID PRIMARY KEY,
university_id UUID REFERENCES universities(id),
name VARCHAR(255),
expertise_tags TEXT[]
);

---

# 7. FACULTY

CREATE TABLE faculty (
user_id UUID PRIMARY KEY REFERENCES users(id),
university_id UUID REFERENCES universities(id),
department_id UUID REFERENCES departments(id),
specialization TEXT,
experience_years INTEGER
);

---

# 8. STUDENTS

CREATE TABLE students (
user_id UUID PRIMARY KEY REFERENCES users(id),
university_id UUID REFERENCES universities(id),
department_id UUID REFERENCES departments(id),
skills TEXT[],
graduation_year INTEGER
);

---

# 9. INDUSTRIES

CREATE TABLE industries (
id UUID PRIMARY KEY,
company_name VARCHAR(255),
domain VARCHAR(255),
csr_budget NUMERIC(15,2),
website TEXT
);

---

# 10. PROBLEMS

CREATE TABLE problems (
id UUID PRIMARY KEY,
citizen_id UUID REFERENCES citizens(user_id),

```
title VARCHAR(500),
description TEXT,

category VARCHAR(100),
subcategory VARCHAR(100),

priority_score INTEGER,

status VARCHAR(50),

affected_population INTEGER,

latitude DECIMAL(10,8),
longitude DECIMAL(11,8),

geom GEOGRAPHY(Point,4326),

ai_confidence NUMERIC(5,2),

created_at TIMESTAMP,
updated_at TIMESTAMP
```

);

Indexes

* category
* status
* priority_score
* created_at
* GIST(geom)

---

# 11. PROBLEM_MEDIA

CREATE TABLE problem_media (
id UUID PRIMARY KEY,
problem_id UUID REFERENCES problems(id),
media_type VARCHAR(20),
storage_url TEXT,
uploaded_at TIMESTAMP
);

---

# 12. PROBLEM_CLUSTERS

CREATE TABLE problem_clusters (
id UUID PRIMARY KEY,
cluster_name VARCHAR(255),
similarity_threshold NUMERIC(4,2)
);

---

# 13. PROBLEM_CLUSTER_MAPPING

CREATE TABLE problem_cluster_mapping (
cluster_id UUID REFERENCES problem_clusters(id),
problem_id UUID REFERENCES problems(id),
PRIMARY KEY(cluster_id, problem_id)
);

Purpose:

Duplicate detection groups similar societal issues.

---

# 14. VERIFICATION_RECORDS

CREATE TABLE verification_records (
id UUID PRIMARY KEY,
problem_id UUID REFERENCES problems(id),

```
verification_type VARCHAR(50),

verified_by UUID,

remarks TEXT,

verification_status VARCHAR(50),

created_at TIMESTAMP
```

);

---

# 15. PROJECTS

CREATE TABLE projects (
id UUID PRIMARY KEY,

```
problem_id UUID REFERENCES problems(id),

university_id UUID REFERENCES universities(id),

assigned_faculty UUID REFERENCES faculty(user_id),

title VARCHAR(255),

description TEXT,

status VARCHAR(50),

start_date DATE,
end_date DATE,

impact_score NUMERIC(10,2)
```

);

Indexes

* university_id
* problem_id
* status

---

# 16. PROJECT_TEAMS

CREATE TABLE project_teams (
id UUID PRIMARY KEY,
project_id UUID REFERENCES projects(id),
team_name VARCHAR(255)
);

---

# 17. PROJECT_MEMBERS

CREATE TABLE project_members (
team_id UUID REFERENCES project_teams(id),
student_id UUID REFERENCES students(user_id),

```
role VARCHAR(100),

PRIMARY KEY(team_id, student_id)
```

);

---

# 18. INDUSTRY_PARTNERSHIPS

CREATE TABLE industry_partnerships (
id UUID PRIMARY KEY,

```
project_id UUID REFERENCES projects(id),

industry_id UUID REFERENCES industries(id),

contribution_type VARCHAR(100),

funding_amount NUMERIC(15,2),

created_at TIMESTAMP
```

);

---

# 19. PROJECT_MILESTONES

CREATE TABLE project_milestones (
id UUID PRIMARY KEY,

```
project_id UUID REFERENCES projects(id),

title VARCHAR(255),

description TEXT,

due_date DATE,

status VARCHAR(50)
```

);

---

# 20. IMPACT_METRICS

CREATE TABLE impact_metrics (
id UUID PRIMARY KEY,

```
project_id UUID REFERENCES projects(id),

people_benefited INTEGER,

cost_saved NUMERIC(15,2),

water_saved_liters NUMERIC(15,2),

energy_saved_kwh NUMERIC(15,2),

jobs_created INTEGER,

patents_generated INTEGER,

pollution_reduction NUMERIC(15,2),

recorded_at TIMESTAMP
```

);

---

# 21. AUDIT_LOGS

CREATE TABLE audit_logs (
id UUID PRIMARY KEY,

```
actor_id UUID REFERENCES users(id),

entity_type VARCHAR(100),

entity_id UUID,

action VARCHAR(100),

old_value JSONB,

new_value JSONB,

created_at TIMESTAMP
```

);

---

# 22. Notification Tables

notifications
notification_preferences
email_queue
sms_queue
push_queue

Purpose:

Async communication system.

---

# 23. AI Recommendation Tables

university_expertise_profiles

faculty_expertise_profiles

industry_capability_profiles

problem_embeddings

Purpose:

Recommendation engine support.

---

# 24. Performance Indexes

BTree Indexes

* email
* phone
* role
* category
* status

GIN Indexes

* skills
* expertise_tags

GIST Indexes

* geom
* vector search

---

# 25. Partitioning Strategy

Problems Table

Partition By:

* Year
* State

Reason:

Supports millions of records.

---

# 26. Backup Strategy

Daily Incremental Backup

Weekly Full Backup

Monthly Snapshot

Retention:

* 90 days

---

# 27. Data Retention

Audit Logs:
7 years

Projects:
Permanent

Impact Metrics:
Permanent

Media Files:
5 years minimum

---

# 28. Future Scaling

Expected Capacity

Users:
10M+

Problems:
100M+

Projects:
1M+

Universities:
5000+

Industry Partners:
50000+

Architecture remains horizontally scalable through PostgreSQL partitioning and service-level caching.
