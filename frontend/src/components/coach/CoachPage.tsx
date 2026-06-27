import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Calendar, Map, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { coachApi } from "../../services/api";
import { CoachPlan } from "../../types";
import { Button, Badge, Spinner } from "../ui";
import { AppLayout } from "../layout/AppLayout";
import { useAuth } from "../../context/AuthContext";

interface Msg { role: "user" | "assistant"; content: string; id: string; }

const STARTERS = [
  "What should I focus on this week?",
  "How do I improve my technical answers?",
  "What's a good system design resource?",
  "I keep blanking in interviews. Help.",
  "How should I answer behavioural questions?",
  "What's the best way to prepare in 2 weeks?",
];

export const CoachPage = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi${user?.full_name ? ` ${user.full_name.split(" ")[0]}` : ""}. I'm your AI career coach. I know your interview history and can build you a personalised prep plan, answer specific questions, or help you work through weak areas. What do you need?`,
      id: "init",
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "plan">("chat");
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    coachApi.getPlan()
      .then(r => setPlan(r.data))
      .catch(() => {})
      .finally(() => setLoadingPlan(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: msg, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await coachApi.chat(msg, history);
      const aiMsg: Msg = { role: "assistant", content: res.data.reply, id: Date.now().toString() + "a" };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I couldn't connect right now. Make sure your GROQ_API_KEY is set in backend/.env and your server is running.",
        id: Date.now().toString() + "err",
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const refreshPlan = async () => {
    setRefreshing(true);
    try { const r = await coachApi.getPlan(); setPlan(r.data); }
    finally { setRefreshing(false); }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="heading-1" style={{ marginBottom: 6 }}>AI Coach</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Personalised interview coaching powered by Groq</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, padding: 4, background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 12, width: "fit-content" }}>
          {(["chat", "plan"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                background: activeTab === tab ? "var(--blue)" : "transparent",
                color: activeTab === tab ? "white" : "var(--text-2)",
                transition: "all 0.15s ease",
              }}>
              {tab === "chat" ? "Chat with coach" : "Weekly plan"}
            </button>
          ))}
        </div>

        {activeTab === "chat" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, alignItems: "start" }}>
            {/* Chat window */}
            <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", height: 620 }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
                <AnimatePresence initial={false}>
                  {messages.map(m => (
                    <motion.div key={m.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                      {m.role === "assistant" && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                              <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" />
                            </svg>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>ARYA Coach</span>
                        </div>
                      )}
                      <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sending && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>ARYA Coach</span>
                    </div>
                    <div className="chat-bubble-ai" style={{ display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Ask anything about interview prep..."
                    rows={2}
                    style={{
                      flex: 1, background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: 10,
                      padding: "10px 14px", color: "var(--text-1)", fontSize: "0.9375rem", outline: "none",
                      resize: "none", fontFamily: "inherit", lineHeight: 1.5, transition: "border-color 0.15s ease",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--blue)")}
                    onBlur={e => (e.target.style.borderColor = "var(--line)")}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || sending}
                    style={{
                      width: 40, height: 40, borderRadius: 10, background: input.trim() && !sending ? "var(--blue)" : "var(--bg-raised)",
                      border: "1px solid var(--line)", cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: input.trim() && !sending ? "white" : "var(--text-3)",
                      transition: "all 0.15s ease", flexShrink: 0,
                    }}>
                    <Send size={16} />
                  </button>
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: 6 }}>Enter to send · Shift+Enter for new line</div>
              </div>
            </div>

            {/* Starter prompts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="caption">Quick questions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)",
                      background: "var(--bg-card)", textAlign: "left", cursor: "pointer",
                      fontSize: "0.8125rem", color: "var(--text-2)", lineHeight: 1.5, fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Weekly plan tab */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            {loadingPlan ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}><Spinner size="lg" /></div>
            ) : !plan ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-2)" }}>
                <p style={{ marginBottom: 16 }}>Complete some interviews first to get a personalised plan.</p>
                <Button onClick={refreshPlan} loading={refreshing} icon={<RefreshCw size={14} />}>Generate plan</Button>
              </div>
            ) : (
              <>
                {/* Weekly schedule */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Calendar size={16} style={{ color: "var(--blue)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>This week</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={refreshPlan} loading={refreshing} icon={<RefreshCw size={12} />}>Refresh</Button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {plan.weekly_plan?.map((day, i) => {
                      const colors = ["var(--blue)", "var(--green)", "var(--amber)", "#a78bfa", "var(--blue)", "var(--green)", "var(--text-3)"];
                      return (
                        <div key={day.day} style={{ display: "flex", gap: 14, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg-raised)" }}>
                          <div style={{ width: 3, background: colors[i % colors.length], borderRadius: 2, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--text-1)" }}>{day.day}</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{day.duration}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--blue)", fontWeight: 600, marginBottom: 6 }}>{day.focus}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {day.tasks?.map((task, j) => (
                                <div key={j} style={{ fontSize: "0.8125rem", color: "var(--text-2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-3)", flexShrink: 0, marginTop: 6 }} />
                                  {task}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Roadmap */}
                  <div className="card">
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                      <Map size={15} style={{ color: "var(--green)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>8-week roadmap</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {plan.learning_roadmap?.map((phase, i) => (
                        <div key={phase.phase}>
                          <button onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: expandedPhase === i ? "var(--blue-dim)" : "var(--bg-raised)", border: `1px solid ${expandedPhase === i ? "var(--blue-border)" : "var(--line)"}`, cursor: "pointer", transition: "all 0.15s ease" }}>
                            <div style={{ textAlign: "left" }}>
                              <div style={{ fontSize: "0.6875rem", color: "var(--blue)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{phase.phase}</div>
                              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-1)" }}>{phase.title}</div>
                            </div>
                            {expandedPhase === i ? <ChevronUp size={13} style={{ color: "var(--text-3)" }} /> : <ChevronDown size={13} style={{ color: "var(--text-3)" }} />}
                          </button>
                          {expandedPhase === i && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                              style={{ padding: "10px 12px", background: "var(--bg-raised)", borderRadius: "0 0 8px 8px", marginTop: -1 }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                                {phase.topics?.map(t => <Badge key={t} variant="blue">{t}</Badge>)}
                              </div>
                              {phase.resources?.length > 0 && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{phase.resources.join(", ")}</div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="card">
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                      <Zap size={15} style={{ color: "var(--amber)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Focus skills</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {plan.recommended_skills?.map((skill, i) => (
                        <div key={skill} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "var(--bg-raised)" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--amber)" }}>{i + 1}</span>
                          </div>
                          <span style={{ fontSize: "0.875rem", color: "var(--text-2)", fontWeight: 500 }}>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategy */}
                  {plan.preparation_strategy && (
                    <div className="card" style={{ borderColor: "var(--blue-border)" }}>
                      <div style={{ width: 3, height: 16, background: "var(--blue)", borderRadius: 2, marginBottom: 12 }} />
                      <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.7 }}>{plan.preparation_strategy}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
