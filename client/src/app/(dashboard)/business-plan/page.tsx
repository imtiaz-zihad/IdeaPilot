"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

/* ── Types ─────────────────────────────────────── */
interface RevenueStream  { name: string; description: string; percentage: number; }
interface CustomerSeg    { segment: string; description: string; size: string; priority: "Primary"|"Secondary"; }
interface GTMPhase       { phase: string; timeline: string; strategy: string; channels: string[]; kpi: string; }
interface SuccessMetric  { metric: string; target: string; timeline: string; }
interface BusinessPlanResult {
  executiveSummary:     string;
  problemStatement:     string;
  solution:             string;
  valueProposition:     string;
  revenueModel: {
    streams:          RevenueStream[];
    pricingStrategy:  string;
    unitEconomics:    string;
  };
  customerSegments:     CustomerSeg[];
  goToMarket:           GTMPhase[];
  competitiveAdvantage: string[];
  operationalPlan: {
    teamStructure:    string[];
    keyActivities:    string[];
    keyResources:     string[];
    keyPartnerships:  string[];
  };
  growthStrategy: {
    shortTerm: string;
    midTerm:   string;
    longTerm:  string;
  };
  successMetrics: SuccessMetric[];
  conclusion:     string;
}

/* ── Revenue donut (pure SVG) ───────────────────── */
const STREAM_COLORS = ["#6c63ff", "#22c55e", "#f59e0b", "#3b82f6"];

