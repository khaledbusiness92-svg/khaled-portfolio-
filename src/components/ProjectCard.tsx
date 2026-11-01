"use client";

import Link from "next/link";
import {
  Project,
  Category,
  Locale,
  getProjectSlug,
  getDictionary,
  getLocalizedCategoryName,
  getLocalizedProjectTitle,
  getLocalizedProjectDescription,
  getLocalizedToolName,
} from "@/lib/portfolio";
import { ArrowUpLeft, ArrowUpRight, Play, Eye } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  locale?: Locale;
  categories?: Category[];
  index?: number;
  variant?: "masonry" | "editorial";
  onQuickView?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  locale = "ar",
  categories,
  index = 0,
  variant = "editorial",
  onQuickView,
}: ProjectCardProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  const slug = getProjectSlug(project);
  const categoryName = getLocalizedCategoryName(
    project.category,
    locale,
    categories
  );
  const title = getLocalizedProjectTitle(project, locale);
  const description = getLocalizedProjectDescription(project, locale);
  const displayIndex = String(index + 1).padStart(2, "0");
  const detailHref = `/${locale}/work/${slug}`;

  return (
    <article className="editorial-card group flex flex-col overflow-hidden bg-[#111111]">
      {/* Top Meta Bar */}
      <div className="px-4 py-3 border-b border-[#EAE6DF]/8 flex items-center justify-between text-[11px] text-[#777777]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#D7C9B2]">{displayIndex}</span>
          <span>/</span>
          <span className="text-[#EAE6DF]/80 font-medium">{categoryName}</span>
        </div>

        {project.driveVideoUrl && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#D7C9B2]/15 text-[#D7C9B2] border border-[#D7C9B2]/30 font-medium text-[10px]">
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>{dict.selectedWorks.videoBadge}</span>
          </span>
        )}
      </div>

      {/* Artwork Frame — Preserves artwork visibility without aggressive cropping */}
      <div className="relative bg-[#0D0D0D] overflow-hidden">
        <Link
          href={detailHref}
          className="block relative focus:outline-none"
          aria-label={dict.selectedWorks.detailsAria(title)}
        >
          {variant === "masonry" ? (
            <div className="w-full overflow-hidden bg-[#0D0D0D] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={title}
                loading="lazy"
                className="w-full h-auto max-h-[540px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/5] p-3 sm:p-4 bg-[#0D0D0D] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={title}
                loading="lazy"
                className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
          )}
        </Link>

        {/* Quick Lightbox Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(project);
            }}
            aria-label={dict.selectedWorks.quickPreviewAria(title)}
            title={dict.selectedWorks.quickPreview}
            className="absolute bottom-3 end-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0A0A0A]/85 hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] border border-[#EAE6DF]/15 text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{dict.selectedWorks.quickPreview}</span>
          </button>
        )}
      </div>

      {/* Card Body & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 border-t border-[#EAE6DF]/8 bg-[#121212]">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base sm:text-lg font-bold text-[#EAE6DF] group-hover:text-[#D7C9B2] transition-colors leading-snug">
              <Link href={detailHref} className="hover:underline">
                {title}
              </Link>
            </h3>
            <Link
              href={detailHref}
              aria-label={dict.selectedWorks.detailsAria(title)}
              className="w-8 h-8 rounded border border-[#EAE6DF]/10 bg-[#202020]/70 flex items-center justify-center text-[#777777] group-hover:border-[#D7C9B2] group-hover:bg-[#D7C9B2] group-hover:text-[#0A0A0A] transition-colors flex-shrink-0"
            >
              <ActionArrow className="w-4 h-4" />
            </Link>
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-[#777777] line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Tools Badges */}
        {project.tools && project.tools.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#EAE6DF]/8">
            {project.tools.map((tool, tIdx) => (
              <span
                key={tIdx}
                className="px-2 py-0.5 rounded text-[11px] bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/8"
              >
                {getLocalizedToolName(tool, locale)}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
