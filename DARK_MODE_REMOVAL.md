# SICP Platform: Dark Mode Removal & GovTech Light Design System

**Smart India Hackathon (SIH) Problem Statement 26043**  
*A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships.*

---

## 1. Executive Summary

Dark mode has been **completely purged** from the entire SICP frontend codebase. The platform now strictly adheres to the **Government of India / NIC / Digital India Light Design System**, providing a clean, accessible, high-contrast GovTech experience tailored for citizens, university leaders, faculty evaluators, corporate CSR grantors, and government ministries.

```
       DARK MODE TOKENS & TOGGLES PURGED
                 │
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │   GOVERNMENT OF INDIA / NIC LIGHT DESIGN SYSTEM        │
 │                                                        │
 │   • Background: #F8FAFC (Slate 50)                     │
 │   • Surfaces:   #FFFFFF (White, 1px border-slate-200)  │
 │   • Primary:    #0052CC (NIC / Digital India Blue)     │
 │   • Success:    #0F9D58 (Green)                        │
 │   • Warning:    #F4B400 (Amber)                        │
 │   • Danger:     #DB4437 (Red)                          │
 │   • Radius:     8px (rounded-lg)                       │
 │   • Typography: Inter (High legibility, no glow/neon)  │
 └────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure & Theme Architecture Changes

### Files Removed / Deleted
- **`src/providers/ThemeProvider.tsx`**: Permanently deleted. The `next-themes` wrapper was removed entirely.

### Files Modified & Configured
1. **`tailwind.config.ts`**:
   - Removed `darkMode: "class"`.
   - Added official GovTech token definitions:
     - `gov.blue`: `#0052CC`
     - `gov.green`: `#0F9D58`
     - `gov.warning`: `#F4B400`
     - `gov.danger`: `#DB4437`
     - `gov.slate`: `#F8FAFC`
   - Added `boxShadow.xs` utility.

2. **`src/app/globals.css`**:
   - Removed all `.dark { ... }` CSS variable blocks.
   - Set `:root` variables exclusively for light GovTech mode:
     - `--background`: `210 40% 98%` (`#F8FAFC`)
     - `--foreground`: `222 47% 11%` (`#0F172A`)
     - `--card`: `0 0% 100%` (`#FFFFFF`)
     - `--border`: `214 32% 91%` (`#E2E8F0`)
     - `--primary`: `217 100% 40%` (`#0052CC`)
   - Added `.gov-card` and clean GovTech scrollbar styles.

3. **`src/providers/Providers.tsx`**:
   - Removed `ThemeProvider` import and wrapper.
   - Simplified to pure `QueryProvider` context.

4. **`src/app/layout.tsx`**:
   - Hardcoded `<html lang="en" className="light">`.
   - Set body classes to `bg-background text-foreground font-sans antialiased`.

---

## 3. UI Component & Feature Refactoring

### A. Navigation & Shell
- **`src/components/layout/Navbar.tsx`**:
  - Removed `useTheme`, `Moon`, `Sun`, `Laptop` icons, and theme dropdown popovers.
  - Converted badges and navigation items to clean GovTech white-and-slate styling.
- **`src/components/layout/AppShell.tsx`**:
  - Replaced dark/gradient borders with crisp `1px border-slate-200` and light hover states.

### B. Landing Page (`src/app/page.tsx`)
- **Government of India Official Branding**:
  - Tri-color national bar (Saffron `#FF9933` / White / Green `#138808`).
  - Ministry of Education & AICTE initiative header.
  - National GovTech portal badge.
- **Hero Section**:
  - Clean `#F8FAFC` canvas.
  - Title: *"Societal Innovation Collaboration Portal"*.
  - Subtitle: *"Crowdsourcing Community Challenges through Universities and Industry Partnerships"*.
  - Primary CTAs: `[Submit Challenge]`, `[Explore Challenges]`, `[Public Audit Ledger]`.
- **7-Stage Problem Flow Diagram**:
  1. *Citizen Intake* (Geotagged crowdsourcing)
  2. *Challenge Validation* (AI semantic deduplication)
  3. *University Assignment* (HEI & department allocation)
  4. *Student Team Formation* (Multidisciplinary engineering squads)
  5. *Industry Mentorship* (CSR milestone-linked tranches)
  6. *Pilot Deployment* (District field testbed trials)
  7. *Social Impact* (DIRI Index & SHA-256 ledger verification)
- **Live Platform Statistics Strip**:
  - 2,480+ Civic Challenges Logged
  - 612 Active Student Teams
  - 148 Participating HEIs & IITs
  - ₹11.25 Cr CSR Capital Committed
  - 1.24M Citizens Impacted
  - 14,820 SHA-256 Verified Audit Blocks
- **Compact Stakeholder Workspaces (M1–M7)**:
  - Height ~120px compact tiles showing Module Name, concise description, Status badge, and Open Workspace link.
- **Stakeholders Overview**:
  - Dedicated cards for Citizens, Universities, Faculty Mentors, Industry/Startups, and Government.
- **Official Government Footer**:
  - Links to portals, governance, audit ledger, and GIGW compliance notes.

