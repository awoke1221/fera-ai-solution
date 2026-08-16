import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { serialize } from "next-mdx-remote/serialize";

export type TutorialContentType = "markdown" | "html";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type Tutorial = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  section?: string;
  lesson?: number;
  difficulty?: DifficultyLevel;
  tags?: string[];
  contentType?: TutorialContentType;
  contentHtml?: string;
  mdxSource?: any;
  readingTimeMinutes?: number;
};

const tutorialsDir = path.join(process.cwd(), "content", "tutorials");

function normalizeSection(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text || "General";
}

function normalizeLesson(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isNaN(num) ? undefined : num;
}

function normalizeDifficulty(value: unknown): DifficultyLevel {
  const text = String(value || "")
    .toLowerCase()
    .trim();
  if (text === "intermediate" || text === "advanced") return text;
  return "beginner";
}

function normalizeTags(value: unknown): string[] {
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

function calculateReadingTime(content: string): number {
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

async function readTutorialFile(filePath: string): Promise<Tutorial> {
  const raw = await fsPromises.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const isMdx = filePath.endsWith(".mdx");
  const isHtmlFile = filePath.endsWith(".html");
  const contentType =
    data.content_type === "html" || isHtmlFile ? "html" : "markdown";

  let contentHtml: string | undefined = undefined;
  let mdxSource: any = undefined;

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
    title: (data.title as string) || slug,
    excerpt: (data.excerpt as string) || undefined,
    date: data.date ? String(data.date) : undefined,
    section: normalizeSection(data.section ?? data.category),
    lesson: normalizeLesson(data.lesson),
    difficulty: normalizeDifficulty(data.difficulty),
    tags: normalizeTags(data.tags),
    contentType,
    contentHtml,
    mdxSource,
    readingTimeMinutes: calculateReadingTime(content),
  };
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  try {
    if (!fs.existsSync(tutorialsDir)) return [];
    const files = await fsPromises.readdir(tutorialsDir);
    const tutorialFiles = files.filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdx") || f.endsWith(".html"),
    );
    const items = await Promise.all(
      tutorialFiles.map((f) => readTutorialFile(path.join(tutorialsDir, f))),
    );
    return items.sort((a, b) => ((b.date || "") > (a.date || "") ? 1 : -1));
  } catch (err) {
    console.error("Error reading tutorials:", err);
    return [];
  }
}

export async function getAllTutorialSections(): Promise<string[]> {
  const tutorials = await getAllTutorials();
  return Array.from(
    new Set(tutorials.map((tutorial) => tutorial.section || "General")),
  ).sort((a, b) => a.localeCompare(b));
}

export async function getAllTutorialTags(): Promise<string[]> {
  const tutorials = await getAllTutorials();
  const allTags = tutorials.flatMap((tutorial) => tutorial.tags || []);
  return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
}

export async function getTutorialsBySection(
  section: string,
): Promise<Tutorial[]> {
  const tutorials = await getAllTutorials();
  const target = (section || "General").trim();
  return tutorials
    .filter((tutorial) => (tutorial.section || "General") === target)
    .sort((a, b) => (a.lesson || 999) - (b.lesson || 999));
}

export async function getNextLesson(
  section: string,
  currentLesson: number | undefined,
): Promise<Tutorial | undefined> {
  const tutorials = await getTutorialsBySection(section);
  if (currentLesson === undefined) {
    return tutorials[0];
  }
  return tutorials.find((t) => (t.lesson || 0) > (currentLesson || 0));
}

export async function getPreviousLesson(
  section: string,
  currentLesson: number | undefined,
): Promise<Tutorial | undefined> {
  const tutorials = await getTutorialsBySection(section);
  if (currentLesson === undefined) {
    return undefined;
  }
  const lessonsBefore = tutorials.filter(
    (t) => (t.lesson || 0) < (currentLesson || 0),
  );
  return lessonsBefore[lessonsBefore.length - 1];
}

export async function getTutorialBySlug(
  slug: string,
): Promise<Tutorial | undefined> {
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

export async function getAllTutorialSlugs(): Promise<{ slug: string }[]> {
  if (!fs.existsSync(tutorialsDir)) return [];
  const files = await fsPromises.readdir(tutorialsDir);
  return files
    .filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdx") || f.endsWith(".html"),
    )
    .map((f) => ({ slug: f.replace(/\.(md|mdx|html)$/, "") }));
}

export async function searchTutorials(query: string): Promise<Tutorial[]> {
  const tutorials = await getAllTutorials();
  if (!query || query.trim().length === 0) {
    return tutorials;
  }

  const searchQuery = query.toLowerCase().trim();
  return tutorials.filter((tutorial) => {
    const titleMatch = (tutorial.title || "")
      .toLowerCase()
      .includes(searchQuery);
    const excerptMatch = (tutorial.excerpt || "")
      .toLowerCase()
      .includes(searchQuery);
    const contentMatch = (tutorial.contentHtml || "")
      .toLowerCase()
      .includes(searchQuery);
    const tagsMatch = (tutorial.tags || []).some((tag) =>
      tag.toLowerCase().includes(searchQuery),
    );
    const sectionMatch = (tutorial.section || "")
      .toLowerCase()
      .includes(searchQuery);

    return (
      titleMatch || excerptMatch || contentMatch || tagsMatch || sectionMatch
    );
  });
}
