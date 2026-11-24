// Admin console: real HTML/JS/CSS from travel-backend/app/admin_ui against a mocked API that enforces the key header,
// under the exact CSP the backend serves. Run: npm run test:admin
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const UI = path.join(__dirname, '..', '..', 'travel-backend', 'app', 'admin_ui');
const CSP = fs.readFileSync(path.join(UI, '..', 'routers', 'console.py'), 'utf8').match(/^CSP = "(.*)"$/m)[1];
const types = { 'index.html': 'text/html', 'console.js': 'text/javascript', 'console.css': 'text/css' };
const OUT = { breakdown: { stays: 1000, transport: 2000 }, base_cost: 3000, buffer: 150, markup: 473, subtotal: 3623, gst: 181, total: 3804, per_person: 381, advance: 1902, margin_on_price_pct: 13.1, rooms: 4 };
const mk = (o) => ({ departure_city: 'Pune', travel_dates: 'Dec', group_size: '7-12', budget: '10-18', utm_source: null, utm_medium: null, utm_campaign: null, referrer: null, created_at: '2026-11-20T10:00:00Z', ...o });

(async () => {
  const b = await chromium.launch(); let axe; const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
  axe = async () => (await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()).violations.map(v => `${v.id}: ${v.nodes[0].target}`);
  const errs = [], calls = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => /content security policy|refused to/i.test(m.text()) && errs.push(m.text()));
  await p.addInitScript(() => addEventListener('securitypolicyviolation', e => (window.__csp = (window.__csp || []).concat(e.violatedDirective))));
  const leads = [
    mk({ id: '1', name: 'Asha <img src=x onerror="window.__x=1">', phone: '919876543210', destination: 'Goa', service: 'custom', utm_source: 'instagram', utm_medium: 'bio', utm_campaign: 'goa-dec', status: 'new', travel_mode: 'road', trip_length: '4-5', group_type: 'friends', stay_pref: 'comfort', interests: 'food, adventure', notes: 'Two seniors <i>please</i>' }),
    mk({ id: '2', name: 'Ravi', phone: '12345', destination: 'Rajasthan', service: 'blueprint', referrer: 'l.instagram.com', status: 'paid', group_size: null, budget: null }),
    mk({ id: '3', name: 'Meera', phone: '919812345678', destination: 'Kerala', service: 'custom', status: 'lost', group_size: '3-6' })];
  await p.route('http://admin.test/**', async r => {
    const u = new URL(r.request().url()), rq = r.request();
    if (u.pathname.startsWith('/api/admin')) {
      let body = null; try { body = rq.postDataJSON(); } catch {}
      if (rq.headers()['x-admin-key'] !== 'good-key') return r.fulfill({ status: 401, contentType: 'application/json', body: '{"detail":"Unauthorized"}' });
      const j = (s, o) => r.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(o) }); calls.push([rq.method(), u.pathname, body]);
      if (u.pathname === '/api/admin/leads') return j(200, leads);
      if (u.pathname === '/api/admin/leads/3/status') return j(500, { detail: 'db down' });
      if (/\/status$/.test(u.pathname)) return j(200, { status: body.status });
      if (u.pathname === '/api/admin/margin-calc') return j(200, OUT);
      if (/\/quote$/.test(u.pathname)) return j(200, OUT);
      if (/\/fulfill$/.test(u.pathname)) return j(202, { queued: 1 });
      return j(404, {});
    }
    const name = u.pathname.replace(/^\/admin\/?/, '') || 'index.html'; if (!types[name]) return r.fulfill({ status: 404, body: 'nf' });
    r.fulfill({ contentType: types[name], headers: { 'content-security-policy': CSP, 'cache-control': 'no-store' }, body: fs.readFileSync(path.join(UI, name)) });
  });
  await p.goto('http://admin.test/admin');
  assert(await p.isVisible('#login') && !(await p.isVisible('#app')), 'signed out by default');

  // wrong key: stays on the login form, key not kept
  await p.fill('#key', 'nope'); await p.click('#login-form button'); await p.waitForFunction(() => document.querySelector('#login-msg').textContent.length > 0);
  assert((await p.textContent('#login-msg')).includes('not accepted')); assert.equal(await p.evaluate(() => sessionStorage.getItem('adminKey')), null);

  // right key: rows, summary, sources, hostile name rendered as text
  await p.fill('#key', 'good-key'); await p.click('#login-form button'); await p.waitForSelector('#rows tr td b');
  assert.equal(await p.locator('#rows tr').count(), 3);
  assert((await p.textContent('#rows')).includes('<img src=x onerror='), 'hostile name shown as text');
  assert.equal(await p.locator('#rows img').count(), 0, 'no element created from a lead name'); assert.equal(await p.evaluate(() => window.__x), undefined);
  const txt = await p.textContent('#rows'); assert(txt.includes('instagram / bio / goa-dec')); assert(txt.includes('referral: l.instagram.com')); assert(txt.includes('direct'));
  assert((await p.textContent('#summary')).includes('3') && (await p.textContent('#summary')).includes('via instagram / bio / goa-dec'));
  assert.equal(await p.evaluate(() => sessionStorage.getItem('adminKey')), 'good-key', 'key kept for this tab');
  assert.equal(calls[0][1], '/api/admin/leads');

  { const row1 = await p.textContent('#rows tr:nth-child(1)'); assert(row1.includes('road trip · 4-5 days · friends · stay: comfort · likes food, adventure'), 'brief shown');
    assert(row1.includes('Note: Two seniors <i>please</i>') && (await p.locator('#rows i').count()) === 0, 'customer notes shown as text, never markup'); }
  // WhatsApp link only for a valid number, prefilled text, safe rel
  const wa = p.locator('#rows tr:nth-child(1) a'); const href = await wa.getAttribute('href'); assert(href.startsWith('https://wa.me/919876543210?text=')); assert.equal(await wa.getAttribute('rel'), 'noopener noreferrer');
  assert.equal(await p.locator('#rows tr:nth-child(2) a').count(), 0, 'no link for a malformed number');
  assert.equal(await p.locator('#rows tr:nth-child(2) button:has-text("Re-send")').count(), 1, 'paid lead can be re-sent'); assert.equal(await p.locator('#rows tr:nth-child(1) button:has-text("Re-send")').count(), 0);

  // search + status filter
  await p.fill('#q', 'meera'); assert.equal(await p.locator('#rows tr').count(), 1); await p.fill('#q', ''); await p.selectOption('#filter', 'paid'); assert.equal(await p.locator('#rows tr').count(), 1);
  // export = exactly what is shown: filter to "paid" and only the booked traveller is in the file
  assert.equal(await p.textContent('#export'), 'Export CSV (1)');
  { const [d] = await Promise.all([p.waitForEvent('download'), p.click('#export')]); const csv = fs.readFileSync(await d.path(), 'utf8'); const lines = csv.trim().split('\r\n');
    assert(/^leads-\d{4}-\d{2}-\d{2}\.csv$/.test(d.suggestedFilename())); assert(csv.startsWith('\uFEFF"When","Name","Phone"')); assert.equal(lines.length, 2, 'header plus the one paid lead'); assert(lines[1].includes('"Ravi"') && lines[1].includes('"direct"') === false && lines[1].includes('referral: l.instagram.com'));
    assert((await p.textContent('#msg')).includes('customers') && (await p.textContent('#msg')).includes('Exported 1 lead')); }
  await p.selectOption('#filter', ''); assert.equal(await p.textContent('#export'), 'Export CSV (3)');
  { const [d] = await Promise.all([p.waitForEvent('download'), p.click('#export')]); const csv = fs.readFileSync(await d.path(), 'utf8'); assert.equal(csv.trim().split('\r\n').length, 4); assert(csv.includes('"919876543210"') && csv.includes('""window.__x=1""'), 'quotes inside cells are doubled'); }
  const csvT = await p.evaluate(() => __console.toCsv([{ name: '=HYPERLINK("http://x","y")', phone: '919800000000', status: 'new', notes: 'a,b\nc', destination: '+1 call', service: '-2', departure_city: '@home', created_at: '2026-01-01T00:00:00Z' }]));
  assert(csvT.includes('"\'=HYPERLINK(""http://x"",""y"")"') && csvT.includes('"\'+1 call"') && csvT.includes('"\'-2"') && csvT.includes('"\'@home"') && csvT.includes('"a,b\nc"'), 'formula starters neutralised, commas and newlines kept inside quotes');

  // status change sends the key + body; a failed save reverts and says why
  await p.selectOption('#rows tr:nth-child(1) select', 'needs_manual'); await p.waitForFunction(() => document.querySelector('#msg').textContent.includes('updated'));
  const patch = calls.find(c => c[0] === 'PATCH'); assert.equal(patch[1], '/api/admin/leads/1/status'); assert.deepEqual(patch[2], { status: 'needs_manual' });
  await p.selectOption('#rows tr:nth-child(3) select', 'new'); await p.waitForFunction(() => document.querySelector('#msg').textContent.includes('db down'));
  assert.equal(await p.inputValue('#rows tr:nth-child(3) select'), 'lost', 'failed change reverted');

  // quote: save is locked until the exact numbers are previewed
  await p.click('#rows tr:nth-child(1) button:has-text("Quote")'); assert.equal(await p.inputValue('#q-group_size'), '10', 'group size guessed from "7-12"'); assert(await p.isDisabled('#quote-save'));
  await p.fill('#q-room_rate_per_night', '1500'); await p.fill('#q-per_person_extra', '400'); await p.click('#quote-preview'); await p.waitForSelector('#quote-out dl');
  const pv = calls.filter(c => c[1] === '/api/admin/margin-calc').pop()[2]; assert.equal(pv.room_rate_per_night, 1500); assert.deepEqual(pv.per_person_items, [{ name: 'Per-person extras', cost: 400 }]); assert.deepEqual(pv.flat_items, []);
  assert((await p.textContent('#quote-out')).includes('₹3,804') && (await p.textContent('#quote-out')).includes('₹381'));
  assert.equal(await p.isDisabled('#quote-save'), false, 'save unlocked after preview');
  assert.deepEqual(await axe(), []);
  await p.fill('#q-markup_pct', '25'); assert(await p.isDisabled('#quote-save'), 'editing a number re-locks save');
  await p.click('#quote-preview'); await p.waitForFunction(() => !document.querySelector('#quote-save').disabled); await p.click('#quote-save'); await p.waitForFunction(() => !document.querySelector('#quote').open);
  const q = calls.find(c => c[1] === '/api/admin/leads/1/quote'); assert.equal(q[2].markup_pct, 25, 'saved exactly what was previewed'); assert((await p.textContent('#msg')).includes('₹3,804'));
  assert.equal(await p.inputValue('#rows tr:nth-child(1) select'), 'quoted');
  assert.deepEqual(await axe(), []);

  // sign out wipes the key and the rows
  await p.click('#signout'); assert(await p.isVisible('#login')); assert.equal(await p.evaluate(() => sessionStorage.getItem('adminKey')), null); { const left = await p.textContent('#rows'); assert(!/Asha|Ravi|Meera|9198/.test(left), 'no lead data left in the page after sign-out'); }
  // a stale/expired stored key at startup falls back to the login form
  await p.evaluate(() => sessionStorage.setItem('adminKey', 'expired')); await p.reload(); await p.waitForFunction(() => document.querySelector('#login-msg').textContent.length > 0); assert(await p.isVisible('#login'));
  assert.deepEqual(await p.evaluate(() => window.__csp || []), [], 'no CSP violations'); assert.deepEqual(errs, []);
  // pure helpers
  assert.equal(await p.evaluate(() => __console.roundingOf({ total: 3806, subtotal: 3623, gst: 181 })), 2);
  const h = await p.evaluate(() => ({ s: __console.sourceOf({ referrer: 'x.com' }), w: __console.waLink({ phone: 'abc', name: 'A', destination: 'Goa' }), m: __console.matches({ name: 'Ann', phone: '1', destination: 'Goa' }, 'GOA') }));
  assert.deepEqual(h, { s: 'referral: x.com', w: null, m: true });
  console.log('ADMIN OK: auth, hostile input, sources, WhatsApp links, status, quote lock, a11y, CSP'); await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
