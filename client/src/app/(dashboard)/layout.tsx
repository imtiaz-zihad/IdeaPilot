"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();
  const [authState, setAuthState] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    const init = async () => {
      try {
        const { data: refreshData } = await api.post("/auth/refresh");
        const newToken = refreshData.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        const { data: meData } = await api.get("/auth/me");
        setAuth(meData.data.user, newToken);
        setAuthState("ok");
      } catch {
        logout();
        setAuthState("fail");
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authState === "fail") router.push("/login");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  if (authState === "checking") return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-bg4 border-t-accent mx-auto mb-3"
          style={{ animation: "spin .8s linear infinite" }} />
        <p className="text-text3 text-base">Loading workspace...</p>
      </div>
    </div>
  );

  if (authState === "fail") return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}