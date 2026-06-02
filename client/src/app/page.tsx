"use client";

import Link from "next/link";

const features = [
{
emoji: "🎯",
title: "Idea Validator",
desc: "AI scores your startup across market demand, competition, and execution risk.",
},
{
emoji: "📊",
title: "Market Research",
desc: "SWOT analysis, TAM/SAM/SOM insights, trends, and competitor intelligence.",
},
{
emoji: "💰",
title: "Financial Forecast",
desc: "Revenue projections, CAC/LTV calculations, runway and profitability estimates.",
},
{
emoji: "🎨",
title: "Brand Builder",
desc: "Generate startup names, taglines, positioning and branding ideas instantly.",
},
{
emoji: "📑",
title: "Pitch Deck Generator",
desc: "Create investor-ready presentations with AI-generated content and structure.",
},
{
emoji: "🤖",
title: "AI Co-Founder",
desc: "An AI partner that remembers your startup and helps you make decisions.",
},
];

const stats = [
{ value: "10+", label: "AI Modules" },
{ value: "100%", label: "AI Generated" },
{ value: "12", label: "Pitch Slides" },
{ value: "24/7", label: "Available" },
];

export default function LandingPage() {
return ( <main className="min-h-screen bg-bg text-text overflow-x-hidden">
{/* Navbar */} <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur"> <div className="page-wide flex items-center justify-between px-6 py-4"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-head font-bold text-white">
AI </div>

        <h1 className="font-head text-xl font-bold">
          Idea<span className="text-accent">Pilot</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login" className="btn-ghost">
          Sign In
        </Link>

        <Link href="/register" className="btn-primary">
          Get Started
        </Link>
      </div>
    </div>
  </nav>

  {/* Hero */}
  <section className="relative py-28 md:py-36">
    <div className="absolute left-1/2 top-0 h-112.5 w-112.5 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

    <div className="page relative z-10 px-6 text-center">
      <div className="badge-accent mx-auto mb-6">
        ✦ AI-Powered Startup Incubator
      </div>

      <h1 className="font-head mx-auto max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
        Build Your Startup
        <span className="block text-accent">
          Without a Team
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-text2">
        Validate startup ideas, research markets, generate financial
        forecasts and create investor-ready pitch decks using AI.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/register"
          className="btn-primary px-8 py-4 text-sm"
        >
          Start Free →
        </Link>

        <Link
          href="/login"
          className="btn-ghost px-8 py-4 text-sm"
        >
          View Demo
        </Link>
      </div>
    </div>
  </section>

  {/* Stats */}
  <section className="px-6 pb-20">
    <div className="page-wide grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="card text-center"
        >
          <h3 className="font-head text-3xl font-bold text-accent">
            {item.value}
          </h3>

          <p className="mt-2 text-sm text-text2">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  </section>

  {/* Features */}
  <section className="page-wide px-6 py-20">
    <div className="mb-16 text-center">
      <div className="badge-accent mx-auto mb-4">
        FEATURES
      </div>

      <h2 className="font-head text-4xl font-bold">
        Everything You Need
      </h2>

      <p className="mt-4 text-text2">
        From idea validation to fundraising.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="card-hover h-full"
        >
          <div className="mb-4 text-4xl">
            {feature.emoji}
          </div>

          <h3 className="mb-3 text-lg font-semibold">
            {feature.title}
          </h3>

          <p className="leading-7 text-text2">
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  </section>

  {/* How it Works */}
  <section className="bg-bg2 border-y border-border py-24">
    <div className="page-wide px-6">
      <div className="mb-16 text-center">
        <div className="badge-accent mx-auto mb-4">
          HOW IT WORKS
        </div>

        <h2 className="font-head text-4xl font-bold">
          From Idea to Startup
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card text-center">
          <div className="mb-4 text-4xl">💡</div>
          <h3 className="mb-3 font-semibold">
            Submit Your Idea
          </h3>
          <p className="text-text2">
            Describe your startup concept in a few sentences.
          </p>
        </div>

        <div className="card text-center">
          <div className="mb-4 text-4xl">⚡</div>
          <h3 className="mb-3 font-semibold">
            AI Analysis
          </h3>
          <p className="text-text2">
            AI validates, researches and forecasts your business.
          </p>
        </div>

        <div className="card text-center">
          <div className="mb-4 text-4xl">🚀</div>
          <h3 className="mb-3 font-semibold">
            Launch Faster
          </h3>
          <p className="text-text2">
            Receive a business plan and investor-ready materials.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="py-28">
    <div className="page px-6 text-center">
      <div className="card">
        <h2 className="font-head text-4xl font-bold">
          Ready to Build Your Startup?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-text2">
          Join entrepreneurs using AI to validate ideas,
          create business plans and impress investors.
        </p>

        <div className="mt-8">
          <Link
            href="/register"
            className="btn-primary px-8 py-4"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  </section>

  {/* Footer */}

<footer className="border-t border-border py-8 text-center text-sm text-text3">
  © 2026 IdeaPilot. Built by{" "}
  <Link
    href="https://imtiaz.swe.bd"
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium hover:underline"
  >
    Imtiaz
  </Link>
</footer>
</main>
);
}