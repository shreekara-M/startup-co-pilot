# Startup Co-Pilot — Complete Database Schema

**Database**: SQLite (via Prisma ORM)
**File location**: `server/prisma/dev.db`
**Tables**: 6
**Relationships**: 6

---

## 1. Tables & Fields

---

### Table 1: `users`

The root of everything. Every row in the system traces back to a user.

```
┌─────────────────────────────────────────────────────────────────┐
│                            users                                │
├──────────────┬──────────────┬───────────────────────────────────┤
│ Column       │ Type         │ Rules                             │
├──────────────┼──────────────┼───────────────────────────────────┤
│ id           │ TEXT (UUID)  │ Primary Key, auto-generated       │
│ name         │ TEXT         │ Required, 1–100 characters        │
│ email        │ TEXT         │ Required, UNIQUE, lowercase       │
│ password     │ TEXT         │ Required, bcrypt hash             │
│ created_at   │ DATETIME     │ Auto-set on create                │
│ updated_at   │ DATETIME     │ Auto-updated on every change      │
└──────────────┴──────────────┴───────────────────────────────────┘
```

**Design Decisions:**

- **UUID instead of auto-increment integer**: Auto-increment IDs expose how many users you have (`/api/users/47` tells everyone you only have 47 users). UUIDs are random and reveal nothing.
- **`password` is a hash, never plain text**: We store `$2b$10$Xq...` (bcrypt output), never the actual password. Even if the database leaks, passwords are unreadable.
- **`password` is never returned in API responses**: Every Prisma query uses `select` to exclude this field. The frontend never sees it.
- **`email` is UNIQUE**: No two accounts can share an email. The database enforces this — not just our code.

---

### Table 2: `startup_ideas`

The core business entity. Users create ideas, and everything else hangs off an idea.

```
┌─────────────────────────────────────────────────────────────────┐
│                        startup_ideas                            │
├──────────────┬──────────────┬───────────────────────────────────┤
│ Column       │ Type         │ Rules                             │
├──────────────┼──────────────┼───────────────────────────────────┤
│ id           │ TEXT (UUID)  │ Primary Key                       │
│ user_id      │ TEXT         │ Foreign Key → users.id, Required  │
│ title        │ TEXT         │ Required, 1–200 characters        │
│ pitch        │ TEXT         │ Optional, elevator pitch          │
│ status       │ TEXT         │ "draft" | "active" | "archived"   │
│ created_at   │ DATETIME     │ Auto-set on create                │
│ updated_at   │ DATETIME     │ Auto-updated on every change      │
└──────────────┴──────────────┴───────────────────────────────────┘
```

**Design Decisions:**

- **`status` uses text values, not numbers**: `"draft"` is readable in the database. `0` means nothing without a lookup table. Beginners can understand the data by just looking at it.
- **`status` has three states with clear meaning**:
  - `draft` → user is still brainstorming
  - `active` → user is actively working on this idea
  - `archived` → idea is shelved but not deleted (user might revisit)
- **Why not soft-delete (`deleted_at`)?**: "Archive" is a user-facing feature, not a technical trick. The user knows their idea is archived. Soft-delete is hidden from the user and creates query complexity.
- **`pitch` is optional**: Users should be able to create an idea with just a title and fill details later. Low friction = more ideas created.

---

### Table 3: `startup_details`

Structured business planning data. One-to-one with `startup_ideas`.

