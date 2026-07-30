// ─── POST /api/upload — Upload payment screenshot ────
// Uploads to Supabase Storage bucket "payment-screenshots"
import { NextResponse } from "next/server";
import { createAdminClient, getAdminServiceClient } from "@/lib/supabase-admin";

const STORAGE_BUCKET = "payment-screenshots";

async function ensureStorageBucket(bucketName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return false;

  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: bucketName, public: true }),
    });

    if (response.ok) return true;
    if (response.status === 409) return true;

    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, and WebP images are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Prefer the admin service client for storage operations so uploads
    // succeed even if bucket policies would otherwise block anon/rls users.
    const serviceClient = getAdminServiceClient();

    const storageClient = serviceClient || supabase;

    if (!serviceClient) {
      // If service role client is not configured, return a helpful error
      // rather than silently failing due to RLS/bucket restrictions.
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY not set. Uploads require the admin client.",
        },
        { status: 500 },
      );
    }

    let uploadResult = await storageClient.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (
      uploadResult.error?.message?.includes("Bucket not found") ||
      uploadResult.error?.message?.includes("NoSuchBucket")
    ) {
      const bucketReady = await ensureStorageBucket(STORAGE_BUCKET);
      if (bucketReady) {
        uploadResult = await storageClient.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
      }
    }

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error.message },
        { status: 500 },
      );
    }

    // Attempt to return a public URL. If the bucket is private, create a
    // signed URL that expires in 7 days.
    const publicResult = await storageClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    // If public URL is available and non-empty, use it.
    if (publicResult?.data?.publicUrl) {
      return NextResponse.json({ url: publicResult.data.publicUrl });
    }

    // Fallback: create signed url (expires in 7 days)
    const signed = await storageClient.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    if (signed.error) {
      return NextResponse.json(
        { error: signed.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: signed.data?.signedUrl || "" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
