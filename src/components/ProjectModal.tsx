"use client";

import { useEffect, useRef, useState, useId } from "react";
import Link from "next/link";
import {
  Project,
  Category,
  Locale,
  getDriveEmbedUrl,
  getProjectSlug,
  getDictionary,
  getLocalizedCategoryName,
  getLocalizedProjectTitle,
  getLocalizedProjectDescription,
  getLocalizedToolName,
} from "@/lib/portfolio";
import {
  X,
  Play,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Wrench,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";

interface ProjectModalProps {
  project: Project | null;
  locale?: Locale;
  categories?: Category[];
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ProjectModal({
  project,
  locale = "ar",
  categories,
  onClose,
  onPrev,
  onNext,
}: ProjectModalProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<"image" | "video">(
    project?.driveVideoUrl ? "video" : "image"
  );
  const [prevProjectId, setPrevProjectId] = useState<string | null>(
    project?.id ?? null
  );
  const pressedOutsideRef = useRef(false);

  if ((project?.id ?? null) !== prevProjectId) {
    setPrevProjectId(project?.id ?? null);
    if (project) {
      setActiveTab(project.driveVideoUrl ? "video" : "image");
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project && !dialog.open) {
      dialog.showModal();
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === "ArrowRight") {
        if (isRtl && onPrev) onPrev();
        if (!isRtl && onNext) onNext();
      }
      if (e.key === "ArrowLeft") {
        if (isRtl && onNext) onNext();
        if (!isRtl && onPrev) onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, isRtl, onPrev, onNext]);

  if (!project) return null;

  const driveEmbedUrl = getDriveEmbedUrl(project.driveVideoUrl);
  const slug = getProjectSlug(project);
  const categoryName = getLocalizedCategoryName(
    project.category,
    locale,
    categories
  );
  const title = getLocalizedProjectTitle(project, locale);
  const description = getLocalizedProjectDescription(project, locale);

  const isOutsideDialog = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      dir={isRtl ? "rtl" : "ltr"}
      lang={locale}
      {...({ closedby: "any" } as Record<string, string>)}
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = "";
        }
        onClose();
      }}
      onPointerDown={(e) => {
        if (!("closedBy" in HTMLDialogElement.prototype)) {
          pressedOutsideRef.current = isOutsideDialog(e);
        }
      }}
      onPointerUp={(e) => {
        if (
          !("closedBy" in HTMLDialogElement.prototype) &&
          pressedOutsideRef.current &&
          isOutsideDialog(e)
        ) {
          dialogRef.current?.close();
        }
      }}
      className="m-auto w-[calc(100%-1.5rem)] max-w-6xl max-h-[92vh] overflow-y-auto rounded-md border border-[#EAE6DF]/15 bg-[#121212] text-[#EAE6DF] shadow-2xl p-0 animate-editorial-scale backdrop:backdrop-blur-md backdrop:bg-[#0A0A0A]/85 backdrop:transition-opacity backdrop:duration-300"
    >
      <div className="flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded text-xs font-medium bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/10 flex-shrink-0">
              {categoryName}
            </span>
            <h2
              id={titleId}
              className="text-base sm:text-lg font-bold text-[#EAE6DF] truncate"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            {driveEmbedUrl && (
              <div className="flex items-center rounded bg-[#202020] p-1 border border-[#EAE6DF]/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("image")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "image"
                      ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
                      : "text-[#777777] hover:text-[#EAE6DF]"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{dict.modal.imageTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "video"
                      ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
                      : "text-[#777777] hover:text-[#EAE6DF]"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{dict.modal.videoTab}</span>
                </button>
              </div>
            )}

            {/* Close Button */}
            <form method="dialog">
              <button
                type="submit"
                autoFocus
                className="p-2 rounded bg-[#202020] text-[#EAE6DF] hover:bg-[#D7C9B2] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                aria-label={dict.modal.closeAria}
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Modal Body / Media Area */}
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
          {/* Main Media Showcase */}
          <div className="lg:w-2/3 flex items-center justify-center bg-[#0A0A0A] rounded border border-[#EAE6DF]/10 min-h-[320px] sm:min-h-[460px] relative overflow-hidden">
            {activeTab === "video" && driveEmbedUrl ? (
              <div className="w-full h-full min-h-[380px] flex flex-col justify-center items-center relative">
                <iframe
                  src={driveEmbedUrl}
                  title={title}
                  className="w-full h-[400px] sm:h-[460px] border-0"
                  allow="autoplay; fullscreen"
                />
                {project.driveVideoUrl && (
                  <div className="absolute top-3 end-3">
                    <a
                      href={project.driveVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0A0A0A]/85 hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-medium border border-[#EAE6DF]/15 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{dict.modal.openExternalVideo}</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={title}
                  fetchPriority="low"
                  className="max-h-[520px] w-auto max-w-full object-contain rounded-[4px]"
                />
              </div>
            )}

            {/* Navigation Arrows */}
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="absolute start-3 top-1/2 -translate-y-1/2 p-2.5 rounded bg-[#0A0A0A]/85 hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] border border-[#EAE6DF]/15 transition-colors cursor-pointer"
                aria-label={dict.modal.prevAria}
                title={dict.modal.prevAria}
              >
                <PrevIcon className="w-4 h-4" />
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-2.5 rounded bg-[#0A0A0A]/85 hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] border border-[#EAE6DF]/15 transition-colors cursor-pointer"
                aria-label={dict.modal.nextAria}
                title={dict.modal.nextAria}
              >
                <NextIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Project Details Sidebar */}
          <div className="lg:w-1/3 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#D7C9B2] font-medium block mb-1.5">
                  {dict.modal.detailsEyebrow}
                </span>
                <h3 className="text-xl font-bold text-[#EAE6DF] mb-2">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-[#777777] leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Tools Used */}
              {project.tools && project.tools.length > 0 && (
                <div className="pt-4 border-t border-[#EAE6DF]/10">
                  <span className="text-xs text-[#777777] font-medium flex items-center gap-1.5 mb-2.5">
                    <Wrench className="w-3.5 h-3.5 text-[#D7C9B2]" />
                    <span>{dict.modal.toolsLabel}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded text-xs bg-[#202020] border border-[#EAE6DF]/10 text-[#EAE6DF]"
                      >
                        {getLocalizedToolName(tool, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              {project.createdAt && (
                <div className="flex items-center gap-2 text-xs text-[#777777] pt-3 border-t border-[#EAE6DF]/10">
                  <Calendar className="w-3.5 h-3.5 text-[#D7C9B2]" />
                  <span>
                    {dict.modal.dateLabel} {project.createdAt}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#EAE6DF]/10 space-y-2.5">
              <Link
                href={`/${locale}/work/${slug}`}
                onClick={onClose}
                className="w-full py-3 px-4 rounded bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>{dict.modal.openFullPageBtn}</span>
                <ActionArrow className="w-4 h-4" />
              </Link>

              <Link
                href={`/${locale}/contact`}
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded border border-[#EAE6DF]/15 bg-[#202020] hover:border-[#D7C9B2] text-[#EAE6DF] hover:text-[#D7C9B2] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>{dict.modal.inquireSimilarBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