```
┌─────────────────────────────────────────────────────────────────┐
│                       startup_details                           │
├─────────────────┬──────────────┬────────────────────────────────┤
│ Column          │ Type         │ Rules                          │
├─────────────────┼──────────────┼────────────────────────────────┤
│ id              │ TEXT (UUID)  │ Primary Key                    │
│ idea_id         │ TEXT         │ FK → startup_ideas.id, UNIQUE  │
│ problem         │ TEXT         │ Nullable                       │
│ solution        │ TEXT         │ Nullable                       │
│ target_audience │ TEXT         │ Nullable                       │
│ unique_value    │ TEXT         │ Nullable                       │
│ revenue_model   │ TEXT         │ Nullable                       │
│ market_size     │ TEXT         │ Nullable                       │
│ competitors     │ TEXT         │ JSON string, default "[]"      │
│ team_needs      │ TEXT         │ JSON string, default "[]"      │
│ budget          │ REAL         │ Nullable, decimal number       │
│ updated_at      │ DATETIME     │ Auto-updated                   │
└─────────────────┴──────────────┴────────────────────────────────┘
```

**Design Decisions:**

- **Every field is nullable**: Users fill this form step by step. If we forced all fields to be filled, users would abandon the form. Nullable fields let them save progress at any point.
- **`idea_id` is UNIQUE**: This is what makes it one-to-one. One idea can only have one details row. The database enforces this, not just our code.
- **`competitors` and `team_needs` are JSON stored as TEXT**: SQLite has no native JSON column type. We store `[{"name":"Notion","threat":"high"}]` as a text string. Prisma handles parsing. This avoids creating two extra tables for data that is always loaded and saved together.
- **Why a separate table instead of adding columns to `startup_ideas`?** Three reasons:
  1. **Light list queries**: The ideas list page loads just `startup_ideas` (6 small columns). If details were merged in, every list query would drag 10 extra TEXT columns for nothing.
  2. **Different save frequency**: Details auto-save on blur (frequent). Ideas save on explicit button click (rare). Separate tables means frequent writes to `startup_details` don't touch `startup_ideas`.
  3. **Growth**: This table will gain new fields over time ("legal structure", "IP strategy"). Keeping it separate means `startup_ideas` stays stable.

---

### Table 4: `milestones`

Roadmap phase markers. A user builds their MVP roadmap as an ordered list of milestones.

```
┌─────────────────────────────────────────────────────────────────┐
│                          milestones                             │
├──────────────┬──────────────┬───────────────────────────────────┤
│ Column       │ Type         │ Rules                             │
├──────────────┼──────────────┼───────────────────────────────────┤
│ id           │ TEXT (UUID)  │ Primary Key                       │
│ idea_id      │ TEXT         │ FK → startup_ideas.id, Required   │
│ title        │ TEXT         │ Required, 1–200 characters        │
│ description  │ TEXT         │ Optional                          │
│ phase        │ TEXT         │ "mvp" | "v1" | "v2" | "future"   │
│ sort_order   │ INTEGER      │ Required, default 0               │
│ status       │ TEXT         │ "pending"|"in_progress"|"completed"|
│ target_date  │ TEXT         │ Optional, ISO date string         │
│ created_at   │ DATETIME     │ Auto-set on create                │
│ updated_at   │ DATETIME     │ Auto-updated                      │
└──────────────┴──────────────┴───────────────────────────────────┘
```

**Design Decisions:**

- **`sort_order` instead of ordering by `created_at`**: Users drag-and-drop milestones to reorder them. You can't change `created_at` without lying. `sort_order` is just an integer — swap two values and you're done.
- **`phase` groups milestones visually**: The roadmap UI shows milestones grouped under "MVP", "V1", etc. This field enables that grouping without a separate table.
- **`target_date` is TEXT, not DATE**: SQLite stores dates as text anyway. We use ISO format (`"2025-06-15"`) for consistency. The frontend handles display formatting.

---

### Table 5: `tasks`

Individual work items within a milestone. The most granular unit.

```
┌─────────────────────────────────────────────────────────────────┐
│                            tasks                                │
├──────────────┬──────────────┬───────────────────────────────────┤
│ Column       │ Type         │ Rules                             │
├──────────────┼──────────────┼───────────────────────────────────┤
│ id           │ TEXT (UUID)  │ Primary Key                       │
│ milestone_id │ TEXT         │ FK → milestones.id, Required      │
│ title        │ TEXT         │ Required, 1–300 characters        │
│ status       │ TEXT         │ "todo" | "in_progress" | "done"   │
│ priority     │ TEXT         │ "low" | "medium" | "high"         │
│ sort_order   │ INTEGER      │ Required, default 0               │
│ created_at   │ DATETIME     │ Auto-set on create                │
│ updated_at   │ DATETIME     │ Auto-updated                      │
└──────────────┴──────────────┴───────────────────────────────────┘
```

