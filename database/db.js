const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'data.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Habits Table
            db.run(`CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT,
                category TEXT DEFAULT 'general',
                is_active INTEGER DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                is_deletable INTEGER DEFAULT 1,
                target_value INTEGER DEFAULT 1,
                unit TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`);

            // Habit Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS habit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                habit_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                value INTEGER DEFAULT 0,
                note TEXT,
                UNIQUE(habit_id, date),
                FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
            )`);

            // Wallets Table
            db.run(`CREATE TABLE IF NOT EXISTS wallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#8ab4f8',
                emoji TEXT,
                is_active INTEGER DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`);

            // Transactions Table
            db.run(`CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                wallet_id INTEGER NOT NULL,
                category TEXT,
                date TEXT NOT NULL,
                time TEXT,
                note TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(wallet_id) REFERENCES wallets(id)
            )`);

            // Settings Table
            db.run(`CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`, (err) => {
                if (err) return reject(err);
                
                // Seed data if first launch
                db.get("SELECT value FROM settings WHERE key = 'first_launch'", (err, row) => {
                    if (!row) {
                        seedData();
                        resolve();
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

function seedData() {
    const habits = [
        ['Fajr', '🕌', 'namaz', 0],
        ['Dhuhr', '🕌', 'namaz', 0],
        ['Asr', '🕌', 'namaz', 0],
        ['Maghrib', '🕌', 'namaz', 0],
        ['Isha', '🕌', 'namaz', 0],
        ['Morning Exercise', '🏃', 'health', 1],
        ['Study Session', '📚', 'study', 1],
        ['Social Media ≤30 min', '📵', 'discipline', 1],
        ['No Negative Videos', '🚫', 'discipline', 1],
        ['Drink Water', '💧', 'health', 1, 8, 'glasses']
    ];

    habits.forEach((h, i) => {
        db.run(`INSERT INTO habits (name, icon, category, is_deletable, target_value, unit, sort_order) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [...h.slice(0, 3), h[3], h[4] || 1, h[5] || null, i]);
    });

    const wallets = [
        ['Cash', '#fdd663', '💵'],
        ['bKash', '#e2136e', '📱'],
        ['Nagad', '#f7941d', '💳'],
        ['Rocket', '#8b14cc', '🚀'],
        ['Upay', '#0070c0', '💙'],
        ['Card', '#9aa0a6', '💳'],
        ['Bank', '#81c995', '🏦']
    ];

    wallets.forEach((w, i) => {
        db.run(`INSERT INTO wallets (name, color, emoji, sort_order) VALUES (?, ?, ?, ?)`, [...w, i]);
    });

    const settings = [
        ['app_name', 'DailyDash'],
        ['currency', 'BDT'],
        ['currency_symbol', '৳'],
        ['first_launch', 'false'],
        ['theme', 'dark'],
        ['user_name', 'User'],
        ['week_start', '0']
    ];

    settings.forEach(s => {
        db.run(`INSERT INTO settings (key, value) VALUES (?, ?)`, s);
    });
}

