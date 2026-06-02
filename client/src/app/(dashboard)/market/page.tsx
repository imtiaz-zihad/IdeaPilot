"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

/* ── Types ─────────────────────────────────────── */
interface MarketSize {
  tam: string; sam: string; som: string;
  growthRate: string; source: string;
}
interface SWOT {
  strengths: string[]; weaknesses: string[];
  opportunities: string[]; threats: string[];
}
interface Competitor {
  name: string; description: string;
  strengths: string[]; weaknesses: string[];
  pricing: string; marketShare: string;
}
interface Trend {
  title: string; description: string;
  impact: "High" | "Medium" | "Low";
}
interface AudienceSegment {
  segment: string; size: string;
  painPoints: string[]; willingness: string;
}
interface MarketResult {
  summary: string;
  marketSize: MarketSize;
  swot: SWOT;
  competitors: Competitor[];
  trends: Trend[];
  targetAudience: AudienceSegment[];
  entryBarriers: string[];
  recommendations: string[];
}

/* ── Helpers ────────────────────────────────────── */
const impactClass: Record<string, string> = {
  High:   "badge-accent",
  Medium: "badge-amber",
  Low:    "text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-bg3 text-text2 border border-border",
};

const SWOT_CONFIG = [
  { key: "strengths",     label: "Strengths",     icon: "✅", color: "text-success", bg: "bg-success/5",  border: "border-success/15" },
  { key: "weaknesses",    label: "Weaknesses",    icon: "⚠️",  color: "text-warning", bg: "bg-warning/5",  border: "border-warning/15" },
  { key: "opportunities", label: "Opportunities", icon: "🌟", color: "text-info",    bg: "bg-info/5",     border: "border-info/15"    },
  { key: "threats",       label: "Threats",       icon: "🚨", color: "text-danger",  bg: "bg-danger/5",   border: "border-danger/15"  },
];

