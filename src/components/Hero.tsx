import Link from "next/link";
import {
  ProfileData,
  Project,
  Locale,
  PageSectionConfig,
  getProjectSlug,
  getDictionary,
  getLocalizedProfile,
  getLocalizedStat,
  getLocalizedProjectTitle,
} from "@/lib/portfolio";
import {
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
} from "lucide-react";

interface HeroProps {
  profile: ProfileData;
  featuredProject?: Project;
  locale?: Locale;
  sectionConfig?: PageSectionConfig;
}

export default function Hero({
  profile,
  featuredProject,
  locale = "ar",
  sectionConfig,
}: HeroProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ExploreArrow = isRtl ? ArrowDownLeft : ArrowDownRight;
  const ContactArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  const localizedProfile = getLocalizedProfile(profile, locale);
  const featuredSlug = featuredProject ? getProjectSlug(featuredProject) : null;
  const featuredTitle = featuredProject
    ? getLocalizedProjectTitle(featuredProject, locale)
    : dict.hero.selectedPieceFallback;

  // Custom CMS Section overrides if configured
  const heroEyebrow =
    locale === "en"
      ? sectionConfig?.eyebrowEn || dict.hero.editionLabel
      : sectionConfig?.eyebrow || dict.hero.editionLabel;

  const heroTagline =
    locale === "en"
      ? sectionConfig?.descriptionEn || dict.hero.studioTagline
      : sectionConfig?.description || dict.hero.studioTagline;

  const primaryActionLabel =
    locale === "en"
      ? sectionConfig?.actionLabelEn || dict.hero.exploreWorkCta
      : sectionConfig?.actionLabel || dict.hero.exploreWorkCta;

  const primaryActionHref = sectionConfig?.actionHref
    ? `/${locale}${sectionConfig.actionHref.startsWith("/") ? "" : "/"}${sectionConfig.actionHref}`
    : `/${locale}/work`;

  const secondaryActionLabel =
    locale === "en"
      ? sectionConfig?.secondaryActionLabelEn || dict.hero.contactCta
      : sectionConfig?.secondaryActionLabel || dict.hero.contactCta;

  const secondaryActionHref = sectionConfig?.secondaryActionHref
    ? `/${locale}${sectionConfig.secondaryActionHref.startsWith("/") ? "" : "/"}${sectionConfig.secondaryActionHref}`
    : `/${locale}/contact`;

  return (
    <section
      id="home"
      className="relative w-full pt-28 sm:pt-32 pb-16 sm:pb-24 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Top Studio Editorial Meta Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 border-b border-[#EAE6DF]/10 text-xs text-[#777777]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[#D7C9B2] uppercase tracking-wider">
              {heroEyebrow}
            </span>
            <span className="hidden sm:inline text-[#EAE6DF]/20">|</span>
            <span className="hidden sm:inline text-[#EAE6DF]/80">
              {heroTagline}
            </span>
          </div>

          {localizedProfile.location && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#141414] border border-[#EAE6DF]/10 text-[#EAE6DF]">
              <span
                className="w-2 h-2 rounded-full bg-[#D7C9B2]"
                aria-hidden="true"
              />
              <span className="text-[11px]">{localizedProfile.location}</span>
            </div>
          )}
        </div>

        {/* Main Hero Full-Width Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
          {/* Primary Column: Editorial Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 pt-2">
            <div className="space-y-3">
              <p className="text-xs sm:text-sm uppercase tracking-wider text-[#D7C9B2] font-medium">
                {localizedProfile.name} — {localizedProfile.roleSubtitle}
              </p>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold text-[#EAE6DF] tracking-tight leading-[1.1]">
                <span className="block">{localizedProfile.name}</span>
                <span className="font-serif-editorial font-normal text-[#D7C9B2] block text-2xl sm:text-4xl xl:text-5xl mt-3 leading-[1.2]">
                  {localizedProfile.title}
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#777777] leading-relaxed max-w-3xl">
              {localizedProfile.bio}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={primaryActionHref}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-colors"
              >
                <span>{primaryActionLabel}</span>
                <ExploreArrow className="w-4 h-4" />
              </Link>

              <Link
                href={secondaryActionHref}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md border border-[#EAE6DF]/15 bg-[#202020] hover:border-[#D7C9B2] text-[#EAE6DF] hover:text-[#D7C9B2] font-medium text-xs sm:text-sm transition-colors"
              >
                <span>{secondaryActionLabel}</span>
                <ContactArrow className="w-4 h-4" />
              </Link>
            </div>

            {/* Verified Portfolio Statistics */}
            {profile.stats && profile.stats.length > 0 && (
              <div className="pt-8 mt-8 border-t border-[#EAE6DF]/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profile.stats.map((stat, idx) => {
                  const item = getLocalizedStat(stat, locale);
                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-md bg-[#121212] border border-[#EAE6DF]/10"
                    >
                      <div className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#D7C9B2] mb-1">
                        {item.value}
                      </div>
                      <div className="text-xs text-[#777777] font-medium">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secondary Column: Art-Directed Composition */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-12 gap-4 sm:gap-6 items-end">
              {/* Primary Artist Portrait / Studio Frame */}
              <div className="col-span-7 editorial-panel p-2.5 sm:p-3 bg-[#121212] border border-[#EAE6DF]/15">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-[#0A0A0A] flex flex-col items-center justify-center border border-[#D7C9B2]/20">
                  {profile.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profile.avatar}
                      alt={localizedProfile.name}
                      fetchPriority="high"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <span className="font-serif-editorial text-5xl sm:text-6xl text-[#D7C9B2] font-bold">
                        {isRtl ? "خ" : "K"}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#777777] mt-3">
                        {isRtl ? "استوديو الفنان" : "Studio Portrait"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-2.5 px-1 flex items-center justify-between gap-2 text-[11px] text-[#777777]">
                  <span className="text-[#EAE6DF] font-medium truncate">
                    {localizedProfile.name}
                  </span>
                  <span className="text-[#D7C9B2] flex-shrink-0">
                    {dict.hero.portraitBadge}
                  </span>
                </div>
              </div>

              {/* Secondary Art Specimen Card */}
              <div className="col-span-5 space-y-3 sm:space-y-4">
                <div className="editorial-panel p-2 sm:p-2.5 bg-[#141414] border border-[#EAE6DF]/12">
                  <Link
                    href={
                      featuredSlug
                        ? `/${locale}/work/${featuredSlug}`
                        : `/${locale}/work`
                    }
                    className="block group"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-[#0A0A0A] flex flex-col items-center justify-center border border-[#EAE6DF]/10">
                      {featuredProject?.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={featuredProject.image}
                          alt={featuredTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <span className="text-[10px] uppercase font-mono text-[#D7C9B2] block mb-1">
                            {isRtl ? "في انتظار الأعمال" : "Gallery Ready"}
                          </span>
                          <span className="text-[11px] text-[#777777] block">
                            {isRtl ? "أضف عملك الأول من لوحة التحكم" : "Add artwork via CMS"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 px-1">
                      <span className="text-[10px] uppercase text-[#D7C9B2] block">
                        {dict.hero.selectedPieceLabel}
                      </span>
                      <p className="text-[11px] text-[#EAE6DF] font-medium truncate mt-0.5">
                        {featuredTitle}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="p-3.5 sm:p-4 rounded-md bg-[#202020] border border-[#EAE6DF]/10 text-xs space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#D7C9B2] block font-medium">
                    {dict.hero.disciplinesHeading}
                  </span>
                  <p className="text-[#EAE6DF] font-medium leading-snug text-[11px]">
                    {dict.hero.disciplinesSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
