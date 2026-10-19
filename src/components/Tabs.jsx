import { ArrowRightLeft, Receipt, Scale, Users } from "lucide-react";

export const TABS = [
  { id: "members", label: "Members", icon: Users },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balances", label: "Balances", icon: Scale },
  { id: "settle", label: "Settle up", icon: ArrowRightLeft },
];

export const Tabs = ({ active, onChange, counts }) => (
  <nav className="tabs" role="tablist" aria-label="Sections">
    {TABS.map(({ id, label, icon: Icon }) => {
      const selected = active === id;
      return (
        <button
          key={id}
          role="tab"
          id={`tab-${id}`}
          aria-selected={selected}
          aria-controls={`panel-${id}`}
          className={`tab ${selected ? "is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon size={17} strokeWidth={1.9} />
          <span className="tab-label">{label}</span>
          {counts[id] > 0 && <span className="tab-count num">{counts[id]}</span>}
        </button>
      );
    })}
  </nav>
);
