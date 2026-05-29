/* ===================================
   FINANCE TRACKER - JAVASCRIPT
   Beginner-Friendly Finance Management App
   =================================== */

// ===================================
// STATE MANAGEMENT
// ===================================

// Global object to store all app data
const app = {
    transactions: [],
    goals: [],
    theme: 'light',
    charts: {
        pie: null,
        doughnut: null,
        line: null
    }
};

// Chart colors array
const chartColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316'
];

// Category configurations
const categoryConfig = {
    income: ['Salary', 'Freelance', 'Business', 'Gifts'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health']
};

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadFromStorage();
    
    // Set initial theme
    applyTheme();
    
    // Initialize date input with today's date
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('editDate').valueAsDate = new Date();
    
    // Create month selector
    populateMonthSelector();
    
    // Do NOT generate sample data - start with clean dashboard
    // if (app.transactions.length === 0) {
    //     generateSampleData();
    // }
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial UI
    updateDashboard();
}

// ===================================
// EVENT LISTENERS SETUP
// ===================================

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });
    
    // Quick actions
    document.getElementById('quickAddIncome').addEventListener('click', () => {
        switchSection('transactions');
        document.getElementById('transactionType').value = 'income';
        updateCategorySelect('income');
    });
    
    document.getElementById('quickAddExpense').addEventListener('click', () => {
        switchSection('transactions');
        document.getElementById('transactionType').value = 'expense';
        updateCategorySelect('expense');
    });
    
    document.getElementById('quickAddGoal').addEventListener('click', () => {
        switchSection('goals');
    });
    
    // Forms
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);
    document.getElementById('transactionType').addEventListener('change', (e) => {
        updateCategorySelect(e.target.value);
    });
    
    document.getElementById('goalForm').addEventListener('submit', handleAddGoal);
    document.getElementById('editForm').addEventListener('submit', handleEditTransaction);
    
    // Filters
    document.getElementById('searchInput').addEventListener('input', filterTransactions);
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // Export and Clear
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('clearAllBtn').addEventListener('click', confirmClearAll);
    
    // Month selector
    document.getElementById('monthSelect').addEventListener('change', updateMonthlySummary);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
}

// ===================================
// NAVIGATION & SECTIONS
// ===================================

function handleNavigation(e) {
    const section = e.target.dataset.section;
    switchSection(section);
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.classList.add('active');
    }
    
    // Mark nav button as active
    const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Refresh charts if analytics section
    if (sectionName === 'analytics') {
        setTimeout(() => {
            updateCharts();
        }, 100);
    }
}

// ===================================
// TRANSACTION MANAGEMENT
// ===================================

