"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWARegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // non-fatal — app still works without the service worker
      });
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 border border-hairline-strong bg-paper-raised rounded-[var(--radius-md)] shadow-lg px-4 py-3 flex items-center gap-3">
      <span className="text-sm">Install Adhikar for quick, full-screen access.</span>
      <Button
        className="text-xs"
        onClick={async () => {
          await installEvent.prompt();
          setInstallEvent(null);
        }}
      >
        Install App
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="text-ink-muted text-sm hover:text-ink"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
