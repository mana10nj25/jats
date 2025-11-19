# 🧭 Job Application Tracking System (JATS)


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Coverage Status](https://img.shields.io/badge/coverage->80%25-brightgreen.svg)]()
[![Node](https://img.shields.io/badge/node-20+-green.svg)]()
[![Angular](https://img.shields.io/badge/angular-17-red.svg)]()

> A secure, analytics-driven platform for tracking and managing your job applications end-to-end.

---

## 🚀 Overview

The **Job Application Tracking System (JATS)** is a full-stack web application built with  
**Angular + Node.js + MongoDB**. It enables professionals to log, monitor, and analyze their job applications securely — with dashboards, 2FA, and progress analytics.

---

## 📂 Project Structure
```
jats/
 ├─ backend/              # Node.js + Express API
 ├─ frontend/             # Angular 17 + TailwindCSS
 ├─ docs/                 # Functional / Technical specs
 ├─ .github/workflows/    # CI/CD pipelines
 ├─ package.json
 └─ README.md
```
---

## 🛠 Getting Started

### Backend (Node.js + Express)
1. `cd backend`
2. `cp .env.example .env` and update:
   - `MONGO_URI` → point this to your MongoDB Atlas connection string (or local Mongo instance).
   - `JWT_SECRET` → any secure random string.
3. `npm install`
4. `npm run dev` to start the API with ts-node-dev (listens on `http://localhost:4000` by default).
5. `npm test` to run the Jest + Supertest suite (uses an in-memory MongoDB server, no Atlas traffic).

Key scripts:
- `npm run build` - compile TypeScript to `dist/`.
- `npm start` - run the compiled server (after `npm run build`).

#### API docs (Swagger/OpenAPI)
- Browse interactive docs at `http://localhost:4000/api/docs/`.
- Raw OpenAPI JSON is available at `http://localhost:4000/api/docs.json` for integrations/tooling.

### Frontend (Angular 17)
1. `cd frontend`
2. `npm install`
3. `npm start` to launch the dev server at `http://localhost:4200`.
4. `npm run build` for a production build in `dist/`.

The Angular shell includes a dashboard view, a jobs workspace, and a shared job store service so the UI can evolve without rework.

#### API connectivity
- The Angular app reads/writes jobs through the Node API. Update `src/environments/environment.development.ts` if your API isn't running on `http://localhost:4000`.
- Visit `http://localhost:4200/auth` to use the login form, which stores the JWT automatically for API calls. All other pages stay hidden until you are signed in.
- Two-factor setup is optional and lives under **Admin** after login. Generate a secret/QR there and verify a 6-digit token if you want 2FA enabled.
- The **Menu** tab lets you log out and view the About section for JATS.
- Production builds default to a relative `/api` base (`src/environments/environment.ts`). Adjust when deploying the frontend separately from the backend.
