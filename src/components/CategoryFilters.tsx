"use client";

import {
  Category,
  Locale,
  getDictionary,
  getLocalizedCategoryName,
} from "@/lib/portfolio";
import { Search, X } from "lucide-react";

interface CategoryFiltersProps {
  locale?: Locale;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  projectCounts: Record<string, number>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function CategoryFilters({
  locale = "ar",
  categories,
  selectedCategory,
  onSelectCategory,
  projectCounts,
  searchQuery = "",
  onSearchChange,
}: CategoryFiltersProps) {
  const dict = getDictionary(locale);

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 mb-10 border-b border-[#EAE6DF]/10">
      {/* Category Filter Buttons */}
      <div
        role="group"
        aria-label={dict.gallery.filterGroupAria}
        className="flex flex-wrap items-center gap-2"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = projectCounts[cat.id] ?? 0;
          const categoryLabel = getLocalizedCategoryName(
            cat.id,
            locale,
            categories
          );

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 hover-editorial-lift cursor-pointer border ${
                isActive
                  ? "bg-[#D7C9B2] text-[#0A0A0A] border-[#D7C9B2] font-bold"
                  : "bg-[#141414] text-[#EAE6DF] border-[#EAE6DF]/10 hover:border-[#D7C9B2]/50 hover:bg-[#202020]"
              }`}
            >
              <span>{categoryLabel}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-[#0A0A0A]/15 text-[#0A0A0A]"
                    : "bg-[#202020] text-[#777777]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Search Input */}
      {onSearchChange && (
        <div className="relative w-full lg:w-80">
          <Search
            className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={dict.gallery.searchPlaceholder}
            aria-label={dict.gallery.searchAria}
            className="w-full ps-10 pe-9 py-2.5 rounded-md bg-[#141414] border border-[#EAE6DF]/12 text-xs sm:text-sm text-[#EAE6DF] placeholder:text-[#777777] focus:outline-none focus:border-[#D7C9B2] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={dict.gallery.clearSearchAria}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-[#777777] hover:text-[#EAE6DF] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
