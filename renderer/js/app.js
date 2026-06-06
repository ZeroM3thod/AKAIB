document.addEventListener('DOMContentLoaded', async () => {
    console.log('DailyDash UI Initialized');

    // Basic routing logic
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const page = tab.getAttribute('data-page');
            loadPage(page);
        });
    });

    async function loadPage(page) {
        console.log('Loading page:', page);
        switch(page) {
            case 'today':
                await TodayPage.init();
                break;
            case 'calendar':
                await CalendarPage.init();
                break;
            case 'finance':
                await FinancePage.init();
                break;
            case 'transactions':
                await TransactionsPage.init();
                break;
            case 'settings':
                await SettingsPage.init();
                break;
        }
    }

    // Load default page
    loadPage('today');

    // Update Date in UI
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-GB', dateOptions);

    window.showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.style = `
            position: fixed; bottom: 20px; right: 20px; 
            background: ${type === 'success' ? 'var(--profit)' : 'var(--loss)'}; 
            color: #000; padding: 12px 24px; border-radius: 8px; 
            font-weight: bold; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
});
