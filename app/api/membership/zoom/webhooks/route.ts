import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/supabase-admin";
import { validateZoomWebhookRequest } from "@/lib/zoom-webhook";

async function refreshZoomTokenIfNeeded(serviceClient: any, tokenRow: any) {
  const now = new Date();
  const expiresAt = tokenRow?.expires_at ? new Date(tokenRow.expires_at) : null;
  if (!expiresAt || expiresAt <= now) {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      throw new Error("Zoom client not configured");

    const tokenUrl = `https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${encodeURIComponent(
      tokenRow.refresh_token,
    )}`;
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoom refresh failed: ${text}`);
    }
    const body = await res.json();
    const expiresAtNew = body.expires_in
      ? new Date(Date.now() + body.expires_in * 1000).toISOString()
      : null;

    await serviceClient
      .from("zoom_tokens")
      .update({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        scope: body.scope || null,
        expires_at: expiresAtNew,
      })
      .eq("user_id", tokenRow.user_id);

    return { access_token: body.access_token };
  }
  return { access_token: tokenRow.access_token };
}

export async function POST(request: Request) {
  try {
    const tokenResult = validateZoomWebhookRequest(request);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: tokenResult.status },
      );
    }

    const body = await request.json();

    // Only handle recording completed events for now
    const event = body.event || body.type || null;
    if (!event || !event.includes("recording")) {
      return NextResponse.json({ ok: true });
    }

    const meetingId =
      body?.payload?.object?.id || body?.payload?.object?.uuid || null;
    if (!meetingId) return NextResponse.json({ ok: true });

    const serviceClient = getAdminServiceClient();
    if (!serviceClient)
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );

    const meetingRowRes = await serviceClient
      .from("zoom_meetings")
      .select("*")
      .eq("zoom_meeting_id", meetingId)
      .maybeSingle();
    const meetingRow = meetingRowRes.data as any;
    if (!meetingRow) return NextResponse.json({ ok: true });

    const tokenRowRes = await serviceClient
      .from("zoom_tokens")
      .select("*")
      .eq("user_id", meetingRow.user_id)
      .maybeSingle();
    const tokenRow = tokenRowRes.data as any;
    if (!tokenRow) return NextResponse.json({ ok: true });

    const { access_token } = await refreshZoomTokenIfNeeded(
      serviceClient,
      tokenRow,
    );

    const recordingFiles = body?.payload?.object?.recording_files || [];
    const uploadedUrls: string[] = [];

    for (const file of recordingFiles) {
      const downloadUrl = file.download_url || file.play_url || null;
      if (!downloadUrl) continue;

      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = (file.file_type || "mp4").toLowerCase();
      const path = `${meetingId}/${file.id || Date.now()}.${ext}`;

      const uploadRes = await serviceClient.storage
        .from("zoom-recordings")
        .upload(path, buffer, { upsert: true });
      if (uploadRes.error) continue;

      const publicUrl = serviceClient.storage
        .from("zoom-recordings")
        .getPublicUrl(path).data.publicUrl;
      uploadedUrls.push(publicUrl);
    }

    // Update meeting row raw_response with recordings array
    const newRaw = {
      ...(meetingRow.raw_response || {}),
      recordings: uploadedUrls,
    };
    await (serviceClient as any)
      .from("zoom_meetings")
      .update({ raw_response: newRaw })
      .eq("id", meetingRow.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/membership/zoom/webhooks", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
