import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { leaderboardApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, Badge } from "../ui";
import { AppLayout } from "../layout/AppLayout";

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([leaderboardApi.get(50), leaderboardApi.myRank()])
      .then(([l, r]) => { setEntries(l.data); setMyRank(r.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size="lg" /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="heading-1" style={{ marginBottom: 6 }}>Leaderboard</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Ranked by average interview score</p>
        </div>

        {/* My rank */}
        {myRank?.rank && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "14px 18px", borderRadius: 12, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--blue)", minWidth: 40 }}>#{myRank.rank}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Your rank</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-2)" }}>out of {myRank.total_users} users</div>
            </div>
            {myRank.rank <= 10 && <Badge variant="blue">Top 10</Badge>}
          </motion.div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 80px", gap: 0, padding: "10px 18px", borderBottom: "1px solid var(--line)" }}>
            {["Rank", "User", "Interviews", "Streak", "Avg"].map(h => (
              <div key={h} className="caption" style={{ textAlign: h === "Rank" ? "left" : h === "User" ? "left" : "center" }}>{h}</div>
            ))}
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-3)" }}>
              No rankings yet. Complete an interview to appear here.
            </div>
          ) : (
            <div>
              {entries.map((e, i) => {
                const isMe = e.username === user?.username;
                return (
                  <motion.div key={e.user_id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    style={{
                      display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 80px",
                      padding: "14px 18px", borderBottom: "1px solid var(--line)",
                      background: isMe ? "var(--blue-dim)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={e2 => { if (!isMe) (e2.currentTarget as HTMLElement).style.background = "var(--bg-raised)"; }}
                    onMouseLeave={e2 => { if (!isMe) (e2.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {/* Rank */}
                    <div className="mono" style={{
                      fontWeight: 800, fontSize: "0.9375rem",
                      color: e.rank === 1 ? "#F5A623" : e.rank === 2 ? "#9CA3AF" : e.rank === 3 ? "#CD7F32" : "var(--text-3)"
                    }}>
                      {e.rank <= 3 ? ["—", "01", "02", "03"][e.rank] : `${e.rank}`}
                    </div>
                    {/* User */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: isMe ? "var(--blue)" : "var(--bg-raised)",
                        border: `1px solid ${isMe ? "var(--blue)" : "var(--line)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 800, color: isMe ? "white" : "var(--text-2)",
                        flexShrink: 0,
                      }}>
                        {(e.full_name || e.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-1)" }}>
                          {e.username} {isMe && <span style={{ color: "var(--blue)", fontSize: "0.75rem" }}>(you)</span>}
                        </div>
                        {e.full_name && <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{e.full_name}</div>}
                      </div>
                    </div>
                    {/* Interviews */}
                    <div className="mono" style={{ textAlign: "center", fontWeight: 600, color: "var(--text-2)", fontSize: "0.875rem", alignSelf: "center" }}>
                      {e.total_interviews}
                    </div>
                    {/* Streak */}
                    <div style={{ textAlign: "center", alignSelf: "center" }}>
                      {e.streak > 0 ? (
                        <span className="mono" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                          <Flame size={12} />{e.streak}
                        </span>
                      ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                    </div>
                    {/* Score */}
                    <div className="mono" style={{ textAlign: "center", fontWeight: 800, fontSize: "1.0625rem", color: isMe ? "var(--blue)" : "var(--text-1)", alignSelf: "center" }}>
                      {e.average_score.toFixed(0)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
