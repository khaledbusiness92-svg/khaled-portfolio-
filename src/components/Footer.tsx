"use client";

import Link from "next/link";
import {
  ContactInfo,
  Locale,
  BrandSettings,
  FooterSettings,
  getDictionary,
} from "@/lib/portfolio";
import { ArrowUp, Lock } from "lucide-react";

interface FooterProps {
  contact?: ContactInfo;
  locale?: Locale;
  brand?: BrandSettings;
  footer?: FooterSettings;
}

const DEFAULT_CONTACT: ContactInfo = {
  whatsapp: "+201012345678",
  email: "khaled.abdelsamie.design@gmail.com",
  behance: "https://www.behance.net",
  instagram: "https://www.instagram.com",
  location: "مصر — متاح للعمل الحر والتعاون عن بُعد",
  locationEn: "Egypt — Available for Freelance & Remote Collaboration",
};

export default function Footer({
  contact = DEFAULT_CONTACT,
  locale = "ar",
  brand,
  footer,
}: FooterProps) {
  const dict = getDictionary(locale);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cleanPhone = contact.whatsapp.replace(/[^0-9]/g, "");

  const artistName =
    locale === "ar"
      ? brand?.siteName || "خالد محمد عبد السميع"
      : brand?.siteNameEn || "Khaled Mohamed Abdel Samee";

  const artistSubtitle =
    locale === "ar"
      ? brand?.tagline || dict.footer.artistSubtitle
      : brand?.taglineEn || dict.footer.artistSubtitle;

  const monogram =
    locale === "ar"
      ? brand?.monogramText || dict.nav.monogramSymbol
      : brand?.monogramTextEn || dict.nav.monogramSymbol;

  const bioSummary =
    locale === "en"
      ? footer?.bioSummaryEn || dict.footer.bioSummary
      : footer?.bioSummary || dict.footer.bioSummary;

  const copyright =
    locale === "en"
      ? footer?.copyrightTextEn || dict.footer.copyright
      : footer?.copyrightText || dict.footer.copyright;

  const showSitemap = footer?.showSitemap !== false;
  const showChannels = footer?.showContactChannels !== false;

  const sitemapLinks =
    footer?.links && footer.links.length > 0
      ? footer.links
          .filter((l) => l.visible !== false)
          .sort((a, b) => a.order - b.order)
          .map((l) => ({
            href: l.href.startsWith("/")
              ? l.href === "/"
                ? `/${locale}`
                : `/${locale}${l.href}`
              : l.href,
            label: locale === "en" ? l.labelEn || l.label : l.label,
          }))
      : [
          { href: `/${locale}`, label: dict.footer.homeLink },
          { href: `/${locale}/work`, label: dict.footer.workLink },
          { href: `/${locale}/about`, label: dict.footer.aboutLink },
          { href: `/${locale}/contact`, label: dict.footer.contactLink },
        ];

  return (
    <footer className="w-full border-t border-[#EAE6DF]/10 bg-[#0A0A0A] text-[#777777]">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#EAE6DF]/10">
          {/* Column 1: Artist Wordmark & Bio Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#202020] border border-[#EAE6DF]/15 flex items-center justify-center text-[#D7C9B2] font-serif-editorial font-bold text-sm shrink-0">
                {brand?.monogramUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={brand.monogramUrl}
                    alt={monogram}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  monogram
                )}
              </div>
              <div>
                <p className="text-[#EAE6DF] font-bold text-base">
                  {artistName}
                </p>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777]">
                  {artistSubtitle}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed max-w-md">
              {bioSummary}
            </p>
          </div>

          {/* Column 2: Sitemap Navigation */}
          {showSitemap && (
            <div className="md:col-span-3 space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#D7C9B2] font-medium">
                {dict.footer.sectionsHeading}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                {sitemapLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-[#EAE6DF]/80 hover:text-[#D7C9B2] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3: Direct Contact & Social Links */}
          {showChannels && (
            <div className="md:col-span-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#D7C9B2] font-medium">
                {dict.footer.channelsHeading}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#EAE6DF]/80 hover:text-[#D7C9B2] transition-colors"
                  >
                    {dict.footer.whatsappPrefix}{" "}
                    <span className="font-mono" dir="ltr">
                      {contact.whatsapp}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-[#EAE6DF]/80 hover:text-[#D7C9B2] transition-colors break-all font-mono"
                    dir="ltr"
                  >
                    {contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-4 pt-1">
                  {contact.behance && (
                    <a
                      href={contact.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono uppercase text-[#D7C9B2] hover:underline"
                    >
                      {dict.footer.behanceLink}
                    </a>
                  )}
                  {contact.instagram && (
                    <a
                      href={contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono uppercase text-[#D7C9B2] hover:underline"
                    >
                      {dict.footer.instagramLink}
                    </a>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[#777777]">{copyright}</p>
            <Link
              href="/admin"
              className="text-[#777777] hover:text-[#D7C9B2] transition-colors inline-flex items-center gap-1.5 opacity-60 hover:opacity-100 text-[11px]"
              title={locale === "ar" ? "لوحة التحكم" : "Admin CMS"}
            >
              <Lock className="w-3 h-3 text-[#D7C9B2]" />
              <span>{locale === "ar" ? "لوحة الإدارة" : "CMS Login"}</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded border border-[#EAE6DF]/10 bg-[#141414] text-[#EAE6DF] hover:border-[#D7C9B2] hover:text-[#D7C9B2] transition-colors cursor-pointer"
              aria-label={dict.footer.scrollToTopAria}
              title={dict.footer.scrollToTopAria}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
