"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PWASplitDetector() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in installed PWA standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
