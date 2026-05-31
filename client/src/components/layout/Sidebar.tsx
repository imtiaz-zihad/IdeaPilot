"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const navSections = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard",     href: "/dashboard",  icon: "⊞" },
      { label: "My Startups",   href: "/startups",   icon: "🚀" },
      { label: "AI Co-Founder", href: "/ai-chat",    icon: "💬" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Idea Validator",  href: "/validator",  icon: "🎯" },
      { label: "Market Research", href: "/market",     icon: "📊" },
      { label: "Financials",      href: "/financials", icon: "💰" },
      { label: "Branding",        href: "/branding",   icon: "🎨" },
      { label: "Pitch Deck",      href: "/pitch",      icon: "🖥️" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: "⚙️" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    logout();
    router.push("/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <aside className="w-[220px] min-h-screen bg-bg2 border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-[18px] border-b border-border flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm text-white font-head">AI</div>
        <span className="font-bold text-xl font-head">Co<span className="text-accent">Founder</span></span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="text-2xs font-semibold tracking-widest text-text3 px-2.5 py-2.5 uppercase">
              {section.label}
            </div>
            {section.items.map(item => {
              const active = pathname === item.href;
              return (
                <button key={item.href} onClick={() => router.push(item.href)}
                  className={active ? "nav-item-active mb-0.5" : "nav-item mb-0.5"}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-2.5 py-3 border-t border-border">
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-bg3 transition-colors w-full cursor-pointer"
          title="Click to logout">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-base font-medium truncate">{user?.name}</div>
            <div className="text-xs text-text3">Pro · Logout</div>
          </div>
        </button>
      </div>
    </aside>
  );
}