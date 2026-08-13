import fs from "fs/promises";
import path from "path";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
      });
    }

    const admin = await isAdminUser(user as any);
    if (!admin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
      });
    }

    const body = await req.json();
    const { slug, title, excerpt, content, date } = body;

    if (!slug || !title || !content) {
      return new Response(
        JSON.stringify({ error: "slug, title and content required" }),
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), "content", "tutorials");
    await fs.mkdir(dir, { recursive: true });
    const front = `---\ntitle: ${title}\nexcerpt: ${excerpt || ""}\ndate: ${date || new Date().toISOString().slice(0, 10)}\n---\n\n`;
    const filePath = path.join(dir, `${slug}.md`);
    await fs.writeFile(filePath, front + content, "utf8");
    return new Response(
      JSON.stringify({ ok: true, path: `/content/tutorials/${slug}.md` }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}
