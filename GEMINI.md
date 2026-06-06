This is a desktop app now — the architecture changes completely. Let me write the full technical PRD.

---

# FULL PRD — Habit & Finance Tracker Desktop App

---

## 1. PROJECT OVERVIEW

**App Name:** DailyDash (working title — changeable in Settings)
**Type:** Cross-platform desktop application (Windows EXE primary target)
**Data Storage:** 100% local — SQLite database file on the user's device, no internet required, no cloud sync
**Framework:** Electron.js (wraps your HTML/CSS/JS UI into a native desktop window and produces an installable .exe)
**Database:** SQLite via the `better-sqlite3` npm package (synchronous, fast, file-based)
**Build Tool:** electron-builder (generates Windows installer .exe, portable .exe, and optionally .dmg for Mac)

---

## 2. TECH STACK

**Frontend Layer (UI):**
- HTML5, CSS3, Vanilla JavaScript (no React needed — keeps the bundle small)
- Same design system as the trading journal (dark theme, Google Sans font, CSS variables from globals.css)
- Single-page app with JS-based tab/view routing (no page reloads)

**Desktop Shell:**
- Electron.js v28+ — provides the window, system tray, native menus, and IPC bridge
- Main Process (Node.js) handles: database, file system, window management
- Renderer Process (browser context) handles: all UI/HTML/CSS/JS

**Database:**
- SQLite — a single `.db` file stored at: `C:/Users/[username]/AppData/Roaming/DailyDash/data.db` on Windows
- `better-sqlite3` npm package for synchronous SQLite queries from the main process
- No ORM — raw SQL queries for simplicity and control

**IPC Communication (Frontend ↔ Backend):**
- Electron's `ipcMain` (main process) and `ipcRenderer` (renderer process) bridge
- A `preload.js` script exposes a safe `window.api` object to the frontend — no direct Node access from UI
- All database reads/writes go through IPC channels

**Build & Packaging:**
- `electron-builder` npm package
- Produces: Windows NSIS installer (DailyDash-Setup-1.0.0.exe) and a portable EXE
- The SQLite .db file is NOT bundled — it's created fresh on first launch in AppData

---

## 3. FOLDER STRUCTURE

```
dailydash/
├── main.js                  ← Electron main process (window, IPC handlers)
├── preload.js               ← Secure IPC bridge exposed to renderer
├── package.json             ← Dependencies + electron-builder config
├── database/
│   └── db.js                ← SQLite connection + all query functions
├── renderer/
│   ├── index.html           ← Single HTML shell (all pages rendered here)
│   ├── styles/
│   │   └── globals.css      ← Copied from trading journal + additions
│   └── js/
│       ├── app.js           ← Router + page loader
│       ├── today.js         ← Page 1 logic
│       ├── calendar.js      ← Page 2 logic
│       ├── finance.js       ← Page 3 logic
│       ├── transactions.js  ← Page 4 logic
│       └── settings.js      ← Page 5 logic
└── assets/
    └── icon.ico             ← App icon for Windows EXE
```

---

## 4. DATABASE SCHEMA (SQLite)

**File location:** `%APPDATA%/DailyDash/data.db`

---

### Table 1: `habits`

Stores the definition of each habit. Pre-seeded on first launch.

```
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL
icon          TEXT                    ← emoji or icon code e.g. '🕌', '🏃', '📚'
category      TEXT DEFAULT 'general'  ← values: 'namaz' | 'health' | 'study' | 'discipline' | 'custom'
is_active     INTEGER DEFAULT 1       ← 1 = active, 0 = archived/hidden
sort_order    INTEGER DEFAULT 0       ← for drag-to-reorder in Settings
is_deletable  INTEGER DEFAULT 1       ← 0 for the 5 namaz (protected, only toggle-able)
target_value  INTEGER DEFAULT 1       ← for quantity habits (water = 8 glasses)
unit          TEXT                    ← 'glasses', 'minutes', null for boolean habits
created_at    TEXT DEFAULT CURRENT_TIMESTAMP
```

**Seed data (auto-inserted on first launch):**

