import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info, Moon, MoreHorizontal, RotateCcw, Sun } from "lucide-react";
import { CURRENCIES, getFormatter } from "../lib/format.js";
import { Logo } from "./ui.jsx";

const MoreMenu = ({ onReset }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        className="icon-btn"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <a className="menu-item" role="menuitem" href="about.html">
            <Info size={16} /> How it works
          </a>
          <div className="menu-sep" />
          <button
            className="menu-item danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onReset();
            }}
          >
            <RotateCcw size={16} /> Reset all data
          </button>
        </div>
      )}
    </div>
  );
};

export const Header = ({ currency, onCurrency, isDark, onToggleTheme, onReset }) => (
  <header className="topbar">
    <a className="brand" href="./" aria-label="QuickSplit home">
      <Logo />
      <span className="brand-text">
        <span className="brand-name display">QuickSplit</span>
        <span className="brand-tag">Split bills, not friendships.</span>
      </span>
    </a>

    <div className="topbar-actions">
      <label className="currency">
        <span className="currency-symbol num" aria-hidden="true">{getFormatter(currency).symbol}</span>
        <span className="sr-only">Currency</span>
        <select value={currency} onChange={(e) => onCurrency(e.target.value)}>
          {CURRENCIES.map(([code, name]) => (
            <option key={code} value={code}>
              {code} — {name}
            </option>
          ))}
        </select>
        <span className="currency-code">{currency}</span>
        <ChevronDown size={14} className="currency-chev" aria-hidden="true" />
      </label>

      <button className="icon-btn" onClick={onToggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <MoreMenu onReset={onReset} />
    </div>
  </header>
);
