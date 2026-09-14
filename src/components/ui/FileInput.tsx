"use client";

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";

/**
 * File input with a client-side-only preview (thumbnail for images, icon +
 * filename for everything else) so the user can confirm what they picked
 * before it's uploaded.
 */
export function FileInput({
  name,
  accept,
  capture,
  disabled,
  onChange,
  className = "",
  inputClassName = "text-xs text-ink-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand file:text-white disabled:opacity-50 disabled:cursor-not-allowed",
}: {
  name?: string;
  accept?: string;
  capture?: "user" | "environment";
  disabled?: boolean;
  onChange?: (file: File | null) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    onChange?.(selected);
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        capture={capture}
        disabled={disabled}
        onChange={handleChange}
        className={inputClassName}
      />
      {file && (
        <div className="flex items-center gap-2 p-1.5 pr-3 rounded border border-hairline-strong bg-paper-raised w-fit max-w-full">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-9 h-9 object-cover rounded border border-hairline shrink-0"
            />
          ) : (
            <span className="w-9 h-9 flex items-center justify-center rounded bg-brand-tint shrink-0">
              <FileText className="w-4.5 h-4.5 text-brand" />
            </span>
          )}
          <span className="text-xs text-ink font-medium truncate">{file.name}</span>
        </div>
      )}
    </div>
  );
}
