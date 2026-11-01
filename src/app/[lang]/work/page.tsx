import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  isValidLocale,
  getDictionary,
  Locale,
} from "@/lib/portfolio";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import PortfolioGallery from "@/components/PortfolioGallery";
import WorkArchiveClient from "@/components/WorkArchiveClient";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

interface WorkPageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const dict = getDictionary(locale);

  const data = getPortfolioData();
  const workConfig = data.pages?.work;

  const pageTitle =
    locale === "en"
      ? workConfig?.titleEn || dict.meta.workTitle
      : workConfig?.title || dict.meta.workTitle;

  const pageDesc =
    locale === "en"
      ? workConfig?.seoDescriptionEn || dict.meta.workDescription
      : workConfig?.seoDescription || dict.meta.workDescription;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      languages: {
        ar: "/ar/work",
        en: "/en/work",
      },
    },
  };
}

export const instant = false;

export default async function LocalizedWorkPage({ params }: WorkPageProps) {
  const { lang: rawLang } = await params;
  if (!isValidLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = getDictionary(locale);

  const data = getPortfolioData();
  const categoryCount = data.categories.filter((c) => c.id !== "all").length;

  const workPage = data.pages?.work;
  const headerSection = workPage?.sections?.find(
    (s) => s.type === "page_header" || s.id === "work_header"
  );

  const kicker =
    locale === "en"
      ? headerSection?.eyebrowEn || dict.workPage.kicker
      : headerSection?.eyebrow || dict.workPage.kicker;

  const title =
    locale === "en"
      ? headerSection?.titleEn || dict.workPage.title
      : headerSection?.title || dict.workPage.title;

  const titleAccent =
    locale === "en"
      ? headerSection?.titleAccentEn || dict.workPage.titleAccent
      : headerSection?.titleAccent || dict.workPage.titleAccent;

  const description =
    locale === "en"
      ? headerSection?.descriptionEn || dict.workPage.description
      : headerSection?.description || dict.workPage.description;

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden">
      <Navbar
        activePath="/work"
        locale={locale}
        brand={data.brand}
        navigation={data.navigation}
      />

      <PageHeader
        kicker={kicker}
        title={title}
        titleAccent={titleAccent}
        description={description}
        metaLabel={dict.workPage.archiveStatusLabel}
        metaText={dict.workPage.metaSummary(
          data.projects.filter((p) => p.published !== false).length,
          categoryCount
        )}
      />

      <Suspense
        fallback={
          <PortfolioGallery
            initialProjects={data.projects}
            categories={data.categories}
            mode="full"
            locale={locale}
          />
        }
      >
        <WorkArchiveClient
          initialProjects={data.projects}
          categories={data.categories}
          locale={locale}
        />
      </Suspense>

      <ContactCTA contact={data.profile.contact} locale={locale} />
      <Footer
        contact={data.profile.contact}
        locale={locale}
        brand={data.brand}
        footer={data.footer}
      />
    </main>
  );
}
