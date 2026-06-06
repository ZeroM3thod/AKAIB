const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDb, db } = require('./database/db');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 600,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#111',
        show: false
    });

    win.loadFile('renderer/index.html');
    
    win.once('ready-to-show', () => {
        win.show();
    });

    // Optional: Open dev tools in development
    // win.webContents.openDevTools();
}

app.whenReady().then(async () => {
    try {
        await initDb();
        createWindow();
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
const dbService = require('./database/db');

ipcMain.handle('settings:getAll', () => dbService.settings.getAll());
ipcMain.handle('settings:set', (e, key, value) => dbService.settings.set(key, value));

ipcMain.handle('habits:getAll', () => dbService.habits.getAll());
ipcMain.handle('habits:create', (e, h) => dbService.habits.create(h));
ipcMain.handle('habits:getLogsByDate', (e, date) => dbService.habits.getLogsByDate(date));
ipcMain.handle('habits:upsertLog', (e, log) => dbService.habits.upsertLog(log));

ipcMain.handle('habits:getLogsByMonth', (e, year, month) => dbService.habits.getLogsByMonth(year, month));
ipcMain.handle('habits:getStreaks', (e, id) => dbService.habits.getStreaks(id));

ipcMain.handle('wallets:getAll', () => dbService.wallets.getAll());
ipcMain.handle('wallets:create', (e, w) => dbService.wallets.create(w));
ipcMain.handle('wallets:getBreakdown', () => dbService.wallets.getBreakdown());

ipcMain.handle('transactions:getAll', (e, filters) => dbService.transactions.getAll(filters));
ipcMain.handle('transactions:create', (e, t) => dbService.transactions.create(t));
ipcMain.handle('transactions:delete', (e, id) => dbService.transactions.delete(id));

const { dialog } = require('electron');
const fs = require('fs');

ipcMain.handle('data:export', async () => {
    const data = await dbService.data.export();
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: path.join(app.getPath('desktop'), 'dailydash-backup.json'),
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true, path: filePath };
    }
    return { success: false };
});

ipcMain.handle('data:import', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Data',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (filePaths.length > 0) {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        const data = JSON.parse(content);
        await dbService.data.import(data);
        return { success: true };
    }
    return { success: false };
});

ipcMain.handle('data:reset', () => dbService.data.reset());

ipcMain.handle('stats:getSummary', async () => {
    const wallets = await dbService.wallets.getAll();
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todaySpent = await new Promise((resolve, reject) => {
        dbService.db.get("SELECT SUM(amount) as total FROM transactions WHERE type='expense' AND date=?", [today], (err, row) => {
            if (err) return reject(err);
            resolve(row.total || 0);
        });
    });

    return { totalBalance, todaySpent };
});