| id | name | icon | category | is_deletable | target_value | unit |
|---|---|---|---|---|---|---|
| 1 | Fajr | 🕌 | namaz | 0 | 1 | null |
| 2 | Dhuhr | 🕌 | namaz | 0 | 1 | null |
| 3 | Asr | 🕌 | namaz | 0 | 1 | null |
| 4 | Maghrib | 🕌 | namaz | 0 | 1 | null |
| 5 | Isha | 🕌 | namaz | 0 | 1 | null |
| 6 | Morning Exercise | 🏃 | health | 1 | 1 | null |
| 7 | Study Session | 📚 | study | 1 | 1 | null |
| 8 | Social Media ≤30 min | 📵 | discipline | 1 | 1 | null |
| 9 | No Negative Videos | 🚫 | discipline | 1 | 1 | null |
| 10 | Drink Water | 💧 | health | 1 | 8 | glasses |

---

### Table 2: `habit_logs`

One row per habit per day. Records completion.

```
id            INTEGER PRIMARY KEY AUTOINCREMENT
habit_id      INTEGER NOT NULL         ← FK → habits.id (CASCADE DELETE)
date          TEXT NOT NULL            ← 'YYYY-MM-DD'
completed     INTEGER DEFAULT 0        ← 1 = done, 0 = not done
value         INTEGER DEFAULT 0        ← for water: how many glasses (0-8)
note          TEXT                     ← optional personal note for that day's habit
UNIQUE(habit_id, date)                ← only one log per habit per day
FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
```

---

### Table 3: `wallets`

Each place where money is kept.

```
id            INTEGER PRIMARY KEY AUTOINCREMENT
name          TEXT NOT NULL            ← 'Cash', 'bKash', 'Nagad', 'Rocket', 'Upay', 'Card', 'Bank'
color         TEXT DEFAULT '#8ab4f8'   ← hex color for the wallet card UI
emoji         TEXT                     ← '💵', '📱', etc.
is_active     INTEGER DEFAULT 1
sort_order    INTEGER DEFAULT 0
created_at    TEXT DEFAULT CURRENT_TIMESTAMP
```

**Note:** Wallet balance is NOT stored as a column. It is always **calculated** from the `transactions` table as: `SUM(income) - SUM(expense)` for that wallet_id. This prevents data inconsistency.

**Seed data (auto-inserted on first launch — user picks which ones to activate):**

| name | color | emoji |
|---|---|---|
| Cash | #fdd663 | 💵 |
| bKash | #e2136e | 📱 |
| Nagad | #f7941d | 💳 |
| Rocket | #8b14cc | 🚀 |
| Upay | #0070c0 | 💙 |
| Card | #9aa0a6 | 💳 |
| Bank | #81c995 | 🏦 |

---

### Table 4: `transactions`

Every money movement (income or expense).

```
id            INTEGER PRIMARY KEY AUTOINCREMENT
type          TEXT NOT NULL            ← 'income' | 'expense'
amount        REAL NOT NULL            ← always positive
wallet_id     INTEGER NOT NULL         ← FK → wallets.id
category      TEXT                     ← for expense: 'food','transport','bills','shopping','health','education','other'
                                       ← for income: 'salary','freelance','gift','transfer','other'
date          TEXT NOT NULL            ← 'YYYY-MM-DD'
time          TEXT                     ← 'HH:MM' optional
note          TEXT                     ← free text
created_at    TEXT DEFAULT CURRENT_TIMESTAMP
FOREIGN KEY(wallet_id) REFERENCES wallets(id)
```

---

### Table 5: `settings`

Key-value store for app preferences.

```
key           TEXT PRIMARY KEY
value         TEXT
```

**Default rows:**

| key | value |
|---|---|
| app_name | DailyDash |
| currency | BDT |
| currency_symbol | ৳ |
| first_launch | true |
| theme | dark |
| user_name | Rakib |
| week_start | 0 (0=Sunday) |

---

## 5. BACKEND — IPC CHANNEL SPECIFICATION

All communication between the UI (renderer) and database (main process) happens through `window.api` methods exposed by `preload.js`.

### 5.1 Habits IPC

**`window.api.habits.getAll()`**
- Returns all habits ordered by sort_order, filtered to is_active=1
- Used by: Page 1 (Today), Page 2 (Calendar), Page 5 (Settings)

