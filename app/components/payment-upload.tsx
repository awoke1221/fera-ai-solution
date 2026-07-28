// ─── Payment Screenshot Upload Component ─────────────
"use client";

import { useState, useRef } from "react";

type PaymentUploadProps = {
  onUploadComplete: (url: string) => void;
};

export function PaymentUpload({ onUploadComplete }: PaymentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
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

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
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

      onUploadComplete(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileSelect({
        target: { files: dt.files },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div
      className="payment-upload-zone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
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
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
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
