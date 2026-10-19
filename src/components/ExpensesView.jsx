import { useState } from "react";
import { Plus, Receipt, Search, SearchX, Users, X } from "lucide-react";
import { ExpenseCard } from "./ExpenseCard.jsx";
import { EmptyState } from "./ui.jsx";

export const ExpensesView = ({ members, costs, fmt, onAdd, onChange, onDelete, onMove, goMembers }) => {
  const [query, setQuery] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [newId, setNewId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  if (!members.length) {
    return (
      <section className="card">
        <EmptyState
          icon={Users}
          title="Add your group first"
          text="Expenses are split between members, so start by adding who’s involved."
          action={
            <button className="btn btn-primary" onClick={goMembers}>
              Add members
            </button>
          }
        />
      </section>
    );
  }

  const filtered = costs.filter((c) => {
    if (query && !(c.title || "").toLowerCase().includes(query.toLowerCase())) return false;
    if (filterMember && !c.payers.some((p) => p.name === filterMember) && !c.sharedBy.includes(filterMember)) return false;
    return true;
  });
  const hasFilter = query || filterMember;

  const add = () => {
    setQuery("");
    setFilterMember("");
    const id = onAdd();
    setExpandedId(id);
    setNewId(id);
  };

  const drag = {
    start: (e, id, el) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      if (el) e.dataTransfer.setDragImage(el, 24, 24);
    },
    over: (e, id) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overId !== id) setOverId(id);
    },
    drop: (e, id) => {
      e.preventDefault();
      if (dragId && dragId !== id) onMove(dragId, id);
      setDragId(null);
      setOverId(null);
    },
    end: () => {
      setDragId(null);
      setOverId(null);
    },
  };

  return (
    <div className="stack">
      <section className="toolbar">
        <div className="field-icon toolbar-search">
          <Search size={17} aria-hidden="true" />
          <input
            className="input"
            type="search"
            placeholder="Search expenses"
            aria-label="Search expenses by title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input toolbar-filter"
          aria-label="Filter by member"
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
        >
          <option value="">All members</option>
          {members.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {hasFilter && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setQuery("");
              setFilterMember("");
            }}
          >
            <X size={16} /> Clear
          </button>
        )}
        <button className="btn btn-primary toolbar-add" onClick={add}>
          <Plus size={18} /> Add expense
        </button>
      </section>

      {costs.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            text="Log a dinner, a ride or a hotel — choose who paid and who shares it."
            action={
              <button className="btn btn-primary" onClick={add}>
                <Plus size={18} /> Add your first expense
              </button>
            }
          />
        </section>
      ) : filtered.length === 0 ? (
        <section className="card">
          <EmptyState icon={SearchX} title="No matching expenses" text="Try a different search or member filter." />
        </section>
      ) : (
        <div className="expense-list">
          {filtered.map((c) => (
            <ExpenseCard
              key={c.id}
              cost={c}
              index={costs.indexOf(c)}
              members={members}
              fmt={fmt}
              expanded={expandedId === c.id}
              autoFocus={newId === c.id}
              isDragOver={overId === c.id && dragId !== c.id}
              isDragging={dragId === c.id}
              onToggle={() => {
                setNewId(null);
                setExpandedId((cur) => (cur === c.id ? null : c.id));
              }}
              onChange={onChange}
              onDelete={() => onDelete(c)}
              drag={drag}
            />
          ))}
        </div>
      )}

      <button className="fab" onClick={add} aria-label="Add expense">
        <Plus size={24} />
      </button>
    </div>
  );
};
