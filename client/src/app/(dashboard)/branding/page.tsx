"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface BrandName   { name: string; reasoning: string; domain: string; score: number; }
interface Slogan      { text: string; tone: string; }
interface ColorPalette { primary: string; secondary: string; accent: string; background: string; name: string; mood: string; }
interface Typography  { heading: string; body: string; reasoning: string; }
interface LogoConcept { style: string; icon: string; description: string; }
interface BrandingResult {
  brandNames: BrandName[]; slogans: Slogan[];
  colorPalette: ColorPalette; typography: Typography;
  logoConcepts: LogoConcept[];
  brandPersonality: string[]; targetTone: string; brandStory: string;
}

const toneColor: Record<string, string> = {
  Professional:"text-info bg-info/10 border-info/20",
  Playful:"text-warning bg-warning/10 border-warning/20",
  Bold:"text-danger bg-danger/10 border-danger/20",
  Inspirational:"text-accent bg-accent/10 border-accent/20",
  Minimal:"text-text2 bg-bg3 border-border",
};

export default function BrandingPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selected, setSelected] = useState("");
  const [result,   setResult]   = useState<BrandingResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cached,   setCached]   = useState(false);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState("");

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const handleGenerate = async (regen = false) => {
    if (!selected) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await api.post(`/startups/${selected}/branding${regen ? "/regenerate" : ""}`);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-head mb-1.5">🎨 Branding Assistant</h1>
        <p className="text-text2 text-[13px]">AI generates brand names, slogans, color palette, typography and logo concepts.</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Select startup</label>
            {fetching ? <div className="input text-text3">Loading...</div>
              : startups.length === 0 ? <div className="input text-text3">No startups yet</div>
              : (
                <select className="input" value={selected}
                  onChange={e => { setSelected(e.target.value); setResult(null); }}>
                  {startups.map(s => <option key={s._id} value={s._id}>{s.startupName} — {s.industry}</option>)}
                </select>
              )}
          </div>
          <button onClick={() => handleGenerate(false)} disabled={loading || !selected} className="btn-primary">
            {loading ? <><span className="spinner w-3.5 h-3.5" /> Generating...</> : "✦ Generate Branding"}
          </button>
          {result && <button onClick={() => handleGenerate(true)} disabled={loading} className="btn-ghost">↺ Regenerate</button>}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card py-14 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Building your brand identity...</p>
          <p className="text-text3 text-[12px] mt-1.5">Gemini is crafting names, colors, and concepts</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="flex flex-col gap-4">

          {/* Story + Personality */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card lg:col-span-2">
              <div className="text-[14px] font-semibold mb-3">📖 Brand Story</div>
              <p className="text-[14px] text-text2 leading-relaxed">{result.brandStory}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-[11px] text-text3 mb-1.5">Voice & Tone</div>
                <p className="text-[13px]">{result.targetTone}</p>
              </div>
            </div>
            <div className="card">
              <div className="text-[14px] font-semibold mb-3">⚡ Brand Personality</div>
              <div className="flex flex-col gap-2">
                {(result.brandPersonality || []).map((trait, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-bg3 rounded-[8px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-[13px] font-medium">{trait}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Names */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[14px] font-semibold">✏️ Brand Names</div>
              {cached && <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-[8px]">cached</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(result.brandNames || []).map((b, i) => (
                <div key={i} className={`bg-bg3 rounded-[12px] p-4 relative border ${i === 0 ? "border-l-4 border-accent" : "border-border"}`}>
                  {i === 0 && <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-[6px] bg-accent text-white">Top Pick</span>}
                  <div className={`text-[18px] font-bold mb-1 ${i === 0 ? "text-accent" : "text-text"}`}>{b.name}</div>
                  <div className="text-[11px] text-text3 mb-2">{b.domain}</div>
                  <p className="text-[12px] text-text2 leading-relaxed mb-3">{b.reasoning}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1 bg-bg4 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.score}%`, background: b.score >= 75 ? "var(--green)" : b.score >= 50 ? "var(--amber)" : "var(--red)" }} />
                      </div>
                      <span className="text-[11px] text-text3">{b.score}/100</span>
                    </div>
                    <button onClick={() => copy(b.name, `name-${i}`)}
                      className={`text-[12px] bg-transparent border-none cursor-pointer ${copied === `name-${i}` ? "text-success" : "text-text3 hover:text-text2"}`}>
                      {copied === `name-${i}` ? "✓ copied" : "copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slogans */}
          <div className="card">
            <div className="text-[14px] font-semibold mb-3">💬 Slogans</div>
            <div className="flex flex-col gap-2.5">
              {(result.slogans || []).map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-bg3 rounded-[10px]">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`badge border flex-shrink-0 ${toneColor[s.tone] || "text-accent bg-accent/10 border-accent/20"}`}>{s.tone}</span>
                    <span className="text-[14px] italic">&quot;{s.text}&quot;</span>
                  </div>
                  <button onClick={() => copy(s.text, `slogan-${i}`)}
                    className={`text-[12px] bg-transparent border-none cursor-pointer flex-shrink-0 ${copied === `slogan-${i}` ? "text-success" : "text-text3 hover:text-text2"}`}>
                    {copied === `slogan-${i}` ? "✓" : "copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Palette + Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Palette */}
            <div className="card">
              <div className="text-[14px] font-semibold mb-3">🎨 Color Palette</div>
              <div className="font-semibold text-[13px] mb-1">{result.colorPalette?.name}</div>
              <p className="text-[12px] text-text2 mb-4 leading-relaxed">{result.colorPalette?.mood}</p>
              <div className="flex gap-2 mb-4">
                {[
                  { label:"Primary",    hex:result.colorPalette?.primary },
                  { label:"Secondary",  hex:result.colorPalette?.secondary },
                  { label:"Accent",     hex:result.colorPalette?.accent },
                  { label:"Background", hex:result.colorPalette?.background },
                ].map(c => (
                  <div key={c.label} className="flex-1 cursor-pointer" onClick={() => copy(c.hex, c.label)}>
                    <div className="h-14 rounded-[10px] border border-border mb-1.5 relative overflow-hidden" style={{ background: c.hex }}>
                      {copied === c.label && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[12px]">✓</div>
                      )}
                    </div>
                    <div className="text-[10px] text-text3 text-center">{c.label}</div>
                    <div className="text-[10px] text-text2 text-center font-mono">{c.hex}</div>
                  </div>
                ))}
              </div>
              <div className="h-2.5 rounded-full overflow-hidden flex">
                {[result.colorPalette?.primary, result.colorPalette?.secondary, result.colorPalette?.accent, result.colorPalette?.background]
                  .map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
              </div>
            </div>

            {/* Typography */}
            <div className="card">
              <div className="text-[14px] font-semibold mb-3">🔤 Typography</div>
              <div className="flex flex-col gap-3">
                <div className="bg-bg3 rounded-[10px] p-4">
                  <div className="text-[11px] text-text3 mb-1.5 uppercase tracking-wider">Heading Font</div>
                  <div className="text-[22px] font-bold mb-1">{result.typography?.heading}</div>
                  <div className="text-[11px] text-text3">The quick brown fox jumps over the lazy dog</div>
                </div>
                <div className="bg-bg3 rounded-[10px] p-4">
                  <div className="text-[11px] text-text3 mb-1.5 uppercase tracking-wider">Body Font</div>
                  <div className="text-[15px] mb-1">{result.typography?.body}</div>
                  <div className="text-[11px] text-text3">The quick brown fox jumps over the lazy dog</div>
                </div>
                <p className="text-[12px] text-text2 leading-relaxed">{result.typography?.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Logo Concepts */}
          <div className="card">
            <div className="text-[14px] font-semibold mb-4">🖼️ Logo Concepts</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(result.logoConcepts || []).map((l, i) => (
                <div key={i} className="bg-bg3 border border-border rounded-[12px] p-5 text-center">
                  <div className="text-[52px] mb-3">{l.icon}</div>
                  <span className="badge-accent text-[11px] mb-3 inline-block">{l.style}</span>
                  <p className="text-[12px] text-text2 leading-relaxed mt-2">{l.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !result && !error && (
        <div className="card py-14 text-center">
          <div className="text-[52px] mb-4">🎨</div>
          <p className="text-[15px] font-semibold mb-2">Ready to build your brand?</p>
          <p className="text-text2 text-[13px]">Select a startup and click Generate — AI will craft your full brand identity.</p>
        </div>
      )}
    </div>
  );
}