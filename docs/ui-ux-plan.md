# QuickSplit — UI/UX Overhaul Plan

Branch: `ui-ux-overhaul`
Goal: make QuickSplit feel premium, calm and effortless — fewer clicks, live results, and a refined visual identity.

---

## 1. What exists today (audit)

**Structure:** single `index.html` (React 18 UMD + Babel-in-browser, ~1,580 lines) with 4 tabs — Members, Costs, Summary, Simplify — plus a static `about.html`. State is saved to `localStorage`.

### UX problems
| # | Issue | Where |
|---|-------|-------|
| U1 | Summary and Simplify are **stale snapshots**: you must press "Calculate"/"Simplify" again after every edit. | `calculateSummary`, `simplifyTransactions` |
| U2 | When everyone is settled, Simplify shows "No transactions yet" instead of "All settled 🎉" (the settled branch can never render). | `index.html:1539-1556` |
| U3 | A new payer starts with amount `0`, so the user has to delete the 0 before typing. | `addPayer`, number input |
| U4 | No cost total and no "each person pays X" preview while editing a cost. | Cost card |
| U5 | Every cost card is fully expanded, so long lists become a wall of forms. | Costs tab |
| U6 | The whole card is `draggable`, which makes selecting text inside its inputs awkward. Cards are also keyed by index. | `.cost-item` |
| U7 | Duplicate member names are silently ignored, with no feedback. Names are case-sensitive ("Sara" ≠ "sara"). | `addMember` |
| U8 | Native `confirm()` for every delete, and no undo. | remove* / reset |
| U9 | The top bar repeats on every tab ("Auto-saved ✅" + a red "Reset App"), so a destructive action is always one click away. | `TopActions` |
| U10 | Amounts always use `toFixed(2)`, which is wrong for JPY/KRW (0 decimals) and KWD/BHD/OMR (3). There are no thousand separators or currency symbols. | everywhere |
| U11 | Too many same-weight primary buttons (Calculate, Preview PDF, Download PDF…), so there's no clear main action. | Summary/Simplify |

### Visual problems
- The `Poppins` font is declared but **never loaded**, so the app falls back to the system font.
- Emoji used as icons (⚡👥💰📊🔄❌⚠️) look inconsistent across OSes and cheapen the look.
- Hover `translateY + scale` on every button (even tiny ones) makes the UI jittery.
- Flat grey nav pills, dashed borders everywhere, and no depth hierarchy.
- No dark mode.
- On mobile, the absolutely-positioned About button overlaps the title, and the currency select is 240px min-width.

### Accessibility
- Buttons have no visible focus style. Tabs aren't `role="tablist"`. Icon-only ✕ buttons have no labels.
- Checkbox labels have tiny hit areas. There's no `prefers-reduced-motion` handling.

### Performance / code health (affects perceived UX)
- Babel standalone (~3 MB) compiles JSX **in the browser** on every load, using React *development* builds from unpinned `unpkg` URLs. This makes the first paint slow.
- The PDF code is copy-pasted 4× (preview/download × summary/transactions).
- `TabButton`/`TopActions` are defined inside `App`, so they remount on every render.
- The README says "Vanilla JavaScript", but the app is React.

---

## 2. Design direction — "Quiet Luxury"

Inspired by private-banking and fintech apps: warm neutrals, one deep brand color, a metallic accent, generous whitespace, and confident numbers.

**Palette (light)**
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F5F0` warm ivory | page |
| `--surface` | `#FFFFFF` | cards |
| `--surface-2` | `#F1EEE7` | inset areas, inputs |
| `--ink` | `#14161C` | primary text |
| `--ink-2` | `#5B6070` | secondary text |
| `--line` | `#E6E2D8` | hairline borders |
| `--brand` | `#1F3A34` deep emerald | primary actions, nav |
| `--gold` | `#B8925A` champagne | accents, highlights, focus ring |
| `--pos` | `#2F7D5B` | "gets back" |
| `--neg` | `#B4513C` | "owes" |

**Palette (dark):** `--bg #0F1113`, `--surface #171A1D`, `--ink #ECE8DF`, `--brand #3E7A6C`, `--gold #D4B07A`. It follows the system setting, with a manual toggle.

