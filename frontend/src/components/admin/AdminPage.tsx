import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, Star, Activity } from "lucide-react";
import { adminApi } from "../../services/api";
import { StatCard, Spinner, Badge } from "../ui";
import { AppLayout } from "../layout/AppLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TT_STYLE = {
  backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10, color: "#F0F0F5", fontSize: 12,
};

export const AdminPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.users()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size="lg" /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-1" style={{ marginBottom: 6 }}>Admin panel</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Platform overview</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total users" value={stats?.total_users ?? 0} icon={<Users size={16} />} />
          <StatCard label="Total interviews" value={stats?.total_interviews ?? 0} icon={<BarChart3 size={16} />} />
          <StatCard label="Platform avg" value={`${stats?.average_score?.toFixed(1) ?? 0}`} sub="out of 100" icon={<Star size={16} />} accent />
          <StatCard label="Active today" value={stats?.active_users_today ?? 0} icon={<Activity size={16} />} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: 20 }}>Popular roles</div>
            {stats?.popular_roles?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.popular_roles} layout="vertical" margin={{ left: 60, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="role" tick={{ fill: "var(--text-2)", fontSize: 11 }} width={110} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="count" fill="#0066FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>No data yet</div>}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: 16 }}>Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "New signups (7d)", value: stats?.recent_signups ?? 0, variant: "green" },
                { label: "Active today", value: stats?.active_users_today ?? 0, variant: "blue" },
                { label: "Platform avg score", value: `${stats?.average_score?.toFixed(1) ?? 0}/100`, variant: "amber" },
                { label: "Total interviews", value: stats?.total_interviews ?? 0, variant: "neutral" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-raised)", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>{item.label}</span>
                  <Badge variant={item.variant as any}>{item.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Users</span>
            <Badge variant="neutral">{users.length} total</Badge>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  {["User", "Email", "Interviews", "Streak", "Status", "Joined"].map(h => (
                    <th key={h} className="caption" style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid var(--line)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-raised)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-2)" }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-1)" }}>{u.username}</span>
                        {u.is_admin && <Badge variant="amber">Admin</Badge>}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "var(--text-3)" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }} className="mono"><span style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>{u.total_interviews}</span></td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }} className="mono"><span style={{ fontSize: "0.875rem", color: "var(--amber)" }}>{u.streak > 0 ? u.streak : "—"}</span></td>
                    <td style={{ padding: "12px 16px" }}><Badge variant={u.is_active ? "green" : "red"}>{u.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "var(--text-3)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
