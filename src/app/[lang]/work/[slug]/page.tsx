import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  LOCALES,
  Locale,
  isValidLocale,
  getDictionary,
  getProjectSlug,
  getLocalizedCategoryName,
  getLocalizedProjectTitle,
  getLocalizedProjectDescription,
  getLocalizedToolName,
} from "@/lib/portfolio";
import Navbar from "@/components/Navbar";
import ProjectMedia from "@/components/ProjectMedia";
import ProjectCard from "@/components/ProjectCard";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Wrench,
  Layers,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const data = getPortfolioData();
  const paramsList: { lang: Locale; slug: string }[] = [];

  for (const lang of LOCALES) {
    for (const project of data.projects) {
      paramsList.push({
        lang,
        slug: getProjectSlug(project),
      });
    }
  }

  // Next.js 16 requires at least one param object for static parameter validation
  if (paramsList.length === 0) {
    return [
      { lang: "ar", slug: "placeholder" },
      { lang: "en", slug: "placeholder" },
    ];
  }

  return paramsList;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const dict = getDictionary(locale);

  const decodedSlug = decodeURIComponent(slug);
  const data = getPortfolioData();
  const project = data.projects.find(
    (p) => getProjectSlug(p) === decodedSlug || p.id === decodedSlug
  );

  if (!project) {
    return {
      title: dict.meta.projectNotFoundTitle,
    };
  }

  const projectTitle = getLocalizedProjectTitle(project, locale);
  const projectDesc =
    getLocalizedProjectDescription(project, locale) || projectTitle;
  const artistName =
    locale === "ar" ? "خالد محمد عبد السميع" : "Khaled Mohamed Abdel Samee";

  return {
    title: projectTitle,
    description: projectDesc,
    alternates: {
      languages: {
        ar: `/ar/work/${getProjectSlug(project)}`,
        en: `/en/work/${getProjectSlug(project)}`,
      },
    },
    openGraph: {
      title: `${projectTitle} | ${artistName}`,
      description: projectDesc,
      images: project.image ? [{ url: project.image, alt: projectTitle }] : [],
    },
  };
}