**Design Decisions:**

- **Tasks belong to milestones, not directly to ideas**: This two-level nesting (idea → milestone → task) gives the roadmap structure. Without milestones, tasks would be a flat list with no phases.
- **`priority` is a simple 3-level text field**: "low", "medium", "high" covers 99% of needs. No need for numeric priority with sorting algorithms.
- **`sort_order` works the same as milestones**: Enables drag-and-drop reordering within a milestone.

---

### Table 6: `export_history`

Audit log for when users export their startup plan. Enables "show me my past exports".

```
┌─────────────────────────────────────────────────────────────────┐
│                       export_history                            │
├──────────────┬──────────────┬───────────────────────────────────┤
│ Column       │ Type         │ Rules                             │
├──────────────┼──────────────┼───────────────────────────────────┤
│ id           │ TEXT (UUID)  │ Primary Key                       │
│ idea_id      │ TEXT         │ FK → startup_ideas.id, Required   │
│ user_id      │ TEXT         │ FK → users.id, Required           │
│ format       │ TEXT         │ "pdf" (extensible later)          │
│ created_at   │ DATETIME     │ Auto-set on create                │
└──────────────┴──────────────┴───────────────────────────────────┘
```

**Design Decisions:**

- **Why both `idea_id` AND `user_id`?** You could reach the user through `idea_id → startup_ideas → user_id`. But storing `user_id` directly means:
  - "Show all my exports" query needs zero JOINs
  - Authorization check ("is this my export?") is one column comparison
  - This is intentional denormalization — 16 bytes of storage per row saves a JOIN on every query.
- **No `file_url` column**: We generate PDFs client-side with jsPDF. Nothing is stored on a server. This table is just an audit trail: "User X exported Idea Y on this date."
- **`format` is always "pdf" for now**: But the column exists so we can add "docx" or "pptx" later without changing the schema.

---

## 2. Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   users                                                     │
│     │                                                       │
│     │ ── 1:N ──→ startup_ideas                              │
│     │                │                                      │
│     │                ├── 1:1 ──→ startup_details             │
│     │                │                                      │
│     │                ├── 1:N ──→ milestones                  │
│     │                │              │                       │
│     │                │              └── 1:N ──→ tasks        │
│     │                │                                      │
│     │                └── 1:N ──→ export_history              │
│     │                                    ▲                  │
│     │ ── 1:N ────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How to Read This

| Notation | Meaning | Example |
|----------|---------|---------|
| `1:N`    | "One has many" | One user has many startup ideas |
| `1:1`    | "One has exactly one" | One idea has one details record |
| `→`      | "Parent owns child" | Deleting parent deletes children |

### Cascade Delete Chains

What happens when things get deleted:

```
DELETE a user:
  └── deletes all their startup_ideas
        ├── deletes startup_details (1:1)
        ├── deletes milestones
        │     └── deletes tasks
        └── deletes export_history

DELETE a startup idea:
  ├── deletes startup_details
  ├── deletes milestones
  │     └── deletes tasks
  └── deletes export_history

DELETE a milestone:
  └── deletes tasks (only within that milestone)
```

**Why cascade?** When a user deletes their startup idea, they expect everything related to disappear. They shouldn't have orphaned milestones floating around in the database.

---

## 3. Example Data

### User: Sarah, a first-time founder

```
─── users ────────────────────────────────────────────────────────

  id:          "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  name:        "Sarah Chen"
  email:       "sarah@example.com"
  password:    "$2b$10$Xq8MpJ3..."   ← bcrypt hash of "MyP@ssw0rd"
  created_at:  "2025-01-15T09:00:00Z"
  updated_at:  "2025-01-15T09:00:00Z"
```

