# Startup Co-Pilot SaaS — Complete System Architecture

---

## 1. Recommended Tech Stack

### Frontend

| Layer            | Technology              | Why                                          |
|------------------|-------------------------|----------------------------------------------|
| Framework        | **React 18**            | Industry standard, massive community         |
| Build Tool       | **Vite**                | Instant dev server, fast builds              |
| Language         | **JavaScript (ES6+)**   | Beginner-friendly, no TS setup overhead      |
| Routing          | **React Router v6**     | Standard SPA routing                         |
| Styling          | **Tailwind CSS**        | Utility-first, no CSS files to manage        |
| HTTP Client      | **Axios**               | Clean API calls, interceptors for JWT        |
| State            | **React Context + useReducer** | Built-in, no extra libraries          |
| Forms            | **React Hook Form**     | Simple, performant form handling             |
| Notifications    | **React Hot Toast**     | Lightweight toast messages                   |
| Charts           | **Recharts**            | Simple React chart components                |
| PDF Export       | **jsPDF + html2canvas** | Client-side PDF generation, no server needed |
| Icons            | **Lucide React**        | Clean, consistent icon set                   |

### Backend

| Layer            | Technology              | Why                                          |
|------------------|-------------------------|----------------------------------------------|
| Runtime          | **Node.js**             | JavaScript everywhere                        |
| Framework        | **Express.js**          | Minimal, flexible, huge ecosystem            |
| Database         | **SQLite** (via better-sqlite3) | Zero config, single file, perfect for dev |
| ORM              | **Prisma**              | Type-safe queries, visual studio, migrations |
| Auth             | **jsonwebtoken (JWT)**  | Stateless auth, no session store needed      |
| Password Hashing | **bcryptjs**           | Industry standard, pure JS (no native deps)  |
| Validation       | **Zod**                 | Schema validation shared with frontend       |
| Logging          | **morgan + winston**    | Request logs + application logs              |
| Security         | **helmet + cors**       | HTTP headers + cross-origin protection       |
| Rate Limiting    | **express-rate-limit**  | Brute-force protection                       |
| Env Config       | **dotenv**              | Environment variable management              |

### Why SQLite?

| Concern             | SQLite Answer                                        |
|---------------------|------------------------------------------------------|
| Setup               | Zero — no install, no server, no Docker              |
| Storage             | Single file: `dev.db` in project root                |
| Performance         | Handles 100K+ users before needing Postgres          |
| Prisma support      | Full support — same ORM code, swap one line to Postgres later |
| Portability         | Copy the `.db` file and you have a full backup       |
| Production upgrade  | Change `datasource` in schema.prisma → done          |

---

## 2. Frontend Folder Structure

```
client/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── api/
│   │   └── axios.js                # Axios instance with JWT interceptor
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx  # Redirect if not logged in
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── DashboardLayout.jsx # Sidebar + content wrapper
│   │   │
│   │   ├── ideas/
│   │   │   ├── IdeaCard.jsx
│   │   │   └── IdeaForm.jsx
│   │   │
│   │   ├── details/
│   │   │   └── DetailsForm.jsx     # Multi-section structured form
│   │   │
│   │   ├── roadmap/
│   │   │   ├── MilestoneCard.jsx
│   │   │   └── TaskItem.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCards.jsx
│   │   │   └── ProgressChart.jsx
│   │   │
│   │   └── export/
│   │       └── ExportPreview.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Login state + JWT token
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Shortcut to AuthContext
│   │   └── useApi.js               # Reusable fetch wrapper
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Ideas.jsx               # List all ideas
│   │   ├── IdeaDetail.jsx          # Single idea + details form
│   │   ├── Roadmap.jsx             # Milestones + tasks
│   │   ├── Export.jsx              # Preview + download
│   │   └── NotFound.jsx
│   │
│   ├── utils/
│   │   └── formatDate.js
│   │
│   ├── App.jsx                     # Routes + AuthProvider
│   ├── main.jsx                    # Vite entry point
│   └── index.css                   # Tailwind directives
│
├── .env                            # VITE_API_URL=http://localhost:5000/api
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## 3. Backend Folder Structure

```
server/
├── prisma/
│   ├── schema.prisma               # Database models
│   ├── migrations/                  # Auto-generated
│   └── seed.js                      # Sample data for dev
│
├── src/
│   ├── config/
│   │   ├── index.js                 # Centralized env config
│   │   └── db.js                    # Prisma client singleton
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification → req.user
│   │   ├── validate.js              # Zod schema validation factory
│   │   ├── errorHandler.js          # Global error catch
│   │   └── notFound.js              # 404 catch-all
│   │
│   ├── routes/
│   │   ├── index.js                 # Master router
│   │   ├── auth.routes.js
│   │   ├── idea.routes.js
│   │   ├── roadmap.routes.js
│   │   └── export.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── idea.controller.js
│   │   ├── roadmap.controller.js
│   │   └── export.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js          # Signup, login, token logic
│   │   ├── idea.service.js          # CRUD + details
│   │   ├── roadmap.service.js       # Milestones + tasks
│   │   └── export.service.js        # Data aggregation for export
│   │
│   ├── utils/
│   │   ├── ApiError.js              # Custom error class
│   │   ├── catchAsync.js            # Async error wrapper
│   │   └── logger.js                # Winston logger setup
│   │
│   ├── app.js                       # Express setup + middleware chain
│   └── server.js                    # Entry: connect DB → listen
│
├── .env                             # PORT, JWT_SECRET, DATABASE_URL
├── .gitignore
└── package.json
```

### Three-Layer Architecture

```
Request → Route → Controller → Service → Prisma → SQLite
                      │              │
                      │              └── Business logic lives HERE
                      └── HTTP parsing only (req/res)