async function ProjectDetailContent({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isValidLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = getDictionary(locale);

  const decodedSlug = decodeURIComponent(slug);
  const data = getPortfolioData();
  const projects = data.projects;

  const currentIndex = projects.findIndex(
    (p) => getProjectSlug(p) === decodedSlug || p.id === decodedSlug
  );

  if (currentIndex === -1) {
    notFound();
  }

  const project = projects[currentIndex];
  const prevProject =
    currentIndex > 0
      ? projects[currentIndex - 1]
      : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  const categoryName = getLocalizedCategoryName(
    project.category,
    locale,
    data.categories
  );
  const projectTitle = getLocalizedProjectTitle(project, locale);
  const projectDesc = getLocalizedProjectDescription(project, locale);

  const prevTitle = getLocalizedProjectTitle(prevProject, locale);
  const nextTitle = getLocalizedProjectTitle(nextProject, locale);

  const relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  const cleanPhone = data.profile.contact.whatsapp.replace(/[^0-9]/g, "");
  const whatsappInquiryUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    dict.projectDetail.whatsappInquiryMessage(projectTitle)
  )}`;

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const PrevIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* Project Header & Breadcrumb */}
      <section className="w-full pt-28 sm:pt-32 pb-10 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              href={`/${locale}/work`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#777777] hover:text-[#D7C9B2] transition-colors"
            >
              <BackIcon className="w-4 h-4" />
              <span>{dict.projectDetail.backToGallery}</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
              <span>{dict.projectDetail.archiveItemLabel}</span>
              <span className="text-[#D7C9B2]" dir="ltr">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(projects.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <Link
              href={`/${locale}/work?category=${project.category}`}
              className="px-3 py-1 rounded bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/12 text-xs font-medium hover:border-[#D7C9B2] transition-colors"
            >
              {categoryName}
            </Link>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#EAE6DF] tracking-tight leading-[1.15]">
            {projectTitle}
          </h1>
        </div>
      </section>

      {/* Main Artwork & Editorial Metadata Section */}
      <section className="w-full py-12 sm:py-16 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            {/* Artwork / Video Showcase (8 columns) */}
            <div className="lg:col-span-8">
              <ProjectMedia
                project={project}
                priority={true}
                locale={locale}
              />
            </div>

            {/* Project Specifications Sidebar (4 columns) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="editorial-panel p-6 sm:p-7 bg-[#121212] border border-[#EAE6DF]/12 space-y-6">
                {/* Description */}
                {projectDesc && (
                  <div className="space-y-2 pb-6 border-b border-[#EAE6DF]/10">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-[#D7C9B2]">
                      {dict.projectDetail.conceptHeading}
                    </h2>
                    <p className="text-sm sm:text-base text-[#EAE6DF]/90 leading-relaxed">
                      {projectDesc}
                    </p>
                  </div>
                )}

                {/* Metadata Specs */}
                <dl className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-[#EAE6DF]/8">
                    <dt className="text-[#777777] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#D7C9B2]" />
                      <span>{dict.projectDetail.categoryLabel}</span>
                    </dt>
                    <dd className="text-[#EAE6DF] font-medium">
                      {categoryName}
                    </dd>
                  </div>

                  {project.createdAt && (
                    <div className="flex items-center justify-between py-2 border-b border-[#EAE6DF]/8">
                      <dt className="text-[#777777] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D7C9B2]" />
                        <span>{dict.projectDetail.publishedDateLabel}</span>
                      </dt>
                      <dd className="text-[#EAE6DF] font-mono" dir="ltr">
                        {project.createdAt}
                      </dd>
                    </div>
                  )}

                  {project.tools && project.tools.length > 0 && (
                    <div className="pt-2 space-y-2.5">
                      <dt className="text-[#777777] flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#D7C9B2]" />
                        <span>{dict.projectDetail.toolsUsedLabel}</span>
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {project.tools.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/10 font-mono text-xs"
                          >
                            {getLocalizedToolName(tool, locale)}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Commission / Inquiry Actions */}
                <div className="pt-6 border-t border-[#EAE6DF]/10 space-y-3">
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{dict.projectDetail.whatsappInquiryBtn}</span>
                  </a>

                  {project.driveVideoUrl && (
                    <a
                      href={project.driveVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded border border-[#EAE6DF]/15 bg-[#202020] hover:border-[#D7C9B2] text-[#EAE6DF] hover:text-[#D7C9B2] font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{dict.projectDetail.openDriveVideoBtn}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Previous / Next Project Navigation */}
              <nav
                aria-label={dict.projectDetail.prevNextAria}
                className="grid grid-cols-2 gap-3"
              >
                {prevProject && (
                  <Link
                    href={`/${locale}/work/${getProjectSlug(prevProject)}`}
                    className="editorial-card p-4 bg-[#121212] flex flex-col justify-between gap-2 text-start group"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#777777] group-hover:text-[#D7C9B2]">
                      <PrevIcon className="w-3.5 h-3.5" />
                      <span>{dict.projectDetail.prevProject}</span>
                    </span>
                    <span className="text-xs font-bold text-[#EAE6DF] truncate">
                      {prevTitle}
                    </span>
                  </Link>
                )}

                {nextProject && (
                  <Link
                    href={`/${locale}/work/${getProjectSlug(nextProject)}`}
                    className="editorial-card p-4 bg-[#121212] flex flex-col justify-between gap-2 text-end group"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 text-[11px] font-mono text-[#777777] group-hover:text-[#D7C9B2]">
                      <span>{dict.projectDetail.nextProject}</span>
                      <NextIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-[#EAE6DF] truncate">
                      {nextTitle}
                    </span>
                  </Link>
                )}
              </nav>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Works Section */}
      {relatedProjects.length > 0 && (
        <section className="w-full py-16 sm:py-20 bg-[#0A0A0A] border-b border-[#EAE6DF]/10">
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#EAE6DF]/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#D7C9B2] block mb-1">
                  {dict.projectDetail.relatedEyebrow}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#EAE6DF]">
                  {dict.projectDetail.relatedTitle(categoryName)}
                </h2>
              </div>
              <Link
                href={`/${locale}/work?category=${project.category}`}
                className="text-xs sm:text-sm font-medium text-[#D7C9B2] hover:underline"
              >
                {dict.projectDetail.viewAllCategoryLink}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relProj, idx) => (
                <ProjectCard
                  key={relProj.id}
                  project={relProj}
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
    </>
  );
}

export const instant = false;

export default async function LocalizedProjectDetailPage({
  params,
}: ProjectPageProps) {
  const { lang: rawLang } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const data = getPortfolioData();

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden">
      <Navbar
        activePath="/work"
        locale={locale}
        brand={data.brand}
        navigation={data.navigation}
      />
      <Suspense
        fallback={
          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pt-36 pb-24">
            <div className="h-8 w-48 bg-[#202020] rounded mb-4" />
            <div className="h-12 w-2/3 bg-[#202020] rounded mb-10" />
            <div className="h-[480px] w-full bg-[#121212] border border-[#EAE6DF]/10 rounded" />
          </div>
        }
      >
        <ProjectDetailContent params={params} />
      </Suspense>
    </main>
  );
}

