import test from "node:test";
import assert from "node:assert/strict";

import { validateZoomWebhookRequest } from "@/lib/zoom-webhook";

test("rejects requests when the verification token is missing from env", () => {
  const original = process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
  delete process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;

  try {
    const response = validateZoomWebhookRequest(
      new Request("https://example.com/api/membership/zoom/webhooks", {
        method: "POST",
        headers: { "x-zoom-verification-token": "abc" },
      }),
    );

    assert.equal(response.ok, false);
    assert.equal(response.status, 401);
    assert.match(String(response.error), /not configured/i);
  } finally {
    if (original) {
      process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = original;
    }
  }
});

test("rejects requests when the verification token header is missing", () => {
  const original = process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
  process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = "expected-token";

  try {
    const response = validateZoomWebhookRequest(
      new Request("https://example.com/api/membership/zoom/webhooks", {
        method: "POST",
        headers: {},
      }),
    );

    assert.equal(response.ok, false);
    assert.equal(response.status, 401);
    assert.match(String(response.error), /missing/i);
  } finally {
    if (original) {
      process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = original;
    } else {
      delete process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
    }
  }
});

test("rejects requests when the verification token does not match", () => {
  const original = process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
  process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = "expected-token";

  try {
    const response = validateZoomWebhookRequest(
      new Request("https://example.com/api/membership/zoom/webhooks", {
        method: "POST",
        headers: { "x-zoom-verification-token": "wrong-token" },
      }),
    );

    assert.equal(response.ok, false);
    assert.equal(response.status, 401);
    assert.match(String(response.error), /invalid/i);
  } finally {
    if (original) {
      process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = original;
    } else {
      delete process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
    }
  }
});

test("accepts requests when the verification token matches", () => {
  const original = process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
  process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = "expected-token";

  try {
    const response = validateZoomWebhookRequest(
      new Request("https://example.com/api/membership/zoom/webhooks", {
        method: "POST",
        headers: { "x-zoom-verification-token": "expected-token" },
      }),
    );

    assert.equal(response.ok, true);
  } finally {
    if (original) {
      process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN = original;
    } else {
      delete process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
    }
  }
});
