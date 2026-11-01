import crypto from "crypto";
import { cookies } from "next/headers";
import { PortfolioData } from "./types";

const COOKIE_NAME = "khaled_admin_session";
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// In-memory sliding window rate limiter for login
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingMinutes?: number;
} {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(ip, { attempts: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (entry.attempts >= 5) {
    const remainingMinutes = Math.ceil((entry.resetAt - now) / 60000);
    return { allowed: false, remainingMinutes };
  }

  entry.attempts += 1;
  return { allowed: true };
}

export function resetLoginRateLimit(ip: string): void {
  loginRateLimitMap.delete(ip);
}

export function hashPassword(
  password: string,
  existingSalt?: string
): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  attempt: string,
  storedHash: string,
  storedSalt: string
): boolean {
  try {
    const { hash } = hashPassword(attempt, storedSalt);
    const attemptBuf = Buffer.from(hash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    if (attemptBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(attemptBuf, storedBuf);
  } catch {
    return false;
  }
}

export function generateSessionSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createSignedSessionToken(secret: string): string {
  const payload = {
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySignedSessionToken(
  token: string,
  secret: string
): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (!payload || payload.role !== "admin") return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures the data object has hashed credentials and a session secret.
 * Migrates plain-text adminPassword if needed.
 */
export function ensureAdminAuth(data: PortfolioData): boolean {
  let changed = false;

  if (!data.auth || !data.auth.passwordHash || !data.auth.salt) {
    const initialPlain = data.adminPassword || "khaled2026";
    const { hash, salt } = hashPassword(initialPlain);
    data.auth = {
      passwordHash: hash,
      salt: salt,
      lastPasswordChange: new Date().toISOString(),
      sessionSecret: generateSessionSecret(),
    };
    delete data.adminPassword;
    changed = true;
  } else if (!data.auth.sessionSecret) {
    data.auth.sessionSecret = generateSessionSecret();
    changed = true;
  }

  return changed;
}

export async function setAdminSessionCookie(secret: string): Promise<void> {
  const token = createSignedSessionToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // Also keep legacy admin_auth for any legacy components during transition
  cookieStore.set("admin_auth", "true", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete("admin_auth");
}

export async function isAuthenticatedAdmin(
  data: PortfolioData
): Promise<boolean> {
  try {
    const secret = data.auth?.sessionSecret;
    if (!secret) return false;

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token && verifySignedSessionToken(token, secret)) {
      return true;
    }

    // Fallback to legacy cookie if token absent but legacy is set, verifying presence
    const legacyAuth = cookieStore.get("admin_auth")?.value;
    return legacyAuth === "true";
  } catch {
    return false;
  }
}
