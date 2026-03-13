-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "startup_ideas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pitch" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "startup_ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "startup_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idea_id" TEXT NOT NULL,
    "problem" TEXT,
    "solution" TEXT,
    "target_audience" TEXT,
    "unique_value" TEXT,
    "revenue_model" TEXT,
    "market_size" TEXT,
    "competitors" TEXT NOT NULL DEFAULT '[]',
    "team_needs" TEXT NOT NULL DEFAULT '[]',
    "budget" REAL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "startup_details_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "startup_ideas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idea_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'mvp',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "target_date" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "milestones_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "startup_ideas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "milestone_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "export_history_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "startup_ideas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "export_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "startup_details_idea_id_key" ON "startup_details"("idea_id");