export default function MarketResearchPage() {
  const [startups,  setStartups]  = useState<Startup[]>([]);
  const [selected,  setSelected]  = useState("");
  const [result,    setResult]    = useState<MarketResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [cached,    setCached]    = useState(false);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const generate = async (regen = false) => {
    if (!selected) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const url = `/startups/${selected}/market${regen ? "/regenerate" : ""}`;
      const { data } = await api.post(url);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
      setActiveTab("overview");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed. Try again.");
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview",    label: "Overview"      },
    { id: "swot",        label: "SWOT"          },
    { id: "competitors", label: "Competitors"   },
    { id: "trends",      label: "Trends"        },
    { id: "audience",    label: "Audience"      },
    { id: "strategy",    label: "Strategy"      },
  ];

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="font-head text-[22px] font-bold text-text mb-1.5">
          📊 Market Research
        </h1>
        <p className="text-[13px] text-text2">
          AI conducts deep market analysis — TAM/SAM/SOM, competitors, trends, and strategic recommendations.
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Select startup</label>
            {fetching ? (
              <div className="input text-text3 pointer-events-none">Loading...</div>
            ) : startups.length === 0 ? (
              <div className="input text-text3 pointer-events-none">No startups yet</div>
            ) : (
              <select
                className="input"
                value={selected}
                onChange={e => { setSelected(e.target.value); setResult(null); }}
              >
                {startups.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.startupName} — {s.industry}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => generate(false)}
            disabled={loading || !selected}
            className="btn-primary"
          >
            {loading
              ? <><span className="spinner w-3.5 h-3.5" /> Analyzing...</>
              : "✦ Research Market"
            }
          </button>

          {result && (
            <button onClick={() => generate(true)} disabled={loading} className="btn-ghost">
              ↺ Regenerate
            </button>
          )}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="card py-16 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Gemini AI is researching your market...</p>
          <p className="text-text3 text-[12px] mt-1.5">
            Analyzing competitors, trends and market size — takes 10–15 seconds
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && result && (
        <div className="fade-in">

          {/* Summary banner */}
          <div className="card mb-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center text-[20px] shrink-0">
              📊
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[15px] font-semibold text-text">Market Summary</span>
                {cached && (
                  <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-[8px]">
                    cached
                  </span>
                )}
              </div>
              <p className="text-[14px] text-text2 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Market size cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {[
              { label: "TAM",         value: result.marketSize.tam,        sub: "Total Addressable Market", color: "text-accent"  },
              { label: "SAM",         value: result.marketSize.sam,        sub: "Serviceable Market",       color: "text-success" },
              { label: "SOM",         value: result.marketSize.som,        sub: "Obtainable Market",        color: "text-warning" },
              { label: "Growth Rate", value: result.marketSize.growthRate, sub: result.marketSize.source,   color: "text-info"    },
            ].map(c => (
              <div key={c.label} className="card-sm">
                <p className="text-[11px] text-text3 mb-2 uppercase tracking-wider">{c.label}</p>
                <p className={`text-[18px] font-bold font-head mb-1 ${c.color}`}>{c.value}</p>
                <p className="text-[11px] text-text3 leading-tight">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-border mb-5 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[13px] border-none cursor-pointer transition-all shrink-0 -mb-px bg-transparent
                  ${activeTab === tab.id
                    ? "text-accent border-b-2 border-accent font-medium"
                    : "text-text2 border-b-2 border-transparent hover:text-text"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Overview ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Entry barriers */}
              <div className="card">
                <h3 className="section-title">🚧 Entry Barriers</h3>
                <ul className="flex flex-col gap-2.5">
                  {result.entryBarriers.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-danger/10 text-danger text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-text2 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h3 className="section-title">💡 Strategic Recommendations</h3>
                <ul className="flex flex-col gap-2.5">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-success/10 text-success text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-text2 leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Tab: SWOT ── */}
          {activeTab === "swot" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SWOT_CONFIG.map(cfg => (
                <div key={cfg.key} className={`rounded-[14px] border p-5 ${cfg.bg} ${cfg.border}`}>
                  <h3 className={`text-[14px] font-semibold mb-3 ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {(result.swot[cfg.key as keyof SWOT] || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-text2 leading-relaxed">
                        <span className={`${cfg.color} shrink-0 mt-0.5`}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Competitors ── */}
          {activeTab === "competitors" && (
            <div className="flex flex-col gap-4">
              {result.competitors.map((c, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                    <div>
                      <h3 className="text-[16px] font-semibold text-text mb-1">{c.name}</h3>
                      <p className="text-[13px] text-text2">{c.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <span className="meta-tag">💰 {c.pricing}</span>
                      <span className="meta-tag">📊 {c.marketShare}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-success/5 border border-success/15 rounded-[10px] p-3.5">
                      <p className="text-[12px] font-semibold text-success mb-2">✅ Strengths</p>
                      <ul className="flex flex-col gap-1.5">
                        {c.strengths.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-[12px] text-text2">
                            <span className="text-success shrink-0">→</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-danger/5 border border-danger/15 rounded-[10px] p-3.5">
                      <p className="text-[12px] font-semibold text-danger mb-2">⚠️ Weaknesses</p>
                      <ul className="flex flex-col gap-1.5">
                        {c.weaknesses.map((w, j) => (
                          <li key={j} className="flex items-start gap-2 text-[12px] text-text2">
                            <span className="text-danger shrink-0">→</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Trends ── */}
          {activeTab === "trends" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.trends.map((t, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-semibold text-text">{t.title}</h3>
                    <span className={impactClass[t.impact]}>{t.impact} Impact</span>
                  </div>
                  <p className="text-[13px] text-text2 leading-relaxed">{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Audience ── */}
          {activeTab === "audience" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.targetAudience.map((seg, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-text">{seg.segment}</h3>
                    <span className="meta-tag">👥 {seg.size}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-[12px] text-text3 mb-2 uppercase tracking-wider">Pain Points</p>
                    <ul className="flex flex-col gap-2">
                      {seg.painPoints.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-[13px] text-text2">
                          <span className="text-warning shrink-0 mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-[12px] text-text3 mb-1">Willingness to Pay</p>
                    <p className="text-[13px] text-text">{seg.willingness}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Strategy ── */}
          {activeTab === "strategy" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Entry barriers */}
              <div className="card">
                <h3 className="section-title">🚧 Entry Barriers</h3>
                <ul className="flex flex-col gap-3">
                  {result.entryBarriers.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-bg3 rounded-[10px]">
                      <span className="w-6 h-6 rounded-full bg-danger/15 text-danger text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-text2 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h3 className="section-title">💡 Recommendations</h3>
                <ul className="flex flex-col gap-3">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-bg3 rounded-[10px]">
                      <span className="w-6 h-6 rounded-full bg-success/15 text-success text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-text2 leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !result && !error && (
        <div className="card py-16 text-center">
          <p className="text-[52px] mb-4">📊</p>
          <p className="text-[15px] font-semibold text-text mb-2">Ready to research your market?</p>
          <p className="text-[13px] text-text2">
            Select a startup and click Research — AI will analyse competitors, trends and market size.
          </p>
        </div>
      )}

    </div>
  );
}