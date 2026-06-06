const TodayPage = {
    async init() {
        const today = new Date().toISOString().split('T')[0];
        const habits = await window.api.habits.getLogsByDate(today);
        const stats = await window.api.stats.getSummary();

        this.renderStats(stats);
        this.renderHabits(habits, today);
    },

    renderStats(stats) {
        document.getElementById('total-balance').textContent = stats.totalBalance.toLocaleString();
        document.getElementById('today-spent').textContent = `৳${stats.todaySpent.toLocaleString()}`;
    },

    renderHabits(habits, date) {
        const container = document.getElementById('page-content');
        
        // Group habits
        const namaz = habits.filter(h => h.category === 'namaz');
        const others = habits.filter(h => h.category !== 'namaz');

        let html = `
            <div style="padding: 20px;">
                <div id="score-banner" style="background: var(--surface); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary);">
                    <div style="font-weight: bold; margin-bottom: 5px;">Today's Score</div>
                    <div id="score-text" style="font-size: 0.9rem; color: var(--text2);">${habits.filter(h => h.completed).length} / ${habits.length} habits completed</div>
                </div>

                <div class="habit-section">
                    <h3 style="margin-bottom: 15px; color: var(--text3); font-size: 0.9rem;">🕌 Namaz (5 Prayers)</h3>
                    <div id="namaz-list">
                        ${namaz.map(h => this.getHabitRow(h, date)).join('')}
                    </div>
                </div>

                <div class="habit-section" style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; color: var(--text3); font-size: 0.9rem;">Other Habits</h3>
                    <div id="other-habits-list">
                        ${others.map(h => this.getHabitRow(h, date)).join('')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachHabitEvents(date);
    },

    getHabitRow(h, date) {
        const isWater = h.name.toLowerCase().includes('water');
        
        if (isWater) {
            return `
                <div class="habit-row" data-id="${h.id}" style="background: var(--surface); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <span style="font-size: 1.2rem; margin-right: 15px;">${h.icon}</span>
                        <div>
                            <div>${h.name}</div>
                            <div style="font-size: 0.8rem; color: var(--text3);">${h.log_value || 0} / ${h.target_value} ${h.unit}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="water-btn" data-change="-1" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 12px; border-radius: 4px; cursor: pointer;">-</button>
                        <button class="water-btn" data-change="1" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 12px; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="habit-row" data-id="${h.id}" style="background: var(--surface); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.2rem; margin-right: 15px;">${h.icon}</span>
                    <span>${h.name}</span>
                </div>
                <div class="toggle-habit ${h.completed ? 'active' : ''}" style="width: 50px; height: 26px; background: ${h.completed ? 'var(--profit)' : 'var(--surface2)'}; border-radius: 13px; position: relative; cursor: pointer; transition: 0.2s;">
                    <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 3px; ${h.completed ? 'right: 3px' : 'left: 3px'}; transition: 0.2s;"></div>
                </div>
            </div>
        `;
    },

    attachHabitEvents(date) {
        document.querySelectorAll('.toggle-habit').forEach(toggle => {
            toggle.addEventListener('click', async () => {
                const row = toggle.closest('.habit-row');
                const id = parseInt(row.dataset.id);
                const isCompleted = !toggle.classList.contains('active');
                
                // Optimistic UI
                toggle.classList.toggle('active');
                toggle.style.background = isCompleted ? 'var(--profit)' : 'var(--surface2)';
                toggle.children[0].style.left = isCompleted ? 'auto' : '3px';
                toggle.children[0].style.right = isCompleted ? '3px' : 'auto';

                await window.api.habits.upsertLog({
                    habit_id: id,
                    date: date,
                    completed: isCompleted ? 1 : 0,
                    value: isCompleted ? 1 : 0
                });

                this.updateScore();
            });
        });

        document.querySelectorAll('.water-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const row = btn.closest('.habit-row');
                const id = parseInt(row.dataset.id);
                const change = parseInt(btn.dataset.change);
                
                // We need the current value. For simplicity in this demo, we'll fetch it from the UI
                const valueLabel = row.querySelector('div div:last-child');
                let currentValue = parseInt(valueLabel.textContent.split(' / ')[0]);
                let newValue = Math.max(0, currentValue + change);
                
                // Update UI
                const target = valueLabel.textContent.split(' / ')[1];
                valueLabel.textContent = `${newValue} / ${target}`;

                await window.api.habits.upsertLog({
                    habit_id: id,
                    date: date,
                    completed: newValue > 0 ? 1 : 0,
                    value: newValue
                });

                this.updateScore();
            });
        });
    },

    updateScore() {
        const total = document.querySelectorAll('.habit-row').length;
        const completed = document.querySelectorAll('.toggle-habit.active, .habit-row:has(.water-btn)').length;
        // Note: .habit-row:has(.water-btn) is a CSS selector for water rows, but we need to check if value > 0
        // For accurate score, we should probably re-fetch or track state better.
        // Let's just do a simple count for now.
        const activeToggles = document.querySelectorAll('.toggle-habit.active').length;
        const waterRows = Array.from(document.querySelectorAll('.habit-row')).filter(r => {
            const label = r.querySelector('div div:last-child');
            return label && parseInt(label.textContent.split(' / ')[0]) > 0;
        }).length;
        
        document.getElementById('score-text').textContent = `${activeToggles + waterRows} / ${total} habits completed`;
    }
};
