"use client";

import { useState } from "react";
import { RevisionSnapshot } from "@/lib/types";
import { History, RotateCcw, CheckCircle2, RefreshCw } from "lucide-react";

interface RevisionsTabProps {
  revisions: RevisionSnapshot[];
  onRestoreRevision: (revisionId: string) => Promise<void>;
  onRefresh: () => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function RevisionsTab({
  revisions,
  onRestoreRevision,
  onRefresh,
  showNotification,
}: RevisionsTabProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (revId: string, timestamp: string) => {
    if (
      !confirm(
        `هل أنت متأكد من رغبتك في استعادة محتويات النسخة المؤرخة في ${new Date(
          timestamp
        ).toLocaleString("ar-EG")}؟`
      )
    ) {
      return;
    }

    setRestoringId(revId);
    try {
      await onRestoreRevision(revId);
      showNotification("تم استعادة النسخة بنجاح وتحديث الموقع!");
    } catch {
      showNotification("فشل استعادة النسخة", "error");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <History className="w-5 h-5 text-[#D7C9B2]" />
            <span>سجل التعديلات والاستعادة (Revision History &amp; Rollback)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            يتم تسجيل لقطة أرشفة تلقائية فور كل عملية حفظ، مما يتيح لك استرجاع أي محتوى سابق بنقرة واحدة.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Revisions Timeline List */}
      <div className="bg-[#141414] rounded-lg border border-[#EAE6DF]/12 overflow-hidden">
        {revisions.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-[#777777]">
            <History className="w-10 h-10 mx-auto opacity-50" />
            <p className="text-sm">لا توجد نسخ محفوظة في السجل حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]/8">
            {revisions.map((rev, idx) => {
              const isFirst = idx === 0;
              const dateStr = new Date(rev.timestamp).toLocaleString("ar-EG", {
                dateStyle: "full",
                timeStyle: "medium",
              });

              return (
                <div
                  key={rev.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#1C1C1C]/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#202020] border border-[#EAE6DF]/12 flex items-center justify-center text-[#D7C9B2] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#EAE6DF] truncate">
                          {rev.summary}
                        </span>
                        {isFirst && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                            النسخة الحالية
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#777777] font-mono">
                        {dateStr} • بواسطة: {rev.author || "Admin"}
                      </p>

                      {rev.snapshot && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#D7C9B2] pt-1">
                          {rev.snapshot.projectsCount !== undefined && (
                            <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10">
                              {rev.snapshot.projectsCount} مشروع
                            </span>
                          )}
                          {rev.snapshot.pagesUpdated &&
                            rev.snapshot.pagesUpdated.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10">
                                الصفحات: {rev.snapshot.pagesUpdated.join(", ")}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={isFirst || restoringId === rev.id}
                      onClick={() => handleRestore(rev.id, rev.timestamp)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-bold bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>
                        {restoringId === rev.id
                          ? "جاري الاسترجاع..."
                          : "استرجاع هذه النسخة"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
