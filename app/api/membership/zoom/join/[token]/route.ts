import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import nodeCrypto from "crypto";
function base64UrlToRegular(s: string) {
  // No-op here; signatures are compared in base64url form
  return s;
}

function base64UrlFromBuffer(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } },
) {
  try {
    const token = params.token;
    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // redirect to login with next
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const loginUrl = `/auth/login?next=${encodeURIComponent(request.url)}`;
      return NextResponse.redirect(new URL(loginUrl, siteUrl || "/"));
    }

    const linkRes = await supabase
      .from("meeting_links")
      .select("*, group_sessions(*)")
      .eq("token", token)
      .maybeSingle();
    const link = linkRes.data;
    if (!link)
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });

    // Verify signature and expiry if MEETING_LINK_SECRET configured
    const secret = process.env.MEETING_LINK_SECRET || null;
    if (secret) {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 400 },
        );
      }
      const [raw, expiresPart, sig] = parts;
      const payload = `${raw}|${link.session_id}|${link.expires_at}`;
      const hmac = nodeCrypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest();
      const expected = base64UrlFromBuffer(Buffer.from(hmac));
      if (sig !== expected) {
        return NextResponse.json(
          { error: "Invalid token signature" },
          { status: 403 },
        );
      }
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 403 });
      }

      if (link.single_use && link.used) {
        return NextResponse.json(
          { error: "Token already used" },
          { status: 403 },
        );
      }
    } else {
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 403 });
      }
    }

    // Check user membership or attendee record
    const membershipRes = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .maybeSingle();

    if (!membershipRes.data) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    // Fetch meeting join_url from zoom_meetings or use zoom_meeting_id
    let joinUrl = null;
    if (link.zoom_meeting_id) {
      const mres = await supabase
        .from("zoom_meetings")
        .select("*")
        .eq("zoom_meeting_id", link.zoom_meeting_id)
        .maybeSingle();
      joinUrl = mres.data?.join_url || null;
    }
    if (!joinUrl && link.group_sessions?.zoom_meeting_id) {
      const mres = await supabase
        .from("zoom_meetings")
        .select("*")
        .eq("zoom_meeting_id", link.group_sessions.zoom_meeting_id)
        .maybeSingle();
      joinUrl = mres.data?.join_url || null;
    }

    if (!joinUrl) {
      // If we don't have a join URL recorded, redirect to the session page
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const fallback = `/membership`;
      return NextResponse.redirect(new URL(fallback, siteUrl || "/"));
    }
    // If single-use, mark used
    try {
      if (link.single_use && !link.used) {
        await supabase
          .from("meeting_links")
          .update({ used: true, used_at: new Date().toISOString() })
          .eq("id", link.id);
      }
    } catch (e) {
      console.error("Failed to mark link used", e);
    }

    return NextResponse.redirect(new URL(joinUrl));
  } catch (err: any) {
    console.error("/api/membership/zoom/join/[token]", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