**`window.api.habits.create({ name, icon, category, target_value, unit })`**
- Inserts new habit row, auto-assigns next sort_order
- Returns: the new habit object with id

**`window.api.habits.update({ id, name, icon, is_active, sort_order, target_value })`**
- Updates any field on a habit row by id

**`window.api.habits.delete(id)`**
- Only works if is_deletable = 1, also deletes all habit_logs for that habit (CASCADE)
- Returns: { ok: true } or { error: 'Cannot delete protected habit' }

**`window.api.habits.reorder(orderedIds)`**
- Takes array of habit ids in new order, updates sort_order for each

### 5.2 Habit Logs IPC

**`window.api.habitLogs.getByDate(date)`**
- Returns all habit_log rows for a given 'YYYY-MM-DD' date, joined with habit name and icon
- Returns habits with no log yet too (LEFT JOIN), so UI can show unchecked habits

**`window.api.habitLogs.getByMonth(year, month)`**
- Returns all habit_log rows for the given year/month
- Returns: array of { date, habit_id, completed, value }
- Used by Page 2 calendar to color each cell

**`window.api.habitLogs.upsert({ habit_id, date, completed, value, note })`**
- INSERT OR REPLACE into habit_logs
- If completed is toggled off on a boolean habit: sets completed=0
- Returns: the upserted row

**`window.api.habitLogs.getStreaks(habit_id)`**
- Returns { current_streak, longest_streak } for a given habit
- Calculated by scanning backward from today through consecutive completed=1 days

### 5.3 Wallets IPC

**`window.api.wallets.getAll()`**
- Returns all active wallets WITH calculated balance
- Balance = `SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) FROM transactions WHERE wallet_id = ?`

**`window.api.wallets.create({ name, color, emoji, initial_balance })`**
- Inserts new wallet
- If initial_balance > 0: also inserts a transaction row (type='income', category='initial', amount=initial_balance, date=today, note='Opening balance')

**`window.api.wallets.update({ id, name, color, emoji, is_active })`**
- Updates wallet metadata

**`window.api.wallets.delete(id)`**
- Only allowed if calculated balance = 0
- Returns { error: 'Withdraw all funds before removing this wallet' } if balance > 0

### 5.4 Transactions IPC

**`window.api.transactions.getAll({ wallet_id?, type?, date_from?, date_to?, search? })`**
- Returns transactions filtered by optional params, ordered by date DESC, then created_at DESC
- Joins wallet name and color for display

**`window.api.transactions.getByPeriod(period)`**
- period values: 'today' | 'week' | 'month' | 'all'
- Returns: { rows: [...], total_income, total_expense, net }

**`window.api.transactions.getByDate(date)`**
- Returns all transactions for a specific 'YYYY-MM-DD' — used in Day Detail dialog on Page 2

**`window.api.transactions.create({ type, amount, wallet_id, category, date, time, note })`**
- Inserts new transaction
- Returns the new transaction with wallet info joined

**`window.api.transactions.delete(id)`**
- Deletes transaction by id
- Returns { ok: true }

### 5.5 Stats IPC

**`window.api.stats.getSummary()`**
- Returns: { total_balance, today_spent, week_spent, month_spent, total_income_ever, total_expense_ever }
- total_balance = SUM of all wallet balances
- Used by Page 1 sidebar and Page 3

**`window.api.stats.getHabitSummary(month, year)`**
- Returns per-day completion counts for the month
- Returns: array of { date, completed_count, total_count, namaz_count, namaz_total }

**`window.api.stats.getWalletBreakdown()`**
- Returns: array of { wallet_name, color, emoji, balance, pct_of_total }
- Used by Page 3 wallet cards

### 5.6 Settings IPC

**`window.api.settings.get(key)`**
- Returns the value string for a key

**`window.api.settings.set(key, value)`**
- Upserts a settings row

**`window.api.settings.getAll()`**
- Returns all settings as a plain { key: value } object

**`window.api.settings.resetAllData()`**
- Drops and recreates all tables, re-seeds defaults
- Requires confirmation in UI before calling

---

## 6. PAGES — FULL DETAILED SPECIFICATION

---

