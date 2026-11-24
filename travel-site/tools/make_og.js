// Renders tools/og.html to og-image.png (1200x630, the link-preview image). Run: node tools/make_og.js
const { chromium } = require('playwright'); const path = require('path'); const { pathToFileURL } = require('url');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto(pathToFileURL(path.join(__dirname, 'og.html')).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, '..', 'og-image.png') }); await b.close(); console.log('wrote og-image.png'); })();
