"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Props { onClose: () => void; }

export default function NewStartupForm({ onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ startupName: "", idea: "", industry: "Food Tech", country: "", targetAudience: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/startups", form);
      onClose();
      router.push(`/startups/${data.data._id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create startup");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 18, padding: 28, width: 480, maxWidth: "90vw" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Launch New Startup</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Startup name</label>
            <input style={inputStyle} placeholder="e.g. CampusEats" value={form.startupName}
              onChange={e => setForm(p => ({ ...p, startupName: e.target.value }))} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Your idea</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
              placeholder="Describe your startup idea in detail..."
              value={form.idea} onChange={e => setForm(p => ({ ...p, idea: e.target.value }))} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Industry</label>
              <select style={inputStyle} value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                {["Food Tech","HealthTech","EdTech","FinTech","SaaS","E-Commerce","AI / ML","CleanTech","LogisticsTech"].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Country</label>
              <input style={inputStyle} placeholder="e.g. Bangladesh" value={form.country}
                onChange={e => setForm(p => ({ ...p, country: e.target.value }))} required />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Target audience</label>
            <input style={inputStyle} placeholder="e.g. University students aged 18–25" value={form.targetAudience}
              onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} required />
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border2)", background: "none", color: "var(--text2)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "8px 20px", borderRadius: 10, background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              {loading ? "Creating..." : "✦ Generate with AI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}