### PAGE 1 — TODAY (Dashboard)

**Route:** `#today` (default on launch)

**Purpose:** The first thing you see every day. Check off habits, see your money snapshot, add quick transactions.

**Topbar:**
- Left: hamburger menu (mobile only), app logo icon, app name "DailyDash"
- Center: today's full date — "Saturday, 7 June 2026" in large 22px font
- Right: quick "＋ Add Expense" button (red-tinted, loss color), "＋ Add Money" button (green-tinted, profit color)
- Navigation tabs (below topbar or as icon buttons): Today | Calendar | Finance | Transactions | Settings

**Sidebar (left, 260px desktop / drawer on mobile):**
- Section: "Today's Finance"
  - Total Available Balance — big blue number e.g. ৳12,450
  - Today Spent — loss color e.g. ৳320
  - This Week — ৳1,200
  - This Month — ৳8,400
- Section: "My Wallets" — mini list showing each wallet with name, color dot, and balance
- Section: Action buttons — "＋ Add Money" and "＋ Add Expense"

**Main Content Area:**
- Today's Score banner — "8 / 10 habits completed today" with a thin horizontal progress bar (green fill proportional to completion %)
- Namaz section (collapsible group header "🕌 Namaz (5 Prayers)") — shows 5 prayer rows, each with prayer name, current status chip (Done / Missed), and a toggle button
- Other Habits section — remaining habits as card rows: icon, name, toggle button on right. For water habit: shows "💧 3 / 8 glasses" with + and - counter buttons instead of a single toggle
- "+ Add Habit" ghost link at the bottom of the list
- Motivational footer: if all namaz done — shows "🌟 MashaAllah! All prayers completed today"

**Dialogs on Page 1:**
- Add Money dialog: tab for type (Income), Source wallet dropdown (all active wallets), Amount field (with ৳ prefix), Category dropdown (Salary / Freelance / Gift / Transfer / Other), Date (default today), Time (optional), Note (optional). Footer: Cancel + Save
- Add Expense dialog: tab for type (Expense), Category dropdown (Food / Transport / Bills / Shopping / Health / Education / Other), Paid From wallet dropdown, Amount, Date, Time (optional), Note. Footer: Cancel + Save

---

### PAGE 2 — HABIT CALENDAR (Monthly View)

**Route:** `#calendar`

**Purpose:** Review your habit history month by month. See patterns, streaks, and retroactively log habits.

**Topbar addition:** Month navigation (← PREV month label NEXT →) + "Today" button, identical to trading journal

**Sidebar (left):**
- Current Streak (days) — big blue number
- Longest Streak — gold colored
- Best Month completion %
- "This Month" completion rate progress bar
- Per-habit mini table: habit name | done/total days this month | streak

**Calendar Grid (main area):**
- 7-column, 6-row, 42-cell grid — exact same structure as trading journal Calendar component
- SUN / MON / TUE / WED / THU / FRI / SAT header row
- Today's date circle is filled blue (same as journal)
- Other-month dates are muted (text3 color)

**Cell coloring logic:**
- All habits completed: strong green background (profit-bg)
- 70%+ completed: light green
- 40-69% completed: amber/gold tint (--gold variable with low opacity)
- 1-39% completed: light red (loss-bg with lower opacity)
- No data (future or untouched past): default surface color

**Cell content:**
- Day number circle (top left)
- Namaz badge: "🕌 4/5" in a small blue badge (if at least 1 namaz was done)
- Completion badge: "7/10" in green/amber/red badge depending on score
- If today: "TODAY" micro label

**Clicking a cell → Day Detail dialog:**
- Header: "Tuesday, June 3" with a small completion score chip
- Tab 1 — "Habits": full habit list for that day, each row with toggle. Allows retroactive editing. Water habit shows counter. Save button at bottom of tab.
- Tab 2 — "Expenses": shows all transactions for that day in a mini list (amount, category, wallet). "Add expense for this day" button at bottom — opens Add Expense dialog with date pre-filled.
- Footer: Cancel button (closes dialog), Save button (saves all habit changes)

---

### PAGE 3 — FINANCE HUB (Overview)

**Route:** `#finance`

**Purpose:** See the complete financial picture — total wealth, per-wallet breakdown, spending patterns.

