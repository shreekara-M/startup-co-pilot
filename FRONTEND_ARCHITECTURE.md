# Startup Co-Pilot — Frontend Architecture

---

## 1. Folder Structure

```
client/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios instance + JWT interceptor
│   │   ├── auth.api.js           # signup(), login(), getMe()
│   │   ├── ideas.api.js          # CRUD + details endpoints
│   │   ├── roadmap.api.js        # milestones + tasks endpoints
│   │   ├── export.api.js         # export data + history
│   │   └── dashboard.api.js      # stats endpoint
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx        # Reusable button (primary/secondary/danger variants)
│   │   │   ├── Input.jsx         # Form input with label + error display
│   │   │   ├── Modal.jsx         # Overlay modal (confirm delete, create forms)
│   │   │   ├── Loader.jsx        # Spinner for loading states
│   │   │   ├── EmptyState.jsx    # "No items yet" placeholder with CTA
│   │   │   ├── StatusBadge.jsx   # Colored badge (draft/active/archived/todo/done)
│   │   │   └── ProtectedRoute.jsx # Redirects to /login if not authenticated
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.jsx        # Top bar: logo + user dropdown (logout)
│   │   │   ├── Sidebar.jsx       # Left nav: Dashboard, Ideas, links
│   │   │   ├── AppLayout.jsx     # Sidebar + Navbar + main content area
│   │   │   └── AuthLayout.jsx    # Centered card layout for login/signup
│   │   │
│   │   ├── ideas/
│   │   │   ├── IdeaCard.jsx      # Card in list: title, pitch, status badge, milestone count
│   │   │   ├── IdeaForm.jsx      # Create/edit modal form (title + pitch)
│   │   │   └── IdeaStatusFilter.jsx  # Dropdown/tabs to filter by draft/active/archived
│   │   │
│   │   ├── details/
│   │   │   └── DetailsForm.jsx   # Multi-field form: problem, solution, audience, etc.
│   │   │
│   │   ├── roadmap/
│   │   │   ├── MilestoneCard.jsx # Collapsible card: title, phase badge, task list
│   │   │   ├── MilestoneForm.jsx # Create/edit milestone modal
│   │   │   ├── TaskItem.jsx      # Single task row: checkbox, title, priority, delete
│   │   │   └── TaskForm.jsx      # Inline or modal task creation
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCards.jsx    # Grid of stat cards (total ideas, tasks, etc.)
│   │   │   ├── ProgressChart.jsx # Bar/pie chart of task completion
│   │   │   └── RecentIdeas.jsx   # Table/list of 5 most recently updated ideas
│   │   │
│   │   └── export/
│   │       ├── ExportPreview.jsx # Full startup plan preview (what the PDF will look like)
│   │       └── ExportHistory.jsx # Table of past exports with dates
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # React Context + useReducer for auth state
│   │
│   ├── hooks/
│   │   ├── useAuth.js            # Shortcut: useContext(AuthContext)
│   │   └── useApi.js             # Reusable hook: { data, loading, error, refetch }
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx       # Public homepage with hero + CTA
│   │   ├── LoginPage.jsx         # Email/password login form
│   │   ├── SignupPage.jsx        # Name/email/password signup form
│   │   ├── DashboardPage.jsx     # Stats overview + recent ideas
│   │   ├── IdeasPage.jsx         # List all ideas with filter + pagination
│   │   ├── IdeaDetailPage.jsx    # Single idea view + details form (tabbed)
│   │   ├── RoadmapPage.jsx       # Milestones + tasks for one idea
│   │   ├── ExportPage.jsx        # Preview + download PDF + history
│   │   └── NotFoundPage.jsx      # 404 page
│   │
│   ├── utils/
│   │   ├── formatDate.js         # Date → "Jan 15, 2026" or "2 days ago"
│   │   └── constants.js          # Status options, phase options, priority options
│   │
│   ├── App.jsx                   # Router setup + AuthProvider wrapper
│   ├── main.jsx                  # Vite entry: ReactDOM.createRoot
│   └── index.css                 # Tailwind directives (@tailwind base/components/utilities)
│
├── .env                          # VITE_API_URL=http://localhost:5000/api
├── index.html                    # Vite HTML template
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## 2. Pages List

| #  | Page               | Route                        | Auth Required | Purpose                                    |
|----|--------------------|------------------------------|---------------|--------------------------------------------|
| 1  | LandingPage        | `/`                          | No            | Public hero page, login/signup CTAs        |
| 2  | LoginPage          | `/login`                     | No            | Email + password form                      |
| 3  | SignupPage         | `/signup`                    | No            | Name + email + password form               |
| 4  | DashboardPage      | `/dashboard`                 | Yes           | Stats cards, progress chart, recent ideas  |
| 5  | IdeasPage          | `/ideas`                     | Yes           | List all ideas, filter, paginate, create   |
| 6  | IdeaDetailPage     | `/ideas/:id`                 | Yes           | View idea + edit details (tabbed layout)   |
| 7  | RoadmapPage        | `/ideas/:id/roadmap`         | Yes           | Milestones + tasks for one idea            |
| 8  | ExportPage         | `/ideas/:id/export`          | Yes           | Preview plan + download PDF + history      |
| 9  | NotFoundPage       | `*`                          | No            | 404 catch-all                              |

### Page Flow (user journey)

```
Landing ──→ Signup ──→ Dashboard
                          │
                          ├──→ Ideas List ──→ Idea Detail (tabs: Overview | Details Form)
                          │                       │
                          │                       ├──→ Roadmap (milestones + tasks)
                          │                       └──→ Export (preview + PDF download)
                          │
                          └──→ (Sidebar links to all sections)
