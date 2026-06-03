"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import NewStartupForm from "@/components/startup/NewStartupForm";

const titles: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/startups":   "My Startups",
  "/ai-chat":    "AI Co-Founder",
  "/validator":  "Idea Validator",
  "/market":     "Market Research",
  "/financials": "Financials",
  "/branding":   "Branding Assistant",
  "/pitch":      "Pitch Deck",
  "/settings":   "Settings",
  "/business-plan": "Business Plan Generator",
};

export default function Topbar() {
  const pathname      = usePathname();
  const [show, setShow] = useState(false);

  const title =
    Object.entries(titles).find(
      ([k]) => pathname === k || pathname.startsWith(k + "/")
    )?.[1] ?? "Dashboard";

  return (
    <>
      <header className="h-14 shrink-0 bg-bg2 border-b border-border flex items-center justify-between px-6">

        {/* Left — title + badge */}
        <div className="flex items-center gap-3">
          <h1
            className="text-[16px] font-semibold text-text"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {title}
          </h1>
          <span className="badge-accent">✦ Pro</span>
        </div>

        {/* Right — action */}
        <button
          onClick={() => setShow(true)}
          className="btn-primary"
        >
          + New Startup
        </button>

      </header>

      {show && <NewStartupForm onClose={() => setShow(false)} />}
    </>
  );
}