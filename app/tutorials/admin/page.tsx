"use client";
import React, { useState, useEffect, useRef } from "react";
import { SiteShell } from "@/app/components/site-shell";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [autoPreview, setAutoPreview] = useState(true);
  const previewTimer = useRef<number | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/tutorials/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, excerpt, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Created: " + data.path);
      setSlug("");
      setTitle("");
      setExcerpt("");
      setContent("");
    } else {
      setMessage("Error: " + (data.error || "unknown"));
    }
  }
  async function handlePreview() {
    setPreviewHtml(null);
    const res = await fetch("/api/tutorials/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
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

  function saveSecret() {}

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
          <p>Create a new tutorial (markdown content).</p>
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
              <label className={styles.label}>Content (markdown)</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
              />
            </div>
            <div className={styles.actions}>
              <button className="btn solid" type="submit">
                Create
              </button>
              <button className="btn" type="button" onClick={handlePreview}>
                Preview
              </button>
            </div>
          </form>
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
