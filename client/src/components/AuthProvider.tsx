"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAccessToken, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.post("/auth/refresh")
        .then(({ data }) => setAccessToken(data.data.accessToken))
        .catch(() => logout());
    }
  }, []);

  return <>{children}</>;
}