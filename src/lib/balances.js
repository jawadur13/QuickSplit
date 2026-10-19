// Pure split math. No React, no DOM — safe to unit test.

export const safeNumber = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
};

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const costTotal = (cost) =>
  cost.payers.reduce((s, p) => s + safeNumber(p.amount), 0);

export const costStatus = (cost) => {
  const hasTitle = (cost.title || "").trim().length > 0;
  const hasPayers = cost.payers.length > 0 && cost.payers.some((p) => safeNumber(p.amount) > 0);
  const hasShared = cost.sharedBy.length > 0;

  if (!hasPayers) return { ok: false, label: "Needs an amount", type: "warn" };
  if (!hasShared) return { ok: false, label: "Needs people to split", type: "warn" };
  if (!hasTitle) return { ok: true, label: "Ready (no title)", type: "ok" };
  return { ok: true, label: "Ready", type: "ok" };
};

// Per-member paid / consumed / net with a per-cost breakdown.
export const computeSummary = (members, costs) => {
  const data = {};
  members.forEach((m) => {
    data[m] = { paid: 0, consumed: 0, breakdown: [] };
  });

  let skipped = 0;
  let total = 0;
  let ready = 0;

  costs.forEach((c, idx) => {
    if (!costStatus(c).ok) {
      skipped++;
      return;
    }
    ready++;

    const sum = costTotal(c);
    const share = sum / c.sharedBy.length;
    total += sum;

    c.payers.forEach((p) => {
      if (data[p.name]) data[p.name].paid += safeNumber(p.amount);
    });
    c.sharedBy.forEach((m) => {
      if (data[m]) data[m].consumed += share;
    });

    members.forEach((m) => {
      const paidHere = c.payers
        .filter((p) => p.name === m)
        .reduce((s, p) => s + safeNumber(p.amount), 0);
      const consumedHere = c.sharedBy.includes(m) ? share : 0;

      if (paidHere > 0 || consumedHere > 0) {
        data[m].breakdown.push({
          title: (c.title || `Expense ${idx + 1}`).trim(),
          paid: round2(paidHere),
          consumed: round2(consumedHere),
        });
      }
    });
  });

  return {
    skipped,
    ready,
    total: round2(total),
    members: members.map((m) => {
      const paid = round2(data[m].paid);
      const consumed = round2(data[m].consumed);
      return { name: m, paid, consumed, net: round2(paid - consumed), breakdown: data[m].breakdown };
    }),
  };
};

// Greedy debtor → creditor matching to settle all balances.
export const simplifyTransactions = (members, costs) => {
  const { members: rows } = computeSummary(members, costs);

  const debt = [];
  const cred = [];
  rows.forEach(({ name, net }) => {
    if (net < 0) debt.push([name, -net]);
    if (net > 0) cred.push([name, net]);
  });

  const tx = [];
  debt.forEach((d) => {
    cred.forEach((c) => {
      if (d[1] > 0 && c[1] > 0) {
        const a = round2(Math.min(d[1], c[1]));
        d[1] = round2(d[1] - a);
        c[1] = round2(c[1] - a);
        if (a > 0) tx.push({ from: d[0], to: c[0], amount: a });
      }
    });
  });

  return tx;
};
