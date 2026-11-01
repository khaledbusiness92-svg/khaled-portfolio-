import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import { isAuthenticatedAdmin } from "@/lib/auth-server";
import { Project } from "@/lib/types";


export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data.projects || []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const currentData = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(currentData);
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.image || !body.category) {
      return NextResponse.json(
        { error: "Title, image, and category are required" },
        { status: 400 }
      );
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      slug: body.slug || undefined,
      title: body.title,
      titleEn: body.titleEn || "",
      category: body.category,
      image: body.image,
      thumbnail: body.thumbnail || body.image,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      driveVideoUrl: body.driveVideoUrl || "",
      description: body.description || "",
      descriptionEn: body.descriptionEn || "",
      tools: Array.isArray(body.tools)
        ? body.tools
        : body.tools
        ? body.tools.split(",").map((s: string) => s.trim())
        : ["Procreate"],
      featured: Boolean(body.featured),
      published: body.published !== undefined ? Boolean(body.published) : true,
      order:
        typeof body.order === "number"
          ? body.order
          : (currentData.projects?.length || 0) + 1,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    };

    currentData.projects = [newProject, ...(currentData.projects || [])];
    await savePortfolioData(
      currentData,
      "Admin",
      `Created project: ${newProject.title}`
    );

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/ar/work", "page");
    revalidatePath("/en/work", "page");

    return NextResponse.json(
      { success: true, project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
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

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const index = currentData.projects.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const oldProject = currentData.projects[index];
    const newImage = body.image || oldProject.image;
    // If thumbnail was pointing to old image or not given, keep it in sync with newImage
    const newThumbnail =
      body.thumbnail && body.thumbnail !== oldProject.image
        ? body.thumbnail
        : newImage;

    currentData.projects[index] = {
      ...oldProject,
      ...body,
      image: newImage,
      thumbnail: newThumbnail,
      tools: Array.isArray(body.tools)
        ? body.tools
        : typeof body.tools === "string"
        ? body.tools.split(",").map((s: string) => s.trim())
        : oldProject.tools,
      gallery: Array.isArray(body.gallery)
        ? body.gallery
        : oldProject.gallery || [],
      published:
        body.published !== undefined
          ? Boolean(body.published)
          : oldProject.published !== false,
      updatedAt: new Date().toISOString(),
    };

    await savePortfolioData(
      currentData,
      "Admin",
      `Updated project: ${currentData.projects[index].title}`
    );

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/ar/work", "page");
    revalidatePath("/en/work", "page");
    const projectSlug =
      currentData.projects[index].slug || currentData.projects[index].id;
    revalidatePath(`/ar/work/${projectSlug}`, "page");
    revalidatePath(`/en/work/${projectSlug}`, "page");

    return NextResponse.json({
      success: true,
      project: currentData.projects[index],
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const currentData = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(currentData);
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || null;
      } catch {
        // empty body
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const target = currentData.projects.find((p) => p.id === id);
    currentData.projects = currentData.projects.filter((p) => p.id !== id);

    await savePortfolioData(
      currentData,
      "Admin",
      `Deleted project: ${target?.title || id}`
    );

    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en", "layout");

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
