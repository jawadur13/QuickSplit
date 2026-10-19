import { AlertTriangle, ChevronDown, Download, Eye, Scale, Users } from "lucide-react";
import { Avatar, EmptyState } from "./ui.jsx";

export const IncompleteBanner = ({ count, onReview }) =>
  count > 0 ? (
    <div className="banner" role="status">
      <AlertTriangle size={18} />
      <span>
        {count} {count === 1 ? "expense is" : "expenses are"} incomplete and not counted yet.
      </span>
      <button className="link-btn" onClick={onReview}>
        Review
      </button>
    </div>
  ) : null;

export const ExportButtons = ({ onDownload, onPreview }) => (
  <div className="export">
    <button className="btn btn-primary" onClick={onDownload}>
      <Download size={17} /> Download PDF
    </button>
    <button className="btn btn-ghost" onClick={onPreview}>
      <Eye size={17} /> Preview
    </button>
  </div>
);

export const BalancesView = ({ members, summary, fmt, goMembers, goExpenses, onDownload, onPreview }) => {
  if (!members.length) {
    return (
      <section className="card">
        <EmptyState
          icon={Users}
          title="No one here yet"
          text="Add members and expenses to see who paid what."
          action={
            <button className="btn btn-primary" onClick={goMembers}>
              Add members
            </button>
          }
        />
      </section>
    );
  }

  const maxBar = Math.max(1, ...summary.members.flatMap((m) => [m.paid, m.consumed]));

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <span className="eyebrow">Total group spend</span>
          <div className="hero-figure display num">{fmt.money(summary.total)}</div>
          <span className="hero-sub">
            {summary.ready} {summary.ready === 1 ? "expense" : "expenses"} · {members.length}{" "}
            {members.length === 1 ? "person" : "people"}
          </span>
        </div>
        {summary.ready > 0 && <ExportButtons onDownload={onDownload} onPreview={onPreview} />}
      </section>

      <IncompleteBanner count={summary.skipped} onReview={goExpenses} />

      {summary.ready === 0 ? (
        <section className="card">
          <EmptyState
            icon={Scale}
            title="Nothing to balance yet"
            text="Once an expense has an amount and people to split it, balances appear here."
            action={
              <button className="btn btn-primary" onClick={goExpenses}>
                Go to expenses
              </button>
            }
          />
        </section>
      ) : (
        <div className="balance-grid">
          {summary.members.map((m) => {
            const tone = m.net > 0 ? "pos" : m.net < 0 ? "neg" : "zero";
            const label = m.net > 0 ? "Gets back" : m.net < 0 ? "Owes" : "Settled";
            return (
              <article className="balance-card" key={m.name}>
                <div className="balance-top">
                  <Avatar name={m.name} size={40} />
                  <span className="balance-name">{m.name}</span>
                  <span className={`pill ${tone}`}>{label}</span>
                </div>

                <div className={`balance-net display num ${tone}`}>{fmt.money(Math.abs(m.net))}</div>

                <div className="bars">
                  <div className="bar-row">
                    <span>Paid</span>
                    <span className="bar" aria-hidden="true">
                      <span className="bar-fill paid" style={{ width: `${(m.paid / maxBar) * 100}%` }} />
                    </span>
                    <span className="num">{fmt.money(m.paid)}</span>
                  </div>
                  <div className="bar-row">
                    <span>Share</span>
                    <span className="bar" aria-hidden="true">
                      <span className="bar-fill share" style={{ width: `${(m.consumed / maxBar) * 100}%` }} />
                    </span>
                    <span className="num">{fmt.money(m.consumed)}</span>
                  </div>
                </div>

                {m.breakdown.length > 0 ? (
                  <details className="breakdown">
                    <summary>
                      Breakdown <span className="muted">({m.breakdown.length})</span>
                      <ChevronDown size={16} className="chev" aria-hidden="true" />
                    </summary>
                    <table>
                      <thead>
                        <tr>
                          <th>Expense</th>
                          <th>Paid</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.breakdown.map((b, i) => (
                          <tr key={i}>
                            <td>{b.title}</td>
                            <td className="num">{b.paid ? fmt.money(b.paid) : "—"}</td>
                            <td className="num">{b.consumed ? fmt.money(b.consumed) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                ) : (
                  <p className="muted breakdown-empty">No activity yet.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