function handleAddTransaction(e) {
    e.preventDefault();
    
    // Get form values
    const type = document.getElementById('transactionType').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    // Validation
    if (!type || !category || !amount || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(),
        type,
        category,
        amount,
        date,
        description,
        timestamp: new Date()
    };
    
    // Add to app state
    app.transactions.unshift(transaction);
    
    // Save and update UI
    saveToStorage();
    updateDashboard();
    updateCharts();
    
    // Reset form
    document.getElementById('transactionForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    
    showToast('Transaction added successfully!', 'success');
}

function editTransaction(transactionId) {
    const transaction = app.transactions.find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    // Populate edit form
    document.getElementById('editType').value = transaction.type;
    document.getElementById('editCategory').value = transaction.category;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editDate').value = transaction.date;
    document.getElementById('editDescription').value = transaction.description;
    
    // Store current transaction ID
    document.getElementById('editForm').dataset.transactionId = transactionId;
    
    // Show modal
    const modal = document.getElementById('editModal');
    modal.classList.add('show');
}

function handleEditTransaction(e) {
    e.preventDefault();
    
    const transactionId = parseInt(document.getElementById('editForm').dataset.transactionId);
    const category = document.getElementById('editCategory').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const date = document.getElementById('editDate').value;
    const description = document.getElementById('editDescription').value;
    
    // Validation
    if (!category || !amount || !date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    // Find and update transaction
    const transaction = app.transactions.find(t => t.id === transactionId);
    if (transaction) {
        transaction.category = category;
        transaction.amount = amount;
        transaction.date = date;
        transaction.description = description;
    }
    
    // Save and update UI
    saveToStorage();
    updateDashboard();
    updateCharts();
    closeEditModal();
    
    showToast('Transaction updated successfully!', 'success');
}

function deleteTransaction(transactionId) {
    showConfirmModal(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        () => {
            app.transactions = app.transactions.filter(t => t.id !== transactionId);
            saveToStorage();
            updateDashboard();
            updateCharts();
            showToast('Transaction deleted successfully', 'success');
        }
    );
}

// ===================================
// SAVINGS GOALS MANAGEMENT
// ===================================

function handleAddGoal(e) {
    e.preventDefault();
    
    const name = document.getElementById('goalName').value;
    const targetAmount = parseFloat(document.getElementById('targetAmount').value);
    const category = document.getElementById('goalCategory').value;
    
    // Validation
    if (!name || !targetAmount) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (targetAmount <= 0) {
        showToast('Target amount must be greater than 0', 'error');
        return;
    }
    
    // Create goal object
    const goal = {
        id: Date.now(),
        name,
        targetAmount,
        category: category || 'General',
        createdDate: new Date().toISOString(),
        savedAmount: 0
    };
    
    // Add to app state
    app.goals.push(goal);
    
    // Save and update UI
    saveToStorage();
    renderGoals();
    updateCharts();
    
    // Reset form
    document.getElementById('goalForm').reset();
    
    showToast('Savings goal created successfully!', 'success');
}

function deleteGoal(goalId) {
    showConfirmModal(
        'Delete Goal',
        'Are you sure you want to delete this goal?',
        () => {
            app.goals = app.goals.filter(g => g.id !== goalId);
            saveToStorage();
            renderGoals();
            updateCharts();
            showToast('Goal deleted successfully', 'success');
        }
    );
}

// Calculate total saved amount for all goals
function getTotalSavedForGoals() {
    return app.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

// ===================================
// DASHBOARD & UI UPDATES
// ===================================

function updateDashboard() {
    // Calculate totals
    const totalIncome = app.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = app.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Update summary cards with animation
    animateCounter('totalBalance', balance);
    animateCounter('totalIncome', totalIncome);
    animateCounter('totalExpenses', totalExpenses);
    
    // Update transaction counts
    const incomeCount = app.transactions.filter(t => t.type === 'income').length;
    const expenseCount = app.transactions.filter(t => t.type === 'expense').length;
    
    document.getElementById('incomeCount').textContent = `${incomeCount} transactions`;
    document.getElementById('expenseCount').textContent = `${expenseCount} transactions`;
    
    // Calculate and display savings rate
    if (totalIncome > 0) {
        const savings = totalIncome - totalExpenses;
        const savingsRate = Math.round((savings / totalIncome) * 100);
        document.getElementById('savingsRate').textContent = savingsRate + '%';
    } else {
        document.getElementById('savingsRate').textContent = '0%';
    }
    
    // Render recent transactions
    renderRecentTransactions();
    
    // Render all transactions
    renderTransactions();
    
    // Render goals
    renderGoals();
    
    // Update monthly summary
    updateMonthlySummary();
}

// Animate number counter for balance display
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    const prefix = element.classList.contains('income') ? '+' : element.classList.contains('expense') ? '-' : '';
    const startValue = 0;
    const duration = 500;
    const steps = 30;
    const stepValue = (finalValue - startValue) / steps;
    let currentStep = 0;
    
    const counter = setInterval(() => {
        currentStep++;
        const value = startValue + stepValue * currentStep;
        element.textContent = prefix + formatCurrency(Math.max(0, value));
        
        if (currentStep >= steps) {
            clearInterval(counter);
            element.textContent = prefix + formatCurrency(finalValue);
        }
    }, duration / steps);
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    
    // Get 5 most recent transactions
    const recent = app.transactions.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No transactions yet. Start by adding your first transaction!</p></div>';
        return;
    }
    
    container.innerHTML = recent.map(transaction => createTransactionHTML(transaction)).join('');
    
    // Add event listeners
    attachTransactionListeners();
}

function renderTransactions() {
    const container = document.getElementById('transactionsList');
    
    if (app.transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💼</div><p>No transactions found. Add your first transaction!</p></div>';
        return;
    }
    
    container.innerHTML = app.transactions.map(transaction => createTransactionHTML(transaction)).join('');
    
    // Add event listeners
    attachTransactionListeners();
}

function createTransactionHTML(transaction) {
    const isIncome = transaction.type === 'income';
    const icon = isIncome ? '📈' : '📉';
    const amountClass = isIncome ? 'income' : 'expense';
    const amountPrefix = isIncome ? '+' : '-';
    
    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-info">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-description">${transaction.description || 'No description'}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="transaction-btn edit-btn" title="Edit transaction">✏️</button>
                <button class="transaction-btn delete-btn" title="Delete transaction">🗑️</button>
            </div>
        </div>
    `;
}

function attachTransactionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.closest('.transaction-item');
            const id = parseInt(item.dataset.id);
            editTransaction(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.closest('.transaction-item');
            const id = parseInt(item.dataset.id);
            deleteTransaction(id);
        });
    });
}

// ===================================
// GOALS RENDERING
// ===================================

function renderGoals() {
    const container = document.getElementById('goalsList');
    
    if (app.goals.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p>No savings goals yet. Create your first goal to start tracking!</p></div>';
        return;
    }
    
    const totalSaved = getTotalSavedForGoals();
    
    container.innerHTML = app.goals.map((goal, index) => {
        const progress = Math.min(totalSaved, goal.targetAmount);
        const progressPercent = (progress / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - progress;
        
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div>
                        <div class="goal-title">${goal.name}</div>
                        <div class="goal-category">${goal.category}</div>
                    </div>
                    <button class="goal-delete" data-id="${goal.id}" title="Delete goal">✕</button>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${formatCurrency(progress)} of ${formatCurrency(goal.targetAmount)}</span>
                        <span>${Math.round(progressPercent)}%</span>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
                        ${remaining > 0 ? `${formatCurrency(remaining)} remaining` : '🎉 Goal reached!'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add delete listeners
    document.querySelectorAll('.goal-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = parseInt(e.target.dataset.id);
            deleteGoal(goalId);
        });
    });
}

// ===================================
// CHARTS & ANALYTICS
// ===================================

function updateCharts() {
    updateExpensePieChart();
    updateGoalsProgressChart();
    updateIncomeExpenseChart();
    updateCategoryBreakdown();
}

function updateExpensePieChart() {
    // Aggregate expenses by category
    const expensesByCategory = {};
    app.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    if (categories.length === 0) {
        categories.push('No Data');
        amounts.push(1);
    }
    
    const ctx = document.getElementById('expensePieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (app.charts.pie) {
        app.charts.pie.destroy();
    }
    
    app.charts.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: chartColors.slice(0, categories.length),
                borderColor: 'var(--card-bg)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-primary)',
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

function updateGoalsProgressChart() {
    const goalNames = app.goals.map(g => g.name);
    const targetAmounts = app.goals.map(g => g.targetAmount);
    const totalSaved = getTotalSavedForGoals();
    const savedAmounts = app.goals.map(() => totalSaved);
    
    if (goalNames.length === 0) {
        goalNames.push('No Goals');
        targetAmounts.push(1);
        savedAmounts.push(0);
    }
    
    const ctx = document.getElementById('goalsProgressChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (app.charts.doughnut) {
        app.charts.doughnut.destroy();
    }
    
    app.charts.doughnut = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: goalNames,
            datasets: [
                {
                    label: 'Target Amount',
                    data: targetAmounts,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'Saved Amount',
                    data: savedAmounts,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--text-primary)',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.x);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' }
                },
                y: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' }
                }
            }
        }
    });
}

function updateIncomeExpenseChart() {
    // Get last 6 months of data
    const months = getLastSixMonths();
    const monthlyData = {};
    
    months.forEach(month => {
        monthlyData[month] = { income: 0, expense: 0 };
    });
    
    app.transactions.forEach(t => {
        const month = formatMonthYear(t.date);
        if (monthlyData[month]) {
            if (t.type === 'income') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        }
    });
    
    const incomeData = months.map(m => monthlyData[m].income);
    const expenseData = months.map(m => monthlyData[m].expense);
    
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (app.charts.line) {
        app.charts.line.destroy();
    }
    
    app.charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--text-primary)',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' },
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.value);
                        }
                    }
                },
                x: {
                    ticks: { color: 'var(--text-primary)' },
                    grid: { color: 'var(--border-color)' }
                }
            }
        }
    });
}

function updateCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    
    // Aggregate by category
    const categoryData = {};
    app.transactions.forEach(t => {
        if (!categoryData[t.category]) {
            categoryData[t.category] = { count: 0, amount: 0, type: t.type };
        }
        categoryData[t.category].count++;
        categoryData[t.category].amount += t.amount;
    });
    
    if (Object.keys(categoryData).length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No data available</p></div>';
        return;
    }
    
    let colorIndex = 0;
    container.innerHTML = Object.entries(categoryData)
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([category, data]) => {
            const className = `cat-${(colorIndex % chartColors.length) + 1}`;
            colorIndex++;
            return `
                <div class="category-item ${className}">
                    <div class="category-name">${category}</div>
                    <div class="category-stats">
                        <div class="category-stat">
                            <div class="category-stat-label">Amount</div>
                            <div class="category-stat-value">${formatCurrency(data.amount)}</div>
                        </div>
                        <div class="category-stat">
                            <div class="category-stat-label">Transactions</div>
                            <div class="category-stat-value">${data.count}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

// ===================================
// FILTERING & SEARCHING
// ===================================

function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.querySelector('[data-filter].active')?.dataset.filter || 'all';
    
    const filtered = app.transactions.filter(t => {
        const matchesSearch = 
            t.category.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm) ||
            formatCurrency(t.amount).includes(searchTerm);
        
        const matchesFilter = 
            filterType === 'all' || 
            t.type === filterType;
        
        return matchesSearch && matchesFilter;
    });
    
    // Render filtered transactions
    const container = document.getElementById('transactionsList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No transactions match your search.</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(t => createTransactionHTML(t)).join('');
    attachTransactionListeners();
}

function handleFilterChange(e) {
    // Update active filter button
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Filter transactions
    filterTransactions();
}

// ===================================
// CATEGORY MANAGEMENT
// ===================================

function updateCategorySelect(type) {
    const select = document.getElementById('category');
    const categories = categoryConfig[type] || [];
    
    select.innerHTML = '<option value="">Select category...</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// ===================================
// MONTHLY SUMMARY
// ===================================

function populateMonthSelector() {
    const select = document.getElementById('monthSelect');
    const months = getLastSixMonths();
    
    select.innerHTML = months.map(month => 
        `<option value="${month}">${month}</option>`
    ).join('');
    
    updateMonthlySummary();
}

function updateMonthlySummary() {
    const selectedMonth = document.getElementById('monthSelect').value;
    
    const monthTransactions = app.transactions.filter(t => 
        formatMonthYear(t.date) === selectedMonth
    );
    
    const monthlyIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyNet = monthlyIncome - monthlyExpenses;
    
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    
    const netElement = document.getElementById('monthlyNet');
    netElement.textContent = formatCurrency(monthlyNet);
    netElement.style.color = monthlyNet >= 0 ? '#10b981' : '#ef4444';
}

// ===================================
// DATA PERSISTENCE (LOCAL STORAGE)
// ===================================

function saveToStorage() {
    // Save all app data to browser's localStorage
    const data = {
        transactions: app.transactions,
        goals: app.goals,
        theme: app.theme
    };
    
    localStorage.setItem('financeTrackerData', JSON.stringify(data));
}

function loadFromStorage() {
    // Load data from localStorage
    const stored = localStorage.getItem('financeTrackerData');
    
    if (stored) {
        try {
            const data = JSON.parse(stored);
            app.transactions = data.transactions || [];
            app.goals = data.goals || [];
            app.theme = data.theme || 'light';
        } catch (e) {
            console.error('Error loading data from storage:', e);
        }
    }
}

// ===================================
// THEME MANAGEMENT
// ===================================

function toggleTheme() {
    if (app.theme === 'light') {
        app.theme = 'dark';
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '☀️';
    } else {
        app.theme = 'light';
        document.body.classList.remove('dark-mode');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '🌙';
    }
    
    saveToStorage();
    
    // Refresh charts with new theme colors
    updateCharts();
}

function applyTheme() {
    if (app.theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '☀️';
    }
}

// ===================================
// MODAL MANAGEMENT
// ===================================

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        modal.classList.remove('show');
    });
    
    modal.classList.add('show');
}

