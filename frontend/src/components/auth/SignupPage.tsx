import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui";

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "", full_name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email required";
    if (!form.username || form.username.length < 3) e.username = "At least 3 characters";
    if (!form.password || form.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err: any) {
      setErrors({ general: err.response?.data?.detail || "Signup failed" });
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
          <h1 style={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 6 }}>Create account</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.9375rem" }}>Start your AI-powered interview practice</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Full name" placeholder="Jane Smith" icon={<User size={15} />}
            value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Username" placeholder="janesmith" icon={<User size={15} />}
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
            error={errors.username} required />
          <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={15} />}
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" icon={<Lock size={15} />}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password} required />

          {errors.general && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.15)", color: "var(--red)", fontSize: "0.875rem" }}>
              {errors.general}
            </motion.div>
          )}

          <Button type="submit" loading={loading} icon={<ArrowRight size={15} />}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }} size="lg">
            Create account
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line)", fontSize: "0.875rem", color: "var(--text-2)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};