**Typography**
- Display: **Fraunces** or **Instrument Serif** for the logo, page titles and big totals.
- UI: **Inter** (or Geist) with `font-feature-settings: "tnum"` so numbers line up.
- Scale: 12 / 14 / 16 / 20 / 28 / 40.

**Shape and depth**
- Radius 14px for cards, 10px for inputs, full pill for chips.
- Hairline 1px borders plus a soft two-layer shadow (`0 1px 2px rgb(0 0 0/.04), 0 8px 24px -12px rgb(20 22 28/.12)`).
- No dashed borders.

**Icons:** replace emoji with **Lucide** inline SVGs (users, receipt, pie-chart, arrow-right-left, plus, trash, grip-vertical, download, eye, sun/moon).

**Motion:** 150–200 ms ease-out. Cards fade and rise in. Numbers animate on change. Add a press state (`scale(.98)`) instead of hover jumps. Honor `prefers-reduced-motion`.

---

## 3. Information architecture & flow

Keep the 4 steps but make them feel like one guided flow:

```
[ Group ]  →  [ Expenses ]  →  [ Balances ]  →  [ Settle up ]
```

1. **Header:** wordmark on the left. Currency chip, theme toggle and an overflow menu (About, Export, Reset) on the right. Reset moves into the menu and leaves every tab.
2. **Segmented tab bar** with a sliding indicator and count badges (e.g. "Expenses · 6"). It becomes a **bottom tab bar on mobile**.
3. **Live dashboard strip** (always visible above content): Total spent · Expenses · People · "Unsettled: 3 transfers".
4. **Summary and Simplify compute live** with `useMemo`. Remove the "Calculate"/"Simplify" buttons entirely.
5. **Empty states** with an illustration, one line of copy and a single CTA ("Add your first person").
6. **First-run onboarding:** a 3-step inline hint, plus a "Try with sample data" button.

---

## 4. Screen-by-screen redesign

### Group (Members)
- A large input with an inline "Add" button. Comma or Enter adds several people at once ("Sara, Rafi, Nadia").
- Members appear as **avatar chips** (initials on a generated pastel/gold tint). Hover shows the remove icon; double-click renames.
- Each member row shows their live balance with a thin bar (green = gets back, terracotta = owes).
- Duplicate or empty names get an inline error message, with case-insensitive matching.

### Expenses (Costs)
- **Collapsed card by default:** title · total · "Paid by Sara" · avatars of sharers · status dot. Click to expand and edit.
- The expanded editor has:
  - Title plus an optional category icon (food, transport, stay, fun, other).
  - A **"Paid by"** row: the default is one payer with the full amount. A "+ Split payment" link adds more payers.
  - Amount inputs start **empty** (placeholder `0.00`), are right-aligned with tabular numbers, and show a currency prefix.
  - **"Split between"**: toggleable avatar chips instead of checkboxes, plus "Everyone" / "None".
  - A live footer: "Total ৳1,200 · ৳300 each · 4 people".
- A **sticky "+ Add expense"** button: a floating action button on mobile, a primary button on desktop. New expenses default to **everyone** sharing.
- Reordering uses a dedicated grip handle only; card keys become a stable `id`.
- Search plus a member filter collapse into one compact toolbar.

### Balances (Summary)
- A hero line: "Total group spend ৳12,450".
- One card per person: avatar, name, a big net figure ("gets back ৳1,240" / "owes ৳860"), and a paid vs. share mini-bar. The breakdown expands as a clean two-column table.
- Incomplete expenses show as a single amber banner ("2 expenses are incomplete — Fix") that links to them.

### Settle up (Simplify)
- A transfer list: `[avatar] Rafi → [avatar] Sara  ৳860` with a **"Mark paid"** checkbox (struck-through, persisted).
- "Copy as text" so the list can be pasted into WhatsApp or Messenger, plus a Share button (Web Share API).
- When everyone is settled, show a tasteful confirmation (subtle confetti respecting reduced motion).
- PDF export becomes one **"Export"** split button (Download / Preview) instead of 2 big buttons per tab.

### About
- Same header and theme. A 4-step illustrated timeline matching the new tab names, a short FAQ ("How is the minimum number of transfers found?") and a back link in the header.