```

**Why three layers?**
- **Routes**: Define endpoints + attach validation
- **Controllers**: Parse HTTP request, call service, send response
- **Services**: Pure business logic, database calls, reusable across controllers

---

## 4. Database Schema Overview

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id visually  │
│ name         │
│ email (UQ)   │─────────────────────────────────────────┐
│ password     │                                         │
│ created_at   │                                         │
│ updated_at   │                                         │
└──────┬───────┘                                         │
       │                                                 │
       │ one user has many ideas                         │
       │                                                 │
       ▼                                                 │
┌──────────────────┐                                     │
│  startup_ideas   │                                     │
│──────────────────│                                     │
│ id               │──────────────────────┐              │
│ user_id (FK)     │                      │              │
│ title            │                      │              │
│ pitch            │                      │              │
│ status           │                      │              │
│ created_at       │                      │              │
│ updated_at       │                      │              │
└──────┬───────────┘                      │              │
       │                                  │              │
       │ one idea has one detail          │              │
       │                                  │              │
       ▼                                  │              │
┌──────────────────┐                      │              │
│ startup_details  │                      │              │
│──────────────────│                      │              │
│ id               │               one idea has          │
│ idea_id (FK,UQ)  │               many milestones       │
│ problem          │                      │              │
│ solution         │                      │              │
│ target_audience  │                      ▼              │
│ revenue_model    │            ┌──────────────────┐     │
│ unique_value     │            │   milestones     │     │
│ market_size      │            │──────────────────│     │
│ competitors      │            │ id               │──┐  │
│ team_needs       │            │ idea_id (FK)     │  │  │
│ budget           │            │ title            │  │  │
│ updated_at       │            │ description      │  │  │
└──────────────────┘            │ phase            │  │  │
                                │ sort_order       │  │  │
                                │ status           │  │  │
                                │ target_date      │  │  │
                                │ created_at       │  │  │
                                └──────────────────┘  │  │
                                                      │  │
                                   one milestone has  │  │
                                   many tasks         │  │
                                                      │  │
                                                      ▼  │
                                            ┌──────────────────┐
                                            │     tasks        │
                                            │──────────────────│
                                            │ id               │
                                            │ milestone_id(FK) │
                                            │ title            │
                                            │ status           │
                                            │ priority         │
                                            │ sort_order       │
                                            │ created_at       │
                                            │ updated_at       │
                                            └──────────────────┘


                                            ┌──────────────────┐
                                            │  export_history  │
                                            │──────────────────│
                                            │ id               │
                                            │ idea_id (FK) ────┘
                                            │ user_id (FK) ────── (back to users)
                                            │ format           │
                                            │ created_at       │
                                            └──────────────────┘
```

### Relationships Summary

