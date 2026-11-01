import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { BrandSettings } from "@/lib/types";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      brand: data.brand,
    });
  } catch (error) {
    console.error("Fetch brand error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand settings" },
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

    const updates = (await req.json()) as Partial<BrandSettings>;

    data.brand = {
      ...(data.brand || {
        siteName: "خالد محمد عبد السميع",
        siteNameEn: "Khaled Mohamed Abdel Samee",
        tagline: "فنان رقمي ومصمم بصري",
        taglineEn: "Digital Artist & Visual Creator",
        logoType: "both",
        monogramText: "خ",
        monogramTextEn: "K",
        logoHeightDesktop: 34,
        logoHeightMobile: 28,
        primaryColor: "#D7C9B2",
        surfaceColor: "#0A0A0A",
      }),
      ...updates,
    };

    await savePortfolioData(data, "Admin", "Updated brand & logo settings");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "تم تحديث إعدادات الهوية البصرية والشعار بنجاح",
      brand: data.brand,
    });
  } catch (error) {
    console.error("Save brand error:", error);
    return NextResponse.json(
      { error: "Failed to update brand settings" },
      { status: 500 }
    );
  }
}
