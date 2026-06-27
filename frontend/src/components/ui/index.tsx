import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ── Button ──────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}
export const Button = ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...rest }: BtnProps) => {
  const v = { primary: "btn-primary", ghost: "btn-ghost", danger: "btn-danger" };
  const s = { sm: "btn-sm", md: "", lg: "btn-lg" };
  return (
    <button className={`btn ${v[variant]} ${s[size]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ── Input ───────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}
export const Input = ({ label, error, icon, className = "", ...rest }: InputProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label className="input-label">{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" }}>
          {icon}
        </span>
      )}
      <input
        className={`input ${className}`}
        style={icon ? { paddingLeft: 42 } : {}}
        {...rest}
      />
    </div>
    {error && <span style={{ fontSize: "0.75rem", color: "var(--red)" }}>{error}</span>}
  </div>
);

// ── Textarea ────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = ({ label, error, className = "", ...rest }: TextareaProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label className="input-label">{label}</label>}
    <textarea
      className={`input ${className}`}
      style={{ resize: "none", lineHeight: 1.6 }}
      {...rest}
    />
    {error && <span style={{ fontSize: "0.75rem", color: "var(--red)" }}>{error}</span>}
  </div>
);

// ── Badge ───────────────────────────────────────────────────────────
type BadgeVariant = "blue" | "green" | "amber" | "red" | "neutral";
export const Badge = ({ children, variant = "neutral" }: { children: ReactNode; variant?: BadgeVariant }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

// ── Score Ring ──────────────────────────────────────────────────────
export const ScoreRing = ({ score, size = 80, stroke = 6, label }: { score: number; size?: number; stroke?: number; label?: string }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const color = score >= 80 ? "var(--green)" : score >= 60 ? "var(--amber)" : "var(--red)";
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size, flexDirection: "column", gap: 2 }}>
      <svg width={size} height={size} style={{ position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-hover)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: size < 70 ? "1rem" : "1.375rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{Math.round(score)}</div>
        {label && <div style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: 2, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>}
      </div>
    </div>
  );
};

// ── Progress bar ────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = "blue", label, showValue }: { value: number; max?: number; color?: string; label?: string; showValue?: boolean }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {label && <span style={{ fontSize: "0.8125rem", color: "var(--text-2)", fontWeight: 500 }}>{label}</span>}
          {showValue && <span className="mono" style={{ fontSize: "0.8125rem", color: "var(--text-2)" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className={`progress-fill${color === "green" ? " green" : color === "amber" ? " amber" : ""}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

// ── Stat card ───────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon, accent = false }: { label: string; value: string | number; sub?: string; icon?: ReactNode; accent?: boolean }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span className="caption">{label}</span>
      {icon && <span style={{ color: accent ? "var(--blue)" : "var(--text-3)", display: "flex" }}>{icon}</span>}
    </div>
    <div>
      <div className="mono stat-num" style={{ fontSize: "2rem", fontWeight: 700, color: accent ? "var(--blue)" : "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.8125rem", color: "var(--text-2)", marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

// ── Spinner ─────────────────────────────────────────────────────────
export const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const s = { sm: 16, md: 24, lg: 40 }[size];
  return <Loader2 size={s} className="animate-spin" style={{ color: "var(--blue)" }} />;
};

// ── Empty state ─────────────────────────────────────────────────────
export const Empty = ({ icon, title, desc, action }: { icon: ReactNode; title: string; desc?: string; action?: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "64px 24px", gap: 12 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-raised)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
      {desc && <div style={{ fontSize: "0.875rem", color: "var(--text-2)", maxWidth: 280, margin: "0 auto" }}>{desc}</div>}
    </div>
    {action}
  </div>
);

// ── Select ──────────────────────────────────────────────────────────
export const Select = ({ label, options, ...rest }: { label?: string; options: { value: string | number; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label className="input-label">{label}</label>}
    <select className="input" style={{ cursor: "pointer" }} {...rest}>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: "var(--bg-card)" }}>{o.label}</option>)}
    </select>
  </div>
);
