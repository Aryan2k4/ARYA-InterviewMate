import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Search, ChevronRight } from "lucide-react";
import { interviewApi } from "../../services/api";
import { Interview } from "../../types";
import { Badge, ScoreRing, Spinner } from "../ui";
import { AppLayout } from "../layout/AppLayout";

export const HistoryPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    interviewApi.getAll(0, 50).then(r => setInterviews(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = interviews.filter(i => {
    const s = i.role.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || i.difficulty.toLowerCase() === filter || i.status === filter;
    return s && f;
  });

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size="lg" /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 className="heading-1" style={{ marginBottom: 4 }}>History</h1>
            <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>{interviews.length} sessions</p>
          </div>
          <Link to="/interview/setup" className="btn btn-primary"><Play size={14} /> New interview</Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 280 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                placeholder="Search by role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "completed", "beginner", "intermediate", "advanced"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.8125rem", fontFamily: "inherit", transition: "all 0.15s ease",
                  background: filter === f ? "var(--blue)" : "var(--bg-raised)",
                  color: filter === f ? "white" : "var(--text-2)",
                }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "var(--text-3)", marginBottom: 16 }}>No interviews found.</p>
            <Link to="/interview/setup" className="btn btn-primary btn-sm">Start one now</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map((interview, i) => (
              <motion.div key={interview.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  to={interview.status === "completed" ? `/history/${interview.id}` : `/interview/${interview.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                    borderRadius: 12, textDecoration: "none", background: "var(--bg-card)",
                    border: "1px solid var(--line)", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line-hover)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
                >
                  <ScoreRing score={interview.status === "completed" ? interview.overall_score : 0} size={52} stroke={4} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-1)", marginBottom: 5 }}>{interview.role}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Badge variant={interview.difficulty === "Advanced" ? "red" : interview.difficulty === "Intermediate" ? "amber" : "green"}>{interview.difficulty}</Badge>
                      <Badge variant={interview.status === "completed" ? "green" : "amber"}>{interview.status === "completed" ? "Completed" : "In progress"}</Badge>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{interview.num_questions} questions</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{new Date(interview.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {interview.status === "completed" && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Technical</div>
                      <div className="mono" style={{ fontWeight: 700, color: "var(--blue)" }}>{interview.technical_score.toFixed(0)}</div>
                    </div>
                  )}
                  <ChevronRight size={14} style={{ color: "var(--text-3)" }} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
