import {
  Locale,
  ProfileData,
  Project,
  Category,
  SkillCategory,
  SkillItem,
  StatItem,
} from "./types";

export const LOCALES: readonly Locale[] = ["ar", "en"] as const;
export const DEFAULT_LOCALE: Locale = "ar";

export function isValidLocale(value: string): value is Locale {
  return value === "ar" || value === "en";
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

function hasArabicChars(text?: string): boolean {
  if (!text) return false;
  return ARABIC_CHAR_REGEX.test(text);
}

/**
 * Safely returns localized profile strings without ever mixing Arabic and English.
 */
export function getLocalizedProfile(profile: ProfileData, locale: Locale) {
  if (locale === "en") {
    const cleanNameEn =
      profile.nameEn && !hasArabicChars(profile.nameEn)
        ? profile.nameEn
        : "Khaled Mohamed Abdel Samee";

    const cleanTitleEn =
      profile.titleEn && !hasArabicChars(profile.titleEn)
        ? profile.titleEn
        : "Digital Artist & Visual Creator";

    const cleanBioEn =
      profile.bioEn && !hasArabicChars(profile.bioEn)
        ? profile.bioEn
        : "Digital artist and visual designer specializing in restaurant and brand advertising, freehand sketches, portraits, and manga illustration, alongside mural design, advanced color composition, and visual anatomy.";

    const cleanLocationEn =
      profile.contact?.locationEn && !hasArabicChars(profile.contact.locationEn)
        ? profile.contact.locationEn
        : "Egypt — Available for Freelance & Remote Collaboration";

    return {
      name: cleanNameEn,
      roleSubtitle: "Digital Artist & Visual Creator",
      title: cleanTitleEn,
      bio: cleanBioEn,
      location: cleanLocationEn,
    };
  }

  // Arabic mode — strip any accidental English pipe suffixes if present
  const cleanTitleAr = profile.title
    ? profile.title.split("|")[0].trim()
    : "مصمم جرافيك ورسام رقمي";

  const cleanLocationAr = profile.contact?.location
    ? profile.contact.location.replace(/\s*\([A-Za-z\s&]+\)\s*/g, "").trim()
    : "مصر — متاح للعمل الحر والتعاون عن بُعد";

  return {
    name: profile.name || "خالد محمد عبد السميع",
    roleSubtitle: "فنان رقمي ومصمم بصري",
    title: cleanTitleAr,
    bio:
      profile.bio ||
      "مصمم ومبدع متخصص في إعلانات المطاعم والبراندات، ورسم الاسكتشات والبورتريه والمانجا، بالإضافة إلى تصميم الجداريات وإتقان التكوين اللوني والتشريح البصري.",
    location: cleanLocationAr,
  };
}

export function getLocalizedStat(stat: StatItem, locale: Locale) {
  if (locale === "en") {
    return {
      label:
        stat.labelEn && !hasArabicChars(stat.labelEn)
          ? stat.labelEn
          : "Portfolio Metric",
      value: stat.valueEn || stat.value,
    };
  }
  return {
    label: stat.label,
    value: stat.value,
  };
}

export function getLocalizedCategoryName(
  categoryId: string,
  locale: Locale,
  categories?: Category[]
): string {
  const matched = categories?.find((c) => c.id === categoryId);

  if (locale === "en") {
    if (matched?.nameEn && !hasArabicChars(matched.nameEn)) {
      return matched.nameEn;
    }
    const fallbackEn: Record<string, string> = {
      all: "All Works",
      restaurant: "Restaurant Advertising",
      clothing: "Clothing & Brand Advertising",
      sketches: "Sketches & Freehand Drawings",
      portraits: "Portraits, Manga & Caricature",
    };
    return fallbackEn[categoryId] || "Selected Category";
  }

  if (matched?.name && hasArabicChars(matched.name)) {
    return matched.name;
  }
  const fallbackAr: Record<string, string> = {
    all: "كل الأعمال",
    restaurant: "إعلانات المطاعم",
    clothing: "إعلانات الملابس والبراندات",
    sketches: "اسكتشات ورسومات حرة",
    portraits: "بورتريه، مانجا وكاريكاتير",
  };
  return fallbackAr[categoryId] || "تصنيف فني";
}

export function getLocalizedProjectTitle(
  project: Project,
  locale: Locale
): string {
  if (locale === "en") {
    if (project.titleEn && !hasArabicChars(project.titleEn)) {
      return project.titleEn;
    }
    return "Selected Artwork";
  }

  if (project.title && hasArabicChars(project.title)) {
    return project.title;
  }
  return "عمل فني مختار";
}

export function getLocalizedProjectDescription(
  project: Project,
  locale: Locale
): string {
  if (locale === "en") {
    if (project.descriptionEn && !hasArabicChars(project.descriptionEn)) {
      return project.descriptionEn;
    }
    return "";
  }

  if (project.description && hasArabicChars(project.description)) {
    return project.description;
  }
  return "";
}

const TOOL_TRANSLATIONS_AR: Record<string, string> = {
  Procreate: "بروكريت",
  "Ibispaint X": "إيبيس باينت إكس",
  Canva: "كانفا",
  Photoshop: "فوتوشوب",
  "Adobe Photoshop": "أدوبي فوتوشوب",
};

const SKILL_NAME_AR_FALLBACK: Record<string, string> = {
  Procreate: "برنامج بروكريت للرسم الرقمي",
  "Ibispaint X": "برنامج إيبيس باينت إكس",
  Canva: "منصة كانفا للتصميم",
  "Adobe Photoshop": "برنامج أدوبي فوتوشوب",
};

export function getLocalizedToolName(tool: string, locale: Locale): string {
  const trimmed = tool.trim();
  if (locale === "ar") {
    return TOOL_TRANSLATIONS_AR[trimmed] || trimmed;
  }
  return trimmed;
}

export function getLocalizedSkillGroupTitle(
  group: SkillCategory,
  locale: Locale
): string {
  if (locale === "en") {
    return group.categoryEn && !hasArabicChars(group.categoryEn)
      ? group.categoryEn
      : "Professional Capabilities";
  }
  return group.category;
}

export function getLocalizedSkillItem(item: SkillItem, locale: Locale) {
  if (locale === "en") {
    const cleanNameEn =
      item.nameEn && !hasArabicChars(item.nameEn)
        ? item.nameEn
        : !hasArabicChars(item.name)
        ? item.name
        : "Artistic Capability";

    const cleanLevelEn =
      item.levelEn && !hasArabicChars(item.levelEn)
        ? item.levelEn
        : "Proficient";

    return {
      name: cleanNameEn,
      level: cleanLevelEn,
      percent: item.percent,
    };
  }

  const cleanNameAr = hasArabicChars(item.name)
    ? item.name.replace(/\s*\([A-Za-z0-9\s&]+\)\s*/g, "").trim()
    : SKILL_NAME_AR_FALLBACK[item.name] || item.name;

  const cleanLevelAr = item.level
    ? item.level.replace(/\s*\([A-Za-z0-9\s&]+\)\s*/g, "").trim()
    : "متقدم";

  return {
    name: cleanNameAr,
    level: cleanLevelAr,
    percent: item.percent,
  };
}

export const DICTIONARY = {
  ar: {
    meta: {
      siteTitle: "خالد محمد عبد السميع | فنان رقمي ومصمم بصري",
      siteDescription:
        "الاستوديو الإبداعي ومعرض الأعمال الرسمي للفنان الرقمي والمصمم خالد محمد عبد السميع — إعلانات المطاعم والبراندات، الاسكتشات، البورتريه والمانجا.",
      workTitle: "معرض الأعمال الكامل",
      workDescription:
        "تصفح كافة الأعمال الفنية والتصميمات الإعلانية للفنان خالد محمد عبد السميع: إعلانات المطاعم، إعلانات الملابس والبراندات، الاسكتشات، والبورتريه والمانجا.",
      aboutTitle: "عن الفنان والسيرة الفنية",
      aboutDescription:
        "تعرف على الفنان الرقمي والمصمم خالد محمد عبد السميع — التخصصات الفنية، برامج التصميم، الخبرات العملية، ونماذج مختارة من الأعمال.",
      contactTitle: "تواصل معي",
      contactDescription:
        "تواصل مباشرة مع الفنان والمصمم خالد محمد عبد السميع عبر واتساب، البريد الإلكتروني، بيهانس، أو إنستغرام لمناقشة مشاريع التصميم والرسم الرقمي.",
      projectNotFoundTitle: "المشروع غير موجود",
    },
    nav: {
      mainAria: "التنقل الرئيسي",
      mobileAria: "القائمة الرئيسية للموبايل",
      readingProgressAria: "تقدم قراءة الصفحة",
      home: "الرئيسية",
      work: "المعرض",
      about: "عن الفنان",
      contact: "تواصل",
      contactNow: "تواصل الآن",
      startNewProject: "بدء مشروع جديد / تواصل معي",
      openMenu: "فتح القائمة الرئيسية",
      closeMenu: "إغلاق القائمة",
      switchToEnglish: "English",
      switchToArabic: "العربية",
      languageSwitcherAria: "تغيير لغة الموقع",
      monogramSymbol: "خ",
    },
    hero: {
      editionLabel: "الإصدار الفني / ٢٠٢٦",
      studioTagline: "الرسم الرقمي، البورتريه، والتوجيه الفني للإعلانات التجارية",
      exploreWorkCta: "استكشف الأعمال المختارة",
      contactCta: "تواصل معي",
      portraitBadge: "صورة الفنان",
      selectedPieceLabel: "عمل مختار ↗",
      selectedPieceFallback: "بورتريه رقمي",
      disciplinesHeading: "التخصصات الأساسية",
      disciplinesSummary:
        "الإعلانات التجارية • البورتريه والمانجا • الاسكتشات • الجداريات",
    },
    selectedWorks: {
      eyebrow: "مختارات من المعرض",
      title: "أعمال مختارة في",
      titleAccent: "الفن الرقمي والإعلان التجاري",
      description:
        "مجموعة مختارة من أحدث المشاريع الإعلانية للمطاعم والبراندات، إلى جانب رسومات البورتريه والمانجا والاسكتشات الرقمية.",
      viewAllBtn: (count: number) => `عرض كافة الأعمال (${count})`,
      videoBadge: "فيديو",
      quickPreview: "معاينة",
      quickPreviewAria: (title: string) => `معاينة سريعة للعمل: ${title}`,
      detailsBtn: "التفاصيل",
      detailsAria: (title: string) => `عرض تفاصيل مشروع: ${title}`,
      footerSummaryPrefix: (shown: number) =>
        `يعرض هذا القسم ${shown} أعمال مختارة من إجمالي`,
      footerSummaryHighlight: (total: number) => `${total} عملاً فنياً وإعلانياً`,
      footerSummarySuffix: "موزعة على ٤ تصنيفات تخصصية.",
      browseFullArchiveBtn: (total: number) =>
        `استعراض الأرشيف الكامل (${total} مشروع)`,
    },
    gallery: {
      filterGroupAria: "تصفية الأعمال حسب التصنيف",
      searchPlaceholder: "ابحث في العناوين أو الوصف أو الأدوات...",
      searchAria: "ابحث في الأعمال أو الأدوات",
      clearSearchAria: "مسح البحث",
      showingLabel: "الأعمال المعروضة:",
      ofTotalLabel: "من أصل",
      resetFilterBtn: "إعادة تعيين التصفية (عرض الكل)",
      emptyTitle: "لا توجد أعمال مطابقة للتصفية الحالية",
      emptyDescription:
        "جرب اختيار تصنيف آخر أو مسح نص البحث لاستعراض كافة المشاريع.",
      showAllBtn: (total: number) => `عرض جميع الأعمال (${total})`,
    },
    workPage: {
      kicker: "الأرشيف الكامل للمشاريع",
      title: "معرض الأعمال",
      titleAccent: "والإصدارات البصرية",
      description:
        "تصفح جميع الأعمال المنفذة في الإعلانات التجارية للمطاعم والأزياء، إلى جانب لوحات البورتريه، المانجا، الكاريكاتير، والاسكتشات الرقمية.",
      archiveStatusLabel: "حالة الأرشيف",
      metaSummary: (projectsCount: number, categoriesCount: number) =>
        `${projectsCount} عملاً فنياً في ${categoriesCount} تصنيفات تخصصية`,
    },
    projectDetail: {
      backToGallery: "العودة إلى معرض الأعمال الكامل",
      archiveItemLabel: "رقم العمل في الأرشيف",
      conceptHeading: "وصف العمل والفكرة",
      categoryLabel: "التصنيف:",
      publishedDateLabel: "تاريخ النشر:",
      toolsUsedLabel: "البرامج والأدوات المستخدمة:",
      whatsappInquiryBtn: "طلب تصميم مشابه عبر واتساب",
      whatsappInquiryMessage: (title: string) =>
        `مرحباً أستاذ خالد، أعجبني عمل "${title}" وأود الاستفسار عن تنفيذ مشروع مشابه.`,
      openDriveVideoBtn: "فتح ملف الفيديو المرفق",
      prevNextAria: "التنقل بين المشاريع",
      prevProject: "المشروع السابق",
      nextProject: "المشروع التالي",
      relatedEyebrow: "أعمال ذات صلة",
      relatedTitle: (categoryName: string) => `المزيد من قسم ${categoryName}`,
      viewAllCategoryLink: "عرض كل أعمال القسم ←",
      artworkModeBtn: "العمل الفني (صورة)",
      videoModeBtn: "الفيديو المرفق",
      openVideoExternal: "فتح الفيديو في نافذة مستقلة",
      videoFallbackNotice:
        "إذا لم يعمل المشغل المدمج بسبب إعدادات المتصفح، يمكنك مشاهدة الفيديو بجودته الكاملة عبر الرابط الخارجي.",
      watchExternalBtn: "مشاهدة الفيديو الخارجي",
      galleryImageAria: (index: number) => `عرض الصورة ${index} للمشروع`,
    },
    modal: {
      imageTab: "الصورة",
      videoTab: "الفيديو",
      closeAria: "إغلاق النافذة",
      openExternalVideo: "فتح الفيديو في نافذة مستقلة",
      prevAria: "العمل السابق",
      nextAria: "العمل التالي",
      detailsEyebrow: "تفاصيل العمل الفني",
      toolsLabel: "البرامج والأدوات المستخدمة:",
      dateLabel: "تاريخ الإنجاز:",
      openFullPageBtn: "فتح صفحة المشروع الكاملة",
      inquireSimilarBtn: "الاستفسار عن عمل مشابه",
    },
    about: {
      eyebrow: "عن الفنان والرؤية البصرية",
      title: "توازن مدروس بين",
      titleAccent: "التكوين الفني والرسالة الإعلانية",
      readFullBioBtn: "قراءة السيرة الفنية الكاملة",
      experienceBadge: "+٥ سنوات خبرة",
      approachTitle: "المنهج الفني والتخصصات الأساسية",
      approachBadge: "التوجيه الفني والرسم",
      approachBody:
        "يرتكز العمل الفني على الجمع بين أساسيات الرسم الأكاديمي (التشريح البصري، المنظور، ونظريات الإضاءة والظل) وبين متطلبات التصميم التجاري الحديث، بما يمنح كل عمل شخصية بصرية مستقلة سواء كان إعلاناً تجارياً لمطعم أو علامة أزياء، أو لوحة بورتريه ومانجا، أو تصميماً لجدارية فنية.",
      exploreAboutLink: "استكشف صفحة الفنان والتفاصيل الكاملة",
      viewCategoryWorks: "عرض أعمال هذا القسم",
      pageKicker: "السيرة الفنية والمنهج البصري",
      selectedHeadingEyebrow: "نماذج من الأعمال",
      selectedHeadingTitle: "أعمال مختارة من المعرض",
      browseFullArchive: (count: number) => `تصفح الأرشيف الكامل (${count})`,
      disciplines: [
        {
          id: "restaurant",
          badge: "٠١ / الإعلان الغذائي",
          title: "إعلانات المطاعم والأغذية",
          desc: "تصميم بوسترات سوشيال ميديا وحملات بصرية تبرز تفاصيل الوجبات بإضاءة وتكوين لوني مدروس.",
        },
        {
          id: "clothing",
          badge: "٠٢ / أزياء وعلامات تجارية",
          title: "إعلانات الملابس والبراندات",
          desc: "ابتكار إعلانات وهويات بصرية للأزياء والبراندات تركز على الأناقة، التايبوغرافي، وروح الفئة المستهدفة.",
        },
        {
          id: "sketches",
          badge: "٠٣ / دراسات فنية",
          title: "اسكتشات ورسومات حرة",
          desc: "رسم يدوي رقمي عفوي ودراسات دقيقة للمنظور والتشريح البشري وتوزيع الضوء والظل.",
        },
        {
          id: "portraits",
          badge: "٠٤ / رسم الشخصيات",
          title: "بورتريه، مانجا وكاريكاتير",
          desc: "رسم شخصيات بأسلوب المانجا الياباني، وبورتريهات رقمية واقعية، وكاريكاتير تعبيري متقن.",
        },
      ],
    },
    skills: {
      eyebrow: "الأدوات والقدرات الفنية",
      title: "برامج التصميم",
      titleAccent: "والمهارات الاحترافية",
      description:
        "الأدوات الرقمية والتقنيات الفنية المعتمدة في تنفيذ الرسومات والحملات الإعلانية وإدارة المشاريع.",
      groupPrefix: (idx: number) => `٠${idx + 1}`,
    },
    contactCta: {
      eyebrow: "التعاون والمشاريع الإبداعية",
      title: "هل تبحث عن رؤية فنية خاصة",
      titleAccent: "لمشروعك القادم؟",
      description:
        "متاح لتنفيذ الحملات الإعلانية للمطاعم والعلامات التجارية، والرسومات الرقمية الخاصة، البورتريه، المانجا، وتصميم الجداريات. تواصل مباشرة لمناقشة تفاصيل مشروعك.",
      whatsappBtn: "تواصل عبر واتساب",
      emailBtn: "مراسلة عبر البريد",
      fullContactPageBtn: "صفحة التواصل الكاملة",
      directChannelsHeading: "القنوات الرسمية المباشرة",
    },
    contactPage: {
      kicker: "التواصل وطلبات المشاريع",
      title: "لنبدأ الحديث عن",
      titleAccent: "مشروعك الإبداعي القادم",
      description:
        "سواء كنت تبحث عن حملة إعلانية لمطعم أو علامة ملابس، أو ترغب في رسم لوحة بورتريه، مانجا، أو جدارية فنية، يسعدني تواصلك المباشر.",
      channelsEyebrow: "القنوات الرسمية",
      channelsTitle: "بيانات التواصل المباشر",
      channelsDesc:
        "اختر وسيلة التواصل المناسبة لك لمناقشة المشاريع الإعلانية أو طلبات الرسم الرقمي والبورتريه والمانجا.",
      locationLabel: "نطاق العمل والتفرغ",
      whatsappActionBtn: "محادثة واتساب",
      emailActionBtn: "إرسال بريد إلكتروني",
      composerEyebrow: "تجهيز رسالة المشروع",
      composerTitle: "إرسال ملخص مشروعك مباشرة عبر واتساب",
      composerDesc:
        "يقوم هذا النموذج بتنسيق تفاصيل طلبك وفتح محادثة واتساب مباشرة مع الفنان خالد عبد السميع دون وسطاء.",
      nameLabel: "الاسم الكريم أو اسم العلامة التجارية *",
      namePlaceholder: "مثال: أحمد محمد / مطعم...",
      serviceLabel: "نوع المشروع المطلوب *",
      serviceOptions: [
        "إعلانات مطاعم وسوشيال ميديا",
        "إعلانات وهوية ملابس وبراندات",
        "رسم بورتريه أو مانجا أو كاريكاتير",
        "تصميم جداريات ورسومات حرة",
        "تعاون فني آخر",
      ],
      messageLabel: "تفاصيل الفكرة أو العمل المطلوب *",
      messagePlaceholder:
        "اكتب نبذة مختصرة عن المشروع، عدد التصميمات أو الرسومات المطلوبة، والموعد المقترح...",
      submitBtn: "فتح محادثة واتساب وإرسال التفاصيل",
      statusSuccess:
        "تم تجهيز الرسالة وفتح نافذة واتساب للمحادثة المباشرة مع الفنان.",
      validationRequired: "يرجى ملء جميع الحقول المطلوبة قبل الإرسال.",
      whatsappMessageTemplate: (name: string, service: string, msg: string) =>
        `مرحباً أستاذ خالد، أنا ${name}، أرغب في الاستفسار عن (${service}):\n${msg}`,
    },
    social: {
      whatsappLabel: "واتساب",
      whatsappSub: "محادثة فورية",
      whatsappAria: (phone: string) => `التواصل عبر واتساب على الرقم ${phone}`,
      emailLabel: "البريد الإلكتروني",
      emailSub: "مراسلة رسمية",
      emailAria: (email: string) => `إرسال بريد إلكتروني إلى ${email}`,
      behanceLabel: "بيهانس",
      behanceSub: "معرض الأعمال",
      behanceValue: "حساب بيهانس الرسمي",
      behanceAria: "زيارة معرض الأعمال على منصة بيهانس",
      instagramLabel: "إنستغرام",
      instagramSub: "الأعمال اليومية",
      instagramValue: "حساب إنستغرام الرسمي",
      instagramAria: "زيارة الحساب الرسمي على منصة إنستغرام",
    },
    footer: {
      artistSubtitle: "فنان رقمي ومصمم بصري",
      bioSummary:
        "استوديو شخصي للفن الرقمي، رسم البورتريه والمانجا، وتصميم الإعلانات التجارية للمطاعم والعلامات التجارية.",
      sectionsHeading: "أقسام الموقع",
      homeLink: "الرئيسية",
      workLink: "معرض الأعمال الكامل",
      aboutLink: "عن الفنان والسيرة الفنية",
      contactLink: "تواصل مباشر",
      channelsHeading: "قنوات التواصل",
      whatsappPrefix: "واتساب:",
      behanceLink: "بيهانس ↗",
      instagramLink: "إنستغرام ↗",
      copyright: "جميع الحقوق محفوظة © ٢٠٢٦ خالد صادق.",
      scrollToTopAria: "الرجوع لأعلى الصفحة",
    },
    notFound: {
      badge: "٤٠٤ / غير موجود",
      globalTitle: "الصفحة المطلوبة غير متوفرة",
      globalDesc:
        "الرابط الذي تحاول الوصول إليه غير موجود. يمكنك العودة إلى الصفحة الرئيسية أو استعراض معرض الأعمال.",
      projectTitle: "لم يتم العثور على هذا المشروع",
      projectDesc:
        "ربما تم نقل هذا العمل أو تعديل رابطه. يمكنك تصفح كافة الأعمال المتاحة في المعرض الكامل.",
      backHomeBtn: "العودة للرئيسية",
      backWorkBtn: "العودة إلى معرض الأعمال",
    },
  },
  en: {
    meta: {
      siteTitle:
        "Khaled Mohamed Abdel Samee | Digital Artist & Visual Creator",
      siteDescription:
        "Official creative studio and portfolio of digital artist and visual creator Khaled Mohamed Abdel Samee — restaurant and brand advertising, sketches, portraits, and manga.",
      workTitle: "Complete Work Archive",
      workDescription:
        "Browse the complete portfolio of digital artist Khaled Mohamed Abdel Samee: restaurant advertising, clothing brand campaigns, sketches, portraits, and manga.",
      aboutTitle: "About the Artist",
      aboutDescription:
        "Learn about digital artist and visual creator Khaled Mohamed Abdel Samee — artistic disciplines, design software, professional experience, and selected works.",
      contactTitle: "Contact & Commissions",
      contactDescription:
        "Get in touch directly with digital artist Khaled Mohamed Abdel Samee via WhatsApp, Email, Behance, or Instagram for commercial art and illustration commissions.",
      projectNotFoundTitle: "Project Not Found",
    },
    nav: {
      mainAria: "Primary Navigation",
      mobileAria: "Mobile Primary Navigation",
      readingProgressAria: "Page reading progress",
      home: "Home",
      work: "Work",
      about: "About",
      contact: "Contact",
      contactNow: "Get in Touch",
      startNewProject: "Start a Project / Contact",
      openMenu: "Open main menu",
      closeMenu: "Close main menu",
      switchToEnglish: "English",
      switchToArabic: "العربية",
      languageSwitcherAria: "Switch website language",
      monogramSymbol: "K",
    },
    hero: {
      editionLabel: "Studio Edition / 2026",
      studioTagline:
        "Digital Illustration, Portraits & Commercial Art Direction",
      exploreWorkCta: "Explore Selected Work",
      contactCta: "Get in Touch",
      portraitBadge: "Artist Portrait",
      selectedPieceLabel: "Selected Piece ↗",
      selectedPieceFallback: "Digital Portrait",
      disciplinesHeading: "Core Disciplines",
      disciplinesSummary:
        "Commercial Campaigns • Portraits & Manga • Freehand Sketches • Murals",
    },
    selectedWorks: {
      eyebrow: "Selected Works",
      title: "Curated Works in",
      titleAccent: "Digital Illustration & Commercial Art",
      description:
        "A curated selection of commercial campaigns for restaurants and fashion brands alongside digital portraits, manga illustrations, and freehand studies.",
      viewAllBtn: (count: number) => `View All Projects (${count})`,
      videoBadge: "Video",
      quickPreview: "Preview",
      quickPreviewAria: (title: string) => `Quick preview of ${title}`,
      detailsBtn: "Details",
      detailsAria: (title: string) => `View project details for ${title}`,
      footerSummaryPrefix: (shown: number) =>
        `Displaying ${shown} curated works out of`,
      footerSummaryHighlight: (total: number) =>
        `${total} total artworks and campaigns`,
      footerSummarySuffix: "across 4 specialized disciplines.",
      browseFullArchiveBtn: (total: number) =>
        `Browse Full Archive (${total} Projects)`,
    },
    gallery: {
      filterGroupAria: "Filter projects by category",
      searchPlaceholder: "Search by title, description, or software...",
      searchAria: "Search projects or software tools",
      clearSearchAria: "Clear search query",
      showingLabel: "Showing projects:",
      ofTotalLabel: "of",
      resetFilterBtn: "Reset filter (Show All)",
      emptyTitle: "No projects match the current filter",
      emptyDescription:
        "Try selecting another category or clearing your search query to view all available works.",
      showAllBtn: (total: number) => `Show All Projects (${total})`,
    },
    workPage: {
      kicker: "Complete Portfolio Archive",
      title: "Selected & Complete",
      titleAccent: "Visual Works",
      description:
        "Explore all commercial campaigns for restaurants and fashion labels alongside digital portraits, manga character art, caricatures, and anatomical sketches.",
      archiveStatusLabel: "Archive Status",
      metaSummary: (projectsCount: number, categoriesCount: number) =>
        `${projectsCount} Works across ${categoriesCount} Disciplines`,
    },
    projectDetail: {
      backToGallery: "Back to Full Portfolio Archive",
      archiveItemLabel: "Archive Entry",
      conceptHeading: "Concept & Visual Direction",
      categoryLabel: "Category:",
      publishedDateLabel: "Published:",
      toolsUsedLabel: "Software & Tools:",
      whatsappInquiryBtn: "Request a Similar Project via WhatsApp",
      whatsappInquiryMessage: (title: string) =>
        `Hello Khaled, I admired your project "${title}" and would like to inquire about commissioning a similar piece.`,
      openDriveVideoBtn: "Open Attached Video File",
      prevNextAria: "Project navigation",
      prevProject: "Previous Project",
      nextProject: "Next Project",
      relatedEyebrow: "Related Works",
      relatedTitle: (categoryName: string) => `More in ${categoryName}`,
      viewAllCategoryLink: "View all in this category →",
      artworkModeBtn: "Artwork (Still Image)",
      videoModeBtn: "Attached Video",
      openVideoExternal: "Open video in a new tab",
      videoFallbackNotice:
        "If the embedded player is blocked by your browser settings, you can watch the full-resolution video directly in a new tab.",
      watchExternalBtn: "Watch External Video",
      galleryImageAria: (index: number) => `View project image ${index}`,
    },
    modal: {
      imageTab: "Image",
      videoTab: "Video",
      closeAria: "Close dialog",
      openExternalVideo: "Open video in new tab",
      prevAria: "Previous project",
      nextAria: "Next project",
      detailsEyebrow: "Project Specifications",
      toolsLabel: "Software & Tools:",
      dateLabel: "Completed:",
      openFullPageBtn: "Open Full Project Page",
      inquireSimilarBtn: "Inquire About Similar Work",
    },
    about: {
      eyebrow: "Artist Profile & Visual Philosophy",
      title: "A Deliberate Balance of",
      titleAccent: "Fine Art Craft & Commercial Impact",
      readFullBioBtn: "Read Full Artist Profile",
      experienceBadge: "5+ Years Experience",
      approachTitle: "Artistic Approach & Core Disciplines",
      approachBadge: "Art Direction & Illustration",
      approachBody:
        "Every piece is grounded in foundational drawing principles—visual anatomy, perspective, and light-and-shadow theory—paired with contemporary commercial art direction. Whether crafting a high-conversion restaurant campaign, a streetwear lookbook, an expressive portrait, or a large-scale mural, each work is built with a distinct visual identity.",
      exploreAboutLink: "Explore full artist profile and background",
      viewCategoryWorks: "Explore works in this discipline",
      pageKicker: "Artist Profile & Creative Practice",
      selectedHeadingEyebrow: "Selected Archive",
      selectedHeadingTitle: "Highlighted Works from the Studio",
      browseFullArchive: (count: number) => `Browse Full Archive (${count})`,
      disciplines: [
        {
          id: "restaurant",
          badge: "01 / Food & Hospitality",
          title: "Restaurant & Food Advertising",
          desc: "Social media campaigns and promotional posters designed with appetizing color grading, texture detail, and studio lighting.",
        },
        {
          id: "clothing",
          badge: "02 / Fashion & Apparel",
          title: "Clothing & Brand Campaigns",
          desc: "Visual identity and fashion advertising combining bold typography with contemporary editorial composition.",
        },
        {
          id: "sketches",
          badge: "03 / Fine Art Studies",
          title: "Sketches & Freehand Drawings",
          desc: "Spontaneous digital ink and pencil drawings exploring human anatomy, perspective, and expressive line work.",
        },
        {
          id: "portraits",
          badge: "04 / Character Art",
          title: "Portraits, Manga & Caricature",
          desc: "Authentic Japanese manga character art, realistic digital portraits, and refined expressive caricatures.",
        },
      ],
    },
    skills: {
      eyebrow: "Tools & Creative Capabilities",
      title: "Design Software &",
      titleAccent: "Professional Skills",
      description:
        "Digital illustration software, fine art foundations, and project management capabilities used across commercial and personal commissions.",
      groupPrefix: (idx: number) => `0${idx + 1}`,
    },
    contactCta: {
      eyebrow: "Commissions & Collaborations",
      title: "Looking for Bespoke Art Direction",
      titleAccent: "for Your Next Project?",
      description:
        "Available for restaurant and fashion advertising campaigns, custom digital illustrations, portraits, manga art, and mural design. Reach out directly to discuss your brief.",
      whatsappBtn: "Chat on WhatsApp",
      emailBtn: "Send an Email",
      fullContactPageBtn: "Full Contact Page",
      directChannelsHeading: "Official Direct Channels",
    },
    contactPage: {
      kicker: "Direct Contact & Commissions",
      title: "Let’s Discuss Your",
      titleAccent: "Next Creative Project",
      description:
        "Whether you are planning an advertising campaign for a restaurant or clothing brand, or commissioning a custom portrait, manga illustration, or mural, reach out directly below.",
      channelsEyebrow: "Official Channels",
      channelsTitle: "Direct Contact Information",
      channelsDesc:
        "Select your preferred channel to discuss commercial campaigns, custom digital illustrations, portraits, or manga commissions.",
      locationLabel: "Location & Availability",
      whatsappActionBtn: "WhatsApp Chat",
      emailActionBtn: "Send Email",
      composerEyebrow: "Project Brief Composer",
      composerTitle: "Send Your Project Brief Directly via WhatsApp",
      composerDesc:
        "This composer formats your project details and opens a direct WhatsApp conversation with Khaled Mohamed Abdel Samee.",
      nameLabel: "Your Name or Brand Name *",
      namePlaceholder: "e.g., Alex Morgan / Studio Brand",
      serviceLabel: "Project Type *",
      serviceOptions: [
        "Restaurant & Social Media Advertising",
        "Clothing & Fashion Brand Campaign",
        "Custom Portrait, Manga or Caricature",
        "Mural Design & Freehand Illustration",
        "Other Creative Collaboration",
      ],
      messageLabel: "Project Brief & Details *",
      messagePlaceholder:
        "Describe your project goals, number of illustrations or designs needed, and target timeline...",
      submitBtn: "Open WhatsApp & Send Project Brief",
      statusSuccess:
        "Your brief has been formatted and opened in WhatsApp for direct conversation.",
      validationRequired:
        "Please complete all required fields before sending.",
      whatsappMessageTemplate: (name: string, service: string, msg: string) =>
        `Hello Khaled, my name is ${name}. I would like to inquire about (${service}):\n${msg}`,
    },
    social: {
      whatsappLabel: "WhatsApp",
      whatsappSub: "Instant Messaging",
      whatsappAria: (phone: string) => `Chat on WhatsApp at ${phone}`,
      emailLabel: "Email",
      emailSub: "Official Inquiries",
      emailAria: (email: string) => `Send an email to ${email}`,
      behanceLabel: "Behance",
      behanceSub: "Design Portfolio",
      behanceValue: "Official Behance Profile",
      behanceAria: "Visit official portfolio on Behance",
      instagramLabel: "Instagram",
      instagramSub: "Visual Feed",
      instagramValue: "Official Instagram Studio",
      instagramAria: "Visit official profile on Instagram",
    },
    footer: {
      artistSubtitle: "Digital Artist & Visual Creator",
      bioSummary:
        "Personal creative studio specializing in digital illustration, portraits, manga art, and commercial advertising for restaurants and brands.",
      sectionsHeading: "Navigation",
      homeLink: "Home",
      workLink: "Complete Work Archive",
      aboutLink: "About the Artist",
      contactLink: "Direct Contact",
      channelsHeading: "Direct Channels",
      whatsappPrefix: "WhatsApp:",
      behanceLink: "Behance ↗",
      instagramLink: "Instagram ↗",
      copyright:
        "© 2026 Khaled Sadek. All rights reserved.",
      scrollToTopAria: "Scroll back to top",
    },
    notFound: {
      badge: "404 / Not Found",
      globalTitle: "The Requested Page Was Not Found",
      globalDesc:
        "The link you followed may be broken or the page may have been moved. Return to the homepage or explore the full portfolio archive.",
      projectTitle: "Project Not Found",
      projectDesc:
        "This artwork may have been moved or its identifier was updated. Explore all available works in the portfolio archive.",
      backHomeBtn: "Back to Home",
      backWorkBtn: "Browse Work Archive",
    },
  },
} as const;

export type Dictionary = (typeof DICTIONARY)[Locale];

export function getDictionary(locale: Locale) {
  return DICTIONARY[locale] ?? DICTIONARY.ar;
}