function cancelConfirm() {
    document.getElementById('confirmModal').classList.remove('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

// ===================================
// NOTIFICATIONS
// ===================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// DATA EXPORT
// ===================================

function exportData() {
    const data = {
        exportDate: new Date().toISOString(),
        transactions: app.transactions,
        goals: app.goals,
        summary: {
            totalTransactions: app.transactions.length,
            totalIncome: app.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: app.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0),
            totalGoals: app.goals.length
        }
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-export-${new Date().getTime()}.json`;
    a.click();
    
    showToast('Data exported successfully!', 'success');
}

function confirmClearAll() {
    showConfirmModal(
        'Clear All Data',
        'Are you sure you want to delete all transactions and goals? This cannot be undone!',
        () => {
            app.transactions = [];
            app.goals = [];
            saveToStorage();
            updateDashboard();
            updateCharts();
            showToast('All data cleared successfully', 'success');
        }
    );
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Format number as currency (INR - Indian Rupees)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date in readable format
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Format date as Month Year
function formatMonthYear(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short'
    }).format(date);
}

// Get last 6 months in format
function getLastSixMonths() {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short'
        }).format(date));
    }
    
    return months;
}

// ===================================
// SAMPLE DATA GENERATION
// ===================================

function generateSampleData() {
    // Sample transactions
    const sampleTransactions = [
        { type: 'income', category: 'Salary', amount: 3000, date: '2026-05-01', description: 'Monthly salary' },
        { type: 'expense', category: 'Food', amount: 45.50, date: '2026-05-02', description: 'Grocery shopping' },
        { type: 'expense', category: 'Transport', amount: 25, date: '2026-05-03', description: 'Gas' },
        { type: 'expense', category: 'Entertainment', amount: 30, date: '2026-05-04', description: 'Movie tickets' },
        { type: 'income', category: 'Freelance', amount: 500, date: '2026-05-05', description: 'Web design project' },
        { type: 'expense', category: 'Shopping', amount: 120, date: '2026-05-06', description: 'Clothes' },
        { type: 'expense', category: 'Bills', amount: 150, date: '2026-05-07', description: 'Internet bill' },
        { type: 'expense', category: 'Food', amount: 60, date: '2026-05-08', description: 'Restaurant' },
        { type: 'expense', category: 'Health', amount: 40, date: '2026-05-09', description: 'Pharmacy' },
        { type: 'expense', category: 'Transport', amount: 50, date: '2026-05-10', description: 'Taxi' },
        { type: 'income', category: 'Business', amount: 800, date: '2026-05-15', description: 'Client payment' },
        { type: 'expense', category: 'Entertainment', amount: 25, date: '2026-05-18', description: 'Concert' },
        { type: 'expense', category: 'Food', amount: 75, date: '2026-05-20', description: 'Dinner' },
        { type: 'income', category: 'Gifts', amount: 100, date: '2026-05-22', description: 'Birthday gift' },
        { type: 'expense', category: 'Shopping', amount: 200, date: '2026-05-25', description: 'New shoes' }
    ];
    
    // Add transactions with unique IDs
    sampleTransactions.forEach((t, index) => {
        app.transactions.push({
            id: Date.now() + index,
            ...t,
            timestamp: new Date()
        });
    });
    
    // Sample goals
    const sampleGoals = [
        { name: 'Vacation', targetAmount: 2000, category: 'Travel', savedAmount: 0 },
        { name: 'Emergency Fund', targetAmount: 5000, category: 'Safety', savedAmount: 0 },
        { name: 'New Laptop', targetAmount: 1500, category: 'Technology', savedAmount: 0 }
    ];
    
    sampleGoals.forEach((g, index) => {
        app.goals.push({
            id: Date.now() + 1000 + index,
            ...g,
            createdDate: new Date().toISOString()
        });
    });
    
    saveToStorage();
}
