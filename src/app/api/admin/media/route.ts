import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getPortfolioData,
  savePortfolioData,
  findMediaUsage,
} from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";



export async function GET(req: Request) {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const usageUrl = searchParams.get("usageUrl");

    // Quick dependency check for a single media URL
    if (usageUrl) {
      const usage = findMediaUsage(data, usageUrl);
      return NextResponse.json({ success: true, ...usage });
    }

    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const typeFilter = searchParams.get("type") || "all";

    let media = data.media || [];

    if (q) {
      media = media.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          m.alt.toLowerCase().includes(q) ||
          (m.altEn && m.altEn.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") {
      media = media.filter((m) => m.mimeType.includes(typeFilter));
    }

    // Attach usage count to each media item
    const mediaWithUsage = media.map((m) => {
      const usage = findMediaUsage(data, m.url);
      return {
        ...m,
        isUsed: usage.isUsed,
        usageCount: usage.locations.length,
        usageLocations: usage.locations,
      };
    });

    return NextResponse.json({
      success: true,
      media: mediaWithUsage,
      totalCount: (data.media || []).length,
    });
  } catch (error) {
    console.error("Fetch media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, alt, altEn, tags } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Media asset ID is required" },
        { status: 400 }
      );
    }

    const mediaList = data.media || [];
    const index = mediaList.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    mediaList[index] = {
      ...mediaList[index],
      alt: typeof alt === "string" ? alt : mediaList[index].alt,
      altEn: typeof altEn === "string" ? altEn : mediaList[index].altEn,
      tags: Array.isArray(tags) ? tags : mediaList[index].tags,
    };

    await savePortfolioData(
      data,
      "Admin",
      `Updated media metadata: ${mediaList[index].filename}`
    );

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات الوسائط بنجاح",
      asset: mediaList[index],
    });
  } catch (error) {
    console.error("Update media error:", error);
    return NextResponse.json(
      { error: "Failed to update media asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let id: string | null = null;
    let force = false;

    // 1. Try searchParams
    const { searchParams } = new URL(req.url);
    if (searchParams.has("id")) {
      id = searchParams.get("id");
      force = searchParams.get("force") === "true";
    }

    // 2. Try JSON body
    if (!id) {
      try {
        const body = await req.json();
        if (body && typeof body === "object") {
          id = body.id || null;
          if (body.force !== undefined) {
            force = Boolean(body.force);
          }
        }
      } catch {
        // Body was empty or not json
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Media asset ID is required" },
        { status: 400 }
      );
    }

    const mediaList = data.media || [];
    const targetAsset = mediaList.find((m) => m.id === id);

    if (!targetAsset) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    // Check usage dependencies
    const usage = findMediaUsage(data, targetAsset.url);
    if (usage.isUsed && !force) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف هذا الملف مباشرة لأنه مستخدم بالفعل في مشاريع أو صفحات على الموقع.",
          inUse: true,
          locations: usage.locations,
        },
        { status: 409 }
      );
    }

    // Remove file from disk if located inside public/uploads
    if (targetAsset.url.startsWith("/uploads/")) {
      const cleanFile = path.basename(targetAsset.url);
      const diskPath = path.join(process.cwd(), "public", "uploads", cleanFile);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.warn("Could not remove file from disk:", diskPath, e);
        }
      }
    }

    data.media = mediaList.filter((m) => m.id !== id);
    await savePortfolioData(
      data,
      "Admin",
      `Deleted media asset: ${targetAsset.filename}`
    );

    return NextResponse.json({
      success: true,
      message: "تم حذف ملف الوسائط بنجاح",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset" },
      { status: 500 }
    );
  }
}
