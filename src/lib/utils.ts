import { Category, Project } from "./types";

/**
 * Converts a Google Drive share link into an embeddable iframe preview URL.
 * Handles standard file URLs, open?id= URLs, and already-embedded URLs.
 */
export function getDriveEmbedUrl(url?: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return `https://drive.google.com/file/d/${matchFile[1]}/preview`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/file/d/${matchId[1]}/preview`;
  }

  // Pattern 3: Youtube links or generic
  if (trimmed.includes("youtube.com/watch?v=")) {
    const ytId = trimmed.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${ytId}`;
  }
  if (trimmed.includes("youtu.be/")) {
    const ytId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${ytId}`;
  }

  return trimmed;
}

/**
 * Returns the canonical route slug for a project.
 * Uses `project.slug` if present, otherwise `project.id` (e.g. "proj-1").
 */
export function getProjectSlug(project: Project): string {
  return project.slug || project.id;
}

/**
 * Resolves a human-readable category label from the categories array.
 */
export function getCategoryLabel(categoryId: string, categories?: Category[]): string {
  if (categories && categories.length > 0) {
    const match = categories.find((c) => c.id === categoryId);
    if (match) return match.name;
  }
  const fallbackMap: Record<string, string> = {
    all: "كل الأعمال",
    restaurant: "إعلانات المطاعم",
    clothing: "إعلانات الملابس والبراندات",
    sketches: "اسكتشات ورسومات حرة",
    portraits: "بورتريه، مانجا وكاريكاتير",
  };
  return fallbackMap[categoryId] || categoryId;
}

/**
 * Resolves the English category label for editorial metadata captions.
 */
export function getCategoryLabelEn(categoryId: string, categories?: Category[]): string {
  if (categories && categories.length > 0) {
    const match = categories.find((c) => c.id === categoryId);
    if (match?.nameEn) return match.nameEn;
  }
  const fallbackMap: Record<string, string> = {
    all: "All Works",
    restaurant: "Restaurant Ads",
    clothing: "Clothing Brands",
    sketches: "Sketches",
    portraits: "Portraits & Manga",
  };
  return fallbackMap[categoryId] || categoryId;
}
