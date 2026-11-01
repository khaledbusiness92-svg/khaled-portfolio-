import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { PageConfig } from "@/lib/types";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      pages: data.pages || {},
    });
  } catch (error) {
    console.error("Fetch pages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages config" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pageId, pageConfig } = body as {
      pageId: string;
      pageConfig: PageConfig;
    };

    if (!pageId || !pageConfig) {
      return NextResponse.json(
        { error: "Page ID and configuration are required" },
        { status: 400 }
      );
    }

    if (!data.pages) data.pages = {};

    pageConfig.updatedAt = new Date().toISOString();
    data.pages[pageId] = pageConfig;

    await savePortfolioData(
      data,
      "Admin",
      `Updated page configuration: ${pageConfig.title || pageId}`
    );

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث إعدادات الصفحة وأقسامها بنجاح",
      pages: data.pages,
    });
  } catch (error) {
    console.error("Save page error:", error);
    return NextResponse.json(
      { error: "Failed to update page configuration" },
      { status: 500 }
    );
  }
}
