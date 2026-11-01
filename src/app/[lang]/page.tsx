import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-server";
import { isValidLocale, Locale } from "@/lib/portfolio";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PortfolioGallery from "@/components/PortfolioGallery";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}


export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { lang: rawLang } = await params;
  if (!isValidLocale(rawLang)) {
    notFound();
  }
  const locale: Locale = rawLang;

  const data = await getPortfolioData();
  const featuredProject =
    data.projects.find((p) => p.featured) || data.projects[0];

  const homePage = data.pages?.home;
  const sections = (homePage?.sections || [
    { id: "hero", type: "hero", enabled: true, order: 1 },
    { id: "selected_works", type: "selected_works", enabled: true, order: 2 },
    { id: "about_summary", type: "about_summary", enabled: true, order: 3 },
    { id: "skills", type: "skills", enabled: true, order: 4 },
    { id: "contact_cta", type: "contact_cta", enabled: true, order: 5 },
  ])
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF] relative overflow-x-hidden">
      <Navbar
        activePath="/"
        locale={locale}
        brand={data.brand}
        navigation={data.navigation}
      />

      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <Hero
                key={section.id}
                profile={data.profile}
                featuredProject={featuredProject}
                locale={locale}
                sectionConfig={section}
              />
            );
          case "selected_works":
            return (
              <PortfolioGallery
                key={section.id}
                initialProjects={data.projects}
                categories={data.categories}
                mode="preview"
                locale={locale}
                sectionConfig={section}
              />
            );
          case "about_summary":
            return (
              <AboutSection
                key={section.id}
                profile={data.profile}
                showLinkToAboutPage={true}
                locale={locale}
              />
            );
          case "skills":
            return (
              <SkillsSection
                key={section.id}
                skills={data.skills}
                locale={locale}
              />
            );
          case "contact_cta":
            return (
              <ContactCTA
                key={section.id}
                contact={data.profile.contact}
                locale={locale}
              />
            );
          default:
            return null;
        }
      })}

      <Footer
        contact={data.profile.contact}
        locale={locale}
        brand={data.brand}
        footer={data.footer}
      />
    </main>
  );
}
