const playwright = require("playwright-extra");
const stealth = require("playwright-extra-plugin-stealth")();
playwright.use(stealth);

const TARGET_URL = "https://www.myvue.com/api/microservice/showings/cinemas?filmId=HO00020882";

async function run() {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: "networkidle" });

  let text = await page.evaluate(() => document.body.innerText);

  console.log("\n=== RAW RESPONSE START ===\n");
  console.log(text);
  console.log("\n=== RAW RESPONSE END ===\n");

  try {
    const parsed = JSON.parse(text);
    console.log("🎉 PARSED JSON:\n", parsed);
  } catch {
    console.log("\n❌ Could not parse JSON (maybe Cloudflare challenge?)");
  }

  await browser.close();
}

run();
