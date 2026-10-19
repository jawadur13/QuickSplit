import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { computeSummary, simplifyTransactions } from "./lib/balances.js";
import { getFormatter } from "./lib/format.js";
import { buildSummaryDoc, buildTransfersDoc, downloadPdf, previewPdf } from "./lib/pdf.js";
import { clearState, loadState, newId, saveState } from "./lib/storage.js";
import { Header } from "./components/Header.jsx";
import { Tabs } from "./components/Tabs.jsx";
import { MembersView } from "./components/MembersView.jsx";
import { ExpensesView } from "./components/ExpensesView.jsx";
import { BalancesView } from "./components/BalancesView.jsx";
import { SettleView } from "./components/SettleView.jsx";
import { ConfirmDialog } from "./components/ui.jsx";

const THEME_KEY = "quicksplit_theme";
const initial = loadState();

const systemDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export function App() {
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState(initial?.members ?? []);
  const [costs, setCosts] = useState(initial?.costs ?? []);
  const [currency, setCurrency] = useState(initial?.currency ?? "BDT");
  const [confirmReq, setConfirmReq] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  });

  useEffect(() => saveState({ members, costs, currency }), [members, costs, currency]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    try {
      if (theme) localStorage.setItem(THEME_KEY, theme);
      else localStorage.removeItem(THEME_KEY);
    } catch (e) { }
  }, [theme]);

  const isDark = theme ? theme === "dark" : systemDark();

  // Results are derived live — no "Calculate" step.
  const summary = useMemo(() => computeSummary(members, costs), [members, costs]);
  const transfers = useMemo(() => simplifyTransactions(members, costs), [members, costs]);
  const fmt = getFormatter(currency);

  const ask = (req) => new Promise((resolve) => setConfirmReq({ ...req, resolve }));
  const closeConfirm = (ok) => {
    confirmReq?.resolve(ok);
    setConfirmReq(null);
  };

  const goTab = (id) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- Members ----------------
  const addMember = (name) => setMembers((prev) => [...prev, name]);

  const removeMember = async (name) => {
    const ok = await ask({
      title: `Remove ${name}?`,
      message: "They’ll also be removed from every expense they paid for or shared.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    setMembers((prev) => prev.filter((m) => m !== name));
    setCosts((prev) =>
      prev.map((c) => ({
        ...c,
        payers: c.payers.filter((p) => p.name !== name),
        sharedBy: c.sharedBy.filter((m) => m !== name),
      }))
    );
  };

  // ---------------- Costs ----------------
  const addCost = () => {
    const id = newId();
    setCosts((prev) => [...prev, { id, title: "", payers: [{ name: members[0], amount: "" }], sharedBy: [...members] }]);
    return id;
  };

  const updateCost = (next) => setCosts((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  const deleteCost = async (cost) => {
    const ok = await ask({
      title: "Delete this expense?",
      message: cost.title.trim() ? `“${cost.title.trim()}” will be removed from the split.` : undefined,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (ok) setCosts((prev) => prev.filter((c) => c.id !== cost.id));
  };

  const moveCost = (fromId, toId) =>
    setCosts((prev) => {
      const next = [...prev];
      const from = next.findIndex((c) => c.id === fromId);
      const to = next.findIndex((c) => c.id === toId);
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const resetApp = async () => {
    const ok = await ask({
      title: "Reset everything?",
      message: "All members and expenses on this device will be cleared. This can’t be undone.",
      confirmLabel: "Reset",
      tone: "danger",
    });
    if (!ok) return;
    setMembers([]);
    setCosts([]);
    clearState();
    goTab("members");
  };

  // ---------------- PDF ----------------
  const summaryPdf = () => buildSummaryDoc(summary, currency);
  const transfersPdf = () => buildTransfersDoc(transfers, currency);

  const shared = { members, summary, fmt, goMembers: () => goTab("members"), goExpenses: () => goTab("expenses") };

  return (
    <div className="shell">
      <Header
        currency={currency}
        onCurrency={setCurrency}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
        onReset={resetApp}
      />

      <Tabs
        active={activeTab}
        onChange={goTab}
        counts={{ members: members.length, expenses: costs.length, settle: transfers.length }}
      />

      <main className="panel" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} key={activeTab}>
        {activeTab === "members" && (
          <MembersView {...shared} onAdd={addMember} onRemove={removeMember} onNext={() => goTab("expenses")} />
        )}
        {activeTab === "expenses" && (
          <ExpensesView
            members={members}
            costs={costs}
            fmt={fmt}
            onAdd={addCost}
            onChange={updateCost}
            onDelete={deleteCost}
            onMove={moveCost}
            goMembers={shared.goMembers}
          />
        )}
        {activeTab === "balances" && (
          <BalancesView
            {...shared}
            onDownload={() => downloadPdf(summaryPdf, "QuickSplit_Summary.pdf")}
            onPreview={() => previewPdf(summaryPdf)}
          />
        )}
        {activeTab === "settle" && (
          <SettleView
            {...shared}
            transfers={transfers}
            onDownload={() => downloadPdf(transfersPdf, "QuickSplit_Transactions.pdf")}
            onPreview={() => previewPdf(transfersPdf)}
          />
        )}
      </main>

      <footer className="footer">
        <span className="saved">
          <Check size={14} /> Saved on this device
        </span>
        <span>
          <a href="about.html">How it works</a> · © <a href="https://jawadurrafid.com">Jawadur Rafid</a>
        </span>
      </footer>

      <ConfirmDialog request={confirmReq} onDone={closeConfirm} />
    </div>
  );
}
