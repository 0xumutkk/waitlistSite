import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const scroller = document.querySelector(".feature-scroller");
  if (scroller) scroller.scrollLeft = 100000;
});
await page.waitForTimeout(400);
await page.screenshot({ path: "../reference/snapshot-right.png", fullPage: true });
await browser.close();
console.log("Saved ../reference/snapshot-right.png");
