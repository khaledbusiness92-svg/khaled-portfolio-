import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  isValidLocale,
  getDictionary,
  getLocalizedProfile,
  Locale,
} from "@/lib/portfolio";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectCard from "@/components/ProjectCard";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";

interface AboutPageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const dict = getDictionary(locale);

  const data = getPortfolioData();
  const aboutConfig = data.pages?.about;

  return {
    title:
      locale === "en"
        ? aboutConfig?.titleEn || dict.meta.aboutTitle
        : aboutConfig?.title || dict.meta.aboutTitle,
    description:
      locale === "en"
        ? aboutConfig?.seoDescriptionEn || dict.meta.aboutDescription
        : aboutConfig?.seoDescription || dict.meta.aboutDescription,
    alternates: {
      languages: {
        ar: "/ar/about",
        en: "/en/about",
      },
    },
  };
}

export const instant = false;

export default async function LocalizedAboutPage({ params }: AboutPageProps) {
  const { lang: rawLang } = await params;
  if (!isValidLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = getDictionary(locale);
  const DirectionalArrow = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  const data = getPortfolioData();
  const localizedProfile = getLocalizedProfile(data.profile, locale);
  const highlightedProjects = data.projects
    .filter((p) => p.featured && p.published !== false)
    .slice(0, 3);

  const aboutPage = data.pages?.about;
  const headerSection = aboutPage?.sections?.find(
    (s) => s.type === "page_header" || s.id === "about_header"
  );

  const kicker =
    locale === "en"
      ? headerSection?.eyebrowEn || dict.about.pageKicker
      : headerSection?.eyebrow || dict.about.pageKicker;

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden">
      <Navbar
        activePath="/about"
        locale={locale}
        brand={data.brand}
        navigation={data.navigation}
      />

      <PageHeader
        kicker={kicker}
        title={localizedProfile.name}
        titleAccent={localizedProfile.roleSubtitle}
        description={localizedProfile.title}
        metaLabel={dict.contactPage.locationLabel}
        metaText={localizedProfile.location}
      />

      {/* Verified Artist Profile & Disciplines */}
      <AboutSection
        profile={data.profile}
        showLinkToAboutPage={false}
        locale={locale}
      />

      {/* Verified Design Software, Creative Skills & Professional Experience */}
      <SkillsSection skills={data.skills} locale={locale} />

      {/* Selected Works Highlight */}
      {highlightedProjects.length > 0 && (
        <section className="w-full py-20 sm:py-24 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-10 border-b border-[#EAE6DF]/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#D7C9B2] block mb-2">
                  {dict.about.selectedHeadingEyebrow}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-[#EAE6DF]">
                  {dict.about.selectedHeadingTitle}
                </h2>
              </div>

              <Link
                href={`/${locale}/work`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-[#EAE6DF]/15 bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs sm:text-sm font-medium transition-colors"
              >
                <span>
                  {dict.about.browseFullArchive(data.projects.length)}
                </span>
                <DirectionalArrow className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlightedProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  categories={data.categories}
                  index={idx}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
