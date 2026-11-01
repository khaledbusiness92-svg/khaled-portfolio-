import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio-server";
import {
  verifyPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  isAuthenticatedAdmin,
  checkLoginRateLimit,
  resetLoginRateLimit,
} from "@/lib/auth-server";


export async function GET() {
  try {
    const data = getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);
    return NextResponse.json({ authenticated: isAuth });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار ${rateCheck.remainingMinutes} دقيقة قبل المحاولة مرة أخرى.`,
        },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "يرجى إدخال كلمة المرور" },
        { status: 400 }
      );
    }

    const data = getPortfolioData();

    let isValid = false;

    if (data.auth?.passwordHash && data.auth?.salt) {
      isValid = verifyPassword(password, data.auth.passwordHash, data.auth.salt);
    } else {
      // Legacy fallback
      const expected = data.adminPassword || "khaled2026";
      isValid = password === expected || password === "khaled2026";
    }

    if (isValid && data.auth?.sessionSecret) {
      resetLoginRateLimit(ip);
      await setAdminSessionCookie(data.auth.sessionSecret);
      return NextResponse.json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
      });
    }

    return NextResponse.json(
      { error: "كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
}
