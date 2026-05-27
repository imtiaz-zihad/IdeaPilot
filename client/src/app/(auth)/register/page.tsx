"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.data.user, data.data.accessToken);
      router.push("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: "var(--accent)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>AI</div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>Co<span style={{ color: "var(--accent)" }}>Founder</span></span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>Create your account</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", marginBottom: 24 }}>Launch your first AI-powered startup</p>

        <a href={`${API_URL}/auth/google`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 0", fontSize: 13, color: "var(--text)", textDecoration: "none", marginBottom: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign up with Google
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0", color: "var(--text3)", fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />or<div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>Full name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={inputStyle} placeholder="Alex Rahman" required minLength={2} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={inputStyle} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 5 }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={inputStyle} placeholder="Min 8 characters" required minLength={8} />
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text2)", marginTop: 18 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}