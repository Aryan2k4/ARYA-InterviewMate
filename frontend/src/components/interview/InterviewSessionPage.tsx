import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronRight, CheckCircle, Clock, AlertCircle, BarChart2 } from "lucide-react";
import { interviewApi } from "../../services/api";
import { Interview, Question } from "../../types";
import { Button, ScoreRing, ProgressBar, Spinner, Badge } from "../ui";
import { AppLayout } from "../layout/AppLayout";

const TYPE_BADGE: Record<string, "blue" | "green" | "amber" | "neutral"> = {
  technical: "blue", behavioral: "green", hr: "amber", situational: "neutral",
};

export const InterviewSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    interviewApi.getOne(Number(id)).then(r => {
      setInterview(r.data);
      const done = new Set<number>();
      r.data.questions.forEach((q: Question, i: number) => { if (q.answer_text) done.add(i); });
      setAnswered(done);
      const next = r.data.questions.findIndex((_: Question, i: number) => !done.has(i));
      if (next >= 0) setCurrentIdx(next);
    }).finally(() => setLoading(false));
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current!);
  }, [id]);

  const q = interview?.questions[currentIdx];
  const progress = interview ? (answered.size / interview.questions.length) * 100 : 0;
  const allAnswered = interview ? answered.size >= interview.questions.length : false;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const submitAnswer = async () => {
    if (!answer.trim() || !q || !interview) return;
    setSubmitting(true); setFeedback(null);
    try {
      const res = await interviewApi.submitAnswer(interview.id, { question_id: q.id, answer_text: answer });
      setFeedback(res.data);
      setAnswered(prev => { const s = new Set(Array.from(prev)); s.add(currentIdx); return s; });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const nextQ = () => {
    setFeedback(null); setAnswer("");
    if (currentIdx < (interview?.questions.length ?? 0) - 1) setCurrentIdx(currentIdx + 1);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const complete = async () => {
    if (!interview) return;
    setCompleting(true);
    try {
      await interviewApi.complete(interview.id);
      navigate(`/history/${interview.id}?completed=true`);
    } catch (e) { console.error(e); }
    finally { setCompleting(false); }
  };

  if (loading) return <AppLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size="lg" /></div></AppLayout>;
  if (!interview) return <AppLayout><div style={{ textAlign: "center", padding: 80, color: "var(--text-2)" }}>Interview not found.</div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-1)" }}>{interview.role}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <Badge variant={interview.difficulty === "Advanced" ? "red" : interview.difficulty === "Intermediate" ? "amber" : "green"}>{interview.difficulty}</Badge>
              <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{interview.num_questions} questions</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
              <Clock size={13} />
              <span className="mono" style={{ fontSize: "0.875rem" }}>{fmt(elapsed)}</span>
            </div>
            {allAnswered && (
              <Button onClick={complete} loading={completing} icon={<BarChart2 size={14} />}>
                Get report
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-2)", fontWeight: 500 }}>Progress</span>
            <span className="mono" style={{ fontSize: "0.8125rem", color: "var(--text-1)", fontWeight: 600 }}>{answered.size}/{interview.questions.length}</span>
          </div>
          <ProgressBar value={progress} />
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {interview.questions.map((_, i) => (
              <button key={i} onClick={() => { setCurrentIdx(i); setFeedback(null); setAnswer(""); }}
                style={{
                  flex: 1, height: 6, borderRadius: 3, border: "none", cursor: "pointer", transition: "background 0.2s ease",
                  background: answered.has(i) ? "var(--green)" : i === currentIdx ? "var(--blue)" : "var(--line-hover)",
                }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}>
            <div className="card" style={{ marginBottom: 16, position: "relative", overflow: "hidden" }}>
              {/* Pulse ring — the signature element — shows when unanswered */}
              {!answered.has(currentIdx) && !feedback && (
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                  <div className="pulse-ring" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", boxShadow: "0 0 0 4px var(--blue-dim)" }} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>Q{currentIdx + 1}</span>
                <Badge variant={TYPE_BADGE[q?.question_type || "technical"]}>{q?.question_type}</Badge>
                {answered.has(currentIdx) && (
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--green)", fontWeight: 600 }}>
                    <CheckCircle size={12} /> Answered
                  </span>
                )}
              </div>

              <p style={{ fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.65, color: "var(--text-1)", marginBottom: 24 }}>
                {q?.question_text}
              </p>

              {!answered.has(currentIdx) ? (
                <div>
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Write your answer here. For behavioural questions, use the STAR method: Situation, Task, Action, Result."
                    rows={6}
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer(); }}
                    className="input"
                    style={{ resize: "none", lineHeight: 1.6, width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }} className="mono">{answer.length} chars · Cmd+Enter to submit</span>
                    <Button onClick={submitAnswer} loading={submitting} disabled={!answer.trim()} icon={<Send size={14} />}>
                      {submitting ? "Evaluating..." : "Submit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.6 }}>
                    "{q?.answer_text?.slice(0, 220)}{(q?.answer_text?.length ?? 0) > 220 ? "..." : ""}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              <div className="card" style={{ marginBottom: 16, borderColor: "var(--blue-border)" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
                  <ScoreRing score={feedback.score} size={72} stroke={5} label="Score" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-1)", marginBottom: 8 }}>AI Feedback</div>
                    <p style={{ fontSize: "0.9375rem", color: "var(--text-2)", lineHeight: 1.6 }}>{feedback.feedback}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                  <div>
                    <div className="caption" style={{ marginBottom: 12 }}>Score breakdown</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <ProgressBar value={feedback.accuracy_score} label="Accuracy" showValue />
                      <ProgressBar value={feedback.clarity_score} label="Clarity" showValue />
                      <ProgressBar value={feedback.depth_score} label="Depth" showValue />
                      <ProgressBar value={feedback.communication_score} label="Communication" showValue />
                    </div>
                  </div>
                  <div>
                    {feedback.strengths_shown?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div className="caption" style={{ marginBottom: 8 }}>Strengths</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {feedback.strengths_shown.map((s: string, i: number) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.8125rem", color: "var(--green)" }}>
                              <CheckCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {feedback.areas_to_improve?.length > 0 && (
                      <div>
                        <div className="caption" style={{ marginBottom: 8 }}>Improve</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {feedback.areas_to_improve.map((a: string, i: number) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: "0.8125rem", color: "var(--amber)" }}>
                              <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {allAnswered ? (
                  <Button onClick={complete} loading={completing} icon={<BarChart2 size={14} />} size="lg">
                    Finish and get full report
                  </Button>
                ) : (
                  <Button onClick={nextQ} icon={<ChevronRight size={14} />}>
                    Next question
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question navigator */}
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600, marginRight: 4 }}>Jump to:</span>
            {interview.questions.map((_, i) => (
              <button key={i} onClick={() => { setCurrentIdx(i); setFeedback(null); setAnswer(""); }}
                className="mono"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
                  background: answered.has(i) ? "rgba(0,200,150,0.1)" : i === currentIdx ? "var(--blue)" : "var(--bg-raised)",
                  color: answered.has(i) ? "var(--green)" : i === currentIdx ? "white" : "var(--text-2)",
                  transition: "all 0.15s ease",
                }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