### Sarah's Startup Idea

```
─── startup_ideas ────────────────────────────────────────────────

  id:          "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  user_id:     "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  ← Sarah
  title:       "PetTrack"
  pitch:       "A mobile app that helps pet owners track vet visits,
                medications, and daily health of their pets."
  status:      "active"
  created_at:  "2025-01-15T09:30:00Z"
  updated_at:  "2025-01-16T14:00:00Z"
```

### Structured Details for PetTrack

```
─── startup_details ──────────────────────────────────────────────

  id:               "c3d4e5f6-a7b8-9012-cdef-123456789012"
  idea_id:          "b2c3d4e5-f6a7-8901-bcde-f12345678901"  ← PetTrack
  problem:          "Pet owners forget vet appointments, lose track of
                     medication schedules, and miss early health signs."
  solution:         "An app with smart reminders for vet visits, a
                     medication log with notifications, and a daily
                     health check-in to spot issues early."
  target_audience:  "Millennial and Gen-Z pet owners (ages 25-40)
                     who treat pets like family members."
  unique_value:     "Unlike generic reminder apps, PetTrack is built
                     specifically for pet health with vet-approved
                     health checklists."
  revenue_model:    "Freemium — free for 1 pet, $4.99/month for
                     unlimited pets + premium health insights."
  market_size:      "$5.8B pet tech market, 67% of US households own pets"
  competitors:      "[{\"name\":\"PetDesk\",\"threat\":\"medium\"},{\"name\":\"Pawtrack\",\"threat\":\"low\"}]"
  team_needs:       "[{\"role\":\"Mobile Developer\",\"count\":1},{\"role\":\"Vet Advisor\",\"count\":1}]"
  budget:           25000.00
  updated_at:       "2025-01-16T14:00:00Z"
```

### PetTrack's MVP Roadmap

```
─── milestones ───────────────────────────────────────────────────

  ┌─── MVP PHASE ─────────────────────────────────────────────┐
  │                                                           │
  │  id:          "d4e5f6a7-b8c9-0123-defa-234567890123"     │
  │  idea_id:     "b2c3d4e5..."  ← PetTrack                  │
  │  title:       "Core Pet Profile"                          │
  │  description: "Users can create and manage pet profiles   │
  │                with basic health info."                    │
  │  phase:       "mvp"                                       │
  │  sort_order:  1                                           │
  │  status:      "in_progress"                               │
  │  target_date: "2025-02-28"                                │
  │  created_at:  "2025-01-16T10:00:00Z"                     │
  │                                                           │
  └───────────────────────────────────────────────────────────┘

  ┌─── MVP PHASE ─────────────────────────────────────────────┐
  │                                                           │
  │  id:          "e5f6a7b8-c9d0-1234-efab-345678901234"     │
  │  idea_id:     "b2c3d4e5..."  ← PetTrack                  │
  │  title:       "Vet Visit Reminders"                       │
  │  description: "Calendar integration with push reminders   │
  │                for upcoming vet appointments."             │
  │  phase:       "mvp"                                       │
  │  sort_order:  2                                           │
  │  status:      "pending"                                   │
  │  target_date: "2025-03-15"                                │
  │  created_at:  "2025-01-16T10:05:00Z"                     │
  │                                                           │
  └───────────────────────────────────────────────────────────┘

  ┌─── V1 PHASE ──────────────────────────────────────────────┐
  │                                                           │
  │  id:          "f6a7b8c9-d0e1-2345-fabc-456789012345"     │
  │  idea_id:     "b2c3d4e5..."  ← PetTrack                  │
  │  title:       "Medication Tracker"                        │
  │  description: "Log medications with dosage, frequency,    │
  │                and notification reminders."                │
  │  phase:       "v1"                                        │
  │  sort_order:  3                                           │
  │  status:      "pending"                                   │
  │  target_date: "2025-04-30"                                │
  │  created_at:  "2025-01-16T10:10:00Z"                     │
  │                                                           │
  └───────────────────────────────────────────────────────────┘
```

