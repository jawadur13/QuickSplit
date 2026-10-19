# ⚡ QuickSplit

**Split bills, not friendships.**

QuickSplit is a lightweight web app that helps groups easily split expenses from trips, hangouts, food, or events — without arguments or confusion.

No sign-up. No database. Just clean math.

---

## 🚀 Live Demo
👉 **https://quicksplit.pro.bd/**

---

## ✨ Features

- 👥 **Add group members** with member balance overview
- 💰 **Add multiple expenses** with multiple payers and custom amounts
- 👤 **Select who shared** each expense (equal split)
- 🔍 **Search expenses** by title
- 🎛️ **Filter costs** by member
- ↔️ **Drag & drop** to reorder expenses
- 📊 **Clear summary showing:**
  - Total paid
  - Total consumed
  - Net balance (pay / receive)
- 🧾 **Cost-wise breakdown** for full transparency
- 🔄 **Simplified transactions** (minimum paybacks)
- 📄 **PDF export:** Preview and download professional summaries & transaction reports
- 💱 **Multi-currency support** (20+ currencies)
- 💾 **Auto-save** to localStorage (persists across refreshes)
- 🎨 **Premium UI** with light & dark themes, responsive down to phones
- ⚡ **Works instantly** in the browser — no sign-up needed

---

## 🛠 Tech Stack

- **React 18** built with **Vite**
- **Lucide** icons, **Fraunces** + **Inter** typefaces
- **jsPDF** for PDF reports (loaded on demand)
- **Vitest** for the split-math unit tests
- **GitHub + Vercel** for deployment (`npm run build` → `dist/`)

No backend: everything runs and is saved in the browser.

## 💻 Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests for balances & settle-up math
npm run build    # production build in dist/
```

Design plan: [docs/ui-ux-plan.md](docs/ui-ux-plan.md) · Feature backlog: [docs/feature-ideas.md](docs/feature-ideas.md)

---