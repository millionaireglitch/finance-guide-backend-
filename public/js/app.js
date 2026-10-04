const API_URL = 'http://localhost:8000/api';
let token = localStorage.getItem('token');
let user = null;
let socket = null;

let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
let allTransactions = []; // cache for dashboard

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (token) {
        // Hydrate user from localStorage if possible
        const u = localStorage.getItem('user');
        if (u) {
            user = JSON.parse(u);
            showApp();
        } else {
            logout(); // token exists but no user info, force re-login
        }
    } else {
        showAuthView();
    }

    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
});

// ================= UI NAVIGATION =================
function showAuthView() {
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('app-layout').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('app-layout').style.display = 'flex';
    
    // Set UI elements based on user
    document.getElementById('sidebar-user-name').innerText = user.name;
    document.getElementById('sidebar-user-role').innerText = user.role;
    
    // Greeting
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    document.getElementById('greeting-text').innerText = `${greeting}, ${user.name.split(' ')[0]} 👋`;

    // Only show "Add Tip" if admin
    if (user.role === 'admin') {
        document.getElementById('add-tip-btn').style.display = 'block';
    }

    checkOnboarding();
    initSocket();
    navigateTo('dashboard');
}

function navigateTo(pageId) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Show correct page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.remove('open');

    // Load data for the specific page
    loadPageData(pageId);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ================= AUTHENTICATION =================
function switchAuth(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = type === 'register' ? 'block' : 'none';
    document.querySelectorAll('.auth-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-tabs .tab')[type === 'login' ? 0 : 1].classList.add('active');
    document.getElementById('auth-error').innerText = '';
}

async function handleAuth(url, body) {
    try {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const responseData = await res.json();
        
        if (res.ok) {
            const data = responseData.data || responseData;
            token = data.token;
            user = { id: data.id, name: data.name, email: data.email, role: data.role };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            showApp();
        } else {
            document.getElementById('auth-error').innerText = responseData.message || 'Authentication failed';
        }
    } catch (err) {
        document.getElementById('auth-error').innerText = 'Unable to connect to the server. Please try again.';
    }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleAuth('/auth/login', {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    });
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleAuth('/auth/register', {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    });
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    user = null;
    if (socket) socket.disconnect();
    showAuthView();
}

