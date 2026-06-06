const CalendarPage = {
    currentDate: new Date(),
    
    async init() {
        await this.render();
    },

    async render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthName = this.currentDate.toLocaleString('default', { month: 'long' });

        const monthlyLogs = await window.api.habits.getLogsByMonth(year, month);
        const logsMap = {};
        monthlyLogs.forEach(log => {
            logsMap[log.date] = (log.completed_count / log.total_count) * 100;
        });

        const container = document.getElementById('page-content');
        
        container.innerHTML = `
            <div style="padding: 20px; display: flex; flex-direction: column; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 id="calendar-month-year">${monthName} ${year}</h2>
                    <div style="display: flex; gap: 10px;">
                        <button id="prev-month" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 15px; border-radius: 4px; cursor: pointer;">< Prev</button>
                        <button id="today-month" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 15px; border-radius: 4px; cursor: pointer;">Today</button>
                        <button id="next-month" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 5px 15px; border-radius: 4px; cursor: pointer;">Next ></button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); flex: 1;">
                    ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => `
                        <div style="background: var(--surface); padding: 10px; text-align: center; font-size: 0.8rem; color: var(--text3); font-weight: bold;">${day}</div>
                    `).join('')}
                    ${this.generateCalendarGrid(year, month, logsMap)}
                </div>
            </div>
        `;

        this.attachEvents();
    },

    generateCalendarGrid(year, month, logsMap) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        let cells = [];

        // Previous month padding
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push(`<div style="background: var(--bg); color: var(--text3); padding: 10px; opacity: 0.3;">${prevMonthDays - i}</div>`);
        }

        // Current month days
        const todayStr = new Date().toISOString().split('T')[0];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const completion = logsMap[dateStr] || 0;
            const isToday = dateStr === todayStr;
            
            let bgColor = 'var(--surface)';
            if (completion >= 100) bgColor = 'var(--profit)';
            else if (completion >= 70) bgColor = 'rgba(129, 201, 149, 0.4)';
            else if (completion >= 40) bgColor = 'rgba(253, 214, 99, 0.4)';
            else if (completion > 0) bgColor = 'rgba(242, 139, 130, 0.4)';

            cells.push(`
                <div class="calendar-day" data-date="${dateStr}" style="background: ${bgColor}; padding: 10px; cursor: pointer; transition: 0.2s; position: relative; min-height: 80px; border: 1px solid transparent;">
                    <div style="${isToday ? 'background: var(--primary); color: #000; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold;' : ''}">${d}</div>
                    ${completion > 0 ? `<div style="font-size: 0.7rem; margin-top: 5px; color: var(--text2);">${Math.round(completion)}% done</div>` : ''}
                </div>
            `);
        }

        // Next month padding
        const remaining = 42 - cells.length;
        for (let i = 1; i <= remaining; i++) {
            cells.push(`<div style="background: var(--bg); color: var(--text3); padding: 10px; opacity: 0.3;">${i}</div>`);
        }

        return cells.join('');
    },

    attachEvents() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
        document.getElementById('today-month').addEventListener('click', () => {
            this.currentDate = new Date();
            this.render();
        });

        document.querySelectorAll('.calendar-day').forEach(cell => {
            cell.addEventListener('click', () => {
                this.openDayDetail(cell.dataset.date);
            });
        });
    },

    async openDayDetail(date) {
        const habits = await window.api.habits.getLogsByDate(date);
        
        const modal = document.createElement('div');
        modal.id = 'day-detail-modal';
        modal.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="background: var(--surface); width: 400px; max-height: 80%; border-radius: 8px; border: 1px solid var(--border); display: flex; flex-direction: column;">
                <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1rem;">${new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <button id="close-modal" style="background: none; border: none; color: var(--text3); font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    ${habits.map(h => `
                        <div class="modal-habit-row" data-id="${h.id}" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center;">
                                <span style="margin-right: 15px;">${h.icon}</span>
                                <span>${h.name}</span>
                            </div>
                            <input type="checkbox" ${h.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                        </div>
                    `).join('')}
                </div>
                <div style="padding: 20px; border-top: 1px solid var(--border); text-align: right;">
                    <button id="save-modal" style="background: var(--primary); color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('close-modal').onclick = () => modal.remove();
        document.getElementById('save-modal').onclick = async () => {
            const rows = modal.querySelectorAll('.modal-habit-row');
            for (let row of rows) {
                const habit_id = parseInt(row.dataset.id);
                const completed = row.querySelector('input').checked ? 1 : 0;
                await window.api.habits.upsertLog({
                    habit_id,
                    date,
                    completed,
                    value: completed, // Simplified
                    note: ''
                });
            }
            modal.remove();
            this.render(); // Refresh calendar colors
        };
    }
};
