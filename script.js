// =============================
// Small utilities
// =============================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const toast = (text) => {
  const host = $('#toast');
  const el = document.createElement('div');
  el.className = 'msg';
  el.textContent = text;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 300ms, transform 300ms';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 320);
  }, 1800);
};

// =============================
// Theme handling
// =============================
const Theme = {
  init() {
    const saved = localStorage.getItem('smartpocket-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      // Respect system preference on first visit
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    this.syncUI();
    $('#themeToggle').addEventListener('click', () => this.toggle());
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('smartpocket-theme', next);
    this.syncUI();
    toast(`Switched to ${next} mode`);
    // redraw chart to adapt axis colors
    SmartPocket.renderExpenseChart();
  },
  syncUI() {
    const mode = document.documentElement.getAttribute('data-theme');
    const icon = mode === 'dark' ? '🌙' : '🌞';
    const label = mode === 'dark' ? 'Dark' : 'Light';
    $('#themeIcon').textContent = icon;
    $('#themeLabel').textContent = label;
  }
};

// =============================
// App
// =============================
const SmartPocket = {
  data: {
    ageGroup: '',
    monthlyBudget: 0,
    expenses: [],
    financeTips: {
      student: [
        'Start a 3-month emergency fund',
        'Use student discounts whenever possible',
        'Try part-time gigs/freelancing to learn income skills',
        'Avoid credit card balances and high-interest EMIs',
        'Begin investing small, consistently'
      ],
      professional: [
        'Target 20%+ savings rate',
        'Max your employer retirement match',
        'Diversify across assets (equity, debt, gold)',
        'Review insurance coverage annually',
        'Set time-bound financial goals'
      ],
      senior: [
        'Prioritize capital preservation',
        'Consider downsizing to reduce fixed costs',
        'Plan sustainable withdrawal strategies',
        'Track healthcare and medicines in budget',
        'Use available senior benefits'
      ]
    }
  },

  init() {
    Theme.init();
    this.load();
    this.bind();
    this.updateUI();
    this.renderExpenseChart();
  },

  load() {
    try {
      const saved = localStorage.getItem('smartPocketData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        this.data = { ...this.data, ...parsedData };
        
        // Restore age group selection if exists
        if (this.data.ageGroup) {
          this.selectAge(this.data.ageGroup);
        }
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  },

  save() { 
    localStorage.setItem('smartPocketData', JSON.stringify(this.data)); 
  },

  bind() {
    // Age cards
    $$('#ageGroup .age-card').forEach(card => 
      card.addEventListener('click', () => this.selectAge(card.dataset.ageGroup))
    );

    // Budget
    $('#set-budget').addEventListener('click', () => this.setBudget());

    // Expenses
    $('#add-expense').addEventListener('click', () => this.addExpense());
    $('#expense-amount').addEventListener('keydown', e => { 
      if (e.key === 'Enter') this.addExpense(); 
    });
  },

  selectAge(group) {
    this.data.ageGroup = group;
    $$('#ageGroup .age-card').forEach(c => 
      c.classList.toggle('active', c.dataset.ageGroup === group)
    );
    $('#finance-tips').style.display = 'block';
    this.updateTips();
    this.save();
  },

  updateTips() {
    const list = $('#tip-list');
    list.innerHTML = '';
    const tips = this.data.financeTips[this.data.ageGroup] || [];
    
    tips.forEach(tip => {
      const li = document.createElement('li');
      li.className = 'expense-item';
      li.innerHTML = `<div>${tip}</div>`;
      list.appendChild(li);
    });
  },

  setBudget() {
    const val = parseFloat($('#monthly-budget').value);
    if (!val || val <= 0) { 
      toast('Please enter a valid budget amount'); 
      return; 
    }
    this.data.monthlyBudget = val;
    $('#monthly-budget').value = '';
    this.updateUI();
    this.save();
    toast(`Budget set to ₹${val.toLocaleString()}`);
  },

  addExpense() {
    const category = $('#expense-category').value;
    const amount = parseFloat($('#expense-amount').value);
    const note = ($('#expense-note').value || '').trim();
    
    if (!amount || amount <= 0) { 
      toast('Please enter a valid expense amount'); 
      return; 
    }
    
    const expense = { 
      id: Date.now(), 
      category, 
      amount, 
      note: note || `${category[0].toUpperCase() + category.slice(1)} expense`, 
      date: new Date().toLocaleDateString() 
    };
    
    this.data.expenses.push(expense);
    $('#expense-amount').value = '';
    $('#expense-note').value = '';
    this.updateUI();
    this.save();
    this.generateSavingsSuggestions();
    toast(`Added ₹${amount.toLocaleString()} • ${expense.category}`);
  },

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.updateUI();
    this.save();
    this.generateSavingsSuggestions();
    toast('Expense removed');
  },

  updateUI() {
    // Summary
    $('#total-budget').textContent = `₹${(this.data.monthlyBudget || 0).toLocaleString()}`;
    const total = this.data.expenses.reduce((s, e) => s + e.amount, 0);
    $('#total-expenses').textContent = `₹${total.toLocaleString()}`;
    const remaining = (this.data.monthlyBudget || 0) - total;
    const remEl = $('#remaining-budget');
    remEl.textContent = `₹${remaining.toLocaleString()}`;
    remEl.style.color = remaining < 0 ? 'var(--danger)' : 
                        (remaining < (this.data.monthlyBudget * 0.1) ? 'var(--warning)' : 'var(--accent)');

    // Expense list (last 10)
    const wrap = $('#expense-list');
    wrap.innerHTML = '';
    
    if (this.data.expenses.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'expense-item';
      empty.textContent = 'No expenses recorded yet';
      wrap.appendChild(empty);
    } else {
      [...this.data.expenses]
        .sort((a, b) => b.id - a.id)
        .slice(0, 10)
        .forEach(exp => {
          const row = document.createElement('div');
          row.className = 'expense-item';
          row.innerHTML = `
            <div class="expense-meta">
              <strong>${exp.category[0].toUpperCase() + exp.category.slice(1)}</strong>
              <small>${exp.note} • ${exp.date}</small>
            </div>
            <div class="expense-actions">
              <strong>₹${exp.amount.toLocaleString()}</strong>
              <button class="icon-btn" aria-label="Delete" title="Delete" data-id="${exp.id}">✕</button>
            </div>`;
          
          row.querySelector('button').addEventListener('click', () => this.deleteExpense(exp.id));
          wrap.appendChild(row);
        });
    }
    
    this.renderExpenseChart();
  },

  generateSavingsSuggestions() {
    const host = $('#savings-suggestions');
    host.innerHTML = '';
    
    if (this.data.expenses.length === 0) {
      const p = document.createElement('div');
      p.className = 'expense-item';
      p.textContent = 'Start tracking your expenses to get personalized savings suggestions!';
      host.appendChild(p);
      return;
    }
    
    const byCat = {};
    for (const e of this.data.expenses) {
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    }
    
    const total = Object.values(byCat).reduce((a, b) => a + b, 0);
    const suggestions = [];
    
    // Generate suggestions based on spending patterns
    if (byCat.food && byCat.food > total * 0.3) {
      suggestions.push("You're spending a lot on food. Plan meals & cook more at home.");
    }
    
    if (byCat.entertainment && byCat.entertainment > total * 0.2) {
      suggestions.push('Entertainment is high. Try free/low-cost options.');
    }
    
    if (byCat.shopping && byCat.shopping > total * 0.25) {
      suggestions.push('Shopping is heavy. Use a 24‑hour wait before non-essentials.');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Spending looks balanced! Consider investing 10–15% this month.');
    }
    
    // Budget-related suggestions
    if (this.data.monthlyBudget > 0) {
      const remaining = this.data.monthlyBudget - total;
      if (remaining < 0) {
        suggestions.push("You've exceeded your monthly budget. Review & trim a category.");
      } else if (remaining < this.data.monthlyBudget * 0.1) {
        suggestions.push('Close to budget limit. Be mindful for the rest of the month.');
      }
    }
    
    // Display suggestions
    suggestions.forEach(suggestion => {
      const li = document.createElement('div');
      li.className = 'expense-item';
      li.textContent = suggestion;
      host.appendChild(li);
    });
  },

  renderExpenseChart() {
    const canvas = $('#expense-chart');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas dimensions with proper scaling for high DPI displays
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Get text color from CSS variable
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111827';

    // Calculate expenses by category
    const byCat = {};
    for (const e of this.data.expenses) {
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    }
    
    const categories = Object.keys(byCat);
    
    // Handle empty state
    if (categories.length === 0) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#6b7280';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No expense data to display', rect.width / 2, rect.height / 2);
      return;
    }
    
    const amounts = Object.values(byCat);
    const max = Math.max(...amounts) || 1;
    
    // Chart dimensions and padding
    const padding = { left: 40, right: 14, top: 30, bottom: 36 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    const barWidth = (chartWidth / categories.length) - 12;
    
    // Color palette for bars
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981'];

    // Draw bars
    categories.forEach((category, index) => {
      const amount = byCat[category];
      const barHeight = (amount / max) * chartHeight;
      const x = padding.left + index * (barWidth + 12);
      const y = padding.top + (chartHeight - barHeight);
      
      // Draw bar
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw category label
      ctx.fillStyle = textColor;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(
        category[0].toUpperCase() + category.slice(1), 
        x + barWidth / 2, 
        rect.height - 20
      );
      
      // Draw amount above bar
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `₹${amount.toLocaleString()}`, 
        x + barWidth / 2, 
        y - 4
      );
    });

    // Draw chart title
    ctx.fillStyle = textColor;
    ctx.font = '600 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Expenses by Category', rect.width / 2, 8);
  }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  SmartPocket.init();
  
  // Redraw chart on window resize
  window.addEventListener('resize', () => {
    SmartPocket.renderExpenseChart();
  });
});