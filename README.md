# SkillBridge — Attendance Management System

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://assignment-intern-five.vercel.app |
| Backend  | https://skillbridge-api-9spi.onrender.com |
| API Base | https://skillbridge-api-9spi.onrender.com |

---

## Test Accounts

| Role               | Email                        | Password   |
|--------------------|------------------------------|------------|
| Student            | student@skillbridge.test     | Test1234!  |
| Trainer            | trainer@skillbridge.test     | Test1234!  |
| Institution Admin  | institution@skillbridge.test | Test1234!  |
| Programme Manager  | manager@skillbridge.test     | Test1234!  |
| Monitoring Officer | monitor@skillbridge.test     | Test1234!  |

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/Khushijain83037/assignment-intern
cd assignment-intern

# 2. Backend
cd backend
cp .env.example .env
# Fill in DATABASE_URL and CLERK_SECRET_KEY in .env
npm install
npx prisma generate
# Tables are already created via Neon SQL Editor (see prisma/migrations/)
# For fresh local DB run: npx prisma migrate dev
npm run dev
# Runs on http://localhost:4000

# 3. Frontend (new terminal)
cd ../frontend
cp .env.example .env
# Fill in VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL in .env
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Schema Decisions

- **`@@unique([sessionId, studentId])`** on Attendance — prevents a student marking twice. Upsert allows changing LATE → PRESENT.
- **`inviteCode` on Batch** — UUID generated on demand, regenerated each time. Simple and stateless.
- **Explicit join tables** `BatchTrainer` / `BatchStudent` — supports multiple trainers per batch, clean membership queries.
- **`clerkUserId` bridge** — `User.clerkUserId` maps to Clerk's `sub`. Internal IDs use cuid for domain logic.
- **Role + institutionId in Clerk `publicMetadata`** — embedded in JWT so role is available without a DB lookup. `institutionId` is also stored in DB and fetched via `GET /users/me` so the Institution dashboard works without relying on Clerk metadata alone.
- **Ownership checks** — Trainers can only create sessions / generate invites for batches they belong to. Institution admins can only view batches within their own institution. These scope checks are enforced server-side.

---

## Stack Choices

| Layer    | Choice              | Why |
|----------|---------------------|-----|
| Frontend | React + Vite        | Fast dev, zero-config Vercel deploy |
| Backend  | Node.js + Express   | Clean REST, minimal overhead |
| Database | Neon (PostgreSQL)   | Free tier, serverless-compatible |
| ORM      | Prisma              | Type-safe queries, migration support |
| Auth     | Clerk               | Built-in UI, JWT + publicMetadata for roles |
| Deploy   | Render (backend) + Vercel (frontend) | Both have free tiers, GitHub-connected auto-deploy |

---

## What's Working / Partial / Skipped

### Fully Working
- All 5 roles: sign-up with role selection on `/onboard`, login, correct dashboard routing
- Role verified server-side on every API call (403 returned on mismatch)
- **Trainer**: create sessions (only for own batches), view attendance (only own sessions), generate invite links
- **Student**: view enrolled sessions, mark attendance (PRESENT/LATE), duplicate prevention
- **Institution**: view batches + trainers, create batches, view attendance summary per batch — fetches institutionId from DB via `GET /users/me` (not Clerk metadata)
- **Programme Manager**: create/delete institutions, assign trainers to institutions, view cross-institution summary
- **Monitoring Officer**: read-only programme-wide summary, no create/edit/delete in UI
- Batch invite flow: UUID code → `/join` page → student enrolled in batch
- Ownership checks: trainers scoped to their batches, institutions scoped to their batches

### Partially Done
- Institution assignment (Programme Manager must manually assign Institution users via the dashboard)
- Session "active window" is date-based only (today = active), not time-range

### Skipped
- Email notifications
- Pagination on large lists
- Absent auto-marking for students who didn't check in

---

## One Thing I'd Do Differently

Use Prisma `groupBy` + `_count` aggregation for attendance summaries instead of fetching full record sets and computing server-side. Works at this scale but would not hold up with thousands of rows per institution.

---

## Deployment Notes

- **Render**: Root Directory = `backend`, Build Command = `npm install && npx prisma generate`, Start Command = `node src/index.js`
- **Vercel**: Root Directory = `frontend`, add env vars `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`
- **After first Render deploy**: tables were created via Neon SQL Editor directly (local migration was blocked by network firewall on port 5432)
- **CORS**: `FRONTEND_URL` env var on Render must be set to the Vercel URL
