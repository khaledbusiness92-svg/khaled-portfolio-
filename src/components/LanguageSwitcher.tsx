"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, getDictionary } from "@/lib/portfolio";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  locale: Locale;
  fallbackPath?: string;
  onSwitch?: () => void;
}

export function LanguageSwitcherInner({
  locale,
  fallbackPath = "",
  onSwitch,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dict = getDictionary(locale);

  const buildLocaleHref = (targetLocale: Locale) => {
    let basePath = pathname || `/${locale}${fallbackPath}`;
    if (basePath === "/ar" || basePath === "/en") {
      basePath = `/${targetLocale}`;
    } else if (basePath.startsWith("/ar/")) {
      basePath = `/${targetLocale}/${basePath.slice(4)}`;
    } else if (basePath.startsWith("/en/")) {
      basePath = `/${targetLocale}/${basePath.slice(4)}`;
    } else {
      basePath = `/${targetLocale}${basePath.startsWith("/") ? basePath : `/${basePath}`}`;
    }

    const query = searchParams.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div
      role="group"
      aria-label={dict.nav.languageSwitcherAria}
      className="inline-flex items-center rounded border border-[#EAE6DF]/15 bg-[#141414] p-0.5"
    >
      <span className="ps-2 pe-1 text-[#D7C9B2] hidden sm:inline-flex items-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </span>
      <Link
        href={buildLocaleHref("ar")}
        onClick={onSwitch}
        hrefLang="ar"
        aria-current={locale === "ar" ? "true" : undefined}
        className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
          locale === "ar"
            ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
            : "text-[#EAE6DF]/80 hover:text-[#EAE6DF]"
        }`}
      >
        {dict.nav.switchToArabic}
      </Link>
      <Link
        href={buildLocaleHref("en")}
        onClick={onSwitch}
        hrefLang="en"
        aria-current={locale === "en" ? "true" : undefined}
        className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
          locale === "en"
            ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
            : "text-[#EAE6DF]/80 hover:text-[#EAE6DF]"
        }`}
      >
        {dict.nav.switchToEnglish}
      </Link>
    </div>
  );
}

export function LanguageSwitcherFallback({
  locale,
  fallbackPath = "",
}: LanguageSwitcherProps) {
  const dict = getDictionary(locale);
  const cleanSuffix =
    fallbackPath === "/" || !fallbackPath ? "" : fallbackPath;

  return (
    <div
      role="group"
      aria-label={dict.nav.languageSwitcherAria}
      className="inline-flex items-center rounded border border-[#EAE6DF]/15 bg-[#141414] p-0.5"
    >
      <span className="ps-2 pe-1 text-[#D7C9B2] hidden sm:inline-flex items-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </span>
      <Link
        href={`/ar${cleanSuffix}`}
        hrefLang="ar"
        aria-current={locale === "ar" ? "true" : undefined}
        className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
          locale === "ar"
            ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
            : "text-[#EAE6DF]/80 hover:text-[#EAE6DF]"
        }`}
      >
        {dict.nav.switchToArabic}
      </Link>
      <Link
        href={`/en${cleanSuffix}`}
        hrefLang="en"
        aria-current={locale === "en" ? "true" : undefined}
        className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
          locale === "en"
            ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
            : "text-[#EAE6DF]/80 hover:text-[#EAE6DF]"
        }`}
      >
        {dict.nav.switchToEnglish}
      </Link>
    </div>
  );
}

