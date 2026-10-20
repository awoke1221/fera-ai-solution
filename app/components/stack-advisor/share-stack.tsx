"use client";

import { useState, useCallback } from "react";

// ─── Encode/decode selections to/from URL ──────────────
export function encodeSelections(selections: Record<string, string>): string {
  try {
    const json = JSON.stringify(selections);
    // Use btoa with UTF-8 encoding
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch {
    return "";
  }
}

export function decodeSelections(
  encoded: string,
): Record<string, string> | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Object.values(parsed).every((value) => typeof value === "string")
    ) {
      return parsed as Record<string, string>;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(
  selections: Record<string, string>,
  projectId?: string | null,
): string {
  const encoded = encodeSelections(selections);
  if (!encoded) return window.location.href;
  const url = new URL(window.location.href);
  url.searchParams.set("stack", encoded);
  if (projectId) {
    url.searchParams.set("project", projectId);
  } else {
    url.searchParams.delete("project");
  }
  return url.toString();
}

export function getSelectionsFromUrl(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const stackParam = params.get("stack");
  if (!stackParam) return null;
  return decodeSelections(stackParam);
}

// ─── Share Button Component ────────────────────────────
interface ShareStackProps {
  selections: Record<string, string>;
  projectId?: string | null;
}

export function ShareStack({ selections, projectId }: ShareStackProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const hasSelections = Object.keys(selections).length > 0;

  const handleShare = useCallback(() => {
    const url = buildShareUrl(selections, projectId);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => setCopied(false), 300);
        }, 2500);
      })
      .catch(() => {
        // Fallback: create a dummy input to copy
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => setCopied(false), 300);
        }, 2500);
      });
  }, [projectId, selections]);

  if (!hasSelections) return null;

  return (
    <>
      <button
        className="share-stack-btn"
        onClick={handleShare}
        title="Copy shareable link"
      >
        {copied ? "Link Copied!" : "Share Stack"}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="share-toast">
          <span className="share-toast-icon">Link copied!</span>
          <span className="share-toast-text">
            Share this link with your team to load this stack configuration.
          </span>
        </div>
      )}
    </>
  );
}
