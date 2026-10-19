import { useRef } from "react";
import { Check, ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react";
import { costStatus, costTotal } from "../lib/balances.js";
import { Avatar, AvatarStack } from "./ui.jsx";

export const ExpenseCard = ({
  cost: c,
  index,
  members,
  fmt,
  expanded,
  autoFocus,
  isDragOver,
  isDragging,
  onToggle,
  onChange,
  onDelete,
  drag,
}) => {
  const cardRef = useRef(null);
  const status = costStatus(c);
  const total = costTotal(c);
  const each = c.sharedBy.length ? total / c.sharedBy.length : 0;
  const bodyId = `expense-body-${c.id}`;

  const payerNames = [...new Set(c.payers.filter((p) => Number(p.amount) > 0).map((p) => p.name))];
  const meta = [
    payerNames.length ? `Paid by ${payerNames[0]}${payerNames.length > 1 ? ` +${payerNames.length - 1}` : ""}` : null,
    c.sharedBy.length ? `split ${c.sharedBy.length} ${c.sharedBy.length === 1 ? "way" : "ways"}` : null,
  ].filter(Boolean);

  const setPayers = (payers) => onChange({ ...c, payers });
  const setShared = (sharedBy) => onChange({ ...c, sharedBy });

  const toggleShare = (name) =>
    setShared(c.sharedBy.includes(name) ? c.sharedBy.filter((n) => n !== name) : members.filter((m) => m === name || c.sharedBy.includes(m)));

  return (
    <article
      ref={cardRef}
      className={`expense ${expanded ? "is-open" : ""} ${isDragOver ? "is-over" : ""} ${isDragging ? "is-dragging" : ""}`}
      onDragOver={(e) => drag.over(e, c.id)}
      onDrop={(e) => drag.drop(e, c.id)}
    >
      <div className="expense-head">
        <span
          className="grip"
          draggable
          title="Drag to reorder"
          aria-hidden="true"
          onDragStart={(e) => drag.start(e, c.id, cardRef.current)}
          onDragEnd={drag.end}
        >
          <GripVertical size={16} />
        </span>

        <button className="expense-summary" onClick={onToggle} aria-expanded={expanded} aria-controls={bodyId}>
          <span className="expense-index num">{String(index + 1).padStart(2, "0")}</span>
          <span className="expense-text">
            <span className={`expense-title ${c.title.trim() ? "" : "is-placeholder"}`}>
              {c.title.trim() || "Untitled expense"}
            </span>
            <span className="expense-meta">
              {status.ok ? (
                meta.join(" · ")
              ) : (
                <span className="text-warn">{status.label}</span>
              )}
            </span>
          </span>
          {c.sharedBy.length > 0 && <AvatarStack names={c.sharedBy} />}
          <span className="expense-amount num">{fmt.money(total)}</span>
          <span className={`status-dot ${status.type}`} title={status.label} />
          <ChevronDown size={18} className="chev" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="expense-body" id={bodyId}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="input"
              placeholder="e.g. Dinner, Uber, Hotel"
              value={c.title}
              autoFocus={autoFocus}
              onChange={(e) => onChange({ ...c, title: e.target.value })}
            />
          </label>

          <div className="expense-grid">
            <div className="field">
              <span className="field-label">Paid by</span>
              {c.payers.length === 0 && <p className="muted">No one has paid yet.</p>}
              <div className="payer-list">
                {c.payers.map((p, j) => (
                  <div className="payer-row" key={j}>
                    <select
                      className="input"
                      aria-label={`Payer ${j + 1}`}
                      value={p.name}
                      onChange={(e) => setPayers(c.payers.map((x, k) => (k === j ? { ...x, name: e.target.value } : x)))}
                    >
                      {members.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="money-input">
                      <span className="money-prefix num" aria-hidden="true">{fmt.symbol}</span>
                      <input
                        className="input num"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        placeholder={(0).toFixed(fmt.digits)}
                        aria-label={`Amount paid by ${p.name}`}
                        value={p.amount}
                        onChange={(e) => setPayers(c.payers.map((x, k) => (k === j ? { ...x, amount: e.target.value } : x)))}
                      />
                    </div>
                    <button
                      className="icon-btn icon-btn-sm subtle"
                      aria-label={`Remove payer ${p.name}`}
                      onClick={() => setPayers(c.payers.filter((_, k) => k !== j))}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="link-btn"
                onClick={() => setPayers([...c.payers, { name: members[0], amount: "" }])}
                disabled={!members.length}
              >
                <Plus size={15} /> Add payer
              </button>
            </div>

            <div className="field">
              <div className="field-label-row">
                <span className="field-label">Split between</span>
                <span className="segmented-links">
                  <button className="link-btn" onClick={() => setShared([...members])}>
                    Everyone
                  </button>
                  <button className="link-btn" onClick={() => setShared([])}>
                    None
                  </button>
                </span>
              </div>
              <div className="chips">
                {members.map((m) => {
                  const on = c.sharedBy.includes(m);
                  return (
                    <button key={m} className={`chip ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => toggleShare(m)}>
                      <Avatar name={m} size={22} />
                      <span>{m}</span>
                      {on && <Check size={14} className="chip-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="expense-foot">
            <p className="expense-calc num">
              <strong>{fmt.money(total)}</strong>
              {c.sharedBy.length > 0 && (
                <>
                  <span className="dot-sep">·</span>
                  {fmt.money(each)} each
                  <span className="dot-sep">·</span>
                  {c.sharedBy.length} {c.sharedBy.length === 1 ? "person" : "people"}
                </>
              )}
            </p>
            <div className="expense-actions">
              <button className="btn btn-ghost-danger" onClick={onDelete}>
                <Trash2 size={16} /> Delete
              </button>
              <button className="btn btn-secondary" onClick={onToggle}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
