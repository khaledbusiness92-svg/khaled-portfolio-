"use client";

import { useSearchParams } from "next/navigation";
import { Project, Category, Locale } from "@/lib/portfolio";
import PortfolioGallery from "./PortfolioGallery";

interface WorkArchiveClientProps {
  initialProjects: Project[];
  categories: Category[];
  locale?: Locale;
}

export default function WorkArchiveClient({
  initialProjects,
  categories,
  locale = "ar",
}: WorkArchiveClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const isValidCategory = categories.some((c) => c.id === categoryParam);

  return (
    <PortfolioGallery
      initialProjects={initialProjects}
      categories={categories}
      mode="full"
      initialCategory={isValidCategory ? categoryParam : "all"}
      syncUrlParams={true}
      locale={locale}
    />
  );
}
