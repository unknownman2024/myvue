const playwright = require("playwright-extra");
// built-in stealth plugin (updated way)
const stealth = require("playwright-extra/dist/stealth")();
playwright.use(stealth);

const filmId = process.argv[2] || "HO00020882";
const TARGET_URL = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Preload homepage to get CF cookies
  await page.goto("https://www.myvue.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  const body = await page.evaluate(() => document.body.innerText);

  console.log("\n=== RAW RESPONSE ===\n", body);

  try {
    const data = JSON.parse(body);
    console.log("\n🎉 PARSED JSON:\n", data);
  } catch {
    console.log("\n❌ Could not parse JSON, Cloudflare may still be blocking.");
  }

  await browser.close();
})();
