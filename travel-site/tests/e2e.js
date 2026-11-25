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
  await p.click(chip('dest', o.dest ?? 'Rajasthan')); await p.fill('#from', 'Pune'); await p.fill('#when', '12-17 Dec'); await p.click(chip('travel', o.travel ?? 'train')); await p.click('#submit');
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
  assert((await p.locator('#road .snap').count()) >= 8, 'the reel has our trip photos and clips'); const nv = await p.locator('.snap video').count(); assert(nv >= 4);
  assert.equal(await p.locator('.snap video[poster]').count(), nv, 'every clip has a poster'); assert.equal(await p.locator('.snap video:not([aria-label])').count(), 0, 'every clip is described'); assert.equal(await p.locator('.snap img:not([alt]), .snap img[alt=""]').count(), 0, 'every reel photo has alt text');
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
  assert(await p.locator('#d-dw[open]').count(), 'slide-over opens'); assert.equal(await p.textContent('#dw-pay'), 'Continue to secure checkout'); assert((await p.textContent('#d-dw')).includes('exact amount is shown on the secure payment page'), 'drawer says where the amount is shown'); assert(!/₹/.test(await p.textContent('#d-dw')), 'no price in the drawer');
  assert.equal(await p.locator('#dw-inc li').count(), 5); await p.waitForSelector('#dw-prev img'); assert((await p.textContent('#dw-prev')).includes('real plan'), 'Rajasthan shows a blurred page from the real plan');
  assert(!(await p.textContent('#dw-inc')).match(/fuel|toll|maps/i), 'only real contents are listed');
  await p.click('#dw-pay'); assert((await p.textContent('#dw-status')).includes('name'));
  await p.fill('#dw-name', 'Asha'); await p.fill('#dw-phone', '98765 43210'); await p.check('#dw-consent');
  await p.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' }));
  const [pop] = await Promise.all([p.waitForEvent('popup'), p.click('#dw-pay')]); assert(decodeURIComponent(pop.url()).includes('the Rajasthan blueprint.'), 'offline: WhatsApp order opens'); await pop.close();
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
  await p.fill('#from', 'Pune'); await p.fill('#when', 'Dec'); await p.press('#when', 'Enter');   // mode of travel still missing
  assert((await p.textContent('.err[data-for=travel]')).length > 0 && (await p.textContent('#step-label')).startsWith('Step 1'), 'travel mode is required');
  await p.click(chip('travel', 'flight')); await p.press('#when', 'Enter');   // Enter advances
  assert.equal(await p.textContent('#step-label'), 'Step 2 of 3 · Who\'s going'); assert.equal(await p.locator('#back').isVisible(), true);
  await p.click('#submit'); assert((await p.textContent('.err[data-for=group]')).length > 0);   // group/budget required
  await p.click('#back'); assert.equal(await p.inputValue('#from'), 'Pune', 'Back keeps answers');
  await p.click('#submit');
  // draft survives a reload (and never stores the phone)
  await p.click(chip('group', '3-6'));
  await p.evaluate(() => { form.elements.from.value = 'Mumbai'; form.dispatchEvent(new Event('input')); }); await p.reload(); await toPlanner(p);
  assert.equal(await val(p, 'dest'), 'Goa'); assert.equal(await val(p, 'travel'), 'flight'); assert.equal(await p.inputValue('#from'), 'Mumbai'); assert.equal(await val(p, 'group'), '3-6');
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
  assert.deepEqual(calls.find(c => c[1] === '/api/leads')[2], { name: 'Test User', phone: '919876543210', destination: 'Rajasthan', departure_city: 'Pune', travel_mode: 'train', travel_dates: '12-17 Dec', group_size: '7-12', service: 'custom', budget: '10-18', website: '' });
  await pg.click('#next button'); await pg.waitForSelector('#next a[href="https://signed.example/prev.pdf"]', { timeout: 5000 });
  assert.equal(await pg.locator('#next button:has-text("Share with your group")').count(), 1, 'preview screen offers sharing');
  await pg.click('#next button:has-text("Unlock")'); await pg.waitForTimeout(300);
  assert.deepEqual(calls.find(c => c[1] === '/api/create-payment-link')[2], { lead_id: '11111111-2222-3333-4444-555555555555', kind: 'custom_plan', blueprint_id: 'rajasthan' });
  console.log('funnel custom OK'); await pg.close();

  ({ pg, calls } = await apiPage(path => path === '/api/leads' ? [201, { lead_id: 'aaaaaaaa-0000-0000-0000-000000000000' }] : [200, { payment_url: 'https://rzp.io/i/bp' }]));
  await pg.goto(PAGE); await toPlanner(pg); await fill(pg, { svc: 'blueprint', dest: 'Kerala' }); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
  await pg.click('#next button:has-text("blueprint")'); await pg.waitForTimeout(300);
  assert.deepEqual(calls.find(c => c[1] === '/api/create-payment-link')[2], { lead_id: 'aaaaaaaa-0000-0000-0000-000000000000', kind: 'blueprint', blueprint_id: 'kerala' });
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
    assert.equal(await mp.textContent('#mbar-plan'), 'Plan My Trip'); await mp.evaluate(() => window.scrollTo(0, 0)); await mp.click('.chip[data-dest=Goa]'); await mp.waitForTimeout(200);
    const t = await mp.textContent('#mbar-plan'); assert.equal(t, 'Resume your plan →'); await mp.close();
    const dp = await b.newPage({ viewport: { width: 1280, height: 800 } }); await dp.goto(PAGE); await dp.evaluate(() => window.scrollTo(0, 300)); await dp.waitForTimeout(250);
    await dp.close(); }
  // hero: the value, the action and our own photos are all in the first screen; the hero is made of real photos, not a drawing
  for (const [w, h] of [[1280, 800], [390, 844], [768, 1024]]) { const pg = await b.newPage({ viewport: { width: w, height: h } }); await pg.goto(PAGE); await pg.waitForTimeout(700);
    const m = await pg.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(); const imgs = [...document.querySelectorAll('.hero-photos img')].filter(i => i.offsetParent);
      return { h1: r('.hero h1').bottom, cta: r('.hero .btn-primary').bottom, loaded: imgs.length > 0 && imgs.every(i => i.naturalWidth > 0), n: imgs.length, sw: document.documentElement.scrollWidth, svgScene: !!document.querySelector('.hero .scene') }; });
    assert(m.cta <= h, `hero CTA is below the first screen at ${w}x${h}: ${JSON.stringify(m)}`); assert(m.loaded && m.n >= 2, `hero photos must load: ${JSON.stringify(m)}`); assert(m.sw <= w, `hero overflows sideways at ${w}: ${m.sw}`); assert(!m.svgScene); await pg.close(); }
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
    await pg.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await pg.fill('#dw-name', 'Asha'); await pg.fill('#dw-phone', '9876543210'); await pg.check('#dw-consent'); await pg.click('#dw-pay'); await pg.waitForTimeout(400);
    assert.deepEqual(calls[0][1], { name: 'Asha', phone: '919876543210', destination: 'Kerala', service: 'blueprint', website: '' });
    assert.deepEqual(calls[1][1], { lead_id: 'cccccccc-0000-0000-0000-000000000000', kind: 'blueprint', blueprint_id: 'kerala' }); await pg.close(); }
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; }); await pg.route('http://api.test/**', r => r.fulfill({ status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' })); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await pg.fill('#dw-name', 'Asha'); await pg.fill('#dw-phone', '9876543210'); await pg.check('#dw-consent'); await pg.click('#dw-pay'); await pg.waitForTimeout(400);
    assert((await pg.getAttribute('#dw-status a', 'href')).startsWith('https://wa.me/'), 'checkout failure falls back to WhatsApp'); assert.equal(await pg.isDisabled('#dw-pay'), false); await pg.close(); }
  // ---- Cloudflare Turnstile: opt-in, one single-use token per attempt, never blocks the WhatsApp fallback ----
  { const mode = async (key, how, drive) => { const calls = []; const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); let scriptHits = 0;
      await pg.addInitScript(k => { window.SITE_CONFIG = { apiBase: 'http://api.test', turnstileSiteKey: k }; }, key);
      await pg.route('https://challenges.cloudflare.com/**', r => { scriptHits++; if (how === 'blocked') return r.abort();
        r.fulfill({ contentType: 'application/javascript', body: `window.__ts = { renders: 0, resets: 0, keys: [] }; window.turnstile = { render: (sel, o) => { const n = ++__ts.renders; __ts.keys.push(o.sitekey); if (${how === 'auto'}) setTimeout(() => o.callback('tok-' + n), 0); return 'w' + n; }, reset: () => { __ts.resets++; } };` }); });
      await pg.route('http://api.test/**', async r => { const u = new URL(r.request().url()); let body = null; try { body = r.request().postDataJSON(); } catch {} calls.push([u.pathname, body]);
        const ok = u.pathname === '/api/leads'; await r.fulfill({ status: ok ? 201 : 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(ok ? { lead_id: 'dddddddd-0000-0000-0000-000000000000' } : {}) }); });
      await pg.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' })); await pg.goto(PAGE); await drive(pg, calls); const hits = scriptHits; await pg.close(); return { calls, hits }; };
    const planner = async pg => { await fill(pg); await pg.waitForTimeout(150); await pg.click('#submit'); await pg.waitForTimeout(500); };
    const drawer = async pg => { await pg.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await pg.fill('#dw-name', 'Asha'); await pg.fill('#dw-phone', '9876543210'); await pg.check('#dw-consent'); await pg.waitForTimeout(150); await pg.click('#dw-pay'); await pg.waitForTimeout(500); };
    // no key: the script is never requested and no token is sent
    let r = await mode('', 'auto', planner); assert.equal(r.hits, 0, 'no Turnstile script without a site key'); assert.equal(r.calls[0][0], '/api/leads'); assert(!('turnstile_token' in r.calls[0][1]), 'no token field without a key');
    // key set: the widget loads and mounts, and its token goes with the lead
    r = await mode('0x4AAAA-testkey', 'auto', planner); assert.equal(r.hits, 1); assert.equal(r.calls[0][1].turnstile_token, 'tok-1', 'planner sends the Turnstile token');
    r = await mode('0x4AAAA-testkey', 'auto', drawer); assert.equal(r.calls[0][1].turnstile_token, 'tok-1', 'checkout drawer sends the Turnstile token'); assert.equal(r.calls[0][1].service, 'blueprint');
    // challenge not finished: nothing is sent, the visitor is told what to do, and nothing is lost
    r = await mode('0x4AAAA-testkey', 'hold', async pg => { await planner(pg); assert.equal(await pg.locator('.err[data-for=turnstile]').textContent(), 'Please complete the check above, then press the button again.'); });
    assert.equal(r.calls.length, 0, 'no lead is sent before the check passes');
    r = await mode('0x4AAAA-testkey', 'hold', async pg => { await drawer(pg); assert((await pg.textContent('#dw-status')).includes('complete the check')); assert.equal(await pg.isDisabled('#dw-pay'), false); });
    assert.equal(r.calls.length, 0);
    // Cloudflare unreachable: the form still works through the API refusing it and the WhatsApp fallback, never a dead end
    r = await mode('0x4AAAA-testkey', 'blocked', async pg => { await planner(pg); assert.equal(await pg.locator('.err[data-for=turnstile]').textContent(), ''); assert(await pg.locator('a[href^="https://wa.me/"]').count() > 0, 'WhatsApp fallback is shown'); });
    assert(!('turnstile_token' in r.calls[0][1]), 'no token when the script could not load');
    // a failed attempt resets the widget so the next try gets a fresh token
    { const calls = []; const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
      await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test', turnstileSiteKey: '0x4AAAA-testkey' }; });
      await pg.route('https://challenges.cloudflare.com/**', r => r.fulfill({ contentType: 'application/javascript', body: `window.__ts = { renders: 0, resets: 0 }; window.turnstile = { render: (s, o) => { const n = ++__ts.renders; setTimeout(() => o.callback('tok-' + n), 0); return 'w' + n; }, reset: () => { __ts.resets++; } };` }));
      await pg.route('http://api.test/**', async r => { calls.push(r.request().url()); await r.fulfill({ status: 403, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"detail":"Verification failed."}' }); });
      await pg.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' })); await pg.goto(PAGE); await planner(pg);
      assert((await pg.textContent('#planner')).includes("couldn't verify the form"), '403 shows the verification message'); assert.equal(await pg.evaluate(() => __ts.resets), 1, 'the single-use token is discarded after the attempt'); await pg.close(); } }
  // ---- trust & proof: real PDF pages, fit box, ground-tested notes, share, assurances ----
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.addInitScript(() => { window.__shared = null; navigator.share = async d => { window.__shared = d; }; }); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); await pg.evaluate(() => document.getElementById('peek').scrollIntoView()); await pg.waitForTimeout(900);
    assert.deepEqual(await pg.evaluate(() => [...document.querySelectorAll('#peek img')].map(i => i.naturalWidth > 0)), [true, true], 'real plan pages load');
    assert.equal(await pg.locator('.log').count(), 2);
    await pg.click('#peek .zoomable >> nth=1'); assert(await pg.locator('#d-zoom[open]').count()); assert((await pg.getAttribute('#zm-img', 'src')).endsWith('real-rajasthan-checklist.webp')); assert.equal(await pg.locator('#peek img[src*=kerala]').count(), 0, 'no screenshot that shows amounts'); await pg.keyboard.press('Escape');
    const html = await pg.content(); assert(!/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(html.replace(/91XXXXXXXXXX/g, '')), 'no phone numbers anywhere in the page');
    const fit = await pg.textContent('.fit'); assert(fit.includes('Is this right for you?') && fit.includes('we plan and you book') && fit.includes('we book it too'));
    assert.equal(await pg.locator('.intel').count(), 4); assert.equal(await pg.locator('.assure li:visible').count(), 3, 'refund line hidden unless configured');
    assert(!(await pg.textContent('#peek')).match(/split-expense|mechanic|hospital|offline/i), 'no invented features');
    await pg.evaluate(() => document.querySelector('[data-route=goa]').click()); await pg.click('#dr-share');
    const sh = await pg.evaluate(() => window.__shared); assert(sh.text.includes('*Goa trip from Pune*') && !/₹/.test(sh.text) && sh.text.includes('quoted around your budget') && sh.text.includes('#routes'), sh && sh.text); await pg.close(); }
  { const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); await pg.context().route('https://wa.me/**', r => r.fulfill({ body: 'ok' })); await pg.goto(PAGE);
    await pg.evaluate(() => document.querySelector('[data-route=rajasthan]').click());
    const [pop] = await Promise.all([pg.waitForEvent('popup'), pg.click('#dr-share')]); const u = decodeURIComponent(pop.url());
    assert(u.startsWith('https://wa.me/?text=') && !/₹/.test(u) && u.includes('quoted around your budget') && u.includes('8–16 people'), u); await pop.close(); await pg.close(); }
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
    await pg.click(chip('dest', 'Goa')); await pg.fill('#from', 'Pune'); await pg.fill('#when', 'Dec'); await pg.click(chip('travel', 'train')); await pg.click('#submit');
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
    await p2.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await p2.fill('#dw-name', 'Asha'); await p2.fill('#dw-phone', '9876543210'); await p2.check('#dw-consent'); await p2.click('#dw-pay'); await p2.waitForTimeout(400);
    const dl = calls.find(c => c[0] === '/api/leads')[1]; assert.equal(dl.referrer, 'l.instagram.com', 'hostname only: no path, no token'); assert.equal('utm_source' in dl, false, 'untagged visit sends no campaign keys');
    await ctx.close(); await ctx2.close(); }
  // ---- WhatsApp-only mode still tells you where an enquiry came from (visible text, never hidden) ----
  { for (const [qs, want] of [['?utm_source=instagram&utm_medium=bio', 'Source: instagram'], ['', null]]) {
      const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); await pg.goto(PAGE + qs); await toPlanner(pg); await fill(pg); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
      const wa = decodeURIComponent(await pg.getAttribute('#c-wa', 'href')); if (want) assert(wa.includes(want), wa); else assert(!/Source:/.test(wa), 'no source line for direct visits'); await pg.close(); } }
  // ---- the site publishes no price anywhere: every plan is quoted around the customer's budget and requirements ----
  { const fs = require('fs'); const root = path.join(__dirname, '..'); const pages = ['index.html', '404.html', ...JSON.parse(fs.readFileSync(path.join(root, 'tools', 'routes.json'), 'utf8')).map(r => `${r.slug}/index.html`)];
    for (const f of pages) { const hits = fs.readFileSync(path.join(root, f), 'utf8').match(/₹\s?\d[\d,]*(?![\d,]*k)|\bRs\.?\s?\d|"price(?:Currency)?"\s*:|\bINR\b/g); assert(!hits, `${f} shows a price: ${hits}`); }
    assert(!fs.existsSync(path.join(root, 'fares.json')), 'the flight-fare data went with the prices');
    const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert(!/<h1[^>]*>[^<]*Pune|Pune &amp; PCMC|<title>[^<]*Pune|group trip planner in Pune/i.test(home) && /<h1[^>]*>[^<]*India/.test(home) && /solo travellers, couples, families/i.test(home), 'home page positioning is India-wide for every kind of traveller, not Pune-only or group-only');
    assert(!/former tour guide|run them end to end|we have run group trips|rough estimate|weekend batches|verified stays|started out as a|years running|holding the flag|vetted local|vetted north|verified local|most popular|15 hours|local coordinator|100% ground-tested|hidden agency markups|500\+|80K\+|trusted by|travellers planned for|signature routes, walked/i.test(home), 'no claim we cannot back up yet');
    assert.deepEqual([...home.matchAll(/class="linkbtn" data-bp="([\w-]+)"/g)].map(m => m[1]), ['rajasthan', 'kerala'], 'a blueprint is offered only where a real plan exists');
    assert.equal((home.match(/class="postmark"/g) || []).length, 2); assert.equal((home.match(/<b>Ground-tested<\/b>/g) || []).length, 2, 'only Rajasthan and Kerala are labelled ground-tested'); }
  // ---- legal pages: present, linked from every page, honest about what the code does ----
  { const fs = require('fs'); const root = path.join(__dirname, '..'); const legal = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'legal.json'), 'utf8')); const routes = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'routes.json'), 'utf8'));
    for (const L of legal) { assert(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes(`/${L.slug}/`), `${L.slug} in sitemap`); assert(fs.existsSync(path.join(root, L.slug, 'index.html')), L.slug); }
    for (const f of ['index.html', ...routes.map(r => `${r.slug}/index.html`), ...legal.map(l => `${l.slug}/index.html`)]) {
      const src = fs.readFileSync(path.join(root, f), 'utf8'); const pre = f === 'index.html' ? '' : '../';
      for (const L of legal) assert(src.includes(`href="${pre}${L.slug}/"`), `${f} links to ${L.slug}`); }
    const priv = fs.readFileSync(path.join(root, 'privacy', 'index.html'), 'utf8');
    for (const who of ['Supabase', 'Razorpay', 'Telegram', 'Google (Gemini)']) assert(priv.includes(who), `the privacy page names ${who}, which the code really sends data to`);
    assert(priv.includes('never your phone number or notes') && priv.includes('We do not send your name or phone number'), 'privacy promises that are enforced elsewhere');
    const terms = fs.readFileSync(path.join(root, 'terms', 'index.html'), 'utf8'); assert(terms.includes('24 hours') && terms.includes('50% advance') && terms.includes('IRCTC'), 'terms match what the site says'); }
  // ---- route landing pages: for EVERY route, facts match its knowledge base, nothing is broken, campaign + destination reach the planner ----
  for (const R of JSON.parse(require('fs').readFileSync(path.join(__dirname, '..', 'tools', 'routes.json'), 'utf8'))) {
    const fs = require('fs'); const root = path.join(__dirname, '..'); const types = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
    assert(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').includes(`/${R.slug}/`), `${R.slug} is in the sitemap`);
    assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes(`href="${R.slug}/"`), `${R.slug} is linked from the home page`);
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage(); const bad = []; pg.on('pageerror', e => bad.push(e.message)); pg.on('console', m => m.type() === 'error' && bad.push(m.text()));
    await pg.route('http://site.test/**', r => { let f = path.join(root, decodeURIComponent(new URL(r.request().url()).pathname)); if (f.endsWith(path.sep)) f += 'index.html';
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: 'nf' });
      r.fulfill({ contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
    await pg.goto(`http://site.test/${R.slug}/?utm_source=ig&utm_campaign=raj`, { referer: 'https://l.instagram.com/x?t=1' });
    assert.equal(await pg.locator('h1').count(), 1, R.slug);
    const ld = await pg.$$eval('script[type="application/ld+json"]', n => n.map(x => JSON.parse(x.textContent)));
    assert.deepEqual(ld.map(o => o['@type']), ['TouristTrip', 'FAQPage', 'BreadcrumbList']);
    assert.equal(await pg.locator('details').count(), ld[1].mainEntity.length, 'FAQ markup matches the visible FAQ');
    assert.deepEqual(await pg.evaluate(() => [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src)), [], 'no broken images');
    const kb = fs.readFileSync(path.join(root, '..', 'travel-backend', 'app', 'knowledge_base', R.kb), 'utf8'); const txt = await pg.innerText('main');
    for (const n of new Set(txt.match(/\b\d{5}\b/g) || [])) assert(kb.includes(n), `${R.slug}: ${n} is not in the verified knowledge base`);
    assert(!/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(txt), 'no phone-like numbers on a public page');
    { const whole = await pg.content(); assert(!/₹|\bRs\.?\s?\d|"price(?:Currency)?"\s*:/.test(whole), `${R.slug} publishes no price, so no price may appear anywhere on it (text or structured data)`); }
    // every rupee amount in the day plan and the tables must be one the knowledge base states
    const money = await pg.evaluate(() => [...document.querySelectorAll('.day, .tbl')].map(e => e.innerText).join('\n')); const kbN = kb.replace(/,/g, '');
    for (const m of new Set([...money.matchAll(/₹\s?(\d[\d,]*)/g)].map(x => x[1].replace(/,/g, '')))) assert(new RegExp(`(?<![\\d,])${m}(?!\\d)`).test(kbN), `${R.slug}: ₹${m} is not in the knowledge base`);
    assert.deepEqual(bad, [], 'no console or page errors');
    await pg.click('.cta-row a.btn-primary >> nth=0'); await pg.waitForURL(new RegExp(`/\\?trip=${R.key}`));
    assert(await pg.isChecked(`input[name=dest][value="${R.name}"]`), 'destination preselected in the planner');
    const attr = await pg.evaluate(() => JSON.parse(sessionStorage.getItem('attr'))); assert.equal(attr.utm_source, 'ig'); assert.equal(attr.utm_campaign, 'raj'); assert.equal(attr.referrer, 'l.instagram.com');
    await pg.goto('http://site.test/?trip=__proto__'); await pg.goto('http://site.test/?trip=nope'); assert.equal(await pg.isChecked(`input[name=dest][value="${R.name}"]`), false, 'unknown ?trip= is ignored'); assert.deepEqual(bad, []);
    await ctx.close(); }
  // ---- brief: mode of travel is required; optional answers reach the API; skipping them sends nothing extra ----
  { const html = require('fs').readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'); const calls = [];
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const pg = await ctx.newPage();
    await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test' }; });
    await pg.route('http://site.test/**', r => r.fulfill({ contentType: 'text/html', body: html }));
    await pg.route('http://api.test/**', async r => { let body = null; try { body = r.request().postDataJSON(); } catch {} calls.push([new URL(r.request().url()).pathname, body]);
      await r.fulfill({ status: 201, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ lead_id: 'cccccccc-0000-0000-0000-000000000000', payment_url: 'https://rzp.io/i/z' }) }); });
    await pg.route('https://rzp.io/**', r => r.abort());
    await pg.goto('http://site.test/'); await toPlanner(pg);
    await pg.click(chip('dest', 'Goa')); await pg.fill('#from', 'Pune'); await pg.fill('#when', 'Dec'); await pg.click(chip('triplen', '4-5')); await pg.click('#submit');
    assert((await pg.textContent('.err[data-for=travel]')).length > 0, 'travel mode required'); assert((await pg.textContent('#step-label')).startsWith('Step 1'));
    await pg.click(chip('travel', 'road')); await pg.click('#submit');
    assert.equal(await pg.evaluate(() => document.querySelector('.tailor').open), false, 'optional block starts collapsed');
    await pg.click(chip('group', '7-12')); await pg.click(chip('budget', '10-18'));
    await pg.click('.tailor summary'); await pg.click(chip('gtype', 'friends')); await pg.click(chip('stay', 'comfort')); await pg.click(chip('interest', 'food')); await pg.click(chip('interest', 'adventure'));
    await pg.fill('#notes', '  Two seniors,\n vegetarian <b>x</b> '); await pg.click('#submit');
    await pg.fill('#name', 'Asha'); await pg.fill('#phone', '9876543210'); await pg.check('#consent'); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
    const lead = calls.find(c => c[0] === '/api/leads')[1];
    assert.equal(lead.travel_mode, 'road'); assert.equal(lead.trip_length, '4-5'); assert.equal(lead.group_type, 'friends'); assert.equal(lead.stay_pref, 'comfort');
    assert.deepEqual(lead.interests, ['adventure', 'food']);   // on-screen order, not click order
    assert.equal(lead.notes, 'Two seniors, vegetarian <b>x</b>');
    const sum = await pg.textContent('#c-list'); assert(sum.includes('Road trip') && sum.includes('Adventure, Food') && sum.includes('Two seniors'));
    assert.equal(await pg.locator('#c-list b').count(), 0, 'notes rendered as text, not markup');
    const wa = decodeURIComponent(await pg.getAttribute('#c-wa', 'href')); assert(wa.includes('*Travel by:* Road trip') && wa.includes('*Interests:* Adventure, Food'));
    assert.equal(await pg.evaluate(() => sessionStorage.getItem('draft')), null, 'draft cleared after sending');
    // skip every optional answer: none of the optional keys are sent
    await pg.click('#c-edit'); calls.length = 0; await pg.evaluate(() => { form.reset(); sessionStorage.removeItem('draft'); document.querySelector('.tailor').open = false; gotoStep(1); });
    await pg.click(chip('dest', 'Goa')); await pg.fill('#from', 'Pune'); await pg.fill('#when', 'Dec'); await pg.click(chip('travel', 'flexible')); await pg.click('#submit');
    await pg.click(chip('group', '3-6')); await pg.click(chip('budget', '5-10')); await pg.click('#submit');
    await pg.fill('#name', 'Asha'); await pg.fill('#phone', '9876543210'); await pg.check('#consent'); await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])');
    const min = calls.find(c => c[0] === '/api/leads')[1]; assert.equal(min.travel_mode, 'flexible');
    for (const k of ['trip_length', 'group_type', 'stay_pref', 'interests', 'notes']) assert.equal(k in min, false, `${k} omitted when skipped`);
    await ctx.close(); }
  // ---- pre-launch review regressions: blank tag, honest blueprint pricing, https-only checkout, resilient polling, header fit ----
  { const fs = require('fs'); const root = path.join(__dirname, '..'); const types = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
    const open = async (handler, { w = 1280, url = '/' } = {}) => {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage(); const calls = []; let n = 0;
      await pg.addInitScript(() => { window.SITE_CONFIG = { apiBase: 'http://api.test', pollMs: 40, pollMax: 12 }; });
      await pg.route('http://site.test/**', r => { let f = path.join(root, decodeURIComponent(new URL(r.request().url()).pathname)); if (f.endsWith(path.sep)) f += 'index.html';
        if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: 'nf' }); r.fulfill({ contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
      await pg.route('http://api.test/**', async r => { let body = null; try { body = r.request().postDataJSON(); } catch {} const pth = new URL(r.request().url()).pathname; calls.push([pth, body]);
        const out = handler(pth, body, ++n); if (out === 'abort') return r.abort();
        await r.fulfill({ status: out[0], contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(out[1]) }); });
      await pg.route('https://rzp.io/**', r => r.abort()); await pg.goto('http://site.test' + url); return { pg, ctx, calls }; };
    const ok = (extra = {}) => (p, body) => p === '/api/leads' ? [201, { lead_id: 'cccccccc-0000-0000-0000-000000000001' }] : p === '/api/create-payment-link' ? [201, { payment_url: extra.pay ?? 'https://rzp.io/i/ok' }] : [200, {}];
    const toConfirm = async pg => { await pg.click('#submit'); await pg.waitForSelector('#confirm:not([hidden])'); };

    // 1. a campaign tag that is only spaces must not reach the API (it used to be a 422 that lost the lead); a padded one is trimmed
    let { pg, ctx, calls } = await open(ok(), { url: '/?utm_source=%20&utm_medium=+&utm_campaign=%20x%20' });
    await toPlanner(pg); await fill(pg); await toConfirm(pg);
    const l1 = calls.find(c => c[0] === '/api/leads')[1]; assert.equal('utm_source' in l1, false); assert.equal('utm_medium' in l1, false); assert.equal(l1.utm_campaign, 'x'); await ctx.close();

    // 2. the blueprint price shown is the price charged, and a destination without one is blocked
    ({ pg, ctx } = await open(ok())); await toPlanner(pg);
    await pg.click(chip('dest', 'Rajasthan')); await pg.fill('#from', 'Pune'); await pg.fill('#when', 'Dec'); await pg.click(chip('travel', 'train')); await pg.click('#submit');
    await pg.click('label.radio:has(input[value=blueprint])'); await pg.click(chip('group', '3-6')); await pg.click(chip('budget', '5-10'));
    assert.equal(await pg.textContent('#est-main'), 'Ready-made PDF'); assert.equal(await pg.textContent('#bp-lbl'), '');
    await pg.click('#back'); await pg.click(chip('dest', 'Kerala')); await pg.click('#submit'); assert.equal(await pg.textContent('#est-main'), 'Ready-made PDF');
    await pg.click('#back'); await pg.click(chip('dest', 'Goa')); assert.equal(await pg.textContent('#est-main'), 'Not available', 'no blueprint is sold for a route without a finished plan');
    await pg.click(chip('dest', 'Konkan')); assert.equal(await pg.textContent('#est-main'), 'Not available'); assert.equal(await pg.textContent('#bp-lbl'), '(not available for this destination)');
    await pg.click('#submit'); await pg.click('#submit');
    assert((await pg.textContent('.err[data-for=service]')).includes('No ready blueprint') && (await pg.textContent('#step-label')).startsWith('Step 2'), 'blocked on step 2');
    for (const sv of ['blueprint', 'custom', 'complete']) { await pg.click(`label.radio:has(input[value=${sv}])`); const aside = await pg.textContent('.bp'); assert(!/₹|Rs\.?\s?\d/.test(aside), `no price in the boarding pass (${sv}): ${aside}`); }
    await ctx.close();

    // 3. the page says what really happens after payment, shows the price on the button, and only ever navigates to https
    let pay = 'javascript:window.__x=1';
    ({ pg, ctx, calls } = await open((p, body, n) => ok({ pay })(p, body))); await toPlanner(pg); await fill(pg, { svc: 'blueprint', dest: 'Kerala' }); await toConfirm(pg);
    const nxt = await pg.textContent('#next'); assert(nxt.includes('We send the PDF to your WhatsApp after payment.') && nxt.includes('exact amount on the secure payment page') && !/instant|₹/i.test(nxt), nxt);
    await pg.click('#next button:has-text("Buy Kerala blueprint")'); await pg.waitForFunction(() => document.querySelector('#next').textContent.includes("Couldn't open checkout"));
    assert.equal(await pg.evaluate(() => window.__x), undefined, 'javascript: URL never ran'); assert(pg.url().startsWith('http://site.test'), 'did not navigate');
    pay = 'http://evil.test/pay'; await pg.click('#next button:has-text("Buy Kerala blueprint")'); await pg.waitForTimeout(300); assert(pg.url().startsWith('http://site.test'), 'plain http is refused too'); await ctx.close();

    // 4. one aborted status request while polling must not hide a finished preview
    let st = 0;
    ({ pg, ctx } = await open((p, body, n) => p === '/api/leads' ? [201, { lead_id: 'cccccccc-0000-0000-0000-000000000004' }] : p === '/api/generate-preview' ? [202, { status: 'generating' }]
      : p.endsWith('/status') ? (++st === 1 ? 'abort' : st === 2 ? [200, { status: 'generating' }] : [200, { status: 'preview_ready', preview_url: 'https://signed.test/x.pdf' }]) : [200, {}]));
    await toPlanner(pg); await fill(pg); await toConfirm(pg); await pg.click('#next button:has-text("Generate my free preview")');
    await pg.waitForFunction(() => document.querySelector('#next').textContent.includes('Your preview is ready'), null, { timeout: 8000 }); assert(st >= 3, 'kept polling through the blip'); await ctx.close();

    // 5. the header fits at 320 and 390px with a long real-world brand name, on the home page and a route page
    for (const w of [320, 390]) for (const u of ['/', '/rajasthan-trip-from-pune/', '/kerala-trip-from-pune/']) {
      ({ pg, ctx } = await open(ok(), { w, url: u }));
      await pg.evaluate(() => document.querySelectorAll('.hdr .logo').forEach(l => { l.lastChild.textContent = 'The Very Long Brand Name Travel Co.'; }));
      const m = await pg.evaluate(() => { const vis = [...document.querySelectorAll('.hdr a, .hdr button')].filter(e => e.offsetParent !== null);
        return { right: Math.max(...vis.map(e => e.getBoundingClientRect().right)), w: innerWidth, sw: document.documentElement.scrollWidth }; });
      assert(m.right <= m.w + 0.5 && m.sw <= m.w, `header overflows at ${w}px on ${u}: ${JSON.stringify(m)}`); await ctx.close(); } }
  console.log('fallbacks OK'); console.log('errors:', errs); await b.close(); console.log('ALL OK');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
