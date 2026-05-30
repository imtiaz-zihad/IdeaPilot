import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-store",
      // ✅ Only persist user — NOT accessToken
      // Token is refreshed automatically via httpOnly cookie
      partialize: (state) => ({ user: state.user }),
    }
  )
);