| Relationship                  | Type     | Cascade Delete |
|-------------------------------|----------|----------------|
| `users` → `startup_ideas`    | 1 : N    | Yes            |
| `startup_ideas` → `startup_details` | 1 : 1 | Yes        |
| `startup_ideas` → `milestones` | 1 : N  | Yes            |
| `milestones` → `tasks`       | 1 : N    | Yes            |
| `startup_ideas` → `export_history` | 1 : N | Yes        |
| `users` → `export_history`   | 1 : N    | Yes            |

### Field Details

**users**
| Field       | Type         | Notes                            |
|-------------|--------------|----------------------------------|
| id          | TEXT (UUID)  | Primary key                      |
| name        | TEXT         | Required                         |
| email       | TEXT         | Unique, required                 |
| password    | TEXT         | bcrypt hash, never returned in API |
| created_at  | DATETIME     | Auto-set                         |
| updated_at  | DATETIME     | Auto-updated                     |

**startup_ideas**
| Field       | Type         | Notes                            |
|-------------|--------------|----------------------------------|
| id          | TEXT (UUID)  | Primary key                      |
| user_id     | TEXT         | FK → users.id                    |
| title       | TEXT         | Max 200 chars                    |
| pitch       | TEXT         | Elevator pitch, optional         |
| status      | TEXT         | "draft" / "active" / "archived"  |
| created_at  | DATETIME     | Auto-set                         |
| updated_at  | DATETIME     | Auto-updated                     |

**startup_details**
| Field            | Type         | Notes                       |
|------------------|--------------|-----------------------------|
| id               | TEXT (UUID)  | Primary key                 |
| idea_id          | TEXT         | FK → startup_ideas.id, UNIQUE |
| problem          | TEXT         | Nullable (progressive fill) |
| solution         | TEXT         | Nullable                    |
| target_audience  | TEXT         | Nullable                    |
| revenue_model    | TEXT         | Nullable                    |
| unique_value     | TEXT         | Nullable                    |
| market_size      | TEXT         | Nullable                    |
| competitors      | TEXT (JSON)  | JSON string array           |
| team_needs       | TEXT (JSON)  | JSON string array           |
| budget           | REAL         | Nullable, decimal           |
| updated_at       | DATETIME     | Auto-updated                |

**milestones**
| Field       | Type         | Notes                            |
|-------------|--------------|----------------------------------|
| id          | TEXT (UUID)  | Primary key                      |
| idea_id     | TEXT         | FK → startup_ideas.id            |
| title       | TEXT         | Required                         |
| description | TEXT         | Optional                         |
| phase       | TEXT         | "mvp" / "v1" / "v2" / "future"  |
| sort_order  | INTEGER      | For drag-and-drop ordering       |
| status      | TEXT         | "pending" / "in_progress" / "completed" |
| target_date | TEXT         | ISO date string, optional        |
| created_at  | DATETIME     | Auto-set                         |

**tasks**
| Field        | Type         | Notes                           |
|--------------|--------------|---------------------------------|
| id           | TEXT (UUID)  | Primary key                     |
| milestone_id | TEXT         | FK → milestones.id              |
| title        | TEXT         | Required                        |
| status       | TEXT         | "todo" / "in_progress" / "done" |
| priority     | TEXT         | "low" / "medium" / "high"       |
| sort_order   | INTEGER      | For ordering within milestone   |
| created_at   | DATETIME     | Auto-set                        |
| updated_at   | DATETIME     | Auto-updated                    |

**export_history**
| Field      | Type         | Notes                            |
|------------|--------------|----------------------------------|
| id         | TEXT (UUID)  | Primary key                      |
| idea_id    | TEXT         | FK → startup_ideas.id            |
| user_id    | TEXT         | FK → users.id                    |
| format     | TEXT         | "pdf"                            |
| created_at | DATETIME     | Auto-set                         |

---

## 5. Authentication Flow (JWT)

