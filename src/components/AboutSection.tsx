import Link from "next/link";
import {
  ProfileData,
  Locale,
  getDictionary,
  getLocalizedProfile,
} from "@/lib/portfolio";
import {
  Utensils,
  Shirt,
  Pencil,
  User,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

interface AboutProps {
  profile: ProfileData;
  locale?: Locale;
  showLinkToAboutPage?: boolean;
}

const DISCIPLINE_ICONS = {
  restaurant: Utensils,
  clothing: Shirt,
  sketches: Pencil,
  portraits: User,
} as const;

export default function AboutSection({
  profile,
  locale = "ar",
  showLinkToAboutPage = true,
}: AboutProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const localizedProfile = getLocalizedProfile(profile, locale);

  return (
    <section
      id="about"
      className="w-full py-20 sm:py-28 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <SectionHeading
          locale={locale}
          index="02"
          eyebrow={dict.about.eyebrow}
          title={dict.about.title}
          titleAccent={dict.about.titleAccent}
          description={localizedProfile.bio}
          actionHref={showLinkToAboutPage ? `/${locale}/about` : undefined}
          actionLabel={
            showLinkToAboutPage ? dict.about.readFullBioBtn : undefined
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* Portrait & Identity Column */}
          <div className="lg:col-span-4">
            <div className="editorial-panel p-4 sm:p-5 bg-[#121212] border border-[#EAE6DF]/12 space-y-4">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[4px] bg-[#0A0A0A] flex flex-col items-center justify-center border border-[#D7C9B2]/20">
                {profile.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.avatar}
                    alt={localizedProfile.name}
                    loading="lazy"
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

              <div className="pt-2 border-t border-[#EAE6DF]/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#EAE6DF] truncate">
                    {localizedProfile.name}
                  </h3>
                  <p className="text-xs text-[#D7C9B2] mt-0.5 truncate">
                    {localizedProfile.roleSubtitle}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#202020] text-[#D7C9B2] text-xs border border-[#EAE6DF]/10 flex-shrink-0">
                  {dict.about.experienceBadge}
                </span>
              </div>
            </div>
          </div>

          {/* Disciplines & Artistic Approach Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="editorial-panel p-6 sm:p-8 bg-[#121212] border border-[#EAE6DF]/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF]/10 pb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#EAE6DF]">
                  {dict.about.approachTitle}
                </h3>
                <span className="text-xs uppercase text-[#777777]">
                  {dict.about.approachBadge}
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#EAE6DF]/85 leading-relaxed">
                {dict.about.approachBody}
              </p>

              {showLinkToAboutPage && (
                <div className="pt-2">
                  <Link
                    href={`/${locale}/about`}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D7C9B2] hover:text-[#EAE6DF] transition-colors"
                  >
                    <span>{dict.about.exploreAboutLink}</span>
                    <ActionArrow className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* 4 Disciplines Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {dict.about.disciplines.map((item) => {
                const IconComponent =
                  DISCIPLINE_ICONS[
                    item.id as keyof typeof DISCIPLINE_ICONS
                  ] || User;
                return (
                  <div
                    key={item.id}
                    className="editorial-card p-5 sm:p-6 bg-[#121212] flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#777777] font-medium">
                        {item.badge}
                      </span>
                      <div className="w-9 h-9 rounded bg-[#202020] border border-[#EAE6DF]/10 flex items-center justify-center text-[#D7C9B2]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[#EAE6DF] mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EAE6DF]/8">
                      <Link
                        href={`/${locale}/work?category=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D7C9B2] hover:text-[#EAE6DF] transition-colors"
                      >
                        <span>{dict.about.viewCategoryWorks}</span>
                        <ActionArrow className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