**Topbar:** Standard topbar + "＋ Add Money" and "＋ Add Expense" buttons on right

**No sidebar on this page.** Full-width card layout.

**Section 1 — Total Balance Hero:**
- Large centered card: "Total Available" label, big balance number e.g. ৳12,450, below it two chips: "Total In ৳45,000" and "Total Out ৳32,550"
- Below hero card: two prominent action buttons side by side — "+ Add Money" (profit color) and "+ Add Expense" (loss color)

**Section 2 — My Wallets Grid:**
- Responsive grid: 2 columns mobile, 3-4 columns desktop
- Each wallet card: color-coded left border strip, emoji + wallet name, balance in big text (loss color if somehow negative), small "%" of total at bottom
- bKash card example: pink border, 📱 bKash, ৳3,200, "26% of total"
- Last card in grid: "+ Add Wallet" ghost card with dashed border
- Clicking any wallet card: opens Wallet Detail panel/modal — shows wallet info, last 10 transactions for that wallet, Edit Name button, Deactivate button

**Section 3 — Spending Summary Row:**
- Three stat cards in a row: "Today" / "This Week" / "This Month"
- Each card: period label, total spent in loss (red) color, a small "vs last period" delta if calculable
- Each card is clickable — navigates to Transactions page with that period pre-filtered

**Section 4 — Income vs Expense Chart (text-based bar):**
- No canvas charts (keeps it simple) — uses CSS-based horizontal bars
- Two bars: Income (green) and Expense (red) for current month, with amounts labeled
- "This Month Snapshot" section header

**Section 5 — Recent Transactions:**
- "Recent" section header + "See All →" link on right
- Last 10 transactions in compact list
- Each row: date pill, category icon (emoji), note/category text, wallet badge, amount (green for income, red for expense)

**Dialogs on Page 3:**
- Same Add Money and Add Expense dialogs as Page 1
- Wallet Detail modal: wallet name (editable), color picker, emoji picker, balance (read-only, calculated), transaction list for that wallet, Edit button, Deactivate button
- Add Wallet dialog: Name field, Color chips (6 preset colors), Emoji field, Initial Balance field (optional), Save button

---

### PAGE 4 — TRANSACTIONS (Full History)

**Route:** `#transactions`

**Purpose:** Complete log of every financial movement. Filter, search, and manage.

**Topbar:** Standard + floating "+ Add Transaction" button on right (opens tabbed dialog)

**Filter Bar (sticky below topbar):**
- Period buttons: Today | Week | Month | All (pill toggle style, blue active state)
- Type filter: All | Income | Expense (pill chips)
- Wallet filter: dropdown with all wallets + "All Wallets" option
- Search input: "Search notes…" — live filters the list by note text
- Results summary badge: "24 transactions · In ৳12,000 · Out ৳8,500 · Net ৳3,500"

**Transaction List (main area):**
- Grouped by date, newest first
- Date group header row: "Today, June 7" on left, "Net: ৳-320 · 3 transactions" on right. Slightly different background so group headers stand out.
- Each transaction row:
  - Left: category emoji icon in a small colored circle, then category name as primary text, wallet badge pill below, note text if any (italic, muted)
  - Right: amount with sign — "+৳5,000" (profit green) or "-৳320" (loss red), time if recorded below amount
  - Hover state (desktop): shows a trash icon on the far right
  - Mobile: tap-and-hold shows a bottom sheet with options (Edit note, Delete)
- Load More button at bottom (pagination: 30 per load)

**Add Transaction dialog (tabbed):**
- Two top tabs: "Income" and "Expense" (same pattern as deposit dialog in trading journal)
- Income tab fields: Source Wallet (dropdown), Category (Salary/Freelance/Gift/Transfer/Other), Amount, Date, Time (optional), Note
- Expense tab fields: Category (Food/Transport/Bills/Shopping/Health/Education/Other), Paid From (wallet dropdown), Amount, Date, Time (optional), Note
- Footer: Cancel + Save

**Delete flow:**
- Clicking trash icon shows inline confirmation row under the transaction: "Delete this transaction? [Cancel] [Delete]"
- No separate modal for delete

---

