import test from "node:test";
import assert from "node:assert/strict";

import { shouldSkipAuthFetch } from "./useAuth";
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
