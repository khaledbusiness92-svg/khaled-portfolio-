import fs from "fs";
import path from "path";
import {
  PortfolioData,
  BrandSettings,
  SiteSettings,
  NavigationItem,
  FooterSettings,
  PageConfig,
  MediaAsset,
  RevisionSnapshot,
} from "./types";
import { ensureAdminAuth } from "./auth-server";
import { getSupabaseAdmin } from "./supabase";

const dataFilePath = path.join(process.cwd(), "src", "data", "portfolio.json");
const publicDir = path.join(process.cwd(), "public");

let inMemoryData: PortfolioData | null = null;

const DEFAULT_BRAND: BrandSettings = {
  siteName: "خالد محمد عبد السميع",
  siteNameEn: "Khaled Mohamed Abdel Samee",
  tagline: "فنان رقمي ومصمم بصري",
  taglineEn: "Digital Artist & Visual Creator",
  logoType: "both",
  monogramText: "خ",
  monogramTextEn: "K",
  logoHeightDesktop: 34,
  logoHeightMobile: 28,
  primaryColor: "#D7C9B2",
  surfaceColor: "#0A0A0A",
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  defaultLocale: "ar",
  enableEnglish: true,
  enableArabic: true,
  maintenanceMode: false,
  contactEmail: "khaled.abdelsamie.design@gmail.com",
};

const DEFAULT_NAVIGATION: NavigationItem[] = [
  { id: "nav-home", href: "/", label: "الرئيسية", labelEn: "Home", visible: true, order: 1 },
  { id: "nav-work", href: "/work", label: "المعرض", labelEn: "Work", visible: true, order: 2 },
  { id: "nav-about", href: "/about", label: "عن الفنان", labelEn: "About", visible: true, order: 3 },
  { id: "nav-contact", href: "/contact", label: "تواصل", labelEn: "Contact", visible: true, order: 4 },
];

const DEFAULT_FOOTER: FooterSettings = {
  bioSummary:
    "استوديو شخصي للفن الرقمي، رسم البورتريه والمانجا، وتصميم الإعلانات التجارية للمطاعم والعلامات التجارية.",
  bioSummaryEn:
    "Personal creative studio specializing in digital illustration, portraits, manga art, and commercial advertising for restaurants and brands.",
  copyrightText: "جميع الحقوق محفوظة © ٢٠٢٦ خالد محمد عبد السميع.",
  copyrightTextEn: "© 2026 Khaled Mohamed Abdel Samee. All rights reserved.",
  showSocialLinks: true,
  showContactChannels: true,
  showSitemap: true,
  links: [
    { id: "f-home", href: "/", label: "الرئيسية", labelEn: "Home", visible: true, order: 1 },
    { id: "f-work", href: "/work", label: "معرض الأعمال الكامل", labelEn: "Complete Work Archive", visible: true, order: 2 },
    { id: "f-about", href: "/about", label: "عن الفنان والسيرة الفنية", labelEn: "About the Artist", visible: true, order: 3 },
    { id: "f-contact", href: "/contact", label: "تواصل مباشر", labelEn: "Direct Contact", visible: true, order: 4 },
  ],
};

