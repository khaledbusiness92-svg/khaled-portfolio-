"use client";

import { useState } from "react";
import Link from "next/link";
import { PageConfig, PageSectionConfig } from "@/lib/types";
import {
  FileText,
  Save,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";

interface PagesTabProps {
  pages: Record<string, PageConfig>;
  onSavePage: (pageId: string, pageConfig: PageConfig) => Promise<void>;
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function PagesTab({
  pages,
  onSavePage,
  onOpenMediaPicker,
  showNotification,
}: PagesTabProps) {
  const pageKeys = Object.keys(pages);
  const [activePageId, setActivePageId] = useState<string>(pageKeys[0] || "home");
  const [currentPage, setCurrentPage] = useState<PageConfig>(
    pages[activePageId] || {
      id: "home",
      slug: "/",
      title: "",
      titleEn: "",
      seoDescription: "",
      seoDescriptionEn: "",
      published: true,
      updatedAt: new Date().toISOString(),
      sections: [],
    }
  );
  const [activeLanguageTab, setActiveLanguageTab] = useState<"ar" | "en">("ar");
  const [saving, setSaving] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    if (pages[pageId]) {
      setCurrentPage(JSON.parse(JSON.stringify(pages[pageId])));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePage(activePageId, currentPage);
      showNotification(`تم حفظ إعدادات وأقسام صفحة [${currentPage.title}] بنجاح!`);
    } catch {
      showNotification("فشل حفظ إعدادات الصفحة", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const sections = [...currentPage.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // re-index order
    sections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setCurrentPage({ ...currentPage, sections });
  };

  const handleToggleSection = (sectionId: string) => {
    const sections = currentPage.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });
    setCurrentPage({ ...currentPage, sections });
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<PageSectionConfig>
  ) => {
    const sections = currentPage.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, ...updates };
      }
      return s;
    });
    setCurrentPage({ ...currentPage, sections });
  };

  return (
    <div className="space-y-8">
      {/* Page Select Pills & Page Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D7C9B2]" />
            <span>إدارة الصفحات والأقسام (Pages &amp; Sections)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            اختر الصفحة لتعديل نصوصها بالعربية والإنجليزية، وإعادة ترتيب أقسامها وتفعيلها أو إخفائها.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/ar${currentPage.slug === "/" ? "" : currentPage.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-[#202020] hover:bg-[#282828] text-[#EAE6DF] border border-[#EAE6DF]/15 transition-colors"
          >
            <span>معاينة في الموقع</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "جاري الحفظ..." : "حفظ تغييرات الصفحة"}</span>
          </button>
        </div>
      </div>

      {/* Pages Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {pageKeys.map((pId) => {
          const p = pages[pId];
          const isSelected = activePageId === pId;
          return (
            <button
              key={pId}
              type="button"
              onClick={() => handleSelectPage(pId)}
              className={`px-4 py-2.5 rounded text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-[#D7C9B2] text-[#0A0A0A] shadow-md"
                  : "bg-[#161616] text-[#777777] hover:text-[#EAE6DF] border border-[#EAE6DF]/10"
              }`}
            >
              <span>{p.title || pId}</span>
              <span className="text-[10px] font-mono opacity-70">
                ({p.sections?.length || 0} قسم)
              </span>
            </button>
          );
        })}
      </div>

      {/* Language Switcher Tabs for Editing */}
      <div className="flex items-center justify-between border-b border-[#EAE6DF]/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777777]">لغة التحرير:</span>
          <button
            type="button"
            onClick={() => setActiveLanguageTab("ar")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeLanguageTab === "ar"
                ? "bg-[#202020] text-[#D7C9B2] border border-[#D7C9B2]/40"
                : "text-[#777777] hover:text-[#EAE6DF]"
            }`}
          >
            العربية (AR)
          </button>
          <button
            type="button"
            onClick={() => setActiveLanguageTab("en")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeLanguageTab === "en"
                ? "bg-[#202020] text-[#D7C9B2] border border-[#D7C9B2]/40"
                : "text-[#777777] hover:text-[#EAE6DF]"
            }`}
          >
            English (EN)
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#777777]">
          مسار الصفحة: {currentPage.slug}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Page Metadata & SEO Card */}
        <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
          <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
            بيانات الصفحة وتحسين محركات البحث (SEO &amp; Meta)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                {activeLanguageTab === "ar"
                  ? "عنوان الصفحة (بالعربية)"
                  : "Page Title (English)"}
              </label>
              <input
                type="text"
                dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                value={
                  activeLanguageTab === "ar"
                    ? currentPage.title
                    : currentPage.titleEn || ""
                }
                onChange={(e) =>
                  setCurrentPage({
                    ...currentPage,
                    [activeLanguageTab === "ar" ? "title" : "titleEn"]:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                صورة المشاركة الاجتماعية (OG Image)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={currentPage.ogImage || ""}
                  onChange={(e) =>
                    setCurrentPage({ ...currentPage, ogImage: e.target.value })
                  }
                  placeholder="/images/... or /uploads/..."
                  className="flex-1 px-4 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      setCurrentPage({ ...currentPage, ogImage: url })
                    )
                  }
                  className="px-3 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer"
                >
                  اختيار
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              {activeLanguageTab === "ar"
                ? "وصف الميتا لمحركات البحث (SEO Description AR)"
                : "SEO Meta Description (English)"}
            </label>
            <textarea
              rows={2}
              dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
              value={
                activeLanguageTab === "ar"
                  ? currentPage.seoDescription
                  : currentPage.seoDescriptionEn || ""
              }
              onChange={(e) =>
                setCurrentPage({
                  ...currentPage,
                  [activeLanguageTab === "ar"
                    ? "seoDescription"
                    : "seoDescriptionEn"]: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
            />
          </div>
        </div>

        {/* Page Sections Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#EAE6DF]">
              أقسام الصفحة وترتيبها ({currentPage.sections?.length || 0})
            </h3>
            <span className="text-xs text-[#777777]">
              استخدم أزرار الأسهم لتغيير ترتيب ظهور الأقسام في الصفحة
            </span>
          </div>

          <div className="space-y-3">
            {currentPage.sections.map((section, idx) => {
              const isExpanded = expandedSectionId === section.id;
              const isFirst = idx === 0;
              const isLast = idx === currentPage.sections.length - 1;

              return (
                <div
                  key={section.id}
                  className={`rounded-lg border transition-all ${
                    section.enabled
                      ? "bg-[#141414] border-[#EAE6DF]/12"
                      : "bg-[#101010] border-[#EAE6DF]/5 opacity-60"
                  }`}
                >
                  {/* Section Strip Header */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded bg-[#202020] text-[#D7C9B2] font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#EAE6DF] truncate">
                          {activeLanguageTab === "ar"
                            ? section.title || section.id
                            : section.titleEn || section.title || section.id}
                        </p>
                        <p className="text-[11px] font-mono text-[#777777]">
                          نوع القسم: {section.type} • المعرف: {section.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Move Up / Down */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveSection(idx, "up")}
                        className="p-1.5 rounded bg-[#202020] text-[#777777] hover:text-[#D7C9B2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveSection(idx, "down")}
                        className="p-1.5 rounded bg-[#202020] text-[#777777] hover:text-[#D7C9B2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Enable / Disable */}
                      <button
                        type="button"
                        onClick={() => handleToggleSection(section.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                          section.enabled
                            ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-950/40 text-red-300 border border-red-500/20"
                        }`}
                      >
                        {section.enabled ? "مفعّل" : "معطّل"}
                      </button>

                      {/* Expand / Collapse Details */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSectionId(isExpanded ? null : section.id)
                        }
                        className="px-3 py-1 rounded text-xs bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                      >
                        {isExpanded ? "طي" : "تعديل النصوص"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section Editor */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[#EAE6DF]/10 bg-[#0E0E0E] space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            {activeLanguageTab === "ar"
                              ? "العنوان التمهيدي (Eyebrow AR)"
                              : "Eyebrow (English)"}
                          </label>
                          <input
                            type="text"
                            dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                            value={
                              activeLanguageTab === "ar"
                                ? section.eyebrow || ""
                                : section.eyebrowEn || ""
                            }
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                [activeLanguageTab === "ar"
                                  ? "eyebrow"
                                  : "eyebrowEn"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            {activeLanguageTab === "ar"
                              ? "عنوان القسم الأساسي"
                              : "Section Main Title"}
                          </label>
                          <input
                            type="text"
                            dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                            value={
                              activeLanguageTab === "ar"
                                ? section.title || ""
                                : section.titleEn || ""
                            }
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                [activeLanguageTab === "ar"
                                  ? "title"
                                  : "titleEn"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            {activeLanguageTab === "ar"
                              ? "الكلمة المميزة في العنوان (Accent)"
                              : "Title Accent (Highlighted)"}
                          </label>
                          <input
                            type="text"
                            dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                            value={
                              activeLanguageTab === "ar"
                                ? section.titleAccent || ""
                                : section.titleAccentEn || ""
                            }
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                [activeLanguageTab === "ar"
                                  ? "titleAccent"
                                  : "titleAccentEn"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            {activeLanguageTab === "ar"
                              ? "شارة القسم (Badge)"
                              : "Section Badge"}
                          </label>
                          <input
                            type="text"
                            dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                            value={
                              activeLanguageTab === "ar"
                                ? section.badge || ""
                                : section.badgeEn || ""
                            }
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                [activeLanguageTab === "ar"
                                  ? "badge"
                                  : "badgeEn"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                          {activeLanguageTab === "ar"
                            ? "الوصف والشرح"
                            : "Description"}
                        </label>
                        <textarea
                          rows={2}
                          dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                          value={
                            activeLanguageTab === "ar"
                              ? section.description || ""
                              : section.descriptionEn || ""
                          }
                          onChange={(e) =>
                            handleUpdateSection(section.id, {
                              [activeLanguageTab === "ar"
                                ? "description"
                                : "descriptionEn"]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
                        />
                      </div>

                      {/* Action Button Links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE6DF]/8">
                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            نص الزر الأساسي (Action Label)
                          </label>
                          <input
                            type="text"
                            dir={activeLanguageTab === "ar" ? "rtl" : "ltr"}
                            value={
                              activeLanguageTab === "ar"
                                ? section.actionLabel || ""
                                : section.actionLabelEn || ""
                            }
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                [activeLanguageTab === "ar"
                                  ? "actionLabel"
                                  : "actionLabelEn"]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                            رابط الزر (Href)
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            value={section.actionHref || ""}
                            onChange={(e) =>
                              handleUpdateSection(section.id, {
                                actionHref: e.target.value,
                              })
                            }
                            placeholder="/work or /contact"
                            className="w-full px-3 py-2 rounded bg-[#141414] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-8 rounded font-bold text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ تعديلات الصفحة والأقسام"}</span>
        </button>
      </form>
    </div>
  );
}