module.exports = {
    initDb,
    db,
    habits: {
        getAll: () => new Promise((resolve, reject) => {
            db.all("SELECT * FROM habits WHERE is_active = 1 ORDER BY sort_order", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        }),
        create: (h) => new Promise((resolve, reject) => {
            const { name, icon, category } = h;
            db.run(`INSERT INTO habits (name, icon, category) VALUES (?, ?, ?)`, [name, icon, category], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...h });
            });
        }),
        getLogsByDate: (date) => new Promise((resolve, reject) => {
            db.all(`
                SELECT h.*, l.completed, l.value as log_value, l.note as log_note 
                FROM habits h 
                LEFT JOIN habit_logs l ON h.id = l.habit_id AND l.date = ?
                WHERE h.is_active = 1
                ORDER BY h.sort_order
            `, [date], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        }),
        upsertLog: (log) => new Promise((resolve, reject) => {
            const { habit_id, date, completed, value, note } = log;
            db.run(`
                INSERT INTO habit_logs (habit_id, date, completed, value, note)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(habit_id, date) DO UPDATE SET
                completed = excluded.completed,
                value = excluded.value,
                note = excluded.note
            `, [habit_id, date, completed, value, note], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...log });
            });
        }),
        getLogsByMonth: (year, month) => new Promise((resolve, reject) => {
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}%`;
            db.all(`
                SELECT date, SUM(completed) as completed_count, COUNT(habit_id) as total_count
                FROM habit_logs
                WHERE date LIKE ?
                GROUP BY date
            `, [monthStr], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        }),
        getStreaks: (habit_id) => new Promise((resolve, reject) => {
            // Simple streak calculation for now: count consecutive completed=1 backwards from today
            db.all(`
                SELECT date, completed FROM habit_logs 
                WHERE habit_id = ? AND date <= date('now', 'localtime')
                ORDER BY date DESC
            `, [habit_id], (err, rows) => {
                if (err) return reject(err);
                let current = 0;
                let longest = 0;
                let temp = 0;
                
                // This is a simplified version; real streak logic should handle gaps in logging
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].completed === 1) {
                        temp++;
                        if (i === current) current = temp; // Only increment current if we are still in the most recent streak
                    } else {
                        if (temp > longest) longest = temp;
                        temp = 0;
                        if (i === 0) current = 0; // If today is not done, current streak is 0
                    }
                }
                if (temp > longest) longest = temp;
                resolve({ current_streak: current, longest_streak: longest });
            });
        })
    },
    wallets: {
        getAll: () => new Promise((resolve, reject) => {
            db.all(`
                SELECT w.*, 
                (SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) 
                 FROM transactions WHERE wallet_id = w.id) as balance
                FROM wallets w 
                WHERE is_active = 1 
                ORDER BY sort_order
            `, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        }),
        getBreakdown: () => new Promise((resolve, reject) => {
            db.all(`
                SELECT w.name, w.color, w.emoji,
                (SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) 
                 FROM transactions WHERE wallet_id = w.id) as balance
                FROM wallets w
                WHERE is_active = 1
            `, (err, rows) => {
                if (err) return reject(err);
                const total = rows.reduce((sum, r) => sum + r.balance, 0);
                resolve(rows.map(r => ({ ...r, pct: total > 0 ? (r.balance / total) * 100 : 0 })));
            });
        }),
        create: (w) => new Promise((resolve, reject) => {
            const { name, color, emoji } = w;
            db.run(`INSERT INTO wallets (name, color, emoji) VALUES (?, ?, ?)`, [name, color, emoji], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...w });
            });
        })
    },
    transactions: {
        create: (t) => new Promise((resolve, reject) => {
            const { type, amount, wallet_id, category, date, time, note } = t;
            db.run(`
                INSERT INTO transactions (type, amount, wallet_id, category, date, time, note)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [type, amount, wallet_id, category, date, time, note], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, ...t });
            });
        }),
        getAll: (filters = {}) => new Promise((resolve, reject) => {
            let query = `
                SELECT t.*, w.name as wallet_name, w.color as wallet_color, w.emoji as wallet_emoji
                FROM transactions t
                JOIN wallets w ON t.wallet_id = w.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.wallet_id) {
                query += " AND t.wallet_id = ?";
                params.push(filters.wallet_id);
            }
            if (filters.type) {
                query += " AND t.type = ?";
                params.push(filters.type);
            }
            if (filters.date_from) {
                query += " AND t.date >= ?";
                params.push(filters.date_from);
            }
            if (filters.date_to) {
                query += " AND t.date <= ?";
                params.push(filters.date_to);
            }

            query += " ORDER BY t.date DESC, t.id DESC";

            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        }),
        delete: (id) => new Promise((resolve, reject) => {
            db.run("DELETE FROM transactions WHERE id = ?", [id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        })
    },
    settings: {
        getAll: () => new Promise((resolve, reject) => {
            db.all("SELECT key, value FROM settings", (err, rows) => {
                if (err) return reject(err);
                const settings = {};
                rows.forEach(row => settings[row.key] = row.value);
                resolve(settings);
            });
        }),
        set: (key, value) => new Promise((resolve, reject) => {
            db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value], (err) => {
                if (err) return reject(err);
                resolve();
            });
        })
    },
    data: {
        export: async () => {
            const tables = ['habits', 'habit_logs', 'wallets', 'transactions', 'settings'];
            const data = {};
            for (const table of tables) {
                data[table] = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM ${table}`, (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    });
                });
            }
            return data;
        },
        import: async (data) => {
            return new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    try {
                        const tables = ['habits', 'habit_logs', 'wallets', 'transactions', 'settings'];
                        tables.forEach(table => {
                            db.run(`DELETE FROM ${table}`);
                            if (data[table]) {
                                const columns = Object.keys(data[table][0]).join(', ');
                                const placeholders = Object.keys(data[table][0]).map(() => '?').join(', ');
                                const stmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);
                                data[table].forEach(row => {
                                    stmt.run(Object.values(row));
                                });
                                stmt.finalize();
                            }
                        });
                        db.run("COMMIT", (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    } catch (err) {
                        db.run("ROLLBACK");
                        reject(err);
                    }
                });
            });
        },
        reset: () => {
            return new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run("DELETE FROM transactions");
                    db.run("DELETE FROM habit_logs");
                    db.run("DELETE FROM wallets");
                    db.run("DELETE FROM habits");
                    db.run("DELETE FROM settings", (err) => {
                        if (err) return reject(err);
                        seedData();
                        resolve();
                    });
                });
            });
        }
    }
};
