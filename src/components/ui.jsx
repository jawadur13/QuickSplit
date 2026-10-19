import { useEffect, useRef } from "react";

export const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
    <rect width="32" height="32" rx="9" fill="var(--brand)" />
    <path d="M16 7a9 9 0 0 0 0 18z" fill="var(--gold)" />
    <path d="M17.5 7.13a9 9 0 0 1 0 17.74z" fill="none" stroke="var(--gold)" strokeWidth="1.6" />
  </svg>
);

// Muted, jewel-like tints that sit well on ivory and charcoal.
const AVATAR_HUES = [158, 32, 205, 345, 270, 18, 120, 230];

const hashName = (name) => [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const initials = (name) => {
  const parts = name.trim().split(/\s+/);
  const two = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.trim().slice(0, 2);
  return two.toUpperCase();
};

export const Avatar = ({ name, size = 36 }) => {
  const hue = AVATAR_HUES[hashName(name) % AVATAR_HUES.length];
  return (
    <span
      className="avatar"
      style={{ "--h": hue, width: size, height: size, fontSize: Math.round(size * 0.38) }}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
};

export const AvatarStack = ({ names, max = 4, size = 24 }) => {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-stack" aria-label={names.join(", ")}>
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {extra > 0 && (
        <span className="avatar avatar-more" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
          +{extra}
        </span>
      )}
    </span>
  );
};

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="empty">
    <div className="empty-icon">
      <Icon size={26} strokeWidth={1.6} />
    </div>
    <h3 className="display">{title}</h3>
    <p>{text}</p>
    {action}
  </div>
);

// Styled replacement for window.confirm(), driven by a { title, message, confirmLabel, tone } request.
export const ConfirmDialog = ({ request, onDone }) => {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (request && !d.open) d.showModal();
    if (!request && d.open) d.close();
  }, [request]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(e) => {
        e.preventDefault();
        onDone(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) onDone(false);
      }}
    >
      {request && (
        <div className="dialog-body">
          <h3 className="display">{request.title}</h3>
          {request.message && <p>{request.message}</p>}
          <div className="dialog-actions">
            <button className="btn btn-ghost" onClick={() => onDone(false)}>
              Cancel
            </button>
            <button
              className={`btn ${request.tone === "danger" ? "btn-danger" : "btn-primary"}`}
              onClick={() => onDone(true)}
              autoFocus
            >
              {request.confirmLabel || "Confirm"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};
