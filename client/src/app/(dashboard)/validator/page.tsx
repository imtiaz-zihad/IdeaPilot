"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface ValidationResult {
  overallScore: number;
  demand:        { score: number; label: string; summary: string };
  competition:   { score: number; label: string; summary: string };
  monetization:  { score: number; label: string; summary: string };
  scalability:   { score: number; label: string; summary: string };
  risk:          { score: number; label: string; summary: string };
  strengths:     string[];
  weaknesses:    string[];
  opportunities: string[];
  recommendation: string;
}

interface Report {
  _id: string;
  result: ValidationResult;
  cached: boolean;
  createdAt: string;
}

export default function ValidatorPage() {
  const [startups,  setStartups]  = useState<Startup[]>([]);
  const [selected,  setSelected]  = useState<string>("");
  const [report,    setReport]    = useState<Report | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const handleValidate = async (revalidate = false) => {
    if (!selected) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const endpoint = revalidate
        ? `/startups/${selected}/revalidate`
        : `/startups/${selected}/validate`;
      const { data } = await api.post(endpoint);
      setReport(data.data.report);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Validation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const result = report?.result;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>🎯 Idea Validator</h1>
        <p style={{ color: "var(--text2)", fontSize: 14 }}>AI analyzes your startup idea across 5 dimensions and gives an investor readiness score.</p>
      </div>

      {/* Select + Validate */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>Select startup to validate</label>
            {fetching ? (
              <div style={inputStyle}>Loading startups...</div>
            ) : startups.length === 0 ? (
              <div style={{ ...inputStyle, color: "var(--text3)" }}>No startups yet — create one first</div>
            ) : (
              <select style={inputStyle} value={selected} onChange={e => { setSelected(e.target.value); setReport(null); }}>
                {startups.map(s => (
                  <option key={s._id} value={s._id}>{s.startupName} — {s.industry}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => handleValidate(false)}
            disabled={loading || !selected}
            style={primaryBtn}>
            {loading ? <><Spinner /> Analyzing...</> : "✦ Validate Idea"}
          </button>
          {report && (
            <button onClick={() => handleValidate(true)} disabled={loading} style={ghostBtn}>
              ↺ Re-analyze
            </button>
          )}
        </div>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={spinnerStyle} />
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 16 }}>Gemini AI is analyzing your startup idea...</p>
          <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>This takes 5–10 seconds</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Overall Score */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg4)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor(result.overallScore)}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * result.overallScore) / 100}
                />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(result.overallScore) }}>{result.overallScore}</div>
                <div style={{ fontSize: 10, color: "var(--text3)" }}>/100</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Overall Score</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: `${scoreColor(result.overallScore)}20`, color: scoreColor(result.overallScore), border: `1px solid ${scoreColor(result.overallScore)}40` }}>
                  {scoreLabel(result.overallScore)}
                </span>
                {report?.cached && <span style={{ fontSize: 11, color: "var(--text3)", padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 10 }}>cached</span>}
              </div>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{result.recommendation}</p>
            </div>
          </div>

          {/* 5 Dimension Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {[
              { key: "demand",       label: "Market Demand",     icon: "📈", data: result.demand },
              { key: "competition",  label: "Competition",        icon: "⚔️",  data: result.competition },
              { key: "monetization", label: "Monetization",       icon: "💰", data: result.monetization },
              { key: "scalability",  label: "Scalability",        icon: "🚀", data: result.scalability },
              { key: "risk",         label: "Risk Level",         icon: "⚠️",  data: result.risk },
            ].map(({ label, icon, data }) => (
              <div key={label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: `${scoreColor(data.score)}20`, color: scoreColor(data.score) }}>
                    {data.label}
                  </span>
                </div>
                {/* Score bar */}
                <div style={{ height: 6, background: "var(--bg4)", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${data.score}%`, background: scoreColor(data.score), borderRadius: 3, transition: "width 1s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>Score</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(data.score) }}>{data.score}/100</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{data.summary}</p>
              </div>
            ))}
          </div>

          {/* SWOT-style grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <SwotCard title="✅ Strengths"     items={result.strengths}     color="var(--green)" bg="#22c55e12" />
            <SwotCard title="⚠️ Weaknesses"    items={result.weaknesses}    color="var(--red)"   bg="#ef444412" />
            <SwotCard title="🌟 Opportunities" items={result.opportunities} color="var(--amber)" bg="#f59e0b12" />
          </div>

        </div>
      )}

      {/* Empty state */}
      {!loading && !report && !error && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎯</div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Ready to validate your idea?</p>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>Select a startup above and click Validate — Gemini AI will score it in seconds.</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function SwotCard({ title, items, color, bg }: { title: string; items: string[]; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}25`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 12 }}>{title}</div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
            <span style={{ color, flexShrink: 0, marginTop: 1 }}>→</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 12, height: 12, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

// ── Helpers ───────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "var(--green)";
  if (score >= 50) return "var(--amber)";
  return "var(--red)";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Investor Ready";
  if (score >= 70) return "Strong Idea";
  if (score >= 55) return "Needs Work";
  if (score >= 40) return "Risky";
  return "Not Viable";
}

// ── Styles ────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "9px 20px", borderRadius: 10, background: "var(--accent)",
  border: "none", color: "#fff", fontSize: 13, fontWeight: 500,
  cursor: "pointer", flexShrink: 0,
};

const ghostBtn: React.CSSProperties = {
  padding: "9px 16px", borderRadius: 10, background: "none",
  border: "1px solid var(--border2)", color: "var(--text2)",
  fontSize: 13, cursor: "pointer", flexShrink: 0,
};

const spinnerStyle: React.CSSProperties = {
  width: 40, height: 40, border: "3px solid var(--bg4)",
  borderTopColor: "var(--accent)", borderRadius: "50%",
  animation: "spin .8s linear infinite", margin: "0 auto",
};