// ─── Payment Screenshot Upload Component ─────────────
"use client";

import { useEffect, useRef, useState } from "react";

type PaymentUploadProps = {
  onUploadComplete: (url: string) => void;
  value?: string | null;
};

export function PaymentUpload({ onUploadComplete, value }: PaymentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const uploadFile = async (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PNG, JPEG, and WebP images are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreview(data.url);
      onUploadComplete(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
      onUploadComplete("");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const resetInput = () => {
    setPreview(null);
    setError(null);
    onUploadComplete("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`payment-upload-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {uploading ? (
        <div className="upload-status">
          <div className="upload-spinner" />
          <p>Uploading screenshot...</p>
        </div>
      ) : preview ? (
        <div className="upload-preview">
          <img src={preview} alt="Payment screenshot preview" />
          <button
            type="button"
            className="btn upload-retry"
            onClick={(e) => {
              e.stopPropagation();
              resetInput();
            }}
          >
            Change file
          </button>
        </div>
      ) : (
        <div className="upload-placeholder">
          <span className="upload-icon">📸</span>
          <p>
            <strong>Click to upload</strong> or drag & drop
          </p>
          <p className="upload-hint">
            Payment screenshot (PNG, JPEG, WebP — max 10MB)
          </p>
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
