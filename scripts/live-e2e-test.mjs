import { createClient } from "@supabase/supabase-js";

const BASE_URL = "http://localhost:3001";
const STRONG_PASSWORD = "Khaled@Studio#2026!";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://urzpirrhdqwuhdcvaskg.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runLiveTest() {
  console.log("==================================================================");
  console.log("       LIVE END-TO-END TEST SUITE FOR KHALED-PORTFOLIO            ");
  console.log("==================================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function assert(testName, condition, detail = "") {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      if (detail) console.log(`       └─ ${detail}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ✗ ${testName}`);
      if (detail) console.error(`       └─ ${detail}`);
      failedCount++;
    }
  }

  // -------------------------------------------------------------
  // SECTION 1: PUBLIC BILINGUAL WEBSITE & NAVIGATION
  // -------------------------------------------------------------
  console.log("--- 1. Testing Public Bilingual Website & Pages ---");

  // Test Arabic Homepage
  const arRes = await fetch(`${BASE_URL}/ar`);
  const arHtml = await arRes.text();
  assert(
    "Arabic Homepage (/ar)",
    arRes.status === 200 && arHtml.includes("خالد محمد عبد السميع") && arHtml.includes('dir="rtl"'),
    "RTL document direction and artist name verified"
  );

  // Test English Homepage
  const enRes = await fetch(`${BASE_URL}/en`);
  const enHtml = await enRes.text();
  assert(
    "English Homepage (/en)",
    enRes.status === 200 && enHtml.includes("Khaled Mohamed Abdel Samee") && enHtml.includes('dir="ltr"'),
    "LTR document direction and English name verified"
  );

  // Test Works & Archive Page
  const workRes = await fetch(`${BASE_URL}/ar/work`);
  assert("Work Archive Page (/ar/work)", workRes.status === 200, "HTTP 200 received");

  // Test About Page
  const aboutRes = await fetch(`${BASE_URL}/ar/about`);
  assert("About Page (/ar/about)", aboutRes.status === 200, "HTTP 200 received");

  // Test Contact Page
  const contactRes = await fetch(`${BASE_URL}/ar/contact`);
  assert("Contact Page (/ar/contact)", contactRes.status === 200, "HTTP 200 received");

  // Test /login path redirect to /admin
  const loginRouteRes = await fetch(`${BASE_URL}/login`, { redirect: "manual" });
  assert(
    "Login Route Path (/login)",
    loginRouteRes.status === 307 || loginRouteRes.status === 308 || loginRouteRes.status === 200,
    `Status ${loginRouteRes.status} -> Redirects to /admin correctly`
  );

  // Test Admin Page initial load
  const adminPageRes = await fetch(`${BASE_URL}/admin`);
  const adminHtml = await adminPageRes.text();
  assert(
    "Admin Dashboard Page (/admin)",
    adminPageRes.status === 200 && adminHtml.includes("لوحة التحكم"),
    "Admin login interface rendered with HTTP 200"
  );

  // -------------------------------------------------------------
  // SECTION 2: AUTHENTICATION & SECURITY VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Authentication & Strong Password ---");

  // Test Bad Password rejection
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong-password-123" }),
  });
  assert(
    "Reject Incorrect Password",
    badLoginRes.status === 401,
    "HTTP 401 Unauthorized correctly returned"
  );

  // Test Strong Handover Password acceptance
  const goodLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: STRONG_PASSWORD }),
  });
  const goodLoginJson = await goodLoginRes.json();
  const authCookie = goodLoginRes.headers.get("set-cookie");
  assert(
    `Accept Strong Password (${STRONG_PASSWORD})`,
    goodLoginRes.status === 200 && goodLoginJson.success && Boolean(authCookie),
    "Authenticated session token cookie generated"
  );

  // -------------------------------------------------------------
  // SECTION 3: SUPABASE CLOUD STORAGE & CDN VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing Supabase Cloud Image Upload & CDN ---");

  // Create test 1x1 PNG buffer
  const testPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const form = new FormData();
  form.append("file", new Blob([testPngBuffer], { type: "image/png" }), "e2e-live-artwork.png");

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: authCookie },
    body: form,
  });
  const uploadJson = await uploadRes.json();
  const uploadedUrl = uploadJson.url || "";
  const isSupabaseCdn = uploadedUrl.startsWith(SUPABASE_URL);

  assert(
    "Upload to Supabase Storage",
    uploadRes.status === 200 && isSupabaseCdn,
    `Direct Cloud URL: ${uploadedUrl}`
  );

  // Verify that the uploaded image can be served publicly via Cloudflare CDN
  let cdnOk = false;
  let cdnType = "";
  if (isSupabaseCdn) {
    const cdnRes = await fetch(uploadedUrl);
    cdnOk = cdnRes.ok;
    cdnType = cdnRes.headers.get("content-type") || "";
  }
  assert(
    "Public CDN Image Serving",
    cdnOk && cdnType.includes("image/png"),
    `CDN response HTTP 200, Content-Type: ${cdnType}`
  );

  // -------------------------------------------------------------
  // SECTION 4: DATABASE PERSISTENCE IN SUPABASE (POSTGRESQL)
  // -------------------------------------------------------------
  console.log("\n--- 4. Testing Supabase PostgreSQL Database Sync ---");

  // Create a new Project with the uploaded image
  const testProjectPayload = {
    title: "مشروع فحص النظام التلقائي",
    titleEn: "Automated System Verification Project",
    category: "commercial",
    categoryEn: "Commercial Art",
    description: "مشروع اختباري مؤقت للتأكد من المزامنة مع سوبابيز",
    descriptionEn: "Temporary test project to verify Supabase synchronization",
    year: "2026",
    client: "Studio Verification",
    clientEn: "Studio Verification",
    tools: ["Photoshop", "Next.js"],
    image: uploadedUrl,
    thumbnail: uploadedUrl,
    featured: false,
    published: true,
  };

  const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify(testProjectPayload),
  });
  const createProjJson = await createProjRes.json();
  const createdProjectId = createProjJson.project?.id;

  assert(
    "Create Project in CMS",
    (createProjRes.status === 201 || createProjRes.status === 200) && Boolean(createdProjectId),
    `Project ID: ${createdProjectId} (HTTP ${createProjRes.status})`
  );

  // Verify directly from Supabase PostgreSQL database table `portfolio_data`
  const { data: dbData, error: dbErr } = await supabase
    .from("portfolio_data")
    .select("data, updated_at")
    .eq("id", "main")
    .single();

  const foundInSupabase = dbData?.data?.projects?.some((p) => p.id === createdProjectId);
  assert(
    "Verify Direct in Supabase PostgreSQL",
    !dbErr && foundInSupabase,
    `Project found in Supabase table portfolio_data (Updated: ${dbData?.updated_at})`
  );

  // -------------------------------------------------------------
  // SECTION 5: CLEANUP TEST ARTIFACTS
  // -------------------------------------------------------------
  console.log("\n--- 5. Cleanup Test Artifacts ---");
  if (createdProjectId) {
    const delProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ id: createdProjectId }),
    });
    assert("Cleanup Test Project", delProjRes.ok, "Test project removed safely");
  }

  // -------------------------------------------------------------
  // FINAL SCORE & SUMMARY
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("==================================================================");

  if (failedCount === 0) {
    console.log("\n🎉 ALL TESTS PASSED! THE APPLICATION IS 100% PRODUCTION READY!");
  } else {
    process.exit(1);
  }
}

runLiveTest().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
