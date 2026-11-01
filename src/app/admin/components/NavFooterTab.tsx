"use client";

import { useState } from "react";
import { NavigationItem, FooterSettings, FooterLink } from "@/lib/types";
import {
  Navigation,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layout,
} from "lucide-react";

interface NavFooterTabProps {
  navigation: NavigationItem[];
  footer: FooterSettings;
  onSaveNavigation: (items: NavigationItem[]) => Promise<void>;
  onSaveFooter: (footer: FooterSettings) => Promise<void>;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function NavFooterTab({
  navigation,
  footer,
  onSaveNavigation,
  onSaveFooter,
  showNotification,
}: NavFooterTabProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>([...navigation]);
  const [footerData, setFooterData] = useState<FooterSettings>({
    bioSummary: footer.bioSummary || "",
    bioSummaryEn: footer.bioSummaryEn || "",
    copyrightText: footer.copyrightText || "",
    copyrightTextEn: footer.copyrightTextEn || "",
    showSocialLinks: footer.showSocialLinks !== false,
    showContactChannels: footer.showContactChannels !== false,
    showSitemap: footer.showSitemap !== false,
    links: footer.links ? [...footer.links] : [],
  });

  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        onSaveNavigation(navItems),
        onSaveFooter(footerData),
      ]);
      showNotification("تم حفظ وتحديث إعدادات القائمة والفوتر بنجاح!");
    } catch {
      showNotification("فشل حفظ إعدادات القائمة والفوتر", "error");
    } finally {
      setSaving(false);
    }
  };

  // Nav Actions
  const handleAddNavItem = () => {
    setNavItems([
      ...navItems,
      {
        id: `nav-${Date.now()}`,
        href: "/new-link",
        label: "رابط جديد",
        labelEn: "New Link",
        visible: true,
        order: navItems.length + 1,
      },
    ]);
  };

  const handleMoveNavItem = (index: number, direction: "up" | "down") => {
    const list = [...navItems];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    list.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setNavItems(list);
  };

  const handleUpdateNavItem = (index: number, updates: Partial<NavigationItem>) => {
    const list = [...navItems];
    list[index] = { ...list[index], ...updates };
    setNavItems(list);
  };

  const handleDeleteNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  // Footer Link Actions
  const handleAddFooterLink = () => {
    setFooterData({
      ...footerData,
      links: [
        ...footerData.links,
        {
          id: `flink-${Date.now()}`,
          href: "/",
          label: "رابط فوتر جديد",
          labelEn: "New Footer Link",
          visible: true,
          order: footerData.links.length + 1,
        },
      ],
    });
  };

  const handleUpdateFooterLink = (index: number, updates: Partial<FooterLink>) => {
    const list = [...footerData.links];
    list[index] = { ...list[index], ...updates };
    setFooterData({ ...footerData, links: list });
  };

  const handleDeleteFooterLink = (index: number) => {
    setFooterData({
      ...footerData,
      links: footerData.links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#D7C9B2]" />
            <span>القائمة الرئيسية والفوتر (Navigation &amp; Footer)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة روابط النافبار، حقوق الملكية، نبذة الفوتر، وقنوات الاتصال والسوشيال ميديا.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ القائمة والفوتر"}</span>
        </button>
      </div>

      {/* Navigation Items Manager */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#EAE6DF]">
            روابط القائمة الرئيسية في النافبار ({navItems.length})
          </h3>
          <button
            type="button"
            onClick={handleAddNavItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة رابط</span>
          </button>
        </div>

        <div className="divide-y divide-[#EAE6DF]/8">
          {navItems.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === navItems.length - 1;

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-6 h-6 rounded bg-[#202020] text-[#D7C9B2] font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMoveNavItem(idx, "up")}
                    className="p-1 rounded bg-[#202020] text-[#777777] hover:text-[#D7C9B2] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMoveNavItem(idx, "down")}
                    className="p-1 rounded bg-[#202020] text-[#777777] hover:text-[#D7C9B2] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      handleUpdateNavItem(idx, { label: e.target.value })
                    }
                    placeholder="العنوان بالعربية"
                    className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={item.labelEn}
                    onChange={(e) =>
                      handleUpdateNavItem(idx, { labelEn: e.target.value })
                    }
                    placeholder="Label in English"
                    className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={item.href}
                    onChange={(e) =>
                      handleUpdateNavItem(idx, { href: e.target.value })
                    }
                    placeholder="/ or /work"
                    className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-[#777777] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.visible !== false}
                      onChange={(e) =>
                        handleUpdateNavItem(idx, { visible: e.target.checked })
                      }
                      className="accent-[#D7C9B2]"
                    />
                    <span>ظاهر</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteNavItem(idx)}
                    className="p-1.5 rounded text-[#777777] hover:text-red-400 cursor-pointer"
                    title="حذف الرابط"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Settings Manager */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-6">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-[#D7C9B2]" />
          <h3 className="font-bold text-base text-[#EAE6DF]">
            إعدادات الفوتر ونصوص التذييل (Footer Configuration)
          </h3>
        </div>

        {/* Section Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="p-3 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-center justify-between text-xs text-[#EAE6DF] cursor-pointer">
            <span>عرض خريطة الموقع (Sitemap Links)</span>
            <input
              type="checkbox"
              checked={footerData.showSitemap}
              onChange={(e) =>
                setFooterData({ ...footerData, showSitemap: e.target.checked })
              }
              className="accent-[#D7C9B2] w-4 h-4"
            />
          </label>

          <label className="p-3 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-center justify-between text-xs text-[#EAE6DF] cursor-pointer">
            <span>عرض قنوات التواصل المباشر</span>
            <input
              type="checkbox"
              checked={footerData.showContactChannels}
              onChange={(e) =>
                setFooterData({
                  ...footerData,
                  showContactChannels: e.target.checked,
                })
              }
              className="accent-[#D7C9B2] w-4 h-4"
            />
          </label>

          <label className="p-3 rounded bg-[#0A0A0A] border border-[#EAE6DF]/10 flex items-center justify-between text-xs text-[#EAE6DF] cursor-pointer">
            <span>عرض روابط السوشيال ميديا</span>
            <input
              type="checkbox"
              checked={footerData.showSocialLinks}
              onChange={(e) =>
                setFooterData({
                  ...footerData,
                  showSocialLinks: e.target.checked,
                })
              }
              className="accent-[#D7C9B2] w-4 h-4"
            />
          </label>
        </div>

        {/* Bios & Copyright */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              النبذة المختصرة أسفل الشعار (عربي)
            </label>
            <textarea
              rows={2}
              value={footerData.bioSummary}
              onChange={(e) =>
                setFooterData({ ...footerData, bioSummary: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Footer Bio Summary (English)
            </label>
            <textarea
              rows={2}
              dir="ltr"
              value={footerData.bioSummaryEn}
              onChange={(e) =>
                setFooterData({ ...footerData, bioSummaryEn: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              حقوق الملكية (Copyright AR)
            </label>
            <input
              type="text"
              value={footerData.copyrightText}
              onChange={(e) =>
                setFooterData({ ...footerData, copyrightText: e.target.value })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EAE6DF] mb-1">
              Copyright Text (English)
            </label>
            <input
              type="text"
              dir="ltr"
              value={footerData.copyrightTextEn}
              onChange={(e) =>
                setFooterData({
                  ...footerData,
                  copyrightTextEn: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
            />
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-3 pt-2 border-t border-[#EAE6DF]/8">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#D7C9B2] uppercase tracking-wider">
              روابط خريطة الموقع في الفوتر
            </h4>
            <button
              type="button"
              onClick={handleAddFooterLink}
              className="text-xs text-[#D7C9B2] hover:underline cursor-pointer"
            >
              + إضافة رابط للفوتر
            </button>
          </div>

          <div className="space-y-2">
            {footerData.links.map((link, lIdx) => (
              <div
                key={link.id}
                className="p-2.5 rounded bg-[#0A0A0A] border border-[#EAE6DF]/8 flex items-center justify-between gap-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) =>
                      handleUpdateFooterLink(lIdx, { label: e.target.value })
                    }
                    placeholder="الاسم (عربي)"
                    className="px-2 py-1 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={link.labelEn}
                    onChange={(e) =>
                      handleUpdateFooterLink(lIdx, { labelEn: e.target.value })
                    }
                    placeholder="Name (EN)"
                    className="px-2 py-1 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={link.href}
                    onChange={(e) =>
                      handleUpdateFooterLink(lIdx, { href: e.target.value })
                    }
                    placeholder="/work"
                    className="px-2 py-1 rounded bg-[#141414] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteFooterLink(lIdx)}
                  className="p-1 rounded text-[#777777] hover:text-red-400 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

