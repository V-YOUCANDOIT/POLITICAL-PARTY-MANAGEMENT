# POLITIX – Complete Political Party Management & Campaign Operations Platform

POLITIX is an enterprise-grade, fully local management platform for political organizations and campaign operations. It unifies internal governance, campaign roadmaps, volunteer management, community surveys, rally logistics, treasury accounting, and operational compliance into a single secure local platform.

## 1. 100% Fully Local Guarantee & Privacy Constitution

- **Strictly Local**: Runs entirely on your local machine (Windows, macOS, or Linux).
- **No Cloud Services**: Zero reliance on Firebase, Supabase, Google Cloud, or MongoDB Atlas.
- **No External Authentication**: Built-in Bcrypt hashed credentials and local JWT session tokens.
- **No Telemetry or Tracking**: No user or organizational data is ever transmitted outside localhost.
- **Civic Privacy Guardrails**: Voluntary and anonymous surveys only; strict prohibition of individual voter profiling, belief scoring, or persuasion tracking.
- **Offline Maps**: Interactive geographical territorial projection rendered natively via vector layers without requiring external map tile servers.
- **Offline AI Assistant**: Built-in local rule-based synthesis and heuristic engines. Compatible with local Ollama (`127.0.0.1:11434`) if configured.

---

## 2. Quick Start & Execution

### Prerequisites
- Node.js 18+ or 20+ (Node.js 22 supported)
- npm 9+

### Commands

```bash
# 1. Install all dependencies
npm install

# 2. Initialize and seed SQLite database with demo dataset
npm run setup

# 3. Launch the full-stack server (Backend + Vite Frontend)
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

---

## 3. Demonstration Accounts & Roles

All accounts come pre-configured with the default development password:
**`politix2026`**

| Role | Email | Name | Jurisdiction & Scope |
|---|---|---|---|
| **Super Administrator** | `superadmin@politix.org` | Eleanor Vance | Root platform access, SQLite audit trail, database governance |
| **Central Administrator** | `centraladmin@politix.org` | Marcus Sterling | National headquarters, budget approvals, campaign oversight |
| **State Coordinator** | `statecoord@politix.org` | Sarah Chen-Morales | North Province directorate, district units, regional events |
| **District Coordinator** | `districtcoord@politix.org` | David O'Connor | Metro North district, volunteer assignments, rally logistics |
| **Constituency Manager** | `constituency@politix.org` | Amara Diallo | Central East constituency, field canvassing, survey feedback |
| **Campaign Manager** | `campaignmgr@politix.org` | Julian Hayes | Clean River Initiative lead, Kanban task board, expense requisitions |
| **Volunteer / Ground Worker** | `volunteer@politix.org` | Maya Patel | Ground worker, task check-off, QR survey distribution |

*Note: You can switch between any of these roles instantly from the top-right role switcher in the UI.*

---

## 4. Key Functional Modules

1. **Executive Operations Dashboard**:
   - Real-time SQLite queries for 11 core KPIs (members, active volunteers, campaigns, events, surveys, expenditures).
   - Recharts data visualizations for budget utilization, task Kanban distributions, and monthly events.
   - Quick one-click approval/rejection card for pending expense claims.

2. **Campaign Operations & Kanban Board**:
   - CRUD campaign initiatives with start/end dates, allocated budgets, objectives, and leads.
   - 4-column Kanban board (`To Do`, `In Progress`, `Under Review`, `Completed`).
   - Drag-and-drop / single-click task progression with priority badges and assignees.

3. **Voluntary Surveys & Feedback**:
   - Privacy-safe civic feedback collection with MCQ, Single-choice, Rating scale, and Text questions.
   - Printable QR Code generation (`qrcode`) for offline flyer and clipboard canvassing.
   - Live citizen response test view.
   - Real-time aggregated distribution charts and CSV exports.

4. **Events, Rallies & Logistics**:
   - Schedule rallies, town halls, conventions, and training camps.
   - Interactive logistics checklist with checkable items.
   - Expected vs. actual attendance tracking and event budget monitoring.

5. **Volunteer & Cadre Roster**:
   - Searchable, filterable member directory.
   - Unit assignment, system roles, task completion rates, and status management (`Active`, `Inactive`, `Suspended`).

6. **Organizational Hierarchy & Units**:
   - Multi-tier governing structure: Central Secretariat → State Units → District Units → Constituencies → Local Teams.
   - Coordinator assignments and physical branch addresses.

7. **Territorial Geographical Coverage**:
   - Offline interactive vector map with jurisdiction borders.
   - District-level branch details and regional civic survey priority scores.

8. **Treasury & Expense Management**:
   - Campaign and unit budget appropriations.
   - Itemized expense claims with local receipt document uploads.
   - Multi-tier approval workflow with auditor notes and audit log trail.

9. **Internal Party Communications**:
   - Priority-tagged bulletins (`Urgent`, `Important`, `Normal`).
   - Targeted audience delivery (All, Coordinators, Volunteers).

10. **Local AI Administrative Intelligence**:
    - Aggregated survey synthesis without external cloud APIs.
    - Automated task bottleneck & overdue permit risk radar.
    - Weekly campaign velocity & fiscal burn digest.
    - Optional zero-network connector for local Ollama.

11. **Reports & Exports**:
    - Direct CSV exports for Campaigns, Volunteer Rosters, Treasury Journals, and Event Attendance.
    - Formatted, print-ready executive audit dossier.

12. **Security Audit Trail**:
    - Immutable event logging of administrative logins, expense decisions, and campaign updates.

---

## 5. Windows Installation Instructions

1. Download or extract the project folder to your Windows system (e.g. `C:\Projects\politix`).
2. Open **PowerShell** or **Command Prompt** in that directory.
3. Verify Node.js is installed:
   ```cmd
   node -v
   npm -v
   ```
4. Run the setup:
   ```cmd
   npm install
   npm run setup
   npm run dev
   ```
5. Open your web browser to `http://localhost:3000`.
6. To inspect the local database, you can open `database/politix.db` in **DB Browser for SQLite** or **VS Code SQLite Viewer**.

---

## 6. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Leaflet, QRCode.
- **Backend**: Express.js, TypeScript (`tsx`), Multer (local file storage in `uploads/receipts`), JSON Web Tokens.
- **Database**: SQLite 3 via `better-sqlite3` with WAL mode enabled (`database/politix.db`).
- **Security**: Bcrypt salted password hashing, role-based authorization gates, SQL parameterized queries.
