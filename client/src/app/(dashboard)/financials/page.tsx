/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import api from "@/lib/api";
import { Startup } from "@/types";

/* ── Types ─────────────────────────────────────── */
interface MonthlyProjection {
  month: number; label: string;
  revenue: number; expenses: number;
  profit: number; users: number;
}
interface FinancialResult {
  summary:       string;
  assumptions: {
    pricingModel:      string;
    avgRevenuePerUser: number;
    monthlyExpenses:   number;
    growthRate:        string;
    churnRate:         string;
    cac:               number;
    ltv:               number;
  };
  projections:    MonthlyProjection[];
  breakEvenMonth: number;
  breakEvenLabel: string;
  year1Revenue:   number;
  year2Revenue:   number;
  year3Revenue:   number;
  totalFunding:   string;
  burnRate:       number;
  runwayMonths:   number;
  keyMetrics: {
    ltvCacRatio:   string;
    grossMargin:   string;
    paybackPeriod: string;
    revenueGrowth: string;
  };
  risks:      string[];
  milestones: { label: string; month: number; description: string }[];
}

/* ── Helpers ────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M`
  : n >= 1000  ? `$${(n / 1000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg2 border border-border rounded-[10px] p-3 text-[12px]">
      <p className="font-semibold text-text mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function FinancialsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selected, setSelected] = useState("");
  const [result,   setResult]   = useState<FinancialResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cached,   setCached]   = useState(false);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState("charts");

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
      const url = `/startups/${selected}/financial${regen ? "/regenerate" : ""}`;
      const { data } = await api.post(url);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
      setTab("charts");
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: "charts",      label: "📈 Charts"      },
    { id: "projections", label: "📋 Projections"  },
    { id: "assumptions", label: "⚙️ Assumptions"  },
    { id: "milestones",  label: "🏁 Milestones"   },
    { id: "risks",       label: "⚠️ Risks"        },
  ];

  return (
    <div className="page">

      {/* Header */}
      <div className="mb-7">
        <h1 className="font-head text-[22px] font-bold text-text mb-1.5">💰 Financial Forecaster</h1>
        <p className="text-[13px] text-text2">
          AI generates 12-month revenue projections, burn rate, break-even analysis and key financial metrics.
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-50">
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
            {loading ? <><span className="spinner w-3.5 h-3.5" /> Forecasting...</> : "✦ Generate Forecast"}
          </button>
          {result && (
            <button onClick={() => generate(true)} disabled={loading} className="btn-ghost">↺ Regenerate</button>
          )}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card py-16 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Gemini AI is building your financial model...</p>
          <p className="text-text3 text-[12px] mt-1.5">Crunching 12-month projections — takes 10–15 seconds</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="fade-in">

          {/* Summary */}
          <div className="card mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-[15px] font-semibold text-text">Financial Overview</span>
              {cached && (
                <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-lg">cached</span>
              )}
            </div>
            <p className="text-[14px] text-text2 leading-relaxed">{result.summary}</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {[
              { label:"Year 1 Revenue",  value: fmt(result.year1Revenue),         color:"text-success", sub:"Projected"         },
              { label:"Burn Rate",       value: fmt(result.burnRate) + "/mo",      color:"text-danger",  sub:"Monthly average"   },
              { label:"Break-even",      value: result.breakEvenLabel,             color:"text-accent",  sub:"Profitability"     },
              { label:"Runway",          value: `${result.runwayMonths} months`,   color:"text-warning", sub: result.totalFunding },
            ].map(k => (
              <div key={k.label} className="card-sm">
                <p className="text-[11px] text-text3 mb-2 uppercase tracking-wider">{k.label}</p>
                <p className={`text-[20px] font-bold font-head mb-1 ${k.color}`}>{k.value}</p>
                <p className="text-[11px] text-text3">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {[
              { label:"LTV/CAC Ratio",    value: result.keyMetrics.ltvCacRatio   },
              { label:"Gross Margin",     value: result.keyMetrics.grossMargin   },
              { label:"Payback Period",   value: result.keyMetrics.paybackPeriod },
              { label:"Revenue Growth",   value: result.keyMetrics.revenueGrowth },
            ].map(m => (
              <div key={m.label} className="card-sm text-center">
                <p className="text-[11px] text-text3 mb-1.5">{m.label}</p>
                <p className="text-[18px] font-bold font-head text-accent">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Year projections */}
          <div className="grid grid-cols-3 gap-3.5 mb-5">
            {[
              { label:"Year 1", value: fmt(result.year1Revenue), color:"text-success" },
              { label:"Year 2", value: fmt(result.year2Revenue), color:"text-warning" },
              { label:"Year 3", value: fmt(result.year3Revenue), color:"text-accent"  },
            ].map(y => (
              <div key={y.label} className="card-sm text-center">
                <p className="text-[12px] text-text3 mb-1.5">{y.label} Revenue</p>
                <p className={`text-[22px] font-bold font-head ${y.color}`}>{y.value}</p>
              </div>
            ))}
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

          {/* ── Charts tab ── */}
          {tab === "charts" && (
            <div className="flex flex-col gap-5">

              {/* Revenue vs Expenses area chart */}
              <div className="card">
                <h3 className="section-title">Revenue vs Expenses (12 months)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={result.projections} margin={{ top:10, right:10, left:10, bottom:0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="label" tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize:12, color:"#8b90a0" }} />
                    <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6c63ff" fill="url(#revGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                    {result.breakEvenMonth <= 12 && (
                      <ReferenceLine x={`Month ${result.breakEvenMonth}`} stroke="#22c55e" strokeDasharray="4 4" label={{ value:"Break-even", fill:"#22c55e", fontSize:11 }} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Profit / Loss bar chart */}
              <div className="card">
                <h3 className="section-title">Monthly Profit / Loss</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.projections} margin={{ top:10, right:10, left:10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="label" tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#ffffff20" />
                    <Bar dataKey="profit" name="Profit/Loss" radius={[4,4,0,0]}
                      fill="#6c63ff"
                      label={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User growth bar chart */}
              <div className="card">
                <h3 className="section-title">User Growth (12 months)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.projections} margin={{ top:10, right:10, left:10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="label" tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#555a6a", fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" name="Paying Users" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Projections table tab ── */}
          {tab === "projections" && (
            <div className="card overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Month","Revenue","Expenses","Profit/Loss","Users"].map(h => (
                      <th key={h} className="text-left text-[11px] text-text3 uppercase tracking-wider pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.projections.map((p, i) => (
                    <tr key={i} className={`border-b border-border/50 transition-colors hover:bg-bg3 ${p.month === result.breakEvenMonth ? "bg-success/5" : ""}`}>
                      <td className="py-2.5 pr-4 text-text font-medium">
                        {p.label}
                        {p.month === result.breakEvenMonth && (
                          <span className="ml-2 badge-green text-[10px]">Break-even</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-success">{fmt(p.revenue)}</td>
                      <td className="py-2.5 pr-4 text-danger">{fmt(p.expenses)}</td>
                      <td className={`py-2.5 pr-4 font-semibold ${p.profit >= 0 ? "text-success" : "text-danger"}`}>
                        {p.profit >= 0 ? "+" : ""}{fmt(p.profit)}
                      </td>
                      <td className="py-2.5 pr-4 text-text2">{p.users.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Assumptions tab ── */}
          {tab === "assumptions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="section-title">📐 Model Assumptions</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label:"Pricing Model",        value: result.assumptions.pricingModel                 },
                    { label:"Avg Revenue / User",   value: fmt(result.assumptions.avgRevenuePerUser) + "/mo" },
                    { label:"Monthly Expenses",     value: fmt(result.assumptions.monthlyExpenses)          },
                    { label:"Growth Rate",          value: result.assumptions.growthRate                   },
                    { label:"Churn Rate",           value: result.assumptions.churnRate                    },
                    { label:"CAC",                  value: fmt(result.assumptions.cac)                     },
                    { label:"LTV",                  value: fmt(result.assumptions.ltv)                     },
                  ].map(a => (
                    <div key={a.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-[13px] text-text2">{a.label}</span>
                      <span className="text-[13px] font-medium text-text">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="section-title">💵 Funding Summary</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label:"Recommended Raise",  value: result.totalFunding,                   color:"text-accent"  },
                    { label:"Monthly Burn Rate",  value: fmt(result.burnRate),                  color:"text-danger"  },
                    { label:"Runway",             value: `${result.runwayMonths} months`,        color:"text-warning" },
                    { label:"Break-even",         value: result.breakEvenLabel,                 color:"text-success" },
                    { label:"Year 1 Revenue",     value: fmt(result.year1Revenue),              color:"text-success" },
                    { label:"Year 2 Revenue",     value: fmt(result.year2Revenue),              color:"text-warning" },
                    { label:"Year 3 Revenue",     value: fmt(result.year3Revenue),              color:"text-accent"  },
                  ].map(a => (
                    <div key={a.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-[13px] text-text2">{a.label}</span>
                      <span className={`text-[13px] font-bold ${a.color}`}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Milestones tab ── */}
          {tab === "milestones" && (
            <div className="card">
              <h3 className="section-title">🏁 12-Month Milestones</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4.75 top-0 bottom-0 w-0.5 bg-border" />
                <div className="flex flex-col gap-0">
                  {result.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-4 pb-6 relative">
                      {/* Dot */}
                      <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-[12px] font-bold text-accent shrink-0 z-10">
                        M{m.month}
                      </div>
                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <p className="text-[14px] font-semibold text-text mb-1">{m.label}</p>
                        <p className="text-[13px] text-text2 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Risks tab ── */}
          {tab === "risks" && (
            <div className="card">
              <h3 className="section-title">⚠️ Financial Risks</h3>
              <div className="flex flex-col gap-3">
                {result.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/15 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-danger/15 text-danger text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[13px] text-text2 leading-relaxed">{r}</p>
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
          <p className="text-[52px] mb-4">💰</p>
          <p className="text-[15px] font-semibold text-text mb-2">Ready to forecast your financials?</p>
          <p className="text-[13px] text-text2">
            Select a startup and generate a 12-month financial model with charts and projections.
          </p>
        </div>
      )}

    </div>
  );
}
