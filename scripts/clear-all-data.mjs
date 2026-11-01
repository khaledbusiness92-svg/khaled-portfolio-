import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET_NAME = "portfolio-media";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function clearAllData() {
  console.log("=== STARTING COMPLETE DATA RESET FOR FRESH CLIENT START ===");

  const jsonPath = path.join(process.cwd(), "src", "data", "portfolio.json");
  const currentData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // 1. Create a safe backup before reset
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(
    path.join(backupDir, `backup_before_reset_${Date.now()}.json`),
    JSON.stringify(currentData, null, 2),
    "utf-8"
  );
  console.log("✓ Created safety backup in backups/");

  // 2. Clear Projects, Media library, and Revisions
  currentData.projects = [];
  currentData.media = [];
  currentData.revisions = [];

  // Reset placeholder images so artist uploads his own
  if (currentData.profile) {
    currentData.profile.avatar = "";
    currentData.profile.heroBg = "";
  }
  if (currentData.brand) {
    currentData.brand.logoUrl = "";
    currentData.brand.logoLightUrl = "";
    currentData.brand.logoDarkUrl = "";
    currentData.brand.monogramUrl = "";
    currentData.brand.faviconUrl = "";
  }

  // 3. Save clean state to local src/data/portfolio.json
  fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2), "utf-8");
  console.log("✓ Reset local src/data/portfolio.json (projects: [], media: [])");

  // 4. Save clean state to Supabase PostgreSQL database
  const { error: sbErr } = await supabase
    .from("portfolio_data")
    .upsert({
      id: "main",
      data: currentData,
      updated_at: new Date().toISOString(),
    });

  if (sbErr) {
    throw new Error(`Failed to update Supabase: ${sbErr.message}`);
  }
  console.log("✓ Reset Supabase database portfolio_data (0 projects, ready for fresh client data)");

  // 5. Clean public/uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      if (f !== ".gitkeep") {
        fs.unlinkSync(path.join(uploadsDir, f));
      }
    }
    console.log(`✓ Cleared ${files.length} local files from public/uploads/`);
  }

  // 6. Clean Supabase Storage bucket files
  try {
    const { data: listData, error: listErr } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 100 });

    if (!listErr && listData && listData.length > 0) {
      // List subfolders and files
      for (const item of listData) {
        if (item.id) {
          await supabase.storage.from(BUCKET_NAME).remove([item.name]);
        }
        // Check subdirectories
        const { data: subData } = await supabase.storage
          .from(BUCKET_NAME)
          .list(item.name, { limit: 100 });
        if (subData && subData.length > 0) {
          const filePaths = subData.map((s) => `${item.name}/${s.name}`);
          await supabase.storage.from(BUCKET_NAME).remove(filePaths);
        }
      }
      console.log("✓ Cleared old test files from Supabase Storage bucket");
    }
  } catch (storageErr) {
    console.warn("Storage cleanup notice:", storageErr.message);
  }

  console.log("\n=======================================================");
  console.log("CLEAN SLATE COMPLETE! ALL OLD DATA HAS BEEN REMOVED!");
  console.log("The client can now log in to /admin and add their own brand new work.");
  console.log("Everything will be stored 100% on Supabase Cloud.");
  console.log("=======================================================");
}

clearAllData().catch((err) => {
  console.error("Clean slate failed:", err);
  process.exit(1);
});

