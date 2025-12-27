// Node 18+ Cloudflare Bypass

const playwright = require("playwright-extra");
const stealth = require("playwright-extra-plugin-stealth")();
playwright.use(stealth);

const filmId = process.argv[2] || "HO00020882";
const TARGET_URL = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎯 Fetching: ${TARGET_URL}`);

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

  const page = await browser.newPage();

  console.log("🍪 Preparing cookies...");
  await page.goto("https://www.myvue.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  console.log("🚀 Calling API...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  const body = await page.evaluate(() => document.body.innerText);

  console.log("\n=== RAW RESPONSE ===\n");
  console.log(body.substring(0, 500));
  console.log("\n=====================\n");

  // Try to parse JSON
  try {
    const data = JSON.parse(body);
    console.log("🎉 Parsed JSON Data:");
    console.log(data);
  } catch {
    console.log("❌ JSON parse failed. Cloudflare may still be blocking.");
  }

  await browser.close();
})();
