// 產生 LINE 圖文選單圖片：node render.js  → images/tab1.jpg ~ tab3.jpg
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2500, height: 1686 }, deviceScaleFactor: 1 });
  for (const n of [1, 2, 3]) {
    await page.goto('file://' + path.join(__dirname, 'design.html') + '?tab=' + n);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(__dirname, 'images', `tab${n}.jpg`), type: 'jpeg', quality: 88 });
  }
  await browser.close();
})();
