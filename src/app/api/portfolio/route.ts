import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";


export async function GET() {
  try {
    const data = await getPortfolioData();
    // Exclude security credentials from public response
    const publicData = {
      brand: data.brand,
      siteSettings: data.siteSettings,
      navigation: data.navigation,
      footer: data.footer,
      pages: data.pages,
      profile: data.profile,
      categories: data.categories,
      skills: data.skills,
      projects: data.projects,
    };
    return NextResponse.json(publicData);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const currentData = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(currentData);
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    if (updates.profile) {
      currentData.profile = { ...currentData.profile, ...updates.profile };
    }
    if (updates.categories) {
      currentData.categories = updates.categories;
    }
    if (updates.skills) {
      currentData.skills = updates.skills;
    }

    await savePortfolioData(currentData, "Admin", "Updated profile, skills & categories");

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    const publicData = {
      brand: currentData.brand,
      siteSettings: currentData.siteSettings,
      navigation: currentData.navigation,
      footer: currentData.footer,
      pages: currentData.pages,
      profile: currentData.profile,
      categories: currentData.categories,
      skills: currentData.skills,
      projects: currentData.projects,
    };
    return NextResponse.json({ success: true, data: publicData });
  } catch (error) {
    console.error("Update portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
