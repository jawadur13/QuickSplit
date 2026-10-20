<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="QuickSplit logo" />
</p>

<h1 align="center">QuickSplit</h1>

<p align="center"><strong>Split bills, not friendships.</strong></p>

<p align="center">
  A calm, elegant web app for splitting group expenses — trips, dinners, flats or events.<br />
  No sign-up. No backend. Your data stays on your device.
</p>

<p align="center">
  👉 <a href="https://quicksplit.pro.bd/"><strong>quicksplit.pro.bd</strong></a>
</p>

---

## ✨ Features

**👥 Members**
- Add everyone in the group; each person gets an initial-letter avatar
- Live balance for every member, with a bar showing who's up or down
- Duplicate names are caught (case-insensitive)
- Removing a member also removes them from every expense

**🧾 Expenses**
- Compact, collapsible expense cards: title, payer, total and a ready/incomplete status at a glance
- Multiple payers per expense, with custom amounts
- Pick who shares each expense with tap-to-toggle name chips (**Everyone** / **None** shortcuts)
- Live "total · each · people" preview while you edit
- Search by title, filter by member, drag the handle to reorder

**⚖️ Balances**
- Total group spend at the top
- Per-person cards: net amount (gets back / owes / settled), paid vs. share bars, and an itemised breakdown
- Incomplete expenses are flagged and left out until they're fixed

**🔄 Settle up**
- The fewest transfers needed to clear every debt, as a clear "who pays whom" list
- An "Everyone's even" state when nothing is owed

**📄 Reports & more**
- Branded PDF reports for balances and transfers, to preview or download
- 20 currencies, formatted correctly (e.g. ৳1,200.00, ¥1,200, KWD 3 decimals)
- Light and dark themes (follows your system, with a manual toggle)
- Everything updates live — no "Calculate" button
- Auto-saved to your browser; designed for phones (bottom tab bar) and desktop

---

## 🧮 How it works

1. **Members:** add the people in the group.
2. **Expenses:** for each cost, enter who paid how much and who shares it. The amount is split evenly between everyone selected.
3. **Balances:** each person's net is what they paid minus their share.
4. **Settle up:** people who owe are matched with people who get money back until every balance is zero.

---

## 🛠 Tech Stack

- **React 18** built with **Vite** (multi-page: app + About)
- **Lucide** icons, **Fraunces** + **Inter** typefaces
- **jsPDF** for PDF reports (loaded on demand)
- **Vitest** for the split-math unit tests
- **GitHub + Vercel** for deployment (`npm run build` → `dist/`)

No backend: everything runs and is saved in the browser (`localStorage`).

---

## 💻 Development

Requires Node 18+.

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests for balances & settle-up math
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

### Project structure

```
index.html            App entry
about.html            "How it works" page
public/               Static assets (favicon)
src/
  App.jsx             App shell: state, live results, tabs
  components/         Header, Tabs, Members, Expenses, Balances, Settle up, UI primitives
  lib/
    balances.js       Pure split math (+ balances.test.js)
    format.js         Currency list and Intl formatting
    storage.js        localStorage persistence and v1 → v2 migration
    pdf.js            Branded PDF builder
  styles/             Design tokens (light/dark), app and About styles
docs/
  ui-ux-plan.md       UI/UX overhaul plan
  feature-ideas.md    Backlog of future feature ideas
```

---

<p align="center">© <a href="https://jawadurrafid.com">Jawadur Rafid</a></p>
