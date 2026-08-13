import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { serialize } from "next-mdx-remote/serialize";

export type Tutorial = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  contentHtml?: string;
  mdxSource?: any;
};

const tutorialsDir = path.join(process.cwd(), "content", "tutorials");

async function readTutorialFile(filePath: string): Promise<Tutorial> {
  const raw = await fsPromises.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const isMdx = filePath.endsWith(".mdx");
  let contentHtml: string | undefined = undefined;
  let mdxSource: any = undefined;
  if (isMdx) {
    mdxSource = await serialize(content, {
      mdxOptions: { remarkPlugins: [], rehypePlugins: [] },
    });
  } else {
    const processed = await remark().use(html).process(content);
    contentHtml = processed.toString();
  }
  const slug = path.basename(filePath).replace(/\.mdx?$/, "");
  try {
    // debug: log frontmatter types when running dev
    // eslint-disable-next-line no-console
    console.log(
      "readTutorialFile:",
      slug,
      "frontmatter date type=",
      typeof data.date,
      "value=",
      data.date,
    );
  } catch (e) {}
  return {
    slug,
    title: (data.title as string) || slug,
    excerpt: (data.excerpt as string) || undefined,
    date: data.date ? String(data.date) : undefined,
    contentHtml,
    mdxSource,
  };
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  try {
    if (!fs.existsSync(tutorialsDir)) return [];
    const files = await fsPromises.readdir(tutorialsDir);
    const mdFiles = files.filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdx"),
    );
    const items = await Promise.all(
      mdFiles.map((f) => readTutorialFile(path.join(tutorialsDir, f))),
    );
    return items.sort((a, b) => ((b.date || "") > (a.date || "") ? 1 : -1));
  } catch (err) {
    console.error("Error reading tutorials:", err);
    return [];
  }
}

export async function getTutorialBySlug(
  slug: string,
): Promise<Tutorial | undefined> {
  const tryPaths = [
    path.join(tutorialsDir, `${slug}.md`),
    path.join(tutorialsDir, `${slug}.mdx`),
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
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => ({ slug: f.replace(/\.mdx?$/, "") }));
}
