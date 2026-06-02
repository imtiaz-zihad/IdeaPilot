"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface ValidationResult {
  overallScore: number;
  demand: { score: number; label: string; summary: string };
  competition: { score: number; label: string; summary: string };
  monetization: { score: number; label: string; summary: string };
  scalability: { score: number; label: string; summary: string };
  risk: { score: number; label: string; summary: string };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendation: string;
}

const scoreColor = (s: number) => s >= 75 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";
const scoreText  = (s: number) => s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-danger";
const scoreLabel = (s: number) => s >= 85 ? "Investor Ready" : s >= 70 ? "Strong Idea" : s >= 55 ? "Needs Work" : s >= 40 ? "Risky" : "Not Viable";

export default function ValidatorPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selected, setSelected] = useState("");
  const [result,   setResult]   = useState<ValidationResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cached,   setCached]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const handleValidate = async (regen = false) => {
    if (!selected) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await api.post(`/startups/${selected}/${regen ? "revalidate" : "validate"}`);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Validation failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-head mb-1.5">🎯 Idea Validator</h1>
        <p className="text-text2 text-[13px]">AI analyzes your startup across 5 dimensions and gives an investor readiness score.</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-50">
            <label className="label">Select startup to validate</label>
            {fetching ? <div className="input text-text3">Loading...</div>
              : startups.length === 0 ? <div className="input text-text3">No startups yet</div>
              : (
                <select className="input" value={selected}
                  onChange={e => { setSelected(e.target.value); setResult(null); }}>
                  {startups.map(s => <option key={s._id} value={s._id}>{s.startupName} — {s.industry}</option>)}
                </select>
              )}
          </div>
          <button onClick={() => handleValidate(false)} disabled={loading || !selected} className="btn-primary">
            {loading ? <><span className="spinner w-3.5 h-3.5" /> Analyzing...</> : "✦ Validate Idea"}
          </button>
          {result && <button onClick={() => handleValidate(true)} disabled={loading} className="btn-ghost">↺ Re-analyze</button>}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card py-14 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Gemini AI is analyzing your startup idea...</p>
          <p className="text-text3 text-[12px] mt-1.5">This takes 5–10 seconds</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="flex flex-col gap-4">
          {/* Overall score */}
          <div className="card flex gap-6 items-center flex-wrap">
            <div className="relative w-30 h-30 shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg4)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor(result.overallScore)}
                  strokeWidth="10" strokeLinecap="round" strokeDasharray="314"
                  strokeDashoffset={314 - (314 * result.overallScore) / 100}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[28px] font-bold font-head ${scoreText(result.overallScore)}`}>{result.overallScore}</span>
                <span className="text-[10px] text-text3">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="text-[20px] font-bold">{scoreLabel(result.overallScore)}</span>
                <span className={`badge border ${scoreText(result.overallScore)}`}
                  style={{ background: `${scoreColor(result.overallScore)}18`, borderColor: `${scoreColor(result.overallScore)}40` }}>
                  {result.overallScore}/100
                </span>
                {cached && <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-lg">cached</span>}
              </div>
              <p className="text-[14px] text-text2 leading-relaxed">{result.recommendation}</p>
            </div>
          </div>

          {/* 5 dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { key:"demand",       label:"Market Demand", icon:"📈" },
              { key:"competition",  label:"Competition",   icon:"⚔️" },
              { key:"monetization", label:"Monetization",  icon:"💰" },
              { key:"scalability",  label:"Scalability",   icon:"🚀" },
              { key:"risk",         label:"Risk Level",    icon:"⚠️" },
            ].map(({ key, label, icon }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const dim = result[key as keyof ValidationResult] as any;
              if (!dim) return null;
              const c = scoreColor(dim.score);
              const ct = scoreText(dim.score);
              return (
                <div key={key} className="card-sm">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[13px] font-medium">{icon} {label}</span>
                    <span className={`badge border text-[11px] ${ct}`}
                      style={{ background: `${c}18`, borderColor: `${c}40` }}>{dim.label}</span>
                  </div>
                  <div className="h-1.5 bg-bg4 rounded-full mb-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, background: c }} />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-text3">Score</span>
                    <span className={`text-[14px] font-bold ${ct}`}>{dim.score}/100</span>
                  </div>
                  <p className="text-[12px] text-text2 leading-relaxed">{dim.summary}</p>
                </div>
              );
            })}
          </div>

          {/* SWOT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { title:"✅ Strengths",     items:result.strengths,     color:"var(--green)", cls:"bg-success/5 border-success/20" },
              { title:"⚠️ Weaknesses",    items:result.weaknesses,    color:"var(--red)",   cls:"bg-danger/5 border-danger/20" },
              { title:"🌟 Opportunities", items:result.opportunities, color:"var(--amber)", cls:"bg-warning/5 border-warning/20" },
            ].map(c => (
              <div key={c.title} className={`rounded-xl border p-4 ${c.cls}`}>
                <div className="text-[13px] font-semibold mb-3" style={{ color: c.color }}>{c.title}</div>
                <ul className="flex flex-col gap-2">
                  {(c.items||[]).map((item, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-text2 leading-relaxed">
                      <span style={{ color: c.color }} className="shrink-0 mt-0.5">→</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !result && !error && (
        <div className="card py-14 text-center">
          <div className="text-[52px] mb-4">🎯</div>
          <p className="text-[15px] font-semibold mb-2">Ready to validate your idea?</p>
          <p className="text-text2 text-[13px]">Select a startup above and click Validate — Gemini AI will score it in seconds.</p>
        </div>
      )}
    </div>
  );
}