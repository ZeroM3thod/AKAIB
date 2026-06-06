const FinancePage = {
    async init() {
        const stats = await window.api.stats.getSummary();
        const wallets = await window.api.wallets.getBreakdown();
        const recentTransactions = await window.api.transactions.getAll({ limit: 10 });

        this.render(stats, wallets, recentTransactions);
    },

    render(stats, wallets, recent) {
        const container = document.getElementById('page-content');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- Total Balance Hero -->
                <div style="background: var(--surface); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; border: 1px solid var(--border);">
                    <div style="color: var(--text3); font-size: 0.9rem; margin-bottom: 10px;">Total Available Balance</div>
                    <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">৳${stats.totalBalance.toLocaleString()}</div>
                    <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
                        <button onclick="TransactionModals.open('income')" style="background: var(--profit-bg); color: var(--profit); border: 1px solid var(--profit); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">+ Add Money</button>
                        <button onclick="TransactionModals.open('expense')" style="background: var(--loss-bg); color: var(--loss); border: 1px solid var(--loss); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">+ Add Expense</button>
                    </div>
                </div>

                <!-- Wallet Grid -->
                <h3 style="margin-bottom: 20px; color: var(--text3);">My Wallets</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
                    ${wallets.map(w => `
                        <div style="background: var(--surface); padding: 20px; border-radius: 10px; border-left: 4px solid ${w.color}; border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <span style="font-size: 1.2rem; margin-right: 10px;">${w.emoji}</span>
                                <span style="font-weight: bold;">${w.name}</span>
                            </div>
                            <div style="font-size: 1.2rem; margin-bottom: 5px;">৳${w.balance.toLocaleString()}</div>
                            <div style="font-size: 0.7rem; color: var(--text3);">${Math.round(w.pct)}% of total</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Recent Transactions -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--text3);">Recent Transactions</h3>
                    <button onclick="document.querySelector('[data-page=transactions]').click()" style="background: none; border: none; color: var(--primary); cursor: pointer;">See All →</button>
                </div>
                <div style="background: var(--surface); border-radius: 10px; border: 1px solid var(--border); overflow: hidden;">
                    ${recent.slice(0, 5).map(t => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; align-items: center;">
                                <div style="width: 40px; height: 40px; background: var(--surface2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 1.2rem;">
                                    ${t.type === 'income' ? '💰' : '🛒'}
                                </div>
                                <div>
                                    <div style="font-weight: bold;">${t.category}</div>
                                    <div style="font-size: 0.8rem; color: var(--text3);">${t.wallet_name} • ${t.date}</div>
                                </div>
                            </div>
                            <div style="font-weight: bold; color: ${t.type === 'income' ? 'var(--profit)' : 'var(--loss)'};">
                                ${t.type === 'income' ? '+' : '-'}৳${t.amount.toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                    ${recent.length === 0 ? '<div style="padding: 30px; text-align: center; color: var(--text3);">No transactions yet</div>' : ''}
                </div>
            </div>
        `;
    }
};
