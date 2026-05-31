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
};

export default function Topbar() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  const title = Object.keys(titles).find(k => pathname.startsWith(k))
    ? titles[Object.keys(titles).find(k => pathname.startsWith(k))!]
    : "Dashboard";

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-bg2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold font-head">{title}</span>
          <span className="badge-accent text-xs">✦ Pro</span>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm px-3.5 py-1.5">
          + New Startup
        </button>
      </header>
      {showModal && <NewStartupForm onClose={() => setShowModal(false)} />}
    </>
  );
}