import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";



export async function GET() {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = data.projects || [];
    const publishedCount = projects.filter((p) => p.published !== false).length;
    const draftCount = projects.filter((p) => p.published === false).length;
    const featuredCount = projects.filter((p) => p.featured).length;

    const media = data.media || [];
    const totalMediaBytes = media.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);

    const pages = data.pages || {};
    const pageKeys = Object.keys(pages);

    const recentProjects = projects.slice(0, 5);
    const recentMedia = media.slice(0, 6);
    const recentRevisions = (data.revisions || []).slice(0, 6);

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: projects.length,
        publishedProjects: publishedCount,
        draftProjects: draftCount,
        featuredProjects: featuredCount,
        totalCategories: data.categories?.length || 4,
        totalSkills: data.skills?.reduce((acc, s) => acc + s.items.length, 0) || 0,
        totalMedia: media.length,
        totalMediaBytes,
        totalPages: pageKeys.length,
      },
      brand: {
        siteName: data.brand?.siteName || data.profile.name,
        logoType: data.brand?.logoType || "both",
        logoUrl: data.brand?.logoUrl,
        monogramText: data.brand?.monogramText || "خ",
      },
      recentProjects,
      recentMedia,
      recentRevisions,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
