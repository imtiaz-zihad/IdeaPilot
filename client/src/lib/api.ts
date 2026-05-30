import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // ← sends the httpOnly refreshToken cookie
});

// Attach in-memory access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → call /auth/refresh → retry original request once
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);

      // Flush queued requests
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      // Refresh failed — clear user and redirect
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;