```
                         SIGNUP FLOW
                         ══════════

      Client                                    Server
        │                                         │
        │  POST /api/auth/signup                  │
        │  { name, email, password }              │
        │────────────────────────────────────────→│
        │                                         │
        │                          Validate with Zod
        │                          Check email not taken
        │                          Hash password (bcrypt)
        │                          Create user in DB
        │                          Generate JWT token
        │                                         │
        │  { user: {...}, token: "eyJhb..." }     │
        │←────────────────────────────────────────│
        │                                         │
        │  Store token in localStorage            │
        │  Redirect to /dashboard                 │


                          LOGIN FLOW
                          ══════════

      Client                                    Server
        │                                         │
        │  POST /api/auth/login                   │
        │  { email, password }                    │
        │────────────────────────────────────────→│
        │                                         │
        │                          Find user by email
        │                          Compare password hash
        │                          Generate JWT token
        │                                         │
        │  { user: {...}, token: "eyJhb..." }     │
        │←────────────────────────────────────────│
        │                                         │
        │  Store token in localStorage            │
        │  Redirect to /dashboard                 │


                     AUTHENTICATED REQUEST
                     ═════════════════════

      Client                                    Server
        │                                         │
        │  GET /api/ideas                         │
        │  Header: Authorization: Bearer <token>  │
        │────────────────────────────────────────→│
        │                                         │
        │                    auth middleware:
        │                      Extract token from header
        │                      jwt.verify(token, secret)
        │                      Attach req.user = { id, email }
        │                      Call next()
        │                                         │
        │  { status: "success", data: [...] }     │
        │←────────────────────────────────────────│


                     TOKEN STRUCTURE
                     ═══════════════

      Header:  { alg: "HS256", typ: "JWT" }
      Payload: { sub: "user-uuid", email: "a@b.com", iat: ..., exp: ... }
      Secret:  JWT_SECRET from .env (never exposed to client)
      Expiry:  7 days
```

### Auth Rules

| Rule                                 | Implementation                     |
|--------------------------------------|------------------------------------|
| Passwords never returned in API      | Prisma `select` excludes password  |
| Token sent on every request          | Axios interceptor adds header      |
| Expired token → 401                  | auth middleware catches TokenExpiredError |
| Wrong token → 401                    | auth middleware catches JsonWebTokenError |
| Protected routes in React            | ProtectedRoute component checks AuthContext |
| User can only access own data        | Every service checks `userId` ownership |

---

## 6. API Routes List

**Base URL**: `http://localhost:5000/api`

### Auth (public — no token needed)

| Method | Endpoint             | Description             | Request Body                     |
|--------|----------------------|-------------------------|----------------------------------|
| POST   | `/auth/signup`       | Create account          | `{ name, email, password }`      |
| POST   | `/auth/login`        | Login, get token        | `{ email, password }`            |
| GET    | `/auth/me`           | Get current user        | — (token in header)              |

### Ideas (protected — token required)

| Method | Endpoint                    | Description              | Request Body                     |
|--------|-----------------------------|--------------------------|----------------------------------|
| GET    | `/ideas`                    | List user's ideas        | — (query: `?status=active&page=1`) |
| POST   | `/ideas`                    | Create new idea          | `{ title, pitch? }`             |
| GET    | `/ideas/:id`                | Get idea with details    | —                                |
| PUT    | `/ideas/:id`                | Update idea              | `{ title?, pitch?, status? }`   |
| DELETE | `/ideas/:id`                | Delete idea + cascade    | —                                |

### Startup Details (protected)

| Method | Endpoint                    | Description              | Request Body                     |
|--------|-----------------------------|--------------------------|----------------------------------|
| GET    | `/ideas/:id/details`        | Get structured details   | —                                |
| PUT    | `/ideas/:id/details`        | Create or update details | `{ problem?, solution?, ... }`  |

### Roadmap (protected)

| Method | Endpoint                                          | Description         |
|--------|---------------------------------------------------|---------------------|
| GET    | `/ideas/:id/roadmap`                              | Get all milestones + tasks |
| POST   | `/ideas/:id/roadmap`                              | Create milestone    |
| PUT    | `/ideas/:id/roadmap/:milestoneId`                 | Update milestone    |
| DELETE | `/ideas/:id/roadmap/:milestoneId`                 | Delete milestone    |
| POST   | `/ideas/:id/roadmap/:milestoneId/tasks`           | Create task         |
| PUT    | `/ideas/:id/roadmap/:milestoneId/tasks/:taskId`   | Update task         |
| DELETE | `/ideas/:id/roadmap/:milestoneId/tasks/:taskId`   | Delete task         |