### Tasks Inside "Core Pet Profile" Milestone

```
─── tasks ────────────────────────────────────────────────────────

  milestone_id: "d4e5f6a7..."  ← Core Pet Profile

  ┌────┬──────────────────────────────────┬─────────────┬──────────┐
  │ #  │ title                            │ status      │ priority │
  ├────┼──────────────────────────────────┼─────────────┼──────────┤
  │ 1  │ Design pet profile UI mockup     │ done        │ high     │
  │ 2  │ Create pet database model        │ done        │ high     │
  │ 3  │ Build add/edit pet form          │ in_progress │ high     │
  │ 4  │ Add pet photo upload             │ todo        │ medium   │
  │ 5  │ Build pet profile view page      │ todo        │ medium   │
  │ 6  │ Write unit tests for pet CRUD    │ todo        │ low      │
  └────┴──────────────────────────────────┴─────────────┴──────────┘
```

### Export History

```
─── export_history ───────────────────────────────────────────────

  id:          "a7b8c9d0-e1f2-3456-abcd-567890123456"
  idea_id:     "b2c3d4e5..."  ← PetTrack
  user_id:     "a1b2c3d4..."  ← Sarah
  format:      "pdf"
  created_at:  "2025-01-17T16:30:00Z"
```

---

## 4. How Relationships Work in Practice

### Example: "Load Sarah's Dashboard"

The dashboard shows aggregated stats. Here's what the backend queries:

```
Step 1 — Count ideas by status:

  SELECT status, COUNT(*) FROM startup_ideas
  WHERE user_id = "a1b2c3d4..."
  GROUP BY status

  Result:  { draft: 1, active: 1, archived: 0 }


Step 2 — Count tasks by status across all ideas:

  SELECT t.status, COUNT(*) FROM tasks t
  JOIN milestones m ON t.milestone_id = m.id
  JOIN startup_ideas i ON m.idea_id = i.id
  WHERE i.user_id = "a1b2c3d4..."
  GROUP BY t.status

  Result:  { todo: 3, in_progress: 1, done: 2 }


Step 3 — Recent activity:

  SELECT * FROM startup_ideas
  WHERE user_id = "a1b2c3d4..."
  ORDER BY updated_at DESC
  LIMIT 5
```

### Example: "Delete PetTrack Idea"

Cascade in action:

```
DELETE FROM startup_ideas WHERE id = "b2c3d4e5..."

  This automatically triggers:
    → DELETE startup_details  WHERE idea_id = "b2c3d4e5..."    (1 row)
    → DELETE milestones       WHERE idea_id = "b2c3d4e5..."    (3 rows)
      → DELETE tasks          WHERE milestone_id IN (...)       (6 rows)
    → DELETE export_history   WHERE idea_id = "b2c3d4e5..."    (1 row)

  Total: 1 command deletes 11 rows across 4 tables.
  Sarah sees: "PetTrack deleted." Everything is gone cleanly.
```

### Example: "Load the Roadmap Page"

One query fetches the full tree:

```
Prisma query:

  prisma.milestone.findMany({
    where: { idea_id: "b2c3d4e5..." },
    orderBy: { sort_order: "asc" },
    include: {
      tasks: {
        orderBy: { sort_order: "asc" }
      }
    }
  })

Response shape (what the API returns):

  [
    {
      id: "d4e5f6a7...",
      title: "Core Pet Profile",
      phase: "mvp",
      status: "in_progress",
      tasks: [
        { title: "Design pet profile UI mockup", status: "done", ... },
        { title: "Create pet database model", status: "done", ... },
        { title: "Build add/edit pet form", status: "in_progress", ... },
        ...
      ]
    },
    {
      id: "e5f6a7b8...",
      title: "Vet Visit Reminders",
      phase: "mvp",
      status: "pending",
      tasks: []
    },
    ...
  ]
```

