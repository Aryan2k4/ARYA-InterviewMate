import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>ARYA</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Sign in to continue your interview prep</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Email" type="email" placeholder="you@example.com"
            icon={<Mail size={15} />} value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="input-label">Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" }}>
                <Lock size={15} />
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.15)", color: "var(--red)", fontSize: "0.875rem" }}>
              {error}
            </motion.div>
          )}

          <Button type="submit" loading={loading} icon={<ArrowRight size={15} />}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }} size="lg">
            Sign in
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line)", fontSize: "0.875rem", color: "var(--text-2)" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
        </div>
      </motion.div>
    </div>
  );
};