### PDF
- Restyle it to match the brand: emerald header band, gold rule lines, a table layout, and tabular amounts.
- Refactor to one `buildSummaryDoc()` / `buildTransfersDoc()` used by both preview and download.

---

## 5. Interaction & polish details
- Replace `confirm()` with **toasts that have Undo** (5 s) for deletions. Reset gets a styled confirm dialog.
- Format currency with `Intl.NumberFormat(locale, { style: "currency", currency })` so decimals and symbols are correct per currency. Show the currency selector with flags or symbols and a search box.
- Keyboard: `N` = new expense, `/` = search, `1–4` = switch tabs, `Esc` = collapse card.
- Focus ring: `0 0 0 3px color-mix(in srgb, var(--gold) 45%, transparent)` on every interactive element.
- Touch targets ≥ 44px. Labels on all icon buttons (`aria-label`).
- Remember the last active tab and expanded card in `localStorage`.

---

## 6. Technical foundation (do first — it unlocks the rest)
1. **Remove in-browser Babel:** add a minimal **Vite + React** build (still static output, still deploys to Vercel), or at least pin versions and use `react.production.min.js`.
2. Split into `components/` (Header, Tabs, MemberChip, ExpenseCard, BalanceCard, TransferRow, Toast) and `lib/` (`balances.js`, `settle.js`, `format.js`, `pdf.js`).
3. Make balances and transfers a single pure `useMemo` derivation, and drop the `summaryData`/`simplifyTx` state.
4. Add stable `id`s to costs, with a migration from `quicksplit_premium_v1` to `v2` so existing user data survives.
5. Add design tokens as CSS variables (light/dark), and load fonts via Google Fonts with `display=swap`.
6. Add a few unit tests (Vitest) for balance and settle math before restyling, so visuals can change safely.

---

## 7. Phased rollout

| Phase | Scope | Outcome |
|---|---|---|
| **0. Foundation** | Vite setup, split files, live `useMemo` derivation, stable ids, data migration, math tests | Faster load, no behavior change |
| **1. Design system** | Tokens, fonts, Lucide icons, buttons/inputs/chips/cards, dark mode, focus styles | New look everywhere |
| **2. Layout & nav** | New header + overflow menu, segmented tabs / mobile bottom bar, empty states | Clear structure |
| **3. Group + Expenses** | Avatar chips, collapsible expense cards, chip-based sharing, live per-person split, FAB | Core flow takes far fewer clicks |
| **4. Balances + Settle** | Balance cards with bars, transfer list, export split button | Results feel rewarding |
| **5. Polish** | Styled confirm dialog, Intl currency formatting, motion | Premium feel |
| **6. About + PDF + README** | Restyle About, brand the PDFs, refactor the PDF builder, fix README tech stack | Consistent end-to-end |

Each phase is one or more commits on `ui-ux-overhaul`, verified in the browser at 375px, 768px and 1280px, in light and dark mode.

---

## 8. Decisions (2026-10-20)
1. **Build step:** approved. Use Vite + React and anything else that helps the look (fonts, Lucide icons).
2. **Visual direction:** "Quiet Luxury" (ivory + emerald + gold, serif display), with a matching dark mode.
3. **Scope:** **no new features** in this overhaul. Only restyling, layout and UX fixes to existing functionality. The following items from this plan are deferred to [feature-ideas.md](feature-ideas.md):
   - Mark paid, Copy as text / Share, sample data, first-run onboarding
   - Bulk add with commas, rename members, expense categories
   - Keyboard shortcuts, toasts with Undo, live dashboard strip, remembering the expanded card

   Kept in scope as fixes or restyles: live calculation (removes the stale-results bug), the "All settled" bug, empty amount inputs, `Intl` currency formatting, collapsible expense cards, chip-style "Split between", a styled confirm dialog instead of `confirm()`, per-expense total/each display, dark mode, accessibility, a single PDF builder, and a branded PDF.

---

## 9. Status (2026-10-20)
Phases 0–6 are implemented on `ui-ux-overhaul`. They were verified in a headless browser at 375px and 1280px, in light and dark mode, with zero console errors. Saved data in the legacy v1 format migrates automatically, and both PDFs generate correctly.
