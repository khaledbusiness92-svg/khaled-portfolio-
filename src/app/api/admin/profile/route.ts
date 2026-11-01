import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { ProfileData } from "@/lib/types";


export async function GET() {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      profile: data.profile,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
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

    const updates = (await req.json()) as Partial<ProfileData>;

    data.profile = {
      ...(data.profile || {}),
      ...updates,
      stats: updates.stats !== undefined ? updates.stats : data.profile?.stats || [],
      contact: {
        ...(data.profile?.contact || {}),
        ...(updates.contact || {}),
      },
    };

    await savePortfolioData(data, "Admin", "Updated artist profile & contact details");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/ar/about", "page");
    revalidatePath("/en/about", "page");
    revalidatePath("/ar/contact", "page");
    revalidatePath("/en/contact", "page");

    return NextResponse.json({
      success: true,
      message: "تم حفظ بيانات الملف التعريفي بنجاح",
      profile: data.profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ بيانات الملف التعريفي" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
