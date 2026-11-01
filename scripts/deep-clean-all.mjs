import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET_NAME = "portfolio-media";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listAllFilesInBucket(folder = "") {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, { limit: 100 });
  if (error) {
    console.error(`Error listing folder ${folder}:`, error);
    return [];
  }
  let files = [];
  for (const item of data || []) {
    const fullPath = folder ? `${folder}/${item.name}` : item.name;
    if (item.id === null) {
      // It's a folder: recurse
      const subFiles = await listAllFilesInBucket(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function deepCleanAll() {
  console.log("=== STARTING DEEP PURGE OF ALL OLD DATA & IMAGES ===");

  // 1. Delete ALL files from Supabase Storage bucket recursively
  console.log(`Scanning all objects in bucket "${BUCKET_NAME}"...`);
  const allBucketFiles = await listAllFilesInBucket();
  console.log(`Found ${allBucketFiles.length} files in Supabase Storage:`, allBucketFiles);

  if (allBucketFiles.length > 0) {
    const { data: removeData, error: removeErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(allBucketFiles);
    if (removeErr) {
      console.error("Error removing files from bucket:", removeErr);
    } else {
      console.log(`✓ Successfully deleted all ${allBucketFiles.length} files from Supabase Storage!`, removeData);
    }
  } else {
    console.log("✓ Bucket was already empty.");
  }

  // 2. Prepare Clean JSON Data
  const jsonPath = path.join(process.cwd(), "src", "data", "portfolio.json");
  const currentData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Purge projects, media, revisions
  currentData.projects = [];
  currentData.media = [];
  currentData.revisions = [];

  // Reset profile media
  if (currentData.profile) {
    currentData.profile.avatar = "";
    currentData.profile.heroBg = "";
    currentData.profile.stats = [
      {
        label: "تصنيفات تخصصية",
        labelEn: "Creative Disciplines",
        value: "4",
        valueEn: "4"
      },
      {
        label: "أعمال وإعلانات",
        labelEn: "Artworks & Projects",
        value: "0",
        valueEn: "0"
      },
      {
        label: "برامج تصميم متقنة",
        labelEn: "Core Design Tools",
        value: "4",
        valueEn: "4"
      },
      {
        label: "سنوات خبرة فنية",
        labelEn: "Years of Experience",
        value: "+5",
        valueEn: "5+"
      }
    ];
  }

  // Reset brand logos
  if (currentData.brand) {
    currentData.brand.logoUrl = "";
    currentData.brand.logoLightUrl = "";
    currentData.brand.logoDarkUrl = "";
    currentData.brand.monogramUrl = "";
    currentData.brand.faviconUrl = "";
  }

  // Clean default categories (remove any test category like 'حمرا')
  currentData.categories = [
    {
      id: "all",
      name: "كل الأعمال",
      nameEn: "All Works"
    },
    {
      id: "restaurant",
      name: "إعلانات المطاعم",
      nameEn: "Restaurant Advertising"
    },
    {
      id: "clothing",
      name: "إعلانات الملابس والبراندات",
      nameEn: "Clothing & Brand Advertising"
    },
    {
      id: "sketches",
      name: "اسكتشات ورسومات حرة",
      nameEn: "Sketches & Freehand Drawings"
    },
    {
      id: "portraits",
      name: "بورتريه، مانجا وكاريكاتير",
      nameEn: "Portraits, Manga & Caricature"
    }
  ];

  // 3. Save to local src/data/portfolio.json
  fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2), "utf-8");
  console.log("✓ Saved 100% clean portfolio data to src/data/portfolio.json");

  // 4. Save to Supabase PostgreSQL database
  const { error: sbErr } = await supabase
    .from("portfolio_data")
    .upsert({
      id: "main",
      data: currentData,
      updated_at: new Date().toISOString(),
    });

  if (sbErr) {
    console.error("Failed to update Supabase portfolio_data table:", sbErr);
    process.exit(1);
  }
  console.log("✓ Supabase database portfolio_data table successfully reset to clean state (0 projects, 0 media)!");

  // 5. Clean any local uploads or dummy images in public/
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      if (f !== ".gitkeep") {
        fs.unlinkSync(path.join(uploadsDir, f));
      }
    }
    console.log(`✓ Cleared local files in public/uploads/`);
  }

  console.log("=== ALL OLD DATA AND IMAGES COMPLETELY REMOVED! ===");
}

deepCleanAll().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
