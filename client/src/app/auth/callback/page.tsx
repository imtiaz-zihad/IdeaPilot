"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    if (!token) { router.push("/login?error=oauth_failed"); return; }

    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { setAuth(data.data.user, token); router.push("/dashboard"); })
      .catch(() => router.push("/login?error=oauth_failed"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 spinner-lg mb-4" style={{ width: 40, height: 40 }} />
        <p className="text-text2 text-base">Completing sign in...</p>
      </div>
    </div>
  );
}