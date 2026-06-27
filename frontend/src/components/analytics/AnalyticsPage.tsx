import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, AlertCircle, Target, BarChart2 } from "lucide-react";
import { analyticsApi } from "../../services/api";
import { Spinner, ProgressBar } from "../ui";
import { AppLayout } from "../layout/AppLayout";

const TT_STYLE = {
  backgroundColor: "#16161F",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  color: "#F0F0F5",
  fontSize: 12,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
};

export const AnalyticsPage = () => {
  const [trend, setTrend] = useState<any[]>([]);
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [skillGrowth, setSkillGrowth] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.performanceTrend(60),
      analyticsApi.topicWeaknesses(),
      analyticsApi.skillGrowth(),
    ]).then(([t, w, s]) => {
      setTrend(t.data);
      setWeaknesses(w.data);
      setSkillGrowth(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <Spinner size="lg" />
      </div>
    </AppLayout>
  );

  const allRoles = Object.keys(skillGrowth);
  const COLORS = ["#0066FF", "#00C896", "#F5A623", "#a78bfa", "#FF4444"];

  const radarData = weaknesses.slice(0, 6).map(w => ({
    subject: w.topic,
    score: Math.max(0, 100 - w.weakness_score),
    fullMark: 100,
  }));

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 className="heading-1" style={{ marginBottom: 6 }}>Analytics</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>
            {trend.length} sessions tracked
          </p>
        </div>

        {/* Performance trend */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <TrendingUp size={16} style={{ color: "var(--blue)" }} />
            <span className="heading-3">Performance trend</span>
            <span style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--text-3)" }}>
              Last 60 days
            </span>
          </div>
          {trend.length < 2 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "0.9375rem" }}>
              Complete more interviews to see your trend
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text-3)", fontSize: 11 }}
                  tickFormatter={v => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                <Tooltip contentStyle={TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-2)" }} />
                <Line type="monotone" dataKey="overall_score" stroke="#0066FF" strokeWidth={2.5}
                  dot={{ fill: "#0066FF", r: 3 }} name="Overall" />
                <Line type="monotone" dataKey="technical_score" stroke="#00C896" strokeWidth={2}
                  dot={{ fill: "#00C896", r: 3 }} name="Technical" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="communication_score" stroke="#F5A623" strokeWidth={2}
                  dot={{ fill: "#F5A623", r: 3 }} name="Communication" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Weaknesses + Radar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <AlertCircle size={16} style={{ color: "var(--amber)" }} />
              <span className="heading-3">Topic weaknesses</span>
            </div>
            {weaknesses.length === 0 ? (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "0.9375rem" }}>
                No weakness data yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {weaknesses.map((w, i) => (
                  <motion.div key={w.topic}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-1)", fontWeight: 500 }}>{w.topic}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{w.frequency} q</span>
                        <span style={{
                          fontSize: "0.75rem", fontWeight: 700,
                          color: w.weakness_score > 60 ? "var(--red)" : w.weakness_score > 30 ? "var(--amber)" : "var(--green)"
                        }}>
                          {w.weakness_score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      value={w.weakness_score}
                      color={w.weakness_score > 60 ? "amber" : "green"}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Target size={16} style={{ color: "var(--blue)" }} />
              <span className="heading-3">Skill radar</span>
            </div>
            {radarData.length < 3 ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "0.9375rem" }}>
                Answer more questions to see radar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject"
                    tick={{ fill: "var(--text-2)", fontSize: 11 }} />
                  <Radar name="Score" dataKey="score"
                    stroke="#0066FF" fill="#0066FF" fillOpacity={0.12} strokeWidth={2} />
                  <Tooltip contentStyle={TT_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Skill growth by role */}
        {allRoles.length > 0 && (
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <BarChart2 size={16} style={{ color: "var(--green)" }} />
              <span className="heading-3">Score by role</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
              {allRoles.map((role, i) => {
                const scores = (skillGrowth[role] as any[]).map((d: any) => d.score);
                const avg = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
                const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
                return (
                  <div key={role} style={{ padding: "14px", background: "var(--bg-raised)", borderRadius: 10, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>{role}</div>
                    <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{avg.toFixed(0)}</div>
                    <div style={{ fontSize: "0.75rem", color: trend >= 0 ? "var(--green)" : "var(--red)", marginTop: 4 }}>
                      {trend >= 0 ? "+" : ""}{trend.toFixed(0)} trend
                    </div>
                  </div>
                );
              })}
            </div>
            {Object.values(skillGrowth)[0]?.length >= 2 && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={(skillGrowth[allRoles[0]] as any[]).map((d: any, i: number) => {
                    const row: any = { date: d.date };
                    allRoles.forEach(r => { if ((skillGrowth[r] as any[])[i]) row[r] = (skillGrowth[r] as any[])[i].score; });
                    return row;
                  })}
                  margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-3)", fontSize: 10 }}
                    tickFormatter={v => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-3)", fontSize: 10 }} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-2)" }} />
                  {allRoles.map((role, i) => (
                    <Bar key={role} dataKey={role} fill={COLORS[i % COLORS.length]}
                      radius={[3, 3, 0, 0]} opacity={0.85} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};
