export type Locale = "ar" | "en";

export interface StatItem {
  label: string;
  labelEn?: string;
  value: string;
  valueEn?: string;
}

export interface ContactInfo {
  whatsapp: string;
  email: string;
  behance: string;
  instagram: string;
  location: string;
  locationEn?: string;
}

export interface ProfileData {
  name: string;
  nameEn?: string;
  title: string;
  titleEn?: string;
  bio: string;
  bioEn?: string;
  avatar: string;
  heroBg?: string;
  experienceYears?: string;
  experienceYearsEn?: string;
  stats: StatItem[];
  contact: ContactInfo;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  order?: number;
}

export interface SkillItem {
  name: string;
  nameEn?: string;
  level: string;
  levelEn?: string;
  percent: number;
}

export interface SkillCategory {
  category: string;
  categoryEn: string;
  items: SkillItem[];
}

export interface Project {
  id: string;
  slug?: string;
  title: string;
  titleEn?: string;
  category: string;
  image: string;
  thumbnail?: string;
  gallery?: string[];
  driveVideoUrl?: string;
  description: string;
  descriptionEn?: string;
  tools: string[];
  featured?: boolean;
  published?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// CMS Branding & Visual Identity
export interface BrandSettings {
  siteName: string;
  siteNameEn: string;
  tagline: string;
  taglineEn: string;
  logoType: "monogram" | "image" | "both";
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  monogramText: string;
  monogramTextEn: string;
  monogramUrl?: string;
  faviconUrl?: string;
  logoHeightDesktop: number;
  logoHeightMobile: number;
  primaryColor?: string;
  surfaceColor?: string;
}

// CMS Navigation Item
export interface NavigationItem {
  id: string;
  href: string;
  label: string;
  labelEn: string;
  visible: boolean;
  order: number;
  openInNewTab?: boolean;
}

// CMS Footer Configuration
export interface FooterLink {
  id: string;
  label: string;
  labelEn: string;
  href: string;
  visible: boolean;
  order: number;
}

export interface FooterSettings {
  bioSummary: string;
  bioSummaryEn: string;
  copyrightText: string;
  copyrightTextEn: string;
  showSocialLinks: boolean;
  showContactChannels: boolean;
  showSitemap: boolean;
  links: FooterLink[];
}

// CMS Page Section Config
export interface PageSectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  eyebrow?: string;
  eyebrowEn?: string;
  title?: string;
  titleEn?: string;
  titleAccent?: string;
  titleAccentEn?: string;
  description?: string;
  descriptionEn?: string;
  actionLabel?: string;
  actionLabelEn?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionLabelEn?: string;
  secondaryActionHref?: string;
  badge?: string;
  badgeEn?: string;
  backgroundImage?: string;
  customSettings?: Record<string, string | number | boolean>;
}

// CMS Page Config
export interface PageConfig {
  id: "home" | "work" | "about" | "contact" | string;
  slug: string;
  title: string;
  titleEn: string;
  seoDescription: string;
  seoDescriptionEn: string;
  ogImage?: string;
  published: boolean;
  updatedAt: string;
  sections: PageSectionConfig[];
}

// CMS Media Asset
export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  alt: string;
  altEn: string;
  uploadedAt: string;
  tags?: string[];
}

// CMS Revision History
export interface RevisionSnapshot {
  id: string;
  timestamp: string;
  author: string;
  summary: string;
  snapshot: {
    brand?: BrandSettings;
    profile?: ProfileData;
    projectsCount: number;
    pagesUpdated?: string[];
  };
}

// CMS Site Settings
export interface SiteSettings {
  defaultLocale: "ar" | "en";
  enableEnglish: boolean;
  enableArabic: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  enableGoogleAnalytics?: boolean;
  googleAnalyticsId?: string;
  seoKeywords?: string;
  seoKeywordsEn?: string;
  ogDefaultImage?: string;
}

// CMS Security & Auth Data
export interface AuthSecurity {
  passwordHash?: string;
  salt?: string;
  lastPasswordChange?: string;
  sessionSecret?: string;
}

// Unified Portfolio & CMS Store
export interface PortfolioData {
  adminPassword?: string; // legacy support
  auth?: AuthSecurity;
  brand?: BrandSettings;
  siteSettings?: SiteSettings;
  navigation?: NavigationItem[];
  footer?: FooterSettings;
  pages?: Record<string, PageConfig>;
  media?: MediaAsset[];
  revisions?: RevisionSnapshot[];
  profile: ProfileData;
  categories: Category[];
  skills: SkillCategory[];
  projects: Project[];
}
