"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Startup } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Report { _id: string; type: string; result: any; createdAt: string; }
interface StartupDetail { startup: Startup; reports: Report[]; }

const industryEmoji: Record<string, string> = {
  "Food Tech":"🍔","HealthTech":"💊","EdTech":"📚","FinTech":"💳",
  "SaaS":"☁️","E-Commerce":"🛒","AI / ML":"🤖","CleanTech":"🌱","LogisticsTech":"📦",
};
const stageOptions = ["idea","mvp","growth","scale"];
const scoreColor   = (s: number) => s >= 75 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";
const scoreText    = (s: number) => s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-danger";
const scoreLabel   = (s: number) => s >= 85 ? "Investor Ready" : s >= 70 ? "Strong Idea" : s >= 55 ? "Needs Work" : s >= 40 ? "Risky" : "Not Viable";
const reportIcon   = (t: string) => ({ validation:"🎯", business_plan:"📋", market_research:"📊", financial:"💰", pitch:"🖥️", branding:"🎨" }[t] || "📄");

export default function StartupDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [data,               setData]               = useState<StartupDetail | null>(null);
  const [loading,            setLoading]            = useState(true);
  const [activeTab,          setActiveTab]          = useState("overview");
  const [deleting,           setDeleting]           = useState(false);
  const [updatingStage,      setUpdatingStage]      = useState(false);
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);

  useEffect(() => {
    api.get(`/startups/${id}`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => router.push("/startups"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reports = data?.reports ?? [];
  const s       = data?.startup;

  if (loading) return <LoadingSkeleton />;
  if (!s)      return null;

  const validationReport = reports.find(r => r.type === "validation");
  const score = s.investorScore;
  const emoji = industryEmoji[s.industry] || "💡";
  const tabs  = [
    { id: "overview",   label: "Overview" },
    { id: "validation", label: "AI Validation" },
    { id: "reports",    label: `Reports (${reports.length})` },
  ];

  const handleStageUpdate = async (stage: string) => {
    setUpdatingStage(true);
    try {
      await api.patch(`/startups/${id}`, { stage });
      setData(prev => prev ? { ...prev, startup: { ...prev.startup, stage: stage as Startup["stage"] } } : prev);
    } finally { setUpdatingStage(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/startups/${id}`); router.push("/startups"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back */}
      <button onClick={() => router.push("/startups")}
        className="flex items-center gap-1.5 text-text2 text-[13px] hover:text-text mb-5 bg-transparent border-none cursor-pointer">
        ← Back to Startups
      </button>

      {/* Hero */}
      <div className="card mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-[14px] bg-bg3 flex items-center justify-center text-[30px] flex-shrink-0">{emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <h1 className="text-[22px] font-bold font-head">{s.startupName}</h1>
              <span className="badge badge-accent capitalize">{s.stage}</span>
            </div>
            <p className="text-[14px] text-text2 leading-relaxed mb-3">{s.idea}</p>
            <div className="flex gap-2 flex-wrap">
              {[{icon:"🏭",v:s.industry},{icon:"📍",v:s.country},{icon:"👥",v:s.targetAudience},
                {icon:"📅",v:new Date(s.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}]
                .map(t => <span key={t.v} className="meta-tag">{t.icon} {t.v}</span>)}
            </div>
          </div>

          {/* Score ring */}
          {score && (
            <div className="text-center flex-shrink-0">
              <div className="relative w-[90px] h-[90px]">
                <svg width="90" height="90" viewBox="0 0 90 90" className="rotate-[-90deg]">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg4)" strokeWidth="7"/>
                  <circle cx="45" cy="45" r="36" fill="none" stroke={scoreColor(score)}
                    strokeWidth="7" strokeLinecap="round" strokeDasharray="226"
                    strokeDashoffset={226 - (226 * score) / 100}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-[20px] font-bold font-head ${scoreText(score)}`}>{score}</span>
                  <span className="text-[9px] text-text3">/100</span>
                </div>
              </div>
              <div className="text-[11px] text-text3 mt-1">Investor Score</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-border flex-wrap items-center">
          <span className="text-[12px] text-text2 mr-1">Stage:</span>
          {stageOptions.map(stage => (
            <button key={stage} onClick={() => handleStageUpdate(stage)} disabled={updatingStage}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] border capitalize cursor-pointer transition-all
                ${s.stage === stage ? "bg-accent text-white border-accent font-semibold" : "bg-bg3 text-text2 border-border hover:bg-bg4"}`}>
              {stage}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => router.push(`/validator?startup=${id}`)} className="btn-primary text-[12px] px-3.5 py-1.5">
            ✦ {score ? "Re-validate" : "Validate Idea"}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-[12px] px-3.5 py-1.5">
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border mb-5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] border-none cursor-pointer transition-all -mb-px
              ${activeTab === tab.id
                ? "text-accent border-b-2 border-accent font-medium bg-transparent"
                : "text-text2 border-b-2 border-transparent bg-transparent hover:text-text"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { title: "💡 The Idea",        content: s.idea },
            { title: "👥 Target Audience", content: s.targetAudience },
            { title: "🏭 Industry",        content: s.industry },
            { title: "📍 Market",          content: s.country },
            { title: "📊 Current Stage",   content: s.stage.toUpperCase(), accent: true },
            { title: "📅 Created",         content: new Date(s.createdAt).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) },
          ].map(c => (
            <div key={c.title} className="card-sm">
              <div className="text-[12px] text-text3 mb-2">{c.title}</div>
              <div className={`text-[14px] font-medium leading-relaxed ${c.accent ? "text-accent" : "text-text"}`}>{c.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: AI Validation */}
      {activeTab === "validation" && (
        validationReport
          ? <ValidationView result={validationReport.result} createdAt={validationReport.createdAt} />
          : <div className="card py-12 text-center">
              <div className="text-[48px] mb-3">🎯</div>
              <p className="text-[15px] font-semibold mb-2">No validation yet</p>
              <p className="text-text2 text-[13px] mb-5">Run an AI validation to get your investor readiness score.</p>
              <button onClick={() => router.push(`/validator?startup=${id}`)} className="btn-primary">✦ Validate Now</button>
            </div>
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        reports.length === 0
          ? <div className="card py-12 text-center">
              <div className="text-[48px] mb-3">📋</div>
              <p className="text-[15px] font-semibold mb-2">No reports yet</p>
              <p className="text-text2 text-[13px]">AI reports appear here after validation, market research, or forecasting.</p>
            </div>
          : <div className="flex flex-col gap-2.5">
              {reports.map(r => (
                <div key={r._id} className="card-sm flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{reportIcon(r.type)}</span>
                    <div>
                      <div className="text-[14px] font-medium capitalize">{r.type.replace("_"," ")}</div>
                      <div className="text-[12px] text-text3">
                        {new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {r.result?.overallScore && (
                      <span className={`text-[13px] font-bold ${scoreText(r.result.overallScore)}`}>
                        {r.result.overallScore}/100
                      </span>
                    )}
                    <span className="badge badge-green">completed</span>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="bg-bg2 border border-border2 rounded-xl p-7 w-full max-w-sm animate-slide-up">
            <h3 className="text-[17px] font-bold mb-2">Delete &quot;{s.startupName}&quot;?</h3>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
              This will permanently delete the startup and all its AI reports. This cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-[10px] bg-danger text-white text-[13px] font-medium cursor-pointer border-none disabled:opacity-50">
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ValidationView({ result, createdAt }: { result: any; createdAt: string }) {
  const dims = [
    { key:"demand",       label:"Market Demand", icon:"📈" },
    { key:"competition",  label:"Competition",   icon:"⚔️" },
    { key:"monetization", label:"Monetization",  icon:"💰" },
    { key:"scalability",  label:"Scalability",   icon:"🚀" },
    { key:"risk",         label:"Risk Level",    icon:"⚠️" },
  ];
  const sc = result.overallScore;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Score */}
      <div className="card flex gap-5 flex-wrap items-center">
        <div className="relative w-[90px] h-[90px] flex-shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90" className="rotate-[-90deg]">
            <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg4)" strokeWidth="7"/>
            <circle cx="45" cy="45" r="36" fill="none" stroke={scoreColor(sc)}
              strokeWidth="7" strokeLinecap="round" strokeDasharray="226"
              strokeDashoffset={226 - (226 * sc) / 100}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-[20px] font-bold ${scoreColor(sc) === "var(--green)" ? "text-success" : scoreColor(sc) === "var(--amber)" ? "text-warning" : "text-danger"}`}>{sc}</span>
            <span className="text-[9px] text-text3">/100</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold mb-1.5">
            {scoreLabel(sc)}
            <span className="text-[11px] text-text3 font-normal ml-2">
              Analyzed {new Date(createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </span>
          </div>
          <p className="text-[13px] text-text2 leading-relaxed">{result.recommendation}</p>
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dims.map(d => {
          const dim = result[d.key];
          if (!dim) return null;
          const c = scoreColor(dim.score);
          const ct = c === "var(--green)" ? "text-success" : c === "var(--amber)" ? "text-warning" : "text-danger";
          return (
            <div key={d.key} className="card-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium">{d.icon} {d.label}</span>
                <span className={`text-[11px] font-semibold ${ct}`}>{dim.score}/100</span>
              </div>
              <div className="h-1 bg-bg4 rounded-full mb-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${dim.score}%`, background: c }} />
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-[6px] ${ct}`}
                style={{ background: `${c}18` }}>{dim.label}</span>
              <p className="text-[12px] text-text2 leading-relaxed mt-2">{dim.summary}</p>
            </div>
          );
        })}
      </div>

      {/* SWOT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title:"✅ Strengths",     items:result.strengths,     color:"var(--green)", bg:"bg-success/5 border-success/15" },
          { title:"⚠️ Weaknesses",    items:result.weaknesses,    color:"var(--red)",   bg:"bg-danger/5 border-danger/15" },
          { title:"🌟 Opportunities", items:result.opportunities, color:"var(--amber)", bg:"bg-warning/5 border-warning/15" },
        ].map(c => (
          <div key={c.title} className={`rounded-[12px] border p-4 ${c.bg}`}>
            <div className="text-[13px] font-semibold mb-3" style={{ color: c.color }}>{c.title}</div>
            <ul className="flex flex-col gap-2">
              {(c.items||[]).map((item: string, i: number) => (
                <li key={i} className="flex gap-2 text-[12px] text-text2 leading-relaxed">
                  <span style={{ color: c.color }} className="flex-shrink-0">→</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-3.5">
      <div className="skeleton h-[160px] w-full" />
      <div className="skeleton h-10 w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="skeleton h-24" />)}
      </div>
    </div>
  );
}