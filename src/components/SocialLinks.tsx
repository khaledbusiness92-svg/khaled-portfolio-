import { ContactInfo, Locale, getDictionary } from "@/lib/portfolio";
import { MessageCircle, Mail, ExternalLink, Globe } from "lucide-react";

interface SocialLinksProps {
  contact: ContactInfo;
  locale?: Locale;
  variant?: "compact" | "cards";
}

export default function SocialLinks({
  contact,
  locale = "ar",
  variant = "compact",
}: SocialLinksProps) {
  const dict = getDictionary(locale);
  const cleanPhone = contact.whatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  const links = [
    {
      id: "whatsapp",
      label: dict.social.whatsappLabel,
      sub: dict.social.whatsappSub,
      value: contact.whatsapp,
      href: whatsappUrl,
      external: true,
      icon: MessageCircle,
      ariaLabel: dict.social.whatsappAria(contact.whatsapp),
      forceLtrValue: true,
    },
    {
      id: "email",
      label: dict.social.emailLabel,
      sub: dict.social.emailSub,
      value: contact.email,
      href: `mailto:${contact.email}`,
      external: false,
      icon: Mail,
      ariaLabel: dict.social.emailAria(contact.email),
      forceLtrValue: true,
    },
    ...(contact.behance
      ? [
          {
            id: "behance",
            label: dict.social.behanceLabel,
            sub: dict.social.behanceSub,
            value: dict.social.behanceValue,
            href: contact.behance,
            external: true,
            icon: Globe,
            ariaLabel: dict.social.behanceAria,
            forceLtrValue: false,
          },
        ]
      : []),
    ...(contact.instagram
      ? [
          {
            id: "instagram",
            label: dict.social.instagramLabel,
            sub: dict.social.instagramSub,
            value: dict.social.instagramValue,
            href: contact.instagram,
            external: true,
            icon: ExternalLink,
            ariaLabel: dict.social.instagramAria,
            forceLtrValue: false,
          },
        ]
      : []),
  ];

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-label={item.ariaLabel}
              className="editorial-card p-5 flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#777777]">
                  <span className="text-[#D7C9B2] font-medium">{item.label}</span>
                  <span>•</span>
                  <span>{item.sub}</span>
                </div>
                <p
                  className="text-sm sm:text-base font-bold text-[#EAE6DF] group-hover:text-[#D7C9B2] transition-colors truncate"
                  dir={item.forceLtrValue ? "ltr" : undefined}
                >
                  {item.value}
                </p>
              </div>
              <div className="w-9 h-9 rounded border border-[#EAE6DF]/10 bg-[#202020] flex items-center justify-center text-[#D7C9B2] group-hover:bg-[#D7C9B2] group-hover:text-[#0A0A0A] transition-colors flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            aria-label={item.ariaLabel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-[#EAE6DF]/12 bg-[#141414] hover:border-[#D7C9B2] text-xs font-medium text-[#EAE6DF] hover:text-[#D7C9B2] transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-[#D7C9B2]" />
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
