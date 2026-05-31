"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Startup } from "@/types";
import NewStartupForm from "@/components/startup/NewStartupForm";

const industryEmoji: Record<string, string> = {
  "Food Tech":"🍔","HealthTech":"💊","EdTech":"📚","FinTech":"💳",
  "SaaS":"☁️","E-Commerce":"🛒","AI / ML":"🤖","CleanTech":"🌱","LogisticsTech":"📦",
};
const stageColor: Record<string, string> = {
  idea:"text-info bg-info/10 border-info/20",
  mvp:"text-warning bg-warning/10 border-warning/20",
  growth:"text-success bg-success/10 border-success/20",
  scale:"text-accent bg-accent/10 border-accent/20",
};
const scoreColor = (s: number) => s >= 75 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";
const scoreText  = (s: number) => s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-danger";

export default function StartupsPage() {
  const router = useRouter();
  const [startups,  setStartups]  = useState<Startup[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");

  const fetchStartups = () => {
    setLoading(true);
    api.get("/startups").then(({ data }) => setStartups(data.data)).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStartups(); }, []);

  const filtered = startups.filter(s => {
    const matchSearch = [s.startupName, s.idea, s.industry]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || s.stage === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold font-head mb-1">My Startups</h1>
          <p className="text-text2 text-[13px]">{startups.length} startup{startups.length !== 1 ? "s" : ""} in your workspace</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ New Startup</button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3 text-[14px]">🔍</span>
          <input className="input pl-8" placeholder="Search startups..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all","idea","mvp","growth","scale"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-[8px] text-[12px] font-medium cursor-pointer border capitalize transition-all
                ${filter === f ? "bg-accent text-white border-accent" : "bg-bg2 text-text2 border-border hover:bg-bg3"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} searched={!!search} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(s => (
            <StartupCard key={s._id} startup={s} onClick={() => router.push(`/startups/${s._id}`)} />
          ))}
        </div>
      )}

      {showModal && <NewStartupForm onClose={() => { setShowModal(false); fetchStartups(); }} />}
    </div>
  );
}

function StartupCard({ startup: s, onClick }: { startup: Startup; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="card cursor-pointer transition-all duration-150 hover:border-accent hover:-translate-y-0.5 hover:shadow-glow">
      {/* Top */}
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-bg3 flex items-center justify-center text-[22px] flex-shrink-0">
            {industryEmoji[s.industry] || "💡"}
          </div>
          <div>
            <div className="font-semibold text-[14px] mb-0.5">{s.startupName}</div>
            <div className="text-[12px] text-text2">{s.industry}</div>
          </div>
        </div>
        <span className={`badge border capitalize ${stageColor[s.stage]}`}>{s.stage}</span>
      </div>

      {/* Idea preview */}
      <p className="text-[13px] text-text2 leading-relaxed mb-4 line-clamp-2">{s.idea}</p>

      {/* Meta */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        <span className="meta-tag">📍 {s.country}</span>
        <span className="meta-tag truncate max-w-[140px]">👥 {s.targetAudience}</span>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-text3">Investor Score</span>
          <span className={`text-[12px] font-semibold ${s.investorScore ? scoreText(s.investorScore) : "text-text3"}`}>
            {s.investorScore ? `${s.investorScore}/100` : "Not validated"}
          </span>
        </div>
        <div className="h-[5px] bg-bg4 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${s.investorScore || 0}%`, background: s.investorScore ? scoreColor(s.investorScore) : "var(--bg4)" }} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-border flex justify-between items-center">
        <span className="text-[11px] text-text3">
          {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="text-[12px] text-accent font-medium">View details →</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="skeleton h-11 w-11 rounded-[12px]" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
      <div className="skeleton h-[5px] w-full mt-2" />
    </div>
  );
}

function EmptyState({ onNew, searched }: { onNew: () => void; searched: boolean }) {
  return (
    <div className="card py-16 text-center">
      <div className="text-[52px] mb-4">{searched ? "🔍" : "🚀"}</div>
      <p className="text-[16px] font-semibold mb-2">{searched ? "No startups found" : "No startups yet"}</p>
      <p className="text-text2 text-[13px] max-w-sm mx-auto mb-6">
        {searched ? "Try a different search term or clear the filter."
          : "Create your first AI-powered startup workspace."}
      </p>
      {!searched && <button onClick={onNew} className="btn-primary">+ Create First Startup</button>}
    </div>
  );
}