"use client";

import { useState } from "react";
import { SiteSettings } from "@/lib/types";
import { Settings, Save, Globe } from "lucide-react";

interface SettingsTabProps {
  siteSettings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function SettingsTab({
  siteSettings,
  onSaveSettings,
  onOpenMediaPicker,
  showNotification,
}: SettingsTabProps) {
  const [formData, setFormData] = useState<SiteSettings>({
    defaultLocale: siteSettings.defaultLocale || "ar",
    enableEnglish: siteSettings.enableEnglish !== false,
    enableArabic: siteSettings.enableArabic !== false,
    maintenanceMode: Boolean(siteSettings.maintenanceMode),
    contactEmail: siteSettings.contactEmail || "khaled.abdelsamie.design@gmail.com",
    seoKeywords: siteSettings.seoKeywords || "رسم رقمي, بورتريه, مانجا, إعلانات مطاعم, تصميم ملابس",
    seoKeywordsEn: siteSettings.seoKeywordsEn || "digital art, portraits, manga illustration, restaurant advertising, brand campaigns",
    ogDefaultImage: siteSettings.ogDefaultImage || "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      showNotification("تم تحديث إعدادات الموقع العامة بنجاح!");
    } catch {
      showNotification("فشل تحديث إعدادات الموقع", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D7C9B2]" />
            <span>إعدادات الموقع العامة وSEO (Site Settings &amp; SEO)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة اللغات الافتراضية، الكلمات المفتاحية لمحرّكات البحث، وصورة المشاركة العامة.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}</span>
        </button>
      </div>

      {/* Locale & Language Configuration */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#D7C9B2]" />
          <h3 className="font-bold text-base text-[#EAE6DF]">
            إعدادات اللغات والواجهات (Locales &amp; Languages)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              اللغة الافتراضية عند الزيارة الأولى
            </label>
            <select
              value={formData.defaultLocale}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultLocale: e.target.value as "ar" | "en",
                })
              }
              className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            >
              <option value="ar">العربية (Arabic - RTL)</option>
              <option value="en">English (English - LTR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              البريد الإلكتروني للإشعارات والتواصل
            </label>
            <input
              type="email"
              dir="ltr"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs text-[#EAE6DF] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enableArabic}
              onChange={(e) =>
                setFormData({ ...formData, enableArabic: e.target.checked })
              }
              className="accent-[#D7C9B2] w-4 h-4"
            />
            <span>تفعيل الواجهة العربية (/ar)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[#EAE6DF] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enableEnglish}
              onChange={(e) =>
                setFormData({ ...formData, enableEnglish: e.target.checked })
              }
              className="accent-[#D7C9B2] w-4 h-4"
            />
            <span>تفعيل الواجهة الإنجليزية (/en)</span>
          </label>
        </div>
      </div>

      {/* SEO & Keywords */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <h3 className="font-bold text-base text-[#D7C9B2]">
          الكلمات المفتاحية وصورة المشاركة (SEO Keywords &amp; Social Share)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              الكلمات المفتاحية (بالعربية - مفصولة بفاصلة)
            </label>
            <textarea
              rows={3}
              value={formData.seoKeywords}
              onChange={(e) =>
                setFormData({ ...formData, seoKeywords: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              SEO Keywords (English - comma separated)
            </label>
            <textarea
              rows={3}
              dir="ltr"
              value={formData.seoKeywordsEn}
              onChange={(e) =>
                setFormData({ ...formData, seoKeywordsEn: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
            صورة المشاركة الافتراضية (Default Open Graph Image)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              dir="ltr"
              value={formData.ogDefaultImage || ""}
              onChange={(e) =>
                setFormData({ ...formData, ogDefaultImage: e.target.value })
              }
              placeholder="/images/... or /uploads/..."
              className="flex-1 px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
            <button
              type="button"
              onClick={() =>
                onOpenMediaPicker((url) =>
                  setFormData({ ...formData, ogDefaultImage: url })
                )
              }
              className="px-4 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              اختيار صورة
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="py-3 px-8 rounded font-bold text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات العامة"}</span>
      </button>
    </form>
  );
}
