import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  LOCALES,
  isValidLocale,
  getDirection,
  getDictionary,
  Locale,
} from "@/lib/portfolio";
import LocaleDocumentSync from "@/components/LocaleDocumentSync";

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const dict = getDictionary(locale);
  const data = getPortfolioData();

  const brand = data.brand;
  const artistName =
    locale === "ar"
      ? brand?.siteName || "خالد محمد عبد السميع"
      : brand?.siteNameEn || "Khaled Mohamed Abdel Samee";

  const siteTitle =
    locale === "ar"
      ? `${artistName} | ${brand?.tagline || dict.meta.siteTitle}`
      : `${artistName} | ${brand?.taglineEn || dict.meta.siteTitle}`;

  const homePage = data.pages?.home;
  const siteDesc =
    locale === "ar"
      ? homePage?.seoDescription || dict.meta.siteDescription
      : homePage?.seoDescriptionEn || dict.meta.siteDescription;

  const ogImg =
    data.siteSettings?.ogDefaultImage ||
    homePage?.ogImage ||
    "/images/Portraits, Manga, and Caricatures/Image 1.jpg";

  return {
    title: {
      default: siteTitle,
      template: `%s | ${artistName}`,
    },
    description: siteDesc,
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      images: [
        {
          url: ogImg,
          alt: artistName,
        },
      ],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { lang: rawLang } = await params;

  if (!isValidLocale(rawLang)) {
    notFound();
  }

  const locale: Locale = rawLang;
  const dir = getDirection(locale);

  return (
    <div
      lang={locale}
      dir={dir}
      className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden"
    >
      <LocaleDocumentSync locale={locale} dir={dir} />
      {children}
    </div>
  );
}

