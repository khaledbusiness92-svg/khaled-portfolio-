"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Project,
  Category,
  getDriveEmbedUrl,
  getProjectSlug,
} from "@/lib/portfolio";
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit,
  Play,
  Search,
  X,
  Upload,
} from "lucide-react";

interface ProjectsTabProps {
  projects: Project[];
  categories: Category[];
  onSaveProject: (projectData: Partial<Project>, isEdit: boolean) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onOpenMediaPicker: (onSelect: (url: string) => void) => void;
  showNotification: (text: string, type?: "success" | "error") => void;
  autoOpenNew?: boolean;
  onNewOpened?: () => void;
}

export default function ProjectsTab({
  projects,
  categories,
  onSaveProject,
  onDeleteProject,
  onOpenMediaPicker,
  showNotification,
  autoOpenNew,
  onNewOpened,
}: ProjectsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "featured">("all");

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(Boolean(autoOpenNew));
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [languageTab, setLanguageTab] = useState<"ar" | "en">("ar");

  const [prevAutoOpen, setPrevAutoOpen] = useState(autoOpenNew);
  if (autoOpenNew && !prevAutoOpen) {
    setPrevAutoOpen(true);
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingId(null);
    onNewOpened?.();
  } else if (!autoOpenNew && prevAutoOpen) {
    setPrevAutoOpen(false);
  }

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    titleEn: string;
    slug: string;
    category: string;
    image: string;
    thumbnail: string;
    gallery: string[];
    driveVideoUrl: string;
    description: string;
    descriptionEn: string;
    tools: string;
    featured: boolean;
    published: boolean;
    order: number;
  }>({
    title: "",
    titleEn: "",
    slug: "",
    category: "restaurant",
    image: "",
    thumbnail: "",
    gallery: [],
    driveVideoUrl: "",
    description: "",
    descriptionEn: "",
    tools: "Procreate",
    featured: false,
    published: true,
    order: 1,
  });

  const [saving, setSaving] = useState(false);
  const [directUploading, setDirectUploading] = useState(false);

  const handleDirectUploadImage = async (
    file: File,
    target: "cover" | "gallery"
  ) => {
    setDirectUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "cover") {
          setFormData((prev) => ({
            ...prev,
            image: data.url,
            thumbnail: data.url,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, data.url],
          }));
        }
        showNotification("تم رفع واختيار الصورة بنجاح!");
      } else {
        showNotification(data.error || "فشل رفع الصورة", "error");
      }
    } catch {
      showNotification("حدث خطأ أثناء رفع الصورة", "error");
    } finally {
      setDirectUploading(false);
    }
  };

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
        (p.tools && p.tools.some((t) => t.toLowerCase().includes(q)));

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === "published") matchesStatus = p.published !== false;
      if (statusFilter === "draft") matchesStatus = p.published === false;
      if (statusFilter === "featured") matchesStatus = Boolean(p.featured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, search, selectedCategory, statusFilter]);

  const openNewForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      titleEn: "",
      slug: "",
      category: categories[1]?.id || "restaurant",
      image: "",
      thumbnail: "",
      gallery: [],
      driveVideoUrl: "",
      description: "",
      descriptionEn: "",
      tools: "Procreate, Photoshop",
      featured: false,
      published: true,
      order: projects.length + 1,
    });
    setLanguageTab("ar");
    setIsModalOpen(true);
  };

  const openEditForm = (p: Project) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      title: p.title,
      titleEn: p.titleEn || "",
      slug: p.slug || getProjectSlug(p),
      category: p.category,
      image: p.image,
      thumbnail: p.thumbnail || p.image,
      gallery: p.gallery || [],
      driveVideoUrl: p.driveVideoUrl || "",
      description: p.description || "",
      descriptionEn: p.descriptionEn || "",
      tools: p.tools ? p.tools.join(", ") : "",
      featured: Boolean(p.featured),
      published: p.published !== false,
      order: p.order || 1,
    });
    setLanguageTab("ar");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      showNotification("يرجى إدخال عنوان العمل وتحديد صورة الغلاف على الأقل", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Project> = {
        ...formData,
        id: editingId || undefined,
        tools: formData.tools
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await onSaveProject(payload, isEditing);
      showNotification(
        isEditing
          ? `تم تحديث مشروع [${formData.title}] بنجاح!`
          : "تمت إضافة المشروع الجديد بنجاح!"
      );
      setIsModalOpen(false);
    } catch {
      showNotification("حدث خطأ أثناء حفظ المشروع", "error");
    } finally {
      setSaving(false);
    }
  };

  const drivePreviewUrl = getDriveEmbedUrl(formData.driveVideoUrl);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#D7C9B2]" />
            <span>معرض المشاريع والأعمال ({projects.length})</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة كاملة للمشاريع: نصوص ثنائية اللغة، صور الغلاف والمعرض، فيديوهات Drive، وحالة النشر.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عمل جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#777777] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم العمل، الوصف، أو البرامج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
          >
            <option value="all">كافة التصنيفات</option>
            {categories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "published" | "draft" | "featured"
              )
            }
            className="px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
          >
            <option value="all">كافة الحالات</option>
            <option value="published">منشور فقط</option>
            <option value="draft">مسودة فقط</option>
            <option value="featured">أعمال مختارة (Featured)</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#141414] rounded-lg border border-[#EAE6DF]/12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-[#1A1A1A] text-[#777777] border-b border-[#EAE6DF]/10 text-xs font-medium">
              <tr>
                <th className="py-3 px-4">الغلاف</th>
                <th className="py-3 px-4">عنوان العمل (AR / EN)</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">فيديو Drive</th>
                <th className="py-3 px-4">الترتيب</th>
                <th className="py-3 px-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]/8">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777777]">
                    لا توجد مشاريع مطابقة للفلتر المحدد.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isPublished = p.published !== false;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#1C1C1C]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="w-14 h-14 rounded overflow-hidden bg-[#0A0A0A] border border-[#EAE6DF]/12 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#EAE6DF] max-w-xs">
                        <div className="truncate">{p.title}</div>
                        {p.titleEn && (
                          <div
                            className="truncate text-xs font-normal text-[#777777]"
                            dir="ltr"
                          >
                            {p.titleEn}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Link
                            href={`/ar/work/${getProjectSlug(p)}`}
                            target="_blank"
                            className="text-[11px] font-mono text-[#D7C9B2] hover:underline"
                          >
                            معاينة ↗
                          </Link>
                          {p.featured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D7C9B2]/15 text-[#D7C9B2] font-mono">
                              مختار
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/10">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            isPublished
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {isPublished ? "منشور" : "مسودة"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {p.driveVideoUrl ? (
                          <a
                            href={p.driveVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#D7C9B2] hover:underline"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>فيديو</span>
                          </a>
                        ) : (
                          <span className="text-xs text-[#777777]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-[#777777]">
                        {p.order || 1}
                      </td>

                      <td className="py-3 px-4 text-end">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(p)}
                            className="p-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                            title="تعديل المشروع"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `هل أنت متأكد من حذف مشروع "${p.title}" نهائياً؟`
                                )
                              ) {
                                onDeleteProject(p.id);
                              }
                            }}
                            className="p-2 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                            title="حذف المشروع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Project Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#141414] rounded-lg border border-[#EAE6DF]/15 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#EAE6DF]/10">
              <h3 className="font-bold text-base text-[#EAE6DF] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#D7C9B2]" />
                <span>
                  {isEditing ? "تعديل تفاصيل العمل" : "إضافة عمل جديد للمعرض"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded bg-[#202020] text-[#777777] hover:text-[#EAE6DF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Selection Tabs */}
            <div className="px-5 py-2.5 bg-[#181818] border-b border-[#EAE6DF]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777777]">لغة الإدخال:</span>
                <button
                  type="button"
                  onClick={() => setLanguageTab("ar")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    languageTab === "ar"
                      ? "bg-[#202020] text-[#D7C9B2] border border-[#D7C9B2]/40"
                      : "text-[#777777] hover:text-[#EAE6DF]"
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageTab("en")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    languageTab === "en"
                      ? "bg-[#202020] text-[#D7C9B2] border border-[#D7C9B2]/40"
                      : "text-[#777777] hover:text-[#EAE6DF]"
                  }`}
                >
                  English
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#EAE6DF]">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="accent-[#D7C9B2] w-4 h-4"
                  />
                  <span>نشر في الموقع</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#D7C9B2]">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="accent-[#D7C9B2] w-4 h-4"
                  />
                  <span>ضمن الأعمال المختارة</span>
                </label>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                    عنوان العمل (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="مثال: إعلان وجبة برجر شهية"
                    className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                    Project Title (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    placeholder="e.g., Gourmet Burger Campaign"
                    className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                    التصنيف التخصصي *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
                    الترتيب في المعرض (رقم)
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                  />
                </div>
              </div>

              {/* Primary Image */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-[#EAE6DF]">
                  صورة العمل الأساسية (Cover Image) *
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image: e.target.value,
                        thumbnail: e.target.value,
                      })
                    }
                    placeholder="/images/... or /uploads/..."
                    className="flex-1 min-w-[200px] px-3 py-2 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMediaPicker((url) =>
                        setFormData((prev) => ({
                          ...prev,
                          image: url,
                          thumbnail: url,
                        }))
                      )
                    }
                    className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    اختيار من المكتبة
                  </button>
                  <label className="px-3.5 py-2 rounded bg-[#202020] hover:bg-[#EAE6DF] text-[#D7C9B2] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{directUploading ? "جاري الرفع..." : "رفع مباشر"}</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      disabled={directUploading}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleDirectUploadImage(f, "cover");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {formData.image && (
                  <div className="flex items-center gap-3 p-2.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/15">
                    <div className="w-16 h-16 rounded overflow-hidden bg-[#111] shrink-0 border border-[#EAE6DF]/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image}
                        alt="معاينة الغلاف"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#EAE6DF] font-mono truncate">
                        {formData.image}
                      </p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">
                        ✓ الغلاف النشط المعتمد للمشروع
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Gallery Images */}
              <div className="space-y-2 pt-3 border-t border-[#EAE6DF]/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#EAE6DF]">
                    صور المعرض الإضافية للعمل (Additional Gallery Images)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) =>
                          setFormData((prev) => ({
                            ...prev,
                            gallery: [...prev.gallery, url],
                          }))
                        )
                      }
                      className="text-xs text-[#D7C9B2] hover:text-[#EAE6DF] transition-colors cursor-pointer"
                    >
                      + إضافة من المكتبة
                    </button>
                    <label className="text-xs text-[#D7C9B2] hover:text-[#EAE6DF] transition-colors cursor-pointer inline-flex items-center gap-1">
                      <span>+ رفع جديد</span>
                      <input
                        type="file"
                        accept="image/*,.svg"
                        disabled={directUploading}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDirectUploadImage(f, "gallery");
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>

                {formData.gallery && formData.gallery.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                    {formData.gallery.map((imgUrl, gIdx) => (
                      <div
                        key={gIdx}
                        className="relative group aspect-square rounded border border-[#EAE6DF]/15 overflow-hidden bg-[#0A0A0A]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Gallery ${gIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== gIdx),
                            }))
                          }
                          className="absolute top-1 end-1 p-1 rounded-full bg-black/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="حذف الصورة من المعرض"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#777777]">
                    لم يتم إضافة صور إضافية للمعرض (اختياري، يظهر كمعرض متعدد في صفحة تفاصيل العمل).
                  </p>
                )}
              </div>

              {/* Google Drive Video URL */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#EAE6DF]">
                  رابط فيديو Google Drive المرفق (اختياري)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={formData.driveVideoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, driveVideoUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
                {drivePreviewUrl && (
                  <div className="p-3 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 space-y-2">
                    <span className="text-[11px] text-[#D7C9B2] font-mono flex items-center gap-1">
                      <Play className="w-3 h-3" /> معاينة مشغل درايف المدمج:
                    </span>
                    <iframe
                      src={drivePreviewUrl}
                      title="Drive Preview"
                      className="w-full h-44 rounded border-0"
                      allow="autoplay; fullscreen"
                    />
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                    الوصف والفكرة الفنية (بالعربية)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="توضيح الفكرة، الألوان، أو الرسالة..."
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                    Project Concept &amp; Description (English)
                  </label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    placeholder="Explain the concept and composition..."
                    className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2] resize-none"
                  />
                </div>
              </div>

              {/* Tools & Software */}
              <div>
                <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                  البرامج والأدوات المستخدمة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.tools}
                  onChange={(e) =>
                    setFormData({ ...formData, tools: e.target.value })
                  }
                  placeholder="Procreate, Photoshop, Ibispaint X"
                  className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-[#EAE6DF] text-xs border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#EAE6DF]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded text-xs font-medium bg-[#202020] text-[#EAE6DF] hover:bg-[#282828] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? "جاري الحفظ..." : isEditing ? "حفظ التعديلات" : "إضافة العمل الآن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
