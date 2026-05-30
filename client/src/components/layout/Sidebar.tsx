"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",    icon: "⊞" },
  { label: "My Startups",    href: "/startups",     icon: "🚀" },
  { label: "AI Co-Founder",  href: "/ai-chat",      icon: "💬" },
  { label: "Idea Validator", href: "/validator",    icon: "🎯" },
  { label: "Market Research",href: "/market",       icon: "📊" },
  { label: "Financials",     href: "/financials",   icon: "💰" },
  { label: "Pitch Deck",     href: "/pitch",        icon: "🖥️" },
  { label: "Branding",      href: "/branding",     icon: "🎨" },
  { label: "Settings",       href: "/settings",     icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    logout();
    router.push("/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <aside style={{ width: 220, minHeight: "100vh", background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>AI</div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Co<span style={{ color: "var(--accent)" }}>Founder</span></span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text3)", padding: "10px 10px 6px", textTransform: "uppercase" }}>Workspace</div>
        {navItems.slice(0, 3).map(item => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
        <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text3)", padding: "14px 10px 6px", textTransform: "uppercase" }}>Tools</div>
        {navItems.slice(3, 7).map(item => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
        <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text3)", padding: "14px 10px 6px", textTransform: "uppercase" }}>Account</div>
        {navItems.slice(7).map(item => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer" }}
          onClick={handleLogout} title="Click to logout">
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Pro Plan · Logout</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active }: { item: typeof navItems[0]; active: boolean }) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(item.href)} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
      borderRadius: 8, cursor: "pointer", width: "100%", border: "none", textAlign: "left",
      background: active ? "var(--accent-glow, #6c63ff20)" : "none",
      color: active ? "var(--accent)" : "var(--text2)",
      fontSize: 13, fontWeight: active ? 500 : 400, marginBottom: 2, transition: "all .15s",
    }}>
      <span style={{ fontSize: 15 }}>{item.icon}</span>
      {item.label}
    </button>
  );
}