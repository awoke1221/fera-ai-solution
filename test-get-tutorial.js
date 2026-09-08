const path = require("path");
const fsPromises = require("fs/promises");
const fs = require("fs");
const matter = require("gray-matter");
const { remark } = require("remark");
const html = require("remark-html");
const { serialize } = require("next-mdx-remote/serialize");

const tutorialsDir = path.join(process.cwd(), "content", "tutorials");

function normalizeSection(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || "General";
}

function normalizeLesson(value) {
  const num = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isNaN(num) ? undefined : num;
}

function normalizeDifficulty(value) {
  const text = String(value || "")
    .toLowerCase()
    .trim();
  if (text === "intermediate" || text === "advanced") return text;
  return "beginner";
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

async function readTutorialFile(filePath) {
  console.log("Reading file:", filePath);
  const raw = await fsPromises.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const isMdx = filePath.endsWith(".mdx");
  const isHtmlFile = filePath.endsWith(".html");
  const contentType =
    data.content_type === "html" || isHtmlFile ? "html" : "markdown";

  let contentHtml = undefined;
  let mdxSource = undefined;

  if (isMdx) {
    mdxSource = await serialize(content, {
      mdxOptions: { remarkPlugins: [], rehypePlugins: [] },
    });
    contentHtml = undefined;
  } else if (contentType === "html") {
    contentHtml = String(content || "").trim();
  } else {
    const processed = await remark()
      .use(html)
      .process(content || "");
    contentHtml = processed.toString();
  }

  const slug = path.basename(filePath).replace(/\.(md|mdx|html)$/, "");

  return {
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || undefined,
    date: data.date ? String(data.date) : undefined,
    section: normalizeSection(data.section ?? data.category),
    lesson: normalizeLesson(data.lesson),
    difficulty: normalizeDifficulty(data.difficulty),
    tags: normalizeTags(data.tags),
    contentType,
    contentHtml: contentHtml ? contentHtml.substring(0, 200) : undefined,
    mdxSource: mdxSource ? "[mdxSource present]" : undefined,
    readingTimeMinutes: calculateReadingTime(content),
  };
}

async function getTutorialBySlug(slug) {
  const tryPaths = [
    path.join(tutorialsDir, `${slug}.md`),
    path.join(tutorialsDir, `${slug}.mdx`),
    path.join(tutorialsDir, `${slug}.html`),
  ];
  for (const p of tryPaths) {
    if (fs.existsSync(p)) {
      return readTutorialFile(p);
    }
  }
  return undefined;
}

async function test() {
  try {
    console.log("Testing getTutorialBySlug...\n");

    const tutorial = await getTutorialBySlug("advanced-typescript");
    if (tutorial) {
      console.log("SUCCESS! Found tutorial:");
      console.log(JSON.stringify(tutorial, null, 2));
    } else {
      console.log("FAILED: Tutorial not found");
    }
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error("Stack:", err.stack);
  }
}

test();