// ================= API CALLER =================
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (res.status === 401) {
            logout();
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

// ================= DATA LOADING =================
function loadPageData(page) {
    if (page === 'dashboard') loadDashboard();
    else if (page === 'transactions') loadTransactions();
    else if (page === 'income') loadIncome();
    else if (page === 'expenses') loadExpenses();
    else if (page === 'budgets') loadBudgets();
    else if (page === 'assets') loadAssets();
    else if (page === 'debts') loadDebts();
    else if (page === 'net-worth') loadNetWorth();
    else if (page === 'alerts') loadAlerts();
    else if (page === 'tips') loadTips();
}

// --------- FORMATTERS ---------
function formatMoney(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}
function formatDate(isoString) {
    if(!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// --------- DASHBOARD ---------
let dashChartInst = null;
async function loadDashboard() {
    // 1. Fetch Net Worth
    const nwRes = await apiCall('/net-worth');
    const netWorth = (nwRes && nwRes.data) ? nwRes.data.netWorth : 0;
    document.getElementById('dash-networth').innerText = formatMoney(netWorth);
    document.getElementById('dash-pos-networth').innerText = formatMoney(netWorth);

    // 2. Fetch Assets & Debts Total
    const assetsRes = await apiCall('/assets');
    const debtsRes = await apiCall('/debts');
    let totalAssets = 0, totalDebts = 0;
    if (assetsRes && assetsRes.data) totalAssets = assetsRes.data.reduce((sum, a) => sum + a.value, 0);
    if (debtsRes && debtsRes.data) {
        // Only sum 'active' debts
        totalDebts = debtsRes.data.filter(d => d.status === 'active').reduce((sum, d) => sum + d.amount, 0);
    }
    document.getElementById('dash-total-assets').innerText = formatMoney(totalAssets);
    document.getElementById('dash-total-debts').innerText = formatMoney(totalDebts);

    // 3. Fetch Budgets & Calculate Cash Flow
    // Dashboard focuses on the current month's flow (we get all transactions and filter them)
    const txRes = await apiCall('/transactions');
    allTransactions = (txRes && txRes.data) ? txRes.data : [];

    // Filter current month transactions for summary
    const currentMonthTx = allTransactions.filter(tx => tx.date && tx.date.startsWith(currentMonth));
    const monthlyInc = currentMonthTx.filter(tx => tx.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExp = currentMonthTx.filter(tx => tx.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = monthlyInc - monthlyExp;

    document.getElementById('dash-income').innerText = formatMoney(monthlyInc);
    document.getElementById('dash-expenses').innerText = formatMoney(monthlyExp);
    document.getElementById('dash-savings').innerText = formatMoney(savings);

    // Build Chart
    renderCashFlowChart(allTransactions);

    // Render Recent 5 Transactions
    const tbody = document.getElementById('dash-tx-tbody');
    tbody.innerHTML = '';
    if (allTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No transactions yet. Start by adding one.</td></tr>';
    } else {
        allTransactions.slice(0, 5).forEach(tx => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(tx.date)}</td>
                <td>${tx.description || '-'}</td>
                <td>${tx.category}</td>
                <td class="text-right ${tx.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Fetch Budgets
    const budRes = await apiCall(`/budgets?month=${currentMonth}`);
    const dashBudgets = document.getElementById('dash-budgets-list');
    dashBudgets.innerHTML = '';
    if (budRes && budRes.data && budRes.data.budgets.length > 0) {
        budRes.data.budgets.slice(0, 4).forEach(b => {
            const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
            let barColor = '';
            if (pct >= 100) barColor = 'danger';
            else if (pct >= 80) barColor = 'warning';

            dashBudgets.innerHTML += `
                <div class="budget-item">
                    <div class="budget-meta">
                        <span>${b.category}</span>
                        <strong>${formatMoney(b.spent)} / ${formatMoney(b.limit)} (${pct}%)</strong>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-bar ${barColor}" style="width: ${pct}%"></div>
                    </div>
                    ${pct >= 100 ? `<div class="budget-detail text-danger">Over budget</div>` : ''}
                </div>
            `;
        });
    } else {
        dashBudgets.innerHTML = '<div class="empty-state">No budgets set for this month.</div>';
    }

    // 5. Fetch Alerts
    const alertRes = await apiCall('/alerts');
    const alertsCont = document.getElementById('dash-alerts-container');
    if (alertRes && alertRes.data && alertRes.data.length > 0) {
        const topAlert = alertRes.data[0];
        alertsCont.innerHTML = `
            <div class="alert-item">
                <h4>⚠ Attention needed</h4>
                <p>${topAlert.message}</p>
            </div>
            <button class="btn outline-btn full-width text-sm" onclick="navigateTo('alerts')">View All Alerts</button>
        `;
    } else {
        alertsCont.innerHTML = `<div class="empty-state">✓ You're on track</div>`;
    }

    // 6. Fetch Tip
    const tipRes = await apiCall('/tips');
    const tipCont = document.getElementById('dash-tip-container');
    if (tipRes && tipRes.data && tipRes.data.length > 0) {
        const randomTip = tipRes.data[Math.floor(Math.random() * tipRes.data.length)];
        tipCont.innerHTML = `
            <strong class="text-primary d-block mb-1">${randomTip.title}</strong>
            <p class="text-sm">${randomTip.content}</p>
            <button class="btn text-btn mt-2" onclick="navigateTo('tips')">Read more →</button>
        `;
    } else {
        tipCont.innerHTML = `<p class="text-sm text-muted">No tips available.</p>`;
    }
}

function renderCashFlowChart(transactions) {
    // Group last 6 months of data
    const months = [];
    const incomeData = [];
    const expenseData = [];

    // Simple grouping logic: Generate last 6 months labels
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yyyy_mm = d.toISOString().slice(0, 7);
        months.push(yyyy_mm);
        incomeData.push(0);
        expenseData.push(0);
    }

    transactions.forEach(tx => {
        if(!tx.date) return;
        const txMonth = tx.date.slice(0, 7);
        const idx = months.indexOf(txMonth);
        if(idx !== -1) {
            if(tx.type === 'income') incomeData[idx] += tx.amount;
            else expenseData[idx] += tx.amount;
        }
    });

    const ctx = document.getElementById('cashFlowChart');
    if(transactions.length === 0) {
        ctx.style.display = 'none';
        document.getElementById('cashFlowEmpty').style.display = 'block';
        return;
    }
    ctx.style.display = 'block';
    document.getElementById('cashFlowEmpty').style.display = 'none';

    if(dashChartInst) dashChartInst.destroy();
    
    // Format months for display (e.g. "Oct")
    const labels = months.map(m => {
        const d = new Date(m + '-01');
        return d.toLocaleDateString('en-IN', { month: 'short' });
    });

    dashChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { 
                    label: 'Income', 
                    data: incomeData, 
                    borderColor: '#6F9CEB', 
                    backgroundColor: 'rgba(111, 156, 235, 0.1)', 
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                { 
                    label: 'Expenses', 
                    data: expenseData, 
                    borderColor: '#FE5F55', 
                    backgroundColor: 'rgba(254, 95, 85, 0.05)', 
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    border: { display: false }
                },
                x: { 
                    grid: { display: false },
                    border: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 13 } } },
                tooltip: {
                    backgroundColor: 'rgba(24, 51, 42, 0.9)',
                    padding: 12,
                    titleFont: { size: 14, family: 'Inter' },
                    bodyFont: { size: 13, family: 'Inter' },
                    callbacks: {
                        label: function(context) {
                            return ' ' + context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// --------- TRANSACTIONS PAGE ---------
async function loadTransactions() {
    const res = await apiCall('/transactions');
    const tbody = document.getElementById('page-tx-tbody');
    tbody.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions yet. Start by adding your first transaction.</td></tr>';
        return;
    }

    res.data.forEach(tx => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(tx.date)}</td>
            <td>${tx.description || '-'}</td>
            <td>${tx.category}</td>
            <td style="text-transform: capitalize;">${tx.type}</td>
            <td class="text-right ${tx.type === 'income' ? 'text-success' : 'text-danger'}">
                ${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --------- INCOME PAGE ---------
async function loadIncome() {
    const res = await apiCall('/income');
    const tbody = document.getElementById('page-income-tbody');
    tbody.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No income records found.</td></tr>';
        return;
    }
    res.data.forEach(inc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(inc.date)}</td>
            <td>${inc.source}</td>
            <td>${inc.description || '-'}</td>
            <td class="text-right text-success">+${formatMoney(inc.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --------- EXPENSES PAGE ---------
async function loadExpenses() {
    const res = await apiCall('/expenses');
    const tbody = document.getElementById('page-expenses-tbody');
    tbody.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No expense records found.</td></tr>';
        return;
    }
    res.data.forEach(exp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(exp.date)}</td>
            <td>${exp.category}</td>
            <td>${exp.description || '-'}</td>
            <td class="text-right text-danger">-${formatMoney(exp.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --------- BUDGETS PAGE ---------
async function loadBudgets() {
    const res = await apiCall(`/budgets?month=${currentMonth}`);
    const list = document.getElementById('page-budgets-list');
    list.innerHTML = '';
    
    if (res && res.data) {
        const sum = res.data.summary;
        document.getElementById('budget-page-income').innerText = formatMoney(sum.totalIncome);
        document.getElementById('budget-page-spent').innerText = formatMoney(sum.totalExpenses);
        document.getElementById('budget-page-remaining').innerText = formatMoney(sum.remaining);
        
        if (res.data.budgets.length === 0) {
            list.innerHTML = '<div class="empty-state w-100">No budgets created for this month. Create a monthly budget to start tracking your spending.</div>';
            return;
        }

        res.data.budgets.forEach(b => {
            const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
            let barColor = '';
            let statusText = `<span class="text-success">Within budget</span>`;
            if (pct >= 100) {
                barColor = 'danger';
                statusText = `<span class="text-danger">Over budget</span>`;
            } else if (pct >= 80) {
                barColor = 'warning';
            }

            list.innerHTML += `
                <div class="card mb-3">
                    <div class="budget-meta" style="font-size:15px; margin-bottom:12px;">
                        <strong>${b.category}</strong>
                        <span>${statusText}</span>
                    </div>
                    <div class="progress-bg mb-2">
                        <div class="progress-bar ${barColor}" style="width: ${pct}%"></div>
                    </div>
                    <div class="position-row mt-3 mb-0">
                        <span>Spent: <strong>${formatMoney(b.spent)}</strong></span>
                        <span>Limit: <strong>${formatMoney(b.limit)}</strong></span>
                    </div>
                </div>
            `;
        });
    }
}

// --------- ASSETS PAGE ---------
async function loadAssets() {
    const res = await apiCall('/assets');
    const tbody = document.getElementById('page-assets-tbody');
    tbody.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        document.getElementById('page-assets-total').innerText = '₹0';
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No assets added.</td></tr>';
        return;
    }

    const total = res.data.reduce((sum, a) => sum + a.value, 0);
    document.getElementById('page-assets-total').innerText = formatMoney(total);

    res.data.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(a.date)}</td>
            <td>${a.name}</td>
            <td>${a.type}</td>
            <td class="text-right">${formatMoney(a.value)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --------- DEBTS PAGE ---------
async function loadDebts() {
    const res = await apiCall('/debts');
    const tbody = document.getElementById('page-debts-tbody');
    tbody.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        document.getElementById('page-debts-total').innerText = '₹0';
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No debts added.</td></tr>';
        return;
    }

    const total = res.data.filter(d => d.status === 'active').reduce((sum, a) => sum + a.amount, 0);
    document.getElementById('page-debts-total').innerText = formatMoney(total);

    res.data.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.name}</td>
            <td style="text-transform:capitalize;">
                <span style="color:${d.status==='active' ? 'var(--danger)' : 'var(--success)'}">${d.status}</span>
            </td>
            <td>${d.interestRate}%</td>
            <td>${formatDate(d.dueDate)}</td>
            <td class="text-right">${formatMoney(d.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --------- NET WORTH PAGE ---------
let nwChartInst = null;
async function loadNetWorth() {
    const nwRes = await apiCall('/net-worth');
    document.getElementById('page-nw-total').innerText = formatMoney(nwRes?.data?.netWorth || 0);

    const assetsRes = await apiCall('/assets');
    const debtsRes = await apiCall('/debts');
    let totalAssets = 0, totalDebts = 0;
    if (assetsRes && assetsRes.data) totalAssets = assetsRes.data.reduce((sum, a) => sum + a.value, 0);
    if (debtsRes && debtsRes.data) totalDebts = debtsRes.data.filter(d => d.status === 'active').reduce((sum, d) => sum + d.amount, 0);
    
    document.getElementById('page-nw-assets').innerText = formatMoney(totalAssets);
    document.getElementById('page-nw-debts').innerText = formatMoney(totalDebts);

    // History Chart
    const histRes = await apiCall('/net-worth/history');
    const ctx = document.getElementById('nwHistoryChart');
    if (!histRes || !histRes.data || histRes.data.length === 0) {
        ctx.style.display = 'none';
        document.getElementById('nwHistoryEmpty').style.display = 'block';
        return;
    }
    
    ctx.style.display = 'block';
    document.getElementById('nwHistoryEmpty').style.display = 'none';
    if(nwChartInst) nwChartInst.destroy();

    const history = histRes.data.sort((a,b) => new Date(a.date) - new Date(b.date)); // Chronological
    const labels = history.map(h => formatDate(h.date));
    const dataPoints = history.map(h => h.netWorth);

    nwChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Net Worth',
                data: dataPoints,
                borderColor: '#DB5ABA',
                backgroundColor: 'rgba(219, 90, 186, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: '#E3E8E4' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// --------- ALERTS PAGE ---------
async function loadAlerts() {
    const res = await apiCall('/alerts');
    const list = document.getElementById('page-alerts-list');
    list.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        list.innerHTML = '<div class="empty-state w-100">✓ You\'re on track. No overspending detected.</div>';
        return;
    }

    res.data.forEach(a => {
        list.innerHTML += `
            <div class="alert-item">
                <div class="d-flex justify-content-between mb-2">
                    <h4>⚠ Attention needed</h4>
                    <small class="text-muted">${formatDate(a.createdAt)}</small>
                </div>
                <p>${a.message}</p>
            </div>
        `;
    });
}

async function checkAlerts() {
    await apiCall('/alerts/check', 'POST');
    loadAlerts(); // Refresh UI
}

// --------- TIPS PAGE ---------
async function loadTips() {
    const res = await apiCall('/tips');
    const list = document.getElementById('page-tips-list');
    list.innerHTML = '';
    
    if(!res || !res.data || res.data.length === 0) {
        list.innerHTML = '<div class="empty-state w-100">No financial tips available at the moment.</div>';
        return;
    }

    res.data.forEach(t => {
        const cat = t.category.toLowerCase();
        let badgeColor = 'var(--primary)';
        if (cat.includes('myth')) badgeColor = 'var(--danger)';
        else if (cat.includes('book')) badgeColor = 'var(--warning)'; // Gold color for books
        
        list.innerHTML += `
            <div class="tip-item">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="background:${badgeColor}; color:white; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:600;">${t.category.toUpperCase()}</span>
                </div>
                <h4>${t.title}</h4>
                <p class="mt-2">${t.content}</p>
            </div>
        `;
    });
}


// ================= MODALS & FORMS =================
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// 1. Transaction Form
function toggleTxFields() {
    const type = document.getElementById('modal-tx-type').value;
    document.getElementById('modal-tx-cat').placeholder = type === 'income' ? 'Source (e.g. Salary)' : 'Category (e.g. Food)';
}
document.getElementById('form-transaction').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('modal-tx-type').value;
    const body = {
        type,
        category: document.getElementById('modal-tx-cat').value,
        amount: Number(document.getElementById('modal-tx-amt').value),
        description: document.getElementById('modal-tx-desc').value,
        date: document.getElementById('modal-tx-date').value
    };
    await apiCall('/transactions', 'POST', body);
    
    // Also log in Income/Expense specifically to fulfill case study logic
    if (type === 'income') {
        await apiCall('/income', 'POST', { amount: body.amount, source: body.category, description: body.description, date: body.date });
    } else {
        await apiCall('/expenses', 'POST', { amount: body.amount, category: body.category, description: body.description, date: body.date });
    }

    closeModal('modal-transaction');
    e.target.reset();
    
    // Refresh dashboard if we are there, otherwise transactions
    if (document.getElementById('page-dashboard').classList.contains('active')) loadDashboard();
    if (document.getElementById('page-transactions').classList.contains('active')) loadTransactions();
});

// 2. Income Form
document.getElementById('form-income').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        amount: Number(document.getElementById('modal-inc-amt').value),
        source: document.getElementById('modal-inc-source').value,
        description: document.getElementById('modal-inc-desc').value,
        date: document.getElementById('modal-inc-date').value
    };
    await apiCall('/income', 'POST', body);
    // Also create matching transaction record for unification
    await apiCall('/transactions', 'POST', { type: 'income', category: body.source, amount: body.amount, description: body.description, date: body.date });
    
    closeModal('modal-income');
    e.target.reset();
    loadIncome();
});

// 3. Expense Form
document.getElementById('form-expense').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        amount: Number(document.getElementById('modal-exp-amt').value),
        category: document.getElementById('modal-exp-cat').value,
        description: document.getElementById('modal-exp-desc').value,
        date: document.getElementById('modal-exp-date').value
    };
    await apiCall('/expenses', 'POST', body);
    // Also create matching transaction record
    await apiCall('/transactions', 'POST', { type: 'expense', category: body.category, amount: body.amount, description: body.description, date: body.date });
    
    closeModal('modal-expense');
    e.target.reset();
    loadExpenses();
});

// 4. Budget Form
document.getElementById('form-budget').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        category: document.getElementById('modal-bud-cat').value,
        limit: Number(document.getElementById('modal-bud-limit').value),
        month: document.getElementById('modal-bud-month').value
    };
    await apiCall('/budgets', 'POST', body);
    closeModal('modal-budget');
    e.target.reset();
    if (document.getElementById('page-budgets').classList.contains('active')) loadBudgets();
    if (document.getElementById('page-dashboard').classList.contains('active')) loadDashboard();
});

// 5. Asset Form
document.getElementById('form-asset').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        name: document.getElementById('modal-asset-name').value,
        type: document.getElementById('modal-asset-type').value,
        value: Number(document.getElementById('modal-asset-val').value)
    };
    await apiCall('/assets', 'POST', body);
    closeModal('modal-asset');
    e.target.reset();
    
    // Auto-update net worth
    await apiCall('/net-worth');
    if (document.getElementById('page-assets').classList.contains('active')) loadAssets();
});

