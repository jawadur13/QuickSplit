const STORAGE_KEY = "quicksplit_v2";
const LEGACY_KEY = "quicksplit_premium_v1";

export const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

// Normalises saved data, giving legacy costs stable ids and blank (not 0) amounts.
const normalise = (parsed) => ({
  members: Array.isArray(parsed.members) ? parsed.members : [],
  currency: parsed.currency || "BDT",
  costs: Array.isArray(parsed.costs)
    ? parsed.costs.map((c) => ({
        id: c.id || newId(),
        title: c.title || "",
        payers: (c.payers || []).map((p) => ({ name: p.name, amount: p.amount === 0 ? "" : p.amount })),
        sharedBy: c.sharedBy || [],
      }))
    : [],
});

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? normalise(parsed) : null;
  } catch (e) {
    return null;
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) { }
};
