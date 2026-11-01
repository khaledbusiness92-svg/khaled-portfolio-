"use client";

import { useState } from "react";
import {
  Project,
  Locale,
  getDriveEmbedUrl,
  getDictionary,
  getLocalizedProjectTitle,
} from "@/lib/portfolio";
import {
  Play,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface ProjectMediaProps {
  project: Project;
  locale?: Locale;
  priority?: boolean;
}

export default function ProjectMedia({
  project,
  locale = "ar",
  priority = false,
}: ProjectMediaProps) {
  const dict = getDictionary(locale);
  const title = getLocalizedProjectTitle(project, locale);
  const driveEmbedUrl = getDriveEmbedUrl(project.driveVideoUrl);
  const [activeMode, setActiveMode] = useState<"image" | "video">(
    driveEmbedUrl ? "video" : "image"
  );
  const [selectedImage, setSelectedImage] = useState<string>(project.image);
  const [videoError, setVideoError] = useState(false);

  const allImages = [
    project.image,
    ...(project.gallery
      ? project.gallery.filter((img) => img && img !== project.image)
      : []),
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Media Mode Switcher Bar */}
      {(driveEmbedUrl || allImages.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md bg-[#141414] border border-[#EAE6DF]/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMode("image")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeMode === "image"
                  ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
                  : "text-[#EAE6DF] hover:bg-[#202020]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{dict.projectDetail.artworkModeBtn}</span>
            </button>

            {driveEmbedUrl && (
              <button
                type="button"
                onClick={() => setActiveMode("video")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeMode === "video"
                    ? "bg-[#D7C9B2] text-[#0A0A0A] font-bold"
                    : "text-[#EAE6DF] hover:bg-[#202020]"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{dict.projectDetail.videoModeBtn}</span>
              </button>
            )}
          </div>

          {project.driveVideoUrl && (
            <a
              href={project.driveVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#D7C9B2] hover:text-[#EAE6DF] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{dict.projectDetail.openVideoExternal}</span>
            </a>
          )}
        </div>
      )}

      {/* Main Media Frame */}
      <div className="editorial-panel bg-[#111111] border border-[#EAE6DF]/12 overflow-hidden w-full">
        {activeMode === "video" && driveEmbedUrl ? (
          <div className="space-y-0">
            {!videoError ? (
              <div className="relative w-full aspect-video bg-[#0A0A0A]">
                <iframe
                  src={driveEmbedUrl}
                  title={title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  loading="lazy"
                  onError={() => setVideoError(true)}
                />
              </div>
            ) : null}

            {/* Graceful Fallback Banner */}
            <div className="px-4 py-3 bg-[#141414] border-t border-[#EAE6DF]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#777777]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D7C9B2] flex-shrink-0" />
                <span>{dict.projectDetail.videoFallbackNotice}</span>
              </div>
              {project.driveVideoUrl && (
                <a
                  href={project.driveVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202020] text-[#EAE6DF] hover:bg-[#D7C9B2] hover:text-[#0A0A0A] font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{dict.projectDetail.watchExternalBtn}</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-10 flex items-center justify-center bg-[#0D0D0D] min-h-[340px] sm:min-h-[540px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage || project.image}
              alt={title}
              fetchPriority={priority ? "high" : undefined}
              loading={priority ? undefined : "lazy"}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-[4px] border border-[#EAE6DF]/10"
            />
          </div>
        )}
      </div>

      {/* Optional Additional Gallery Thumbnails */}
      {allImages.length > 1 && activeMode === "image" && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {allImages.map((imgUrl, idx) => {
            const isSelected = selectedImage === imgUrl;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`w-20 h-20 rounded overflow-hidden border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#D7C9B2] ring-1 ring-[#D7C9B2]"
                    : "border-[#EAE6DF]/15 opacity-70 hover:opacity-100"
                }`}
                aria-label={dict.projectDetail.galleryImageAria(idx + 1)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`${title} - ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
