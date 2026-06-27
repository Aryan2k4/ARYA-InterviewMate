import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, ArrowRight, FileText } from "lucide-react";
import { interviewApi } from "../../services/api";
import { Button } from "../ui";
import { AppLayout } from "../layout/AppLayout";

const ROLES = [
  { value: "Software Engineer", desc: "Algorithms, system design, CS fundamentals" },
  { value: "AI Engineer", desc: "ML, LLMs, model deployment, pipelines" },
  { value: "Data Scientist", desc: "Statistics, analytics, ML modeling" },
  { value: "Frontend Developer", desc: "React, TypeScript, UI/UX, performance" },
  { value: "Backend Developer", desc: "APIs, databases, architecture, scalability" },
];

const DIFFICULTIES = [
  { value: "Beginner", desc: "Core fundamentals" },
  { value: "Intermediate", desc: "Real-world applications" },
  { value: "Advanced", desc: "System design & leadership" },
];

const COUNTS = [5, 10, 20];

export const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState(params.get("role") || "Software Engineer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [numQ, setNumQ] = useState(5);
  const [useResume, setUseResume] = useState(params.get("resume") === "true");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setError(""); setLoading(true);
    try {
      let res;
      if (useResume && resumeFile) {
        const fd = new FormData();
        fd.append("role", role); fd.append("difficulty", difficulty);
        fd.append("num_questions", numQ.toString()); fd.append("resume_file", resumeFile);
        res = await interviewApi.uploadResume(fd);
      } else {
        res = await interviewApi.start({ role, difficulty, num_questions: numQ });
      }
      navigate(`/interview/${res.data.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to start interview");
    } finally { setLoading(false); }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 32 }}>
      <div className="caption" style={{ marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <AppLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 className="heading-1" style={{ marginBottom: 6 }}>Setup interview</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Configure your mock interview session</p>
        </div>

        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Role */}
          <Section title="Target role">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ROLES.map(r => (
                <button key={r.value} onClick={() => setRole(r.value)}
                  style={{
                    padding: "14px 16px", borderRadius: 10, border: `1px solid ${role === r.value ? "var(--blue)" : "var(--line)"}`,
                    background: role === r.value ? "var(--blue-dim)" : "var(--bg-raised)",
                    textAlign: "left", cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: role === r.value ? "var(--blue)" : "var(--text-1)", marginBottom: 3 }}>{r.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <div style={{ height: 1, background: "var(--line)", marginBottom: 28 }} />

          {/* Difficulty */}
          <Section title="Difficulty level">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {DIFFICULTIES.map(d => (
                <button key={d.value} onClick={() => setDifficulty(d.value)}
                  style={{
                    padding: "14px 16px", borderRadius: 10,
                    border: `1px solid ${difficulty === d.value ? "var(--blue)" : "var(--line)"}`,
                    background: difficulty === d.value ? "var(--blue-dim)" : "var(--bg-raised)",
                    textAlign: "left", cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: difficulty === d.value ? "var(--blue)" : "var(--text-1)", marginBottom: 3 }}>{d.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <div style={{ height: 1, background: "var(--line)", marginBottom: 28 }} />

          {/* Length */}
          <Section title="Number of questions">
            <div style={{ display: "flex", gap: 8 }}>
              {COUNTS.map(c => {
                const mins: Record<number, string> = { 5: "~10 min", 10: "~20 min", 20: "~40 min" };
                return (
                  <button key={c} onClick={() => setNumQ(c)}
                    style={{
                      flex: 1, padding: "16px 12px", borderRadius: 10, textAlign: "center",
                      border: `1px solid ${numQ === c ? "var(--blue)" : "var(--line)"}`,
                      background: numQ === c ? "var(--blue-dim)" : "var(--bg-raised)",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}>
                    <div className="mono" style={{ fontSize: "1.375rem", fontWeight: 700, color: numQ === c ? "var(--blue)" : "var(--text-1)", lineHeight: 1 }}>{c}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-3)", marginTop: 4 }}>{mins[c]}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          <div style={{ height: 1, background: "var(--line)", marginBottom: 28 }} />

          {/* Resume toggle */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: useResume ? 16 : 0 }}>
              <div>
                <div className="caption" style={{ marginBottom: 2 }}>Resume-based interview</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-2)" }}>Questions tailored to your CV</div>
              </div>
              <button onClick={() => setUseResume(!useResume)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: useResume ? "var(--blue)" : "var(--line-hover)",
                  position: "relative", transition: "background 0.2s ease",
                }}>
                <motion.div animate={{ x: useResume ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </button>
            </div>
            {useResume && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}>
                <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }}
                  onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                {resumeFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "var(--blue-dim)", border: "1px solid var(--blue-border)" }}>
                    <FileText size={16} style={{ color: "var(--blue)" }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--blue)", flex: 1 }}>{resumeFile.name}</span>
                    <button onClick={() => setResumeFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex" }}><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ width: "100%", padding: "28px 20px", border: "1px dashed var(--line-hover)", borderRadius: 10, background: "var(--bg-raised)", cursor: "pointer", textAlign: "center", transition: "border-color 0.15s ease" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--line-hover)"}>
                    <Upload size={20} style={{ color: "var(--text-3)", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>Click to upload PDF or TXT</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>Max 5MB</div>
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.15)", color: "var(--red)", fontSize: "0.875rem", marginBottom: 20 }}>{error}</div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>Cancel</Button>
            <Button loading={loading} disabled={useResume && !resumeFile} onClick={handleStart} icon={<ArrowRight size={15} />} size="lg">
              {loading ? "Generating questions..." : "Begin interview"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};
