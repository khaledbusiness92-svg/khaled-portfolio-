import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { isSafeSvg } from "@/lib/svg-sanitizer";
import { MediaAsset } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);
    if (!isAuth) {
      return NextResponse.json(
        { error: "غير مصرح لك برفع الملفات. يرجى تسجيل الدخول كمسؤول." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file") || formData.get("image");

    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json(
        { error: "لم يتم اختيار أي ملف للرفع" },
        { status: 400 }
      );
    }

    const file = fileEntry as File;

    if (!file.name || file.size === 0) {
      return NextResponse.json(
        { error: "الملف المرفوع فارغ (0 بايت) أو غير صالح" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح به (20 ميجابايت)" },
        { status: 413 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error:
            "امتداد الملف غير مدعوم. يرجى رفع ملف صورة صالح (JPG, PNG, WEBP, GIF, AVIF, SVG).",
        },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "نوع MIME غير مدعوم. يرجى التأكد من أن الملف صورة صالحة.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. SVG Content Security check (XSS, XML entity injection, embedded scripts)
    if (ext === ".svg" || file.type === "image/svg+xml") {
      const svgText = buffer.toString("utf-8");
      const validation = isSafeSvg(svgText);
      if (!validation.safe) {
        return NextResponse.json(
          { error: validation.reason || "تم رفض ملف SVG لاعتبارات أمنية" },
          { status: 400 }
        );
      }
    }

    // 2. Magic bytes verification for binary images
    if (ext === ".jpg" || ext === ".jpeg") {
      if (buffer.length < 3 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return NextResponse.json(
          { error: "الملف لا يطابق بنية صورة JPEG صالحة" },
          { status: 400 }
        );
      }
    } else if (ext === ".png") {
      if (
        buffer.length < 8 ||
        buffer[0] !== 0x89 ||
        buffer[1] !== 0x50 ||
        buffer[2] !== 0x4e ||
        buffer[3] !== 0x47
      ) {
        return NextResponse.json(
          { error: "الملف لا يطابق بنية صورة PNG صالحة" },
          { status: 400 }
        );
      }
    } else if (ext === ".gif") {
      if (
        buffer.length < 6 ||
        buffer[0] !== 0x47 ||
        buffer[1] !== 0x49 ||
        buffer[2] !== 0x46 ||
        buffer[3] !== 0x38
      ) {
        return NextResponse.json(
          { error: "الملف لا يطابق بنية صورة GIF صالحة" },
          { status: 400 }
        );
      }
    } else if (ext === ".webp") {
      if (
        buffer.length < 12 ||
        buffer.toString("ascii", 0, 4) !== "RIFF" ||
        buffer.toString("ascii", 8, 12) !== "WEBP"
      ) {
        return NextResponse.json(
          { error: "الملف لا يطابق بنية صورة WebP صالحة" },
          { status: 400 }
        );
      }
    } else if (ext === ".avif") {
      if (
        buffer.length < 12 ||
        buffer.toString("ascii", 4, 8) !== "ftyp"
      ) {
        return NextResponse.json(
          { error: "الملف لا يطابق بنية صورة AVIF صالحة" },
          { status: 400 }
        );
      }
    }

    // Clean base name preserving alphanumeric and Arabic letters
    const rawBaseName = path.parse(file.name).name;
    const cleanBase =
      rawBaseName.replace(/[^a-zA-Z0-9\u0600-\u06FF.-]/g, "_").slice(0, 50) ||
      "image";
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const uniqueFilename = `${Date.now()}-${randomSuffix}-${cleanBase}${ext}`;

    let publicUrl = `/uploads/${uniqueFilename}`;

    // Upload to Supabase Storage if configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-media";
      const { error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(`uploads/${uniqueFilename}`, buffer, {
          contentType: file.type || `image/${ext.replace(".", "")}`,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`uploads/${uniqueFilename}`);
        publicUrl = publicUrlData.publicUrl;
      } else {
        console.warn("Supabase storage upload error:", uploadErr.message);
      }
    }

    // Attempt local file write as local cache/fallback (gracefully ignores read-only filesystems on Vercel)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, uniqueFilename);
      const tempFilePath = `${filePath}.tmp`;
      fs.writeFileSync(tempFilePath, buffer);
      fs.renameSync(tempFilePath, filePath);
    } catch {
      // In serverless environments like Vercel, filesystem is read-only; Supabase is the primary store
    }
    const cleanAlt = rawBaseName.replace(/[-_]/g, " ").trim() || "صورة من المعرض";

    const newAsset: MediaAsset = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename: uniqueFilename,
      url: publicUrl,
      mimeType: file.type || `image/${ext.replace(".", "")}`,
      sizeBytes: file.size,
      alt: cleanAlt,
      altEn: rawBaseName.replace(/[-_]/g, " ").trim() || "Portfolio Artwork",
      uploadedAt: new Date().toISOString(),
    };

    if (!data.media) data.media = [];
    data.media.unshift(newAsset);
    await savePortfolioData(data, "Admin", `Uploaded media: ${uniqueFilename}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      asset: newAsset,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء معالجة وحفظ الملف" },
      { status: 500 }
    );
  }
}
