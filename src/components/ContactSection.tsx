"use client";

import { useState } from "react";
import {
  ContactInfo,
  Locale,
  getDictionary,
} from "@/lib/portfolio";
import {
  MessageCircle,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import SocialLinks from "./SocialLinks";

interface ContactProps {
  contact: ContactInfo;
  locale?: Locale;
}

export default function ContactSection({
  contact,
  locale = "ar",
}: ContactProps) {
  const dict = getDictionary(locale);
  const serviceOptions = dict.contactPage.serviceOptions;

  const [name, setName] = useState("");
  const [service, setService] = useState<string>(serviceOptions[0]);
  const [prevLocale, setPrevLocale] = useState<Locale>(locale);
  const [message, setMessage] = useState("");
  const [openedWhatsApp, setOpenedWhatsApp] = useState(false);

  if (locale !== prevLocale) {
    setPrevLocale(locale);
    setService(serviceOptions[0]);
  }

  const cleanPhone = contact.whatsapp.replace(/[^0-9]/g, "");

  const localizedLocation =
    locale === "en"
      ? contact.locationEn ||
        "Egypt — Available for Freelance & Remote Collaboration"
      : contact.location
      ? contact.location.replace(/\s*\([A-Za-z\s&]+\)\s*/g, "").trim()
      : "مصر — متاح للعمل الحر والتعاون عن بُعد";

  const handleWhatsAppPrepare = (e: React.FormEvent) => {
    e.preventDefault();
    const text = dict.contactPage.whatsappMessageTemplate(
      name,
      service,
      message
    );
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpenedWhatsApp(true);
  };

  return (
    <section
      id="contact"
      className="w-full py-16 sm:py-24 bg-[#0A0A0A] border-b border-[#EAE6DF]/10"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* Direct Verified Channels Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D7C9B2] block">
                {dict.contactPage.channelsEyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#EAE6DF]">
                {dict.contactPage.channelsTitle}
              </h2>
              <p className="text-sm text-[#777777] leading-relaxed">
                {dict.contactPage.channelsDesc}
              </p>
            </div>

            {/* Social & Contact Cards */}
            <SocialLinks contact={contact} variant="cards" locale={locale} />

            {/* Location / Availability Card */}
            <div className="editorial-panel p-5 bg-[#121212] border border-[#EAE6DF]/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-[#202020] border border-[#EAE6DF]/10 flex items-center justify-center text-[#D7C9B2] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#777777] block">
                  {dict.contactPage.locationLabel}
                </span>
                <p className="text-sm font-bold text-[#EAE6DF]">
                  {localizedLocation}
                </p>
              </div>
            </div>

            {/* Mobile Quick Action Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 rounded bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{dict.contactPage.whatsappActionBtn}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="py-3.5 px-4 rounded border border-[#EAE6DF]/15 bg-[#202020] hover:border-[#D7C9B2] text-[#EAE6DF] hover:text-[#D7C9B2] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4 text-[#D7C9B2]" />
                <span>{dict.contactPage.emailActionBtn}</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Direct Brief Composer */}
          <div className="lg:col-span-7">
            <div className="editorial-panel p-6 sm:p-10 bg-[#121212] border border-[#EAE6DF]/12">
              <div className="pb-6 mb-6 border-b border-[#EAE6DF]/10">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D7C9B2] block mb-1.5">
                  {dict.contactPage.composerEyebrow}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#EAE6DF]">
                  {dict.contactPage.composerTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] mt-1">
                  {dict.contactPage.composerDesc}
                </p>
              </div>

              <form onSubmit={handleWhatsAppPrepare} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#EAE6DF] mb-2"
                    >
                      {dict.contactPage.nameLabel}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder={dict.contactPage.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-[#0A0A0A] text-[#EAE6DF] placeholder:text-[#777777] text-sm border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-service"
                      className="block text-xs font-medium text-[#EAE6DF] mb-2"
                    >
                      {dict.contactPage.serviceLabel}
                    </label>
                    <select
                      id="contact-service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-[#0A0A0A] text-[#EAE6DF] text-sm border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] transition-colors"
                    >
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-[#EAE6DF] mb-2"
                  >
                    {dict.contactPage.messageLabel}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder={dict.contactPage.messagePlaceholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded bg-[#0A0A0A] text-[#EAE6DF] placeholder:text-[#777777] text-sm border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{dict.contactPage.submitBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                </button>

                {openedWhatsApp && (
                  <div
                    role="status"
                    className="flex items-center gap-2.5 p-3.5 rounded bg-[#202020] text-[#D7C9B2] text-xs border border-[#D7C9B2]/35"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{dict.contactPage.statusSuccess}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
