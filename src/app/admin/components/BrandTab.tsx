"use client";

import { useState } from "react";
import { BrandSettings } from "@/lib/types";
import {
  Palette,
  Save,
  Eye,
  Upload,
} from "lucide-react";

interface BrandTabProps {
  brand: BrandSettings;
  onSaveBrand: (brand: BrandSettings) => Promise<void>;
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function BrandTab({
  brand,
  onSaveBrand,
  onOpenMediaPicker,
  showNotification,
}: BrandTabProps) {
  const [formData, setFormData] = useState<BrandSettings>({
    siteName: brand.siteName || "خالد محمد عبد السميع",
    siteNameEn: brand.siteNameEn || "Khaled Mohamed Abdel Samee",
    tagline: brand.tagline || "فنان رقمي ومصمم بصري",
    taglineEn: brand.taglineEn || "Digital Artist & Visual Creator",
    logoType: brand.logoType || "both",
    logoUrl: brand.logoUrl || "",
    logoLightUrl: brand.logoLightUrl || "",
    logoDarkUrl: brand.logoDarkUrl || "",
    monogramText: brand.monogramText || "خ",
    monogramTextEn: brand.monogramTextEn || "K",
    monogramUrl: brand.monogramUrl || "",
    faviconUrl: brand.faviconUrl || "/favicon.ico",
    logoHeightDesktop: brand.logoHeightDesktop || 34,
    logoHeightMobile: brand.logoHeightMobile || 28,
    primaryColor: brand.primaryColor || "#D7C9B2",
    surfaceColor: brand.surfaceColor || "#0A0A0A",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en">("ar");

  const handleDirectUpload = async (
    file: File,
    field: "logo" | "logoDark" | "monogram"
  ) => {
    setUploadingField(field);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        if (field === "logo") {
          setFormData((prev) => ({
            ...prev,
            logoUrl: data.url,
            logoLightUrl: data.url,
          }));
        } else if (field === "logoDark") {
          setFormData((prev) => ({ ...prev, logoDarkUrl: data.url }));
        } else if (field === "monogram") {
          setFormData((prev) => ({ ...prev, monogramUrl: data.url }));
        }
        showNotification("تم رفع وتطبيق الشعار بنجاح!");
      } else {
        showNotification(data.error || "فشل رفع الشعار", "error");
      }
    } catch {
      showNotification("حدث خطأ أثناء رفع الشعار", "error");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveBrand(formData);
      showNotification("تم تحديث إعدادات الهوية البصرية والشعار بنجاح!");
    } catch {
      showNotification("فشل تحديث إعدادات الهوية", "error");
    } finally {
      setSaving(false);
    }
  };

  const previewName =
    previewLocale === "ar" ? formData.siteName : formData.siteNameEn;
  const previewTagline =
    previewLocale === "ar" ? formData.tagline : formData.taglineEn;
  const previewMonogram =
    previewLocale === "ar" ? formData.monogramText : formData.monogramTextEn;
  const previewLogoUrl = formData.logoLightUrl || formData.logoUrl;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D7C9B2]" />
            <span>الهوية البصرية والشعار (Logo &amp; Brand Settings)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            تخصيص الشعار الرسمي (PNG / SVG)، الرمز المونوغرامي، مقاسات العرض، واسم الاستوديو في النافبار والفوتر.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ إعدادات الهوية"}</span>
        </button>
      </div>

