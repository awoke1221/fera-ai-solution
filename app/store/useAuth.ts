"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

type User = any | null | undefined;

export function shouldSkipAuthFetch({
  loading,
  user,
  lastAuthFetchAt,
  now,
  force,
}: {
  loading: boolean;
  user: User;
  lastAuthFetchAt: number;
  now: number;
  force?: boolean;
}) {
  if (force) return false;
  if (loading) return true;
  if (user === undefined) return false;
  return now - lastAuthFetchAt < 30_000;
}

export function shouldPreserveAuthOnFetchError(user: User) {
  return user !== undefined && user !== null;
}

export function getAuthFetchError(status: number, message?: unknown) {
  return typeof message === "string" && message.trim()
    ? message
    : `Unable to check your sign-in status (HTTP ${status}).`;
}

let authFetchInFlight: Promise<void> | null = null;
let lastAuthFetchAt = 0;

type AuthState = {
  user: User; // undefined = loading, null = not authenticated, object = authenticated
  profile: any | null;
  loading: boolean;
  error?: string | null;
  setUser: (u: User) => void;
  setProfile: (p: any | null) => void;
  fetchUser: (force?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

// Auth tokens remain in Supabase-managed cookies rather than client storage.
export const useAuth = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: undefined,
      profile: null,
      loading: false,
      error: null,

      setUser: (u: User) => set({ user: u, loading: false, error: null }),
      setProfile: (p: any | null) => set({ profile: p }),

      fetchUser: async (force = false) => {
        const { loading, user } = get() as any;
        const now = Date.now();

        if (
          shouldSkipAuthFetch({
            loading,
            user,
            lastAuthFetchAt,
            now,
            force,
          })
        ) {
          return;
        }

        while (authFetchInFlight) {
          const inFlight = authFetchInFlight;
          await inFlight;
          if (!force) return;
        }

        authFetchInFlight = (async () => {
          set({ loading: true } as any);
          try {
            const res = await fetch("/api/auth/user", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(getAuthFetchError(res.status, data?.error));
            }
            if (!data || typeof data !== "object" || !("user" in data)) {
              throw new Error("The sign-in service returned an invalid response.");
            }
            set({
              user: data?.user ?? null,
              profile: data?.profile ?? null,
              loading: false,
              error: null,
            } as any);
            lastAuthFetchAt = Date.now();
          } catch (err) {
            const message =
              err && typeof err === "object" && "message" in err
                ? (err as any).message
                : String(err);
            set({
              ...(!shouldPreserveAuthOnFetchError(get().user)
                ? { user: undefined }
                : {}),
              loading: false,
              error: message ?? "unknown",
            } as any);
            lastAuthFetchAt = 0;
          } finally {
            authFetchInFlight = null;
          }
        })();

        await authFetchInFlight;
      },

      signOut: async () => {
        try {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          if (!response.ok) {
            throw new Error("Unable to end the server session.");
          }
        } catch (error) {
          lastAuthFetchAt = 0;
          set({
            loading: false,
            error: "Unable to end the server session. Please try again.",
          } as any);
          throw error instanceof Error
            ? error
            : new Error("Unable to end the server session. Please try again.");
        }
        lastAuthFetchAt = 0;
        set({
          user: null,
          profile: null,
          loading: false,
          error: null,
        } as any);
      },
    }),
    { name: "useAuth-devtools" },
  ),
);

export default useAuth;
