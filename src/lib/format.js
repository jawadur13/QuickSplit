export const CURRENCIES = [
  ["BDT", "Bangladeshi Taka"],
  ["USD", "US Dollar"],
  ["GBP", "British Pound"],
  ["EUR", "Euro"],
  ["SAR", "Saudi Riyal"],
  ["AED", "UAE Dirham"],
  ["MYR", "Malaysian Ringgit"],
  ["INR", "Indian Rupee"],
  ["CNY", "Chinese Yuan"],
  ["JPY", "Japanese Yen"],
  ["SGD", "Singapore Dollar"],
  ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"],
  ["KWD", "Kuwaiti Dinar"],
  ["QAR", "Qatari Riyal"],
  ["OMR", "Omani Rial"],
  ["BHD", "Bahraini Dinar"],
  ["KRW", "South Korean Won"],
  ["THB", "Thai Baht"],
  ["CHF", "Swiss Franc"],
];

const cache = new Map();

// Returns { money, plain, symbol, digits } for a currency code.
// `money` uses the local symbol (৳1,200.00); `plain` is digits only, for PDFs whose fonts lack symbols.
export const getFormatter = (currency) => {
  if (cache.has(currency)) return cache.get(currency);

  const money = new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol" });
  const digits = money.resolvedOptions().maximumFractionDigits;
  const plain = new Intl.NumberFormat("en", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const symbol = money.formatToParts(0).find((p) => p.type === "currency")?.value || currency;

  const f = {
    digits,
    symbol,
    money: (n) => money.format(n),
    plain: (n) => plain.format(n),
  };
  cache.set(currency, f);
  return f;
};
