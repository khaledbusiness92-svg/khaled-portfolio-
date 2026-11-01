import {
  SkillCategory,
  Locale,
  getDictionary,
  getLocalizedSkillGroupTitle,
  getLocalizedSkillItem,
} from "@/lib/portfolio";
import { Wrench, Palette, Award } from "lucide-react";
import SectionHeading from "./SectionHeading";
import MotionReveal from "./MotionReveal";

interface SkillsProps {
  skills: SkillCategory[];
  locale?: Locale;
}

export default function SkillsSection({
  skills,
  locale = "ar",
}: SkillsProps) {
  const dict = getDictionary(locale);

  const getCategoryIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Wrench className="w-4 h-4 text-[#D7C9B2]" />;
      case 1:
        return <Palette className="w-4 h-4 text-[#D7C9B2]" />;
      default:
        return <Award className="w-4 h-4 text-[#D7C9B2]" />;
    }
  };

  return (
    <section
      id="skills"
      className="w-full py-20 sm:py-28 border-b border-[#EAE6DF]/10 bg-[#0A0A0A]"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <SectionHeading
          locale={locale}
          index="03"
          eyebrow={dict.skills.eyebrow}
          title={dict.skills.title}
          titleAccent={dict.skills.titleAccent}
          description={dict.skills.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {skills.map((skillGroup, idx) => {
            const groupTitle = getLocalizedSkillGroupTitle(skillGroup, locale);
            return (
              <MotionReveal
                key={idx}
                direction="up"
                delayMs={idx * 120}
                durationMs={750}
              >
                <div
                  className="editorial-panel hover-editorial-lift p-6 sm:p-8 bg-[#121212] border border-[#EAE6DF]/12 flex flex-col justify-between h-full"
                >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EAE6DF]/10">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#D7C9B2] block mb-1 font-medium">
                        {dict.skills.groupPrefix(idx)}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#EAE6DF]">
                        {groupTitle}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded bg-[#202020] border border-[#EAE6DF]/10 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(idx)}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {skillGroup.items.map((rawItem, itemIdx) => {
                      const item = getLocalizedSkillItem(rawItem, locale);
                      return (
                        <div key={itemIdx} className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
                            <span className="font-medium text-[#EAE6DF]">
                              {item.name}
                            </span>
                            <span className="text-[#777777] text-xs flex-shrink-0">
                              {item.level}
                            </span>
                          </div>

                          {/* Subtle Restrained Editorial Progress Bar */}
                          <div
                            className="w-full h-1.5 rounded-sm bg-[#202020] overflow-hidden"
                            role="progressbar"
                            aria-label={item.name}
                            aria-valuenow={item.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="h-full bg-[#D7C9B2] transition-all duration-1000 ease-[var(--ease-editorial)]"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </MotionReveal>
          );
        })}
        </div>
      </div>
    </section>
  );
}
