# SkillBridge — Attendance Management System

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://assignment-intern-five.vercel.app |
| Backend  | https://skillbridge-api-9spi.onrender.com |
| API Base | https://skillbridge-api-9spi.onrender.com |

---

## Test Accounts

| Role               | Email                          | Password     |
|--------------------|--------------------------------|--------------|
| Student            | student.test@yopmail.com       | Khushi@12@34  |
| Trainer            | trainer.test@yopmail.com       | Khushi@12@34  |
| Institution Admin  | institution.test@yopmail.com   | Khushi@12@34  |
| Programme Manager  | manager.test@yopmail.com       | Khushi@12@34  |
| Monitoring Officer | monitor.test@yopmail.com       | Khushi@12@34  |

> Note: These use yopmail.com disposable inboxes. Email verification codes can be viewed at yopmail.com by typing the email address.

---

## What Each Role Can Do

### Student
- Sign up and log in
- View all sessions they are enrolled in
- Mark attendance for today's sessions (PRESENT or LATE)
- Cannot mark attendance twice for the same session (upsert prevents duplicates)
- Join a batch using an invite link shared by a Trainer

### Trainer
- Sign up and log in
- **Create batches** (My Batches tab) — linked to an institution by ID
- **Create sessions** for their own batches only — quick-pick batch buttons shown
- **Generate invite links** for their batches — shareable URL for students to join
- **View attendance** for their own sessions only
- Cannot create sessions or view attendance for batches they don't belong to (403 enforced server-side)

### Institution Admin
- Sign up and log in
- Must be assigned to an institution by a Programme Manager first
- **View all batches** under their institution
- **Create new batches** under their institution
- **Delete batches** they manage
- **View attendance summary** per batch (rate, student list)
- Cannot access batches from other institutions (scope check enforced server-side)

### Programme Manager
- Sign up and log in
- **Create institutions**
- **Delete institutions**
- **Assign trainers and institution admins** to institutions (from user list)
- **View all institutions** with attendance rates and session counts
- **View cross-institution summary** — programme-wide attendance overview

### Monitoring Officer
- Sign up and log in
- **Read-only** access to the entire programme
- Views programme-wide attendance rates and institution summaries
- No create, edit, or delete actions anywhere in the UI or API
- Any write attempt returns 403 server-side

---

## Typical End-to-End Flow

```
1. Programme Manager creates an Institution
2. Programme Manager assigns Trainer + Institution Admin to that Institution
3. Trainer creates a Batch under the Institution
4. Trainer generates an invite link for the Batch
5. Student uses invite link → joins the Batch
6. Trainer creates a Session for the Batch (date, time, title)
7. Student logs in on session day → marks attendance (Present / Late)
8. Trainer views attendance list for the session
9. Institution Admin views batch summary (attendance rate, student list)
10. Programme Manager / Monitoring Officer view programme-wide stats
```

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
# Tables already exist on Neon (created via SQL Editor)
# For a fresh local DB run: npx prisma migrate dev
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

## API Endpoints

| Method | Path | Who |
|--------|------|-----|
| POST | /users/sync | Any (on signup) |
| GET  | /users/me | Any authenticated |
| POST | /batches | TRAINER, INSTITUTION, PROGRAMME_MANAGER |
| GET  | /batches/my | TRAINER |
| POST | /batches/join-by-code | STUDENT |
| POST | /batches/:id/invite | TRAINER (own batches only) |
| POST | /batches/:id/join | STUDENT |
| GET  | /batches/:id/summary | INSTITUTION (own institution only) |
| DELETE | /batches/:id | INSTITUTION, PROGRAMME_MANAGER |
| POST | /sessions | TRAINER (own batches only) |
| GET  | /sessions/my | STUDENT |
| GET  | /sessions/trainer | TRAINER |
| GET  | /sessions/:id/attendance | TRAINER (own sessions only) |
| POST | /attendance/mark | STUDENT (enrolled batches only) |
| GET  | /institutions | PROGRAMME_MANAGER, MONITORING_OFFICER |
| POST | /institutions | PROGRAMME_MANAGER |
| DELETE | /institutions/:id | PROGRAMME_MANAGER |
| POST | /institutions/:id/assign-user | PROGRAMME_MANAGER |
| GET  | /institutions/users/all | PROGRAMME_MANAGER |
| GET  | /institutions/:id/summary | PROGRAMME_MANAGER |
| GET  | /institutions/:id/batches | INSTITUTION, PROGRAMME_MANAGER |
| GET  | /programme/summary | PROGRAMME_MANAGER, MONITORING_OFFICER |