```

---

## 3. Components List

### Common (reusable across all pages)

| Component        | Props                                         | Purpose                                |
|------------------|-----------------------------------------------|----------------------------------------|
| Button           | `variant, size, loading, disabled, onClick`   | Primary/secondary/danger button        |
| Input            | `label, name, type, error, register`          | Form field with label + error message  |
| Modal            | `isOpen, onClose, title, children`            | Overlay dialog for forms and confirms  |
| Loader           | `size`                                        | Centered spinner                       |
| EmptyState       | `icon, title, description, actionLabel, onAction` | Placeholder when list is empty     |
| StatusBadge      | `status`                                      | Colored pill (draft=gray, active=green)|
| ProtectedRoute   | `children`                                    | Redirects to /login if no token        |

### Layout (structural wrappers)

| Component        | Children / Slots                              | Purpose                                |
|------------------|-----------------------------------------------|----------------------------------------|
| Navbar           | —                                             | Logo + user name + logout button       |
| Sidebar          | —                                             | Nav links: Dashboard, Ideas            |
| AppLayout        | `<Outlet />`                                  | Sidebar + Navbar + scrollable content  |
| AuthLayout       | `children`                                    | Centered card (login/signup pages)     |

### Feature Components

| Component          | Used In          | Purpose                                       |
|--------------------|------------------|-----------------------------------------------|
| IdeaCard           | IdeasPage        | Single idea in the grid/list                  |
| IdeaForm           | IdeasPage        | Modal form to create or edit idea title/pitch |
| IdeaStatusFilter   | IdeasPage        | Filter buttons: All / Draft / Active / Archived|
| DetailsForm        | IdeaDetailPage   | 9-field form for startup details (upsert)     |
| MilestoneCard      | RoadmapPage      | Expandable card with task list inside         |
| MilestoneForm      | RoadmapPage      | Modal to create/edit milestone                |
| TaskItem           | MilestoneCard    | Single task row with status toggle            |
| TaskForm           | MilestoneCard    | Inline form to add task to milestone          |
| StatsCards         | DashboardPage    | Grid of 4 stat cards (ideas, milestones, etc.)|
| ProgressChart      | DashboardPage    | Task completion chart (Recharts)              |
| RecentIdeas        | DashboardPage    | Table of 5 most recent ideas                 |
| ExportPreview      | ExportPage       | Full plan rendered as a printable document    |
| ExportHistory      | ExportPage       | Table of past exports                         |

---

## 4. Routing Strategy

**Library**: React Router v6 (createBrowserRouter)

```
<BrowserRouter>
  <Routes>
    ┌─ PUBLIC ROUTES (no auth needed) ─────────────────────────┐
    │                                                           │
    │  /              → LandingPage                            │
    │  /login         → AuthLayout > LoginPage                 │
    │  /signup        → AuthLayout > SignupPage                │
    │                                                           │
    └───────────────────────────────────────────────────────────┘

    ┌─ PROTECTED ROUTES (wrapped in ProtectedRoute) ───────────┐
    │                                                           │
    │  AppLayout (Sidebar + Navbar + Outlet)                   │
    │    │                                                      │
    │    ├── /dashboard              → DashboardPage           │
    │    ├── /ideas                  → IdeasPage               │
    │    ├── /ideas/:id              → IdeaDetailPage          │
    │    ├── /ideas/:id/roadmap      → RoadmapPage             │
    │    └── /ideas/:id/export       → ExportPage              │
    │                                                           │
    └───────────────────────────────────────────────────────────┘

    *  → NotFoundPage
  </Routes>
