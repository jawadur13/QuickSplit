import { useState } from "react";
import { Plus, UserPlus, Users, X } from "lucide-react";
import { Avatar, EmptyState } from "./ui.jsx";

export const MembersView = ({ members, summary, fmt, onAdd, onRemove, onNext }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (members.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError(`“${trimmed}” is already in the group.`);
      return;
    }
    onAdd(trimmed);
    setName("");
    setError("");
  };

  const maxAbs = Math.max(1, ...summary.members.map((m) => Math.abs(m.net)));

  return (
    <div className="stack">
      <section className="card">
        <div className="card-head">
          <div>
            <h2 className="display">Who’s in the group?</h2>
            <p className="lede">Add everyone sharing costs. Removing someone later also removes them from every expense.</p>
          </div>
        </div>

        <form className="add-row" onSubmit={submit}>
          <div className={`field-icon ${error ? "has-error" : ""}`}>
            <UserPlus size={18} aria-hidden="true" />
            <input
              className="input input-lg"
              placeholder="Name, e.g. Nadia"
              value={name}
              aria-label="Member name"
              aria-invalid={!!error}
              aria-describedby={error ? "member-error" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={!name.trim()}>
            <Plus size={18} /> Add
          </button>
        </form>
        {error && (
          <p className="field-error" id="member-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {members.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={Users}
            title="Start with your people"
            text="Friends, flatmates, travel buddies — add a name above to begin."
          />
        </section>
      ) : (
        <section className="card card-flush">
          <div className="list-head">
            <span>
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            <span>Balance</span>
          </div>
          <ul className="member-list">
            {summary.members.map((m) => {
              const tone = m.net > 0 ? "pos" : m.net < 0 ? "neg" : "zero";
              return (
                <li className="member-row" key={m.name}>
                  <Avatar name={m.name} size={40} />
                  <div className="member-main">
                    <span className="member-name">{m.name}</span>
                    <span className="member-sub num">
                      Paid {fmt.money(m.paid)} · Share {fmt.money(m.consumed)}
                    </span>
                  </div>
                  <div className={`member-balance ${tone}`}>
                    <span className="num">
                      {m.net > 0 ? "+" : m.net < 0 ? "−" : ""}
                      {fmt.money(Math.abs(m.net))}
                    </span>
                    <span className="meter" aria-hidden="true">
                      <span style={{ width: `${(Math.abs(m.net) / maxAbs) * 100}%` }} />
                    </span>
                  </div>
                  <button className="icon-btn icon-btn-sm subtle" aria-label={`Remove ${m.name}`} onClick={() => onRemove(m.name)}>
                    <X size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="card-foot">
            <span className="muted">Balances update as you add expenses.</span>
            <button className="btn btn-secondary" onClick={onNext}>
              Add expenses
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
