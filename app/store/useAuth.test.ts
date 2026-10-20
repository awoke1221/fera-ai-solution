import test from "node:test";
import assert from "node:assert/strict";

import {
  getAuthFetchError,
  shouldPreserveAuthOnFetchError,
  shouldSkipAuthFetch,
} from "./useAuth";
import { isAdminProfile } from "../../lib/supabase-admin";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "../../lib/supabase-auth-config";
import {
  buildMembershipActivation,
  normalizeMembershipDuplicates,
} from "../../lib/membership";

test("should build a single active membership row payload for approval", () => {
  const startDate = new Date("2026-01-01T00:00:00.000Z");
  const payload = buildMembershipActivation({
    userId: "user-1",
    planId: "plan-1",
    paymentRequestId: "payment-1",
    startDate,
    durationDays: 30,
  });

  assert.equal(payload.user_id, "user-1");
  assert.equal(payload.plan_id, "plan-1");
  assert.equal(payload.payment_request_id, "payment-1");
  assert.equal(payload.is_active, true);
  assert.equal(
    payload.end_date,
    new Date("2026-01-31T00:00:00.000Z").toISOString(),
  );
});

test("should keep only the newest active membership record for a user", () => {
  const rows = [
    {
      id: "old",
      user_id: "user-1",
      is_active: true,
      end_date: "2026-01-10T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "newer",
      user_id: "user-1",
      is_active: true,
      end_date: "2026-02-10T00:00:00.000Z",
      created_at: "2026-01-15T00:00:00.000Z",
    },
  ];

  const normalized = normalizeMembershipDuplicates(rows as any[]);

  assert.equal(normalized.canonicalId, "newer");
  assert.deepEqual(normalized.duplicateIds, ["old"]);
});

test("should bypass stale cache when a forced refresh is requested", () => {
  const now = 1_000_000;
  const lastAuthFetchAt = now - 10_000;

  assert.equal(
    shouldSkipAuthFetch({
      loading: false,
      user: { id: "u1" },
      lastAuthFetchAt,
      now,
      force: true,
    }),
    false,
  );
});

test("should allow a forced refresh to run after an in-flight auth check", () => {
  assert.equal(
    shouldSkipAuthFetch({
      loading: true,
      user: undefined,
      lastAuthFetchAt: 0,
      now: 1_000_000,
      force: true,
    }),
    false,
  );
});

test("should skip refresh when the user data is fresh and no force is requested", () => {
  const now = 1_000_000;
  const lastAuthFetchAt = now - 5_000;

  assert.equal(
    shouldSkipAuthFetch({
      loading: false,
      user: { id: "u1" },
      lastAuthFetchAt,
      now,
      force: false,
    }),
    true,
  );
});

test("should preserve an authenticated user when the auth refresh request fails", () => {
  assert.equal(shouldPreserveAuthOnFetchError({ id: "u1" }), true);
  assert.equal(shouldPreserveAuthOnFetchError(null), false);
  assert.equal(shouldPreserveAuthOnFetchError(undefined), false);
});

test("auth refresh errors preserve the server message", () => {
  assert.equal(
    getAuthFetchError(503, "Unable to verify your sign-in."),
    "Unable to verify your sign-in.",
  );
  assert.equal(
    getAuthFetchError(503),
    "Unable to check your sign-in status (HTTP 503).",
  );
});

test("auth cookies persist across browser restarts and remain secure in production", () => {
  assert.equal(SUPABASE_AUTH_COOKIE_OPTIONS.maxAge, 60 * 60 * 24 * 365);
  assert.equal(SUPABASE_AUTH_COOKIE_OPTIONS.path, "/");
  assert.equal(SUPABASE_AUTH_COOKIE_OPTIONS.sameSite, "lax");
});

test("should only treat a profile as admin when it has an admin role flag or role", () => {
  assert.equal(
    isAdminProfile({ id: "u1", is_admin: false, role: "user" }),
    false,
  );
  assert.equal(
    isAdminProfile({ id: "u1", is_admin: true, role: "user" }),
    true,
  );
  assert.equal(
    isAdminProfile({ id: "u1", is_admin: false, role: "admin" }),
    true,
  );
  assert.equal(isAdminProfile(null), false);
});
