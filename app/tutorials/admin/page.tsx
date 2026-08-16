"use client";
import React, { useState, useEffect, useRef } from "react";
import { SiteShell } from "@/app/components/site-shell";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [section, setSection] = useState("General");
  const [tags, setTags] = useState("");
  const [contentType, setContentType] = useState<"markdown" | "html">(
    "markdown",
  );
  const [lesson, setLesson] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [autoPreview, setAutoPreview] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const previewTimer = useRef<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const htmlTemplates = [
    {
      label: "Hero",
      snippet: `
<section class="blog-hero">
  <div class="wrap">
    <p class="eyebrow">Featured</p>
    <h1>Write a strong intro headline</h1>
    <p class="lead">Explain the value of this article in a few clear lines.</p>
  </div>
</section>
`,
    },
    {
      label: "Two-column",
      snippet: `
<section class="blog-split">
  <div class="wrap grid-2">
    <div>
      <h2>Left column</h2>
      <p>Add your main explanation here.</p>
    </div>
    <div>
      <h2>Right column</h2>
      <p>Add supporting details, examples, or a callout.</p>
    </div>
  </div>
</section>
`,
    },
    {
      label: "Callout",
      snippet: `
<blockquote class="blog-callout">
  <p>Use this to highlight a key insight, quote, or takeaway.</p>
</blockquote>
`,
    },
    {
      label: "CTA",
      snippet: `
<section class="blog-cta">
  <div class="wrap">
    <h2>Ready to build this next?</h2>
    <p>Invite readers to take the next step.</p>
    <a href="/contact" class="btn solid">Get in touch</a>
  </div>
</section>
`,
    },
  ];

  useEffect(() => {
    // no-op; admin check below
  }, []);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const profile = d.profile || null;
        setIsAdmin(!!(profile && profile.is_admin));
      })
      .catch(() => {
        if (!mounted) return;
        setIsAdmin(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshPosts() {
    const res = await fetch("/api/tutorials/create", { method: "GET" });
    if (!res.ok) return;
    const data = await res.json();
    setPosts(data.posts || []);
  }

  useEffect(() => {
    if (isAdmin) {
      refreshPosts();
    }
  }, [isAdmin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const method = editingSlug ? "PUT" : "POST";
    const res = await fetch("/api/tutorials/create", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        excerpt,
        section,
        lesson: lesson ? parseInt(lesson, 10) : undefined,
        difficulty,
        tags,
        contentType,
        content,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const actionText = editingSlug ? "Updated" : "Created";
      setMessage(actionText + ": " + data.path);
      setSlug("");
      setTitle("");
      setExcerpt("");
      setSection("General");
      setLesson("");
      setDifficulty("beginner");
      setTags("");
      setContentType("markdown");
      setContent("");
      setEditingSlug(null);
      await refreshPosts();
    } else {
      setMessage("Error: " + (data.error || "unknown"));
    }
  }
  function insertHtmlSnippet(snippet: string) {
    const textarea = editorRef.current;
    if (!textarea) {
      setContent((previous) => `${previous}\n${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
    setContent(nextContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + snippet.length;
      textarea.selectionStart = cursorPosition;
      textarea.selectionEnd = cursorPosition;
    });
  }

  async function handlePreview() {
    setPreviewHtml(null);
    const res = await fetch("/api/tutorials/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, contentType }),
    });
    const data = await res.json();
    if (res.ok) setPreviewHtml(data.html);
    else setPreviewHtml(`<pre>${JSON.stringify(data)}</pre>`);
  }

  useEffect(() => {
    if (!autoPreview) return;
    if (previewTimer.current) {
      window.clearTimeout(previewTimer.current);
    }
    previewTimer.current = window.setTimeout(() => {
      if (content && content.length > 0) handlePreview();
    }, 700);
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, autoPreview]);

  async function handleDelete(slug: string) {
    const confirmed = window.confirm(`Delete "${slug}"?`);
    if (!confirmed) return;

    const res = await fetch("/api/tutorials/create", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage("Deleted: " + slug);
      if (editingSlug === slug) {
        setEditingSlug(null);
        setSlug("");
        setTitle("");
        setExcerpt("");
        setSection("General");
        setLesson("");
        setDifficulty("beginner");
        setTags("");
        setContentType("markdown");
        setContent("");
      }
      await refreshPosts();
    } else {
      setMessage("Error: " + (data.error || "unknown"));
    }
  }

  function handleEdit(post: any) {
    setEditingSlug(post.slug);
    setSlug(post.slug);
    setTitle(post.title || "");
    setExcerpt(post.excerpt || "");
    setSection(post.section || "General");
    setLesson(post.lesson?.toString() || "");
    setDifficulty(post.difficulty || "beginner");
    setTags((post.tags || []).join(", "));
    setContentType(post.contentType || "markdown");
    setContent(post.content || "");
    setMessage("Editing: " + post.slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <SiteShell>
      <main id="tutorials-admin" className={styles.container}>
        <style>{`
        #tutorials-admin { max-width: 820px; margin: 120px auto 48px; padding: 32px; background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94)); border-radius: 24px; border: 1px solid rgba(148,163,184,0.2); box-shadow: 0 20px 40px rgba(15,23,42,0.06); }
        #tutorials-admin h1 { margin: 0 0 6px 0 }
        #tutorials-admin p { margin: 0 0 12px 0; color: var(--text-secondary) }
        #tutorials-admin input, #tutorials-admin textarea { width: 100%; padding: 12px 14px; border-radius: 12px; border:1px solid rgba(148,163,184,0.2); background: rgba(255,255,255,0.75); color: var(--text); }
        #tutorials-admin label { display:block; margin-bottom:6px; color: var(--text); font-weight:600 }
        #tutorials-admin .actions { display:flex; gap:12px; margin-top:8px; flex-wrap: wrap; }
        #tutorials-admin .preview { padding:14px; border-radius:10px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03) }
        @media (max-width: 640px) { #tutorials-admin { margin-top: 100px; padding: 20px 16px; } }
      `}</style>
        <div className={styles.header}>
          <h1>Tutorials Admin</h1>
          <p>
            Create a new blog post or tutorial and place it in the right
            section.
          </p>
        </div>
        {isAdmin === false && (
          <div>
            <p>You must be signed in as an admin to create tutorials.</p>
            <p>
              <a href="/auth/login">Sign in</a>
            </p>
          </div>
        )}

        {isAdmin !== false && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <label className={styles.label}>Slug (url-friendly)</label>
              <input
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Excerpt</label>
              <input
                className={styles.input}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Section</label>
              <input
                className={styles.input}
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="General, Product, Growth, Engineering, AI"
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Lesson number (optional)</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="1, 2, 3, ..."
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Difficulty level</label>
              <select
                className={styles.input}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Tags</label>
              <input
                className={styles.input}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ai, product, growth"
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label}>Content type</label>
              <select
                className={styles.input}
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as "markdown" | "html")
                }
              >
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div className={styles.rowInline}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoPreview}
                  onChange={(e) => setAutoPreview(e.target.checked)}
                />{" "}
                Auto preview
              </label>
            </div>
            <div className={styles.row}>
              <label className={styles.label}>
                Content ({contentType === "html" ? "HTML" : "Markdown"})
              </label>

              {contentType === "html" && (
                <div className={styles.htmlToolbar}>
                  {htmlTemplates.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      className={styles.templateButton}
                      onClick={() => insertHtmlSnippet(template.snippet)}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.editorPane}>
                <textarea
                  ref={editorRef}
                  className={styles.textarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={contentType === "html" ? 20 : 14}
                  placeholder={
                    contentType === "html"
                      ? "<section>\n  <h2>My blog post</h2>\n  <p>Paste HTML here.</p>\n</section>"
                      : "# Blog title\n\nWrite markdown here with headings, lists, code blocks, links, etc."
                  }
                />
                {contentType === "html" && (
                  <div className={styles.previewPane}>
                    <div className={styles.previewHeader}>
                      Live layout preview
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          previewHtml ||
                          content ||
                          "<p>Add content to preview the layout.</p>",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.actions}>
              <button className="btn solid" type="submit">
                {editingSlug ? "Update" : "Create"}
              </button>
              {editingSlug && (
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setEditingSlug(null);
                    setSlug("");
                    setTitle("");
                    setExcerpt("");
                    setSection("General");
                    setLesson("");
                    setDifficulty("beginner");
                    setTags("");
                    setContentType("markdown");
                    setContent("");
                    setMessage("Edit cancelled");
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button className="btn" type="button" onClick={handlePreview}>
                Preview
              </button>
            </div>
          </form>
        )}

        {isAdmin !== false && (
          <section style={{ marginTop: 32 }}>
            <h3>All blog posts</h3>
            {posts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {posts.map((post) => (
                  <div
                    key={post.slug}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(148,163,184,0.18)",
                      borderRadius: 12,
                    }}
                  >
                    <div>
                      <strong>{post.title}</strong>
                      <div
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {post.section || "General"} • {post.slug}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleEdit(post)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleDelete(post.slug)}
                        style={{ borderColor: "rgba(239,68,68,0.4)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {message && <p>{message}</p>}
        {previewHtml && (
          <section style={{ marginTop: 16 }}>
            <h3>Preview</h3>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </section>
        )}
      </main>
    </SiteShell>
  );
}
