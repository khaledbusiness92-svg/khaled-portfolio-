import Link from "next/link";
import {
  ContactInfo,
  Locale,
  getDictionary,
} from "@/lib/portfolio";
import {
  ArrowUpLeft,
  ArrowUpRight,
  MessageCircle,
  Mail,
  MapPin,
} from "lucide-react";
import SocialLinks from "./SocialLinks";

interface ContactCTAProps {
  contact: ContactInfo;
  locale?: Locale;
}

export default function ContactCTA({
  contact,
  locale = "ar",
}: ContactCTAProps) {
  const dict = getDictionary(locale);
  const isRtl = locale === "ar";
  const ActionArrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const cleanPhone = contact.whatsapp.replace(/[^0-9]/g, "");

  const localizedLocation =
    locale === "en"
      ? contact.locationEn ||
        "Egypt — Available for Freelance & Remote Collaboration"
      : contact.location
          ?.replace(/\s*\([A-Za-z\s&]+\)\s*/g, "")
          .trim() || "مصر — متاح للعمل الحر والتعاون عن بُعد";

  return (
    <section
      id="contact-cta"
      aria-labelledby="contact-cta-heading"
      className="w-full py-20 sm:py-28 border-t border-[#EAE6DF]/10 bg-[#0A0A0A]"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="editorial-panel p-8 sm:p-12 lg:p-16 border border-[#EAE6DF]/12 bg-[#121212] relative overflow-hidden">
          {/* Subtle top editorial rule */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-[#EAE6DF]/10 text-xs text-[#777777]">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full bg-[#D7C9B2]"
                aria-hidden="true"
              />
              <span className="uppercase tracking-wider text-[#D7C9B2] font-medium">
                {dict.contactCta.eyebrow}
              </span>
            </div>
            {localizedLocation && (
              <div className="flex items-center gap-1.5 text-[#777777]">
                <MapPin className="w-3.5 h-3.5 text-[#D7C9B2]" />
                <span>{localizedLocation}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-5">
              <h2
                id="contact-cta-heading"
                className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#EAE6DF] tracking-tight leading-[1.15]"
              >
                {dict.contactCta.title}{" "}
                <span className="font-serif-editorial font-normal text-[#D7C9B2] block sm:inline">
                  {dict.contactCta.titleAccent}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[#777777] max-w-3xl leading-relaxed">
                {dict.contactCta.description}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-[#D7C9B2] text-[#0A0A0A] font-bold text-xs sm:text-sm hover:bg-[#EAE6DF] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{dict.contactCta.whatsappBtn}</span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md border border-[#EAE6DF]/15 bg-[#202020] text-[#EAE6DF] hover:border-[#D7C9B2] hover:text-[#D7C9B2] font-medium text-xs sm:text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#D7C9B2]" />
                  <span>{dict.contactCta.emailBtn}</span>
                </a>

                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md border border-transparent text-[#EAE6DF] hover:text-[#D7C9B2] text-xs sm:text-sm font-medium transition-colors"
                >
                  <span>{dict.contactCta.fullContactPageBtn}</span>
                  <ActionArrow className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 lg:border-s border-[#EAE6DF]/10 lg:ps-8 space-y-4">
              <p className="text-xs uppercase tracking-wider text-[#777777]">
                {dict.contactCta.directChannelsHeading}
              </p>
              <SocialLinks contact={contact} locale={locale} variant="compact" />
              <p className="text-xs text-[#777777] font-mono pt-1" dir="ltr">
                {contact.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
