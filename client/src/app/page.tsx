import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>AI</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Co<span style={{ color: "var(--accent)" }}>Founder</span></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border2)", color: "var(--text2)", textDecoration: "none", fontSize: 14 }}>Sign in</Link>
          <Link href="/register" style={{ padding: "8px 18px", borderRadius: 10, background: "var(--accent)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "100px 24px 60px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#6c63ff20", border: "1px solid #6c63ff30", color: "var(--accent)", fontSize: 12, fontWeight: 500, marginBottom: 24 }}>
          ✦ AI-Powered Startup Incubator
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
          Build your startup<br />
          <span style={{ color: "var(--accent)" }}>without a team</span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--text2)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          From idea to investor-ready in minutes. AI validates your concept, writes your business plan, forecasts revenue, and builds your pitch deck.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ padding: "13px 28px", borderRadius: 12, background: "var(--accent)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
            Start for free →
          </Link>
          <Link href="/login" style={{ padding: "13px 28px", borderRadius: 12, border: "1px solid var(--border2)", color: "var(--text2)", textDecoration: "none", fontSize: 15 }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { emoji: "🎯", title: "Idea Validator", desc: "AI scores your startup idea with market demand, competition and risk analysis." },
            { emoji: "📊", title: "Market Research", desc: "Automatic SWOT, TAM/SAM/SOM, competitor table and industry trends." },
            { emoji: "💰", title: "Financial Forecast", desc: "Revenue projections, burn rate, CAC/LTV and profitability timeline." },
            { emoji: "🎨", title: "Branding Assistant", desc: "Brand names, slogans, logo concepts and domain availability checks." },
            { emoji: "📑", title: "Pitch Deck", desc: "12-slide investor deck generated automatically and exported to PDF." },
            { emoji: "🤝", title: "AI Co-Founder", desc: "Persistent AI assistant that remembers your startup context across sessions." },
          ].map((f) => (
            <div key={f.title} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.emoji}</div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "30px", color: "var(--text3)", fontSize: 13, borderTop: "1px solid var(--border)" }}>
        © 2025 CoFounder AI · Built with Next.js & Claude API
      </footer>
    </main>
  );
}