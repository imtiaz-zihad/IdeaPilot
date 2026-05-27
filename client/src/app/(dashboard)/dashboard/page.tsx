"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Startup } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Active Startups", value: startups.length, delta: "↑ ready to scale", color: "var(--accent)" },
    { label: "AI Reports", value: startups.length * 4, delta: "↑ auto-generated", color: "var(--green)" },
    { label: "Avg Investor Score", value: startups.length ? Math.round(startups.reduce((a, s) => a + (s.investorScore || 70), 0) / startups.length) : 0, delta: "↑ improving", color: "var(--amber)" },
    { label: "AI Tokens Used", value: "142k", delta: "of 500k monthly", color: "var(--blue)" },
  ];

  return (
    <div>
      <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>
        Welcome back, <strong style={{ color: "var(--text)" }}>{user?.name}</strong> 👋
      </p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Startups */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>My Startups</span>
        </div>
        {loading ? (
          <p style={{ color: "var(--text3)", fontSize: 13 }}>Loading...</p>
        ) : startups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
            <p style={{ fontSize: 14, marginBottom: 6 }}>No startups yet</p>
            <p style={{ fontSize: 13 }}>Click New Startup to create your first AI-powered startup workspace.</p>
          </div>
        ) : (
          startups.map(s => (
            <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-glow, #6c63ff20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{s.startupName}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.industry} · {s.country}</div>
                <div style={{ height: 4, background: "var(--bg4)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.investorScore || 70}%`, background: "var(--accent)", borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{s.investorScore || "—"}</div>
                <div style={{ fontSize: 10, color: "var(--text3)" }}>/100</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}