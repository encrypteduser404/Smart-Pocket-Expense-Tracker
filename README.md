# 💰 SmartPocket – Expense Tracker & Tax Estimator

**SmartPocket** is a simple, browser-based personal finance web app that helps users of all age groups **track expenses**, **manage a monthly budget**, **visualize spending as bar or pie charts**, and even **estimate income tax under the latest Indian tax regime**.  

Built entirely with **HTML, CSS, and vanilla JavaScript** – no backend, no frameworks, no installation.

---

## 🎯 What You Can Do with SmartPocket

### 👥 Age-Group Based Guidance
Choose your age group to get relevant finance tips:
- **Students / Youth (18–25)** – focus on basics, habits, and avoiding debt traps  
- **Working Professionals (26–60)** – budgeting, investments, risk management  
- **Retired / Seniors (60+)** – capital preservation, healthcare planning, steady withdrawals  

Each selection unlocks **personalized saving and money-management suggestions**.

---

### 💸 Budget & Expense Management

- **Set Monthly Budget**
  - Define your monthly budget in rupees
  - See **Total Budget**, **Total Expenses**, and **Remaining Budget** at a glance  
  - Remaining amount is color-coded (safe / warning / over-budget)

- **Track Expenses Easily**
  - Add expenses with:
    - Category (Food, Transport, Shopping, Bills, etc.)
    - Amount (₹)
    - Optional note
  - Recent expenses are listed with date, amount, and a **delete** button
  - Data is stored in **localStorage**, so it stays even after you close the browser

- **Smart Savings Suggestions**
  - App analyzes category-wise spending
  - Suggests where you might be overspending (food, shopping, entertainment, etc.)
  - Gives gentle nudges like:
    - “Try cooking at home”
    - “Reduce impulse shopping”
    - “You’re close to your budget limit”

---

### 📊 Visual Insights – Bar & Pie Charts

SmartPocket includes **two types of visualizations** using the HTML `<canvas>` element:

- **Bar Chart**
  - Shows expense amount per category
  - Displays category name and value on each bar

- **Pie Chart**
  - Shows share of each category as a portion of the whole
  - Percentages displayed inside slices (for larger slices)
  - Legend with category names, percentage, and rupee value

Users can switch between:
- **Bar Chart** and **Pie Chart** using simple toggle buttons  
Your preferred chart type is remembered using localStorage.

---

### 🧮 Income Tax Estimator (India – New Regime)

SmartPocket includes a **basic income tax estimator** based on the **Indian new tax regime** (latest slabs).  

- Input: **Annual taxable income (₹)**  
- Output:
  - **Estimated Annual Tax**
  - **Approx. Monthly Tax**
  - **Effective Tax Rate (%)**

> ⚠️ **Note:**  
> This is a simplified calculator:
> - Uses the new regime slab logic  
> - Applies a basic rebate logic for lower incomes  
> - **Does not include** 4% health & education cess or surcharge  
> - For academic / learning purposes only, **not** official tax advice

---

## 🛠️ Tech Stack

- **Frontend:**  
  - HTML5  
  - CSS3 (CSS Grid, Flexbox, CSS Variables)  
  - JavaScript (ES6+)

- **Storage:**  
  - `localStorage` (browser-based, no database required)

- **Visualization:**  
  - Native HTML `<canvas>` API for bar and pie charts

- **UI & UX:**  
  - Responsive layout for desktop and mobile  
  - Light/Dark theme toggle  
  - Toast notifications for actions (e.g., budget set, expense added, tax updated)

---

## 📁 Project Structure

```bash
smartpocket/
├── index.html    # Main HTML file (structure of the app)
├── styles.css    # All styling, layout & themes
└── script.js     # App logic, charts, tax calculation, localStorage handling


git clone https://github.com/encrypteduser404/smartpocket.git
cd smartpocket
