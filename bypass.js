// Node 18+
// Cloudflare Bypass for MyVue API

const playwright = require("playwright-extra");
const stealth = require("playwright-extra/dist/stealth")();
playwright.use(stealth);

const filmId = process.argv[2] || "HO00020882";
const TARGET_URL = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎯 Fetching data for ${filmId}...`);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
      "--no-first-run"
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Load homepage first to trigger cookie creation
  console.log("🌐 Setting cookies via homepage...");
  await page.goto("https://www.myvue.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Now hit API
  console.log("📡 Calling API:", TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  const body = await page.evaluate(() => document.body.innerText);

  console.log("\n=== RAW RESPONSE START ===");
  console.log(body.substring(0, 500)); // preview first 500 chars
  console.log("=== RAW RESPONSE END ===\n");

  try {
    const json = JSON.parse(body);
    console.log("🎉 Parsed JSON:");
    console.log(json);
  } catch {
    console.log("❌ JSON parse failed. Cloudflare may still be blocking.");
  }

  await browser.close();
})();