All endpoints return **403** if the caller's role is not permitted. Ownership checks are enforced server-side (trainers scoped to their batches, institutions scoped to their batches).

---

## Schema Decisions

- **`@@unique([sessionId, studentId])`** on Attendance — prevents double-marking. Upsert allows changing LATE → PRESENT.
- **`inviteCode` on Batch** — UUID generated on demand, regenerated on each call. Simple and stateless.
- **Explicit join tables `BatchTrainer` / `BatchStudent`** — supports multiple trainers per batch, clean membership queries.
- **`clerkUserId` bridge** — `User.clerkUserId` maps to Clerk's JWT `sub`. Internal IDs use cuid for domain logic. Auth stays separate from data.
- **Role in Clerk `publicMetadata`** — embedded in JWT so every API call has the role without a DB lookup.
- **`institutionId` from DB not Clerk** — Institution dashboard calls `GET /users/me` to get `institutionId` directly from the DB, so it works without manually setting Clerk metadata.
- **Ownership checks** — server-side scope enforcement so a trainer cannot create sessions for another trainer's batch, and an institution admin cannot view another institution's batches.

---

## Stack Choices

| Layer    | Choice              | Why |
|----------|---------------------|-----|
| Frontend | React + Vite        | Fast dev, zero-config Vercel deploy |
| Backend  | Node.js + Express   | Clean REST, minimal overhead |
| Database | Neon (PostgreSQL)   | Free tier, serverless-compatible, pg-protocol |
| ORM      | Prisma              | Type-safe queries, migration support |
| Auth     | Clerk               | Built-in UI components, JWT + publicMetadata for roles |
| Deploy   | Render + Vercel     | Both free tier, GitHub-connected auto-deploy |

---

## What's Working / Partial / Skipped

### Fully Working
- All 5 roles: sign-up with role selection, login, correct dashboard routing
- Role verified server-side on every API call (403 on mismatch)
- **Student**: view sessions, mark attendance, join batch via invite link
- **Trainer**: create batches, create sessions (own batches only), generate invite links, view attendance (own sessions only)
- **Institution**: create/delete batches, view batch summaries, fetches institutionId from DB (not Clerk metadata)
- **Programme Manager**: create/delete institutions, assign users to institutions, cross-institution summary
- **Monitoring Officer**: read-only programme-wide stats, zero write actions in UI or API
- Batch invite flow: UUID → /join page → student enrolled
- Server-side ownership checks on all write operations

### Partially Done
- Institution Admin must be assigned by Programme Manager before their dashboard shows data
- Session "active" detection is date-only (today = active), not time-window based

### Skipped
- Email notifications
- Pagination on large lists
- Absent auto-marking for students who didn't check in
- Admin panel for bulk operations

---

## One Thing I'd Do Differently

Use Prisma `groupBy` + `_count` aggregation for attendance summaries instead of fetching full record sets and computing on the server. Works at this scale but would not hold up with thousands of rows per institution.

---

## Deployment Notes

- **Render**: Root Directory = `backend`, Build Command = `npm install && npx prisma generate`, Start Command = `node src/index.js`
- **Vercel**: Root Directory = `frontend`, env vars: `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`
- **DB tables**: Created via Neon SQL Editor directly — local `prisma migrate dev` was blocked by ISP firewall on port 5432. Migration SQL is in `prisma/migrations/` for reference.
- **CORS**: `FRONTEND_URL` env var on Render must match the Vercel deployment URL exactly
- **Cold start**: Render free tier sleeps after 15 min inactivity. Frontend pings `/health` on load to wake the server before user interaction.
