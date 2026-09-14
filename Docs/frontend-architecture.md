# Frontend Architecture Document

# Project

SICP – Societal Innovation Collaboration Platform

Frontend Stack

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* ShadCN UI
* React Query (TanStack Query)
* Zustand
* React Hook Form
* Zod Validation
* Leaflet Maps

---

# 1. Frontend Goals

The frontend must support five primary stakeholders:

1. Citizen
2. Student
3. Faculty
4. Industry
5. Government

Key Principles

* Mobile First
* Accessibility First
* Multi-language Support
* Real-time Updates
* Responsive Design
* Fast Navigation

---

# 2. Application Structure

src/

├── app/
├── components/
├── features/
├── services/
├── hooks/
├── store/
├── lib/
├── types/
├── constants/
├── assets/
└── providers/

---

# 3. Route Architecture

/app

├── login
├── register
├── dashboard

├── citizen
│   ├── dashboard
│   ├── submit-problem
│   ├── my-reports
│   └── report/[id]

├── university
│   ├── dashboard
│   ├── assigned-problems
│   ├── projects
│   ├── students
│   └── faculty

├── industry
│   ├── dashboard
│   ├── partnerships
│   ├── sponsorships
│   └── projects

├── government
│   ├── dashboard
│   ├── analytics
│   ├── districts
│   └── monitoring

└── admin
├── dashboard
├── users
├── moderation
└── system

---

# 4. Page Architecture

Citizen Portal

Dashboard

Purpose:
Overview of submitted problems

Widgets:

* Total Reports
* Active Reports
* Resolved Reports
* Notifications

---

Submit Problem

Purpose:
Create new societal challenge

Sections:

* Title
* Description
* Media Upload
* Location
* Impact Assessment

---

My Reports

Purpose:
Track submitted issues

Features:

* Search
* Filter
* Status Tracking
* Timeline

---

Problem Details

Purpose:
View complete problem lifecycle

Sections:

* Details
* Evidence
* AI Analysis
* Assigned University
* Progress

---

# 5. University Portal

Dashboard

Widgets

* Assigned Challenges
* Active Projects
* Faculty Load
* Student Participation

---

Assigned Problems

Features

* Accept Challenge
* Reject Challenge
* View AI Recommendations

---

Project Workspace

Features

* Team Creation
* Milestones
* Documents
* Progress Updates

---

Faculty Management

Features

* Faculty Profiles
* Expertise Mapping

---

Student Management

Features

* Skills
* Availability
* Recommendations

---

# 6. Industry Portal

Dashboard

Widgets

* Sponsored Projects
* Pending Requests
* Active Partnerships

---

Project Marketplace

Purpose

Browse societal challenges requiring support

---

Sponsorship Management

Features

* Funding Requests
* Resource Allocation

---

Mentorship Portal

Features

* Assign Mentors
* Schedule Reviews

---

# 7. Government Portal

Dashboard

Widgets

* Total Problems
* Active Projects
* District Analytics
* Impact Metrics

---

Monitoring

Features

* Project Tracking
* Deployment Status

---

Analytics

Charts

* Problem Categories
* District Heatmaps
* Impact Trends

---

# 8. Shared Components

components/

├── Navbar
├── Sidebar
├── Footer
├── Header
├── Breadcrumb
├── SearchBar
├── FilterPanel
├── Pagination
├── StatusBadge
├── DataTable
├── Modal
├── Drawer
├── Timeline
├── FileUploader
├── MapPicker
├── NotificationBell
└── EmptyState

---

# 9. Feature Components

features/

problem/

├── ProblemForm
├── ProblemCard
├── ProblemList
├── ProblemDetails
├── ProblemTimeline
└── ProblemMediaGallery

---

project/

├── ProjectCard
├── ProjectBoard
├── MilestoneTracker
├── TeamMembers
└── ProjectMetrics

---

analytics/

├── KPIWidget
├── CategoryChart
├── DistrictMap
├── ImpactGraph
└── TrendAnalysis

---

# 10. State Management

Global State

Using Zustand

Store Structure

authStore

* user
* token
* role
* permissions

---

notificationStore

* notifications
* unreadCount

---

uiStore

* theme
* language
* sidebarState

---

Local Server State

Using React Query

Purpose

* API Requests
* Caching
* Background Refetching

---

# 11. API Layer

services/

auth.service.ts

problem.service.ts

project.service.ts

analytics.service.ts

recommendation.service.ts

industry.service.ts

notification.service.ts

Purpose

Single source for backend communication.

---

# 12. Form Architecture

React Hook Form

Validation

Zod

Example

Problem Submission

* Title Required
* Description Required
* Location Required
* Media Validation

---

# 13. Role-Based UI Rendering

Citizen

Visible

* Submit Problem
* My Reports

Hidden

* University Dashboard
* Government Analytics

---

Faculty

Visible

* Assigned Problems
* Projects

---

Government

Visible

* Analytics
* Monitoring
* Reports

---

Admin

Full Access

---

# 14. User Flows

Citizen Flow

Login
↓
Submit Problem
↓
Upload Evidence
↓
AI Analysis
↓
Track Progress
↓
Receive Updates

---

University Flow

Login
↓
View Assigned Problem
↓
Accept Challenge
↓
Assign Faculty
↓
Create Student Team
↓
Create Project
↓
Submit Progress

---

Industry Flow

Login
↓
Browse Projects
↓
Sponsor Project
↓
Assign Mentor
↓
Track Outcomes

---

Government Flow

Login
↓
View Dashboard
↓
Monitor Districts
↓
Review Impact
↓
Generate Reports

---

# 15. Real-Time Features

Technology

WebSockets

Events

* Status Updates
* New Assignments
* Notifications
* Project Milestones

---

# 16. Internationalization

Languages

* English
* Hindi

Future

* Regional Languages

Library

next-intl

---

# 17. Maps Integration

Provider

OpenStreetMap

Library

Leaflet

Features

* Location Selection
* Problem Mapping
* Heatmaps
* District Visualization

---

# 18. Error Handling

Global Error Boundary

API Error Handler

Offline Detection

Retry Mechanism

Toast Notifications

---

# 19. Performance Targets

Initial Load < 2 sec

Dashboard Load < 1 sec

API Response < 500 ms

Lighthouse Score > 90

CLS < 0.1

LCP < 2.5 sec

---

# 20. Frontend Build Order

Phase 1

Authentication

Phase 2

Citizen Portal

Phase 3

Problem Management

Phase 4

University Dashboard

Phase 5

Industry Portal

Phase 6

Government Dashboard

Phase 7

Analytics

Phase 8

Real-time Features

Phase 9

Optimization & Accessibility
