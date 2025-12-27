const playwright = require("playwright-extra");

// ----------------------
// 🔐 PUT YOUR TOKEN HERE
// ----------------------
const microservicesToken = "PUT_YOUR_TOKEN_HERE"; // microservicesToken
// ----------------------

const filmId = process.argv[2] || "HO00020882";
const API = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎬 Fetching ${filmId}...`);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
      "--lang=en-GB,en",
      "--window-size=1366,768"
    ]
  });

  const context = await browser.newContext({
    // 📌 UK Persona Spoofing
    locale: "en-GB",
    timezoneId: "Europe/London",
    geolocation: { latitude: 51.5072, longitude: -0.1276 },
    permissions: ["geolocation"],
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36",
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();

  // 🧠 Anti-detection patches
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "languages", { get: () => ["en-GB","en"] });
    Object.defineProperty(navigator, "platform", { get: () => "Win32" });
    Object.defineProperty(navigator, "language", { get: () => "en-GB" });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });

  // 🍪 Warmup visit
  console.log("🍪 Initializing session...");
  await page.goto("https://www.myvue.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 🌐 Request with AUTH
  console.log("📡 Fetching API...");
  const result = await page.evaluate(async ({ url, token }) => {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "Origin": "https://www.myvue.com",
        "Referer": "https://www.myvue.com/",
        "Accept-Language": "en-GB,en-US;q=0.9",
        "X-Requested-With": "XMLHttpRequest"
      },
      credentials: "include"
    });

    // return full text
    return await res.text();
  }, { url: API, token: microservicesToken });

  console.log("\n🧪 RAW RESPONSE PREVIEW:\n", result.slice(0, 500), "\n");

  try {
    const data = JSON.parse(result);
    console.log("🎉 FINAL JSON RESULT:\n", data);
  } catch {
    console.log("❌ Still blocked or invalid token.\n👉 Try refreshing token or let me add auto-refresh.");
  }

  await browser.close();
})();
