const playwright = require("playwright");

const filmId = process.argv[2] || "HO00020882";
const API = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎬 Cloudflare Challenge Handler for film: ${filmId}`);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36",
    locale: "en-GB"
  });

  const page = await context.newPage();

  console.log("⚠️ Visiting site to trigger challenge...");
  await page.goto("https://www.myvue.com/", { waitUntil: "domcontentloaded" });

  // Detect challenge loop
  let solved = false;
  for (let i = 0; i < 10; i++) {
    const content = await page.content();

    if (content.includes("cf-")) {
      console.log(`🔄 Attempt ${i+1}/10: Waiting for Cloudflare JS...`);
      await page.waitForTimeout(4000);
    } else {
      solved = true;
      break;
    }
  }

  if (!solved) {
    console.log("❌ Cloudflare did not solve automatically.");
  }

  const cookies = await context.cookies();
  const cf = cookies.find(c => c.name === "cf_clearance");

  if (!cf) {
    console.log("❌ Could not obtain cf_clearance cookie.");
  } else {
    console.log(`🎉 GOT CLEARANCE COOKIE: ${cf.value.slice(0,20)}...`);
  }

  console.log("📡 Fetching API *AFTER* clearance...");

  const result = await page.evaluate(async (url) => {
    const r = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    return await r.text();
  }, API);

  console.log("\n🧪 PREVIEW:\n", result.slice(0, 300));

  try {
    console.log("\n🎉 JSON DATA\n", JSON.parse(result));
  } catch {
    console.log("\n❌ Still HTML / blocked (BUT we got CF cookie: progress!)");
  }

  await browser.close();
})();
