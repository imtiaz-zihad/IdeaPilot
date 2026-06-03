"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const navSections = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "⊞" },
      { label: "My Startups", href: "/startups", icon: "🚀" },
      { label: "AI Co-Founder", href: "/ai-chat", icon: "💬" },
      { label: "AI Business Plan", href: "/business-plan", icon: "📋" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Idea Validator", href: "/validator", icon: "🎯" },
      { label: "Market Research", href: "/market", icon: "📊" },
      { label: "Financials", href: "/financials", icon: "💰" },
      { label: "Branding", href: "/branding", icon: "🎨" },
      { label: "Pitch Deck", href: "/pitch", icon: "🖥️" },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings", icon: "⚙️" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-55 min-h-screen bg-bg2 border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4.5 border-b border-border">
        <div
          className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-[13px] font-bold text-white shrink-0"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          AI
        </div>
        <span
          className="text-[16px] font-bold text-text"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Idea<span className="text-accent">Pilot</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navSections.map((sec) => (
          <div key={sec.label}>
            {/* Section label */}
            <p className="text-[10px] font-semibold tracking-[0.08em] text-text3 uppercase px-2.5 pt-3 pb-1.5">
              {sec.label}
            </p>
            {/* Items */}
            {sec.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <span className="text-[15px] leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-2 border-t border-border">
        <button
          onClick={handleLogout}
          title="Click to logout"
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[10px] border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-bg3"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[12px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6c63ff, #a855f7)" }}
          >
            {initials}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-text truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-text3">Pro · Logout</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
