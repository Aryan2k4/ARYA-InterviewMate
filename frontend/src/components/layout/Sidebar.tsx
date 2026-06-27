import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Play, History, BarChart2,
  Trophy, BrainCircuit, ShieldCheck, LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/interview/setup", label: "New Interview", icon: Play },
  { path: "/history", label: "History", icon: History },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/coach", label: "AI Coach", icon: BrainCircuit },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>ARYA</div>
            <div style={{ fontSize: "0.625rem", fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Interview</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                textDecoration: "none",
                position: "relative",
                background: active ? "var(--blue-dim)" : "transparent",
                color: active ? "var(--blue)" : "var(--text-2)",
                fontWeight: active ? 600 : 500,
                fontSize: "0.875rem",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
            >
              {active && (
                <motion.div
                  layoutId="navActive"
                  style={{ position: "absolute", inset: 0, borderRadius: 8, background: "var(--blue-dim)", border: "1px solid var(--blue-border)" }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <Icon size={16} style={{ position: "relative", flexShrink: 0 }} />
              <span style={{ position: "relative" }}>{label}</span>
            </Link>
          );
        })}

        {user?.is_admin && (
          <Link
            to="/admin"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
              borderRadius: 8, textDecoration: "none", color: "var(--text-2)", fontWeight: 500, fontSize: "0.875rem",
            }}
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--line)" }}>
        <div style={{ padding: "10px", borderRadius: 8, marginBottom: 4 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-1)", marginBottom: 1 }}>
            {user?.full_name || user?.username}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px",
            borderRadius: 8, background: "none", border: "none", color: "var(--text-3)",
            fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,68,68,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
