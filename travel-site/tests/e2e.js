// End-to-end tests for the marketing site. Run: npm install && npx playwright install chromium && npm test
// Covers: SEO structure, media, every CTA path, the 3-step planner, offline (WhatsApp-only) mode, the backend funnel
// against a mocked API (lead -> preview -> payment), failure fallbacks, reduced motion, phone vs desktop behaviour.
const { chromium } = require('playwright'); const assert = require('assert');
const { pathToFileURL } = require('url'); const path = require('path');
const PAGE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;   // runs from any checkout, locally or in CI
const chip = (n, v) => `label.pk:has(input[name=${n}][value="${v}"])`;
const val = (p, n) => p.evaluate(n => form.elements[n].value, n);
// fills all three steps and stops on step 3 with the final button ready
const fill = async (p, o = {}) => {
  await p.click(chip('dest', o.dest ?? 'Rajasthan')); await p.fill('#from', 'Pune'); await p.fill('#when', '12-17 Dec'); await p.click('#submit');
  await p.click(chip('group', '7-12')); await p.click(`label.radio:has(input[value=${o.svc ?? 'custom'}])`); await p.click(chip('budget', '10-18')); await p.click('#submit');
  await p.fill('#name', o.name ?? 'Test User'); await p.fill('#phone', '98765 43210'); await p.check('#consent');
};
const toPlanner = p => p.evaluate(() => document.querySelector('#planner').scrollIntoView());

