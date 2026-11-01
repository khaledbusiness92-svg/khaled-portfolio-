import fs from "fs";
import path from "path";

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3001";

async function runAllTests() {
  console.log("=== STARTING 14-POINT IMAGE LIFECYCLE AUDIT & TEST SUITE ===\n");

  const results = [];

  // Helper to log test result
  function report(num, name, passed, details = "") {
    const status = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[Test ${num}] ${status}: ${name}`);
    if (details) console.log(`   └─ ${details}`);
    results.push({ num, name, passed, details });
  }

  // 0. Authenticate
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "Khaled@Studio#2026!" }),
  });
  const cookie = loginRes.headers.get("set-cookie");
  if (!loginRes.ok || !cookie) {
    console.error("FATAL: Admin login failed. Cannot run authenticated tests.");
    process.exit(1);
  }
  console.log("Admin session authenticated successfully.\n");

  // Helper to create a valid 1x1 PNG in memory
  function createTestPng(r = 215, g = 201, b = 178) {
    // 1x1 valid PNG buffer
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR header
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 px
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit truecolor
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xd7, 0x63, r, g, b, 0x00, 0x00,
      0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, // IEND chunk
      0xae, 0x42, 0x60, 0x82
    ]);
  }

  // Helper to upload a buffer
  async function uploadBuffer(buf, filename, mime = "image/png", authCookie = cookie) {
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`),
      buf,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const headers = {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    };
    if (authCookie) headers["Cookie"] = authCookie;

    return fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers,
      body,
    });
  }

  let createdProjectId = null;
  let testUploadedUrl = null;

  // --- Test 1: Creating a project with a new image ---
  try {
    const png1 = createTestPng(200, 50, 50);
    const upRes = await uploadBuffer(png1, "test-artwork-creation.png");
    const upJson = await upRes.json();
    testUploadedUrl = upJson.url;

    const projRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        title: "عمل تجريبي لاختبار الرفع",
        titleEn: "Test Artwork for Upload Verification",
        category: "restaurant",
        image: testUploadedUrl,
        tools: "Procreate, Photoshop",
      }),
    });
    const projJson = await projRes.json();
    createdProjectId = projJson.project?.id;
    const passed = projRes.status === 201 && projJson.project?.image === testUploadedUrl;
    report(1, "Creating a project with a new image", passed, `Project ID: ${createdProjectId}, Image: ${testUploadedUrl}`);
  } catch (err) {
    report(1, "Creating a project with a new image", false, err.message);
  }

  // --- Test 2: Replacing an existing project's image ---
  try {
    const png2 = createTestPng(50, 200, 50);
    const upRes2 = await uploadBuffer(png2, "replacement-cover.png");
    const upJson2 = await upRes2.json();
    const replacementUrl = upJson2.url;

    const updateRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        id: createdProjectId,
        image: replacementUrl,
      }),
    });
    const updateJson = await updateRes.json();
    const passed = updateRes.ok && updateJson.project?.image === replacementUrl && updateJson.project?.thumbnail === replacementUrl;
    report(2, "Replacing an existing project's image", passed, `Old URL replaced with: ${replacementUrl}`);
  } catch (err) {
    report(2, "Replacing an existing project's image", false, err.message);
  }

  // --- Test 3: Updating the profile picture ---
  try {
    const pngAvatar = createTestPng(30, 30, 220);
    const upRes3 = await uploadBuffer(pngAvatar, "artist-new-avatar.png");
    const upJson3 = await upRes3.json();
    const avatarUrl = upJson3.url;

    const profRes = await fetch(`${BASE_URL}/api/admin/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        avatar: avatarUrl,
      }),
    });
    const profJson = await profRes.json();
    const passed = profRes.ok && profJson.profile?.avatar === avatarUrl;
    report(3, "Updating the profile picture", passed, `New Avatar URL: ${avatarUrl}`);
  } catch (err) {
    report(3, "Updating the profile picture", false, err.message);
  }

  // --- Test 4: Replacing the website logo ---
  try {
    const pngLogo = createTestPng(215, 201, 178);
    const upRes4 = await uploadBuffer(pngLogo, "brand-logo-light.png");
    const upJson4 = await upRes4.json();
    const logoUrl = upJson4.url;

    const brandRes = await fetch(`${BASE_URL}/api/admin/brand`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        logoUrl: logoUrl,
        logoLightUrl: logoUrl,
      }),
    });
    const brandJson = await brandRes.json();
    const passed = brandRes.ok && brandJson.brand?.logoLightUrl === logoUrl;
    report(4, "Replacing the website logo", passed, `New Logo URL: ${logoUrl}`);
  } catch (err) {
    report(4, "Replacing the website logo", false, err.message);
  }

  // --- Test 5: Updating a gallery image ---
  try {
    const pngGal = createTestPng(150, 150, 50);
    const upRes5 = await uploadBuffer(pngGal, "artwork-gallery-extra.png");
    const upJson5 = await upRes5.json();
    const galUrl = upJson5.url;

    const galUpdateRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        id: createdProjectId,
        gallery: [galUrl],
      }),
    });
    const galJson = await galUpdateRes.json();
    const passed = galUpdateRes.ok && Array.isArray(galJson.project?.gallery) && galJson.project.gallery.includes(galUrl);
    report(5, "Updating a gallery image", passed, `Gallery array contains: ${galUrl}`);
  } catch (err) {
    report(5, "Updating a gallery image", false, err.message);
  }

  // --- Test 6: Uploading an invalid file (bad magic bytes / fake extension) ---
  try {
    const fakePng = Buffer.from("THIS IS NOT A VALID PNG FILE OR IMAGE CONTENT");
    const fakeRes = await uploadBuffer(fakePng, "malicious-script.png");
    const fakeJson = await fakeRes.json();
    const passed = fakeRes.status === 400 && fakeJson.error?.includes("PNG");
    report(6, "Uploading an invalid file (magic bytes check)", passed, `Rejected with 400: ${fakeJson.error}`);
  } catch (err) {
    report(6, "Uploading an invalid file", false, err.message);
  }

  // --- Test 7: Uploading an oversized file (>20MB) ---
  try {
    // 21 MB dummy buffer (doesn't need to be sent in full if simulated header length or 21MB slice)
    const largeBuf = Buffer.alloc(21 * 1024 * 1024);
    // write valid png header so it passes extension check
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(largeBuf, 0);
    const largeRes = await uploadBuffer(largeBuf, "huge-file-test.png");
    const largeJson = await largeRes.json();
    const passed = largeRes.status === 413 && largeJson.error?.includes("20");
    report(7, "Uploading an oversized file (>20MB limit)", passed, `Rejected with 413 Payload Too Large: ${largeJson.error}`);
  } catch (err) {
    report(7, "Uploading an oversized file", false, err.message);
  }

  // --- Test 8: Simulating an upload failure (unauthenticated) ---
  try {
    const pngUnauth = createTestPng(10, 10, 10);
    const unauthRes = await uploadBuffer(pngUnauth, "unauthorized.png", "image/png", null);
    const unauthJson = await unauthRes.json();
    const passed = unauthRes.status === 401 && unauthJson.error?.includes("غير مصرح");
    report(8, "Simulating an upload failure (unauthenticated access)", passed, `Rejected with 401 Unauthorized: ${unauthJson.error}`);
  } catch (err) {
    report(8, "Simulating an upload failure", false, err.message);
  }

  // --- Test 9: Simulating a save failure after successful upload ---
  try {
    const validPng = createTestPng(80, 80, 80);
    const upRes9 = await uploadBuffer(validPng, "orphan-candidate.png");
    const upJson9 = await upRes9.json();
    const uploadedUrl9 = upJson9.url;

    // Send project save missing title and category
    const badSaveRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        image: uploadedUrl9,
        // missing title and category intentionally
      }),
    });
    await badSaveRes.json();
    // The upload succeeded (file exists either on remote CDN or locally), but project save rejected safely
    const isRemote = uploadedUrl9.startsWith("http");
    let fileExists = false;
    if (isRemote) {
      const cdnCheck = await fetch(uploadedUrl9);
      fileExists = cdnCheck.ok;
    } else {
      fileExists = fs.existsSync(path.join(process.cwd(), "public", uploadedUrl9));
    }
    const passed = badSaveRes.status === 400 && fileExists;
    report(9, "Simulating save failure after successful upload", passed, `Save safely rejected with 400; Uploaded file preserved (${isRemote ? "Supabase CDN" : "local disk"})`);
  } catch (err) {
    report(9, "Simulating save failure", false, err.message);
  }

  // --- Test 10: Reloading admin dashboard and checking persistence ---
  try {
    const ovRes = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { "Cookie": cookie },
    });
    const ovJson = await ovRes.json();
    const projectPersisted = ovJson.recentProjects?.some((p) => p.id === createdProjectId);
    const mediaCountPersisted = ovJson.stats?.totalMedia > 15;
    const passed = ovRes.ok && projectPersisted && mediaCountPersisted;
    report(10, "Reloading admin dashboard and checking persistence", passed, `Total projects: ${ovJson.stats?.totalProjects}, Total media: ${ovJson.stats?.totalMedia}`);
  } catch (err) {
    report(10, "Reloading admin dashboard", false, err.message);
  }

  // --- Test 11: Reloading public website and checking displayed image ---
  try {
    const publicPageRes = await fetch(`${BASE_URL}/ar`);
    await publicPageRes.text();
    // Verify image serves correctly via CDN or custom uploads route
    const imgUrl = testUploadedUrl.startsWith("http") ? testUploadedUrl : `${BASE_URL}${testUploadedUrl}`;
    const imgServeRes = await fetch(imgUrl);
    const imgBuf = Buffer.from(await imgServeRes.arrayBuffer());
    const isPng = imgBuf[0] === 0x89 && imgBuf[1] === 0x50;
    const passed = publicPageRes.status === 200 && imgServeRes.status === 200 && isPng;
    report(11, "Reloading public website & checking displayed image serving", passed, `Image ${testUploadedUrl} served with HTTP 200, Content-Type: ${imgServeRes.headers.get("content-type")}`);
  } catch (err) {
    report(11, "Reloading public website", false, err.message);
  }

  // --- Test 12: Storage persistence verification ---
  try {
    let exists = false;
    let sizeInfo = "";
    if (testUploadedUrl.startsWith("http")) {
      const cdnRes = await fetch(testUploadedUrl);
      exists = cdnRes.ok;
      sizeInfo = `${cdnRes.headers.get("content-length")} bytes from CDN`;
    } else {
      const diskPath = path.join(process.cwd(), "public", testUploadedUrl);
      exists = fs.existsSync(diskPath);
      const stat = fs.statSync(diskPath);
      sizeInfo = `${stat.size} bytes on disk`;
    }
    report(12, "Verifying storage behavior & permanent persistence", exists, `Permanent file verified: ${sizeInfo}`);
  } catch (err) {
    report(12, "Verifying storage behavior", false, err.message);
  }

  // --- Test 13: Updating one project without altering unrelated projects or profile ---
  try {
    const dataBefore = JSON.parse(fs.readFileSync("src/data/portfolio.json", "utf8"));
    const originalProjCount = dataBefore.projects.length;
    const originalAvatar = dataBefore.profile.avatar;

    // Update only the test project title
    const patchRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        id: createdProjectId,
        title: "عنوان محدث مستقل",
        titleEn: "Isolated Updated Title",
      }),
    });
    const dataAfter = JSON.parse(fs.readFileSync("src/data/portfolio.json", "utf8"));
    const proj1 = dataAfter.projects.find((p) => p.id === "proj-1");
    const passed =
      patchRes.ok &&
      dataAfter.projects.length === originalProjCount &&
      dataAfter.profile.avatar === originalAvatar &&
      proj1.title === "إعلان وجبات مميز لمطعم برجر وسندوتشات";
    report(13, "Updating one project without changing unrelated records", passed, `Unrelated proj-1 and profile data remained untouched`);
  } catch (err) {
    report(13, "Updating one project in isolation", false, err.message);
  }

  // --- Test 14: Checking whether image is shared before attempting deletion ---
  try {
    // Check in-use detection on any currently active asset
    const mediaCheckRes = await fetch(`${BASE_URL}/api/admin/media`, {
      headers: { "Cookie": cookie },
    });
    const mediaData = await mediaCheckRes.json();
    const inUseAsset = mediaData.media?.find((m) => m.isUsed);

    if (!inUseAsset) {
      throw new Error("No in-use asset found in media library for test");
    }

    // Attempt delete without force (expect 409)
    const delAttemptRes = await fetch(`${BASE_URL}/api/admin/media?id=${encodeURIComponent(inUseAsset.id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({ id: inUseAsset.id, force: false }),
    });
    const delAttemptJson = await delAttemptRes.json();

    // Now clean up the temporary test project created in Test 1
    if (createdProjectId) {
      await fetch(`${BASE_URL}/api/projects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Cookie": cookie },
        body: JSON.stringify({ id: createdProjectId }),
      });
    }

    const passed = delAttemptRes.status === 409 && delAttemptJson.inUse === true && Array.isArray(delAttemptJson.locations);
    report(14, "Shared image dependency detection before deletion", passed, `Protected with 409 when in-use; Location count: ${delAttemptJson.locations?.length}`);
  } catch (err) {
    report(14, "Shared image dependency detection", false, err.message);
  }

  console.log("\n=======================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`TOTAL AUDIT RESULTS: ${totalPassed} / ${results.length} PASSED`);
  console.log("=======================================================\n");

  if (totalPassed === results.length) {
    console.log("ALL 14 IMAGE LIFECYCLE TESTS COMPLETED WITH 100% SUCCESS!");
  } else {
    console.error("SOME TESTS FAILED. PLEASE REVIEW LOGS.");
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Fatal test suite runner error:", err);
  process.exit(1);
});
