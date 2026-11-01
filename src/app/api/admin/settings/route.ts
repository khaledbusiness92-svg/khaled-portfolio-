import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { SiteSettings } from "@/lib/types";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      siteSettings: data.siteSettings,
    });
  } catch (error) {
    console.error("Fetch site settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
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

    const updates = (await req.json()) as Partial<SiteSettings>;

    data.siteSettings = {
      ...(data.siteSettings || {
        defaultLocale: "ar",
        enableEnglish: true,
        enableArabic: true,
        maintenanceMode: false,
        contactEmail: "khaled.abdelsamie.design@gmail.com",
      }),
      ...updates,
    };

    await savePortfolioData(data, "Admin", "Updated site-wide settings & SEO");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "تم تحديث إعدادات الموقع العامة بنجاح",
      siteSettings: data.siteSettings,
    });
  } catch (error) {
    console.error("Save site settings error:", error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
