"use client";

import { useState } from "react";
import { ProfileData, StatItem } from "@/lib/types";
import { User, Save, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";

interface ProfileTabProps {
  profile: ProfileData;
  onSaveProfile: (profile: ProfileData) => Promise<void>;
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function ProfileTab({
  profile,
  onSaveProfile,
  onOpenMediaPicker,
  showNotification,
}: ProfileTabProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: profile.name || "خالد محمد عبد السميع",
    nameEn: profile.nameEn || "Khaled Mohamed Abdel Samee",
    title: profile.title || "مصمم جرافيك ورسام رقمي",
    titleEn: profile.titleEn || "Digital Artist & Visual Creator",
    bio: profile.bio || "",
    bioEn: profile.bioEn || "",
    avatar: profile.avatar || "",
    heroBg: profile.heroBg || "",
    experienceYears: profile.experienceYears || "+5",
    experienceYearsEn: profile.experienceYearsEn || "5+",
    stats: profile.stats ? [...profile.stats] : [],
    contact: {
      whatsapp: profile.contact?.whatsapp || "+201012345678",
      email: profile.contact?.email || "khaled.abdelsamie.design@gmail.com",
      behance: profile.contact?.behance || "https://www.behance.net",
      instagram: profile.contact?.instagram || "https://www.instagram.com",
      location: profile.contact?.location || "مصر — متاح للعمل الحر والتعاون عن بُعد",
      locationEn: profile.contact?.locationEn || "Egypt — Available for Freelance & Remote Collaboration",
    },
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<string | null>(null);

  const handleDirectUpload = async (
    file: File,
    field: "avatar" | "heroBg"
  ) => {
    setUploadingImg(field);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        showNotification("تم رفع واختيار الصورة بنجاح!");
      } else {
        showNotification(data.error || "فشل رفع الصورة", "error");
      }
    } catch {
      showNotification("حدث خطأ أثناء رفع الصورة", "error");
    } finally {
      setUploadingImg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(formData);
      showNotification("تم حفظ وتحديث بيانات البروفايل بنجاح!");
    } catch {
      showNotification("فشل حفظ بيانات البروفايل", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStat = () => {
    setFormData({
      ...formData,
      stats: [
        ...formData.stats,
        {
          label: "مؤشر جديد",
          labelEn: "New Metric",
          value: "+10",
          valueEn: "10+",
        },
      ],
    });
  };

  const handleUpdateStat = (idx: number, updates: Partial<StatItem>) => {
    const newStats = [...formData.stats];
    newStats[idx] = { ...newStats[idx], ...updates };
    setFormData({ ...formData, stats: newStats });
  };

  const handleRemoveStat = (idx: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== idx),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <User className="w-5 h-5 text-[#D7C9B2]" />
            <span>بيانات الفنان والسيرة الشخصية (Profile &amp; About)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة صورة البروفايل، النبذة التعريفية باللغتين، إحصائيات الخبرة، وقنوات التواصل المباشرة.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ بيانات البروفايل"}</span>
        </button>
      </div>

      {/* Profile Avatar & Hero Image */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
          صورة الفنان والخلفية (Avatar &amp; Hero Images)
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-40 rounded overflow-hidden border border-[#D7C9B2]/40 relative bg-[#0A0A0A] shrink-0">
            {formData.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#777777]">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                مسار أو رابط صورة البروفايل
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  className="flex-1 min-w-[200px] px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      setFormData({ ...formData, avatar: url })
                    )
                  }
                  className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  اختيار صورة
                </button>
                <label className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#EAE6DF] text-[#D7C9B2] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImg === "avatar" ? "جاري الرفع..." : "رفع جديد"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    disabled={Boolean(uploadingImg)}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleDirectUpload(f, "avatar");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                خلفية قسم الهيرو (Hero Background URL)
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.heroBg || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heroBg: e.target.value })
                  }
                  placeholder="https://... or /images/..."
                  className="flex-1 min-w-[200px] px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      setFormData({ ...formData, heroBg: url })
                    )
                  }
                  className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  اختيار خلفية
                </button>
                <label className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#EAE6DF] text-[#D7C9B2] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImg === "heroBg" ? "جاري الرفع..." : "رفع جديد"}</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    disabled={Boolean(uploadingImg)}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleDirectUpload(f, "heroBg");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Names & Titles */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
          الاسم والمسمى الوظيفي (Bilingual Titles)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              الاسم الكامل (بالعربية)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Full Name (English)
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.nameEn || ""}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              المسمى الفني التخصصي (بالعربية)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Professional Title (English)
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.titleEn || ""}
              onChange={(e) =>
                setFormData({ ...formData, titleEn: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>
        </div>

        {/* Bios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              النبذة التعريفية (بالعربية)
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Artist Bio (English)
            </label>
            <textarea
              rows={4}
              dir="ltr"
              value={formData.bioEn || ""}
              onChange={(e) =>
                setFormData({ ...formData, bioEn: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Portfolio Statistics */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
            أرقام وإحصائيات الخبرة (Portfolio Statistics)
          </h3>
          <button
            type="button"
            onClick={handleAddStat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مؤشر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 space-y-3 relative group"
            >
              <button
                type="button"
                onClick={() => handleRemoveStat(idx)}
                className="absolute top-2 end-2 p-1 text-[#777777] hover:text-red-400 cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#777777] mb-1">
                    الوصف (عربي)
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) =>
                      handleUpdateStat(idx, { label: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#777777] mb-1">
                    Label (EN)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={stat.labelEn || ""}
                    onChange={(e) =>
                      handleUpdateStat(idx, { labelEn: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#777777] mb-1">
                    القيمة (عربي)
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) =>
                      handleUpdateStat(idx, { value: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#777777] mb-1">
                    Value (EN)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={stat.valueEn || stat.value}
                    onChange={(e) =>
                      handleUpdateStat(idx, { valueEn: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Channels & Socials */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
          قنوات التواصل والسوشيال ميديا (Contact &amp; Social Channels)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              رقم الواتساب مع كود الدولة
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.contact.whatsapp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, whatsapp: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              البريد الإلكتروني الرسمي
            </label>
            <input
              type="email"
              dir="ltr"
              value={formData.contact.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              رابط Behance
            </label>
            <input
              type="url"
              dir="ltr"
              value={formData.contact.behance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, behance: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              رابط Instagram
            </label>
            <input
              type="url"
              dir="ltr"
              value={formData.contact.instagram}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, instagram: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              الموقع الجغرافي وحالة التفرغ (عربي)
            </label>
            <input
              type="text"
              value={formData.contact.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, location: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Location &amp; Availability (English)
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.contact.locationEn || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, locationEn: e.target.value },
                })
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
        <span>{saving ? "جاري الحفظ..." : "حفظ بيانات البروفايل والتواصل"}</span>
      </button>
    </form>
  );
}