// 6. Debt Form
document.getElementById('form-debt').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        name: document.getElementById('modal-debt-name').value,
        amount: Number(document.getElementById('modal-debt-amt').value),
        interestRate: Number(document.getElementById('modal-debt-int').value),
        status: 'active'
    };
    await apiCall('/debts', 'POST', body);
    closeModal('modal-debt');
    e.target.reset();
    
    // Auto-update net worth
    await apiCall('/net-worth');
    if (document.getElementById('page-debts').classList.contains('active')) loadDebts();
});

// 7. Tip Form (Admin)
document.getElementById('form-tip').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        title: document.getElementById('modal-tip-title').value,
        category: document.getElementById('modal-tip-cat').value,
        content: document.getElementById('modal-tip-content').value,
    };
    await apiCall('/tips', 'POST', body);
    closeModal('modal-tip');
    e.target.reset();
    if (document.getElementById('page-tips').classList.contains('active')) loadTips();
});

// 8. Simulator Form (Investments Page)
document.getElementById('sim-form-full').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        initialInvestment: Number(document.getElementById('sim-full-initial').value),
        monthlyContribution: Number(document.getElementById('sim-full-monthly').value),
        years: Number(document.getElementById('sim-full-years').value),
        riskProfile: document.getElementById('sim-full-risk').value
    };
    
    const data = await apiCall('/investments/simulate', 'POST', body);
    if(data) {
        document.getElementById('sim-full-result').style.display = 'block';
        document.getElementById('sim-full-proj').innerText = formatMoney(data.projectedValue);
        document.getElementById('sim-full-inv').innerText = formatMoney(data.totalInvested);
        document.getElementById('sim-full-growth').innerText = formatMoney(data.estimatedGain);
        document.getElementById('sim-full-risk-val').innerText = document.getElementById('sim-full-risk').options[document.getElementById('sim-full-risk').selectedIndex].text.split(' ')[0];
    }
});

