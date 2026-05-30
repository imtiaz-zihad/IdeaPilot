"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface BrandName {
  name: string;
  reasoning: string;
  domain: string;
  score: number;
}
interface Slogan { text: string; tone: string; }
interface ColorPalette {
  primary: string; secondary: string;
  accent: string; background: string;
  name: string; mood: string;
}
interface Typography { heading: string; body: string; reasoning: string; }
interface LogoConcept { style: string; icon: string; description: string; }
interface BrandingResult {
  brandNames: BrandName[];
  slogans: Slogan[];
  colorPalette: ColorPalette;
  typography: Typography;
  logoConcepts: LogoConcept[];
  brandPersonality: string[];
  targetTone: string;
  brandStory: string;
}

const toneColor: Record<string, string> = {
  Professional: "var(--blue)",
  Playful:      "var(--amber)",
  Bold:         "var(--red)",
  Inspirational:"var(--accent)",
  Minimal:      "var(--text2)",
};

export default function BrandingPage() {
  const [startups,  setStartups]  = useState<Startup[]>([]);
  const [selected,  setSelected]  = useState("");
  const [result,    setResult]    = useState<BrandingResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [cached,    setCached]    = useState(false);
  const [error,     setError]     = useState("");
  const [copied,    setCopied]    = useState("");

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const handleGenerate = async (regen = false) => {
    if (!selected) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const url = regen
        ? `/startups/${selected}/branding/regenerate`
        : `/startups/${selected}/branding`;
      const { data } = await api.post(url);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>🎨 Branding Assistant</h1>
        <p style={{ color: "var(--text2)", fontSize: 14 }}>
          AI generates brand names, slogans, color palette, typography and logo concepts for your startup.
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Select startup</label>
            {fetching ? (
              <div style={inputStyle}>Loading...</div>
            ) : startups.length === 0 ? (
              <div style={{ ...inputStyle, color: "var(--text3)" }}>No startups — create one first</div>
            ) : (
              <select style={inputStyle} value={selected}
                onChange={e => { setSelected(e.target.value); setResult(null); }}>
                {startups.map(s => (
                  <option key={s._id} value={s._id}>{s.startupName} — {s.industry}</option>
                ))}
              </select>
            )}
          </div>
          <button onClick={() => handleGenerate(false)} disabled={loading || !selected} style={primaryBtn}>
            {loading ? <><Spinner /> Generating...</> : "✦ Generate Branding"}
          </button>
          {result && (
            <button onClick={() => handleGenerate(true)} disabled={loading} style={ghostBtn}>
              ↺ Regenerate
            </button>
          )}
        </div>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 56, textAlign: "center" }}>
          <div style={spinnerStyle} />
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 16 }}>Building your brand identity...</p>
          <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>Gemini is crafting names, colors, and concepts</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Brand Story + Personality */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div style={card}>
              <SectionTitle>📖 Brand Story</SectionTitle>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>{result.brandStory}</p>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>Voice & Tone</div>
                <p style={{ fontSize: 13, color: "var(--text)" }}>{result.targetTone}</p>
              </div>
            </div>
            <div style={card}>
              <SectionTitle>⚡ Brand Personality</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {(result.brandPersonality || []).map((trait, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{trait}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Names */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <SectionTitle>✏️ Brand Names</SectionTitle>
              {cached && <span style={cachedBadge}>cached</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {(result.brandNames || []).map((b, i) => (
                <div key={i} style={{
                  background: "var(--bg3)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: 16, position: "relative",
                  borderLeft: i === 0 ? "3px solid var(--accent)" : "1px solid var(--border)",
                }}>
                  {i === 0 && (
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "var(--accent)", color: "#fff" }}>
                      Top Pick
                    </span>
                  )}
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: i === 0 ? "var(--accent)" : "var(--text)" }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>{b.domain}</div>
                  <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, marginBottom: 10 }}>{b.reasoning}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 60, height: 4, background: "var(--bg4)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${b.score}%`, background: b.score >= 75 ? "var(--green)" : b.score >= 50 ? "var(--amber)" : "var(--red)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{b.score}/100</span>
                    </div>
                    <button onClick={() => copyToClipboard(b.name, `name-${i}`)}
                      style={{ background: "none", border: "none", color: copied === `name-${i}` ? "var(--green)" : "var(--text3)", cursor: "pointer", fontSize: 12 }}>
                      {copied === `name-${i}` ? "✓ copied" : "copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slogans */}
          <div style={card}>
            <SectionTitle>💬 Slogans</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {(result.slogans || []).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg3)", borderRadius: 10, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: `${toneColor[s.tone] || "var(--accent)"}18`, color: toneColor[s.tone] || "var(--accent)", border: `1px solid ${toneColor[s.tone] || "var(--accent)"}30`, flexShrink: 0 }}>
                      {s.tone}
                    </span>
                    <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--text)" }}>&quot;{s.text}&quot;</span>
                  </div>
                  <button onClick={() => copyToClipboard(s.text, `slogan-${i}`)}
                    style={{ background: "none", border: "none", color: copied === `slogan-${i}` ? "var(--green)" : "var(--text3)", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>
                    {copied === `slogan-${i}` ? "✓ copied" : "copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette + Typography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Color Palette */}
            <div style={card}>
              <SectionTitle>🎨 Color Palette</SectionTitle>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 8 }}>{result.colorPalette?.name}</div>
              <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14, lineHeight: 1.5 }}>{result.colorPalette?.mood}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Primary",    hex: result.colorPalette?.primary },
                  { label: "Secondary",  hex: result.colorPalette?.secondary },
                  { label: "Accent",     hex: result.colorPalette?.accent },
                  { label: "Background", hex: result.colorPalette?.background },
                ].map(c => (
                  <div key={c.label} style={{ flex: 1, cursor: "pointer" }} onClick={() => copyToClipboard(c.hex, c.label)}>
                    <div style={{ height: 56, borderRadius: 10, background: c.hex, marginBottom: 6, border: "1px solid var(--border)", position: "relative" }}>
                      {copied === c.label && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#00000050", borderRadius: 10, fontSize: 12, color: "#fff" }}>✓</div>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center" }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text2)", textAlign: "center", fontFamily: "monospace" }}>{c.hex}</div>
                  </div>
                ))}
              </div>
              {/* Preview bar */}
              <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                {[result.colorPalette?.primary, result.colorPalette?.secondary, result.colorPalette?.accent, result.colorPalette?.background].map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>
            </div>

            {/* Typography */}
            <div style={card}>
              <SectionTitle>🔤 Typography</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>HEADING FONT</div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{result.typography?.heading}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>The quick brown fox jumps over the lazy dog</div>
                </div>
                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>BODY FONT</div>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>{result.typography?.body}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>The quick brown fox jumps over the lazy dog</div>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{result.typography?.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Logo Concepts */}
          <div style={card}>
            <SectionTitle>🖼️ Logo Concepts</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 4 }}>
              {(result.logoConcepts || []).map((l, i) => (
                <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>{l.icon}</div>
                  <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: 8, background: "var(--accent)18", color: "var(--accent)", fontSize: 11, fontWeight: 500, marginBottom: 10 }}>
                    {l.style}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{l.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 56, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎨</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ready to build your brand?</p>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>Select a startup and click Generate — AI will craft your full brand identity in seconds.</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{children}</div>;
}

function Spinner() {
  return <span style={{ width: 13, height: 13, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

// ── Styles ────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--bg2)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 20,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, color: "var(--text2)", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none",
};
const primaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "9px 20px", borderRadius: 10, background: "var(--accent)",
  border: "none", color: "#fff", fontSize: 13, fontWeight: 500,
  cursor: "pointer", flexShrink: 0,
};
const ghostBtn: React.CSSProperties = {
  padding: "9px 16px", borderRadius: 10, background: "none",
  border: "1px solid var(--border2)", color: "var(--text2)",
  fontSize: 13, cursor: "pointer", flexShrink: 0,
};
const spinnerStyle: React.CSSProperties = {
  width: 40, height: 40, border: "3px solid var(--bg4)",
  borderTopColor: "var(--accent)", borderRadius: "50%",
  animation: "spin .8s linear infinite", margin: "0 auto",
};
const cachedBadge: React.CSSProperties = {
  fontSize: 11, color: "var(--text3)", padding: "2px 8px",
  border: "1px solid var(--border)", borderRadius: 10,
};