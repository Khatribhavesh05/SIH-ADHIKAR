"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
          },
          containerId: string
        ) => void;
      };
    };
  }
}

export function GoogleTranslateWidget() {
  const [currentLang, setCurrentLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Check initial cookie
    const cookies = document.cookie.split(";");
    const googCookie = cookies.find((c) => c.trim().startsWith("googtrans="));
    if (googCookie && googCookie.includes("/hi")) {
      setCurrentLang("hi");
    }

    // Define callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Append script if not already added
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "hi" : "en";
    setCurrentLang(nextLang);

    // Set cookie for google translate
    const domain = window.location.hostname;
    const cookieValue = nextLang === "hi" ? "/en/hi" : "/en/en";
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;

    // Trigger select change if element exists
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectEl) {
      selectEl.value = nextLang;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="inline-flex items-center">
      {/* Hidden google translate container */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />

      {/* Styled EN | हिं Toggle Button */}
      <button
        onClick={toggleLanguage}
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-hairline-strong bg-paper-raised text-ink hover:bg-brand-tint hover:border-brand transition-colors cursor-pointer"
        title={currentLang === "en" ? "Switch to Hindi / हिंदी में देखें" : "Switch to English"}
      >
        <Languages className="w-3.5 h-3.5 text-saffron" />
        <span className={currentLang === "en" ? "font-semibold text-brand" : "text-ink-muted"}>EN</span>
        <span className="text-hairline-strong">|</span>
        <span className={currentLang === "hi" ? "font-semibold text-saffron" : "text-ink-muted"}>हिं</span>
      </button>
    </div>
  );
}
