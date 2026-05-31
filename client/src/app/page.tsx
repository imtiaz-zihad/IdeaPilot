import Link from "next/link";

const features = [
  { emoji: "🎯", title: "Idea Validator",     desc: "AI scores your startup across market demand, competition, and risk." },
  { emoji: "📊", title: "Market Research",    desc: "SWOT, TAM/SAM/SOM, competitor analysis and industry trends." },
  { emoji: "💰", title: "Financial Forecast", desc: "Revenue projections, burn rate, CAC/LTV and profitability timeline." },
  { emoji: "🎨", title: "Branding Assistant", desc: "Brand names, slogans, color palettes and logo concepts." },
  { emoji: "📑", title: "Pitch Deck",         desc: "12-slide investor deck generated and exported to PDF instantly." },
  { emoji: "🤝", title: "AI Co-Founder",      desc: "Persistent AI that remembers your startup across sessions." },
];

const stats = [
  { num: "10+",   label: "AI Modules" },
  { num: "Free",  label: "Gemini API" },
  { num: "12",    label: "Pitch Slides" },
  { num: "100%",  label: "AI Generated" },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        .landing-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px; border-bottom: 1px solid var(--border);
          background: var(--bg2); position: sticky; top: 0; z-index: 50;
        }
        .landing-logo {
          display: flex; align-items: center; gap: 10px;
        }
        .landing-logo-mark {
          width: 32px; height: 32px; background: var(--accent); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; color: #fff; font-family: 'Syne', sans-serif;
        }
        .landing-logo-text {
          font-weight: 700; font-size: 18px; font-family: 'Syne', sans-serif; color: var(--text);
        }
        .landing-logo-text span { color: var(--accent); }
        .nav-links { display: flex; gap: 12px; }
        .nav-link-ghost {
          padding: 8px 18px; border-radius: 10px; border: 1px solid var(--border2);
          color: var(--text2); text-decoration: none; font-size: 14px; transition: all .15s;
        }
        .nav-link-ghost:hover { background: var(--bg3); color: var(--text); }
        .nav-link-primary {
          padding: 8px 18px; border-radius: 10px; background: var(--accent);
          color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; transition: all .15s;
        }
        .nav-link-primary:hover { background: var(--accent2); }

        .hero {
          text-align: center; padding: 96px 24px 64px; max-width: 800px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-block; padding: 4px 14px; border-radius: 20px;
          background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2);
          color: var(--accent); font-size: 12px; font-weight: 500; margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 58px); font-weight: 800; line-height: 1.12;
          margin-bottom: 20px; font-family: 'Syne', sans-serif;
        }
        .hero-title span { color: var(--accent); }
        .hero-desc {
          font-size: 17px; color: var(--text2); max-width: 520px;
          margin: 0 auto 36px; line-height: 1.75;
        }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .hero-btn-primary {
          padding: 13px 28px; border-radius: 12px; background: var(--accent);
          color: #fff; text-decoration: none; font-size: 15px; font-weight: 600; transition: all .15s;
        }
        .hero-btn-primary:hover { background: var(--accent2); }
        .hero-btn-ghost {
          padding: 13px 28px; border-radius: 12px; border: 1px solid var(--border2);
          color: var(--text2); text-decoration: none; font-size: 15px; transition: all .15s;
        }
        .hero-btn-ghost:hover { background: var(--bg3); color: var(--text); }

        .features-section {
          padding: 0 48px 80px; max-width: 1100px; margin: 0 auto;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;
        }
        .feature-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px; transition: border-color .2s, transform .15s;
        }
        .feature-card:hover { border-color: var(--border2); transform: translateY(-2px); }
        .feature-emoji { font-size: 30px; margin-bottom: 12px; }
        .feature-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
        .feature-desc  { font-size: 13px; color: var(--text2); line-height: 1.65; }

        .stats-strip {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 32px 48px; background: var(--bg2);
        }
        .stats-grid {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 24px; text-align: center;
        }
        .stat-num   { font-size: 28px; font-weight: 800; color: var(--accent); font-family: 'Syne', sans-serif; margin-bottom: 4px; }
        .stat-label { font-size: 13px; color: var(--text2); }

        .cta-section { text-align: center; padding: 80px 24px; }
        .cta-title {
          font-size: clamp(24px, 4vw, 36px); font-weight: 800;
          margin-bottom: 16px; font-family: 'Syne', sans-serif;
        }
        .cta-desc  { color: var(--text2); font-size: 15px; margin-bottom: 28px; }
        .cta-btn {
          display: inline-block; padding: 14px 32px; border-radius: 12px;
          background: var(--accent); color: #fff; text-decoration: none;
          font-size: 15px; font-weight: 600; transition: all .15s;
        }
        .cta-btn:hover { background: var(--accent2); }

        .landing-footer {
          text-align: center; padding: 24px; color: var(--text3);
          font-size: 13px; border-top: 1px solid var(--border);
        }

        @media (max-width: 640px) {
          .landing-nav   { padding: 14px 20px; }
          .features-section { padding: 0 16px 60px; }
          .stats-strip   { padding: 24px 20px; }
        }
      `}</style>

      <main>
        {/* Navbar */}
        <nav className="landing-nav">
          <div className="landing-logo">
            <div className="landing-logo-mark">AI</div>
            <span className="landing-logo-text">Co<span>Founder</span></span>
          </div>
          <div className="nav-links">
            <Link href="/login"    className="nav-link-ghost">Sign in</Link>
            <Link href="/register" className="nav-link-primary">Get started free</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">✦ AI-Powered Startup Incubator</div>
          <h1 className="hero-title">
            Build your startup<br />
            <span>without a team</span>
          </h1>
          <p className="hero-desc">
            From idea to investor-ready in minutes. AI validates your concept,
            writes your business plan, forecasts revenue, and builds your pitch deck.
          </p>
          <div className="hero-btns">
            <Link href="/register" className="hero-btn-primary">Start for free →</Link>
            <Link href="/login"    className="hero-btn-ghost">Sign in</Link>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-emoji">{f.emoji}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="stats-strip">
          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2 className="cta-title">Ready to build your startup?</h2>
          <p className="cta-desc">Join thousands of entrepreneurs building with AI.</p>
          <Link href="/register" className="cta-btn">Get started for free →</Link>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          © 2025 CoFounder AI · Built with Next.js & Gemini API
        </footer>
      </main>
    </>
  );
}