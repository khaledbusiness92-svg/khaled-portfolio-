import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { NavigationItem } from "@/lib/types";



export async function GET() {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      navigation: data.navigation || [],
    });
  } catch (error) {
    console.error("Fetch navigation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation" },
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

    const { navigation } = (await req.json()) as { navigation: NavigationItem[] };

    if (!Array.isArray(navigation)) {
      return NextResponse.json(
        { error: "Navigation items array is required" },
        { status: 400 }
      );
    }

    data.navigation = navigation;
    await savePortfolioData(data, "Admin", "Updated navigation menu items");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "تم تحديث عناصر القائمة الرئيسية بنجاح",
      navigation: data.navigation,
    });
  } catch (error) {
    console.error("Save navigation error:", error);
    return NextResponse.json(
      { error: "Failed to update navigation" },
      { status: 500 }
    );
  }
}
