"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary, Locale } from "@/lib/portfolio";
import { ArrowRight, ArrowLeft, Home } from "lucide-react";

export default function LocalizedProjectNotFound() {
  const pathname = usePathname() || "/ar";
  const locale: Locale = pathname.startsWith("/en") ? "en" : "ar";
  const dict = getDictionary(locale);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#0A0A0A] text-[#EAE6DF]">
      <Navbar activePath="/work" locale={locale} />

      <section className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="max-w-lg w-full editorial-panel p-8 sm:p-12 bg-[#121212] text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded bg-[#202020] text-[#D7C9B2] font-mono text-xs uppercase tracking-widest border border-[#EAE6DF]/10">
            {dict.notFound.badge}
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#EAE6DF]">
              {dict.notFound.projectTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              {dict.notFound.projectDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/${locale}/work`}
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <BackIcon className="w-4 h-4" />
              <span>{dict.notFound.backWorkBtn}</span>
            </Link>

            <Link
              href={`/${locale}`}
              className="w-full sm:w-auto px-6 py-3 rounded border border-[#EAE6DF]/15 bg-[#202020] hover:border-[#D7C9B2] text-[#EAE6DF] font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4 text-[#D7C9B2]" />
              <span>{dict.notFound.backHomeBtn}</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

