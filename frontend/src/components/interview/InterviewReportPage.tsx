import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Trash2, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { interviewApi } from "../../services/api";
import { Interview } from "../../types";
import { Button, Badge, ScoreRing, ProgressBar, Spinner } from "../ui";
import { AppLayout } from "../layout/AppLayout";

export const InterviewReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const justDone = sp.get("completed") === "true";

  useEffect(() => {
    interviewApi.getOne(Number(id)).then(r => setInterview(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this interview? This cannot be undone.")) return;
    await interviewApi.delete(Number(id));
    navigate("/history");
  };

  const download = () => {
    if (!interview) return;
    const txt = `ARYA InterviewMate — Report\n${"─".repeat(40)}\nRole: ${interview.role}\nDifficulty: ${interview.difficulty}\nDate: ${new Date(interview.created_at).toLocaleDateString()}\n\nSCORES\nOverall: ${interview.overall_score.toFixed(1)}/100\nTechnical: ${interview.technical_score.toFixed(1)}/100\nCommunication: ${interview.communication_score.toFixed(1)}/100\n\nSTRENGTHS\n${interview.strengths?.map(s => `· ${s}`).join("\n") || "None"}\n\nWEAKNESSES\n${interview.weaknesses?.map(w => `· ${w}`).join("\n") || "None"}\n\nMISSED CONCEPTS\n${interview.missed_concepts?.map(m => `· ${m}`).join("\n") || "None"}\n\nIMPROVEMENT PLAN\n${interview.improvement_plan || "None"}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = `ARYA-${interview.role.replace(/\s+/g, "-")}-${new Date(interview.created_at).toISOString().split("T")[0]}.txt`;
    a.click();
  };

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size="lg" /></div></AppLayout>;
  if (!interview) return <AppLayout><div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>Not found.</div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Completion banner */}
        {justDone && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 24, padding: "16px 20px", borderRadius: 12, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-1)", marginBottom: 2 }}>Interview complete</div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>Here's your detailed performance report</div>
          </motion.div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/history")}
              style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-raised)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{interview.role}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                <Badge variant={interview.difficulty === "Advanced" ? "red" : interview.difficulty === "Intermediate" ? "amber" : "green"}>{interview.difficulty}</Badge>
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{new Date(interview.created_at).toLocaleDateString()}</span>
                {interview.resume_used && <Badge variant="blue">Resume</Badge>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={download} icon={<Download size={13} />}>Report</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 size={13} />}>Delete</Button>
          </div>
        </div>

        {/* Scores */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ marginBottom: 16, display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <ScoreRing score={interview.overall_score} size={100} stroke={7} label="Overall" />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <ProgressBar value={interview.technical_score} label="Technical" showValue />
            <ProgressBar value={interview.communication_score} label="Communication" showValue />
            <ProgressBar value={interview.clarity_score} label="Clarity" showValue />
            <ProgressBar value={interview.confidence_score} label="Confidence" showValue color="green" />
            <ProgressBar value={interview.depth_score} label="Depth" showValue color="amber" />
          </div>
        </motion.div>

        {/* Strengths / Weaknesses */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <CheckCircle size={15} style={{ color: "var(--green)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Strengths</span>
            </div>
            {interview.strengths?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {interview.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: 7 }} />
                    {s}
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>Complete an interview to see strengths.</p>}
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <AlertTriangle size={15} style={{ color: "var(--amber)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Areas to improve</span>
            </div>
            {interview.weaknesses?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {interview.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber)", flexShrink: 0, marginTop: 7 }} />
                    {w}
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>No weaknesses identified.</p>}
          </motion.div>
        </div>

        {/* Topics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <BookOpen size={15} style={{ color: "var(--red)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Missed concepts</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {interview.missed_concepts?.length
                ? interview.missed_concepts.map((c, i) => <Badge key={i} variant="red">{c}</Badge>)
                : <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>None identified</span>}
            </div>
          </motion.div>
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.17 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <TrendingUp size={15} style={{ color: "var(--blue)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Recommended topics</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {interview.recommended_topics?.length
                ? interview.recommended_topics.map((t, i) => <Badge key={i} variant="blue">{t}</Badge>)
                : <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>None identified</span>}
            </div>
          </motion.div>
        </div>

        {/* Improvement plan */}
        {interview.improvement_plan && (
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ marginBottom: 16, borderColor: "var(--blue-border)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 3, height: 18, background: "var(--blue)", borderRadius: 2 }} />
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Improvement plan</span>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-2)", lineHeight: 1.7 }}>{interview.improvement_plan}</p>
          </motion.div>
        )}

        {/* Q&A breakdown */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: 16 }}>Question breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {interview.questions.map((q, i) => (
              <div key={q.id} style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <ScoreRing score={q.score} size={44} stroke={3} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.question_text}</div>
                    <div style={{ marginTop: 4 }}><Badge variant={TYPE_BADGE[q.question_type] || "neutral"}>{q.question_type}</Badge></div>
                  </div>
                  {expandedQ === i ? <ChevronUp size={14} style={{ color: "var(--text-3)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-3)" }} />}
                </button>
                {expandedQ === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    style={{ borderTop: "1px solid var(--line)", padding: "16px", background: "var(--bg-raised)" }}>
                    {q.answer_text && (
                      <div style={{ marginBottom: 14 }}>
                        <div className="caption" style={{ marginBottom: 6 }}>Your answer</div>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.6 }}>{q.answer_text}</p>
                      </div>
                    )}
                    {q.feedback && (
                      <div style={{ marginBottom: 14 }}>
                        <div className="caption" style={{ marginBottom: 6 }}>AI feedback</div>
                        <p style={{ fontSize: "0.875rem", color: "var(--blue)", lineHeight: 1.6 }}>{q.feedback}</p>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {[["Accuracy", q.accuracy_score], ["Clarity", q.clarity_score], ["Depth", q.depth_score], ["Comm.", q.communication_score]].map(([l, v]) => (
                        <div key={l as string} style={{ textAlign: "center", padding: "10px 8px", background: "var(--bg-card)", borderRadius: 8 }}>
                          <div className="mono" style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-1)" }}>{Number(v).toFixed(0)}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
          <Link to="/interview/setup" className="btn btn-primary">Practice again</Link>
          <Link to="/analytics" className="btn btn-ghost">View analytics</Link>
        </div>
      </div>
    </AppLayout>
  );
};

const TYPE_BADGE: Record<string, "blue" | "green" | "amber" | "neutral"> = {
  technical: "blue", behavioral: "green", hr: "amber", situational: "neutral",
};
