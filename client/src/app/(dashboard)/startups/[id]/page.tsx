"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Startup } from "@/types";

interface Report {
  _id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  createdAt: string;
}

interface StartupDetail {
  startup: Startup;
  reports: Report[];
}

const industryEmoji: Record<string, string> = {
  "Food Tech": "🍔",
  HealthTech: "💊",
  EdTech: "📚",
  FinTech: "💳",
  SaaS: "☁️",
  "E-Commerce": "🛒",
  "AI / ML": "🤖",
  CleanTech: "🌱",
  LogisticsTech: "📦",
};

const stageOptions = ["idea", "mvp", "growth", "scale"];

export default function StartupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleting, setDeleting] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

useEffect(() => {
  api.get(`/startups/${id}`)
    .then(({ data: res }) => {
      console.log("API response:", res); // ADD THIS
      setData(res.data);
    })
    .catch((err) => {
      console.log("API error:", err); // ADD THIS
      router.push("/startups");
    })
    .finally(() => setLoading(false));
}, [id]);

  // ✅ Safe destructuring — always runs, never crashes on null
  const reports = data?.reports ?? [];
  const s = data?.startup;

  // ✅ Loading + null guards AFTER safe destructuring
  if (loading) return <LoadingSkeleton />;
  if (!s) return null;

  const validationReport = reports.find((r) => r.type === "validation");
  const score = s.investorScore;
  const emoji = industryEmoji[s.industry] || "💡";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "validation", label: "AI Validation" },
    { id: "reports", label: `Reports (${reports.length})` },
  ];

  const handleStageUpdate = async (stage: string) => {
    setUpdatingStage(true);
    try {
      await api.patch(`/startups/${id}`, { stage });
      setData((prev) =>
        prev
          ? { ...prev, startup: { ...prev.startup, stage: stage as Startup["stage"] } }
          : prev
      );
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/startups/${id}`);
      router.push("/startups");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => router.push("/startups")}
        style={{
          background: "none", border: "none", color: "var(--text2)",
          fontSize: 13, cursor: "pointer", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}
      >
        ← Back to Startups
      </button>

      {/* Hero Card */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          {/* Icon */}
          <div style={{ width: 60, height: 60, borderRadius: 14, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {emoji}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{s.startupName}</h1>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#6c63ff20", color: "var(--accent)", border: "1px solid #6c63ff30", textTransform: "capitalize" }}>
                {s.stage}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>{s.idea}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "🏭", label: s.industry },
                { icon: "📍", label: s.country },
                { icon: "👥", label: s.targetAudience },
                { icon: "📅", label: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              ].map((tag) => (
                <span key={tag.label} style={metaTag}>{tag.icon} {tag.label}</span>
              ))}
            </div>
          </div>

          {/* Score ring */}
          {score && (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ position: "relative", width: 90, height: 90 }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg4)" strokeWidth="7" />
                  <circle cx="45" cy="45" r="36" fill="none"
                    stroke={scoreColor(score)} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray="226" strokeDashoffset={226 - (226 * score) / 100}
                  />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(score) }}>{score}</div>
                  <div style={{ fontSize: 9, color: "var(--text3)" }}>/100</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Investor Score</div>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text2)", marginRight: 4 }}>Stage:</span>
          {stageOptions.map((stage) => (
            <button key={stage} onClick={() => handleStageUpdate(stage)} disabled={updatingStage}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: "1px solid var(--border)", fontWeight: s.stage === stage ? 600 : 400,
                background: s.stage === stage ? "var(--accent)" : "var(--bg3)",
                color: s.stage === stage ? "#fff" : "var(--text2)",
                textTransform: "capitalize", transition: "all .15s",
              }}
            >
              {stage}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => router.push(`/validator?startup=${id}`)}
            style={{ padding: "7px 14px", borderRadius: 9, background: "var(--accent)", border: "none", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
          >
            ✦ {score ? "Re-validate" : "Validate Idea"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ padding: "7px 14px", borderRadius: 9, background: "#ef444415", border: "1px solid #ef444430", color: "var(--red)", fontSize: 12, cursor: "pointer" }}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px", background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? "var(--accent)" : "transparent"}`,
              color: activeTab === tab.id ? "var(--accent)" : "var(--text2)",
              fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: "pointer", transition: "all .15s", marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <InfoCard title="💡 The Idea" content={s.idea} />
          <InfoCard title="👥 Target Audience" content={s.targetAudience} />
          <InfoCard title="🏭 Industry" content={s.industry} />
          <InfoCard title="📍 Market" content={s.country} />
          <InfoCard title="📊 Current Stage" content={s.stage.toUpperCase()} accent />
          <InfoCard title="📅 Created" content={new Date(s.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
        </div>
      )}

      {/* Tab: AI Validation */}
      {activeTab === "validation" && (
        validationReport ? (
          <ValidationView result={validationReport.result} createdAt={validationReport.createdAt} />
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎯</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No validation yet</p>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>Run an AI validation to get your investor readiness score.</p>
            <button onClick={() => router.push(`/validator?startup=${id}`)}
              style={{ padding: "10px 22px", borderRadius: 10, background: "var(--accent)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              ✦ Validate Now
            </button>
          </div>
        )
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        reports.length === 0 ? (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No reports yet</p>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>AI-generated reports will appear here after you run validation, market research, or financial forecasting.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports.map((r) => (
              <div key={r._id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{reportIcon(r.type)}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>{r.type.replace("_", " ")}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {r.result?.overallScore && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(r.result.overallScore) }}>
                      {r.result.overallScore}/100
                    </span>
                  )}
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "#22c55e15", color: "var(--green)", border: "1px solid #22c55e25" }}>
                    completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 16, padding: 28, width: 400, maxWidth: "90vw" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Delete &quot;{s.startupName}&quot;?</h3>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 20 }}>
              This will permanently delete the startup and all its AI reports. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border2)", background: "none", color: "var(--text2)", cursor: "pointer", fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: "8px 18px", borderRadius: 10, background: "var(--red)", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function InfoCard({ title, content, accent }: { title: string; content: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.5 }}>{content}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ValidationView({ result, createdAt }: { result: any; createdAt: string }) {
  const dims = [
    { key: "demand",       label: "Market Demand", icon: "📈" },
    { key: "competition",  label: "Competition",   icon: "⚔️"  },
    { key: "monetization", label: "Monetization",  icon: "💰" },
    { key: "scalability",  label: "Scalability",   icon: "🚀" },
    { key: "risk",         label: "Risk Level",    icon: "⚠️"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Score + recommendation */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg4)" strokeWidth="7" />
            <circle cx="45" cy="45" r="36" fill="none"
              stroke={scoreColor(result.overallScore)} strokeWidth="7" strokeLinecap="round"
              strokeDasharray="226" strokeDashoffset={226 - (226 * result.overallScore) / 100}
            />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(result.overallScore) }}>{result.overallScore}</div>
            <div style={{ fontSize: 9, color: "var(--text3)" }}>/100</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {scoreLabel(result.overallScore)}
            <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400, marginLeft: 10 }}>
              Analyzed {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{result.recommendation}</p>
        </div>
      </div>

      {/* Dimensions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        {dims.map((d) => {
          const dim = result[d.key];
          if (!dim) return null;
          return (
            <div key={d.key} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{d.icon} {d.label}</span>
                <span style={{ fontSize: 11, color: scoreColor(dim.score), fontWeight: 600 }}>{dim.score}/100</span>
              </div>
              <div style={{ height: 4, background: "var(--bg4)", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${dim.score}%`, background: scoreColor(dim.score), borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 8, background: `${scoreColor(dim.score)}18`, color: scoreColor(dim.score) }}>
                {dim.label}
              </span>
              <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginTop: 8 }}>{dim.summary}</p>
            </div>
          );
        })}
      </div>

      {/* SWOT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          { title: "✅ Strengths",     items: result.strengths,     color: "var(--green)", bg: "#22c55e12" },
          { title: "⚠️ Weaknesses",    items: result.weaknesses,    color: "var(--red)",   bg: "#ef444412" },
          { title: "🌟 Opportunities", items: result.opportunities, color: "var(--amber)", bg: "#f59e0b12" },
        ].map((card) => (
          <div key={card.title} style={{ background: card.bg, border: `1px solid ${card.color}25`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: card.color, marginBottom: 10 }}>{card.title}</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
              {(card.items || []).map((item: string, i: number) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                  <span style={{ color: card.color, flexShrink: 0 }}>→</span>{item}
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
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {[80, 20, 20, 20].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 160 : 40, background: "var(--bg2)", borderRadius: 14, marginBottom: 14, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function scoreColor(s: number) {
  return s >= 75 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";
}

function scoreLabel(s: number) {
  if (s >= 85) return "Investor Ready";
  if (s >= 70) return "Strong Idea";
  if (s >= 55) return "Needs Work";
  if (s >= 40) return "Risky";
  return "Not Viable";
}

function reportIcon(type: string) {
  const icons: Record<string, string> = {
    validation: "🎯", business_plan: "📋",
    market_research: "📊", financial: "💰", pitch: "🖥️",
  };
  return icons[type] || "📄";
}

const metaTag: React.CSSProperties = {
  fontSize: 12, color: "var(--text2)", background: "var(--bg3)",
  padding: "4px 10px", borderRadius: 7, border: "1px solid var(--border)",
};