// ================= MONEY LAWS CALCULATORS =================
function calc503020() {
    const inc = Number(document.getElementById('law-50-input').value);
    if (!inc) return;
    document.getElementById('law-res-needs').innerText = formatMoney(inc * 0.5);
    document.getElementById('law-res-wants').innerText = formatMoney(inc * 0.3);
    document.getElementById('law-res-savings').innerText = formatMoney(inc * 0.2);
    document.getElementById('law-50-result').style.display = 'block';
}

function calcRule72() {
    const rate = Number(document.getElementById('law-72-input').value);
    if (!rate || rate <= 0) return;
    const years = (72 / rate).toFixed(1);
    document.getElementById('law-res-72').innerText = `${years} Years`;
    document.getElementById('law-72-result').style.display = 'block';
}

function calc4Percent() {
    const monthlyExp = Number(document.getElementById('law-4-input').value);
    if (!monthlyExp) return;
    const portfolio = monthlyExp * 12 * 25;
    document.getElementById('law-res-4').innerText = formatMoney(portfolio);
    document.getElementById('law-4-result').style.display = 'block';
}

// ================= SOCKET.IO =================
function initSocket() {
    if (socket) socket.disconnect();
    
    socket = io('http://localhost:8000', {
        auth: { token: token }
    });

    socket.on('overspendingAlert', (data) => {
        alert(`🚨 OVERSPENDING ALERT!\n\n${data.message}`);
        if (document.getElementById('page-alerts').classList.contains('active')) loadAlerts();
    });
}

