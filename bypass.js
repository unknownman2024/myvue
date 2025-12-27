const playwright = require("playwright-extra");

// ▼▼ Paste latest tokens here ▼▼
const cookies = [
  {
    name: "microservicesToken",
    value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    domain: "www.myvue.com",
    path: "/",
    httpOnly: true,
    secure: true
  },
  {
    name: "microservicesRefreshToken",
    value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    domain: "www.myvue.com",
    path: "/",
    httpOnly: true,
    secure: true
  }
];

const filmId = process.argv[2] || "HO00020882";
const API = `https://www.myvue.com/api/microservice/showings/cinemas?filmId=${filmId}`;

(async () => {
  console.log(`🎬 Fetching ${filmId} with auth...`);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox"]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    locale: "en-GB"
  });

  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log("📡 Fetching API via XHR + Auth...");
  const response = await page.evaluate(
    async ({ url, token }) => {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      return await res.text();
    },
    { url: API, token: cookies[0].value }
  );

  console.log("\n=== RAW RESPONSE ===\n");
  console.log(response.slice(0, 300));

  try {
    const data = JSON.parse(response);
    console.log("\n🎉 Parsed JSON:\n", data);
  } catch {
    console.log("\n❌ Token expired or invalid. Update cookie.");
  }

  await browser.close();
})();
