"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import NewStartupForm from "@/components/startup/NewStartupForm";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard", "/startups": "My Startups",
  "/ai-chat": "AI Co-Founder", "/validator": "Idea Validator",
  "/market": "Market Research", "/financials": "Financials",
  "/pitch": "Pitch Deck", "/settings": "Settings",
  "/branding": "Branding Assistant",
};

export default function Topbar() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header style={{ height: 56, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--bg2)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{titles[pathname] || "Dashboard"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#6c63ff20", color: "var(--accent)", border: "1px solid #6c63ff30" }}>✦ Pro</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "var(--accent)", border: "none", color: "#fff" }}>
            + New Startup
          </button>
        </div>
      </header>
      {showModal && <NewStartupForm onClose={() => setShowModal(false)} />}
    </>
  );
}