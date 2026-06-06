const TransactionModals = {
    async open(type = 'expense') {
        const wallets = await window.api.wallets.getAll();
        const categories = type === 'income' 
            ? ['Salary', 'Freelance', 'Gift', 'Transfer', 'Other']
            : ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Education', 'Other'];

        const modal = document.createElement('div');
        modal.id = 'transaction-modal';
        modal.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="background: var(--surface); width: 400px; border-radius: 12px; border: 1px solid var(--border); overflow: hidden;">
                <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="text-transform: capitalize;">Add ${type}</h3>
                    <button id="close-modal" style="background: none; border: none; color: var(--text3); font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text3); margin-bottom: 5px;">Amount (৳)</label>
                        <input type="number" id="t-amount" placeholder="0" autofocus style="width: 100%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 12px; border-radius: 8px; font-size: 1.2rem;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text3); margin-bottom: 5px;">Wallet</label>
                        <select id="t-wallet" style="width: 100%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 8px;">
                            ${wallets.map(w => `<option value="${w.id}">${w.emoji} ${w.name} (৳${w.balance.toLocaleString()})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text3); margin-bottom: 5px;">Category</label>
                        <select id="t-category" style="width: 100%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 8px;">
                            ${categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text3); margin-bottom: 5px;">Note (Optional)</label>
                        <input type="text" id="t-note" placeholder="What was this for?" style="width: 100%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; border-radius: 8px;">
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid var(--border); text-align: right;">
                    <button id="save-transaction" style="width: 100%; background: ${type === 'income' ? 'var(--profit)' : 'var(--loss)'}; color: #000; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">Save ${type}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('close-modal').onclick = () => modal.remove();
        document.getElementById('save-transaction').onclick = async () => {
            const amount = parseFloat(document.getElementById('t-amount').value);
            const wallet_id = parseInt(document.getElementById('t-wallet').value);
            const category = document.getElementById('t-category').value;
            const note = document.getElementById('t-note').value;

            if (!amount || amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            await window.api.transactions.create({
                type,
                amount,
                wallet_id,
                category,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                note
            });

            modal.remove();
            window.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
            
            // Refresh current page
            const activeTab = document.querySelector('.nav-tab.active').dataset.page;
            if (activeTab === 'finance') FinancePage.init();
            else if (activeTab === 'transactions') TransactionsPage.init();
            else if (activeTab === 'today') TodayPage.init();

            // Update sidebar stats
            const stats = await window.api.stats.getSummary();
            document.getElementById('total-balance').textContent = stats.totalBalance.toLocaleString();
            document.getElementById('today-spent').textContent = `৳${stats.todaySpent.toLocaleString()}`;
        };
    }
};
