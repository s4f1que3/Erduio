import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, clearSession, updateSessionTokens } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const refreshClient = axios.create({ baseURL: BASE_URL, timeout: 15000 });

function logout() {
  clearSession();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = getSession();
      if (!session?.refresh_token) return null;
      try {
        const res = await refreshClient.post("/auth/refresh", { refresh_token: session.refresh_token });
        const { access_token, refresh_token } = res.data;
        updateSessionTokens({ access_token, refresh_token });
        return access_token as string;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
      logout();
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      logout();
    }
    return Promise.reject(err);
  }
);

export async function downloadFromUrl(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download file");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message ?? "An error occurred";
  }
  if (err instanceof Error) return err.message;
  return "An error occurred";
}
