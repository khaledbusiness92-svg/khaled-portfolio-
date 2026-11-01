import Link from "next/link";
import { Locale } from "@/lib/portfolio";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  locale?: Locale;
  kicker: string;
  title: string;
  titleAccent?: string;
  description: string;
  metaLabel?: string;
  metaText?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  locale = "ar",
  kicker,
  title,
  titleAccent,
  description,
  metaLabel,
  metaText,
  backHref,
  backLabel,
}: PageHeaderProps) {
  const isRtl = locale === "ar";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <section className="w-full pt-32 pb-14 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {backHref && backLabel && (
          <div className="mb-6">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#777777] hover:text-[#D7C9B2] transition-colors"
            >
              <BackArrow className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </Link>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 text-xs tracking-wider uppercase text-[#D7C9B2] mb-4 font-medium">
              <span className="h-px w-8 bg-[#D7C9B2]" aria-hidden="true" />
              <span>{kicker}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EAE6DF] tracking-tight leading-[1.12]">
              {title}{" "}
              {titleAccent && (
                <span className="font-serif-editorial font-normal text-[#D7C9B2] block sm:inline mt-1 sm:mt-0">
                  {titleAccent}
                </span>
              )}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#777777] leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>

          {metaText && (
            <div className="lg:text-end border-t lg:border-t-0 lg:border-s border-[#EAE6DF]/10 pt-4 lg:pt-0 lg:ps-8 flex-shrink-0">
              {metaLabel && (
                <span className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                  {metaLabel}
                </span>
              )}
              <p className="text-sm font-medium text-[#EAE6DF]">{metaText}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
