"use client";

import { useEffect } from "react";
import { Locale } from "@/lib/portfolio";

interface LocaleDocumentSyncProps {
  locale: Locale;
  dir: "rtl" | "ltr";
}

export default function LocaleDocumentSync({
  locale,
  dir,
}: LocaleDocumentSyncProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  return null;
}

