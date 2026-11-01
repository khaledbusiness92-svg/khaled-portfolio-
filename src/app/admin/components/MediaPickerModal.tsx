"use client";

import { useState, useMemo } from "react";
import { MediaAsset } from "@/lib/types";
import { Search, Upload, X, Check, Image as ImageIcon } from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  media: MediaAsset[];
  onUploadSuccess: (asset: MediaAsset) => void;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  media,
  onUploadSuccess,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return media;
    return media.filter(
      (m) =>
        m.filename.toLowerCase().includes(q) ||
        m.alt.toLowerCase().includes(q) ||
        (m.altEn && m.altEn.toLowerCase().includes(q))
    );
  }, [media, search]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (data.asset) {
          onUploadSuccess(data.asset);
        }
        setSelectedUrl(data.url);
      } else {
        setUploadError(data.error || "فشل رفع الصورة");
      }
    } catch {
      setUploadError("حدث خطأ في الاتصال أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#141414] rounded-lg border border-[#EAE6DF]/15 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EAE6DF]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#202020] border border-[#EAE6DF]/12 flex items-center justify-center text-[#D7C9B2]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#EAE6DF]">
                اختيار صورة من مكتبة الوسائط
              </h3>
              <p className="text-xs text-[#777777]">
                اختر صورة موجودة أو ارفع صورة جديدة مباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded bg-[#202020] text-[#777777] hover:text-[#EAE6DF] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Quick Upload */}
        <div className="p-4 border-b border-[#EAE6DF]/10 bg-[#181818] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#777777] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="البحث باسم الملف أو الوصف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-4 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] cursor-pointer transition-colors shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "جاري الرفع..." : "رفع صورة جديدة"}</span>
            <input
              type="file"
              accept="image/*,.svg"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {uploadError && (
          <div className="px-5 py-2.5 bg-red-950/60 text-red-200 text-xs border-b border-red-500/30">
            {uploadError}
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ImageIcon className="w-10 h-10 text-[#777777] mx-auto" />
              <p className="text-sm text-[#777777]">
                لا توجد صور مطابقة لبحثك في مكتبة الوسائط
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredMedia.map((asset) => {
                const isSelected = selectedUrl === asset.url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedUrl(asset.url)}
                    className={`group relative aspect-square rounded-md overflow-hidden border transition-all text-start cursor-pointer ${
                      isSelected
                        ? "border-[#D7C9B2] ring-2 ring-[#D7C9B2]/50 bg-[#202020]"
                        : "border-[#EAE6DF]/10 bg-[#0E0E0E] hover:border-[#D7C9B2]/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-[#D7C9B2]/20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#D7C9B2] text-[#0A0A0A] flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-[10px] text-[#EAE6DF] truncate">
                      {asset.filename}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE6DF]/10 bg-[#181818] flex items-center justify-between gap-3">
          <div className="text-xs text-[#777777] truncate">
            {selectedUrl ? (
              <span>
                الملف المحدد:{" "}
                <strong className="text-[#D7C9B2] font-mono">{selectedUrl}</strong>
              </span>
            ) : (
              <span>يرجى النقر على صورة لاختيارها</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-medium bg-[#202020] text-[#EAE6DF] hover:bg-[#282828] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirm}
              className="px-5 py-2 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] cursor-pointer transition-colors"
            >
              تأكيد الاختيار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

