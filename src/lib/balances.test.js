import { describe, expect, it } from "vitest";
import { computeSummary, costStatus, simplifyTransactions } from "./balances.js";

const cost = (title, payers, sharedBy) => ({ id: title, title, payers, sharedBy });

describe("costStatus", () => {
  it("flags missing amounts and missing sharers", () => {
    expect(costStatus(cost("A", [], ["x"])).ok).toBe(false);
    expect(costStatus(cost("A", [{ name: "x", amount: "" }], ["x"])).ok).toBe(false);
    expect(costStatus(cost("A", [{ name: "x", amount: 10 }], [])).ok).toBe(false);
    expect(costStatus(cost("", [{ name: "x", amount: 10 }], ["x"]))).toMatchObject({ ok: true, label: "Ready (no title)" });
  });
});

describe("computeSummary", () => {
  it("splits equally and skips incomplete costs", () => {
    const members = ["Sara", "Rafi", "Nadia"];
    const costs = [
      cost("Dinner", [{ name: "Sara", amount: 300 }], members),
      cost("Uber", [{ name: "Rafi", amount: "60" }], ["Rafi", "Nadia"]),
      cost("Broken", [{ name: "Sara", amount: 0 }], members),
    ];
    const s = computeSummary(members, costs);
    expect(s.skipped).toBe(1);
    expect(s.total).toBe(360);
    expect(s.members.find((m) => m.name === "Sara")).toMatchObject({ paid: 300, consumed: 100, net: 200 });
    expect(s.members.find((m) => m.name === "Rafi")).toMatchObject({ paid: 60, consumed: 130, net: -70 });
    expect(s.members.find((m) => m.name === "Nadia")).toMatchObject({ paid: 0, consumed: 130, net: -130 });
  });

  it("supports multiple payers on one cost", () => {
    const s = computeSummary(["A", "B"], [cost("X", [{ name: "A", amount: 50 }, { name: "B", amount: 50 }], ["A", "B"])]);
    expect(s.members.every((m) => m.net === 0)).toBe(true);
  });
});

describe("simplifyTransactions", () => {
  it("produces transfers that settle every balance", () => {
    const members = ["Sara", "Rafi", "Nadia"];
    const costs = [
      cost("Dinner", [{ name: "Sara", amount: 300 }], members),
      cost("Uber", [{ name: "Rafi", amount: 60 }], ["Rafi", "Nadia"]),
    ];
    const tx = simplifyTransactions(members, costs);
    expect(tx).toEqual([
      { from: "Rafi", to: "Sara", amount: 70 },
      { from: "Nadia", to: "Sara", amount: 130 },
    ]);
  });

  it("returns nothing when everyone is even", () => {
    expect(simplifyTransactions(["A", "B"], [cost("X", [{ name: "A", amount: 10 }], ["A"])])).toEqual([]);
  });
});
