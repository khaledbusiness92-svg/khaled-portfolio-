"use client";

import { useState, useMemo } from "react";
import { MediaAsset } from "@/lib/types";
import {
  Images,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  Edit,
  ExternalLink,
  AlertCircle,
  Grid,
  List,
  X,
} from "lucide-react";

interface MediaWithUsage extends MediaAsset {
  isUsed?: boolean;
  usageCount?: number;
  usageLocations?: string[];
}

interface MediaTabProps {
  media: MediaWithUsage[];
  onUploadFile: (file: File) => Promise<void>;
  onUpdateMedia: (id: string, alt: string, altEn: string) => Promise<void>;
  onDeleteMedia: (id: string, force?: boolean) => Promise<{ inUse?: boolean; locations?: string[] } | void>;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function MediaTab({
  media,
  onUploadFile,
  onUpdateMedia,
  onDeleteMedia,
  showNotification,
}: MediaTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Edit Alt Modal
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [editAltAr, setEditAltAr] = useState("");
  const [editAltEn, setEditAltEn] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);

  // In-Use Warning Modal
  const [warningData, setWarningData] = useState<{
    id: string;
    locations: string[];
  } | null>(null);

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.filename.toLowerCase().includes(q) ||
        m.alt.toLowerCase().includes(q) ||
        (m.altEn && m.altEn.toLowerCase().includes(q));

      const matchesType =
        typeFilter === "all" || m.mimeType.toLowerCase().includes(typeFilter);

