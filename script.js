const CAT_COLORS = {
    rent: '#639922',
    education: '#378ADD',
    food: '#BA7517',
    transport: '#534AB7',
    utilities: '#1D9E75',
    health: '#D4537E',
    entertainment: '#E24B4A',
    savings: '#27500A',
    investment: '#854F0B',
    other: '#888780'
};

const CAT_LABELS = {
    rent: 'Rent',
    education: 'Education',
    food: 'Food',
    transport: 'Transport',
    utilities: 'Utilities',
    health: 'Health',
    entertainment: 'Entertainment',
    savings: 'Savings',
    investment: 'Investment',
    other: 'Other'
};

let state = JSON.parse(localStorage.getItem('financeState')) || {
    expenses: [],
    income: 0
};

let donutInst, trendInst;

function save() {
    localStorage.setItem('financeState', JSON.stringify(state));
}

function showPage(id) {

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('page-' + id).classList.add('active');

    const map = {
        dashboard: 0,
        add: 1
    };

    document.querySelectorAll('.nav-btn')[map[id]]
        .classList.add('active');

    if (id === 'dashboard') {
        renderDashboard();
    }
}

function fmt(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
}

function thisMonth() {
    const d = new Date();

    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0');
}

function getMonthExpenses(month) {

    return state.expenses.filter(exp => {
        return exp.date.startsWith(month);
    });

}

function addExpense() {

    const desc = document.getElementById('exp-desc').value;
    const amount = parseFloat(
        document.getElementById('exp-amount').value
    );

    const cat = document.getElementById('exp-cat').value;

    const date =
        document.getElementById('exp-date').value ||
        new Date().toISOString().slice(0, 10);

    const notes =
        document.getElementById('exp-notes').value;

    if (!desc || !amount) {
        alert('Enter valid details');
        return;
    }

    state.expenses.push({
        id: Date.now(),
        desc,
        amount,
        cat,
        date,
        notes
    });

    save();

    alert('Expense Added');

    renderDashboard();
}

function saveIncome() {

    const income = parseFloat(
        document.getElementById('income-input').value
    );

    state.income = income;

    save();

    alert('Income Saved');

    renderDashboard();
}

function renderDashboard() {

    const month = thisMonth();

    const expenses = getMonthExpenses(month);

    const total = expenses.reduce((sum, e) => {
        return sum + e.amount;
    }, 0);

    const balance = state.income - total;

    document.getElementById('metric-grid').innerHTML = `
    <div class="metric">
      <div class="metric-label">Income</div>
      <div class="metric-val">${fmt(state.income)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Expenses</div>
      <div class="metric-val">${fmt(total)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Balance</div>
      <div class="metric-val">${fmt(balance)}</div>
    </div>
  `;

    const catTotals = {};

    expenses.forEach(exp => {
        catTotals[exp.cat] =
            (catTotals[exp.cat] || 0) + exp.amount;
    });

    const cats = Object.keys(catTotals);

    if (donutInst) {
        donutInst.destroy();
    }

    donutInst = new Chart(
        document.getElementById('donutChart'),
        {
            type: 'doughnut',

            data: {
                labels: cats.map(c => CAT_LABELS[c]),

                datasets: [{
                    data: cats.map(c => catTotals[c]),
                    backgroundColor: cats.map(c => CAT_COLORS[c])
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    if (trendInst) {
        trendInst.destroy();
    }

    trendInst = new Chart(
        document.getElementById('trendChart'),
        {
            type: 'bar',

            data: {
                labels: cats.map(c => CAT_LABELS[c]),

                datasets: [{
                    label: 'Amount',
                    data: cats.map(c => catTotals[c]),
                    backgroundColor: '#639922'
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

}

document.getElementById('exp-date').value =
    new Date().toISOString().slice(0, 10);

renderDashboard();