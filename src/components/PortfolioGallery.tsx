"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Project,
  Category,
  Locale,
  PageSectionConfig,
  getProjectSlug,
  getDictionary,
  getLocalizedCategoryName,
  getLocalizedProjectTitle,
  getLocalizedProjectDescription,
} from "@/lib/portfolio";
import ProjectModal from "./ProjectModal";
import CategoryFilters from "./CategoryFilters";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";
import { ArrowUpLeft, ArrowUpRight, Eye, Play, Filter } from "lucide-react";

interface PortfolioGalleryProps {
  initialProjects: Project[];
  categories: Category[];
  mode?: "preview" | "full";
  initialCategory?: string;
  syncUrlParams?: boolean;
  locale?: Locale;
  sectionConfig?: PageSectionConfig;
}

export default function PortfolioGallery({
  initialProjects,
  categories,
  mode = "full",
  initialCategory = "all",
  syncUrlParams = false,
  locale = "ar",
  sectionConfig,
}: PortfolioGalleryProps) {
  const dict = getDictionary(locale);
  const DirectionalArrow = locale === "ar" ? ArrowUpLeft : ArrowUpRight;

  // Filter only published projects for public display
  const publicProjects = useMemo(() => {
    return initialProjects.filter((p) => p.published !== false);
  }, [initialProjects]);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || "all"
  );
  const [prevInitialCategory, setPrevInitialCategory] = useState<string>(
    initialCategory || "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  if ((initialCategory || "all") !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory || "all");
    setSelectedCategory(initialCategory || "all");
  }

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (syncUrlParams && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (categoryId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", categoryId);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Accurate project counts derived directly from published projects
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: publicProjects.length,
    };
    for (const cat of categories) {
      if (cat.id !== "all") {
        counts[cat.id] = publicProjects.filter(
          (p) => p.category === cat.id
        ).length;
      }
    }
    return counts;
  }, [publicProjects, categories]);

  // Selected works for homepage preview (up to 6 projects, prioritizing featured)
  const selectedWorks = useMemo(() => {
    const featured = publicProjects.filter((p) => p.featured);
    const nonFeatured = publicProjects.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 6);
  }, [publicProjects]);

  // Filtered projects for full gallery view
  const filteredProjects = useMemo(() => {
    if (mode === "preview") {
      return selectedWorks;
    }
    return publicProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (q === "") return matchesCategory;

      const localizedTitle = getLocalizedProjectTitle(project, locale).toLowerCase();
      const localizedDesc = getLocalizedProjectDescription(project, locale).toLowerCase();
      const matchesSearch =
        localizedTitle.includes(q) ||
        localizedDesc.includes(q) ||
        (project.tools &&
          project.tools.some((t) => t.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [
    mode,
    selectedWorks,
    publicProjects,
    selectedCategory,
    searchQuery,
    locale,
  ]);

  const activeProjectIndex = useMemo(() => {
    if (!activeProjectId) return null;
    const idx = filteredProjects.findIndex((p) => p.id === activeProjectId);
    return idx >= 0 ? idx : null;
  }, [activeProjectId, filteredProjects]);

  const currentProject =
    activeProjectIndex !== null ? filteredProjects[activeProjectIndex] : null;

  const handlePrev = () => {
    if (activeProjectIndex === null || filteredProjects.length === 0) return;
    const prevIdx =
      activeProjectIndex > 0
        ? activeProjectIndex - 1
        : filteredProjects.length - 1;
    setActiveProjectId(filteredProjects[prevIdx].id);
  };

  const handleNext = () => {
    if (activeProjectIndex === null || filteredProjects.length === 0) return;
    const nextIdx =
      activeProjectIndex < filteredProjects.length - 1
        ? activeProjectIndex + 1
        : 0;
    setActiveProjectId(filteredProjects[nextIdx].id);
  };

  // HOME PAGE SELECTED WORKS MODE (Section C)
  if (mode === "preview") {
    return (
      <section
        id="portfolio"
        className="w-full py-20 sm:py-28 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]"
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <SectionHeading
            index={locale === "ar" ? "٠١" : "01"}
            eyebrow={
              locale === "en"
                ? sectionConfig?.eyebrowEn || dict.selectedWorks.eyebrow
                : sectionConfig?.eyebrow || dict.selectedWorks.eyebrow
            }
            title={
              locale === "en"
                ? sectionConfig?.titleEn || dict.selectedWorks.title
                : sectionConfig?.title || dict.selectedWorks.title
            }
            titleAccent={
              locale === "en"
                ? sectionConfig?.titleAccentEn || dict.selectedWorks.titleAccent
                : sectionConfig?.titleAccent || dict.selectedWorks.titleAccent
            }
            description={
              locale === "en"
                ? sectionConfig?.descriptionEn || dict.selectedWorks.description
                : sectionConfig?.description || dict.selectedWorks.description
            }
            actionHref={
              sectionConfig?.actionHref
                ? `/${locale}${sectionConfig.actionHref.startsWith("/") ? "" : "/"}${sectionConfig.actionHref}`
                : `/${locale}/work`
            }
            actionLabel={
              locale === "en"
                ? sectionConfig?.actionLabelEn || dict.selectedWorks.viewAllBtn(publicProjects.length)
                : sectionConfig?.actionLabel || dict.selectedWorks.viewAllBtn(publicProjects.length)
            }
            locale={locale}
          />

          {/* Asymmetrical Editorial Grid for Selected Works */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {selectedWorks.map((project, idx) => {
              const slug = getProjectSlug(project);
              const categoryName = getLocalizedCategoryName(
                project.category,
                locale,
                categories
              );
              const projectTitle = getLocalizedProjectTitle(project, locale);
              const projectDesc = getLocalizedProjectDescription(
                project,
                locale
              );
              const displayIdx = String(idx + 1).padStart(2, "0");

              // Asymmetric 12-column editorial span pattern:
              // Row 1: 7 cols + 5 cols | Row 2: 5 cols + 7 cols | Row 3: 7 cols + 5 cols
              const row = Math.floor(idx / 2);
              const isWide =
                (row % 2 === 0 && idx % 2 === 0) ||
                (row % 2 === 1 && idx % 2 === 1);
              const colSpanClass = isWide
                ? "md:col-span-7"
                : "md:col-span-5";

              return (
                <article
                  key={project.id}
                  className={`${colSpanClass} editorial-card group flex flex-col justify-between overflow-hidden bg-[#111111]`}
                >
                  {/* Top Editorial Strip */}
                  <div className="px-5 py-3.5 border-b border-[#EAE6DF]/10 flex items-center justify-between text-xs text-[#777777]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[#D7C9B2] font-bold">
                        {displayIdx}
                      </span>
                      <span>—</span>
                      <span className="text-[#EAE6DF] font-medium">
                        {categoryName}
                      </span>
                    </div>

                    {project.driveVideoUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#D7C9B2]/15 text-[#D7C9B2] border border-[#D7C9B2]/30 text-[10px] font-medium">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{dict.selectedWorks.videoBadge}</span>
                      </span>
                    )}
                  </div>

                  {/* Artwork Container — No destructive cropping */}
                  <div className="relative bg-[#0D0D0D] overflow-hidden flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
                    <Link
                      href={`/${locale}/work/${slug}`}
                      className="w-full h-full flex items-center justify-center focus:outline-none"
                      aria-label={dict.selectedWorks.detailsAria(projectTitle)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image}
                        alt={projectTitle}
                        loading="lazy"
                        className="max-h-[440px] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setActiveProjectId(project.id)}
                      aria-label={dict.selectedWorks.quickPreviewAria(
                        projectTitle
                      )}
                      className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0A0A0A]/85 hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] border border-[#EAE6DF]/15 text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{dict.selectedWorks.quickPreview}</span>
                    </button>
                  </div>

                  {/* Bottom Meta & Link */}
                  <div className="p-5 sm:p-6 border-t border-[#EAE6DF]/10 bg-[#121212] flex items-end justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-[#EAE6DF] group-hover:text-[#D7C9B2] transition-colors truncate">
                        <Link
                          href={`/${locale}/work/${slug}`}
                          className="hover:underline"
                        >
                          {projectTitle}
                        </Link>
                      </h3>
                      {projectDesc && (
                        <p className="text-xs sm:text-sm text-[#777777] line-clamp-1">
                          {projectDesc}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/work/${slug}`}
                      aria-label={dict.selectedWorks.detailsAria(projectTitle)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#EAE6DF]/12 bg-[#202020] text-xs font-medium text-[#EAE6DF] group-hover:border-[#D7C9B2] group-hover:bg-[#D7C9B2] group-hover:text-[#0A0A0A] transition-colors shrink-0"
                    >
                      <span>{dict.selectedWorks.detailsBtn}</span>
                      <DirectionalArrow className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom View All CTA */}
          <div className="mt-12 pt-8 border-t border-[#EAE6DF]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-[#777777]">
              {dict.selectedWorks.footerSummaryPrefix(selectedWorks.length)}{" "}
              <span className="text-[#EAE6DF] font-bold">
                {dict.selectedWorks.footerSummaryHighlight(
                  initialProjects.length
                )}
              </span>{" "}
              {dict.selectedWorks.footerSummarySuffix}
            </p>
            <Link
              href={`/${locale}/work`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-colors"
            >
              <span>
                {dict.selectedWorks.browseFullArchiveBtn(
                  initialProjects.length
                )}
              </span>
              <DirectionalArrow className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Lightbox Modal */}
        <ProjectModal
          project={currentProject}
          categories={categories}
          onClose={() => setActiveProjectId(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          locale={locale}
        />
      </section>
    );
  }

  // FULL ARCHIVE MODE (/work)
  return (
    <section
      id="work-gallery"
      className="w-full py-12 sm:py-16 bg-[#0A0A0A] min-h-[60vh]"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <CategoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          projectCounts={projectCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          locale={locale}
        />

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs text-[#777777] mb-8">
          <div>
            <span>{dict.gallery.showingLabel} </span>
            <strong className="text-[#EAE6DF] font-mono">
              {filteredProjects.length}
            </strong>
            <span> {dict.gallery.ofTotalLabel} </span>
            <span className="font-mono">{initialProjects.length}</span>
          </div>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => handleSelectCategory("all")}
              className="text-[#D7C9B2] hover:underline cursor-pointer"
            >
              {dict.gallery.resetFilterBtn}
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="editorial-panel p-14 text-center space-y-4 bg-[#121212]">
            <Filter className="w-8 h-8 text-[#D7C9B2] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#EAE6DF]">
                {dict.gallery.emptyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#777777]">
                {dict.gallery.emptyDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleSelectCategory("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#D7C9B2] text-[#0A0A0A] text-xs font-bold cursor-pointer"
            >
              <span>{dict.gallery.showAllBtn(initialProjects.length)}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                categories={categories}
                index={idx}
                variant="editorial"
                onQuickView={(p) => setActiveProjectId(p.id)}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <ProjectModal
        project={currentProject}
        categories={categories}
        onClose={() => setActiveProjectId(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        locale={locale}
      />
    </section>
  );
}
