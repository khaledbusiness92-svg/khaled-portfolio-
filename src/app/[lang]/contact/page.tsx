import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  isValidLocale,
  getDictionary,
  getLocalizedProfile,
  Locale,
} from "@/lib/portfolio";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

interface ContactPageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "ar";
  const dict = getDictionary(locale);

  const data = await getPortfolioData();
  const contactConfig = data.pages?.contact;

  return {
    title:
      locale === "en"
        ? contactConfig?.titleEn || dict.meta.contactTitle
        : contactConfig?.title || dict.meta.contactTitle,
    description:
      locale === "en"
        ? contactConfig?.seoDescriptionEn || dict.meta.contactDescription
        : contactConfig?.seoDescription || dict.meta.contactDescription,
    alternates: {
      languages: {
        ar: "/ar/contact",
        en: "/en/contact",
      },
    },
  };
}


export default async function LocalizedContactPage({
  params,
}: ContactPageProps) {
  const { lang: rawLang } = await params;
  if (!isValidLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;
  const dict = getDictionary(locale);

  const data = await getPortfolioData();
  const localizedProfile = getLocalizedProfile(data.profile, locale);

  const contactPage = data.pages?.contact;
  const headerSection = contactPage?.sections?.find(
    (s) => s.type === "page_header" || s.id === "contact_header"
  );

  const kicker =
    locale === "en"
      ? headerSection?.eyebrowEn || dict.contactPage.kicker
      : headerSection?.eyebrow || dict.contactPage.kicker;

  const title =
    locale === "en"
      ? headerSection?.titleEn || dict.contactPage.title
      : headerSection?.title || dict.contactPage.title;

  const titleAccent =
    locale === "en"
      ? headerSection?.titleAccentEn || dict.contactPage.titleAccent
      : headerSection?.titleAccent || dict.contactPage.titleAccent;

  const description =
    locale === "en"
      ? headerSection?.descriptionEn || dict.contactPage.description
      : headerSection?.description || dict.contactPage.description;

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden">
      <Navbar
        activePath="/contact"
        locale={locale}
        brand={data.brand}
        navigation={data.navigation}
      />

      <PageHeader
        kicker={kicker}
        title={title}
        titleAccent={titleAccent}
        description={description}
        metaLabel={dict.contactPage.locationLabel}
        metaText={localizedProfile.location}
      />

      <ContactSection contact={data.profile.contact} locale={locale} />
      <Footer
        contact={data.profile.contact}
        locale={locale}
        brand={data.brand}
        footer={data.footer}
      />
    </main>
  );
}