function getDefaultPages(): Record<string, PageConfig> {
  const now = new Date().toISOString();
  return {
    home: {
      id: "home",
      slug: "/",
      title: "الرئيسية — الاستوديو الإبداعي",
      titleEn: "Home — Creative Studio",
      seoDescription:
        "الاستوديو الإبداعي ومعرض الأعمال الرسمي للفنان الرقمي والمصمم خالد محمد عبد السميع.",
      seoDescriptionEn:
        "Official creative studio and portfolio of digital artist Khaled Mohamed Abdel Samee.",
      published: true,
      updatedAt: now,
      sections: [
        {
          id: "hero",
          type: "hero",
          enabled: true,
          order: 1,
          eyebrow: "الإصدار الفني / ٢٠٢٦",
          eyebrowEn: "Studio Edition / 2026",
          title: "خالد محمد عبد السميع",
          titleEn: "Khaled Mohamed Abdel Samee",
          description:
            "الرسم الرقمي، البورتريه، والتوجيه الفني للإعلانات التجارية",
          descriptionEn:
            "Digital Illustration, Portraits & Commercial Art Direction",
          actionLabel: "استكشف الأعمال المختارة",
          actionLabelEn: "Explore Selected Work",
          actionHref: "/work",
          secondaryActionLabel: "تواصل معي",
          secondaryActionLabelEn: "Get in Touch",
          secondaryActionHref: "/contact",
        },
        {
          id: "selected_works",
          type: "selected_works",
          enabled: true,
          order: 2,
          eyebrow: "مختارات من المعرض",
          eyebrowEn: "Selected Works",
          title: "أعمال مختارة في",
          titleEn: "Curated Works in",
          titleAccent: "الفن الرقمي والإعلان التجاري",
          titleAccentEn: "Digital Illustration & Commercial Art",
          description:
            "مجموعة مختارة من أحدث المشاريع الإعلانية للمطاعم والبراندات، إلى جانب رسومات البورتريه والمانجا والاسكتشات الرقمية.",
          descriptionEn:
            "A curated selection of commercial campaigns for restaurants and fashion brands alongside digital portraits, manga illustrations, and freehand studies.",
          actionLabel: "استعراض الأرشيف الكامل",
          actionLabelEn: "Browse Full Archive",
          actionHref: "/work",
        },
        {
          id: "about_summary",
          type: "about_summary",
          enabled: true,
          order: 3,
          eyebrow: "عن الفنان والرؤية البصرية",
          eyebrowEn: "Artist Profile & Visual Philosophy",
          title: "توازن مدروس بين",
          titleEn: "A Deliberate Balance of",
          titleAccent: "التكوين الفني والرسالة الإعلانية",
          titleAccentEn: "Fine Art Craft & Commercial Impact",
          badge: "+٥ سنوات خبرة",
          badgeEn: "5+ Years Experience",
          actionLabel: "قراءة السيرة الفنية الكاملة",
          actionLabelEn: "Read Full Artist Profile",
          actionHref: "/about",
        },
        {
          id: "skills",
          type: "skills",
          enabled: true,
          order: 4,
          eyebrow: "الأدوات والقدرات الفنية",
          eyebrowEn: "Tools & Creative Capabilities",
          title: "برامج التصميم",
          titleEn: "Design Software &",
          titleAccent: "والمهارات الاحترافية",
          titleAccentEn: "Professional Skills",
          description:
            "الأدوات الرقمية والتقنيات الفنية المعتمدة في تنفيذ الرسومات والحملات الإعلانية وإدارة المشاريع.",
          descriptionEn:
            "Digital illustration software, fine art foundations, and project management capabilities used across commercial and personal commissions.",
        },
        {
          id: "contact_cta",
          type: "contact_cta",
          enabled: true,
          order: 5,
          eyebrow: "التعاون والمشاريع الإبداعية",
          eyebrowEn: "Commissions & Collaborations",
          title: "هل تبحث عن رؤية فنية خاصة",
          titleEn: "Looking for Bespoke Art Direction",
          titleAccent: "لمشروعك القادم؟",
          titleAccentEn: "for Your Next Project?",
          description:
            "متاح لتنفيذ الحملات الإعلانية للمطاعم والعلامات التجارية، والرسومات الرقمية الخاصة، البورتريه، المانجا، وتصميم الجداريات.",
          descriptionEn:
            "Available for restaurant and fashion advertising campaigns, custom digital illustrations, portraits, manga art, and mural design.",
          actionLabel: "تواصل عبر واتساب",
          actionLabelEn: "Chat on WhatsApp",
          secondaryActionLabel: "صفحة التواصل الكاملة",
          secondaryActionLabelEn: "Full Contact Page",
          secondaryActionHref: "/contact",
        },
      ],
    },
    work: {
      id: "work",
      slug: "/work",
      title: "معرض الأعمال الكامل",
      titleEn: "Complete Work Archive",
      seoDescription:
        "تصفح كافة الأعمال الفنية والتصميمات الإعلانية للفنان خالد محمد عبد السميع.",
      seoDescriptionEn:
        "Browse the complete portfolio of digital artist Khaled Mohamed Abdel Samee.",
      published: true,
      updatedAt: now,
      sections: [
        {
          id: "work_header",
          type: "page_header",
          enabled: true,
          order: 1,
          eyebrow: "الأرشيف الكامل للمشاريع",
          eyebrowEn: "Complete Portfolio Archive",
          title: "معرض الأعمال",
          titleEn: "Selected & Complete",
          titleAccent: "والإصدارات البصرية",
          titleAccentEn: "Visual Works",
          description:
            "تصفح جميع الأعمال المنفذة في الإعلانات التجارية للمطاعم والأزياء، إلى جانب لوحات البورتريه، المانجا، الكاريكاتير، والاسكتشات الرقمية.",
          descriptionEn:
            "Explore all commercial campaigns for restaurants and fashion labels alongside digital portraits, manga character art, caricatures, and anatomical sketches.",
        },
        {
          id: "gallery_grid",
          type: "gallery_grid",
          enabled: true,
          order: 2,
        },
        {
          id: "work_contact_cta",
          type: "contact_cta",
          enabled: true,
          order: 3,
        },
      ],
    },
    about: {
      id: "about",
      slug: "/about",
      title: "عن الفنان والسيرة الفنية",
      titleEn: "About the Artist",
      seoDescription:
        "تعرف على الفنان الرقمي والمصمم خالد محمد عبد السميع — التخصصات الفنية والخبرات.",
      seoDescriptionEn:
        "Learn about digital artist and visual creator Khaled Mohamed Abdel Samee.",
      published: true,
      updatedAt: now,
      sections: [
        {
          id: "about_header",
          type: "page_header",
          enabled: true,
          order: 1,
          eyebrow: "السيرة الفنية والمنهج البصري",
          eyebrowEn: "Artist Profile & Creative Practice",
          title: "خالد محمد عبد السميع",
          titleEn: "Khaled Mohamed Abdel Samee",
          titleAccent: "فنان رقمي ومصمم بصري",
          titleAccentEn: "Digital Artist & Visual Creator",
          description: "مصمم جرافيك ورسام رقمي",
          descriptionEn: "Digital Artist & Visual Creator",
        },
        {
          id: "about_content",
          type: "about_full",
          enabled: true,
          order: 2,
        },
        {
          id: "about_skills",
          type: "skills",
          enabled: true,
          order: 3,
        },
        {
          id: "about_highlights",
          type: "selected_works",
          enabled: true,
          order: 4,
          eyebrow: "نماذج من الأعمال",
          eyebrowEn: "Selected Archive",
          title: "أعمال مختارة من المعرض",
          titleEn: "Highlighted Works from the Studio",
        },
        {
          id: "about_contact_cta",
          type: "contact_cta",
          enabled: true,
          order: 5,
        },
      ],
    },
    contact: {
      id: "contact",
      slug: "/contact",
      title: "تواصل معي",
      titleEn: "Contact & Commissions",
      seoDescription:
        "تواصل مباشرة مع الفنان والمصمم خالد محمد عبد السميع لمناقشة مشاريع التصميم والرسم.",
      seoDescriptionEn:
        "Get in touch directly with digital artist Khaled Mohamed Abdel Samee.",
      published: true,
      updatedAt: now,
      sections: [
        {
          id: "contact_header",
          type: "page_header",
          enabled: true,
          order: 1,
          eyebrow: "التواصل وطلبات المشاريع",
          eyebrowEn: "Direct Contact & Commissions",
          title: "لنبدأ الحديث عن",
          titleEn: "Let’s Discuss Your",
          titleAccent: "مشروعك الإبداعي القادم",
          titleAccentEn: "Next Creative Project",
          description:
            "سواء كنت تبحث عن حملة إعلانية لمطعم أو علامة ملابس، أو ترغب في رسم لوحة بورتريه، مانجا، أو جدارية فنية، يسعدني تواصلك المباشر.",
          descriptionEn:
            "Whether you are planning an advertising campaign for a restaurant or clothing brand, or commissioning a custom portrait, manga illustration, or mural, reach out directly below.",
        },
        {
          id: "contact_body",
          type: "contact_full",
          enabled: true,
          order: 2,
        },
      ],
    },
  };
}