      {/* Live Preview Box */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D7C9B2]" />
            <h3 className="font-bold text-sm text-[#EAE6DF]">
              معاينة حية ومباشرة للشعار والهوية (Live Header Preview)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPreviewLocale("ar")}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                previewLocale === "ar"
                  ? "bg-[#202020] text-[#D7C9B2]"
                  : "text-[#777777]"
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setPreviewLocale("en")}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                previewLocale === "en"
                  ? "bg-[#202020] text-[#D7C9B2]"
                  : "text-[#777777]"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Dark Preview */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-[#777777]">
            على الخلفية الداكنة (Dark Header):
          </span>
          <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#EAE6DF]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(formData.logoType === "image" || formData.logoType === "both") &&
                previewLogoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewLogoUrl}
                    alt="Logo Preview"
                    style={{ height: `${formData.logoHeightDesktop}px` }}
                    className="w-auto object-contain"
                  />
                )}

              {(formData.logoType === "monogram" ||
                formData.logoType === "both" ||
                !previewLogoUrl) && (
                <div className="w-9 h-9 rounded bg-[#202020] border border-[#EAE6DF]/15 flex items-center justify-center text-[#D7C9B2] font-serif-editorial font-bold text-base shrink-0">
                  {formData.monogramUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.monogramUrl}
                      alt="Monogram"
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    previewMonogram
                  )}
                </div>
              )}

              <div>
                <span className="font-bold text-sm text-[#EAE6DF] block">
                  {previewName}
                </span>
                <span className="text-[11px] text-[#777777] block">
                  {previewTagline}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Light Preview */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-[#777777]">
            على الخلفية الفاتحة (Light Background / Inverted Preview):
          </span>
          <div className="p-4 rounded-lg bg-[#F5F3EF] border border-black/10 flex items-center justify-between text-neutral-900">
            <div className="flex items-center gap-3">
              {(formData.logoType === "image" || formData.logoType === "both") &&
                (formData.logoDarkUrl || previewLogoUrl) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={formData.logoDarkUrl || previewLogoUrl}
                    alt="Logo Dark Preview"
                    style={{ height: `${formData.logoHeightDesktop}px` }}
                    className="w-auto object-contain"
                  />
                )}

              <div className="w-9 h-9 rounded bg-neutral-900 text-[#D7C9B2] font-serif-editorial font-bold text-base flex items-center justify-center shrink-0">
                {previewMonogram}
              </div>

              <div>
                <span className="font-bold text-sm text-neutral-900 block">
                  {previewName}
                </span>
                <span className="text-[11px] text-neutral-600 block">
                  {previewTagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Assets Configuration */}
        <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-5">
          <h3 className="font-bold text-base text-[#D7C9B2]">
            ملفات الشعار الرسمية (Logo Uploads &amp; Paths)
          </h3>

          {/* Logo Type Selector */}
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-2">
              نمط العرض في النافبار والفوتر *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "both", label: "شعار صورة + مونوغرام معاً" },
                { id: "image", label: "شعار صورة فقط (Image Logo)" },
                { id: "monogram", label: "مونوغرام الحرف فقط (Monogram)" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                    formData.logoType === opt.id
                      ? "bg-[#202020] border-[#D7C9B2] text-[#D7C9B2]"
                      : "bg-[#0E0E0E] border-[#EAE6DF]/10 text-[#777777] hover:text-[#EAE6DF]"
                  }`}
                >
                  <span>{opt.label}</span>
                  <input
                    type="radio"
                    name="logoType"
                    checked={formData.logoType === opt.id}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        logoType: opt.id as "monogram" | "image" | "both",
                      })
                    }
                    className="accent-[#D7C9B2]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Primary Logo (for Dark Backgrounds) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#EAE6DF]">
                الشعار الأساسي (للخلفية الداكنة - PNG أو SVG شفاف)
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.logoLightUrl || formData.logoUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logoLightUrl: e.target.value,
                      logoUrl: e.target.value,
                    })
                  }
                  placeholder="/images/brand/logo.png"
                  className="flex-1 min-w-[180px] px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      setFormData({
                        ...formData,
                        logoLightUrl: url,
                        logoUrl: url,
                      })
                    )
                  }
                  className="px-3 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  اختيار
                </button>
                <label className="px-3 py-2 rounded bg-[#202020] hover:bg-[#EAE6DF] text-[#D7C9B2] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingField === "logo" ? "جاري الرفع..." : "رفع مباشر"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    disabled={Boolean(uploadingField)}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleDirectUpload(f, "logo");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Dark Logo (for Light Backgrounds) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#EAE6DF]">
                الشعار البديل (للخلفية الفاتحة - اختياري)
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.logoDarkUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logoDarkUrl: e.target.value })
                  }
                  placeholder="/images/brand/logo-dark.png"
                  className="flex-1 min-w-[180px] px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      setFormData({ ...formData, logoDarkUrl: url })
                    )
                  }
                  className="px-3 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  اختيار
                </button>
                <label className="px-3 py-2 rounded bg-[#202020] hover:bg-[#EAE6DF] text-[#D7C9B2] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingField === "logoDark" ? "جاري الرفع..." : "رفع مباشر"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    disabled={Boolean(uploadingField)}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleDirectUpload(f, "logoDark");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Size Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[#EAE6DF]/8">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#EAE6DF]">ارتفاع الشعار على الشاشات الكبيرة (Desktop):</span>
                <span className="font-mono text-[#D7C9B2] font-bold">
                  {formData.logoHeightDesktop}px
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={64}
                value={formData.logoHeightDesktop}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logoHeightDesktop: parseInt(e.target.value),
                  })
                }
                className="w-full accent-[#D7C9B2] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#EAE6DF]">ارتفاع الشعار على الموبايل (Mobile):</span>
                <span className="font-mono text-[#D7C9B2] font-bold">
                  {formData.logoHeightMobile}px
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={48}
                value={formData.logoHeightMobile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logoHeightMobile: parseInt(e.target.value),
                  })
                }
                className="w-full accent-[#D7C9B2] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Monogram & Site Titles */}
        <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
          <h3 className="font-bold text-base text-[#D7C9B2]">
            المونوغرام واسم الاستوديو (Monogram &amp; Studio Name)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                رمز المونوغرام بالعربية (حرف أو كلمة صغيرة)
              </label>
              <input
                type="text"
                value={formData.monogramText}
                onChange={(e) =>
                  setFormData({ ...formData, monogramText: e.target.value })
                }
                placeholder="خ"
                maxLength={4}
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                Monogram Symbol (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.monogramTextEn}
                onChange={(e) =>
                  setFormData({ ...formData, monogramTextEn: e.target.value })
                }
                placeholder="K"
                maxLength={4}
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                اسم الاستوديو أو الفنان (بالعربية)
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                Studio / Artist Name (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.siteNameEn}
                onChange={(e) =>
                  setFormData({ ...formData, siteNameEn: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                الوصف المختصر أو الشعار النصي (Tagline AR)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                Brand Tagline (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.taglineEn}
                onChange={(e) =>
                  setFormData({ ...formData, taglineEn: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-8 rounded font-bold text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ إعدادات الهوية والشعار"}</span>
        </button>
      </form>
    </div>
  );
}
