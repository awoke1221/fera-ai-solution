import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { createAdminClient, isAdminUser } from "@/lib/supabase-admin";

const tutorialsDir = path.join(process.cwd(), "content", "tutorials");

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

async function ensureAdmin() {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "unauthenticated" } as const;
  }

  const admin = await isAdminUser(user as any);
  if (!admin) {
    return { ok: false, status: 403, error: "forbidden" } as const;
  }

  return { ok: true, user } as const;
}

async function readTutorialFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = path.basename(filePath).replace(/\.(md|mdx|html)$/, "");

  const lesson =
    typeof data.lesson === "number"
      ? data.lesson
      : parseInt(String(data.lesson || ""), 10);

  return {
    slug,
    title: (data.title as string) || slug,
    excerpt: (data.excerpt as string) || "",
    section: (data.section as string) || (data.category as string) || "General",
    lesson: Number.isNaN(lesson) ? undefined : lesson,
    difficulty: (data.difficulty as string) || "beginner",
    tags: normalizeTags(data.tags),
    date: data.date ? String(data.date) : new Date().toISOString().slice(0, 10),
    contentType: data.content_type === "html" ? "html" : "markdown",
    content: String(content || ""),
  };
}

export async function GET() {
  try {
    const adminCheck = await ensureAdmin();
    if (!adminCheck.ok) {
      return new Response(JSON.stringify({ error: adminCheck.error }), {
        status: adminCheck.status,
      });
    }

    if (
      !(await fs
        .stat(tutorialsDir)
        .then(() => true)
        .catch(() => false))
    ) {
      return new Response(JSON.stringify({ posts: [] }), { status: 200 });
    }

    const files = await fs.readdir(tutorialsDir);
    const tutorialFiles = files.filter(
      (file) =>
        file.endsWith(".md") || file.endsWith(".mdx") || file.endsWith(".html"),
    );

    const posts = await Promise.all(
      tutorialFiles.map((file) =>
        readTutorialFile(path.join(tutorialsDir, file)),
      ),
    );

    return new Response(
      JSON.stringify({
        posts: posts.sort((a, b) => (b.date > a.date ? 1 : -1)),
      }),
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminCheck = await ensureAdmin();
    if (!adminCheck.ok) {
      return new Response(JSON.stringify({ error: adminCheck.error }), {
        status: adminCheck.status,
      });
    }

    const body = await req.json();
    const {
      slug,
      title,
      excerpt,
      content,
      date,
      section,
      lesson,
      difficulty = "beginner",
      tags,
      contentType = "markdown",
    } = body;

    if (!slug || !title || !content) {
      return new Response(
        JSON.stringify({ error: "slug, title and content required" }),
        { status: 400 },
      );
    }

    const normalizedSection = String(section || "General").trim() || "General";
    const normalizedLesson =
      typeof lesson === "number" && lesson > 0 ? lesson : undefined;
    const normalizedDifficulty =
      String(difficulty || "beginner").trim() || "beginner";
    const normalizedTags = normalizeTags(tags);
    const normalizedType = contentType === "html" ? "html" : "markdown";
    const extension = normalizedType === "html" ? "html" : "md";

    await fs.mkdir(tutorialsDir, { recursive: true });
    const lessonLine =
      normalizedLesson !== undefined ? `lesson: ${normalizedLesson}\n` : "";
    const front = `---\ntitle: ${title}\nexcerpt: ${excerpt || ""}\nsection: ${normalizedSection}\n${lessonLine}difficulty: ${normalizedDifficulty}\ntags: ${normalizedTags.length ? normalizedTags.join(", ") : ""}\ncontent_type: ${normalizedType}\ndate: ${date || new Date().toISOString().slice(0, 10)}\n---\n\n`;
    const filePath = path.join(tutorialsDir, `${slug}.${extension}`);
    await fs.writeFile(filePath, front + content, "utf8");
    return new Response(
      JSON.stringify({
        ok: true,
        path: `/content/tutorials/${slug}.${extension}`,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const adminCheck = await ensureAdmin();
    if (!adminCheck.ok) {
      return new Response(JSON.stringify({ error: adminCheck.error }), {
        status: adminCheck.status,
      });
    }

    const body = await req.json();
    const { slug } = body || {};

    if (!slug) {
      return new Response(JSON.stringify({ error: "slug required" }), {
        status: 400,
      });
    }

    const fileCandidates = [
      path.join(tutorialsDir, `${slug}.md`),
      path.join(tutorialsDir, `${slug}.mdx`),
      path.join(tutorialsDir, `${slug}.html`),
    ];

    for (const filePath of fileCandidates) {
      try {
        await fs.unlink(filePath);
        return new Response(JSON.stringify({ ok: true, deleted: slug }), {
          status: 200,
        });
      } catch {
        // continue to next candidate
      }
    }

    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}