/**
 * Automatically catalogs files from public/images and public/uploads into MediaAssets
 */
function scanExistingMedia(existingMedia?: MediaAsset[]): MediaAsset[] {
  const mediaMap = new Map<string, MediaAsset>();

  if (existingMedia && Array.isArray(existingMedia)) {
    for (const m of existingMedia) {
      if (m.url) mediaMap.set(m.url, m);
    }
  }

  const scanFolder = (dir: string, basePublicPath: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanFolder(fullPath, `${basePublicPath}/${entry.name}`);
      } else if (
        /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(entry.name) &&
        !entry.name.startsWith(".")
      ) {
        const publicUrl = `${basePublicPath}/${entry.name}`;
        if (!mediaMap.has(publicUrl)) {
          let size = 0;
          try {
            size = fs.statSync(fullPath).size;
          } catch {
            // ignore
          }
          const ext = path.extname(entry.name).toLowerCase();
          const mimeType =
            ext === ".png"
              ? "image/png"
              : ext === ".webp"
              ? "image/webp"
              : ext === ".svg"
              ? "image/svg+xml"
              : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";

          const cleanBase = path.parse(entry.name).name.replace(/[-_]/g, " ");

          mediaMap.set(publicUrl, {
            id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            filename: entry.name,
            url: publicUrl,
            mimeType,
            sizeBytes: size,
            alt: cleanBase,
            altEn: cleanBase,
            uploadedAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  scanFolder(path.join(publicDir, "images"), "/images");
  scanFolder(path.join(publicDir, "uploads"), "/uploads");

  return Array.from(mediaMap.values());
}

export async function getPortfolioDataAsync(): Promise<PortfolioData> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_data")
        .select("data")
        .eq("id", "main")
        .single();

      if (!error && data?.data) {
        inMemoryData = data.data as PortfolioData;
        return inMemoryData;
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local:", err);
    }
  }
  return getPortfolioData();
}

export function getPortfolioData(): PortfolioData {
  if (inMemoryData) {
    return inMemoryData;
  }
  try {
    if (!fs.existsSync(dataFilePath)) {
      throw new Error("Portfolio data file does not exist");
    }
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    const data: PortfolioData = JSON.parse(raw);

    let needsSave = false;

    // 1. Ensure Auth Security
    if (ensureAdminAuth(data)) {
      needsSave = true;
    }

    // 2. Ensure Brand Settings
    if (!data.brand) {
      data.brand = { ...DEFAULT_BRAND };
      needsSave = true;
    }

    // 3. Ensure Site Settings
    if (!data.siteSettings) {
      data.siteSettings = { ...DEFAULT_SITE_SETTINGS };
      needsSave = true;
    }

    // 4. Ensure Navigation
    if (!data.navigation || data.navigation.length === 0) {
      data.navigation = [...DEFAULT_NAVIGATION];
      needsSave = true;
    }

    // 5. Ensure Footer Settings
    if (!data.footer) {
      data.footer = { ...DEFAULT_FOOTER };
      needsSave = true;
    }

    // 6. Ensure Pages
    if (!data.pages || Object.keys(data.pages).length === 0) {
      data.pages = getDefaultPages();
      needsSave = true;
    }

    // 7. Ensure Media Catalog
    if (!data.media || data.media.length === 0) {
      data.media = scanExistingMedia(data.media);
      needsSave = true;
    }

    // 8. Ensure Revisions array
    if (!data.revisions) {
      data.revisions = [];
      needsSave = true;
    }

    // 9. Ensure projects have published flag & order
    if (data.projects && Array.isArray(data.projects)) {
      data.projects.forEach((p, idx) => {
        if (p.published === undefined) {
          p.published = true;
          needsSave = true;
        }
        if (p.order === undefined) {
          p.order = idx + 1;
          needsSave = true;
        }
      });
    }

    if (needsSave) {
      savePortfolioData(data, "System", "Initial CMS Schema Migration");
    }

    inMemoryData = data;
    return data;
  } catch (error) {
    console.error("Error reading portfolio data:", error);
    throw error;
  }
}

/**
 * Saves data atomically to disk and synchronizes with Supabase database
 */
export async function savePortfolioData(
  data: PortfolioData,
  author = "Admin",
  summary = "Content update"
): Promise<void> {
  // Update in-memory state immediately
  inMemoryData = data;

  try {
    // Record revision snapshot (keep up to 25 latest)
    if (!data.revisions) {
      data.revisions = [];
    }

    const snapshot: RevisionSnapshot = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author,
      summary,
      snapshot: {
        brand: data.brand ? { ...data.brand } : undefined,
        profile: data.profile ? { ...data.profile } : undefined,
        projectsCount: data.projects ? data.projects.length : 0,
        pagesUpdated: data.pages ? Object.keys(data.pages) : [],
      },
    };

    data.revisions.unshift(snapshot);
    if (data.revisions.length > 25) {
      data.revisions = data.revisions.slice(0, 25);
    }

    // 1. Try local filesystem write (for local dev, Docker, VPS)
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const tempFilePath = `${dataFilePath}.tmp`;
      fs.writeFileSync(tempFilePath, jsonString, "utf-8");
      fs.renameSync(tempFilePath, dataFilePath);
    } catch {
      // In serverless environments (Vercel), filesystem may be read-only; Supabase is the primary store
    }

    // 2. Persist to Supabase database if configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error: upsertErr } = await supabase
          .from("portfolio_data")
          .upsert({
            id: "main",
            data,
            updated_at: new Date().toISOString(),
          });
        if (upsertErr) {
          console.error("Supabase database save error:", upsertErr.message);
        }
      } catch (sbErr) {
        console.error("Supabase database connection error:", sbErr);
      }
    }
  } catch (error) {
    console.error("Error saving portfolio data:", error);
    throw error;
  }
}

