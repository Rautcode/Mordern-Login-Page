// Accessibility gate: axe-core (WCAG 2.0/2.1 A + AA + best practices) on the page and on every popup, desktop and phone.
// Fails (exit 1) on any violation. Run: npm run test:a11y
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const { pathToFileURL } = require('url'); const path = require('path');
const ARGS = process.argv.slice(2).length ? process.argv.slice(2) : ['index.html'];   // any number of pages, relative to travel-site/

(async () => {
  const b = await chromium.launch(); const failures = [];
  for (const arg of ARGS) for (const [label, vp] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();   // axe requires a context-created page
    await p.goto(pathToFileURL(path.join(__dirname, '..', arg)).href); await p.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important}' });
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await p.waitForTimeout(800);
    const open = sel => async () => { await p.keyboard.press('Escape'); await p.evaluate(s => document.querySelector(s)?.click(), sel); await p.waitForTimeout(400); };
    const planner = async () => { await p.keyboard.press('Escape'); await p.evaluate(() => document.querySelector('#planner').scrollIntoView());
      await p.click('label.pk:has(input[name=dest][value="Goa"])'); await p.fill('#from', 'Pune'); await p.fill('#when', 'Dec'); await p.click('label.pk:has(input[name=travel][value="road"])'); await p.waitForTimeout(350); };   // let the chip's 0.15s colour transition finish before measuring
    const stepTwo = async () => { await planner(); await p.click('#submit'); await p.click('.tailor summary'); await p.waitForTimeout(200); };
    const states = [['page', async () => {}], ...(arg !== 'index.html' ? [] : [['planner step 1', planner], ['planner step 2 with tailor block open', stepTwo]]), ['route popup', open('[data-route]')], ['blueprint drawer', open('[data-bp]')], ['enlarge page', open('.zoomable')], ['privacy popup', open('[data-open=privacy]')]];
    for (const [name, setup] of states) {
      await setup();
      const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      for (const v of r.violations) failures.push(`${arg} ${label} / ${name}: ${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`);
    }
    await ctx.close();
  }
  await b.close();
  if (failures.length) { console.error('A11Y FAIL\n' + failures.join('\n')); process.exit(1); }
  console.log('A11Y OK: no violations on the page or any popup, desktop and phone');
})();
