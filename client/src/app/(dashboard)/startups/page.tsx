"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Startup } from "@/types";
import NewStartupForm from "@/components/startup/NewStartupForm";

const industryEmoji: Record<string, string> = {
  "Food Tech": "🍔", "HealthTech": "💊", "EdTech": "📚",
  "FinTech": "💳", "SaaS": "☁️", "E-Commerce": "🛒",
  "AI / ML": "🤖", "CleanTech": "🌱", "LogisticsTech": "📦",
};

const stageColor: Record<string, string> = {
  idea: "var(--blue)", mvp: "var(--amber)",
  growth: "var(--green)", scale: "var(--accent)",
};

export default function StartupsPage() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchStartups = () => {
    setLoading(true);
    api.get("/startups")
      .then(({ data }) => setStartups(data.data))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStartups(); }, []);

  const filtered = startups.filter(s => {
    const matchSearch =
      s.startupName.toLowerCase().includes(search.toLowerCase()) ||
      s.idea.toLowerCase().includes(search.toLowerCase()) ||
      s.industry.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.stage === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Startups</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            {startups.length} startup{startups.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={primaryBtn}>
          + New Startup
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }}>🔍</span>
          <input
            style={{ ...inputStyle, paddingLeft: 34 }}
            placeholder="Search startups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "idea", "mvp", "growth", "scale"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: "pointer", border: "1px solid var(--border)",
              background: filter === f ? "var(--accent)" : "var(--bg2)",
              color: filter === f ? "#fff" : "var(--text2)",
              textTransform: "capitalize", transition: "all .15s",
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} searched={!!search} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(s => (
            <StartupCard
              key={s._id}
              startup={s}
              onClick={() => router.push(`/startups/${s._id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewStartupForm
          onClose={() => { setShowModal(false); fetchStartups(); }}
        />
      )}
    </div>
  );
}

// ── Startup Card ──────────────────────────────────────────

function StartupCard({ startup: s, onClick }: { startup: Startup; onClick: () => void }) {
  const emoji = industryEmoji[s.industry] || "💡";
  const score = s.investorScore;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 14, padding: 20, cursor: "pointer",
        transition: "border-color .2s, transform .15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            {emoji}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{s.startupName}</div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.industry}</div>
          </div>
        </div>
        {/* Stage badge */}
        <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
          background: `${stageColor[s.stage]}18`,
          color: stageColor[s.stage],
          border: `1px solid ${stageColor[s.stage]}30`,
          textTransform: "capitalize", flexShrink: 0,
        }}>
          {s.stage}
        </span>
      </div>

      {/* Idea preview */}
      <p style={{
        fontSize: 13, color: "var(--text2)", lineHeight: 1.6,
        marginBottom: 16, display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {s.idea}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={metaTag}>📍 {s.country}</span>
        <span style={metaTag}>👥 {s.targetAudience.length > 20 ? s.targetAudience.slice(0, 20) + "…" : s.targetAudience}</span>
      </div>

      {/* Investor score bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Investor Score</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: score ? scoreColor(score) : "var(--text3)" }}>
            {score ? `${score}/100` : "Not validated"}
          </span>
        </div>
        <div style={{ height: 5, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            width: `${score || 0}%`,
            background: score ? scoreColor(score) : "var(--bg4)",
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>
          {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>View details →</span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
      {[44, 16, 13, 13, 5].map((h, i) => (
        <div key={i} style={{
          height: h, background: "var(--bg4)", borderRadius: 6,
          marginBottom: 12, width: i === 0 ? 44 : i === 4 ? "100%" : `${70 - i * 10}%`,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────

function EmptyState({ onNew, searched }: { onNew: () => void; searched: boolean }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "64px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{searched ? "🔍" : "🚀"}</div>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        {searched ? "No startups found" : "No startups yet"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
        {searched
          ? "Try a different search term or clear the filter."
          : "Create your first startup workspace and let AI validate, plan, and forecast your idea."}
      </p>
      {!searched && (
        <button onClick={onNew} style={primaryBtn}>+ Create First Startup</button>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return "var(--green)";
  if (score >= 50) return "var(--amber)";
  return "var(--red)";
}

const primaryBtn: React.CSSProperties = {
  padding: "9px 18px", borderRadius: 10, background: "var(--accent)",
  border: "none", color: "#fff", fontSize: 13, fontWeight: 500,
  cursor: "pointer", flexShrink: 0,
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg2)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none",
};
const metaTag: React.CSSProperties = {
  fontSize: 11, color: "var(--text2)", background: "var(--bg3)",
  padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)",
};