      return matchesSearch && matchesType;
    });
  }, [media, search, typeFilter]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await onUploadFile(files[i]);
      }
      showNotification(`تم رفع ${files.length} ملف بنجاح!`);
    } catch {
      showNotification("حدث خطأ أثناء رفع أحد الملفات", "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showNotification("تم نسخ رابط الصورة إلى الحافظة!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openEditAlt = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setEditAltAr(asset.alt || "");
    setEditAltEn(asset.altEn || "");
  };

  const handleSaveAlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    setSavingAlt(true);
    try {
      await onUpdateMedia(editingAsset.id, editAltAr, editAltEn);
      showNotification("تم تحديث نصوص Alt البديلة بنجاح!");
      setEditingAsset(null);
    } catch {
      showNotification("فشل تحديث بيانات الصورة", "error");
    } finally {
      setSavingAlt(false);
    }
  };

  const handleDelete = async (id: string, force = false) => {
    try {
      const result = await onDeleteMedia(id, force);
      if (result && result.inUse) {
        setWarningData({ id, locations: result.locations || [] });
      } else {
        setWarningData(null);
        showNotification("تم حذف ملف الوسائط بنجاح!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حذف الملف";
      showNotification(msg, "error");
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <Images className="w-5 h-5 text-[#D7C9B2]" />
            <span>مكتبة الوسائط والصور ({media.length})</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            مركز موحد لإدارة كافة صور المعرض، اللوجوهات، وخلفيات الأقسام مع فحص التبعيات وتحديث نصوص الـ Alt.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          <span>{uploading ? "جاري الرفع..." : "رفع ملفات جديدة"}</span>
          <input
            type="file"
            multiple
            accept="image/*,.svg"
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#777777] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم الملف أو النص البديل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
          >
            <option value="all">كافة الأنواع</option>
            <option value="jpeg">JPEG / JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
            <option value="gif">GIF</option>
          </select>

          <div className="flex rounded border border-[#EAE6DF]/12 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#D7C9B2] text-[#0A0A0A]"
                  : "bg-[#202020] text-[#777777] hover:text-[#EAE6DF]"
              }`}
              title="عرض شبكي"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#D7C9B2] text-[#0A0A0A]"
                  : "bg-[#202020] text-[#777777] hover:text-[#EAE6DF]"
              }`}
              title="عرض كجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((asset) => {
            const isCopied = copiedId === asset.id;
            return (
              <div
                key={asset.id}
                className="group rounded-lg bg-[#141414] border border-[#EAE6DF]/10 hover:border-[#D7C9B2]/50 overflow-hidden flex flex-col justify-between transition-all"
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-square bg-[#0A0A0A] overflow-hidden flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.alt || asset.filename}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                  />

                  {/* Usage Badge */}
                  {asset.isUsed ? (
                    <span
                      title={`مستخدم في: ${asset.usageLocations?.join(", ")}`}
                      className="absolute top-2 start-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                    >
                      مستخدم ({asset.usageCount})
                    </span>
                  ) : (
                    <span className="absolute top-2 start-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#202020]/80 text-[#777777] border border-[#EAE6DF]/10">
                      غير مستخدم
                    </span>
                  )}
                </div>

                {/* Details & Actions */}
                <div className="p-3 space-y-2 border-t border-[#EAE6DF]/8">
                  <div className="truncate text-xs font-bold text-[#EAE6DF]" title={asset.filename}>
                    {asset.filename}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
                    <span>{formatSize(asset.sizeBytes)}</span>
                    <span className="uppercase">{asset.mimeType.split("/")[1] || "IMG"}</span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-1 flex items-center justify-between border-t border-[#EAE6DF]/8 text-xs">
                    <button
                      type="button"
                      onClick={() => copyUrl(asset.id, asset.url)}
                      className="p-1 rounded text-[#777777] hover:text-[#D7C9B2] cursor-pointer"
                      title="نسخ الرابط"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditAlt(asset)}
                      className="p-1 rounded text-[#777777] hover:text-[#D7C9B2] cursor-pointer"
                      title="تعديل النص البديل Alt"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-[#777777] hover:text-[#D7C9B2]"
                      title="فتح بالحجم الكامل"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      className="p-1 rounded text-[#777777] hover:text-red-400 cursor-pointer"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#141414] rounded-lg border border-[#EAE6DF]/12 overflow-hidden">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#1A1A1A] text-[#777777] border-b border-[#EAE6DF]/10">
              <tr>
                <th className="py-3 px-4">المعاينة</th>
                <th className="py-3 px-4">اسم الملف</th>
                <th className="py-3 px-4">النوع / الحجم</th>
                <th className="py-3 px-4">حالة الاستخدام</th>
                <th className="py-3 px-4">النص البديل (Alt)</th>
                <th className="py-3 px-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]/8">
              {filteredMedia.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#1C1C1C]/60 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="w-12 h-12 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.alt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#EAE6DF] max-w-xs truncate">
                    {asset.filename}
                  </td>
                  <td className="py-2.5 px-4 text-[#777777] font-mono">
                    {asset.mimeType} / {formatSize(asset.sizeBytes)}
                  </td>
                  <td className="py-2.5 px-4">
                    {asset.isUsed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        مستخدم ({asset.usageCount})
                      </span>
                    ) : (
                      <span className="text-[#777777] text-[11px]">غير مستخدم</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-[#777777] max-w-xs truncate">
                    {asset.alt || "—"}
                  </td>
                  <td className="py-2.5 px-4 text-end">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyUrl(asset.id, asset.url)}
                        className="p-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#777777] hover:text-[#0A0A0A] cursor-pointer"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditAlt(asset)}
                        className="p-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#777777] hover:text-[#0A0A0A] cursor-pointer"
                        title="تعديل Alt"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/20 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Alt Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161616] p-6 rounded-lg border border-[#EAE6DF]/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]/10">
              <h3 className="font-bold text-sm text-[#EAE6DF]">
                تعديل النص البديل للصورة (Alt Text)
              </h3>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="p-1 rounded bg-[#202020] text-[#777777] hover:text-[#EAE6DF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-20 h-20 mx-auto rounded overflow-hidden border border-[#EAE6DF]/15 bg-[#0A0A0A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editingAsset.url}
                alt="معاينة"
                className="w-full h-full object-contain"
              />
            </div>

            <form onSubmit={handleSaveAlt} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                  النص البديل (بالعربية)
                </label>
                <input
                  type="text"
                  value={editAltAr}
                  onChange={(e) => setEditAltAr(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
                  Alt Text (English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editAltEn}
                  onChange={(e) => setEditAltEn(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded text-xs bg-[#202020] text-[#EAE6DF]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingAlt}
                  className="px-5 py-2 rounded text-xs font-bold bg-[#D7C9B2] text-[#0A0A0A]"
                >
                  {savingAlt ? "جاري الحفظ..." : "حفظ التعديل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Use Dependency Warning Modal */}
      {warningData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161616] p-6 rounded-lg border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base">تحذير: هذا الملف قيد الاستخدام!</h3>
            </div>

            <p className="text-xs text-[#EAE6DF]/80 leading-relaxed">
              هذه الصورة مستخدمة حالياً في العناصر التالية داخل الموقع، وحذفها قد يسبب ظهور مساحة فارغة:
            </p>

            <ul className="p-3 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 text-xs text-[#D7C9B2] space-y-1 max-h-36 overflow-y-auto font-mono">
              {warningData.locations.map((loc, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span>•</span>
                  <span>{loc}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWarningData(null)}
                className="px-4 py-2 rounded text-xs font-medium bg-[#202020] text-[#EAE6DF] hover:bg-[#282828]"
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                onClick={() => handleDelete(warningData.id, true)}
                className="px-4 py-2 rounded text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                تأكيد الحذف على أية حال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
