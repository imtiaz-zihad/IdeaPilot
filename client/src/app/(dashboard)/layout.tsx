"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Topbar  from "@/components/layout/Topbar";
import api from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    (async () => {
      try {
        const { data: r } = await api.post("/auth/refresh");
        useAuthStore.getState().setAccessToken(r.data.accessToken);
        const { data: m } = await api.get("/auth/me");
        setAuth(m.data.user, r.data.accessToken);
        setStatus("ok");
      } catch {
        logout();
        setStatus("fail");
      }
    })();
  }, []);

  useEffect(() => {
    if (status === "fail") router.push("/login");
  }, [status]);

  /* Loading */
  if (status === "checking") return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-lg w-9 h-9 mb-3" />
        <p className="text-[13px] text-text3">Loading workspace...</p>
      </div>
    </div>
  );

  if (status === "fail") return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}