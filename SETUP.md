# Human Manual — Local Setup Guide

## Prerequisites
- Node.js 20+
- npm 10+
- A Neon DB account (free tier works)
- A Firebase project

---

## Step 1 — Clone & install

```bash
# From the repo root
npm install
```

---

## Step 2 — Set up Neon DB

1. Go to https://console.neon.tech and create a free project
2. Click **Connect** → copy the **Pooled connection string** (it looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
3. Save it — you'll need it in Step 4

---

## Step 3 — Set up Firebase

1. Go to https://console.firebase.google.com → **Create project**
2. Enable **Authentication** → Sign-in methods → enable **Google**, **GitHub**, **Email/Password**
3. **Frontend config** (NEXT_PUBLIC_* vars):
   - Project Settings → General → scroll to "Your apps" → click Web (`</>`) → register app
   - Copy the `firebaseConfig` object values
4. **Backend service account** (FIREBASE_* vars):
   - Project Settings → Service accounts → **Generate new private key** → download JSON
   - Open the JSON — copy `project_id`, `client_email`, and `private_key`

---

## Step 4 — Create environment files

Copy the example file:
```bash
copy .env.local.example .env.local
```

Fill in all values in `.env.local`.

The file is read by both the API (`apps/api`) and the web app (`apps/web`).
Drizzle kit also reads it from the repo root for migrations.

---

## Step 5 — Push the database schema

```bash
npx drizzle-kit push --config=packages/db/drizzle.config.ts
```

This creates all tables in your Neon DB (no migration files needed for development).

---

## Step 6 — Run the app

Two terminals, or use the Turborepo shortcut:

**Terminal 1 — Backend (NestJS on port 3000)**
```bash
cd apps/api
npm install
npm run dev
```

**Terminal 2 — Frontend (Next.js on port 3001)**
```bash
cd apps/web
npm install
npm run dev
```

Or from the repo root (runs both):
```bash
npm run dev
```

Open http://localhost:3001

---

## Step 7 — Verify it's working

1. Visit http://localhost:3001 — landing page should load
2. Click **Get Started** → register with Google or email
3. You're redirected to `/onboarding` → complete the wizard
4. You land on `/dashboard` — your manual is created

Backend health check: http://localhost:3000/health → `{ "status": "ok" }`

---

## Deploying to Vercel

### Frontend
1. Push to GitHub
2. Import repo in Vercel → set **Root Directory** to `apps/web`
3. Add all `NEXT_PUBLIC_FIREBASE_*` env vars + `NEXT_PUBLIC_API_URL` (your backend Vercel URL)

### Backend (NestJS)
1. Import the same repo → set **Root Directory** to `apps/api`
2. Vercel detects `api/index.ts` as the serverless function entry
3. Add `DATABASE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FRONTEND_URL`

> **Tip**: Set `FIREBASE_PRIVATE_KEY` in Vercel by pasting the raw key value (with literal `\n`).
> Vercel preserves `\n` in env vars correctly.

---

## Project structure

```
my-manual/
├── apps/
│   ├── web/          # Next.js 15 frontend  (port 3001)
│   └── api/          # NestJS backend        (port 3000)
├── packages/
│   └── db/           # Drizzle ORM schema + Neon client
├── .env.local        # Your secrets (gitignored)
├── turbo.json
└── package.json
```