### Export (protected)

| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | `/ideas/:id/export`         | Get aggregated data for PDF  |
| POST   | `/ideas/:id/export`         | Log export to history        |
| GET    | `/ideas/:id/export/history` | List past exports            |

### Dashboard (protected)

| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | `/dashboard/stats`          | Aggregated counts for user   |

**Total: 20 endpoints**

---

## 7. State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   React State Plan                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │      AUTH STATE  (React Context + useReducer)     │  │
│  │                                                   │  │
│  │  Stored in: AuthContext.jsx                       │  │
│  │  Contains:                                        │  │
│  │    • user object (id, name, email)                │  │
│  │    • token string                                 │  │
│  │    • isAuthenticated boolean                      │  │
│  │                                                   │  │
│  │  Actions:                                         │  │
│  │    • LOGIN  → store user + token                  │  │
│  │    • LOGOUT → clear user + token + localStorage   │  │
│  │    • LOAD   → restore from localStorage on mount  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │      PAGE STATE  (useState inside pages)          │  │
│  │                                                   │  │
│  │  Each page fetches its own data on mount:         │  │
│  │    • Ideas.jsx → GET /ideas                       │  │
│  │    • IdeaDetail.jsx → GET /ideas/:id              │  │
│  │    • Roadmap.jsx → GET /ideas/:id/roadmap         │  │
│  │    • Dashboard.jsx → GET /dashboard/stats         │  │
│  │                                                   │  │
│  │  Stored in local useState:                        │  │
│  │    • data (the fetched result)                    │  │
│  │    • loading (boolean)                            │  │
│  │    • error (string or null)                       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │      FORM STATE  (React Hook Form)                │  │
│  │                                                   │  │
│  │  Used for:                                        │  │
│  │    • Login / Signup forms                         │  │
│  │    • Idea creation form                           │  │
│  │    • Startup details form (multi-field)           │  │
│  │    • Milestone / task creation                    │  │
│  │                                                   │  │
│  │  Why: uncontrolled inputs = fewer re-renders      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │      UI STATE  (local useState)                   │  │
│  │                                                   │  │
│  │  Component-level state:                           │  │
│  │    • sidebar open/closed                          │  │
│  │    • modal visibility                             │  │
│  │    • active tab                                   │  │
│  │    • dropdown open                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why NOT Redux / Zustand / TanStack Query?

| Tool          | Verdict      | Reason                                       |
|---------------|--------------|----------------------------------------------|
| Redux         | Overkill     | We have one global state (auth). Redux adds boilerplate for no gain. |
| Zustand       | Nice but unnecessary | Context + useReducer covers our needs without a dependency. |
| TanStack Query | Good but adds complexity | For a beginner-friendly stack, plain useEffect + axios keeps things transparent. Can add later. |

---

## 8. Local Development Setup

### Prerequisites

```
Node.js 18+    →  node -v
npm 9+         →  npm -v
Git            →  git --version
```

### First-Time Setup (step by step)

```
┌─────────────────────────────────────────────────┐
│               PROJECT ROOT                      │
│   startup-copilot/                              │
│   ├── client/        (React frontend)           │
│   └── server/        (Express backend)          │
└─────────────────────────────────────────────────┘

STEP 1 — Clone & install

    git clone <repo>
    cd startup-copilot

    cd server && npm install
    cd ../client && npm install

STEP 2 — Environment files

    server/.env:
    ┌────────────────────────────────────────────┐
    │ NODE_ENV=development                       │
    │ PORT=5000                                  │
    │ DATABASE_URL="file:./dev.db"               │
    │ JWT_SECRET="change-me-to-a-random-string"  │
    │ JWT_EXPIRES_IN="7d"                        │
    │ BCRYPT_SALT_ROUNDS=10                      │
    │ CORS_ORIGIN="http://localhost:5173"        │
    └────────────────────────────────────────────┘

    client/.env:
    ┌────────────────────────────────────────────┐
    │ VITE_API_URL=http://localhost:5000/api     │
    └────────────────────────────────────────────┘

STEP 3 — Initialize database

    cd server
    npx prisma migrate dev --name init
    npx prisma db seed               # Optional: sample data

STEP 4 — Run both servers

    Terminal 1:  cd server && npm run dev     → localhost:5000
    Terminal 2:  cd client && npm run dev     → localhost:5173

STEP 5 — Verify

    Open http://localhost:5173
    Sign up with any email/password
    Create your first startup idea
```

