"use client";

import { useState } from "react";
import { Category, SkillCategory, SkillItem, Project } from "@/lib/types";
import { Wrench, Plus, Trash2, Save, Layers, AlertCircle } from "lucide-react";

interface SkillsTabProps {
  categories: Category[];
  skills: SkillCategory[];
  projects: Project[];
  onSaveCategories: (categories: Category[]) => Promise<void>;
  onSaveSkills: (skills: SkillCategory[]) => Promise<void>;
  showNotification: (text: string, type?: "success" | "error") => void;
}

export default function SkillsTab({
  categories,
  skills,
  projects,
  onSaveCategories,
  onSaveSkills,
  showNotification,
}: SkillsTabProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>([...categories]);
  const [localSkills, setLocalSkills] = useState<SkillCategory[]>([...skills]);
  const [saving, setSaving] = useState(false);

  // Category deletion warning
  const [catWarning, setCatWarning] = useState<{ id: string; count: number } | null>(null);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        onSaveCategories(localCategories),
        onSaveSkills(localSkills),
      ]);
      showNotification("تم حفظ التصنيفات والمهارات بنجاح!");
    } catch {
      showNotification("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSaving(false);
    }
  };

  // Category Actions
  const handleAddCategory = () => {
    const newId = `cat-${Date.now().toString(36)}`;
    setLocalCategories([
      ...localCategories,
      {
        id: newId,
        name: "تصنيف جديد",
        nameEn: "New Category",
      },
    ]);
  };

  const handleUpdateCategory = (idx: number, updates: Partial<Category>) => {
    const list = [...localCategories];
    list[idx] = { ...list[idx], ...updates };
    setLocalCategories(list);
  };

  const handleDeleteCategory = (catId: string) => {
    if (catId === "all") {
      showNotification("لا يمكن حذف التصنيف الشامل (all)", "error");
      return;
    }
    const assignedCount = projects.filter((p) => p.category === catId).length;
    if (assignedCount > 0) {
      setCatWarning({ id: catId, count: assignedCount });
      return;
    }
    setLocalCategories(localCategories.filter((c) => c.id !== catId));
  };

  const handleForceDeleteCategory = (catId: string) => {
    setLocalCategories(localCategories.filter((c) => c.id !== catId));
    setCatWarning(null);
  };

  // Skill Actions
  const handleAddSkillGroup = () => {
    setLocalSkills([
      ...localSkills,
      {
        category: "مهارات جديدة",
        categoryEn: "New Skills Group",
        items: [],
      },
    ]);
  };

  const handleAddSkillItem = (groupIndex: number) => {
    const list = [...localSkills];
    list[groupIndex].items.push({
      name: "مهارة جديدة",
      nameEn: "New Skill",
      level: "متقدم",
      levelEn: "Advanced",
      percent: 90,
    });
    setLocalSkills(list);
  };

  const handleUpdateSkillItem = (
    groupIndex: number,
    itemIndex: number,
    updates: Partial<SkillItem>
  ) => {
    const list = [...localSkills];
    list[groupIndex].items[itemIndex] = {
      ...list[groupIndex].items[itemIndex],
      ...updates,
    };
    setLocalSkills(list);
  };

  const handleDeleteSkillItem = (groupIndex: number, itemIndex: number) => {
    const list = [...localSkills];
    list[groupIndex].items = list[groupIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setLocalSkills(list);
  };

  const handleDeleteSkillGroup = (groupIndex: number) => {
    setLocalSkills(localSkills.filter((_, i) => i !== groupIndex));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#EAE6DF] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#D7C9B2]" />
            <span>التصنيفات والمهارات الفنية (Categories &amp; Skills)</span>
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            إدارة تصنيفات المعرض التخصصية، ومجموعات برامج التصميم والقدرات الفنية المعروضة في صفحة الفنان.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs sm:text-sm bg-[#D7C9B2] hover:bg-[#EAE6DF] text-[#0A0A0A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ التصنيفات والمهارات"}</span>
        </button>
      </div>

      {/* Categories Manager */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D7C9B2]" />
            <h3 className="font-bold text-base text-[#EAE6DF]">
              تصنيفات المعرض الأساسية ({localCategories.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تصنيف</span>
          </button>
        </div>

        <div className="divide-y divide-[#EAE6DF]/8">
          {localCategories.map((cat, idx) => {
            const count = projects.filter((p) => p.category === cat.id).length;
            const isAll = cat.id === "all";

            return (
              <div
                key={cat.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-[#202020] text-[#D7C9B2] border border-[#EAE6DF]/10 shrink-0">
                    {cat.id}
                  </span>
                  <div className="text-xs text-[#777777] shrink-0">
                    ({count} عمل)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full max-w-xl">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      handleUpdateCategory(idx, { name: e.target.value })
                    }
                    placeholder="الاسم بالعربية"
                    className="px-3 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={cat.nameEn || ""}
                    onChange={(e) =>
                      handleUpdateCategory(idx, { nameEn: e.target.value })
                    }
                    placeholder="Name in English"
                    className="px-3 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/15"
                  />
                </div>

                {!isAll && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded text-[#777777] hover:text-red-400 cursor-pointer self-end sm:self-auto"
                    title="حذف التصنيف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills & Software Manager */}
      <div className="bg-[#141414] p-6 rounded-lg border border-[#EAE6DF]/12 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#EAE6DF]">
            مجموعات المهارات والبرامج (Skills &amp; Capabilities)
          </h3>

          <button
            type="button"
            onClick={handleAddSkillGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مجموعة مهارات</span>
          </button>
        </div>

        <div className="space-y-6">
          {localSkills.map((group, gIdx) => (
            <div
              key={gIdx}
              className="p-5 rounded-lg bg-[#0E0E0E] border border-[#EAE6DF]/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE6DF]/8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 max-w-lg">
                  <input
                    type="text"
                    value={group.category}
                    onChange={(e) => {
                      const list = [...localSkills];
                      list[gIdx].category = e.target.value;
                      setLocalSkills(list);
                    }}
                    placeholder="اسم المجموعة (عربي)"
                    className="px-3 py-1.5 rounded bg-[#141414] text-xs font-bold text-[#D7C9B2] border border-[#EAE6DF]/15"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={group.categoryEn}
                    onChange={(e) => {
                      const list = [...localSkills];
                      list[gIdx].categoryEn = e.target.value;
                      setLocalSkills(list);
                    }}
                    placeholder="Group Name (EN)"
                    className="px-3 py-1.5 rounded bg-[#141414] text-xs font-bold text-[#D7C9B2] border border-[#EAE6DF]/15"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSkillItem(gIdx)}
                    className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#D7C9B2] text-[#EAE6DF] hover:text-[#0A0A0A] text-xs font-medium cursor-pointer"
                  >
                    + إضافة مهارة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkillGroup(gIdx)}
                    className="p-1 rounded text-[#777777] hover:text-red-400 cursor-pointer"
                    title="حذف المجموعة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-3 rounded bg-[#141414] border border-[#EAE6DF]/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateSkillItem(gIdx, iIdx, {
                            name: e.target.value,
                          })
                        }
                        placeholder="اسم المهارة (عربي)"
                        className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={item.nameEn || ""}
                        onChange={(e) =>
                          handleUpdateSkillItem(gIdx, iIdx, {
                            nameEn: e.target.value,
                          })
                        }
                        placeholder="Skill Name (EN)"
                        className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                      />
                      <input
                        type="text"
                        value={item.level}
                        onChange={(e) =>
                          handleUpdateSkillItem(gIdx, iIdx, {
                            level: e.target.value,
                          })
                        }
                        placeholder="المستوى (متقدم)"
                        className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={item.levelEn || ""}
                        onChange={(e) =>
                          handleUpdateSkillItem(gIdx, iIdx, {
                            levelEn: e.target.value,
                          })
                        }
                        placeholder="Level (Advanced)"
                        className="px-2.5 py-1.5 rounded bg-[#0A0A0A] text-xs text-[#EAE6DF] border border-[#EAE6DF]/10"
                      />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={item.percent}
                          onChange={(e) =>
                            handleUpdateSkillItem(gIdx, iIdx, {
                              percent: parseInt(e.target.value),
                            })
                          }
                          className="w-20 accent-[#D7C9B2]"
                        />
                        <span className="font-mono text-xs text-[#D7C9B2] w-9">
                          {item.percent}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSkillItem(gIdx, iIdx)}
                        className="p-1 rounded text-[#777777] hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category In-Use Warning Modal */}
      {catWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161616] p-6 rounded-lg border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base">تحذير: التصنيف مرتبط بمشاريع!</h3>
            </div>

            <p className="text-xs text-[#EAE6DF]/80 leading-relaxed">
              هذا التصنيف مرتبط حالياً بـ{" "}
              <strong className="text-[#D7C9B2] font-mono">
                {catWarning.count} مشروع
              </strong>
              . حذفه قد يترك تلك المشاريع بتصنيف غير معروف في واجهة الموقع.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCatWarning(null)}
                className="px-4 py-2 rounded text-xs bg-[#202020] text-[#EAE6DF]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleForceDeleteCategory(catWarning.id)}
                className="px-4 py-2 rounded text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

