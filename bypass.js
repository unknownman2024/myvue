const playwright = require("playwright-extra");

// ✨ Put your cookies here
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
    args: ["--no-sandbox"]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    locale: "en-GB"
  });

  // Add cookies to session
  await context.addCookies(cookies);

  const page = await context.newPage();

  // Direct API call with AUTHORIZATION HEADER
  const response = await page.evaluate(async (url, token) => {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    return await res.text();
  }, API, cookies[0].value);

  console.log("\n=== RAW RESPONSE ===\n");
  console.log(response.slice(0, 500));

  try {
    const data = JSON.parse(response);
    console.log("\n🎉 JSON Data:\n", data);
  } catch {
    console.log("\n❌ Still got blocked or invalid auth.\nCheck if token expired.");
  }

  await browser.close();
})();
