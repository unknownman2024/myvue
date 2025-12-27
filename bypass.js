// Node 18+
// Passive stealth: no plugin, just patched context

const playwright = require("playwright-extra");

const filmId = process.argv[2] || "HO00020882";
const TARGET = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log("🎬 Starting scraper for:", filmId);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    javaScriptEnabled: true,
    locale: "en-GB",
    permissions: [],
  });

  const page = await context.newPage();

  // Step 1 → Cookie Warmup
  console.log("🍪 Preparing Cloudflare cookies...");
  await page.goto("https://www.myvue.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  // Step 2 → Actual API request
  console.log("🚀 Fetching API:", TARGET);
  await page.goto(TARGET, { waitUntil: "networkidle" });

  const rawText = await page.evaluate(() => document.body.innerText);

  console.log("\n=== RAW RESPONSE (Preview) ===\n");
  console.log(rawText.slice(0, 500));
  console.log("\n=============================\n");

  try {
    const json = JSON.parse(rawText);
    console.log("🎉 Parsed JSON:\n", json);
  } catch {
    console.log("❌ Not JSON. Cloudflare still gave HTML challenge.");
  }

  await browser.close();
})();
