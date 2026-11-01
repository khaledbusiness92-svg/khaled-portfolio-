import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      revisions: data.revisions || [],
    });
  } catch (error) {
    console.error("Fetch revisions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { revisionId } = await req.json();
    if (!revisionId) {
      return NextResponse.json(
        { error: "Revision ID is required" },
        { status: 400 }
      );
    }

    const targetRev = (data.revisions || []).find((r) => r.id === revisionId);
    if (!targetRev) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    // Restore snapshot pieces where available
    if (targetRev.snapshot.brand) {
      data.brand = { ...targetRev.snapshot.brand };
    }
    if (targetRev.snapshot.profile) {
      data.profile = { ...targetRev.snapshot.profile };
    }

    await savePortfolioData(
      data,
      "Admin",
      `Restored revision from ${targetRev.timestamp}`
    );

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: `تم استعادة النسخة المؤرخة في ${new Date(
        targetRev.timestamp
      ).toLocaleString("ar-EG")} بنجاح`,
    });
  } catch (error) {
    console.error("Restore revision error:", error);
    return NextResponse.json(
      { error: "Failed to restore revision" },
      { status: 500 }
    );
  }
}
