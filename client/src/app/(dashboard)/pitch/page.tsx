"use client";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface PitchSlide { slideNumber: number; title: string; subtitle?: string; bullets?: string[]; highlight?: string; note?: string; }
interface UseOfFund  { category: string; percentage: number; }
interface PitchDeckResult { deckTitle: string; tagline: string; slides: PitchSlide[]; investorAsk: string; useOfFunds: UseOfFund[]; }

const ACCENTS = ["#6c63ff","#3b82f6","#22c55e","#f59e0b","#ec4899","#14b8a6","#8b5cf6","#ef4444","#06b6d4","#84cc16","#f97316","#6c63ff"];

export default function PitchDeckPage() {
  const [startups,    setStartups]    = useState<Startup[]>([]);
  const [selected,    setSelected]    = useState("");
  const [result,      setResult]      = useState<PitchDeckResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [cached,      setCached]      = useState(false);
  const [error,       setError]       = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting,   setExporting]   = useState(false);
  const [viewMode,    setViewMode]    = useState<"deck"|"list">("deck");
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  const handleGenerate = async (regen = false) => {
    if (!selected) return;
    setLoading(true); setError(""); setResult(null); setActiveSlide(0);
    try {
      const { data } = await api.post(`/startups/${selected}/pitch${regen ? "/regenerate" : ""}`);
      setResult(data.data.report.result);
      setCached(data.data.cached ?? false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const exportToPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      const jsPDF       = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540] });
      for (let i = 0; i < result.slides.length; i++) {
        setActiveSlide(i);
        await new Promise(r => setTimeout(r, 300));
        if (deckRef.current) {
          const canvas = await html2canvas(deckRef.current, { scale: 1.5, useCORS: true, backgroundColor: "#13151a" });
          if (i > 0) pdf.addPage([960, 540], "landscape");
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 960, 540);
        }
      }
      pdf.save(`${result.deckTitle}-PitchDeck.pdf`);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const slide  = result?.slides[activeSlide];
  const accent = ACCENTS[activeSlide] || "#6c63ff";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-head mb-1.5">🖥️ Pitch Deck Generator</h1>
        <p className="text-text2 text-[13px]">AI generates a 12-slide investor-ready pitch deck. Export to PDF in one click.</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-50">
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
            {loading ? <><span className="spinner w-3.5 h-3.5" /> Generating...</> : "✦ Generate Deck"}
          </button>
          {result && <>
            <button onClick={() => handleGenerate(true)} disabled={loading} className="btn-ghost">↺ Regenerate</button>
            <button onClick={exportToPDF} disabled={exporting}
              className="btn-ghost text-success! border-success/40! hover:bg-success/10!">
              {exporting ? "Exporting..." : "⬇ Export PDF"}
            </button>
          </>}
        </div>
        {error && <p className="text-danger text-[13px] mt-3">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card py-14 text-center">
          <div className="spinner-lg w-10 h-10 mb-4" />
          <p className="text-text2 text-[14px]">Building your 12-slide pitch deck...</p>
          <p className="text-text3 text-[12px] mt-1.5">Gemini is crafting investor-ready content for each slide</p>
        </div>
      )}

      {/* Deck */}
      {!loading && result && (
        <div>
          {/* Meta + View toggle */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] font-bold">{result.deckTitle}</span>
                {cached && <span className="text-[11px] text-text3 px-2 py-0.5 border border-border rounded-lg">cached</span>}
              </div>
              <p className="text-[12px] text-text2 mt-0.5">{result.tagline}</p>
            </div>
            <div className="flex gap-1.5">
              {(["deck","list"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] border cursor-pointer capitalize transition-all
                    ${viewMode === m ? "bg-accent text-white border-accent" : "bg-bg2 text-text2 border-border hover:bg-bg3"}`}>
                  {m === "deck" ? "🖥 Deck View" : "📋 List View"}
                </button>
              ))}
            </div>
          </div>

          {/* Investor Ask */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent/10 border border-accent/25 mb-4">
            <span className="text-[18px]">💰</span>
            <span className="text-[14px] font-medium">{result.investorAsk}</span>
          </div>

          {/* DECK VIEW */}
          {viewMode === "deck" && (
            <div>
              {/* Slide */}
              <div ref={deckRef}
                className="relative rounded-2xl overflow-hidden border border-border mb-3"
                style={{ background: "#13151a", aspectRatio: "16/9", minHeight: 340 }}>
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
                {/* Slide number */}
                <div className="absolute top-4 right-5 text-[11px] text-white/20">
                  {activeSlide + 1} / {result.slides.length}
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center p-10 pt-8">
                  {slide && (
                    slide.slideNumber === 1 ? (
                      // Cover slide
                      <div className="w-full text-center">
                        <div className="w-16 h-16 rounded-[14px] flex items-center justify-center text-[26px] font-bold text-white mx-auto mb-5 font-mono"
                          style={{ background: accent }}>
                          {result.deckTitle.slice(0,2).toUpperCase()}
                        </div>
                        <h1 className="text-[34px] font-bold text-white mb-2.5">{result.deckTitle}</h1>
                        <p className="text-[17px] text-white/50 mb-5">{slide.subtitle}</p>
                        <span className="inline-block px-5 py-2 rounded-full text-[13px]"
                          style={{ background: `${accent}25`, border: `1px solid ${accent}50`, color: accent }}>
                          {slide.highlight}
                        </span>
                      </div>
                    ) : (
                      // Regular slide
                      <div className="w-full grid gap-8" style={{ gridTemplateColumns: slide.highlight ? "1fr auto" : "1fr" }}>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                            style={{ color: accent }}>
                            {String(slide.slideNumber).padStart(2,"0")} — {slide.title}
                          </div>
                          <h2 className="text-[24px] font-bold text-white mb-4 leading-snug">{slide.subtitle}</h2>
                          {slide.bullets && (
                            <ul className="flex flex-col gap-2.5">
                              {slide.bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[13px] text-white/80 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: accent }} />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {slide.highlight && (
                          <div className="w-44 shrink-0 rounded-[14px] p-4 text-center"
                            style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: accent }}>Key Insight</div>
                            <p className="text-[12px] text-white/75 leading-relaxed">{slide.highlight}</p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 px-6 py-2.5 flex justify-between border-t border-white/5">
                  <span className="text-[11px] text-white/20">{result.deckTitle}</span>
                  <span className="text-[11px] text-white/20">Confidential</span>
                </div>
              </div>

              {/* Presenter note */}
              {slide?.note && (
                <div className="flex gap-2.5 items-start px-4 py-3 bg-bg2 border border-border rounded-[10px] mb-3">
                  <span className="text-[14px]">📝</span>
                  <p className="text-[12px] text-text2 leading-relaxed">
                    <strong className="text-text">Presenter note:</strong> {slide.note}
                  </p>
                </div>
              )}

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {result.slides.map((s, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                    className={`shrink-0 w-25 rounded-lg p-2.5 cursor-pointer text-left transition-all border
                      ${i === activeSlide ? "bg-white/10 " : "bg-bg2 border-border hover:bg-bg3"}`}
                    style={{ borderColor: i === activeSlide ? ACCENTS[i] : undefined }}>
                    <div className="text-[10px] font-semibold mb-1" style={{ color: ACCENTS[i] }}>
                      {String(i+1).padStart(2,"0")}
                    </div>
                    <div className={`text-[11px] leading-tight ${i === activeSlide ? "text-white" : "text-text2"}`}>{s.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div className="flex flex-col gap-3">
              {result.slides.map((s, i) => (
                <div key={i} className="card-sm border-l-[3px]" style={{ borderLeftColor: ACCENTS[i] }}>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[13px] font-bold shrink-0"
                      style={{ background: `${ACCENTS[i]}20`, color: ACCENTS[i] }}>
                      {String(i+1).padStart(2,"0")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[15px] font-semibold">{s.title}</span>
                        {s.subtitle && <span className="text-[12px] text-text2">— {s.subtitle}</span>}
                      </div>
                      {s.bullets && (
                        <ul className="flex flex-col gap-1.5 mb-2">
                          {s.bullets.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-2 text-[13px] text-text2 leading-relaxed">
                              <span className="shrink-0" style={{ color: ACCENTS[i] }}>→</span>{b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.highlight && (
                        <span className="inline-block px-3 py-1 rounded-lg text-[12px] mt-1"
                          style={{ background: `${ACCENTS[i]}15`, color: ACCENTS[i], border: `1px solid ${ACCENTS[i]}25` }}>
                          💡 {s.highlight}
                        </span>
                      )}
                      {s.note && <p className="text-[12px] text-text3 mt-2 italic">📝 {s.note}</p>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Use of Funds */}
              <div className="card">
                <div className="text-[14px] font-semibold mb-4">💸 Use of Funds</div>
                <div className="flex flex-col gap-3">
                  {result.useOfFunds.map((f, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px] text-text2">{f.category}</span>
                        <span className="text-[13px] font-semibold" style={{ color: ACCENTS[i] }}>{f.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-bg4 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${f.percentage}%`, background: ACCENTS[i] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty */}
      {!loading && !result && !error && (
        <div className="card py-14 text-center">
          <div className="text-[52px] mb-4">🖥️</div>
          <p className="text-[15px] font-semibold mb-2">Ready to pitch investors?</p>
          <p className="text-text2 text-[13px]">Select a startup and generate a 12-slide investor-ready pitch deck.</p>
        </div>
      )}
    </div>
  );
}