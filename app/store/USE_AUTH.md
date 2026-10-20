Auth Store (Zustand)

Overview

- Centralized auth store used across the client: `useAuth`.
- Exposes: `user`, `profile`, `loading`, `error`.
- Methods: `fetchUser()`, `signOut()`, `setUser()`, `setProfile()`.
- The store is configured with `devtools`; auth tokens are not copied into client storage.
- Supabase session cookies persist across browser restarts and are refreshed by the shared middleware while the session remains valid.

Basic usage

- Read state:

```tsx
import useAuth from "@/app/store/useAuth";
const user = useAuth((s) => s.user);
const loading = useAuth((s) => s.loading);
```

- Call actions:

```tsx
const fetchUser = useAuth((s) => s.fetchUser);
useEffect(() => {
  fetchUser();
}, [fetchUser]);
```

Notes

- `fetchUser()` calls `/api/auth/user` and updates the signed-in `user` and optional `profile`.
- Membership is checked separately from authentication. Stack Advisor uses `/api/membership/access`; billing screens use `/api/membership/status`. A billing-history failure must never be treated as a sign-out.
- After successful sign-in/signup flows, code should call `fetchUser(true)` so a recent unauthenticated check cannot hide the new session.
- A temporary auth API/network failure preserves an already authenticated user; it does not sign the user out.
- Avoid storing sensitive tokens in the persisted state.

Example: require-auth gate

```tsx
import useAuth from "@/app/store/useAuth";
export function RequireAuth({ children }) {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const fetchUser = useAuth((s) => s.fetchUser);

  useEffect(() => {
    if (user === undefined) fetchUser();
  }, [user, fetchUser]);

  if (loading || user === undefined) return <div>Checking...</div>;
  if (!user) return <SignInPrompt />;
  return <>{children}</>;
}
```