function RevenueDonut({ streams }: { streams: RevenueStream[] }) {
  const size   = 140;
  const r      = 50;
  const cx     = size / 2;
  const cy     = size / 2;
  const circum = 2 * Math.PI * r;
  let offset   = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#21252e" strokeWidth="20" />
        {streams.map((s, i) => {
          const dash    = (s.percentage / 100) * circum;
          const gap     = circum - dash;
          const current = offset;
          // eslint-disable-next-line react-hooks/immutability
          offset += dash;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={STREAM_COLORS[i]} strokeWidth="20"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-current}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          );
        })}
        <text x={cx} y={cy - 5}  textAnchor="middle" fill="#e8eaf0" fontSize="14" fontWeight="bold">100%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#555a6a" fontSize="10">Revenue</text>
      </svg>
      <div className="flex flex-col gap-2">
        {streams.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: STREAM_COLORS[i] }} />
            <span className="text-[13px] text-text2">{s.name}</span>
            <span className="text-[13px] font-semibold" style={{ color: STREAM_COLORS[i] }}>{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessPlanPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selected, setSelected] = useState("");
  const [result,   setResult]   = useState<BusinessPlanResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cached,   setCached]   = useState(false);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState("overview");

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
      const url  = `/startups/${selected}/business-plan${regen ? "/regenerate" : ""}`;
      const { data } = await api.post(url);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
      setTab("overview");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview",   label: "Overview"    },
    { id: "revenue",    label: "Revenue"     },
    { id: "customers",  label: "Customers"   },
    { id: "gtm",        label: "Go-To-Market"},
    { id: "operations", label: "Operations"  },
    { id: "growth",     label: "Growth"      },
    { id: "metrics",    label: "Metrics"     },
  ];

  return (
    <div className="page">

      {/* Header */}
      <div className="mb-7">
        <h1 className="font-head text-[22px] font-bold text-text mb-1.5">📋 Business Plan Generator</h1>
        <p className="text-[13px] text-text2">
          AI generates a comprehensive business plan — revenue model, GTM strategy, operations and growth roadmap.
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Select startup</label>
            {fetching ? (
              <div className="input text-text3 pointer-events-none">Loading...</div>
            ) : startups.length === 0 ? (
              <div className="input text-text3 pointer-events-none">No startups yet</div>
            ) : (
              <select className="input" value={selected}
                onChange={e => { setSelected(e.target.value); setResult(null); }}>
                {startups.map(s => (
                  <option key={s._id} value={s._id}>{s.startupName} — {s.industry}</option>
                ))}
              </select>
            )}
          </div>
          <button onClick={() => generate(false)} disabled={loading || !selected} className="btn-primary">
            {loading ? <><span className="spinner w-3.5 h-3.5" /> Generating...</> : "✦ Generate Plan"}
          </button>
          {result && (
            <button onClick={() => generate(true)} disabled={loading} className="btn-ghost">
              ↺ Regenerate
            </button>
          )}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card py-16 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Gemini AI is writing your business plan...</p>
          <p className="text-text3 text-[12px] mt-1.5">Building strategy, revenue model and GTM — takes 15–20 seconds</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="fade-in">

          {/* Hero summary */}
          <div className="card mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-[15px] font-semibold text-text">Executive Summary</span>
              {cached && (
                <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-[8px]">cached</span>
              )}
            </div>
            <p className="text-[14px] text-text2 leading-relaxed mb-4">{result.executiveSummary}</p>
            {/* Value prop highlight */}
            <div className="bg-accent/8 border border-accent/20 rounded-[10px] px-4 py-3">
              <p className="text-[12px] text-text3 mb-1 uppercase tracking-wider">Value Proposition</p>
              <p className="text-[14px] text-accent font-medium">{result.valueProposition}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-border mb-5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-[13px] border-none cursor-pointer transition-all shrink-0 -mb-px bg-transparent
                  ${tab === t.id
                    ? "text-accent border-b-2 border-accent font-medium"
                    : "text-text2 border-b-2 border-transparent hover:text-text"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Problem */}
                <div className="card">
                  <h3 className="section-title">🔴 The Problem</h3>
                  <p className="text-[13px] text-text2 leading-relaxed">{result.problemStatement}</p>
                </div>
                {/* Solution */}
                <div className="card">
                  <h3 className="section-title">🟢 Our Solution</h3>
                  <p className="text-[13px] text-text2 leading-relaxed">{result.solution}</p>
                </div>
              </div>
              {/* Competitive advantages */}
              <div className="card">
                <h3 className="section-title">🏆 Competitive Advantages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.competitiveAdvantage.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-bg3 rounded-[10px]">
                      <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[13px] text-text2 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Conclusion */}
              <div className="card bg-accent/5 border-accent/20">
                <h3 className="section-title text-accent">🎯 Conclusion</h3>
                <p className="text-[14px] text-text2 leading-relaxed">{result.conclusion}</p>
              </div>
            </div>
          )}

          {/* ── Revenue tab ── */}
          {tab === "revenue" && (
            <div className="flex flex-col gap-4">
              <div className="card">
                <h3 className="section-title">💰 Revenue Streams</h3>
                <RevenueDonut streams={result.revenueModel.streams} />
                <div className="flex flex-col gap-3 mt-5">
                  {result.revenueModel.streams.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-bg3 rounded-[10px] border border-border">
                      <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: STREAM_COLORS[i] }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[14px] font-semibold text-text">{s.name}</p>
                          <span className="text-[13px] font-bold" style={{ color: STREAM_COLORS[i] }}>{s.percentage}%</span>
                        </div>
                        <p className="text-[13px] text-text2">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="section-title">🏷️ Pricing Strategy</h3>
                  <p className="text-[13px] text-text2 leading-relaxed">{result.revenueModel.pricingStrategy}</p>
                </div>
                <div className="card">
                  <h3 className="section-title">📐 Unit Economics</h3>
                  <p className="text-[13px] text-text2 leading-relaxed">{result.revenueModel.unitEconomics}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Customers tab ── */}
          {tab === "customers" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {result.customerSegments.map((seg, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-text">{seg.segment}</h3>
                    <span className={seg.priority === "Primary" ? "badge-accent" : "badge text-text3 border border-border bg-bg3"}>
                      {seg.priority}
                    </span>
                  </div>
                  <p className="text-[13px] text-text2 leading-relaxed mb-3">{seg.description}</p>
                  <div className="pt-3 border-t border-border">
                    <p className="text-[11px] text-text3 mb-1">Market Size</p>
                    <p className="text-[13px] font-medium text-success">{seg.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── GTM tab ── */}
          {tab === "gtm" && (
            <div className="flex flex-col gap-4">
              {result.goToMarket.map((phase, i) => (
                <div key={i} className="card">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-accent/15 text-accent text-[13px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-text">{phase.phase}</p>
                      <p className="text-[12px] text-text3">{phase.timeline}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="meta-tag">🎯 {phase.kpi}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-text2 leading-relaxed mb-4">{phase.strategy}</p>
                  <div>
                    <p className="text-[11px] text-text3 uppercase tracking-wider mb-2">Channels</p>
                    <div className="flex gap-2 flex-wrap">
                      {phase.channels.map((c, j) => (
                        <span key={j} className="meta-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Operations tab ── */}
          {tab === "operations" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title:"👥 Team Structure",    items: result.operationalPlan.teamStructure,   color:"text-accent"  },
                { title:"⚡ Key Activities",    items: result.operationalPlan.keyActivities,   color:"text-success" },
                { title:"🔧 Key Resources",     items: result.operationalPlan.keyResources,    color:"text-warning" },
                { title:"🤝 Key Partnerships",  items: result.operationalPlan.keyPartnerships, color:"text-info"    },
              ].map(section => (
                <div key={section.title} className="card">
                  <h3 className={`section-title ${section.color}`}>{section.title}</h3>
                  <ul className="flex flex-col gap-2.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className={`${section.color} shrink-0 mt-0.5`}>→</span>
                        <span className="text-[13px] text-text2 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ── Growth tab ── */}
          {tab === "growth" && (
            <div className="flex flex-col gap-4">
              {[
                { label:"🌱 Short Term",  sub:"0–6 months",  text: result.growthStrategy.shortTerm, color:"text-success", bg:"bg-success/5 border-success/15" },
                { label:"🚀 Mid Term",    sub:"6–18 months", text: result.growthStrategy.midTerm,   color:"text-warning", bg:"bg-warning/5 border-warning/15" },
                { label:"🌍 Long Term",   sub:"18+ months",  text: result.growthStrategy.longTerm,  color:"text-accent",  bg:"bg-accent/5 border-accent/15"   },
              ].map(g => (
                <div key={g.label} className={`rounded-[14px] border p-5 ${g.bg}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[15px] font-semibold ${g.color}`}>{g.label}</span>
                    <span className="text-[12px] text-text3 border border-border rounded-full px-2.5 py-0.5">{g.sub}</span>
                  </div>
                  <p className="text-[13px] text-text2 leading-relaxed">{g.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Metrics tab ── */}
          {tab === "metrics" && (
            <div className="card">
              <h3 className="section-title">📊 Success Metrics</h3>
              <div className="flex flex-col divide-y divide-border">
                {result.successMetrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-[12px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-text mb-0.5">{m.metric}</p>
                      <p className="text-[12px] text-text3">{m.timeline}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="px-3 py-1.5 rounded-[8px] bg-success/10 text-success border border-success/20 text-[13px] font-semibold">
                        {m.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="card py-16 text-center">
          <p className="text-[52px] mb-4">📋</p>
          <p className="text-[15px] font-semibold text-text mb-2">Ready to write your business plan?</p>
          <p className="text-[13px] text-text2">
            Select a startup and generate a complete business plan with revenue model, GTM strategy and growth roadmap.
          </p>
        </div>
      )}

    </div>
  );
}