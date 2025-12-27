// Node 18+ - Cloudflare Bypass with XHR Fetch inside Browser

const playwright = require("playwright-extra");

const filmId = process.argv[2] || "HO00020882";
const TARGET = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎬 Starting scraper for: ${filmId}`);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process"
    ]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    javaScriptEnabled: true,
    locale: "en-GB"
  });

  const page = await context.newPage();

  console.log("🍪 Loading homepage for cookies...");
  await page.goto("https://www.myvue.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  console.log("📡 Fetching API via browser fetch (XHR)...");
  const response = await page.evaluate(async (url) => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "user-agent": navigator.userAgent
        }
      });
      return await res.text(); // return raw text to parse outside
    } catch (err) {
      return "ERROR:" + err.toString();
    }
  }, TARGET);

  console.log("\n=== RAW RESPONSE PREVIEW ===");
  console.log(response.slice(0, 500));
  console.log("============================\n");

  try {
    const json = JSON.parse(response);
    console.log("🎉 Parsed JSON:");
    console.log(json);
  } catch {
    console.log("❌ JSON parse failed — Cloudflare still blocking or non-JSON response.");
  }

  await browser.close();
})();