</BrowserRouter>
```

### Route Guards

```
ProtectedRoute logic:
  1. Check AuthContext for token
  2. If no token → redirect to /login (save intended URL)
  3. If token exists → render children
  4. On login success → redirect to saved URL or /dashboard
```

### Navigation Behavior

| From               | Action                    | Navigates To              |
|--------------------|---------------------------|---------------------------|
| Landing            | Click "Get Started"       | `/signup`                 |
| Login/Signup       | Successful auth           | `/dashboard`              |
| Sidebar            | Click "Dashboard"         | `/dashboard`              |
| Sidebar            | Click "My Ideas"          | `/ideas`                  |
| Ideas list         | Click idea card           | `/ideas/:id`              |
| Idea detail        | Click "Roadmap" tab/link  | `/ideas/:id/roadmap`      |
| Idea detail        | Click "Export" tab/link   | `/ideas/:id/export`       |
| Navbar             | Click "Logout"            | `/login` (clear token)    |

---

## 5. State Management

### Layer 1: Auth State (Global — React Context)

```
AuthContext
├── State:
│   ├── user        → { id, name, email } | null
│   ├── token       → string | null
│   └── loading     → boolean (initial load from localStorage)
│
├── Actions (via useReducer):
│   ├── LOGIN       → set user + token + localStorage
│   ├── LOGOUT      → clear user + token + localStorage
│   └── SET_LOADING → toggle loading flag
│
└── On App Mount:
    1. Read token from localStorage
    2. If token exists → call GET /auth/me to validate
    3. If valid → dispatch LOGIN with user data
    4. If invalid/expired → dispatch LOGOUT (clear stale token)
```

### Layer 2: Page State (Local — useState per page)

```
Each page manages its own data:

  IdeasPage:
    const [ideas, setIdeas] = useState([])
    const [pagination, setPagination] = useState({})
    const [filter, setFilter] = useState(null)       // draft/active/archived
    const [loading, setLoading] = useState(true)

  IdeaDetailPage:
    const [idea, setIdea] = useState(null)
    const [loading, setLoading] = useState(true)

  RoadmapPage:
    const [milestones, setMilestones] = useState([])  // each with nested tasks
    const [loading, setLoading] = useState(true)

  DashboardPage:
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
```

### Layer 3: Form State (React Hook Form)

```
Used in:
  ├── LoginPage        → { email, password }
  ├── SignupPage       → { name, email, password }
  ├── IdeaForm         → { title, pitch }
  ├── DetailsForm      → { problem, solution, targetAudience, ... } (9 fields)
  ├── MilestoneForm    → { title, description, phase, targetDate }
  └── TaskForm         → { title, priority }

Why React Hook Form:
  - Uncontrolled inputs → fewer re-renders
  - Built-in validation with error messages
  - Easy integration with our Input component via register()
```

### Layer 4: UI State (Local — useState per component)

```
Component-level, never shared:
  ├── Sidebar          → isCollapsed
  ├── Modal            → isOpen
  ├── MilestoneCard    → isExpanded (show/hide tasks)
  ├── IdeaStatusFilter → activeFilter
  └── Dropdown         → isOpen
```

---

## 6. API Integration Approach

### Axios Instance (api/axios.js)

```
Purpose:
  1. Set baseURL from VITE_API_URL env var
  2. Request interceptor → attach "Authorization: Bearer <token>" header
  3. Response interceptor → on 401, clear token + redirect to /login

Flow:
  Every API call goes through this instance
  Token is read from localStorage on each request
  No manual header management in components
```

### API Module Pattern (one file per resource)

```
api/auth.api.js
  ├── signup(name, email, password)    → POST /auth/signup
  ├── login(email, password)           → POST /auth/login
  └── getMe()                          → GET  /auth/me

