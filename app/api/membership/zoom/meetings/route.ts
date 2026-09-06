import { NextResponse } from "next/server";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";
import { getActiveMembership } from "@/lib/membership";

async function refreshZoomTokenIfNeeded(supabase: any, tokenRow: any) {
  const now = new Date();
  const expiresAt = tokenRow?.expires_at ? new Date(tokenRow.expires_at) : null;
  if (!expiresAt || expiresAt <= now) {
    // refresh
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

    await supabase
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
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Check membership
    const membership = await getActiveMembership(supabase, user.id);

    const isAdmin = await isAdminUser(user);
    if (!membership && !isAdmin) {
      return NextResponse.json(
        { error: "Premium membership required" },
        { status: 403 },
      );
    }

    const tokenRowRes = await supabase
      .from("zoom_tokens")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    const tokenRow = tokenRowRes.data;
    if (!tokenRow)
      return NextResponse.json(
        { error: "Zoom not connected" },
        { status: 400 },
      );

    const { access_token } = await refreshZoomTokenIfNeeded(supabase, tokenRow);

    const body = await request.json();
    const topic = body.topic || "1:1 coaching";
    const start_time = body.start_time; // ISO string expected
    const duration = body.duration_minutes || 30;

    const zoomCreateRes = await fetch(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          type: 2,
          start_time,
          duration,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            waiting_room: true,
          },
        }),
      },
    );

    if (!zoomCreateRes.ok) {
      const text = await zoomCreateRes.text();
      console.error("Zoom create meeting failed:", text);
      return NextResponse.json(
        { error: "Zoom create failed" },
        { status: 500 },
      );
    }

    const meetingJson = await zoomCreateRes.json();

    // Persist meeting metadata
    await supabase.from("zoom_meetings").insert({
      zoom_meeting_id: meetingJson.id,
      user_id: user.id,
      topic: meetingJson.topic,
      start_time: meetingJson.start_time,
      duration_minutes: meetingJson.duration,
      join_url: meetingJson.join_url,
      start_url: meetingJson.start_url,
      raw_response: meetingJson,
    });

    return NextResponse.json({ meeting: meetingJson });
  } catch (err: any) {
    console.error("/api/membership/zoom/meetings", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const res = await supabase
      .from("zoom_meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return NextResponse.json({ meetings: res.data || [] });
  } catch (err: any) {
    console.error("/api/membership/zoom/meetings GET", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
