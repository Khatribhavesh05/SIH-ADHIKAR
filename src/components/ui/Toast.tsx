"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastState = { kind: "success" | "error"; message: string } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((kind: "success" | "error", message: string) => {
    setToast({ kind, message });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  return { toast, showToast };
}

export function ToastBanner({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium animate-in fade-in ${
        toast.kind === "success"
          ? "border-success/30 bg-success-tint text-success"
          : "border-danger/30 bg-danger-tint text-danger"
      }`}
    >
      {toast.kind === "success" ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