api/ideas.api.js
  ├── listIdeas(params)                → GET    /ideas?status=&page=&limit=
  ├── createIdea(data)                 → POST   /ideas
  ├── getIdea(id)                      → GET    /ideas/:id
  ├── updateIdea(id, data)             → PUT    /ideas/:id
  ├── deleteIdea(id)                   → DELETE /ideas/:id
  ├── getDetails(id)                   → GET    /ideas/:id/details
  └── upsertDetails(id, data)          → PUT    /ideas/:id/details

api/roadmap.api.js
  ├── getMilestones(ideaId)            → GET    /ideas/:id/roadmap
  ├── createMilestone(ideaId, data)    → POST   /ideas/:id/roadmap
  ├── updateMilestone(ideaId, msId, d) → PUT    /ideas/:id/roadmap/:msId
  ├── deleteMilestone(ideaId, msId)    → DELETE /ideas/:id/roadmap/:msId
  ├── createTask(ideaId, msId, data)   → POST   /ideas/:id/roadmap/:msId/tasks
  ├── updateTask(ideaId, msId, tId, d) → PUT    /ideas/:id/roadmap/:msId/tasks/:tId
  └── deleteTask(ideaId, msId, tId)    → DELETE /ideas/:id/roadmap/:msId/tasks/:tId

api/export.api.js
  ├── getExportData(ideaId)            → GET    /ideas/:id/export
  ├── logExport(ideaId, format)        → POST   /ideas/:id/export
  └── getExportHistory(ideaId)         → GET    /ideas/:id/export/history

api/dashboard.api.js
  └── getStats()                       → GET    /dashboard/stats
```

### Data Fetching Pattern (used in every page)

```
Pattern used in every page:

  1. Component mounts → useEffect triggers
  2. Set loading = true
  3. Call API function (e.g., listIdeas())
  4. On success → set data, loading = false
  5. On error → set error message, loading = false, show toast
  6. On create/update/delete → re-fetch the list (simple refetch pattern)

Optimistic updates NOT used (keeps things simple for beginners).
Every mutation → API call → refetch → re-render with fresh data.
```

### useApi Hook (hooks/useApi.js)

```
Reusable hook that wraps the fetch pattern:

  const { data, loading, error, refetch } = useApi(apiFunction, params)

Usage:
  const { data: ideas, loading, refetch } = useApi(listIdeas, { page: 1 })

What it does:
  1. Calls apiFunction(params) on mount
  2. Re-calls when params change
  3. Returns { data, loading, error, refetch }
  4. refetch() can be called after create/update/delete
```

### Error Handling Strategy

```
┌─────────────────────────────────────────────────┐
│              ERROR HANDLING FLOW                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  API Error (4xx/5xx)                            │
│    │                                             │
│    ├── 401 Unauthorized                         │
│    │   → Axios interceptor catches              │
│    │   → Clear token from localStorage          │
│    │   → Redirect to /login                     │
│    │   → Toast: "Session expired"               │
│    │                                             │
│    ├── 400 Validation Error                     │
│    │   → Show field-level errors under inputs   │
│    │   → errors array from API response         │
│    │                                             │
│    ├── 404 Not Found                            │
│    │   → Toast: "Resource not found"            │
│    │   → Redirect to /ideas (if idea deleted)   │
│    │                                             │
│    ├── 409 Conflict                             │
│    │   → Toast: "Email already registered"      │
│    │                                             │
│    └── 500 Server Error                         │
│        → Toast: "Something went wrong"          │
│                                                  │
│  Network Error (no response)                    │
│    → Toast: "Cannot connect to server"          │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Toast Notifications (React Hot Toast)

```
Used for:
  ├── Success → "Idea created successfully"
  ├── Success → "Details saved"
  ├── Error   → "Failed to delete milestone"
  ├── Error   → "Session expired, please login again"
  └── Info    → "PDF downloaded"

Position: top-right
Duration: 3 seconds (errors: 5 seconds)
```

---

## 7. Page-by-Page Breakdown

### LandingPage (/)

