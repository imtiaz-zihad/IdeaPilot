"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Startup } from "@/types";

const scoreColor = (s: number) =>
  s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-danger";

const industryEmoji: Record<string, string> = {
  "Food Tech":"🍔","HealthTech":"💊","EdTech":"📚","FinTech":"💳",
  "SaaS":"☁️","E-Commerce":"🛒","AI / ML":"🤖","CleanTech":"🌱","LogisticsTech":"📦",
};

export default function DashboardPage() {
  const { user }    = useAuthStore();
  const router      = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get("/startups").then(({ data }) => setStartups(data.data))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = startups.length
    ? Math.round(startups.reduce((a, s) => a + (s.investorScore || 0), 0) / startups.length)
    : 0;

  const stats = [
    { label: "Active Startups",    value: startups.length, delta: "in your workspace",   color: "text-accent" },
    { label: "AI Reports",         value: startups.length * 4, delta: "auto-generated",  color: "text-success" },
    { label: "Avg Investor Score", value: avgScore || "—",  delta: "across all startups", color: "text-warning" },
    { label: "AI Tokens Used",     value: "142k",           delta: "of 500k monthly",    color: "text-info" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-text2 text-md mb-6">
        Welcome back, <strong className="text-text">{user?.name}</strong> 👋
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="text-sm text-text2 mb-2">{s.label}</div>
            <div className={`text-5xl font-bold font-head mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-text3">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Startups */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">My Startups</span>
          <button onClick={() => router.push("/startups")} className="text-sm text-accent hover:underline bg-none border-none cursor-pointer">
            See all →
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-14" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🚀</div>
            <p className="text-text2 text-base">No startups yet — click &quot;New Startup&quot; to begin.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {startups.slice(0, 5).map(s => (
              <div key={s._id} onClick={() => router.push(`/startups/${s._id}`)}
                className="flex items-center gap-3.5 py-3 cursor-pointer hover:bg-bg3/50 -mx-5 px-5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center text-xl flex-shrink-0">
                  {industryEmoji[s.industry] || "💡"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-md truncate">{s.startupName}</div>
                  <div className="text-sm text-text2">{s.industry} · {s.country}</div>
                  <div className="h-1 bg-bg4 rounded mt-1.5 overflow-hidden w-32">
                    <div className="h-full bg-accent rounded" style={{ width: `${s.investorScore || 0}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-3xl font-bold font-head ${s.investorScore ? scoreColor(s.investorScore) : "text-text3"}`}>
                    {s.investorScore || "—"}
                  </div>
                  <div className="text-xs text-text3">/100</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}