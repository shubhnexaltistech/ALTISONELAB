# AltisOne ITP v3.0 — Complete Team Guide

> **Purpose:** This document explains the full project flow, architecture, and what every important file does — so you can walk your team through the codebase line by line.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Folder Structure (What Lives Where)](#3-folder-structure-what-lives-where)
4. [The Four Portals](#4-the-four-portals)
5. [Complete User Journeys (End-to-End Flows)](#5-complete-user-journeys-end-to-end-flows)
6. [Authentication & Security Flow](#6-authentication--security-flow)
7. [Payment Flow (Razorpay)](#7-payment-flow-razorpay)
8. [Backend — File-by-File Guide](#8-backend--file-by-file-guide)
9. [Frontend — File-by-File Guide](#9-frontend--file-by-file-guide)
10. [Database Models & Relationships](#10-database-models--relationships)
11. [API Endpoint Map](#11-api-endpoint-map)
12. [Environment Variables](#12-environment-variables)
13. [Scripts & How to Run](#13-scripts--how-to-run)
14. [Docker & Production Deployment](#14-docker--production-deployment)
15. [Default Dev Credentials](#15-default-dev-credentials)
16. [Key File Walkthroughs (Line by Line)](#16-key-file-walkthroughs-line-by-line)

---

## 1. What Is This Project?

**AltisOne ITP** (Internship Training Program) is a full-stack platform for running an internship program:

| Actor | What they do |
|-------|----------------|
| **Public visitor** | Applies on the landing site, pays fee |
| **Admin** | Manages tracks, modules, quizzes, mentors; verifies applications |
| **Trainee** | Learns via LMS — modules, quizzes, worklogs, evaluations |
| **Mentor** | Reviews trainee worklogs and grades evaluations |

**Tech stack:**

| Layer | Technology |
|-------|------------|
| Backend API | FastAPI (Python 3.11) |
| Database | MongoDB 7 (Beanie ODM) |
| Cache / sessions | Redis 7 |
| Background jobs | Celery + Celery Beat |
| Frontend | React 18 + Vite 5 + TypeScript + Tailwind |
| Monorepo | pnpm workspaces |
| Deployment | Docker Compose + Nginx |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (4 separate React apps)                   │
├──────────────┬──────────────┬──────────────┬──────────────────────────────┤
│   Landing    │    Admin     │     LMS      │         Mentor               │
│  :3000       │   :3001      │   :3002      │        :3003                 │
│  (public)    │  (admin)     │  (trainee)   │       (mentor)               │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────────┬───────────────┘
       │              │              │                      │
       └──────────────┴──────────────┴──────────────────────┘
                              │
                    HTTP  /api/v1/*
                              │
       ┌──────────────────────▼──────────────────────┐
       │           FastAPI Backend (:8000)            │
       │  auth │ public │ admin │ lms │ mentor │ hooks │
       └──────┬──────────────┬──────────────┬────────┘
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
       │  MongoDB    │ │   Redis   │ │   Celery    │
       │  (data)     │ │ (tokens,  │ │ (emails,    │
       │             │ │  blacklist)│ │  backups)   │
       └─────────────┘ └───────────┘ └─────────────┘
```

**Production:** Nginx serves all 4 frontend builds and proxies `/api` to the backend.

---

## 3. Folder Structure (What Lives Where)

```
E:\nexaltis lab\
│
├── backend\                    # Python FastAPI API
│   ├── app\
│   │   ├── main.py             # App entry — registers all routers
│   │   ├── config.py           # Reads .env settings
│   │   ├── database.py         # MongoDB connection + Beanie init
│   │   ├── celery_app.py       # Celery worker configuration
│   │   ├── models\             # MongoDB document schemas (13 files)
│   │   ├── routers\            # HTTP route handlers
│   │   │   ├── auth.py         # Login, logout, refresh, password reset
│   │   │   ├── public.py       # Apply, tracks, payment order (no auth)
│   │   │   ├── webhooks.py     # Razorpay payment webhook
│   │   │   ├── auth_deps.py    # JWT middleware helpers
│   │   │   ├── admin\          # 8 admin route files
│   │   │   ├── lms\            # 8 trainee route files
│   │   │   └── mentor\         # 4 mentor route files
│   │   ├── services\           # Business logic (not in routers)
│   │   ├── schemas\            # Request/response Pydantic DTOs
│   │   ├── middleware\         # Logging, rate limiting
│   │   ├── tasks\              # Celery async jobs (email, backup)
│   │   └── utils\              # Security, Redis, mail, file upload
│   ├── tests\                  # pytest tests
│   ├── create_admin.py         # Script: create admin user
│   ├── seed_tracks.py          # Script: seed training tracks
│   ├── seed_trainee.py         # Script: dev trainee account
│   ├── seed_mentor.py          # Script: dev mentor account
│   ├── Dockerfile              # Container image for API + Celery
│   └── requirements.txt        # Python dependencies
│
├── frontend\                   # pnpm monorepo
│   ├── apps\
│   │   ├── landing\            # Public website (port 3000)
│   │   ├── admin\              # Admin dashboard (port 3001)
│   │   ├── lms\                # Trainee portal (port 3002)
│   │   └── mentor\             # Mentor portal (port 3003)
│   ├── packages\
│   │   ├── ui\                 # Shared React components
│   │   ├── hooks\              # Shared hooks (auth, API)
│   │   └── utils\              # API client, config, dates
│   ├── package.json            # Root scripts (dev:admin, build:all, etc.)
│   └── .env                    # VITE_* variables for all apps
│
├── nginx\
│   └── conf.d\default.conf     # Production reverse proxy rules
│
├── scripts\                    # Windows PowerShell automation
│   ├── start-all-dev.ps1       # Start everything locally
│   ├── stop-all-dev.ps1        # Stop all dev servers
│   ├── start-dev.ps1           # Backend only
│   ├── docker-start.ps1        # Docker dev stack
│   ├── docker-prod.ps1         # Docker production stack
│   ├── deploy.ps1              # Full production deploy
│   └── install-docker.ps1      # One-time Docker install
│
├── uploads\                    # User-uploaded files
├── docker-compose.yml          # Production services definition
├── docker-compose.dev.yml      # Dev overrides (expose ports)
├── .env                        # Active backend environment
├── .env.development            # Local dev template
├── .env.docker                 # Docker dev template
├── .env.example                # Production secrets template
└── README.md                   # Quick start
```

---

## 4. The Four Portals

| Portal | URL (dev) | Who uses it | Main pages |
|--------|-----------|-------------|------------|
| **Landing** | http://localhost:3000 | Public | Home, Apply, Payment, Status |
| **Admin** | http://localhost:3001 | Staff | Dashboard, Applications, Tracks, Modules, Mentors, Quizzes, Announcements, Analytics |
| **LMS** | http://localhost:3002 | Trainees | Dashboard, Modules, Quiz, Worklogs, Evaluations, Leaderboard, Profile |
| **Mentor** | http://localhost:3003 | Mentors | Dashboard, Trainees, Worklogs, Evaluations |

Each portal is a **separate Vite app** but shares code via `frontend/packages/`.

---

## 5. Complete User Journeys (End-to-End Flows)

### Flow A: Application → Payment → Trainee Account

This is the main onboarding flow.

```
Step 1: APPLY
  User visits Landing → /apply
  File: frontend/apps/landing/src/pages/ApplyPage.tsx
    - Fetches tracks: GET /api/v1/public/tracks
    - Submits form: POST /api/v1/public/apply
  File: backend/app/routers/public.py → submit_application()
    - Creates Application document (status = "pending")
    - Returns application ID
  Redirect → /payment/{applicationId}

Step 2: PAY
  File: frontend/apps/landing/src/pages/PaymentPage.tsx
    - POST /api/v1/public/payments/create-order
  File: backend/app/routers/public.py → create_payment_order()
    - Calls Razorpay API to create order
    - Returns order_id, amount, key_id
  Frontend opens Razorpay checkout popup
  User pays with card/UPI

Step 3: WEBHOOK (automatic)
  Razorpay → POST /api/v1/webhooks/razorpay
  File: backend/app/routers/webhooks.py
    - Verifies HMAC signature
    - On payment.captured: creates Payment record
    - Updates Application status → "paid"

Step 4: ADMIN VERIFY
  Admin logs in → Applications page
  File: frontend/apps/admin/src/pages/ApplicationsPage.tsx
    - Clicks Verify on a paid application
    - PUT /api/v1/admin/applications/{id}/verify
  File: backend/app/services/application_service.py → verify_application()
    - Generates unique_id (e.g. A1FS26010001)
    - Creates User with role="trainee"
    - Password = unique_id (hashed)
    - Unlocks Module 1 in TraineeProgress
    - Sends welcome email via Celery
    - Application status → "verified"

Step 5: TRAINEE LOGIN
  Trainee visits LMS → /login
  File: frontend/apps/lms/src/pages/LoginPage.tsx
    - POST /api/v1/auth/login { identifier, password }
  Login with unique_id or email + password (unique_id by default)
```

### Flow B: Trainee Learning (LMS)

```
Dashboard → Modules list
  File: backend/app/routers/lms/modules.py
    - GET /api/v1/lms/modules
    - Returns modules with lock/unlock status from TraineeProgress

Module Detail → Read tasks → Take Quiz
  File: backend/app/services/quiz_service.py
    - start_quiz(): creates QuizAttempt (in_progress)
    - submit_quiz(): scores answers
    - If score >= passing_score → unlocks next module

Submit GitHub URL (for evaluation)
  File: backend/app/routers/lms/profile.py → submit_github()
    - Creates Evaluation (status = pending)
    - Assigns mentor via mentor_service.resolve_mentor_for_trainee()

Daily Worklog
  File: backend/app/routers/lms/worklogs.py
    - POST /api/v1/lms/worklogs (one per day)
    - Mentor reviews in mentor portal
```

### Flow C: Mentor Review

```
Worklogs
  File: backend/app/routers/mentor/worklogs.py
    - GET pending worklogs for assigned trainees
    - PUT /{id} → approve or reject with note

Evaluations
  File: backend/app/routers/mentor/evaluations.py
    - GET evaluations assigned to this mentor
    - PUT /{id}/draft → save partial scores
    - PUT /{id}/submit → compute final_score, send email
  File: backend/app/services/evaluation_service.py
```

### Flow D: Admin Management

| Action | Frontend page | Backend router |
|--------|---------------|----------------|
| View stats | `DashboardPage.tsx` | `admin/dashboard.py` |
| Manage applications | `ApplicationsPage.tsx` | `admin/applications.py` |
| Create tracks | `TracksPage.tsx` | `admin/tracks.py` |
| Create modules | `ModulesPage.tsx` | `admin/modules.py` |
| Create mentors + assign | `MentorsPage.tsx` | `admin/mentors.py` |
| Create quizzes | `QuizzesPage.tsx` | `admin/quizzes.py` |
| Post announcements | `AnnouncementsPage.tsx` | `admin/announcements.py` |
| View analytics | `AnalyticsPage.tsx` | `admin/analytics.py` |

---

## 6. Authentication & Security Flow

### Login sequence

```
1. User submits identifier + password on LoginPage
2. POST /api/v1/auth/login
3. backend/app/services/auth_service.py → authenticate_user()
   - Finds user by email OR unique_id OR emp_id
   - Verifies bcrypt password
4. Creates JWT access token (15 min) + refresh token (7 days)
5. Refresh token stored in HttpOnly cookie (path=/api/v1/auth)
6. Access token returned in JSON → stored in Zustand (frontend)
7. All API calls send: Authorization: Bearer <access_token>
```

### Protected routes

```
File: backend/app/routers/auth_deps.py
  - get_current_user: decodes JWT, checks Redis blacklist
  - require_role("admin"|"trainee"|"mentor"): rejects wrong role

File: frontend/packages/ui/src/components/ProtectedRoute.tsx
  - Redirects to /login if not authenticated
  - Checks allowedRoles prop
```

### Token refresh

```
On 401 response → frontend/packages/utils/src/api-client.ts
  → POST /api/v1/auth/refresh (sends cookie automatically)
  → Gets new access token → retries original request
```

### Logout

```
POST /api/v1/auth/logout
  → Adds refresh token to Redis blacklist
  → Clears cookie
  → Frontend clears Zustand state
```

---

## 7. Payment Flow (Razorpay)

```
┌──────────┐    create-order     ┌─────────┐    API call    ┌──────────┐
│ Frontend │ ──────────────────► │ Backend │ ─────────────► │ Razorpay │
│ Payment  │ ◄────────────────── │ public  │ ◄───────────── │   API    │
│   Page   │  order_id, key_id   │   .py   │                └──────────┘
└────┬─────┘                     └─────────┘
     │ opens checkout popup
     │ user pays
     ▼
┌──────────┐   payment.captured   ┌─────────┐
│ Razorpay │ ──────────────────► │ Backend │
│ webhook  │                     │webhooks │
└──────────┘                     │  .py    │
                                 └────┬────┘
                                      │ Application.status = "paid"
                                      ▼
                                 ┌─────────┐
                                 │ MongoDB │
                                 └─────────┘
```

**Required `.env` keys:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

**Fee:** `APPLICATION_FEE_PAISE=50000` → ₹500.00

**Local testing:** Use ngrok to expose port 8000 for webhooks.

---

## 8. Backend — File-by-File Guide

### Core (`backend/app/`)

| File | What it contains |
|------|------------------|
| `main.py` | FastAPI app creation, middleware stack, router registration, `/health` endpoint |
| `config.py` | `Settings` class — reads all env vars via pydantic-settings |
| `database.py` | `init_db()` registers all Beanie models; `get_motor_client()` returns Mongo client |
| `celery_app.py` | Celery instance, Redis broker, beat schedule for daily backup |

### Models (`backend/app/models/`)

| File | MongoDB collection | Purpose |
|------|-------------------|---------|
| `user.py` | `users` | All users: admin, trainee, mentor. Fields: role, email, unique_id, emp_id, profile, track_id |
| `application.py` | `applications` | Internship applications. Status: pending → paid → verified |
| `track.py` | `tracks` | Training programs (e.g. Full Stack, Data Science) |
| `module.py` | `modules` | Learning modules within a track (ordered, with tasks) |
| `trainee_progress.py` | `trainee_progress` | Per-trainee module unlock/pass state |
| `quiz.py` | `quizzes` | Quiz definitions with questions, passing score, cooldown |
| `quiz_attempt.py` | `quiz_attempts` | Individual quiz attempts (in_progress, passed, failed) |
| `worklog.py` | `worklogs` | Daily trainee work logs (pending, approved, rejected) |
| `evaluation.py` | `evaluations` | Mentor-graded project evaluations |
| `mentor_assignment.py` | `mentor_assignments` | Which mentor handles which trainee index range per track |
| `announcement.py` | `announcements` | Admin announcements (optionally filtered by track) |
| `payment.py` | `payments` | Razorpay payment records |
| `audit_log.py` | `audit_log` | Admin action audit trail |

### Routers (`backend/app/routers/`)

| File | Prefix | Auth | Purpose |
|------|--------|------|---------|
| `auth.py` | `/api/v1/auth` | Public | Login, logout, refresh, forgot/reset password |
| `public.py` | `/api/v1/public` | Public | Apply, list tracks, payment order, application status |
| `webhooks.py` | `/api/v1/webhooks` | Signature | Razorpay payment webhook |
| `auth_deps.py` | — | — | `get_current_user`, `require_role` dependencies |
| `admin/dashboard.py` | `/api/v1/admin` | admin | Dashboard stats |
| `admin/applications.py` | `/api/v1/admin/applications` | admin | CRUD + verify applications |
| `admin/tracks.py` | `/api/v1/admin/tracks` | admin | Create/list/deactivate tracks |
| `admin/modules.py` | `/api/v1/admin/modules` | admin | CRUD modules with tasks |
| `admin/mentors.py` | `/api/v1/admin/mentors` | admin | Create mentors, assign to track ranges |
| `admin/quizzes.py` | `/api/v1/admin/quizzes` | admin | Create/list/deactivate quizzes |
| `admin/announcements.py` | `/api/v1/admin/announcements` | admin | CRUD announcements |
| `admin/analytics.py` | `/api/v1/admin/analytics` | admin | Quiz pass rates, worklog stats |
| `lms/dashboard.py` | `/api/v1/lms` | trainee | Trainee dashboard data |
| `lms/modules.py` | `/api/v1/lms/modules` | trainee | List modules, module detail |
| `lms/quizzes.py` | `/api/v1/lms/quizzes` | trainee | Start quiz, submit answers, history |
| `lms/worklogs.py` | `/api/v1/lms/worklogs` | trainee | List/create daily worklogs |
| `lms/profile.py` | `/api/v1/lms/profile` | trainee | Profile, password, GitHub submit |
| `lms/evaluations.py` | `/api/v1/lms/evaluations` | trainee | View evaluation results |
| `lms/leaderboard.py` | `/api/v1/lms/leaderboard` | trainee | Track leaderboard |
| `lms/announcements.py` | `/api/v1/lms/announcements` | trainee | View announcements |
| `mentor/dashboard.py` | `/api/v1/mentor` | mentor | Mentor dashboard stats |
| `mentor/trainees.py` | `/api/v1/mentor/trainees` | mentor | List assigned trainees |
| `mentor/worklogs.py` | `/api/v1/mentor/worklogs` | mentor | Review worklogs |
| `mentor/evaluations.py` | `/api/v1/mentor/evaluations` | mentor | Grade evaluations |

### Services (`backend/app/services/`)

| File | Key functions | Why separate from routers |
|------|---------------|---------------------------|
| `auth_service.py` | login, logout, refresh, password reset | Reusable auth logic |
| `application_service.py` | `verify_application()` | Complex multi-step trainee creation |
| `quiz_service.py` | start, submit, unlock next module | Quiz scoring + progression rules |
| `evaluation_service.py` | draft, submit evaluation | Score calculation + email |
| `mentor_service.py` | `resolve_mentor_for_trainee()` | Index-based mentor assignment |

### Schemas (`backend/app/schemas/`)

Pydantic models for **API request/response shapes** (separate from DB models):

| File | Models |
|------|--------|
| `auth.py` | LoginRequest, LoginResponse, RefreshResponse |
| `application.py` | ApplicationCreate, ApplicationResponse, ApplicationListResponse |
| `track.py` | Track DTOs |
| `module.py` | ModuleListItem, ModuleDetailResponse |
| `quiz.py` | Quiz DTOs |
| `worklog.py` | WorklogCreate, WorklogResponse, WorklogReviewRequest |
| `evaluation.py` | EvaluationDraftRequest, score fields |

### Middleware (`backend/app/middleware/`)

| File | Purpose |
|------|---------|
| `logging.py` | Adds `X-Correlation-ID` to every request for tracing |
| `rate_limit.py` | SlowAPI limiter — 100 req/min global, 5 login/min per IP |

### Tasks (`backend/app/tasks/`)

| File | Celery task | Trigger |
|------|-------------|---------|
| `email.py` | `send_welcome_email` | After application verify |
| `email.py` | `send_password_reset_email` | Forgot password |
| `email.py` | `send_worklog_approved_email` | Worklog approved |
| `email.py` | `send_evaluation_graded_email` | Evaluation submitted |
| `backup.py` | `run_backup` | Daily via Celery Beat |
| `certificate.py` | `generate_certificate` | Stub (future) |

### Utils (`backend/app/utils/`)

| File | Purpose |
|------|---------|
| `security.py` | bcrypt hash/verify, JWT create/decode, reset tokens |
| `unique_id.py` | Generates trainee IDs: `A1{month}{year}{track_code}{seq}` |
| `redis_client.py` | Async Redis client (or fake Redis in dev) |
| `mail.py` | SMTP email sending |
| `file_upload.py` | File upload validation and storage |

### Seed scripts (`backend/`)

| Script | Command | Creates |
|--------|---------|---------|
| `create_admin.py` | `python create_admin.py` | Admin user |
| `seed_tracks.py` | `python seed_tracks.py` | 4 default tracks |
| `seed_trainee.py` | `python seed_trainee.py` | Dev trainee account |
| `seed_mentor.py` | `python seed_mentor.py` | Dev mentor account |

---

## 9. Frontend — File-by-File Guide

### Monorepo layout

```
frontend/
├── package.json          # Root scripts: dev:landing, dev:admin, build:all
├── pnpm-workspace.yaml   # Declares apps/* and packages/*
├── .env                  # Shared VITE_* env vars (read by all apps via envDir)
│
├── apps/
│   ├── landing/          # @itp/landing — port 3000
│   ├── admin/            # @itp/admin — port 3001
│   ├── lms/              # @itp/lms — port 3002
│   └── mentor/           # @itp/mentor — port 3003
│
└── packages/
    ├── ui/               # @itp/ui — shared components
    ├── hooks/            # @itp/hooks — auth, API hooks
    └── utils/            # @itp/utils — API client, config, dates
```

### Each app has the same internal structure

```
apps/{portal}/src/
├── main.tsx              # React entry point, mounts App
├── App.tsx               # RouterProvider + QueryClient + auth bootstrap
├── router.tsx            # Route definitions (lazy-loaded pages)
├── pages/                # One file per screen
├── components/           # Portal-specific layout (AdminLayout, LmsLayout, etc.)
└── vite.config.ts        # Vite config: port, aliases to @itp/* packages
```

### Landing app pages

| File | Route | What it does |
|------|-------|--------------|
| `HomePage.tsx` | `/` | Marketing homepage with CTA to apply |
| `ApplyPage.tsx` | `/apply` | Application form — fetches tracks, submits to API |
| `PaymentPage.tsx` | `/payment/:id` | Razorpay checkout integration |
| `ApplicationStatusPage.tsx` | `/status/:id` | Shows application status (pending/paid/verified) |

### Admin app pages

| File | Route | What it does |
|------|-------|--------------|
| `LoginPage.tsx` | `/login` | Admin login form |
| `DashboardPage.tsx` | `/` | Stats cards (applications, users, revenue) |
| `ApplicationsPage.tsx` | `/applications` | List, filter, verify, delete applications |
| `TracksPage.tsx` | `/tracks` | Create and manage training tracks |
| `ModulesPage.tsx` | `/modules` | CRUD modules with tasks per track |
| `MentorsPage.tsx` | `/mentors` | Create mentors, assign to trainee ranges |
| `QuizzesPage.tsx` | `/quizzes` | Create quizzes with questions |
| `AnnouncementsPage.tsx` | `/announcements` | Post announcements |
| `AnalyticsPage.tsx` | `/analytics` | Charts — quiz pass rate, worklog stats |

### LMS app pages

| File | Route | What it does |
|------|-------|--------------|
| `LoginPage.tsx` | `/login` | Trainee login (unique_id or email) |
| `DashboardPage.tsx` | `/` | Progress overview, announcements |
| `ModulesPage.tsx` | `/modules` | Module list with lock/unlock indicators |
| `ModuleDetailPage.tsx` | `/modules/:id` | Task list for a module |
| `QuizPage.tsx` | `/quiz/:id` | Take quiz, submit answers |
| `WorklogsPage.tsx` | `/worklogs` | Submit and view daily worklogs |
| `EvaluationsPage.tsx` | `/evaluations` | View evaluation grades |
| `LeaderboardPage.tsx` | `/leaderboard` | Track rankings |
| `ProfilePage.tsx` | `/profile` | Edit profile, change password, submit GitHub |

### Mentor app pages

| File | Route | What it does |
|------|-------|--------------|
| `LoginPage.tsx` | `/login` | Mentor login (email or emp_id) |
| `DashboardPage.tsx` | `/` | Pending reviews count |
| `TraineesPage.tsx` | `/trainees` | List assigned trainees |
| `WorklogsPage.tsx` | `/worklogs` | Approve/reject worklogs |
| `EvaluationsPage.tsx` | `/evaluations` | Draft and submit evaluation scores |

### Shared packages

#### `@itp/ui` (`packages/ui/src/components/`)

| Component | Used for |
|-----------|----------|
| `Button.tsx` | Primary/secondary/outline buttons with loading state |
| `Input.tsx` | Form inputs with label and error message |
| `Card.tsx` | Content cards with header |
| `Table.tsx` | Data tables |
| `Modal.tsx` | Dialog overlays |
| `Badge.tsx` | Status badges (pending, approved, etc.) |
| `Sidebar.tsx` | Navigation sidebar + AppLayout wrapper |
| `Skeleton.tsx` | Loading placeholders |
| `ProtectedRoute.tsx` | Auth guard — redirects to login |
| `ErrorState.tsx` | Error display with retry |

#### `@itp/hooks` (`packages/hooks/src/`)

| File | Exports | Purpose |
|------|---------|---------|
| `useAuth.ts` | `useAuth`, `useAuthStore`, `initAuthClient` | Login/logout, Zustand auth state |
| `useAuthBootstrap.ts` | `useAuthBootstrap` | Restore session on page load via refresh token |
| `useApi.ts` | `useApiQuery`, `useApiMutation` | TanStack Query wrappers with auth |
| `useDebounce.ts` | `useDebounce` | Input debouncing |
| `useLocalStorage.ts` | `useLocalStorage` | Persist state in localStorage |

#### `@itp/utils` (`packages/utils/src/`)

| File | Exports | Purpose |
|------|---------|---------|
| `api-client.ts` | `apiClient`, `configureApiClient` | Axios instance with auto token refresh |
| `config.ts` | `API_BASE_URL`, `API_V1`, `PORTAL_URLS` | Environment-based URLs |
| `token.ts` | `parseJwtPayload`, `UserRole`, `AuthUser` | JWT parsing utilities |
| `dates.ts` | `formatDate`, `formatDateTime`, `formatRelative` | Date formatting |

---

## 10. Database Models & Relationships

```
Track (1) ──────────► (many) Module
  │                      │
  │                      └──► (1) Quiz
  │
  ├──► (many) Application ──► (1) Payment
  │         │
  │         └── verify ──► User (trainee)
  │                           │
  │                           ├──► TraineeProgress (per module)
  │                           ├──► QuizAttempt
  │                           ├──► Worklog ──► Mentor reviews
  │                           └──► Evaluation ──► Mentor grades
  │
  └──► (many) MentorAssignment ──► User (mentor)

User roles: admin | trainee | mentor
```

### Application status lifecycle

```
pending  ──(Razorpay webhook)──►  paid  ──(admin verify)──►  verified
```

### Trainee progression

```
Module 1 (unlocked on verify)
  └── pass quiz ──► Module 2 unlocked
        └── pass quiz ──► Module 3 unlocked
              └── ... and so on
```

---

## 11. API Endpoint Map

Full interactive docs: **http://localhost:8000/docs**

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/public/tracks` | List active tracks |
| POST | `/api/v1/public/apply` | Submit application |
| GET | `/api/v1/public/applications/{id}/status` | Check status |
| POST | `/api/v1/public/payments/create-order` | Create Razorpay order |
| POST | `/api/v1/webhooks/razorpay` | Payment webhook |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Request reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Admin (requires role=admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Stats |
| GET/POST | `/api/v1/admin/applications` | List/create |
| PUT | `/api/v1/admin/applications/{id}/verify` | Verify → create trainee |
| GET/POST/DELETE | `/api/v1/admin/tracks` | Track CRUD |
| GET/POST/PUT/DELETE | `/api/v1/admin/modules` | Module CRUD |
| GET/POST | `/api/v1/admin/mentors` | Mentor CRUD + assign |
| GET/POST/DELETE | `/api/v1/admin/quizzes` | Quiz CRUD |
| GET/POST/DELETE | `/api/v1/admin/announcements` | Announcements |
| GET | `/api/v1/admin/analytics` | Analytics data |

### LMS (requires role=trainee)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lms/dashboard` | Dashboard |
| GET | `/api/v1/lms/modules` | Module list |
| GET | `/api/v1/lms/modules/{id}` | Module detail |
| POST | `/api/v1/lms/quizzes/{id}/start` | Start quiz |
| POST | `/api/v1/lms/quizzes/{id}/submit` | Submit quiz |
| GET/POST | `/api/v1/lms/worklogs` | Worklogs |
| GET/PUT | `/api/v1/lms/profile` | Profile |
| GET | `/api/v1/lms/evaluations` | Evaluations |
| GET | `/api/v1/lms/leaderboard` | Leaderboard |
| GET | `/api/v1/lms/announcements` | Announcements |

### Mentor (requires role=mentor)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mentor/dashboard` | Dashboard |
| GET | `/api/v1/mentor/trainees` | Assigned trainees |
| GET/PUT | `/api/v1/mentor/worklogs` | Review worklogs |
| GET/PUT | `/api/v1/mentor/evaluations` | Grade evaluations |

---

## 12. Environment Variables

### Backend (`.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `APP_ENV` | `development` | Environment mode |
| `SECRET_KEY` | random string | App secret |
| `MONGO_URI` | `mongodb://localhost:27017/altisonelabz` | Database connection |
| `MONGO_DB_NAME` | `altisonelabz` | Database name |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `USE_FAKE_REDIS` | `true` | Use in-memory Redis (dev only) |
| `JWT_SECRET` | 32+ char string | JWT signing key |
| `JWT_ACCESS_EXPIRE_MINUTES` | `15` | Access token TTL |
| `JWT_REFRESH_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `ALLOWED_ORIGINS` | comma-separated URLs | CORS allowed origins |
| `SMTP_*` | Gmail settings | Email delivery |
| `RAZORPAY_KEY_ID` | `rzp_test_xxx` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | secret | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | secret | Webhook signature verification |
| `APPLICATION_FEE_PAISE` | `50000` | Fee in paise (₹500) |
| `FRONTEND_*_URL` | portal URLs | Used in emails |

### Frontend (`frontend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_LANDING_URL` | `http://localhost:3000` | Landing portal URL |
| `VITE_ADMIN_URL` | `http://localhost:3001` | Admin portal URL |
| `VITE_LMS_URL` | `http://localhost:3002` | LMS portal URL |
| `VITE_MENTOR_URL` | `http://localhost:3003` | Mentor portal URL |

---

## 13. Scripts & How to Run

| Script | Command | What it does |
|--------|---------|--------------|
| Start everything | `powershell -File scripts\start-all-dev.ps1` | Backend + all 4 frontends |
| Stop everything | `powershell -File scripts\stop-all-dev.ps1` | Kill ports 8000, 3000-3003 |
| Backend only | `powershell -File scripts\start-dev.ps1` | API on :8000 (needs MongoDB) |
| Docker dev | `powershell -File scripts\docker-start.ps1` | Full stack in Docker |
| Docker prod | `powershell -File scripts\docker-prod.ps1` | Production with nginx |
| Deploy | `powershell -File scripts\deploy.ps1` | Build + deploy production |
| Install Docker | `powershell -File scripts\install-docker.ps1` | One-time Docker setup |

### Manual commands

```powershell
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python create_admin.py
python seed_tracks.py
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Frontend (each in separate terminal)
cd frontend
npx pnpm dev:landing    # :3000
npx pnpm dev:admin      # :3001
npx pnpm dev:lms        # :3002
npx pnpm dev:mentor     # :3003

# Tests
cd backend
pytest
```

---

## 14. Docker & Production Deployment

### Services (docker-compose.yml)

| Service | Image | Port | Role |
|---------|-------|------|------|
| nginx | nginx:1.25 | 80, 443 | Serves frontends + proxies API |
| api | backend/Dockerfile | 8000 | FastAPI |
| celery | backend/Dockerfile | — | Background worker |
| celery-beat | backend/Dockerfile | — | Scheduled tasks |
| mongodb | mongo:7.0 | 27017 | Database |
| redis | redis:7-alpine | 6379 | Cache + Celery broker |

### Nginx routing (production)

| Domain | Serves |
|--------|--------|
| `altisonelabz.com` | Landing SPA |
| `admin.altisonelabz.com` | Admin SPA |
| `lms.altisonelabz.com` | LMS SPA |
| `mentor.altisonelabz.com` | Mentor SPA |
| `api.altisonelabz.com` | API proxy |

### Deploy steps

1. Copy `.env.example` → `.env`, fill production secrets
2. Open Docker Desktop
3. Run `powershell -File scripts\deploy.ps1`
4. Access http://localhost (nginx serves everything)

---

## 15. Default Dev Credentials

| Role | Portal | Login | Password |
|------|--------|-------|----------|
| Admin | http://localhost:3001 | `admin@altisonelabz.com` | `changeme123` |
| Trainee | http://localhost:3002 | `trainee@altisonelabz.com` or `A1FS26010001` | `changeme123` |
| Mentor | http://localhost:3003 | `mentor@altisonelabz.com` or `MENTOR001` | `changeme123` |

> Production trainees get password = their `unique_id`. Production mentors get password = their `emp_id`.

---

## 16. Key File Walkthroughs (Line by Line)

### `backend/app/main.py` — The API entry point

```python
# Lines 1-40: Imports
#   - FastAPI framework + middleware (CORS, rate limiting)
#   - All router modules (auth, public, admin, lms, mentor, webhooks)
#   - Settings from config.py, Redis client

# Lines 45-52: lifespan() — runs on startup/shutdown
#   - init_db() → connects MongoDB, registers all Beanie models
#   - create_redis_client() → connects Redis (or fake Redis in dev)
#   - On shutdown: closes Redis connection

# Lines 55-62: create_app() — builds FastAPI instance
#   - Sets title, version, docs URLs
#   - Attaches lifespan handler

# Lines 64-66: Rate limiting setup (SlowAPI)

# Lines 68-75: Middleware stack (order matters — last added runs first)
#   - CORS: allows frontend origins from ALLOWED_ORIGINS env
#   - CorrelationId: adds request tracing ID

# Lines 77-96: /health endpoint
#   - Pings MongoDB and Redis
#   - Returns 200 if both OK, 503 if degraded

# Lines 98-125: Router registration
#   - Each include_router() mounts a route file under a URL prefix
#   - Example: auth.router → /api/v1/auth/login, /refresh, etc.

# Line 130: app = create_app() — module-level instance used by uvicorn
```

### `backend/app/services/application_service.py` — Verify application

```python
# verify_application(application_id):
#   1. Load application from MongoDB
#   2. Check status is "paid" (not pending or already verified)
#   3. Check no existing user with same email
#   4. Load track to get track code
#   5. Count verified applications in this track → generate unique_id
#      Format: A1{month_letter}{year}{track_code}{sequence}
#      Example: A1FS26010001
#   6. Create User document:
#      - role = "trainee"
#      - password = hash(unique_id)  ← trainee logs in with unique_id
#      - profile from application data
#      - track_id from application
#   7. Find Module with order=1 for this track
#   8. Create TraineeProgress with is_unlocked=True for module 1
#   9. Update application status → "verified"
#  10. Queue welcome email via Celery (async, non-blocking)
```

### `frontend/apps/landing/src/pages/ApplyPage.tsx` — Application form

```typescript
// Lines 1-10: Imports — react-hook-form, zod validation, API utils
// Lines 12-19: Zod schema — validates name, email, phone, track_id
// Lines 23-28: Track interface — shape of track data from API
// Lines 32-38: useQuery — fetches GET /api/v1/public/tracks on page load
// Lines 40-44: useForm — sets up form with zodResolver
// Lines 46-56: useMutation — on submit calls POST /api/v1/public/apply
//   - On success: toast + navigate to /payment/{id}
// Lines 75-100: Form JSX
//   - Input fields for name, email, phone, college, city
//   - Track dropdown populated from API
//   - Submit button
```

### `frontend/packages/hooks/src/useAuth.ts` — Auth state

```typescript
// Lines 13-22: Zustand store — holds accessToken, userId, role, isAuthenticated
// Lines 26-48: initAuthClient() — configures axios interceptors
//   - Attaches Bearer token to every request
//   - On 401: tries refresh, then clears auth
// Lines 61-68: login() — POST /auth/login, stores token in Zustand
// Lines 70-76: logout() — POST /auth/logout, clears Zustand
// Lines 78: hasRole() — checks if user has required role
```

### `frontend/packages/ui/src/components/ProtectedRoute.tsx` — Route guard

```typescript
// Wraps routes that require authentication
// Props: allowedRoles (e.g. ["admin"])
// Logic:
//   1. If not authenticated → redirect to /login
//   2. If role not in allowedRoles → redirect to /login
//   3. Otherwise → render children
```

### `backend/app/routers/webhooks.py` — Razorpay webhook

```python
# POST /api/v1/webhooks/razorpay
#   1. Read raw request body
#   2. Get X-Razorpay-Signature header
#   3. Compute HMAC-SHA256 of body with RAZORPAY_WEBHOOK_SECRET
#   4. Compare signatures (prevents fake webhooks)
#   5. Parse JSON payload
#   6. If event == "payment.captured":
#      a. Check idempotency (don't process same payment twice)
#      b. Extract application_id from payment notes
#      c. Create Payment record in MongoDB
#      d. Update Application status from "pending" → "paid"
#   7. Return {"status": "ok"}
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  LOCAL DEV URLS                                         │
├─────────────────────────────────────────────────────────┤
│  API Docs:    http://localhost:8000/docs               │
│  Landing:     http://localhost:3000                     │
│  Admin:       http://localhost:3001                     │
│  LMS:         http://localhost:3002                     │
│  Mentor:      http://localhost:3003                     │
├─────────────────────────────────────────────────────────┤
│  START:  powershell -File scripts\start-all-dev.ps1     │
│  STOP:   powershell -File scripts\stop-all-dev.ps1     │
│  DEPLOY: powershell -File scripts\deploy.ps1            │
│  TEST:   cd backend && pytest                           │
└─────────────────────────────────────────────────────────┘
```

---

*Generated for AltisOne ITP v3.0 — use this document to onboard your team and explain every part of the system.*