```
┌──────────────────────────────────────────────┐
│  Navbar: Logo          [Login] [Get Started] │
├──────────────────────────────────────────────┤
│                                              │
│         Startup Co-Pilot                     │
│    Plan, track, and launch your              │
│         startup idea.                        │
│                                              │
│         [ Get Started Free ]                 │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Plan     │ │ Track    │ │ Export   │     │
│  │ your     │ │ progress │ │ as PDF  │      │
│  │ idea     │ │ visually │ │         │      │
│  └──────────┘ └──────────┘ └──────────┘    │
└──────────────────────────────────────────────┘
```

### DashboardPage (/dashboard)

```
┌────────┬─────────────────────────────────────┐
│        │  Dashboard                          │
│  Side  │                                     │
│  bar   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐│
│        │  │Ideas │ │Miles │ │Tasks │ │Done ││
│  Dash  │  │  5   │ │  12  │ │  34  │ │ 9  ││
│  Ideas │  └──────┘ └──────┘ └──────┘ └────┘│
│        │                                     │
│        │  ┌─────────────┐ ┌────────────────┐│
│        │  │ Progress    │ │ Recent Ideas   ││
│        │  │ Chart       │ │ 1. PetTrack    ││
│        │  │ [bar chart] │ │ 2. EduFlow     ││
│        │  │             │ │ 3. FoodDash    ││
│        │  └─────────────┘ └────────────────┘│
└────────┴─────────────────────────────────────┘
```

### IdeasPage (/ideas)

```
┌────────┬─────────────────────────────────────┐
│        │  My Ideas           [+ New Idea]    │
│  Side  │                                     │
│  bar   │  [All] [Draft] [Active] [Archived]  │
│        │                                     │
│        │  ┌─────────────────────────────────┐│
│        │  │ PetTrack          ● Active      ││
│        │  │ Smart pet health tracking app   ││
│        │  │ 3 milestones    Jan 15, 2026    ││
│        │  └─────────────────────────────────┘│
│        │  ┌─────────────────────────────────┐│
│        │  │ EduFlow           ○ Draft       ││
│        │  │ Online learning platform        ││
│        │  │ 0 milestones    Jan 20, 2026    ││
│        │  └─────────────────────────────────┘│
│        │                                     │
│        │  Page 1 of 3   [<] [1] [2] [3] [>] │
└────────┴─────────────────────────────────────┘
```

### IdeaDetailPage (/ideas/:id)

```
┌────────┬─────────────────────────────────────┐
│        │  ← Back    PetTrack   [Edit] [Del] │
│  Side  │  ● Active                           │
│  bar   │                                     │
│        │  ┌──────────────────────────────────┐│
│        │  │ Pitch:                           ││
│        │  │ Smart pet health tracking app    ││
│        │  └──────────────────────────────────┘│
│        │                                     │
│        │  [Overview] [Details] [Roadmap] [Export]│
│        │                                     │
│        │  ┌── Details Form ─────────────────┐│
│        │  │ Problem:     [______________]   ││
│        │  │ Solution:    [______________]   ││
│        │  │ Audience:    [______________]   ││
│        │  │ Unique Value:[______________]   ││
│        │  │ Revenue:     [______________]   ││
│        │  │ Market Size: [______________]   ││
│        │  │ Competitors: [+ Add]            ││
│        │  │ Team Needs:  [+ Add]            ││
│        │  │ Budget: $    [______________]   ││
│        │  │                                  ││
│        │  │              [Save Details]      ││
│        │  └──────────────────────────────────┘│
└────────┴─────────────────────────────────────┘
```

---

## 8. Dependencies (package.json)

```
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",     // SPA routing
    "axios": "^1.x",                 // HTTP client
    "react-hook-form": "^7.x",       // Form state management
    "react-hot-toast": "^2.x",       // Toast notifications
    "recharts": "^2.x",              // Dashboard charts
    "jspdf": "^2.x",                 // PDF generation
    "html2canvas": "^1.x",           // DOM to image (for PDF)
    "lucide-react": "^0.x"           // Icon library
  },
  "devDependencies": {
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

**Total: 10 runtime dependencies, 5 dev dependencies**

---

## Summary

```
9 Pages  ·  20 Components  ·  6 API modules  ·  20 endpoints covered
React Router v6  ·  Context + useReducer (auth only)  ·  useState (page data)
React Hook Form (forms)  ·  Axios + interceptors (API)  ·  Tailwind (styling)
```

*No code generated — this is the blueprint. Next step: scaffold the files.*
