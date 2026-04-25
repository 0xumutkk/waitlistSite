import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  const el = document.elementFromPoint(40, 1030);
  const parents = [];
  let cur = el;
  for (let i = 0; i < 6 && cur; i++) {
    parents.push({ tag: cur.tagName, cls: cur.className?.toString?.() || "", text: (cur.textContent || "").slice(0, 80) });
    cur = cur.parentElement;
  }
  return parents;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