(async () => {
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE);

  // ---- SEO / structure (unchanged guarantees) ----
  const seo = await p.evaluate(() => { const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent));
    return { h1: document.querySelectorAll('h1').length, title: document.title.length, desc: document.querySelector('meta[name=description]').content.length,
      faqLD: ld.find(x => x['@type'] === 'FAQPage').mainEntity.length, faqDOM: document.querySelectorAll('#faq details').length,
      dupIds: [...document.querySelectorAll('[id]')].map(e => e.id).filter((id, i, a) => a.indexOf(id) !== i) } });
  console.log('SEO', JSON.stringify(seo));
  assert.equal(seo.h1, 1); assert.equal(seo.faqLD, seo.faqDOM); assert(seo.title <= 65 && seo.desc <= 160); assert.deepEqual(seo.dupIds, []);

  // ---- real media: all images decode, clips play only when visible, reduced-motion gets controls ----
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'));
  await p.evaluate(() => document.getElementById('road').scrollIntoView()); await p.waitForTimeout(1800);
  assert.equal(await p.locator('#road .snap').count(), 8); assert.equal(await p.locator('.snap video').count(), 4);
  assert.equal(await p.locator('.snap video[poster]').count(), 4, 'every clip has a poster');
  assert((await p.evaluate(() => [...document.querySelectorAll('.snap video')].filter(v => !v.paused).length)) >= 1, 'in-view clip plays');
  await p.evaluate(() => document.getElementById('top').scrollIntoView()); await p.waitForTimeout(600);
  assert.equal(await p.evaluate(() => [...document.querySelectorAll('.snap video')].filter(v => !v.paused).length), 0, 'clips pause when off-screen');
  assert.deepEqual(await p.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(-30))), [], 'no broken images');
  assert.equal(await p.locator('img:not([alt])').count(), 0, 'every image has alt');
  // ---- new UX: announcement bar, phone hidden until real number, proof row ----
  assert(await p.locator('.ann').isVisible()); assert.equal(await p.locator('#tel').isHidden(), true);
  assert(await p.locator('.proof').isVisible());
  await p.evaluate(() => window.scrollTo(0, 600)); await p.waitForTimeout(200); assert.equal(await p.locator('.ann').isHidden(), true, 'ann collapses on scroll');

  // ---- browsing ----
  for (const [f, n] of [['weekend', 2], ['multi', 3], ['north', 1], ['all', 4]]) { await p.click(`.tab[data-f=${f}]`); assert.equal(await p.locator('#trips .card:not([hidden])').count(), n, f); }
  await p.locator('[data-route=kerala]').click(); assert.equal(await p.locator('#dr-days li').count(), 3); await p.click('#dr-cta');
  assert.equal(await val(p, 'dest'), 'Kerala'); assert.equal(await val(p, 'service'), 'custom');
  // card shortcuts: "Plan this trip" and "Just want the PDF"
  await p.evaluate(() => document.querySelector('[data-trip=goa]').click()); assert.equal(await val(p, 'dest'), 'Goa'); assert.equal(await val(p, 'service'), 'custom');
  await p.evaluate(() => document.querySelector('[data-bp=rajasthan]').click());
  assert(await p.locator('#d-dw[open]').count(), 'slide-over opens'); assert.equal(await p.textContent('#dw-price'), '₹799');
  assert.equal(await p.locator('#dw-inc li').count(), 5); await p.waitForSelector('#dw-prev img'); assert((await p.textContent('#dw-prev')).includes('real plan'), 'Rajasthan shows a blurred page from the real plan');
  assert(!(await p.textContent('#dw-inc')).match(/fuel|toll|maps/i), 'only real contents are listed');
  await p.click('#dw-pay'); assert((await p.textContent('#dw-status')).includes('name'));
  await p.fill('#dw-name', 'Asha'); await p.fill('#dw-phone', '98765 43210'); await p.check('#dw-consent');
  await p.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' }));
  const [pop] = await Promise.all([p.waitForEvent('popup'), p.click('#dw-pay')]); assert(decodeURIComponent(pop.url()).includes('Rajasthan blueprint (₹799)'), 'offline: WhatsApp order opens'); await pop.close();
  await p.keyboard.press('Escape'); assert.equal(await p.locator('#d-dw[open]').count(), 0);
  // sample day: three trip styles, one late-toggle
  await p.evaluate(() => document.querySelector('#sample').scrollIntoView());
  assert((await p.textContent('#t-title')).includes('Desert highway')); assert.equal(await p.locator('#t-sched .tag.stop').count(), 2);
  await p.click('.daytab[data-day="1"]'); assert((await p.textContent('#t-title')).includes('Pink City')); assert.equal(await p.locator('#t-sched li[data-cut]').count(), 1);
  await p.click('#late'); assert.equal(await p.locator('#ticket.is-late').count(), 1); assert((await p.textContent('#late-note')).includes('Nahargarh'));
  await p.click('.daytab[data-day="2"]'); assert((await p.textContent('#t-title')).includes('Backwaters')); assert.equal(await p.locator('#t-sched li[data-cut]').count(), 2); assert.equal(await p.locator('#ticket.is-late').count(), 1, 'toggle state survives switching');
  assert((await p.textContent('#t-sched')).includes('16:30')); assert.equal(await p.locator('#t-sched .tag.stop').count(), 1);
  await p.click('.daytab[data-day="0"]'); assert((await p.textContent('#t-title')).includes('Desert highway')); await p.click('#late'); assert.equal(await p.locator('#ticket.is-late').count(), 0);
  assert.equal(await p.locator('#proof').isHidden(), true, 'no reviews section until real reviews exist'); assert((await p.getAttribute('#ig', 'href')).includes('instagram.com'));
  await p.click('.chip[data-dest=Kerala]'); assert.equal(await val(p, 'dest'), 'Kerala');
  await p.evaluate(() => document.querySelector('#late').scrollIntoView()); await p.click('#late'); assert.equal(await p.locator('#ticket.is-late').count(), 1);

  // ---- stepper: per-step validation, progress, back, draft ----
  await p.evaluate(() => form.reset()); await p.evaluate(() => { gotoStep(1); sessionStorage.clear(); });
  await toPlanner(p);
  await p.click('#submit');                                              // nothing chosen on step 1
  assert((await p.textContent('.err[data-for=dest]')).length > 0); assert.equal(await p.textContent('#step-label'), 'Step 1 of 3 · Where & when');
  await p.click(chip('dest', 'Goa')); await p.click('#submit');          // from/when still empty
  assert((await p.textContent('.err[data-for=from]')).length > 0 && (await p.textContent('.err[data-for=when]')).length > 0);
  await p.fill('#from', 'Pune'); await p.fill('#when', 'Dec'); await p.press('#when', 'Enter');   // Enter advances
  assert.equal(await p.textContent('#step-label'), 'Step 2 of 3 · Who\'s going'); assert.equal(await p.locator('#back').isVisible(), true);
  await p.click('#submit'); assert((await p.textContent('.err[data-for=group]')).length > 0);   // group/budget required
  await p.click('#back'); assert.equal(await p.inputValue('#from'), 'Pune', 'Back keeps answers');
  await p.click('#submit');
  // draft survives a reload (and never stores the phone)
  await p.click(chip('group', '3-6'));
  await p.evaluate(() => { form.elements.from.value = 'Mumbai'; form.dispatchEvent(new Event('input')); }); await p.reload(); await toPlanner(p);
  assert.equal(await val(p, 'dest'), 'Goa'); assert.equal(await p.inputValue('#from'), 'Mumbai'); assert.equal(await val(p, 'group'), '3-6');
  assert.equal(await p.evaluate(() => sessionStorage.getItem('draft').includes('phone')), false);
  await p.evaluate(() => { form.reset(); sessionStorage.clear(); gotoStep(1); });

  // ---- offline (no backend): XSS-safe, WhatsApp-only ----
  await fill(p, { name: '<img src=x onerror=alert(1)>' });
  assert.equal(await p.textContent('#submit'), 'Get my quote');
  await p.click('#submit'); await p.waitForSelector('#confirm:not([hidden])');
  assert.equal(await p.locator('#c-list img').count(), 0, 'XSS');
  const wa = decodeURIComponent(await p.getAttribute('#c-wa', 'href')); assert(wa.includes('*Destination:* Rajasthan') && wa.includes('*WhatsApp:* 919876543210'));
  assert.equal(await p.locator('#confirm .nextsteps li').count(), 3, 'confirmation explains what happens next');
  assert.equal(await p.locator('#next').isHidden(), true);
  await p.click('#c-edit'); assert.equal(await p.textContent('#step-label'), 'Step 1 of 3 · Where & when');
  console.log('stepper + offline OK'); await p.close();

  // ---- backend mode ----
  async function apiPage(handler) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test', pollMs: 30, pollMax: 20 }; });
    const calls = []; await pg.route('http://api.test/**', async r => { const u = new URL(r.request().url()); let body = null; try { body = r.request().postDataJSON(); } catch {}
      calls.push([r.request().method(), u.pathname, body]); const res = handler(u.pathname, body);
      await r.fulfill({ status: res[0], contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(res[1]) }); });
    await pg.route('https://rzp.io/**', r => r.abort()); return { pg, calls };
  }
  let n = 0;
  let { pg, calls } = await apiPage(path => {
    if (path === '/api/leads') return [201, { lead_id: '11111111-2222-3333-4444-555555555555' }];
    if (path === '/api/generate-preview') return [202, { status: 'generating' }];
    if (path.endsWith('/status')) return [200, ++n < 3 ? { status: 'generating' } : { status: 'preview_ready', preview_url: 'https://signed.example/prev.pdf' }];
    if (path === '/api/create-payment-link') return [200, { payment_url: 'https://rzp.io/i/abc', amount_inr: 2499 }]; return [404, {}]; });
  await pg.goto(PAGE); await toPlanner(pg); await fill(pg); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
  assert.deepEqual(calls.find(c => c[1] === '/api/leads')[2], { name: 'Test User', phone: '919876543210', destination: 'Rajasthan', departure_city: 'Pune', travel_dates: '12-17 Dec', group_size: '7-12', service: 'custom', budget: '10-18', website: '' });
  await pg.click('#next button'); await pg.waitForSelector('#next a[href="https://signed.example/prev.pdf"]', { timeout: 5000 });
  assert.equal(await pg.locator('#next button:has-text("Share with your group")').count(), 1, 'preview screen offers sharing');
  await pg.click('#next button:has-text("Unlock")'); await pg.waitForTimeout(300);
  assert.deepEqual(calls.find(c => c[1] === '/api/create-payment-link')[2], { lead_id: '11111111-2222-3333-4444-555555555555', kind: 'custom_plan', blueprint_id: 'rajasthan' });
  console.log('funnel custom OK'); await pg.close();

  ({ pg, calls } = await apiPage(path => path === '/api/leads' ? [201, { lead_id: 'aaaaaaaa-0000-0000-0000-000000000000' }] : [200, { payment_url: 'https://rzp.io/i/bp' }]));
  await pg.goto(PAGE); await toPlanner(pg); await fill(pg, { svc: 'blueprint', dest: 'Goa' }); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
  await pg.click('#next button:has-text("blueprint")'); await pg.waitForTimeout(300);
  assert.deepEqual(calls.find(c => c[1] === '/api/create-payment-link')[2], { lead_id: 'aaaaaaaa-0000-0000-0000-000000000000', kind: 'blueprint', blueprint_id: 'goa' });
  console.log('funnel blueprint OK'); await pg.close();

  for (const [status, expect] of [[500, 'nothing is lost'], [429, 'few requests']]) {
    ({ pg } = await apiPage(() => [status, { detail: 'x' }])); await pg.goto(PAGE); await toPlanner(pg); await fill(pg); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
    assert((await pg.textContent('#next')).includes(expect), String(status)); assert((await pg.getAttribute('#c-wa', 'href')).startsWith('https://wa.me/')); await pg.close();
  }
  ({ pg } = await apiPage(() => [201, { lead_id: 'bbbbbbbb-0000-0000-0000-000000000000' }]));
  await pg.goto(PAGE); await toPlanner(pg); await fill(pg, { dest: 'Konkan' }); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
  assert.equal(await pg.locator('#next button').count(), 0); await pg.close();
  { const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } }); const rp = await ctx.newPage(); await rp.goto(PAGE);
    await rp.evaluate(() => document.getElementById('road').scrollIntoView()); await rp.waitForTimeout(1200);
    assert.equal(await rp.evaluate(() => [...document.querySelectorAll('.snap video')].every(v => v.controls && v.paused)), true, 'reduced motion: clips paused with controls'); await ctx.close(); }
  { const mp = await b.newPage({ viewport: { width: 390, height: 844 } }); await mp.goto(PAGE); await mp.evaluate(() => window.scrollTo(0, 300)); await mp.waitForTimeout(250);
    assert.equal(await mp.evaluate(() => document.querySelector('[data-p]').style.transform), '', 'no scroll parallax on phones');
    assert.equal(await mp.textContent('#mbar-plan'), 'Plan My Trip'); await mp.evaluate(() => window.scrollTo(0, 0)); await mp.click('.chip[data-dest=Goa]'); await mp.waitForTimeout(200);
    const t = await mp.textContent('#mbar-plan'); assert(/^Est\. ₹[\d,]+ · Resume →$/.test(t), t); await mp.close();
    const dp = await b.newPage({ viewport: { width: 1280, height: 800 } }); await dp.goto(PAGE); await dp.evaluate(() => window.scrollTo(0, 300)); await dp.waitForTimeout(250);
    assert((await dp.evaluate(() => document.querySelector('[data-p]').style.transform)).includes('translateY'), 'parallax on desktop'); await dp.close(); }
  // real reviews appear only when supplied
  { const rp = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await rp.addInitScript(() => { window.SITE_CONFIG = { reviews: [{ quote: '<b>Great</b> trip', name: 'Rohan K.', meta: 'Pune' }] }; }); await rp.goto(PAGE);
    assert.equal(await rp.locator('#proof').isVisible(), true); assert.equal(await rp.locator('#quotes .quote').count(), 1); assert.equal(await rp.locator('#quotes b').count(), 0, 'review text is not HTML'); await rp.close(); }
  // quick blueprint checkout against the API
  { const calls = []; const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; });
    await pg.route('http://api.test/**', async r => { const u = new URL(r.request().url()); let body = null; try { body = r.request().postDataJSON(); } catch {} calls.push([u.pathname, body]);
      const out = u.pathname === '/api/leads' ? [201, { lead_id: 'cccccccc-0000-0000-0000-000000000000' }] : [200, { payment_url: 'https://rzp.io/i/q' }];
      await r.fulfill({ status: out[0], contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(out[1]) }); });
    await pg.route('https://rzp.io/**', r => r.abort()); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelector('[data-bp=goa]').click()); await pg.fill('#dw-name', 'Asha'); await pg.fill('#dw-phone', '9876543210'); await pg.check('#dw-consent'); await pg.click('#dw-pay'); await pg.waitForTimeout(400);
    assert.deepEqual(calls[0][1], { name: 'Asha', phone: '919876543210', destination: 'Goa', service: 'blueprint', website: '' });
    assert.deepEqual(calls[1][1], { lead_id: 'cccccccc-0000-0000-0000-000000000000', kind: 'blueprint', blueprint_id: 'goa' }); await pg.close(); }
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; }); await pg.route('http://api.test/**', r => r.fulfill({ status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' })); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await pg.fill('#dw-name', 'Asha'); await pg.fill('#dw-phone', '9876543210'); await pg.check('#dw-consent'); await pg.click('#dw-pay'); await pg.waitForTimeout(400);
    assert((await pg.getAttribute('#dw-status a', 'href')).startsWith('https://wa.me/'), 'checkout failure falls back to WhatsApp'); assert.equal(await pg.isDisabled('#dw-pay'), false); await pg.close(); }
  // ---- trust & proof: real PDF pages, fit box, ground-tested notes, share, assurances ----
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.__shared = null; navigator.share = async d => { window.__shared = d; }; }); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await pg.evaluate(() => document.getElementById('peek').scrollIntoView()); await pg.waitForTimeout(900);
    assert.deepEqual(await pg.evaluate(() => [...document.querySelectorAll('#peek img')].map(i => i.naturalWidth > 0)), [true, true, true, true], 'real plan pages load');
    assert.equal(await pg.locator('.log').count(), 2);
    await pg.click('#peek .zoomable >> nth=1'); assert(await pg.locator('#d-zoom[open]').count()); assert((await pg.getAttribute('#zm-img', 'src')).endsWith('real-kerala-day.webp')); await pg.keyboard.press('Escape');
    const html = await pg.content(); assert(!/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(html.replace(/91XXXXXXXXXX/g, '')), 'no phone numbers anywhere in the page');
    const fit = await pg.textContent('.fit'); assert(fit.includes('Is this right for you?') && fit.includes('we plan and you book') && fit.includes('we book it too'));
    assert.equal(await pg.locator('.intel').count(), 4); assert.equal(await pg.locator('.assure li:visible').count(), 3, 'refund line hidden unless configured');
    assert(!(await pg.textContent('#peek')).match(/split-expense|mechanic|hospital|offline/i), 'no invented features');
    await pg.evaluate(() => document.querySelector('[data-route=goa]').click()); await pg.click('#dr-share');
    const sh = await pg.evaluate(() => window.__shared); assert(sh.text.includes('*Goa trip from Pune*') && sh.text.includes('₹8,499') && sh.text.includes('#routes'), sh && sh.text); await pg.close(); }
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); await pg.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' })); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelector('[data-route=rajasthan]').click());
    const [pop] = await Promise.all([pg.waitForEvent('popup'), pg.click('#dr-share')]); const u = decodeURIComponent(pop.url());
    assert(u.startsWith('https://wa.me/?text=') && u.includes('₹11,499') && u.includes('8–16 people'), u); await pop.close(); await pg.close(); }
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); await pg.addInitScript(() => { window.SITE_CONFIG = { refundPolicy: '<b>x</b> Refunded if late.' }; }); await pg.goto(PAGE);
    assert.equal(await pg.locator('#refund').isVisible(), true); assert.equal(await pg.locator('#refund b').count(), 0, 'policy text is not HTML'); await pg.close(); }
  // ---- lead source: campaign tags + referrer HOSTNAME, sanitised, first-touch, both lead forms ----
  { const html = require('fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'); const calls = [];
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage();
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; });
    await pg.route('http://site.test/**', r => r.fulfill({ contentType: 'text/html', body: html }));
    await pg.route('http://api.test/**', async r => { let body = null; try { body = r.request().postDataJSON(); } catch {} calls.push([new URL(r.request().url()).pathname, body]);
      await r.fulfill({ status: 201, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ lead_id: 'eeeeeeee-0000-0000-0000-000000000000', payment_url: 'https://rzp.io/i/x' }) }); });
    await pg.route('https://rzp.io/**', r => r.abort());
    await pg.goto('http://site.test/?utm_source=instagram&utm_medium=bio&utm_campaign=goa-dec%3Cscript%3Ealert(1)%3C%2Fscript%3E&fbclid=ignored', { referer: 'https://l.instagram.com/some/path?token=secret' });
    await pg.reload();                                     // reload drops the referrer but the visit's first touch must survive
    await pg.evaluate(() => document.querySelector('#planner').scrollIntoView());
    await pg.click(chip('dest', 'Goa')); await pg.fill('#from', 'Pune'); await pg.fill('#when', 'Dec'); await pg.click('#submit');
    await pg.click(chip('group', '3-6')); await pg.click(chip('budget', '5-10')); await pg.click('#submit');
    await pg.fill('#name', 'Asha'); await pg.fill('#phone', '9876543210'); await pg.check('#consent'); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
    const lead = calls.find(c => c[0] === '/api/leads')[1];
    assert.equal(lead.utm_source, 'instagram'); assert.equal(lead.utm_medium, 'bio'); assert.equal(lead.utm_campaign, 'goa-decscriptalert1script', 'hostile characters stripped');
    assert(!/[<>()/]/.test(lead.utm_campaign)); assert.equal('fbclid' in lead, false);
    assert.equal(lead.referrer, 'l.instagram.com', 'first touch survives reload; hostname only, no path or token');
    // fresh visit: referrer kept as hostname only, with no path or token
    const ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p2 = await ctx2.newPage(); calls.length = 0;
    await p2.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; });
    await p2.route('http://site.test/**', r => r.fulfill({ contentType: 'text/html', body: html })); await p2.route('http://api.test/**', async r => { let body = null; try { body = r.request().postDataJSON(); } catch {} calls.push([new URL(r.request().url()).pathname, body]);
      await r.fulfill({ status: 201, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ lead_id: 'ffffffff-0000-0000-0000-000000000000', payment_url: 'https://rzp.io/i/y' }) }); });
    await p2.route('https://rzp.io/**', r => r.abort());
    await p2.goto('http://site.test/', { referer: 'https://l.instagram.com/some/path?token=secret' });
    await p2.evaluate(() => document.querySelector('[data-bp=goa]').click()); await p2.fill('#dw-name', 'Asha'); await p2.fill('#dw-phone', '9876543210'); await p2.check('#dw-consent'); await p2.click('#dw-pay'); await p2.waitForTimeout(400);
    const dl = calls.find(c => c[0] === '/api/leads')[1]; assert.equal(dl.referrer, 'l.instagram.com', 'hostname only: no path, no token'); assert.equal('utm_source' in dl, false, 'untagged visit sends no campaign keys');
    await ctx.close(); await ctx2.close(); }
  // ---- route landing page: facts match the knowledge base, nothing broken, campaign + destination carry into the planner ----
  { const fs = require('fs'); const root = path.join(__dirname, '..'); const types = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
    assert(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes('/rajasthan-trip-from-pune/'), 'route page is in the sitemap');
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage(); const bad = []; pg.on('pageerror', e => bad.push(e.message)); pg.on('console', m => m.type() === 'error' && bad.push(m.text()));
    await pg.route('http://site.test/**', r => { let f = path.join(root, decodeURIComponent(new URL(r.request().url()).pathname)); if (f.endsWith(path.sep)) f += 'index.html';
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: 'nf' });
      r.fulfill({ contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
    await pg.goto('http://site.test/rajasthan-trip-from-pune/?utm_source=ig&utm_campaign=raj', { referer: 'https://l.instagram.com/x?t=1' });
    assert.equal(await pg.locator('h1').count(), 1);
    const ld = await pg.$$eval('script[type="application/ld+json"]', n => n.map(x => JSON.parse(x.textContent)));
    assert.deepEqual(ld.map(o => o['@type']), ['TouristTrip', 'FAQPage', 'BreadcrumbList']);
    assert.equal(await pg.locator('details').count(), ld[1].mainEntity.length, 'FAQ markup matches the visible FAQ');
    assert.deepEqual(await pg.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src)), [], 'no broken images');
    const kb = fs.readFileSync(path.join(root, '..', 'travel-backend', 'app', 'knowledge_base', 'rajasthan.md'), 'utf8'); const txt = await pg.innerText('main');
    for (const n of new Set(txt.match(/\b\d{5}\b/g) || [])) assert(kb.includes(n), `page mentions ${n}, which is not in the verified knowledge base`);
    assert(!/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(txt), 'no phone-like numbers on a public page');
    assert.deepEqual(bad, [], 'no console or page errors');
    await pg.click('.cta-row a.btn-primary >> nth=0'); await pg.waitForURL(/\/\?trip=rajasthan/);
    assert(await pg.isChecked('input[name=dest][value="Rajasthan"]'), 'destination preselected in the planner');
    const attr = await pg.evaluate(() => JSON.parse(sessionStorage.getItem('attr'))); assert.equal(attr.utm_source, 'ig'); assert.equal(attr.utm_campaign, 'raj'); assert.equal(attr.referrer, 'l.instagram.com');
    await pg.goto('http://site.test/?trip=__proto__'); await pg.goto('http://site.test/?trip=nope'); assert.equal(await pg.isChecked('input[name=dest][value="Rajasthan"]'), false, 'unknown ?trip= is ignored'); assert.deepEqual(bad, []);
    await ctx.close(); }
  console.log('fallbacks OK'); console.log('errors:', errs); await b.close(); console.log('ALL OK');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