### PAGE 5 — SETTINGS & MANAGE

**Route:** `#settings`

**Purpose:** Configure everything — habits, wallets, app preferences, data management.

**Layout:** Two main cards stacked vertically on mobile, side by side on wide desktop

**Card 1 — Manage Habits:**
- Header: "My Habits" + "＋ New Habit" button on right
- Drag-to-reorder list. Each row:
  - Drag handle (≡ icon) on far left
  - Emoji icon (editable — clicking opens emoji picker with 20 common options)
  - Habit name (click to edit inline — text becomes an input on click, save on Enter or blur)
  - Active toggle switch on right
  - Trash icon (only shown for is_deletable=1 habits)
- "Namaz (5 Prayers)" sub-group: collapsible header, can toggle all 5 at once with a group toggle, or individually
- Water habit shows an extra "Target" number field below name when editing
- "New Habit" flow: appends a blank row at bottom with icon picker (defaults to ⭐), name input pre-focused, category dropdown, optional target/unit fields, confirm (✓) and cancel (✗) buttons

**Card 2 — Manage Wallets:**
- Header: "My Wallets" + "＋ New Wallet" button on right
- List of all wallets (active + inactive):
  - Color strip dot, emoji, wallet name (click to edit inline), current balance (read-only, muted), active toggle, trash icon
  - Inactive wallets shown below active ones, slightly muted
- Trash only enabled if balance = 0, otherwise shows tooltip on hover
- "New Wallet" row appended at bottom: name input, 6 color chip options, emoji field, optional opening balance field

**Card 3 — App Preferences:**
- User Name field (used in greetings)
- Currency selector (BDT ৳ / USD $ / EUR € / etc.)
- Week starts on: Sunday / Monday toggle
- App theme: Dark only for now (light mode can be future)

**Card 4 — Data Management:**
- "Export Data" button — exports all data to a .json file saved to user's Desktop via Electron dialog
- "Import Data" button — imports from a previously exported .json (replaces current data after confirmation)
- "Reset All Data" button — danger styled, clears everything and re-seeds defaults. Shows a two-step confirmation dialog: first click shows "Are you sure? This cannot be undone." with a typed confirmation input — user must type "RESET" to enable the confirm button.

**Card 5 — About:**
- App name, version number (1.0.0), build date
- SQLite database file path (clickable — opens the folder in Windows Explorer via Electron shell.openPath)
- "Open Data Folder" button — reveals the AppData/Roaming/DailyDash folder

---

## 7. FULL WORKFLOW (User Journeys)

---

### Workflow A — First Launch

1. User double-clicks DailyDash.exe
2. Electron main process starts, creates `%APPDATA%/DailyDash/` folder if not exists
3. `db.js` opens/creates `data.db` using `better-sqlite3`
4. On first launch (`settings.first_launch = 'true'`), runs seed SQL: inserts 10 default habits, 7 default wallets (all active), default settings
5. Sets `first_launch = 'false'` in settings table
6. Renderer loads `index.html`, JS calls `window.api.settings.getAll()` via IPC
7. App routes to `#today` (default page)
8. Page 1 loads: calls `getAll()` for habits, `getSummary()` for stats, renders sidebar and habit list
9. All wallets show ৳0 balance (no transactions yet)
10. User sees their name in the greeting ("Good morning, Rakib") pulled from settings.user_name

---

### Workflow B — Daily Habit Check-in

1. User opens app (or it was already open), navigates to Today page (auto-route on launch)
2. `window.api.habitLogs.getByDate('2026-06-07')` called — returns LEFT JOIN of all active habits with any existing logs for today
3. For habits with no existing log: completed = 0 shown as unchecked toggle
4. User clicks the toggle on "Fajr" → UI optimistically toggles to green
5. `window.api.habitLogs.upsert({ habit_id: 1, date: '2026-06-07', completed: 1 })` called via IPC
6. Main process runs `INSERT OR REPLACE INTO habit_logs ...` — synchronous, instant
7. Score banner updates: "1 / 10 habits completed today" → counter increments
8. User taps water glass + button 3 times → each tap calls upsert with value=3, completed=1 (when value > 0)
9. After completing all namaz: motivational message appears "🌟 MashaAllah! All prayers completed today"
10. Closing app and reopening: same date → loads saved state, shows checkmarks on previously completed habits