// ================= ONBOARDING WIZARD =================
function checkOnboarding() {
    const plan = localStorage.getItem('plan_' + user.email);
    if (!plan) {
        document.getElementById('onboarding-wizard').style.display = 'flex';
    } else {
        document.getElementById('sidebar-user-role').innerHTML = `${user.role} &bull; <strong style="color:var(--warning)">${plan}</strong>`;
    }
}

function obNext(step) {
    document.querySelectorAll('[id^="ob-step-"]').forEach(el => el.style.display = 'none');
    document.getElementById('ob-step-' + step).style.display = 'block';
}

function obFinish() {
    const status = document.getElementById('ob-status').value;
    const title = document.getElementById('ob-plan-title');
    const desc = document.getElementById('ob-plan-desc');
    
    let planName = '';
    if (status === 'beginner') {
        planName = 'Free Plan';
        title.innerText = 'Free Plan Unlocked!';
        title.style.color = 'var(--primary)';
        desc.innerText = 'Since you are just starting out, we assigned you the Free Plan. You get full access to expense tracking, hacks, and money laws!';
    } else {
        planName = 'Premium Plan 👑';
        title.innerText = 'Premium Plan Unlocked! 👑';
        title.style.color = 'var(--warning)';
        desc.innerText = 'Since you are generating income, we upgraded you to Premium! You will get priority access to our upcoming tax algorithms and AI features.';
    }
    
    localStorage.setItem('plan_' + user.email, planName);
    obNext(5);
}

function closeOnboarding() {
    document.getElementById('onboarding-wizard').style.display = 'none';
    const plan = localStorage.getItem('plan_' + user.email);
    document.getElementById('sidebar-user-role').innerHTML = `${user.role} &bull; <strong style="color:var(--warning)">${plan}</strong>`;
    
    // Feature redirection logic
    const futureFeature = document.getElementById('ob-future').value;
    if (futureFeature === 'ai_stock') {
        navigateTo('stocks');
    }
}
