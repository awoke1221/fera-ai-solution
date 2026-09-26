export function validateZoomWebhookRequest(request: Request) {
  const expected = process.env.ZOOM_WEBHOOK_VERIFICATION_TOKEN;
  const received = request.headers.get("x-zoom-verification-token");

  if (!expected) {
    return {
      ok: false,
      status: 401,
      error: "Zoom webhook verification token is not configured",
    };
  }

  if (!received) {
    return {
      ok: false,
      status: 401,
      error: "Missing Zoom verification token header",
    };
  }

  if (expected !== received) {
    return {
      ok: false,
      status: 401,
      error: "Invalid Zoom verification token",
    };
  }

  return { ok: true };
}
