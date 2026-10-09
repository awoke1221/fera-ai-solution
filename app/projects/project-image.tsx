"use client";

import { useState } from "react";
import styles from "./project-image.module.css";

type ProjectImageProps = {
  src: string;
  alt: string;
  title: string;
  className?: string;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
};

export function ProjectImage({
  src,
  alt,
  title,
  className,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
}: ProjectImageProps) {
  const [failed, setFailed] = useState(false);
  const fallbackClassName = [styles.fallback, className]
    .filter(Boolean)
    .join(" ");
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  if (failed) {
    return (
      <div className={fallbackClassName} role="img" aria-label={alt}>
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
        <strong>{title}</strong>
        <span className={styles.caption}>Project preview</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}
