"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Locale,
  BrandSettings,
  NavigationItem,
  getDictionary,
} from "@/lib/portfolio";
import {
  LanguageSwitcherInner,
  LanguageSwitcherFallback,
} from "./LanguageSwitcher";
import { Menu, X, ArrowUpLeft, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  locale?: Locale;
  activePath?: "/" | "/work" | "/about" | "/contact" | string;
  currentSubPath?: string;
  brand?: BrandSettings;
  navigation?: NavigationItem[];
}

export default function Navbar({
  locale = "ar",
  activePath = "/",
  currentSubPath,
  brand,
  navigation,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  const fallbackPath =
    currentSubPath ?? (activePath === "/" ? "" : activePath);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Brand Resolution
  const siteName =
    locale === "ar"
      ? brand?.siteName || "خالد محمد عبد السميع"
      : brand?.siteNameEn || "Khaled Mohamed Abdel Samee";

  const siteTagline =
    locale === "ar"
      ? brand?.tagline || "فنان رقمي ومصمم بصري"
      : brand?.taglineEn || "Digital Artist & Visual Creator";

  const monogram =
    locale === "ar"
      ? brand?.monogramText || dict.nav.monogramSymbol
      : brand?.monogramTextEn || dict.nav.monogramSymbol;

  const activeLogoUrl = brand?.logoLightUrl || brand?.logoUrl;
  const showImageLogo =
    (brand?.logoType === "image" || brand?.logoType === "both") &&
    Boolean(activeLogoUrl);
  const showMonogram =
    brand?.logoType === "monogram" ||
    brand?.logoType === "both" ||
    !showImageLogo;

  // Navigation Items Resolution
  const navItems =
    navigation && navigation.length > 0
      ? navigation
          .filter((item) => item.visible !== false)
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            const rawHref = item.href.startsWith("/")
              ? item.href === "/"
                ? `/${locale}`
                : `/${locale}${item.href}`
              : item.href;
            const label =
              locale === "en" ? item.labelEn || item.label : item.label;
            return {
              key: item.href,
              href: rawHref,
              label,
              openInNewTab: item.openInNewTab,
            };
          })
      : [
          { key: "/", href: `/${locale}`, label: dict.nav.home, openInNewTab: false },
          { key: "/work", href: `/${locale}/work`, label: dict.nav.work, openInNewTab: false },
          { key: "/about", href: `/${locale}/about`, label: dict.nav.about, openInNewTab: false },
          { key: "/contact", href: `/${locale}/contact`, label: dict.nav.contact, openInNewTab: false },
        ];

  return (
    <>
      {/* Subtle Top Reading Bar */}
      <div
        className="reading-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-label={dict.nav.readingProgressAria}
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-colors duration-200 border-b ${
          scrolled || mobileMenuOpen
            ? "bg-[#0A0A0A]/95 backdrop-blur-md border-[#EAE6DF]/12 py-3.5"
            : "bg-[#0A0A0A]/85 backdrop-blur-sm border-[#EAE6DF]/8 py-4"
        }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 flex items-center justify-between gap-4">
          {/* Artist Wordmark / Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group focus:outline-none min-w-0"
          >
            {showImageLogo && activeLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeLogoUrl}
                alt={siteName}
                style={{ height: `${brand?.logoHeightDesktop || 34}px` }}
                className="w-auto object-contain shrink-0"
              />
            ) : null}

            {showMonogram && (
              <div className="w-9 h-9 rounded bg-[#202020] border border-[#EAE6DF]/15 flex items-center justify-center text-[#D7C9B2] font-serif-editorial font-bold text-base group-hover:bg-[#D7C9B2] group-hover:text-[#0A0A0A] transition-colors shrink-0">
                {brand?.monogramUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={brand.monogramUrl}
                    alt={monogram}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  monogram
                )}
              </div>
            )}

            <div className="leading-tight min-w-0">
              <span className="font-bold text-sm sm:text-base text-[#EAE6DF] tracking-tight block truncate group-hover:text-[#D7C9B2] transition-colors">
                {siteName}
              </span>
              <span className="text-[11px] text-[#777777] block truncate">
                {siteTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label={dict.nav.mainAria}
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {navItems.map((item) => {
              const isActive = activePath === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-2 rounded text-xs lg:text-sm transition-colors flex items-center ${
                    isActive
                      ? "bg-[#202020] text-[#D7C9B2] font-bold border border-[#D7C9B2]/35"
                      : "text-[#EAE6DF]/80 hover:text-[#EAE6DF] hover:bg-[#202020]/50 border border-transparent"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Suspense
              fallback={
                <LanguageSwitcherFallback
                  locale={locale}
                  fallbackPath={fallbackPath}
                />
              }
            >
              <LanguageSwitcherInner
                locale={locale}
                fallbackPath={fallbackPath}
              />
            </Suspense>

            <Link
              href={`/${locale}/contact`}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] transition-colors"
            >
              <span>{dict.nav.contactNow}</span>
              <ActionArrow className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded text-[#EAE6DF] hover:bg-[#202020] border border-[#EAE6DF]/15 transition-colors cursor-pointer"
              aria-label={
                mobileMenuOpen ? dict.nav.closeMenu : dict.nav.openMenu
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label={dict.nav.mobileAria}
            className="md:hidden border-t border-[#EAE6DF]/10 bg-[#0A0A0A]/98 px-4 py-6 space-y-4 shadow-2xl"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = activePath === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-4 py-3 rounded text-sm transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-[#202020] text-[#D7C9B2] font-bold border border-[#D7C9B2]/30"
                        : "text-[#EAE6DF] hover:bg-[#202020]/50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D7C9B2]" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#EAE6DF]/10 space-y-3">
              <Link
                href={`/${locale}/contact`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded bg-[#D7C9B2] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2"
              >
                <span>{dict.nav.startNewProject}</span>
                <ActionArrow className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
