import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { FooterSettings } from "@/lib/types";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      footer: data.footer,
    });
  } catch (error) {
    console.error("Fetch footer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer settings" },
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

    const updates = (await req.json()) as Partial<FooterSettings>;

    data.footer = {
      ...(data.footer || {
        bioSummary: "",
        bioSummaryEn: "",
        copyrightText: "",
        copyrightTextEn: "",
        showSocialLinks: true,
        showContactChannels: true,
        showSitemap: true,
        links: [],
      }),
      ...updates,
    };

    await savePortfolioData(data, "Admin", "Updated footer configuration");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث إعدادات الفوتر بنجاح",
      footer: data.footer,
    });
  } catch (error) {
    console.error("Save footer error:", error);
    return NextResponse.json(
      { error: "Failed to update footer settings" },
      { status: 500 }
    );
  }
}