---

## 5. Explanation of Key Design Decisions

### Why 6 tables and not fewer?

```
OPTION A (what we chose):  6 separate tables
OPTION B (simpler):        Merge details into ideas, tasks into milestones

Why A wins:

  ┌──────────────────────┬─────────────────┬─────────────────┐
  │ Concern              │ Option A (6)    │ Option B (3-4)  │
  ├──────────────────────┼─────────────────┼─────────────────┤
  │ Ideas list page load │ 6 small columns │ 16 columns      │
  │ Details autosave     │ Writes 1 table  │ Writes ideas    │
  │ Add new detail field │ Alter details   │ Alter ideas     │
  │ Roadmap nesting      │ Natural 2-level │ Flat + hacks    │
  │ Cascade delete       │ Clean chains    │ Complex logic   │
  │ Beginner readability │ Each table = 1  │ Tables do too   │
  │                      │ clear concept   │ many things     │
  └──────────────────────┴─────────────────┴─────────────────┘
```

### Why JSON strings for competitors and team_needs?

```
OPTION A (what we chose):  JSON stored as TEXT in startup_details
OPTION B (normalized):     Separate competitors table + team_needs table

Why A wins for this project:

  1. This data is ALWAYS loaded together
     → We never query "find all ideas competing with Notion"
     → We always load all competitors for one idea

  2. This data is ALWAYS saved together
     → The details form saves all fields at once
     → No independent CRUD on individual competitors

  3. Avoids 2 extra tables, 2 extra sets of API routes
     → For a beginner project, fewer tables = easier to understand

  When to switch to Option B:
     → If you need to search across competitors
     → If you need to share competitors between ideas
     → If the list grows beyond ~20 items per idea
```

### Why `sort_order` integer instead of ordered by created time?

```
Scenario: User drags "Vet Visit Reminders" above "Core Pet Profile"

WITH sort_order (our approach):
  UPDATE milestones SET sort_order = 1 WHERE id = "vet-visits"
  UPDATE milestones SET sort_order = 2 WHERE id = "core-profile"
  Done. Two simple updates.

WITH created_at ordering:
  You'd have to change created_at to fake the order.
  But created_at is supposed to mean "when this was created."
  Lying about timestamps breaks audit trails.
  So you'd end up adding a sort_order column anyway.
```

### Why separate `updated_at` on some tables but not all?

```
Tables WITH updated_at:    users, startup_ideas, startup_details, milestones, tasks
Tables WITHOUT updated_at: export_history

Rule: If the row can be EDITED after creation → needs updated_at
      If the row is write-once (log/audit) → only needs created_at

Export history is a log. You never edit a past export record.
You only add new ones. So updated_at would always equal created_at.
```

---

## 6. Summary

```
┌─────────────────────────────────────────────────────────┐
│                    SCHEMA AT A GLANCE                   │
├───────────────────┬────────┬───────┬────────────────────┤
│ Table             │ Fields │ FKs   │ Purpose            │
├───────────────────┼────────┼───────┼────────────────────┤
│ users             │   6    │  0    │ Authentication     │
│ startup_ideas     │   7    │  1    │ Core business unit │
│ startup_details   │  12    │  1    │ Structured form    │
│ milestones        │  10    │  1    │ Roadmap phases     │
│ tasks             │   8    │  1    │ Work items         │
│ export_history    │   5    │  2    │ Audit trail        │
├───────────────────┼────────┼───────┼────────────────────┤
│ TOTAL             │  48    │  6    │                    │
└───────────────────┴────────┴───────┴────────────────────┘

Relationships: 6 (five 1:N + one 1:1)
Cascade deletes: All child tables auto-delete when parent is removed
JSON fields: 2 (competitors, team_needs) — intentional denormalization
```

*This schema is ready to be translated into a Prisma schema file in the next step.*
