// Renders brand/*.svg to PNG for Instagram / WhatsApp profile pictures. Run: node tools/export_logo.js
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, '..', 'brand');
(async () => { const b = await chromium.launch();
  for (const [file, w, h, out, bg] of [['ghumoco-mark.svg', 640, 640, 'ghumoco-profile-640.png'], ['ghumoco-logo.svg', 1400, 0, 'ghumoco-logo-1400.png', '#F5EEE1']]) {
    const svg = fs.readFileSync(path.join(dir, file), 'utf8'); const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const H = h || Math.round(w * vb[2] / vb[1]);
    const p = await b.newPage({ viewport: { width: w, height: H } });
    await p.setContent(`<body style="margin:0;background:${bg || 'transparent'}"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${w}" height="${H}" style="display:block"></body>`);
    await p.screenshot({ path: path.join(dir, out), omitBackground: !bg }); await p.close(); }
  await b.close(); console.log('wrote PNGs'); })();
