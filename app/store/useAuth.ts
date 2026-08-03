"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type User = any | null | undefined;

type AuthState = {
  user: User; // undefined = loading, null = not authenticated, object = authenticated
  profile: any | null;
  membership: any | null;
  loading: boolean;
  error?: string | null;
  setUser: (u: User) => void;
  setProfile: (p: any | null) => void;
  setMembership: (m: any | null) => void;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Zustand store with devtools + persist. Keep the config minimal to avoid parser issues.
export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: undefined,
        profile: null,
        membership: null,
        loading: false,
        error: null,

        setUser: (u: User) => set({ user: u, loading: false, error: null }),
        setProfile: (p: any | null) => set({ profile: p }),
        setMembership: (m: any | null) => set({ membership: m }),

        fetchUser: async () => {
          const { loading } = get() as any;
          if (loading) return;
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
          } catch (err) {
            const message = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);
            set({ user: null, profile: null, membership: null, loading: false, error: message ?? "unknown" } as any);
          }
        },

        signOut: async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
          } catch (e) {
            // ignore
          }
          set({ user: null, profile: null, membership: null, loading: false } as any);
        },
      }),
      {
        name: "auth-storage",
        partialize: (state: any) => ({ user: state.user === null ? null : undefined }),
      },
    ),
    { name: "useAuth-devtools" },
  ),
);

export default useAuth;
