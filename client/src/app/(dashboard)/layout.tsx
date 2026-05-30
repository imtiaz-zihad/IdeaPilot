"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  // 3 states: "checking" | "authenticated" | "unauthenticated"
  const [authState, setAuthState] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    const init = async () => {
      // If we have a user in store, try to get a fresh token via cookie
      try {
        // Try refresh — works as long as the httpOnly cookie is valid (7 days)
        const { data } = await api.post("/auth/refresh");
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        // Also re-fetch user profile to keep it fresh
        const { data: meData } = await api.get("/auth/me");
        setAuth(meData.data.user, newToken);
        setAuthState("ok");
      } catch {
        // Refresh cookie expired or invalid — must log in
        logout();
        setAuthState("fail");
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (authState === "fail") {
      router.push("/login");
    }
  }, [authState]);

  // Show nothing while checking — prevents flash of login redirect
  if (authState === "checking") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #ffffff15",
            borderTopColor: "var(--accent)", borderRadius: "50%",
            animation: "spin .7s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ color: "var(--text3)", fontSize: 13 }}>Loading workspace...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authState === "fail") return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}