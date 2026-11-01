"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Images,
  Palette,
  User,
  Wrench,
  Navigation,
  Settings,
  History,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Lock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  PortfolioData,
  Project,
  MediaAsset,
  BrandSettings,
  NavigationItem,
  FooterSettings,
  PageConfig,
  ProfileData,
  Category,
  SkillCategory,
  SiteSettings,
  RevisionSnapshot,
} from "@/lib/types";

// Import Admin Tabs
import OverviewTab from "./components/OverviewTab";
import PagesTab from "./components/PagesTab";
import ProjectsTab from "./components/ProjectsTab";
import MediaTab from "./components/MediaTab";
import BrandTab from "./components/BrandTab";
import ProfileTab from "./components/ProfileTab";
import SkillsTab from "./components/SkillsTab";
import NavFooterTab from "./components/NavFooterTab";
import SettingsTab from "./components/SettingsTab";
import RevisionsTab from "./components/RevisionsTab";
import SecurityTab from "./components/SecurityTab";
import MediaPickerModal from "./components/MediaPickerModal";

type TabId =
  | "overview"
  | "pages"
  | "projects"
  | "media"
  | "brand"
  | "profile"
  | "skills"
  | "navfooter"
  | "settings"
  | "revisions"
  | "security";

interface TabItem {
  id: TabId;
  label: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoOpenNewProject, setAutoOpenNewProject] = useState(false);

  // App data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [revisions, setRevisions] = useState<RevisionSnapshot[]>([]);
  const [overviewStats, setOverviewStats] = useState<{
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    featuredProjects: number;
    totalCategories: number;
    totalSkills: number;
    totalMedia: number;
    totalMediaBytes: number;
    totalPages: number;
  }>({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    featuredProjects: 0,
    totalCategories: 0,
    totalSkills: 0,
    totalMedia: 0,
    totalMediaBytes: 0,
    totalPages: 4,
  });

  // Media Picker state
  const [mediaPicker, setMediaPicker] = useState<{
    isOpen: boolean;
    onSelect: (url: string) => void;
  }>({
    isOpen: false,
    onSelect: () => {},
  });

  // Notification Toast state
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Load all dashboard data
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [portfolioRes, overviewRes, mediaRes, revisionsRes] =
        await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/admin/overview"),
          fetch("/api/admin/media"),
          fetch("/api/admin/revisions"),
        ]);

      if (portfolioRes.ok) {
        const pData: PortfolioData = await portfolioRes.json();
        setPortfolioData(pData);
      }

      if (overviewRes.ok) {
        const oData = await overviewRes.json();
        if (oData.stats) setOverviewStats(oData.stats);
      }

      if (mediaRes.ok) {
        const mData = await mediaRes.json();
        if (mData.media) setMediaList(mData.media);
      }

      if (revisionsRes.ok) {
        const rData = await revisionsRes.json();
        if (rData.revisions) setRevisions(rData.revisions);
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
      showNotification("فشل تحميل بعض بيانات لوحة التحكم", "error");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Check auth and initialize on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const res = await fetch("/api/admin/login");
        const json = await res.json();
        if (!isMounted) return;
        if (json.authenticated) {
          setIsAuthenticated(true);
          await loadAllData();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [loadAllData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setLoginError("يرجى إدخال كلمة المرور");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasswordInput("");
        await loadAllData();
        showNotification("مرحباً بك! تم تسجيل الدخول بنجاح");
      } else {
        setLoginError(data.error || "كلمة المرور غير صحيحة");
      }
    } catch {
      setLoginError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPortfolioData(null);
    showNotification("تم تسجيل الخروج بنجاح");
  };

  // Open Media Picker
  const handleOpenMediaPicker = (onSelect: (url: string) => void) => {
    setMediaPicker({
      isOpen: true,
      onSelect,
    });
  };

  // Update Brand
  const handleSaveBrand = async (brand: BrandSettings) => {
    const res = await fetch("/api/admin/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, brand } : prev));
      showNotification("تم حفظ إعدادات الهوية والشعار بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ إعدادات الهوية", "error");
      throw new Error(err.error);
    }
  };

  // Update Navigation
  const handleSaveNavigation = async (navigation: NavigationItem[]) => {
    const res = await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ navigation }),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, navigation } : prev));
      showNotification("تم تحديث عناصر القائمة الرئيسية بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل تحديث القائمة الرئيسية", "error");
      throw new Error(err.error);
    }
  };

  // Update Footer
  const handleSaveFooter = async (footer: FooterSettings) => {
    const res = await fetch("/api/admin/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(footer),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, footer } : prev));
      showNotification("تم تحديث إعدادات التذييل بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل تحديث التذييل", "error");
      throw new Error(err.error);
    }
  };

  // Update Page
  const handleSavePage = async (pageId: string, pageConfig: PageConfig) => {
    const res = await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, pageConfig }),
    });

    if (res.ok) {
      setPortfolioData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: pageConfig,
          },
        };
      });
      showNotification(`تم حفظ إعدادات وأقسام صفحة (${pageId}) بنجاح`);
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ إعدادات الصفحة", "error");
      throw new Error(err.error);
    }
  };

  // Update Profile
  const handleSaveProfile = async (profile: ProfileData) => {
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, profile } : prev));
      showNotification("تم تحديث وحفظ الملف التعريفي بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل تحديث الملف التعريفي", "error");
      throw new Error(err.error);
    }
  };

  // Update Categories
  const handleSaveCategories = async (categories: Category[]) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, categories } : prev));
      showNotification("تم حفظ تصنيفات المشاريع بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ التصنيفات", "error");
      throw new Error(err.error);
    }
  };

  // Update Skills
  const handleSaveSkills = async (skills: SkillCategory[]) => {
    const res = await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, skills } : prev));
      showNotification("تم حفظ مجموعات ومهارات الفنان بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ المهارات", "error");
      throw new Error(err.error);
    }
  };

  // Update Site Settings
  const handleSaveSettings = async (siteSettings: SiteSettings) => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettings),
    });

    if (res.ok) {
      setPortfolioData((prev) => (prev ? { ...prev, siteSettings } : prev));
      showNotification("تم حفظ إعدادات الموقع و SEO بنجاح");
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ الإعدادات", "error");
      throw new Error(err.error);
    }
  };

  // Save Project (Create / Edit)
  const handleSaveProject = async (
    projectData: Partial<Project>,
    isEdit: boolean
  ) => {
    const res = await fetch("/api/projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (res.ok) {
      showNotification(
        isEdit ? "تم تحديث بيانات العمل الفني بنجاح" : "تمت إضافة العمل الفني الجديد بنجاح"
      );
      await loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حفظ المشروع", "error");
      throw new Error(err.error);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    const res = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    });

    if (res.ok) {
      showNotification("تم حذف المشروع بنجاح");
      await loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل حذف المشروع", "error");
      throw new Error(err.error);
    }
  };

  // Upload Media
  const handleUploadMedia = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const json = await res.json();
      showNotification(`تم رفع الملف (${file.name}) بنجاح`);
      if (json.asset) {
        setMediaList((prev) => [json.asset, ...prev]);
      }
      loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل رفع الملف", "error");
      throw new Error(err.error);
    }
  };

  // Update Media Alt text
  const handleUpdateMedia = async (id: string, alt: string, altEn: string) => {
    const res = await fetch("/api/admin/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, alt, altEn }),
    });

    if (res.ok) {
      showNotification("تم تحديث النص البديل للصورة بنجاح");
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, alt, altEn } : m))
      );
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل تحديث بيانات الصورة", "error");
      throw new Error(err.error);
    }
  };

  // Delete Media
  const handleDeleteMedia = async (id: string, force?: boolean) => {
    const url = `/api/admin/media?id=${encodeURIComponent(id)}${force ? "&force=true" : ""}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, force: Boolean(force) }),
    });

    const json = await res.json();

    if (res.status === 409 && json.inUse) {
      return { inUse: true, locations: json.locations };
    }

    if (res.ok) {
      showNotification("تم حذف الملف من مكتبة الوسائط بنجاح");
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      loadAllData();
      return;
    } else {
      showNotification(json.error || "فشل حذف الملف", "error");
      throw new Error(json.error);
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (revisionId: string) => {
    const res = await fetch("/api/admin/revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId }),
    });

    if (res.ok) {
      showNotification("تمت استعادة النسخة الاحتياطية بنجاح وتم تحديث الموقع");
      await loadAllData();
    } else {
      const err = await res.json();
      showNotification(err.error || "فشل استعادة النسخة", "error");
      throw new Error(err.error);
    }
  };

  // Navigation Items
  const tabs: TabItem[] = [
    { id: "overview", label: "نظرة عامة", labelEn: "Overview", icon: LayoutDashboard },
    {
      id: "pages",
      label: "إدارة الصفحات",
      labelEn: "Pages & Sections",
      icon: FileText,
      badge: portfolioData?.pages ? Object.keys(portfolioData.pages).length : 4,
    },
    {
      id: "projects",
      label: "الأعمال والمشاريع",
      labelEn: "Projects",
      icon: FolderKanban,
      badge: portfolioData?.projects ? portfolioData.projects.length : 0,
    },
    {
      id: "media",
      label: "مكتبة الوسائط",
      labelEn: "Media Library",
      icon: Images,
      badge: mediaList.length,
    },
    { id: "brand", label: "الهوية والشعار", labelEn: "Branding", icon: Palette },
    { id: "profile", label: "الملف التعريفي", labelEn: "Profile", icon: User },
    { id: "skills", label: "المهارات والتصنيفات", labelEn: "Skills & Categories", icon: Wrench },
    { id: "navfooter", label: "القوائم والتذييل", labelEn: "Navigation & Footer", icon: Navigation },
    { id: "settings", label: "إعدادات الموقع", labelEn: "Site & SEO", icon: Settings },
    {
      id: "revisions",
      label: "سجل النسخ",
      labelEn: "Revisions",
      icon: History,
      badge: revisions.length,
    },
    { id: "security", label: "الأمان والدخول", labelEn: "Security", icon: ShieldCheck },
  ];

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#EAE6DF]">
        <div className="w-12 h-12 border-2 border-[#D7C9B2] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-sans tracking-wide text-[#D7C9B2]">
          جاري تهيئة لوحة التحكم والتحقق من الجلسة...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#EAE6DF] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D7C9B2]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#202020] border border-[#D7C9B2]/30 mb-4 shadow-xl">
              <Lock className="w-8 h-8 text-[#D7C9B2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#EAE6DF] mb-2 font-serif">
              لوحة التحكم المركزية
            </h1>
            <p className="text-xs text-[#777777] font-mono tracking-wider uppercase">
              KHALED MOHAMED ABDEL SAMEE • CMS
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#202020]/80 border border-[#D7C9B2]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div className="leading-relaxed">{loginError}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-[#D7C9B2] uppercase tracking-wider mb-2">
                  كلمة مرور المدير (Admin Password)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#D7C9B2]/30 rounded-xl text-sm text-[#EAE6DF] placeholder-[#777777] focus:outline-none focus:border-[#D7C9B2] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 bg-[#D7C9B2] hover:bg-[#c4b59d] text-[#0A0A0A] font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-[#D7C9B2]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والأمان...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تسجيل الدخول إلى النظام</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#D7C9B2]/10 text-center">
              <Link
                href="/ar"
                className="text-xs text-[#777777] hover:text-[#D7C9B2] transition-colors inline-flex items-center gap-1.5"
              >
                <span>العودة إلى المعرض والموقع العام</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] text-[#777777] font-mono">
            محمية بنظام تشفير PBKDF2-SHA512 وجلسات موقّعة HMAC-SHA256
          </p>
        </div>
      </div>
    );
  }

  // 3. Authenticated CMS Dashboard
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EAE6DF] flex flex-col selection:bg-[#D7C9B2]/20 selection:text-[#D7C9B2]" dir="rtl">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in transition-all text-xs font-sans ${
            statusMessage.type === "success"
              ? "bg-[#202020]/95 border-[#D7C9B2] text-[#D7C9B2]"
              : "bg-red-950/95 border-red-500 text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#D7C9B2] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPicker.isOpen}
        onClose={() => setMediaPicker({ isOpen: false, onSelect: () => {} })}
        onSelect={(url) => {
          mediaPicker.onSelect(url);
          setMediaPicker({ isOpen: false, onSelect: () => {} });
        }}
        media={mediaList}
        onUploadSuccess={(asset) => {
          setMediaList((prev) => [asset, ...prev]);
        }}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#202020] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#202020] text-[#EAE6DF] hover:text-[#D7C9B2] transition-colors"
            aria-label="القائمة الجانبية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#202020] border border-[#D7C9B2]/30 flex items-center justify-center text-[#D7C9B2] font-bold text-base font-serif">
              خ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[#EAE6DF]">
                  {portfolioData?.brand?.siteName || "خالد محمد عبد السميع"}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#D7C9B2]/10 text-[#D7C9B2] border border-[#D7C9B2]/20">
                  CMS v2.0
                </span>
              </div>
              <span className="text-[11px] text-[#777777] hidden sm:block">
                لوحة التحكم المركزية وإدارة المحتوى الشامل
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadAllData()}
            disabled={refreshing}
            title="تحديث البيانات"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#202020] hover:bg-[#202020]/80 text-[#EAE6DF] border border-[#202020] hover:border-[#D7C9B2]/30 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#D7C9B2]" : "text-[#777777]"}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <Link
            href="/ar"
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#202020]/80 text-[#D7C9B2] border border-[#D7C9B2]/20 text-xs transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">عرض الموقع العام</span>
          </Link>

          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-300 border border-red-500/20 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-30 w-72 bg-[#0A0A0A] border-l border-[#202020] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 top-[61px]" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-[#202020]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777]">
              أقسام النظام المركزي
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#D7C9B2] text-[#0A0A0A] shadow-md font-semibold"
                      : "text-[#EAE6DF] hover:bg-[#202020] hover:text-[#D7C9B2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#0A0A0A]" : "text-[#777777]"}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive
                          ? "bg-[#0A0A0A]/20 text-[#0A0A0A]"
                          : "bg-[#202020] text-[#777777]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#202020] bg-[#0A0A0A]/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#202020] border border-[#D7C9B2]/20 flex items-center justify-center text-xs font-mono text-[#D7C9B2]">
                KM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#EAE6DF] truncate">
                  {portfolioData?.profile?.name || "خالد محمد"}
                </p>
                <p className="text-[10px] font-mono text-[#777777] truncate">
                  مدير النظام (Super Admin)
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6 lg:p-8">
          {portfolioData && (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  stats={overviewStats}
                  recentProjects={portfolioData.projects?.slice(0, 6) || []}
                  recentMedia={mediaList.slice(0, 6)}
                  recentRevisions={revisions.slice(0, 5)}
                  onNavigateTab={(t) => setActiveTab(t as TabId)}
                  onOpenNewProject={() => {
                    setActiveTab("projects");
                    setAutoOpenNewProject(true);
                  }}
                  onOpenMediaModal={() => setActiveTab("media")}
                />
              )}

              {activeTab === "pages" && (
                <PagesTab
                  pages={portfolioData.pages || {}}
                  onSavePage={handleSavePage}
                  onOpenMediaPicker={handleOpenMediaPicker}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsTab
                  projects={portfolioData.projects || []}
                  categories={portfolioData.categories || []}
                  onSaveProject={handleSaveProject}
                  onDeleteProject={handleDeleteProject}
                  onOpenMediaPicker={handleOpenMediaPicker}
                  showNotification={showNotification}
                  autoOpenNew={autoOpenNewProject}
                  onNewOpened={() => setAutoOpenNewProject(false)}
                />
              )}

              {activeTab === "media" && (
                <MediaTab
                  media={mediaList}
                  onUploadFile={handleUploadMedia}
                  onUpdateMedia={handleUpdateMedia}
                  onDeleteMedia={handleDeleteMedia}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "brand" && (
                <BrandTab
                  key={`brand-${portfolioData.brand?.logoUrl || ""}-${portfolioData.brand?.logoLightUrl || ""}-${portfolioData.brand?.logoDarkUrl || ""}-${portfolioData.brand?.monogramUrl || ""}`}
                  brand={
                    portfolioData.brand || {
                      siteName: "خالد محمد عبد السميع",
                      siteNameEn: "Khaled Mohamed Abdel Samee",
                      tagline: "مصمم جرافيك ورسام رقمي",
                      taglineEn: "Digital Artist & Visual Creator",
                      logoType: "monogram",
                      monogramText: "خ",
                      monogramTextEn: "K",
                      logoHeightDesktop: 36,
                      logoHeightMobile: 28,
                    }
                  }
                  onSaveBrand={handleSaveBrand}
                  onOpenMediaPicker={handleOpenMediaPicker}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab
                  key={`profile-${portfolioData.profile?.avatar || ""}-${portfolioData.profile?.heroBg || ""}-${portfolioData.profile?.name || ""}`}
                  profile={portfolioData.profile}
                  onSaveProfile={handleSaveProfile}
                  onOpenMediaPicker={handleOpenMediaPicker}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "skills" && (
                <SkillsTab
                  categories={portfolioData.categories || []}
                  skills={portfolioData.skills || []}
                  projects={portfolioData.projects || []}
                  onSaveCategories={handleSaveCategories}
                  onSaveSkills={handleSaveSkills}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "navfooter" && (
                <NavFooterTab
                  navigation={portfolioData.navigation || []}
                  footer={
                    portfolioData.footer || {
                      bioSummary: "مصمم جرافيك ورسام رقمي أعمل على صياغة الهويات البصرية والرسوم التوضيحية.",
                      bioSummaryEn: "Digital artist and visual creator specializing in brand identities and illustration.",
                      copyrightText: "جميع الحقوق محفوظة © 2026 خالد محمد عبد السميع",
                      copyrightTextEn: "All rights reserved © 2026 Khaled Mohamed Abdel Samee",
                      showSocialLinks: true,
                      showContactChannels: true,
                      showSitemap: true,
                      links: [],
                    }
                  }
                  onSaveNavigation={handleSaveNavigation}
                  onSaveFooter={handleSaveFooter}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "settings" && (
                <SettingsTab
                  siteSettings={
                    portfolioData.siteSettings || {
                      defaultLocale: "ar",
                      enableArabic: true,
                      enableEnglish: true,
                      maintenanceMode: false,
                      contactEmail: "khaled.abdelsamie.design@gmail.com",
                    }
                  }
                  onSaveSettings={handleSaveSettings}
                  onOpenMediaPicker={handleOpenMediaPicker}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "revisions" && (
                <RevisionsTab
                  revisions={revisions}
                  onRestoreRevision={handleRestoreRevision}
                  onRefresh={loadAllData}
                  showNotification={showNotification}
                />
              )}

              {activeTab === "security" && (
                <SecurityTab
                  lastPasswordChange={portfolioData.auth?.lastPasswordChange}
                  onLogout={handleLogout}
                  showNotification={showNotification}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
