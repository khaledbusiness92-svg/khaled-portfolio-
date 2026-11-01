import { NextResponse } from "next/server";
import { getPortfolioData, savePortfolioData } from "@/lib/portfolio-server";
import {
  isAuthenticatedAdmin,
  verifyPassword,
  hashPassword,
  setAdminSessionCookie,
  generateSessionSecret,
} from "@/lib/auth-server";


export async function POST(req: Request) {
  try {
    const data = await getPortfolioData();
    const isAuth = await isAuthenticatedAdmin(data);

    if (!isAuth) {
      return NextResponse.json(
        { error: "غير مصرح لك بتنفيذ هذه العملية" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "يرجى إدخال كلمة المرور الحالية والجديدة" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة غير متطابقة مع التأكيد" },
        { status: 400 }
      );
    }

    // Verify current password
    let isCurrentValid = false;
    if (data.auth?.passwordHash && data.auth?.salt) {
      isCurrentValid = verifyPassword(
        currentPassword,
        data.auth.passwordHash,
        data.auth.salt
      );
    } else {
      isCurrentValid =
        currentPassword === (data.adminPassword || "khaled2026") ||
        currentPassword === "khaled2026";
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 400 }
      );
    }

    // Hash new password and rotate session secret
    const { hash, salt } = hashPassword(newPassword);
    const newSessionSecret = generateSessionSecret();

    data.auth = {
      passwordHash: hash,
      salt: salt,
      lastPasswordChange: new Date().toISOString(),
      sessionSecret: newSessionSecret,
    };
    delete data.adminPassword;

    await savePortfolioData(data, "Admin", "Admin password changed successfully");

    // Re-issue cookie with new secret
    await setAdminSessionCookie(newSessionSecret);

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور وتأمين الجلسة بنجاح",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "فشل تغيير كلمة المرور" },
      { status: 500 }
    );
  }
}

