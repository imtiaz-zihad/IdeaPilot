"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Startup } from "@/types";

/* ── helpers ── */
const EMOJI: Record<string, string> = {
  "Food Tech":"🍔","HealthTech":"💊","EdTech":"📚","FinTech":"💳",
  "SaaS":"☁️","E-Commerce":"🛒","AI / ML":"🤖","CleanTech":"🌱","LogisticsTech":"📦",
};

function scoreColor(s: number) {
  return s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
}
function scoreClass(s: number) {
  return s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-danger";
}

const QUICK = [
  { icon:"🎯", label:"Validate Idea",  href:"/validator",  border:"#6c63ff" },
  { icon:"🎨", label:"Build Brand",    href:"/branding",   border:"#ec4899" },
  { icon:"🖥️", label:"Pitch Deck",     href:"/pitch",      border:"#3b82f6" },
  { icon:"💰", label:"Financials",     href:"/financials", border:"#22c55e" },
];

export default function DashboardPage() {
  const { user }   = useAuthStore();
  const router     = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get("/startups")
      .then(({ data }) => setStartups(data.data))
      .finally(() => setLoading(false));
  }, []);

  const avg = startups.length
    ? Math.round(startups.reduce((a, s) => a + (s.investorScore || 0), 0) / startups.length)
    : 0;

  const STATS = [
    { label:"Active Startups",    value: startups.length,    sub:"in your workspace",   cls:"text-accent"  },
    { label:"AI Reports",         value: startups.length * 4, sub:"auto-generated",     cls:"text-success" },
    { label:"Avg Investor Score", value: avg || "—",          sub:"across all startups", cls:"text-warning" },
    { label:"AI Tokens Used",     value: "142k",              sub:"of 500k monthly",     cls:"text-info"    },
  ];

  return (
    <div className="page">

      {/* Welcome */}
      <p className="text-[14px] text-text2 mb-5">
        Welcome back, <strong className="text-text font-semibold">{user?.name}</strong> 👋
      </p>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {STATS.map(s => (
          <div key={s.label} className="card">
            <p className="text-[12px] text-text2 mb-2.5">{s.label}</p>
            <p className={`text-[30px] font-bold mb-1.5 ${s.cls}`}
              style={{ fontFamily:"'Syne',sans-serif" }}>
              {s.value}
            </p>
            <p className="text-[12px] text-text3">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Startups list ── */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-text">My Startups</h2>
          <button
            onClick={() => router.push("/startups")}
            className="text-[13px] text-accent bg-transparent border-none cursor-pointer hover:underline"
          >
            See all →
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[1,2,3].map(i => <div key={i} className="skeleton h-14" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[36px] mb-3">🚀</p>
            <p className="text-[13px] text-text2">
              No startups yet — click &quot;+ New Startup&quot; to begin.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {startups.slice(0, 5).map((s, i) => (
              <div
                key={s._id}
                onClick={() => router.push(`/startups/${s._id}`)}
                className={`flex items-center gap-3.5 py-3 cursor-pointer hover:bg-bg3 -mx-5 px-5 transition-colors duration-150 rounded-[8px]
                  ${i < Math.min(startups.length, 5) - 1 ? "border-b border-border" : ""}`}
              >
                {/* Emoji icon */}
                <div className="w-10 h-10 rounded-[10px] bg-bg3 flex items-center justify-center text-[20px] shrink-0">
                  {EMOJI[s.industry] ?? "💡"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text truncate mb-0.5">
                    {s.startupName}
                  </p>
                  <p className="text-[12px] text-text2 mb-1.5">
                    {s.industry} · {s.country}
                  </p>
                  {/* Score bar */}
                  <div className="score-bar w-36">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${s.investorScore ?? 0}%`,
                        background: s.investorScore ? scoreColor(s.investorScore) : "#21252e",
                      }}
                    />
                  </div>
                </div>

                {/* Score number */}
                <div className="text-right shrink-0">
                  <p className={`text-[22px] font-bold ${s.investorScore ? scoreClass(s.investorScore) : "text-text3"}`}
                    style={{ fontFamily:"'Syne',sans-serif" }}>
                    {s.investorScore ?? "—"}
                  </p>
                  <p className="text-[10px] text-text3">/100</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-[14px] font-semibold text-text mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK.map(a => (
            <button
              key={a.label}
              onClick={() => router.push(a.href)}
              className="card text-left transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
              onMouseEnter={e => (e.currentTarget.style.borderColor = a.border)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#ffffff12")}
            >
              <p className="text-[22px] mb-2">{a.icon}</p>
              <p className="text-[13px] font-medium text-text">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}