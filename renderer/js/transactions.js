const TransactionsPage = {
    filters: {
        period: 'month',
        type: 'all',
        wallet_id: null
    },

    async init() {
        await this.render();
    },

    async render() {
        const filters = this.getFilterDates();
        const transactions = await window.api.transactions.getAll({
            ...filters,
            type: this.filters.type === 'all' ? null : this.filters.type,
            wallet_id: this.filters.wallet_id
        });

        const wallets = await window.api.wallets.getAll();
        const container = document.getElementById('page-content');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Transactions</h2>
                    <button onclick="TransactionModals.open('expense')" style="background: var(--primary); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">+ New Transaction</button>
                </div>

                <!-- Filter Bar -->
                <div style="background: var(--surface); padding: 15px; border-radius: 8px; border: 1px solid var(--border); display: flex; gap: 20px; margin-bottom: 30px; align-items: center; overflow-x: auto;">
                    <div style="display: flex; background: var(--surface2); border-radius: 6px; padding: 4px;">
                        ${['today', 'week', 'month', 'all'].map(p => `
                            <button onclick="TransactionsPage.setFilter('period', '${p}')" style="background: ${this.filters.period === p ? 'var(--primary)' : 'transparent'}; color: ${this.filters.period === p ? '#000' : 'var(--text2)'}; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; text-transform: capitalize;">${p}</button>
                        `).join('')}
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <select onchange="TransactionsPage.setFilter('type', this.value)" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem;">
                            <option value="all" ${this.filters.type === 'all' ? 'selected' : ''}>All Types</option>
                            <option value="income" ${this.filters.type === 'income' ? 'selected' : ''}>Income</option>
                            <option value="expense" ${this.filters.type === 'expense' ? 'selected' : ''}>Expense</option>
                        </select>

                        <select onchange="TransactionsPage.setFilter('wallet_id', this.value)" style="background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem;">
                            <option value="">All Wallets</option>
                            ${wallets.map(w => `<option value="${w.id}" ${this.filters.wallet_id == w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Transaction List -->
                <div style="background: var(--surface); border-radius: 10px; border: 1px solid var(--border); overflow: hidden;">
                    ${this.renderList(transactions)}
                </div>
            </div>
        `;
    },

    renderList(transactions) {
        if (transactions.length === 0) {
            return '<div style="padding: 40px; text-align: center; color: var(--text3);">No transactions found for this period</div>';
        }

        // Group by date
        const groups = {};
        transactions.forEach(t => {
            if (!groups[t.date]) groups[t.date] = [];
            groups[t.date].push(t);
        });

        return Object.keys(groups).map(date => `
            <div style="background: var(--surface2); padding: 10px 20px; font-size: 0.8rem; color: var(--text3); border-bottom: 1px solid var(--border); font-weight: bold;">
                ${date}
            </div>
            ${groups[date].map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid var(--border); position: relative;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 36px; height: 36px; background: var(--surface2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                            ${t.type === 'income' ? '💰' : '🛒'}
                        </div>
                        <div>
                            <div style="font-weight: bold;">${t.category}</div>
                            <div style="font-size: 0.7rem; color: var(--text3);">${t.wallet_name} ${t.note ? `• ${t.note}` : ''}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="font-weight: bold; color: ${t.type === 'income' ? 'var(--profit)' : 'var(--loss)'};">
                            ${t.type === 'income' ? '+' : '-'}৳${t.amount.toLocaleString()}
                        </div>
                        <button onclick="TransactionsPage.deleteTransaction(${t.id})" style="background: none; border: none; color: var(--loss); cursor: pointer; padding: 5px; opacity: 0.5; transition: 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5">🗑️</button>
                    </div>
                </div>
            `).join('')}
        `).join('');
    },

    getFilterDates() {
        const today = new Date();
        let date_from = null;
        
        if (this.filters.period === 'today') {
            date_from = today.toISOString().split('T')[0];
        } else if (this.filters.period === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            date_from = weekAgo.toISOString().split('T')[0];
        } else if (this.filters.period === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            date_from = monthAgo.toISOString().split('T')[0];
        }

        return { date_from };
    },

    async setFilter(key, value) {
        this.filters[key] = value === '' ? null : value;
        await this.render();
    },

    async deleteTransaction(id) {
        if (confirm('Delete this transaction?')) {
            await window.api.transactions.delete(id);
            window.showToast('Transaction deleted', 'error');
            await this.render();
            // Also update sidebar stats
            const stats = await window.api.stats.getSummary();
            document.getElementById('total-balance').textContent = stats.totalBalance.toLocaleString();
            document.getElementById('today-spent').textContent = `৳${stats.todaySpent.toLocaleString()}`;
        }
    }
};
