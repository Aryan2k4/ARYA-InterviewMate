import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const ROLES = ["Software Engineer", "AI Engineer", "Data Scientist", "Frontend Developer", "Backend Developer"];

const FEATURES = [
  { label: "Adaptive Questions", desc: "Questions evolve based on your previous answers, matching how real interviews work." },
  { label: "Instant AI Scoring", desc: "Every answer is evaluated across 5 dimensions — accuracy, depth, clarity, communication, confidence." },
  { label: "Resume-Tailored", desc: "Upload your CV. ARYA reads your projects and experience and builds the interview around you." },
  { label: "Career Coach", desc: "An AI coach that knows your weak spots and gives you a concrete weekly plan to fix them." },
  { label: "Detailed Reports", desc: "After every session — strengths, missed concepts, and a prioritised improvement plan." },
  { label: "Progress Tracking", desc: "Charts and trends across every session so you can see exactly what's getting better." },
];

export const LandingPage = () => {
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-1)" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 64,
        background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>ARYA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" style={{ color: "var(--text-2)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 120, paddingLeft: 40, paddingRight: 40, maxWidth: 1000, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, border: "1px solid var(--blue-border)", background: "var(--blue-dim)", marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--blue)" }}>Powered by Groq AI</span>
          </div>

          <h1 className="display" style={{ marginBottom: 16, maxWidth: 760 }}>
            Practice interviews.<br />
            <span style={{ color: "var(--blue)" }}>Get hired.</span>
          </h1>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: "1.25rem", color: "var(--text-2)", fontWeight: 400 }}>Built for</span>
            <motion.span
              key={roleIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-1)", borderBottom: "2px solid var(--blue)", paddingBottom: 1 }}
            >
              {ROLES[roleIdx]}
            </motion.span>
          </div>

          <p style={{ fontSize: "1.0625rem", color: "var(--text-2)", maxWidth: 540, lineHeight: 1.7, marginBottom: 40 }}>
            AI-powered mock interviews that adapt to your answers, evaluate your responses across 5 dimensions, and give you a concrete plan to improve.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
            {["Free to use", "No credit card", "Real AI feedback"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--text-3)" }}>
                <CheckCircle size={13} style={{ color: "var(--green)" }} />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider line */}
        <div className="hero-line" style={{ margin: "80px 0 0" }} />
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div className="caption" style={{ marginBottom: 12 }}>What you get</div>
          <h2 className="heading-1" style={{ maxWidth: 480 }}>Everything you need to pass technical interviews</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: "28px 24px",
                background: "var(--bg-card)",
                borderRight: (i + 1) % 3 !== 0 ? "1px solid var(--line)" : "none",
                borderBottom: i < 3 ? "1px solid var(--line)" : "none",
              }}
            >
              <div style={{ width: 28, height: 2, background: "var(--blue)", marginBottom: 16, borderRadius: 1 }} />
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-1)", marginBottom: 8 }}>{f.label}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px 120px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: 480, margin: "0 auto" }}
        >
          <h2 className="heading-1" style={{ marginBottom: 16 }}>Ready to start practising?</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 32 }}>Create an account, pick your role, and begin your first mock interview in under 60 seconds.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create free account <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8125rem", color: "var(--text-3)", fontWeight: 800, letterSpacing: "-0.01em" }}>ARYA InterviewMate</span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>© {new Date().getFullYear()} · Powered by Groq AI</span>
      </footer>
    </div>
  );
};
