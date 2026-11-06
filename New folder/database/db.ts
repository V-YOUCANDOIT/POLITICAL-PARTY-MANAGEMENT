import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database path in workspace root
const DB_DIR = path.resolve(process.cwd(), 'database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'politix.db');

export const db = new Database(DB_PATH, {
  // verbose: console.log
});

// Enable foreign keys & WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organizational_units (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Central', 'State', 'District', 'Constituency', 'Local')),
      parent_id TEXT,
      coordinator_id TEXT,
      state_name TEXT,
      district_name TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES organizational_units(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      unit_id TEXT,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Suspended')),
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES organizational_units(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      objectives TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'Planned' CHECK(status IN ('Draft', 'Planned', 'Active', 'Paused', 'Completed', 'Archived')),
      manager_id TEXT,
      budget_allocated REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS campaign_members (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role_in_campaign TEXT DEFAULT 'Member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'To Do' CHECK(status IN ('To Do', 'In Progress', 'Under Review', 'Completed')),
      priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
      due_date DATE,
      assigned_to_id TEXT,
      created_by_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Community',
      status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Published', 'Closed')),
      is_anonymous INTEGER NOT NULL DEFAULT 1,
      created_by_id TEXT,
      expires_at DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS survey_questions (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'single', 'rating', 'text')),
      options TEXT, -- JSON array string
      order_index INTEGER DEFAULT 0,
      is_required INTEGER DEFAULT 1,
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      respondent_token TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS survey_answers (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT NOT NULL,
      FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('Rally', 'Town Hall', 'Convention', 'Volunteer Training', 'Press Conference', 'Fundraiser', 'Community Outreach')),
      date_time DATETIME NOT NULL,
      venue TEXT NOT NULL,
      coordinator_id TEXT,
      expected_attendance INTEGER DEFAULT 0,
      actual_attendance INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
      logistics_checklist TEXT, -- JSON array of { id, item, done }
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS event_participants (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'Confirmed' CHECK(status IN ('Invited', 'Confirmed', 'Attended', 'Declined')),
      role_assigned TEXT DEFAULT 'Attendee',
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      unit_id TEXT,
      title TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      allocated_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
      FOREIGN KEY (unit_id) REFERENCES organizational_units(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      budget_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('Travel', 'Media & Advertising', 'Venue & Rentals', 'Printing & Materials', 'Catering', 'Logistics', 'Miscellaneous')),
      amount REAL NOT NULL,
      transaction_date DATE NOT NULL,
      receipt_url TEXT,
      submitted_by_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      approval_notes TEXT,
      reviewed_by_id TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL,
      FOREIGN KEY (submitted_by_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_type TEXT NOT NULL DEFAULT 'All' CHECK(target_type IN ('All', 'Department', 'Unit', 'Volunteers')),
      target_id TEXT,
      priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Normal', 'Important', 'Urgent')),
      author_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('task', 'event', 'expense', 'survey', 'announcement', 'system')),
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Indexes for high speed querying
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_tasks_campaign ON tasks(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_campaign ON expenses(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
    CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);
}
