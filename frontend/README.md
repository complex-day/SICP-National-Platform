# SICP Frontend Application

## Purpose
The SICP (Societal Innovation Collaboration Platform) Frontend is built with Next.js 15 App Router, React 19, TypeScript (Strict Mode), and Tailwind CSS. It delivers a mobile-first, highly responsive interface for all primary stakeholders: Citizens, Students, Faculty, Industry Partners, Government Officials, and Administrators.

## Dependencies
- Next.js 15 & React 19
- TypeScript (Strict Mode)
- Tailwind CSS
- Zustand (Client state management & Token persistence)
- React Hook Form & Zod (Type-safe form validations)
- Lucide React (Icons)

## Module 1 (Identity & Access Management) Routes
| Route | Purpose | Access |
|---|---|---|
| `/` | Landing page showcasing ecosystem vision and stakeholder portals | Public |
| `/login` | User authentication form with client/server validation | Public |
| `/register` | Multi-role registration form (Citizen, Student, Faculty, Industry, Government, Admin) | Public |
| `/profile` | Authenticated profile view displaying user credentials, role badge, and trust score | Authenticated |
| `/dashboard` | Authenticated dashboard overview customized by stakeholder role | Authenticated |
| `/forgot-password` | Password recovery initiation view (stub) | Public |
| `/settings` | Security settings and password update form | Authenticated |

## Architecture Rules
- Feature-based modular structure (`src/features/auth/...`)
- Zustand store (`src/store/authStore.ts`) for token and session state
- Centralized API layer (`src/lib/api.ts` & `src/services/auth.service.ts`)
- Zero use of `any` types; full TypeScript type safety

## Running the Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checks
npm run typecheck

# Production build
npm run build
```
