import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, TrendingUp, Target, MessageSquare, BarChart3, ArrowRight, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { analyticsApi, interviewApi } from "../../services/api";
import { AnalyticsSummary, Interview } from "../../types";
import { StatCard, ScoreRing, ProgressBar, Badge, Spinner } from "../ui";
import { AppLayout } from "../layout/AppLayout";

const QUICK_ROLES = [
  { role: "Software Engineer", tag: "SWE" },
  { role: "AI Engineer", tag: "AI" },
  { role: "Data Scientist", tag: "DS" },
  { role: "Frontend Developer", tag: "FE" },
  { role: "Backend Developer", tag: "BE" },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recent, setRecent] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.summary(), interviewApi.getAll(0, 6)])
      .then(([a, i]) => { setAnalytics(a.data); setRecent(i.data); })
      .finally(() => setLoading(false));
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}><Spinner size="lg" /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="caption" style={{ marginBottom: 6 }}>{greet()}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <h1 className="heading-1">{user?.full_name?.split(" ")[0] || user?.username}</h1>
            <Link to="/interview/setup" className="btn btn-primary">
              <Play size={15} /> Start interview
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Interviews", value: analytics?.total_interviews ?? 0, sub: "completed", icon: <BarChart3 size={16} />, accent: false },
            { label: "Avg Score", value: `${analytics?.average_score?.toFixed(0) ?? 0}`, sub: "out of 100", icon: <Target size={16} />, accent: true },
            { label: "Technical", value: `${analytics?.technical_score?.toFixed(0) ?? 0}`, sub: "average", icon: <TrendingUp size={16} /> },
            { label: "Communication", value: `${analytics?.communication_score?.toFixed(0) ?? 0}`, sub: "average", icon: <MessageSquare size={16} /> },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
          {/* Main column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Performance bars */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="heading-3">Performance overview</h2>
                {analytics?.improvement_trend !== undefined && (
                  <Badge variant={analytics.improvement_trend >= 0 ? "green" : "red"}>
                    {analytics.improvement_trend >= 0 ? "+" : ""}{analytics.improvement_trend.toFixed(1)}% trend
                  </Badge>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <ProgressBar value={analytics?.average_score ?? 0} label="Overall" showValue />
                <ProgressBar value={analytics?.technical_score ?? 0} label="Technical" showValue />
                <ProgressBar value={analytics?.communication_score ?? 0} label="Communication" showValue />
                <ProgressBar value={analytics?.success_rate ?? 0} label="Success rate (≥70)" showValue color="green" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
                {[
                  { label: "This week", value: analytics?.interviews_this_week ?? 0 },
                  { label: "Best score", value: analytics?.best_score?.toFixed(0) ?? 0 },
                  { label: "Success rate", value: `${analytics?.success_rate?.toFixed(0) ?? 0}%` },
                ].map(item => (
                  <div key={item.label} style={{ padding: "12px 14px", background: "var(--bg-raised)", borderRadius: 10 }}>
                    <div className="mono" style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4, fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent interviews */}
            <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 className="heading-3">Recent sessions</h2>
                <Link to="/history" style={{ fontSize: "0.8125rem", color: "var(--blue)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              {recent.filter(i => i.status === "completed").length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ color: "var(--text-3)", fontSize: "0.9375rem", marginBottom: 16 }}>No completed interviews yet.</p>
                  <Link to="/interview/setup" className="btn btn-primary btn-sm">Start your first</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {recent.filter(i => i.status === "completed").slice(0, 5).map((interview, i) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/history/${interview.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 16, padding: "12px 10px",
                          borderRadius: 10, textDecoration: "none",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <ScoreRing score={interview.overall_score} size={48} stroke={4} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-1)", marginBottom: 3 }}>{interview.role}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Badge variant={interview.difficulty === "Advanced" ? "red" : interview.difficulty === "Intermediate" ? "amber" : "green"}>{interview.difficulty}</Badge>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{new Date(interview.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: "var(--text-3)" }} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick start */}
            <motion.div className="card" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}>
              <h2 className="heading-3" style={{ marginBottom: 16 }}>Quick start</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {QUICK_ROLES.map(({ role, tag }) => (
                  <Link
                    key={role}
                    to={`/interview/setup?role=${encodeURIComponent(role)}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 8, textDecoration: "none", transition: "background 0.15s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", fontWeight: 800, color: "var(--blue)", letterSpacing: "0.02em" }}>
                      {tag}
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-2)", flex: 1, fontWeight: 500 }}>{role}</span>
                    <ArrowRight size={13} style={{ color: "var(--text-3)" }} />
                  </Link>
                ))}
              </div>
              <div style={{ height: 1, background: "var(--line)", margin: "12px 0" }} />
              <Link to="/interview/setup?resume=true"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, textDecoration: "none", background: "var(--blue-dim)", border: "1px solid var(--blue-border)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M2 1h6l3 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 1v3h3" stroke="white" strokeWidth="1.5" /></svg>
                </div>
                <span style={{ fontSize: "0.875rem", color: "var(--blue)", fontWeight: 600, flex: 1 }}>Resume interview</span>
                <ArrowRight size={13} style={{ color: "var(--blue)" }} />
              </Link>
            </motion.div>

            {/* Streak */}
            {user && user.streak > 0 && (
              <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--blue)", letterSpacing: "-0.03em", lineHeight: 1 }}>{user.streak}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-2)", marginTop: 4, fontWeight: 500 }}>day streak</div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