/**
 * Checks if a given media URL is referenced in projects, profile, brand, or pages
 */
export function findMediaUsage(
  data: PortfolioData,
  mediaUrl: string
): {
  isUsed: boolean;
  locations: string[];
} {
  const locations: string[] = [];

  if (data.brand?.logoUrl === mediaUrl) locations.push("Brand: Primary Logo");
  if (data.brand?.logoLightUrl === mediaUrl) locations.push("Brand: Light Logo");
  if (data.brand?.logoDarkUrl === mediaUrl) locations.push("Brand: Dark Logo");
  if (data.brand?.faviconUrl === mediaUrl) locations.push("Brand: Favicon");
  if (data.profile?.avatar === mediaUrl) locations.push("Profile: Avatar");
  if (data.profile?.heroBg === mediaUrl) locations.push("Profile: Hero Background");

  if (data.projects) {
    for (const proj of data.projects) {
      if (proj.image === mediaUrl) {
        locations.push(`Project: ${proj.title} (Cover)`);
      }
      if (proj.thumbnail === mediaUrl) {
        locations.push(`Project: ${proj.title} (Thumbnail)`);
      }
      if (proj.gallery && proj.gallery.includes(mediaUrl)) {
        locations.push(`Project: ${proj.title} (Gallery)`);
      }
    }
  }

  if (data.pages) {
    for (const [pageKey, page] of Object.entries(data.pages)) {
      if (page.ogImage === mediaUrl) {
        locations.push(`Page [${pageKey}]: OG Image`);
      }
      for (const sec of page.sections) {
        if (sec.backgroundImage === mediaUrl) {
          locations.push(`Page [${pageKey}] Section [${sec.id}]: Background`);
        }
      }
    }
  }

  return {
    isUsed: locations.length > 0,
    locations,
  };
}