### NPM Scripts Reference

**server/package.json**
| Script           | Command                       | Purpose               |
|------------------|-------------------------------|-----------------------|
| `npm run dev`    | `nodemon src/server.js`       | Dev server with reload |
| `npm start`      | `node src/server.js`          | Production start      |
| `npm run db:migrate` | `prisma migrate dev`     | Run migrations        |
| `npm run db:seed` | `node prisma/seed.js`        | Insert sample data    |
| `npm run db:studio` | `prisma studio`            | Visual DB browser     |

**client/package.json**
| Script           | Command                       | Purpose               |
|------------------|-------------------------------|-----------------------|
| `npm run dev`    | `vite`                        | Dev server at :5173   |
| `npm run build`  | `vite build`                  | Production bundle     |
| `npm run preview` | `vite preview`               | Preview prod build    |

---

## 9. Deployment Suggestions (Simple)

### Option A: Free Tier (best for MVP launch)

```
┌──────────────────────────────────────────────┐
│              DEPLOYMENT PLAN A               │
│              (100% Free)                     │
├──────────────────────────────────────────────┤
│                                              │
│  Frontend:  Vercel (free)                    │
│    • Connect GitHub repo                     │
│    • Root directory: client/                 │
│    • Build command: npm run build            │
│    • Output: dist/                           │
│    • Auto-deploys on push                    │
│                                              │
│  Backend:   Render (free)                    │
│    • Connect GitHub repo                     │
│    • Root directory: server/                 │
│    • Build command: npm install              │
│    • Start command: npm start                │
│    • Free tier: spins down after 15min idle  │
│                                              │
│  Database:  SQLite on Render                 │
│    • Works for MVP (< 1000 users)            │
│    • File lives on Render disk               │
│    • Upgrade path → Render Postgres (free)   │
│                                              │
│  Cost: $0/month                              │
└──────────────────────────────────────────────┘
```

### Option B: Production-Ready (small budget)

```
┌──────────────────────────────────────────────┐
│              DEPLOYMENT PLAN B               │
│              (~$7-15/month)                   │
├──────────────────────────────────────────────┤
│                                              │
│  Frontend:  Vercel (free)                    │
│    • Same as Plan A                          │
│                                              │
│  Backend:   Railway ($5/month)               │
│    • Always-on (no cold starts)              │
│    • Built-in Postgres                       │
│    • Auto-deploys from GitHub                │
│                                              │
│  Database:  Railway Postgres ($7/month)      │
│    • Change schema.prisma:                   │
│      provider = "postgresql"                 │
│    • Change DATABASE_URL to Railway's URL    │
│    • Run prisma migrate deploy               │
│                                              │
│  Cost: ~$12/month                            │
└──────────────────────────────────────────────┘
```

### SQLite → Postgres Migration (when ready)

```
Only TWO changes needed:

1. prisma/schema.prisma:
   - provider = "sqlite"
   + provider = "postgresql"

2. .env:
   - DATABASE_URL="file:./dev.db"
   + DATABASE_URL="postgresql://user:pass@host:5432/dbname"

Then run:
   npx prisma migrate dev
```

---

## Summary: Complete Data Flow

```
User opens app
    │
    ▼
React (Vite) ── localhost:5173
    │
    │ axios + JWT header
    ▼
Express API ── localhost:5000/api
    │
    │ auth middleware → validate → controller → service
    ▼
Prisma ORM
    │
    ▼
SQLite ── server/prisma/dev.db
```

```
Signup → Login → Create Idea → Fill Details → Build Roadmap → Dashboard → Export PDF
  │        │          │             │               │             │           │
  ▼        ▼          ▼             ▼               ▼             ▼           ▼
 POST    POST      POST          PUT            POST           GET       GET + jsPDF
 /auth   /auth     /ideas     /ideas/:id      /ideas/:id     /dashboard  /ideas/:id
 /signup /login               /details        /roadmap       /stats      /export
```

---

*Architecture designed for beginners. Zero external dependencies beyond npm. Start coding with the next prompt.*
