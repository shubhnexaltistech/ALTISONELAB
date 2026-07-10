# AltisOne ITP v3.0 — Production Ready

Full-stack internship training platform.

## Production Deployment

```bash
# 1. Configure secrets
cp .env.example .env
# Edit: SECRET_KEY, JWT_SECRET, MONGO_PASS, REDIS_PASS, SMTP, Razorpay keys

# 2. Build frontend (or use frontend Dockerfile)
cd frontend
cp .env.example .env.production
pnpm install && pnpm build:all
cd ..

# 3. Start all services
docker compose up -d --build

# 4. Create admin user
docker compose exec api python create_admin.py --email admin@altisonelabz.com --password YOUR_SECURE_PASSWORD
```

## Docker Setup (Windows)

### One-time: Install Docker + prerequisites

**Right-click PowerShell → Run as Administrator**, then:

```powershell
cd "e:\nexaltis lab"
powershell -ExecutionPolicy Bypass -File scripts\install-docker.ps1
```

Or double-click `scripts\setup.bat`

After install: **restart PC**, open **Docker Desktop**, wait until it shows "Running".

### Start the full stack

```powershell
cd "e:\nexaltis lab"
powershell -ExecutionPolicy Bypass -File scripts\docker-start.ps1
```

This will:
- Create `.env` from `.env.docker`
- Build frontend if needed
- Start MongoDB, Redis, API, Celery via Docker
- Create admin user

| URL | Description |
|-----|-------------|
| http://localhost:8000/docs | API documentation |
| http://localhost:3001 | Admin (run `npx pnpm dev:admin` in frontend/) |

### Stop the stack

```powershell
powershell -ExecutionPolicy Bypass -File scripts\docker-stop.ps1
```

### Production (with nginx on port 80)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\docker-prod.ps1
```

## Development (Windows — no Docker)

Docker is **not required** for local development. You only need **MongoDB** + **Python** + **Node**.

### Quick start — full stack (recommended)

```powershell
cd "e:\nexaltis lab"
powershell -ExecutionPolicy Bypass -File scripts\start-all-dev.ps1
```

Starts backend (:8000) + all four frontends (:3000–:3003).  
Stop everything: `powershell -ExecutionPolicy Bypass -File scripts\stop-all-dev.ps1`

| URL | Portal |
|-----|--------|
| http://localhost:8000/docs | API docs |
| http://localhost:3000 | Landing |
| http://localhost:3001 | Admin |
| http://localhost:3002 | LMS |
| http://localhost:3003 | Mentor |

**Dev branch:** [`shubh-work`](https://github.com/shubhnexaltistech/ALTISONELAB/tree/shubh-work) — see `TEAM_GUIDE.md` for full documentation.

### Step 1 — Install MongoDB (one-time)

Download and install **MongoDB Community Server**:  
https://www.mongodb.com/try/download/community

During install, check **"Install MongoDB as a Service"**.

### Step 2 — Start backend only (Terminal 1)

```powershell
cd "e:\nexaltis lab"
powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
```

This uses `.env.development` (in-memory Redis, no Docker).  
API: http://localhost:8000/docs  
Admin: `admin@altisonelabz.com` / `changeme123`

### Step 3 — Start frontend apps (Terminal 2+)

```powershell
cd "e:\nexaltis lab\frontend"
npx pnpm install
npx pnpm dev:admin     # http://localhost:3001
npx pnpm dev:landing   # http://localhost:3000
npx pnpm dev:lms       # http://localhost:3002
npx pnpm dev:mentor    # http://localhost:3003
```

### Default logins (local dev)

| Portal | Login | Password |
|--------|-------|----------|
| Admin | `admin@altisonelabz.com` | `changeme123` |
| LMS | `trainee@altisonelabz.com` or `A1FS26010001` | `changeme123` |
| Mentor | `mentor@altisonelabz.com` or `MENTOR001` | `changeme123` |

Seed scripts: `python seed_tracks.py`, `create_admin.py`, `seed_trainee.py`, `seed_mentor.py` (from `backend/` venv).

### Optional — Install Docker later

If you want the full production stack (nginx, celery, etc.), install **Docker Desktop**:  
https://www.docker.com/products/docker-desktop/

Then run `docker compose up -d --build`.

## Development (with Docker)

## Architecture

| Service | URL | Role |
|---------|-----|------|
| Landing | altisonelabz.com | Public apply + payment |
| Admin | admin.altisonelabz.com | Manage applications, tracks, modules |
| LMS | lms.altisonelabz.com | Trainee learning portal |
| Mentor | mentor.altisonelabz.com | Mentor review portal |
| API | api.altisonelabz.com | FastAPI backend |

## Stack

- **Backend**: FastAPI, MongoDB 7, Redis 7, Celery, Beanie ODM
- **Frontend**: React 18, Vite 5, TypeScript, Tailwind, TanStack Query, Zustand
- **Deploy**: Docker Compose, Nginx, Gunicorn + Uvicorn

## Documentation

- **`TEAM_GUIDE.md`** — Full team onboarding: architecture, file map, API endpoints, design system, git workflow
- **API Docs:** http://localhost:8000/docs

## Key Features (Production)

- JWT auth with HttpOnly refresh cookies + Redis blacklist
- Rate limiting: 5 login/min per IP, 100 req/min per user
- Module unlock chain, quiz cooldown, mentor assignment by index
- Razorpay payment flow with webhook idempotency
- Real SMTP emails via Celery (welcome, reset, worklog, evaluation)
- Auth session restore on page reload (refresh token bootstrap)
- Health check pings MongoDB + Redis

## Tests

```bash
cd backend && pytest
```
