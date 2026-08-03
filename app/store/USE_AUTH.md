Auth Store (Zustand)

Overview

- Centralized auth store used across the client: `useAuth`.
- Exposes: `user`, `profile`, `membership`, `loading`, `error`.
- Methods: `fetchUser()`, `signOut()`, `setUser()`, `setProfile()`, `setMembership()`.
- The store is configured with `devtools` and `persist` (minimal partialize) but only persists whether the user was previously null to avoid leaking tokens.

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

- `fetchUser()` calls `/api/auth/user` and updates `user`, `profile`, and `membership`.
- After successful sign-in/signup flows, code should call `fetchUser()` to refresh client state.
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
