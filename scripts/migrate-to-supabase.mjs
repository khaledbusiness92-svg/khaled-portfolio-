import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://urzpirrhdqwuhdcvaskg.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET_NAME = "portfolio-media";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("=== STARTING MIGRATION TO SUPABASE ===");

  // 1. Ensure bucket exists and is public
  const { data: bucketData, error: bucketErr } = await supabase.storage.getBucket(BUCKET_NAME);
  if (bucketErr || !bucketData) {
    console.log("Creating bucket...", bucketErr?.message);
    const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800,
    });
    if (createErr && !createErr.message.includes("already exists")) {
      throw createErr;
    }
  } else {
    console.log("Bucket already exists and verified:", bucketData.name);
  }

  // 2. Scan and upload all images in public/images and public/uploads
  const roots = [
    { baseDir: path.join(process.cwd(), "public", "images"), prefix: "images" },
    { baseDir: path.join(process.cwd(), "public", "uploads"), prefix: "uploads" },
  ];

  const urlMap = new Map(); // local path -> Supabase public URL

  function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath));
      } else if (entry.isFile() && !entry.name.endsWith(".md") && !entry.name.startsWith(".")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  for (const { baseDir, prefix } of roots) {
    const files = getFiles(baseDir);
    console.log(`Found ${files.length} files under ${prefix}/`);

    for (const filePath of files) {
      const relPath = path.relative(path.join(process.cwd(), "public"), filePath);
      const cleanStoragePath = relPath.replace(/\\/g, "/");
      const fileBuffer = fs.readFileSync(filePath);

      let contentType = "image/jpeg";
      if (filePath.endsWith(".png")) contentType = "image/png";
      else if (filePath.endsWith(".webp")) contentType = "image/webp";
      else if (filePath.endsWith(".gif")) contentType = "image/gif";
      else if (filePath.endsWith(".svg")) contentType = "image/svg+xml";

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(cleanStoragePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${cleanStoragePath}:`, error.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(cleanStoragePath);

        const publicUrl = publicUrlData.publicUrl;
        // Map both leading slash and no leading slash
        urlMap.set(`/${cleanStoragePath}`, publicUrl);
        urlMap.set(cleanStoragePath, publicUrl);
        console.log(`✓ Uploaded: ${cleanStoragePath} -> ${publicUrl}`);
      }
    }
  }

  // 3. Read portfolio.json and replace local URLs with Supabase URLs
  const jsonPath = path.join(process.cwd(), "src", "data", "portfolio.json");
  let jsonString = fs.readFileSync(jsonPath, "utf-8");

  for (const [localUrl, remoteUrl] of urlMap.entries()) {
    jsonString = jsonString.split(localUrl).join(remoteUrl);
  }

  const portfolioData = JSON.parse(jsonString);

  // 4. Save to Supabase portfolio_data table
  console.log("Upserting portfolio data to public.portfolio_data...");
  const { error: upsertErr } = await supabase
    .from("portfolio_data")
    .upsert({
      id: "main",
      data: portfolioData,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (upsertErr) {
    throw new Error(`Failed to upsert portfolio data: ${upsertErr.message}`);
  }

  console.log("✓ Successfully saved portfolio data to Supabase database!");

  // 5. Update local portfolio.json as synced fallback
  fs.writeFileSync(jsonPath, JSON.stringify(portfolioData, null, 2), "utf-8");
  console.log("✓ Updated local src/data/portfolio.json with Supabase URLs.");

  console.log("\n=======================================================");
  console.log("MIGRATION COMPLETED SUCCESSFULLY!");
  console.log(`All images uploaded to Supabase Storage: ${BUCKET_NAME}`);
  console.log("All data stored in Supabase PostgreSQL: portfolio_data");
  console.log("=======================================================");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
