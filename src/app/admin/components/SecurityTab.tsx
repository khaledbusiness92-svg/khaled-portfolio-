"use client";

import { useState } from "react";
import { ShieldCheck, Key, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

interface SecurityTabProps {
  lastPasswordChange?: string;
  onLogout: () => void;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function SecurityTab({
  lastPasswordChange,
  onLogout,
  showNotification,
}: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("كلمة المرور الجديدة غير متطابقة مع التأكيد.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "تم تغيير كلمة المرور وتأمين الجلسة بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showNotification("تم تحديث كلمة المرور وتشفيرها بنجاح!");
      } else {
        setErrorMsg(data.error || "فشل تغيير كلمة المرور");
      }
    } catch {
      setErrorMsg("حدث خطأ في الاتصال بالخادم أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D7C9B2]" />
            <span>الأمان وكلمات المرور (Security &amp; Credentials)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة كلمة مرور لوحة التحكم، فحص التشفير وحماية الجلسة، والتحكم في تسجيل الخروج.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج من اللوحة</span>
        </button>
      </div>

      {/* Change Password Card */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#D7C9B2]" />
          <h3 className="font-bold text-base text-[#EAE6DF]">
            تغيير كلمة مرور المشرف (Change Admin Password)
          </h3>
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              كلمة المرور الحالية *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية..."
              className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              كلمة المرور الجديدة (6 أحرف على الأقل) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة..."
              className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1.5">
              تأكيد كلمة المرور الجديدة *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة..."
              className="w-full px-3 py-2.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 focus:outline-none focus:border-[#D7C9B2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded text-xs font-bold bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "جاري التحديث..." : "تحديث وتأمين كلمة المرور"}
          </button>
        </form>
      </div>

      {/* Security Architecture Checklist */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <h3 className="font-bold text-sm text-[#D7C9B2] uppercase tracking-wider">
          طبقات الحماية المعتمدة في النظام (Security Features)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#EAE6DF]">تشفير PBKDF2-SHA512</p>
              <p className="text-[#777777] text-[11px] mt-0.5">
                تجزئة بـ 100,000 دورة تكرار مع ملح تشفيري فريد ومقارنة Timing-Safe.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#EAE6DF]">جلسات موقعة HMAC-SHA256</p>
              <p className="text-[#777777] text-[11px] mt-0.5">
                كوكي HTTP-only مشفر وموقع لمنع التلاعب وتزوير الجلسات (Anti-Tamper).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#EAE6DF]">حماية ضد القوة الغاشمة (Rate Limiting)</p>
              <p className="text-[#777777] text-[11px] mt-0.5">
                حظر تلقائي لمدة 15 دقيقة بعد 5 محاولات دخول فاشلة متتالية.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#EAE6DF]">فحص وتطهير ملفات SVG</p>
              <p className="text-[#777777] text-[11px] mt-0.5">
                حظر نصوص الـ JavaScript، هجمات XXE، والوسوم التنفيذية في ملفات الـ SVG.
              </p>
            </div>
          </div>
        </div>

        {lastPasswordChange && (
          <p className="text-[11px] font-mono text-[#777777] pt-2">
            آخر تغيير مسجل لكلمة المرور:{" "}
            {new Date(lastPasswordChange).toLocaleString("ar-EG")}
          </p>
        )}
      </div>
    </div>
  );
}
