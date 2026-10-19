import { ArrowRight, ArrowRightLeft, CircleCheck, Users } from "lucide-react";
import { ExportButtons, IncompleteBanner } from "./BalancesView.jsx";
import { Avatar, EmptyState } from "./ui.jsx";

export const SettleView = ({ members, summary, transfers, fmt, goMembers, goExpenses, onDownload, onPreview }) => {
  if (!members.length) {
    return (
      <section className="card">
        <EmptyState
          icon={Users}
          title="No one here yet"
          text="Add members and expenses, and QuickSplit will work out who pays whom."
          action={
            <button className="btn btn-primary" onClick={goMembers}>
              Add members
            </button>
          }
        />
      </section>
    );
  }

  if (summary.ready === 0) {
    return (
      <div className="stack">
        <IncompleteBanner count={summary.skipped} onReview={goExpenses} />
        <section className="card">
          <EmptyState
            icon={ArrowRightLeft}
            title="Nothing to settle yet"
            text="Add an expense with an amount and the people sharing it."
            action={
              <button className="btn btn-primary" onClick={goExpenses}>
                Go to expenses
              </button>
            }
          />
        </section>
      </div>
    );
  }

  const moved = transfers.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="stack">
      {transfers.length === 0 ? (
        <section className="card settled">
          <div className="settled-icon">
            <CircleCheck size={34} strokeWidth={1.6} />
          </div>
          <h2 className="display">Everyone’s even</h2>
          <p className="lede">No transfers needed — every share is already covered.</p>
        </section>
      ) : (
        <>
          <section className="hero">
            <div>
              <span className="eyebrow">Settle everything in</span>
              <div className="hero-figure display">
                {transfers.length} {transfers.length === 1 ? "transfer" : "transfers"}
              </div>
              <span className="hero-sub num">{fmt.money(moved)} changes hands</span>
            </div>
            <ExportButtons onDownload={onDownload} onPreview={onPreview} />
          </section>

          <IncompleteBanner count={summary.skipped} onReview={goExpenses} />

          <section className="card card-flush">
            <ol className="transfer-list">
              {transfers.map((t, i) => (
                <li className="transfer" key={i}>
                  <span className="transfer-party">
                    <Avatar name={t.from} size={38} />
                    <span className="transfer-name">{t.from}</span>
                  </span>
                  <span className="transfer-arrow" aria-label="pays">
                    <span className="transfer-line" />
                    <ArrowRight size={16} />
                  </span>
                  <span className="transfer-party">
                    <Avatar name={t.to} size={38} />
                    <span className="transfer-name">{t.to}</span>
                  </span>
                  <span className="transfer-amount display num">{fmt.money(t.amount)}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
};
