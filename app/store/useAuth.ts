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
  if (loading) return true;
  if (force) return false;
  if (user === undefined) return false;
  return now - lastAuthFetchAt < 30_000;
}

let authFetchInFlight: Promise<void> | null = null;
let lastAuthFetchAt = 0;

type AuthState = {
  user: User; // undefined = loading, null = not authenticated, object = authenticated
  profile: any | null;
  membership: any | null;
  loading: boolean;
  error?: string | null;
  setUser: (u: User) => void;
  setProfile: (p: any | null) => void;
  setMembership: (m: any | null) => void;
  fetchUser: (force?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

// Zustand store with devtools + persist. Keep the config minimal to avoid parser issues.
export const useAuth = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: undefined,
      profile: null,
      membership: null,
      loading: false,
      error: null,

      setUser: (u: User) => set({ user: u, loading: false, error: null }),
      setProfile: (p: any | null) => set({ profile: p }),
      setMembership: (m: any | null) => set({ membership: m }),

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

        if (authFetchInFlight) {
          if (force) {
            await authFetchInFlight;
          }
          return;
        }

        authFetchInFlight = (async () => {
          set({ loading: true } as any);
          try {
            const res = await fetch("/api/auth/user", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            set({
              user: data?.user ?? null,
              profile: data?.profile ?? null,
              membership: data?.membership ?? null,
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
              user: null,
              profile: null,
              membership: null,
              loading: false,
              error: message ?? "unknown",
            } as any);
            lastAuthFetchAt = Date.now();
          } finally {
            authFetchInFlight = null;
          }
        })();

        await authFetchInFlight;
      },

      signOut: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
          // ignore
        }
        lastAuthFetchAt = 0;
        set({
          user: null,
          profile: null,
          membership: null,
          loading: false,
        } as any);
      },
    }),
    { name: "useAuth-devtools" },
  ),
);

export default useAuth;