---

### Workflow C — Add Expense

1. User clicks "＋ Add Expense" button in sidebar or topbar
2. Add Expense dialog opens with Expense tab active
3. User selects Category: "Food", Paid From: "bKash", Amount: "150", Note: "Lunch at office"
4. Date defaults to today, time left empty
5. User clicks Save
6. `window.api.transactions.create({ type:'expense', amount:150, wallet_id:2, category:'food', date:'2026-06-07', note:'Lunch at office' })` called
7. Main process inserts transaction row
8. Sidebar stats re-fetched: Today Spent updates from ৳0 to ৳150
9. bKash wallet balance recalculates: if was ৳3,200 now shows ৳3,050
10. Dialog closes, user sees updated numbers in sidebar immediately

---

### Workflow D — Add Money (Income)

1. User clicks "＋ Add Money"
2. Add Money dialog opens
3. User selects Source Wallet: "Cash", Category: "Freelance", Amount: "5000", Note: "Logo design payment"
4. Clicks Save → transaction created (type: 'income')
5. Cash wallet balance increases by ৳5,000
6. Total Available Balance updates across all views
7. Transaction appears in Recent list on Finance Hub

---

### Workflow E — Retroactive Habit Logging (Past Days)

1. User goes to Calendar page (Page 2)
2. Navigates to previous month if needed using ← arrow
3. Clicks on a past day cell (e.g. June 3 — shown with amber color meaning partial completion)
4. Day Detail dialog opens showing that day's habits with their saved state
5. User checks "Morning Exercise" which was missed
6. Clicks Save → upsert called for June 3, habit_id 6
7. Dialog closes, June 3 cell re-renders: now shows 9/10, color updates to green
8. Streak recalculation triggered: if this fills a gap, streaks update in sidebar

---

### Workflow F — Viewing Finance by Period

1. User goes to Transactions page (Page 4)
2. By default "Month" period is selected
3. Sees all June transactions grouped by date, total summary in filter bar
4. Clicks "Today" period chip → list re-filters to only today's transactions
5. Clicks Wallet dropdown → selects "bKash" → list now shows only bKash transactions
6. Types "lunch" in search box → only transactions with "lunch" in note appear
7. Filter combinations are AND logic (today AND bKash AND "lunch")
8. Clicks "This Week" stat card on Finance Hub → navigates to Transactions page with Week pre-selected

---

### Workflow G — Adding a New Habit

1. User clicks "+ Add Habit" on Page 1 or goes to Settings
2. On Settings, clicks "＋ New Habit" button
3. A new blank row appears at bottom of habits list
4. User clicks emoji picker → selects 🧘
5. Types habit name: "Evening Walk"
6. Category: "health"
7. Clicks ✓ confirm button
8. `window.api.habits.create({ name:'Evening Walk', icon:'🧘', category:'health', target_value:1 })` called
9. New habit appears in the list on Settings with active toggle ON
10. Goes to Today page → new habit appears in the habit checklist, unchecked

---

### Workflow H — Export and Backup Data

1. User goes to Settings → Data Management
2. Clicks "Export Data"
3. Electron opens a native Save File dialog (Windows save-as dialog)
4. User picks Desktop, names file "dailydash-backup-june2026.json"
5. Main process runs all SELECT * queries on all 5 tables, assembles JSON object
6. Writes JSON to chosen file path using Node.js `fs.writeFileSync`
7. Success toast notification shown: "Data exported to Desktop"
8. Later — user clicks "Import Data", selects the .json file
9. Confirmation dialog: "This will replace ALL current data. Continue?"
10. On confirm: all tables cleared, imported data inserted row by row

---

### Workflow I — App Launch (Returning User, Same Day)

1. User opens DailyDash.exe
2. Main process: first_launch = false, skip seeding
3. Renderer loads, routes to `#today`
4. IPC calls: `getByDate(today)` for habits, `getSummary()` for finance
5. Page renders in under 100ms (SQLite synchronous reads are extremely fast, sub-millisecond for this data size)
6. All yesterday's and earlier habit states persist in calendar
7. Today's habits show previously ticked checkmarks if user already logged some