### C. Dashboard (`src/app/dashboard/page.tsx`)
- **Compact Workspace Tiles**:
  - Replaced large 220px cards with lightweight **120px workspace tiles**.
  - Displays Module Name, concise description, `"Operational"` status badge, and `"Open Workspace"` action.
- **Clean Audit Banner**:
  - Converted dark gradient ledger card to a crisp white card with `#0052CC` accent.

### D. Authentication & Settings
- **`src/features/auth/LoginForm.tsx` & `src/app/login/page.tsx`**:
  - Clean GovTech card, slate-900 typography, light input fields, blue primary submit button.
- **`src/features/auth/RegisterForm.tsx` & `src/app/register/page.tsx`**:
  - Light multi-step registration with clean step indicators and role selector chips.
- **`src/app/forgot-password/page.tsx`**:
  - Clean light card with emerald success and red alert boxes.
- **`src/app/settings/page.tsx`**:
  - Converted dark backdrop to crisp white card (`bg-white border-slate-200`).

### E. Challenge & Teams Workspaces
- **`src/features/challenge/components/ChallengeForm.tsx`** & **`LocationPicker.tsx`** & **`AssetUploader.tsx`**:
  - Light input borders, slate-700 labels, light map markers, clean upload dropzones.
- **`src/features/challenge/components/ChallengeStatusBadge.tsx`** & **`ChallengeUrgencyBadge.tsx`**:
  - GovTech semantic colors: Emerald (Resolved), Amber (In Progress), Blue (Open), Red (Critical).
- **`src/features/teams/components/TeamCard.tsx`**, **`TeamStatusBadge.tsx`**, **`TeamRoleBadge.tsx`**:
  - Light badge tokens and clean white team roster tiles.
- **`src/app/teams/requests/page.tsx`** & **`src/app/teams/invitations/page.tsx`**:
  - Clean GovTech action cards for join requests and team invitations.

---

## 4. Verification & Build Integrity Metrics

| Check | Target | Result | Status |
|---|---|---|---|
| **`dark:*` Tailwind classes** | 0 instances in `frontend/src` | **0 remaining** | ✅ PASS |
| **`ThemeProvider` references** | 0 instances in `frontend/src` | **0 remaining** | ✅ PASS |
| **`useTheme` references** | 0 instances in `frontend/src` | **0 remaining** | ✅ PASS |
| **TypeScript Compilation (`npm run typecheck`)** | 0 errors | **0 errors (`tsc --noEmit`)** | ✅ PASS |
| **Next.js Production Build (`npm run build`)** | 38/38 routes compiled | **38/38 routes compiled successfully** | ✅ PASS |

---

## 5. Summary of Modified Files

```
frontend/
├── tailwind.config.ts                                # Removed darkMode, configured GovTech colors
├── src/
│   ├── app/
│   │   ├── globals.css                              # Purged .dark tokens, configured light :root
│   │   ├── layout.tsx                               # Hardcoded className="light"
│   │   ├── page.tsx                                 # GovTech Landing Page redesign
│   │   ├── dashboard/page.tsx                       # Compact 120px module workspace tiles
│   │   ├── login/page.tsx                           # GovTech Light Login
│   │   ├── register/page.tsx                        # GovTech Light Register
│   │   ├── forgot-password/page.tsx                 # GovTech Light Forgot Password
│   │   ├── settings/page.tsx                        # GovTech Light Account Settings
│   │   ├── challenges/[id]/page.tsx                 # Light Challenge Detail
│   │   ├── citizen/create-challenge/page.tsx        # Light Challenge Intake
│   │   ├── teams/[id]/page.tsx                      # Light Team Roster Detail
│   │   ├── teams/requests/page.tsx                  # Light Join Requests
│   │   └── teams/invitations/page.tsx               # Light Invitations
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                           # Removed theme toggles & moon/sun icons
│   │   │   └── AppShell.tsx                         # Light sidebar & navigation shell
│   │   └── ui/
│   │       └── RankingTable.tsx                     # Light GovTech table styling
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx                        # Light auth form
│   │   │   ├── RegisterForm.tsx                     # Light multi-step form
│   │   │   └── UserProfileCard.tsx                  # Light profile widget
│   │   ├── challenge/
│   │   │   ├── components/
│   │   │   │   ├── AssetUploader.tsx                # Light dropzone
│   │   │   │   ├── ChallengeAssetGallery.tsx        # Light gallery
│   │   │   │   ├── ChallengeForm.tsx                # Light inputs & selects
│   │   │   │   ├── ChallengeStatusBadge.tsx         # GovTech badge styling
│   │   │   │   ├── ChallengeUrgencyBadge.tsx        # GovTech urgency colors
│   │   │   │   └── LocationPicker.tsx               # Light map selector
│   │   └── teams/
│   │       └── components/
│   │           ├── TeamCard.tsx                     # Light team card
│   │           ├── TeamRoleBadge.tsx                # Light role badge
│   │           └── TeamStatusBadge.tsx              # Light status badge
│   └── providers/
│       ├── Providers.tsx                            # Removed ThemeProvider wrapper
│       └── [DELETED] ThemeProvider.tsx              # Permanently removed
```
