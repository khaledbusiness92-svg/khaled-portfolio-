import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

function hashPassword(password, existingSalt) {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return { hash, salt };
}

function verifyPassword(attempt, storedHash, storedSalt) {
  const { hash } = hashPassword(attempt, storedSalt);
  return hash === storedHash;
}

const NEW_STRONG_PASSWORD = "Khaled@Studio#2026!";

async function run() {
  console.log("Setting new strong password:", NEW_STRONG_PASSWORD);
  const { hash, salt } = hashPassword(NEW_STRONG_PASSWORD);
  const sessionSecret = crypto.randomBytes(32).toString("hex");

  // 1. Update local portfolio.json
  const jsonPath = path.join(process.cwd(), "src", "data", "portfolio.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  data.auth = {
    passwordHash: hash,
    salt,
    lastPasswordChange: new Date().toISOString(),
    sessionSecret,
  };
  delete data.adminPassword;

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("✓ Updated local portfolio.json");

  // 2. Update Supabase
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://urzpirrhdqwuhdcvaskg.supabase.co";
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: sbErr } = await supabase
    .from("portfolio_data")
    .upsert({
      id: "main",
      data,
      updated_at: new Date().toISOString(),
    });

  if (sbErr) {
    throw new Error(`Supabase update error: ${sbErr.message}`);
  }
  console.log("✓ Updated Supabase portfolio_data with new hashed password");

  // Verify
  const verified = verifyPassword(NEW_STRONG_PASSWORD, hash, salt);
  console.log("Verification result:", verified ? "SUCCESS" : "FAILED");
}

run().catch(console.error);