---

## 8. ELECTRON MAIN PROCESS ARCHITECTURE (`main.js`)

**Window creation:**
- Creates a BrowserWindow: 1200×750px default size, minimum 600×500px
- `webPreferences: { preload: 'preload.js', contextIsolation: true, nodeIntegration: false }` — secure setup
- Loads `renderer/index.html`
- On macOS: hides to dock when window closed (keeps running). On Windows: closes fully.

**App lifecycle:**
- `app.on('ready')` → open DB connection, create window
- `app.on('window-all-closed')` → `app.quit()` on Windows/Linux
- `app.on('will-quit')` → close DB connection cleanly (`db.close()`)

**IPC handler registration:**
- All `ipcMain.handle('channel-name', async (event, ...args) => {...})` calls registered in main.js
- Each handler calls the appropriate function from `database/db.js`
- All db operations are synchronous (better-sqlite3 is synchronous by design — no async/await needed in db layer)

**System Tray (optional, Phase 2):**
- Tray icon in Windows taskbar area
- Right-click menu: "Open", "Quick Add Expense", "Today's Habits", "Quit"

---

## 9. EXE BUILD PROCESS

**Dependencies (`package.json`):**
```
electron: ^28.0.0
better-sqlite3: ^9.0.0
electron-builder: ^24.0.0 (devDependency)
```

**electron-builder config in `package.json`:**
```
build:
  appId: com.rakib.dailydash
  productName: DailyDash
  win:
    target: [nsis, portable]
    icon: assets/icon.ico
  nsis:
    oneClick: false
    allowToChangeInstallationDirectory: true
    installerIcon: assets/icon.ico
  files:
    - main.js
    - preload.js
    - database/**
    - renderer/**
    - assets/**
    - node_modules/**
```

**Build commands:**
```
npm install              ← installs all dependencies
npm run build            ← runs electron-builder, generates dist/ folder
```

**Output in `dist/` folder:**
- `DailyDash Setup 1.0.0.exe` — Windows NSIS installer (recommended, creates Start Menu shortcut, Uninstall entry)
- `DailyDash 1.0.0.exe` — Portable EXE (no install needed, run directly from USB or any folder)

**Data location after install:**
- Database: `C:/Users/[username]/AppData/Roaming/DailyDash/data.db`
- This folder persists across app updates and uninstalls (unless user manually deletes it)
- Uninstalling the app does NOT delete the database — data is safe

---

## 10. IMPLEMENTATION PHASES (Recommended Build Order)

**Phase 1 — Foundation (Build first):**
Electron shell + SQLite connection + database schema + preload IPC bridge + global CSS + navigation skeleton

**Phase 2 — Page 1 (Today):**
Habit list rendering, toggle IPC, water counter, finance sidebar, Add Money/Expense dialogs

**Phase 3 — Page 5 (Settings):**
Add/remove/reorder habits, add/remove wallets — needed early so you have data for other pages

**Phase 4 — Page 2 (Calendar):**
Calendar grid, cell coloring logic, Day Detail dialog

**Phase 5 — Pages 3 & 4 (Finance):**
Finance Hub wallet cards, Transactions list with filters, stats calculation

**Phase 6 — Polish:**
Streak calculation, export/import, animations, tray icon, app icon, EXE build & test

---

## 11. SUMMARY TABLE

| Page | Route | Purpose | IPC Calls Used | New Dialogs |
|---|---|---|---|---|
| 1 Today | #today | Daily habits + quick finance | getByDate, getSummary, upsert | Add Money, Add Expense |
| 2 Calendar | #calendar | Monthly habit history | getByMonth, getStreaks, getByDate | Day Detail (habits + expenses) |
| 3 Finance Hub | #finance | Wallet balances + spending | getWalletBreakdown, getSummary, getByPeriod | Add Wallet, Wallet Detail |
| 4 Transactions | #transactions | Full transaction log | getAll (filtered), create, delete | Add Transaction, Delete Confirm |
| 5 Settings | #settings | Manage habits, wallets, prefs | habits CRUD, wallets CRUD, settings get/set | Reset Confirm, Export/Import |

---

