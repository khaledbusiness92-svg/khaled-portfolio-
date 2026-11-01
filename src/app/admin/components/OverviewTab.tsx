"use client";

import Link from "next/link";
import {
  FolderKanban,
  FileText,
  Images,
  Palette,
  Plus,
  Upload,
  ExternalLink,
  History,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Project, MediaAsset, RevisionSnapshot } from "@/lib/types";

interface OverviewTabProps {
  stats: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    featuredProjects: number;
    totalCategories: number;
    totalSkills: number;
    totalMedia: number;
    totalMediaBytes: number;
    totalPages: number;
  };
  recentProjects: Project[];
  recentMedia: MediaAsset[];
  recentRevisions: RevisionSnapshot[];
  onNavigateTab: (tabId: string) => void;
  onOpenNewProject: () => void;
  onOpenMediaModal: () => void;
}

export default function OverviewTab({
  stats,
  recentProjects,
  recentMedia,
  recentRevisions,
  onNavigateTab,
  onOpenNewProject,
  onOpenMediaModal,
}: OverviewTabProps) {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-lg bg-gradient-to-r from-[#181818] to-[#121212] border border-[#EAE6DF]/12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#D7C9B2]/15 text-[#D7C9B2] border border-[#D7C9B2]/30 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#D7C9B2] animate-pulse" />
            <span>Studio CMS Online // النظام متصل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EAE6DF]">
            مرحباً بك في لوحة إدارة الاستوديو
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] max-w-2xl leading-relaxed">
            تحكم كامل في كافة صفحات الموقع، المعارض، الوسائط، الهوية البصرية، والنصوص بالعربية والإنجليزية مع حفظ فوري وأرشفة تلقائية.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={onOpenNewProject}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عمل جديد</span>
          </button>

          <button
            type="button"
            onClick={onOpenMediaModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-xs font-bold bg-[#202020] hover:bg-[#282828] text-[#EAE6DF] border border-[#EAE6DF]/15 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#D7C9B2]" />
            <span>رفع وسائط</span>
          </button>

          <Link
            href="/ar"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded text-xs font-medium text-[#777777] hover:text-[#D7C9B2] bg-[#141414] border border-[#EAE6DF]/10 transition-colors"
          >
            <span>زيارة الموقع</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab("projects")}
          className="p-5 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 hover:border-[#D7C9B2]/40 transition-colors cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-xs">المشاريع والأعمال</span>
            <FolderKanban className="w-4 h-4 text-[#D7C9B2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#EAE6DF]">
            {stats.totalProjects}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#777777]">
            <span className="text-emerald-400">
              {stats.publishedProjects} منشور
            </span>
            <span>•</span>
            <span className="text-amber-400">{stats.draftProjects} مسودة</span>
            <span>•</span>
            <span className="text-[#D7C9B2]">
              {stats.featuredProjects} مختار
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("media")}
          className="p-5 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 hover:border-[#D7C9B2]/40 transition-colors cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-xs">مكتبة الوسائط</span>
            <Images className="w-4 h-4 text-[#D7C9B2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#EAE6DF]">
            {stats.totalMedia}
          </div>
          <div className="text-[11px] text-[#777777]">
            إجمالي الحجم:{" "}
            <span className="font-mono text-[#EAE6DF]">
              {formatBytes(stats.totalMediaBytes)}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("pages")}
          className="p-5 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 hover:border-[#D7C9B2]/40 transition-colors cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-xs">الصفحات النشطة</span>
            <FileText className="w-4 h-4 text-[#D7C9B2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#EAE6DF]">
            {stats.totalPages}
          </div>
          <div className="text-[11px] text-[#777777]">
            الرئيسية، المعرض، عن الفنان، وتواصل
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("brand")}
          className="p-5 rounded-lg bg-[#141414] border border-[#EAE6DF]/10 hover:border-[#D7C9B2]/40 transition-colors cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-xs">الهوية والبراند</span>
            <Palette className="w-4 h-4 text-[#D7C9B2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#EAE6DF] truncate">
            جاهز ومفعل
          </div>
          <div className="text-[11px] text-[#777777]">
            الشعار، الألوان، المقاسات، والتايبوغرافي
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Works & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Projects (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] rounded-lg border border-[#EAE6DF]/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]/10">
            <h3 className="font-bold text-base text-[#EAE6DF] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#D7C9B2]" />
              <span>أحدث الأعمال المضافة للمعرض</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("projects")}
              className="text-xs text-[#D7C9B2] hover:underline cursor-pointer"
            >
              عرض الكل ({stats.totalProjects}) ←
            </button>
          </div>

          <div className="divide-y divide-[#EAE6DF]/8">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#EAE6DF] truncate">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#777777]">
                      <span className="font-mono text-[#D7C9B2]">
                        {p.category}
                      </span>
                      <span>•</span>
                      <span>{p.createdAt || "منشور"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/ar/work/${p.slug || p.id}`}
                    target="_blank"
                    className="p-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#777777] hover:text-[#0A0A0A] transition-colors"
                    title="معاينة في الموقع"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Media & Revisions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Media Assets */}
          <div className="bg-[#141414] rounded-lg border border-[#EAE6DF]/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]/10">
              <h3 className="font-bold text-base text-[#EAE6DF] flex items-center gap-2">
                <Images className="w-4 h-4 text-[#D7C9B2]" />
                <span>أحدث الوسائط المرفوعة</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("media")}
                className="text-xs text-[#D7C9B2] hover:underline cursor-pointer"
              >
                المكتبة الكاملة ←
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {recentMedia.map((m) => (
                <div
                  key={m.id}
                  className="aspect-square rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 overflow-hidden relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt={m.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Audit / Revision History */}
          <div className="bg-[#141414] rounded-lg border border-[#EAE6DF]/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]/10">
              <h3 className="font-bold text-base text-[#EAE6DF] flex items-center gap-2">
                <History className="w-4 h-4 text-[#D7C9B2]" />
                <span>سجل التعديلات الأخير</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("revisions")}
                className="text-xs text-[#D7C9B2] hover:underline cursor-pointer"
              >
                السجل الكامل ←
              </button>
            </div>

            <div className="space-y-3">
              {recentRevisions.length === 0 ? (
                <p className="text-xs text-[#777777]">
                  لا توجد تعديلات سابقة مسجلة بعد.
                </p>
              ) : (
                recentRevisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-start gap-2.5 text-xs text-[#777777]"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#D7C9B2] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[#EAE6DF] font-medium truncate">
                        {rev.summary}
                      </p>
                      <p className="text-[11px] font-mono text-[#777777]">
                        {new Date(rev.timestamp).toLocaleString("ar-EG")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
