const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    settings: {
        getAll: () => ipcRenderer.invoke('settings:getAll'),
        set: (key, value) => ipcRenderer.invoke('settings:set', key, value)
    },
    habits: {
        getAll: () => ipcRenderer.invoke('habits:getAll'),
        create: (h) => ipcRenderer.invoke('habits:create', h),
        getLogsByDate: (date) => ipcRenderer.invoke('habits:getLogsByDate', date),
        getLogsByMonth: (year, month) => ipcRenderer.invoke('habits:getLogsByMonth', year, month),
        getStreaks: (id) => ipcRenderer.invoke('habits:getStreaks', id),
        upsertLog: (log) => ipcRenderer.invoke('habits:upsertLog', log)
    },
    wallets: {
        getAll: () => ipcRenderer.invoke('wallets:getAll'),
        create: (w) => ipcRenderer.invoke('wallets:create', w),
        getBreakdown: () => ipcRenderer.invoke('wallets:getBreakdown')
    },
    transactions: {
        getAll: (filters) => ipcRenderer.invoke('transactions:getAll', filters),
        create: (t) => ipcRenderer.invoke('transactions:create', t),
        delete: (id) => ipcRenderer.invoke('transactions:delete', id)
    },
    stats: {
        getSummary: () => ipcRenderer.invoke('stats:getSummary')
    },
    data: {
        export: () => ipcRenderer.invoke('data:export'),
        import: () => ipcRenderer.invoke('data:import'),
        reset: () => ipcRenderer.invoke('data:reset')
    }
});
