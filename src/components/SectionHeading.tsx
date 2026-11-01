import Link from "next/link";
import { Locale } from "@/lib/portfolio";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import MotionReveal from "./MotionReveal";

interface SectionHeadingProps {
  locale?: Locale;
  index?: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function SectionHeading({
  locale = "ar",
  index,
  eyebrow,
  title,
  titleAccent,
  description,
  actionHref,
  actionLabel,
}: SectionHeadingProps) {
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  return (
    <div className="w-full border-b border-[#EAE6DF]/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <MotionReveal direction="up" delayMs={60} durationMs={700} className="max-w-3xl">
        <div className="flex items-center gap-3 text-xs tracking-wider uppercase text-[#D7C9B2] mb-3 font-medium">
          {index && (
            <span className="font-mono text-[#777777] border border-[#EAE6DF]/15 px-2 py-0.5 rounded">
              {index}
            </span>
          )}
          <span
            className="h-px w-6 bg-[#D7C9B2]/60 inline-block"
            aria-hidden="true"
          />
          <span>{eyebrow}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EAE6DF] leading-[1.18] tracking-tight">
          {title}{" "}
          {titleAccent && (
            <span className="font-serif-editorial font-normal text-[#D7C9B2]">
              {titleAccent}
            </span>
          )}
        </h2>

        {description && (
          <p className="mt-4 text-sm sm:text-base text-[#777777] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </MotionReveal>

      {actionHref && actionLabel && (
        <MotionReveal direction="up" delayMs={140} durationMs={700} className="flex-shrink-0">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#EAE6DF]/15 bg-[#202020]/50 text-[#EAE6DF] hover:border-[#D7C9B2] hover:bg-[#D7C9B2] hover:text-[#0A0A0A] transition-all duration-300 hover-editorial-lift text-xs sm:text-sm font-medium group"
          >
            <span>{actionLabel}</span>
            <ActionArrow className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </Link>
        </MotionReveal>
      )}
    </div>
  );
}
