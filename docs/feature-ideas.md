# QuickSplit — Feature Ideas

These are ideas only. None of them is built in the `ui-ux-overhaul` branch, which is limited to restyling and UX fixes. Each is rated by rough effort (S/M/L) and expected user value.

## Settling up
| Idea | Effort | Why |
|---|---|---|
| **Mark transfer as paid** — tick off a transfer and keep it struck through, saved locally | S | Groups settle over days; people lose track of who already paid. |
| **Copy as text** — one tap copies "Rafi → Sara: ৳860" lines for WhatsApp/Messenger | S | Most settlements happen in chat apps, not PDFs. |
| **Native Share** (Web Share API) for the transfer list or PDF | S | Faster than download → attach on mobile. |
| **Payment links / QR** — optional bKash/Nagad/UPI/PayPal handle per member, shown next to each transfer | M | Removes the "send me your number" step. |
| **Settle-up history** — keep a log of finished settlements | M | Useful for recurring groups (flatmates). |

## Expenses
| Idea | Effort | Why |
|---|---|---|
| **Unequal splits** — by exact amount, percentage or shares (e.g. 2× for a couple) | M | The most requested capability in split apps; equal-only is limiting. |
| **Categories with icons** (food, transport, stay, fun, other) and a spend-by-category chart | M | Makes trip summaries more insightful and the list easier to scan. |
| **Date per expense** with grouping by day | S | Natural for multi-day trips. |
| **Receipt photo** attached to an expense (stored locally) | M | Transparency and fewer disputes. |
| **Notes** on an expense | S | Context ("includes tip"). |
| **Quick-add / natural language** — "Dinner 1200 paid by Sara split all" | M | Very fast entry on mobile. |
| **Duplicate expense** | S | Repeated items (daily breakfast). |
| **Multi-currency expenses** with a conversion rate to the base currency | L | Travel abroad. |

## Members
| Idea | Effort | Why |
|---|---|---|
| **Bulk add** — paste "Sara, Rafi, Nadia" | S | Faster setup. |
| **Rename member** (updates all expenses) | S | Fixing typos currently means delete + re-enter. |
| **Avatar colors / emoji picker** | S | Personality, quicker recognition. |
| **Sub-groups / couples** treated as one unit for settling | M | Common in family trips. |

## Groups & data
| Idea | Effort | Why |
|---|---|---|
| **Multiple groups** (Trip to Cox's Bazar, Flat, Office lunch) with a group switcher | M | Today everything lives in a single list. |
| **Export / import JSON** backup | S | Move data between devices without an account. |
| **Share a read-only link** (data encoded in the URL hash, no backend) | M | Everyone can verify the math. |
| **Optional cloud sync** (e.g. Supabase) with a shareable group code | L | Real-time collaboration; changes the "no sign-up" promise, so make it opt-in. |
| **CSV / Excel export** | S | For people who reconcile in spreadsheets. |

## Experience
| Idea | Effort | Why |
|---|---|---|
| **Undo toasts** instead of confirm dialogs | S | Faster, less scary deletes. |
| **Live dashboard strip** (total spent, # expenses, transfers left) | S | At-a-glance status on every tab. |
| **Sample data / demo mode** and first-run onboarding hints | S | Helps first-time visitors understand the app instantly. |
| **Keyboard shortcuts** (N new expense, / search, 1–4 tabs) | S | Power users on desktop. |
| **PWA** — installable, offline, home-screen icon | S | Feels like a native app; works with no signal on trips. |
| **Localization** — Bangla (বাংলা) UI and numerals | M | Primary audience is in Bangladesh. |
| **Insights** — "Sara paid 42% of the trip", biggest expense, per-day spend | M | Fun, shareable summaries. |
