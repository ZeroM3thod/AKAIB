const SettingsPage = {
    async init() {
        const habits = await window.api.habits.getAll();
        const wallets = await window.api.wallets.getAll();
        const settings = await window.api.settings.getAll();

        this.render(habits, wallets, settings);
    },

    render(habits, wallets, settings) {
        const container = document.getElementById('page-content');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="margin-bottom: 20px;">Settings</h2>
                
                <div class="settings-card" style="background: var(--surface); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">User Profile</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <label style="color: var(--text3); font-size: 0.8rem;">Your Name</label>
                        <input type="text" id="user-name-input" value="${settings.user_name}" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 8px; border-radius: 4px;">
                        <button id="save-settings-btn" style="background: var(--primary); color: #000; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px;">Save Changes</button>
                    </div>
                </div>

                <div class="settings-card" style="background: var(--surface); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Manage Habits</h3>
                        <button id="add-habit-btn" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; border-radius: 4px; cursor: pointer;">+ New Habit</button>
                    </div>
                    <div id="settings-habit-list">
                        ${habits.map(h => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border);">
                                <div style="display: flex; align-items: center;">
                                    <span style="margin-right: 15px;">${h.icon}</span>
                                    <span>${h.name}</span>
                                </div>
                                <div style="color: var(--text3); font-size: 0.8rem;">${h.category}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="settings-card" style="background: var(--surface); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Manage Wallets</h3>
                        <button id="add-wallet-btn" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 10px; border-radius: 4px; cursor: pointer;">+ New Wallet</button>
                    </div>
                    <div id="settings-wallet-list">
                        ${wallets.map(w => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border);">
                                <div style="display: flex; align-items: center;">
                                    <span style="margin-right: 15px;">${w.emoji}</span>
                                    <span>${w.name}</span>
                                </div>
                                <div style="color: var(--text3); font-size: 0.8rem;">৳${w.balance.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="settings-card" style="background: var(--surface); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">Data Management</h3>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button id="export-data-btn" style="flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 4px; cursor: pointer;">Export Data (.json)</button>
                        <button id="import-data-btn" style="flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 4px; cursor: pointer;">Import Data (.json)</button>
                    </div>
                </div>

                <div class="settings-card" style="background: var(--surface); padding: 20px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: var(--loss);">Danger Zone</h3>
                    <button id="reset-data-btn" style="background: var(--loss-bg); color: var(--loss); border: 1px solid var(--loss); padding: 10px; border-radius: 4px; cursor: pointer; width: 100%;">Reset All Data</button>
                </div>
            </div>
        `;

        this.attachEvents();
    },

    attachEvents() {
        document.getElementById('add-habit-btn').addEventListener('click', async () => {
            const name = prompt('Habit Name:');
            if (!name) return;
            const icon = prompt('Emoji Icon:', '⭐');
            await window.api.habits.create({ name, icon, category: 'custom' });
            this.init();
            window.showToast('Habit added!');
        });

        document.getElementById('add-wallet-btn').addEventListener('click', async () => {
            const name = prompt('Wallet Name:');
            if (!name) return;
            const emoji = prompt('Emoji:', '💳');
            await window.api.wallets.create({ name, emoji, color: '#8ab4f8' });
            this.init();
            window.showToast('Wallet added!');
        });
        document.getElementById('save-settings-btn').addEventListener('click', async () => {
            const name = document.getElementById('user-name-input').value;
            await window.api.settings.set('user_name', name);
            window.showToast('Settings saved!');
        });

        document.getElementById('export-data-btn').addEventListener('click', async () => {
            const res = await window.api.data.export();
            if (res.success) window.showToast(`Data exported successfully!`);
        });

        document.getElementById('import-data-btn').addEventListener('click', async () => {
            if (confirm('WARNING: This will replace ALL current data. Continue?')) {
                const res = await window.api.data.import();
                if (res.success) {
                    window.showToast('Data imported successfully!');
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        });

        document.getElementById('reset-data-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
                const confirmation = prompt('Type "RESET" to confirm:');
                if (confirmation === 'RESET') {
                    await window.api.data.reset();
                    window.showToast('Database has been reset.', 'error');
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        });
    }
};
