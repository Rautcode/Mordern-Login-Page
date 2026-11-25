// Launch-kit test: builds dist/ with tools/personalize.py, serves it WITH the generated headers, and proves:
//  - every placeholder is replaced, the CSP hashes match the real inline scripts
//  - the page works under the strict CSP (zero violations through real flows), and injected scripts are blocked
//  - the personaliser refuses incomplete or unsafe input
const { chromium } = require('playwright'); const assert = require('assert');
const { spawnSync } = require('child_process'); const http = require('http'); const fs = require('fs'); const os = require('os'); const path = require('path'); const crypto = require('crypto');
const ROOT = path.join(__dirname, '..'); const run = (...a) => spawnSync('python3', [path.join(ROOT, 'tools', 'personalize.py'), ...a], { encoding: 'utf8' });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-')); const out = path.join(tmp, 'dist');
const brand = { brand: 'Test & Co', domain: 'trips.example.org', whatsapp: '919876543210', instagram: 'test.handle', founder: 'Asha Rao', legal_name: 'Asha Rao', email: 'hello@trips.example.org', address: '12 Example Road, Pune, Maharashtra 411001', legal_reviewed: true, analytics_token: '0123456789abcdef0123456789abcdef', reviews: [{ quote: 'Everything was planned to the minute and we never waited.', name: 'Rohan K.', meta: 'Rajasthan trip, Pune', consent: true }], udyam: 'UDYAM-MH-12-3456789', api_base: 'https://api.example.org' };
const bf = path.join(tmp, 'brand.json'); fs.writeFileSync(bf, JSON.stringify(brand));

// 1. build
let r = run(bf, '--out', out); assert.equal(r.status, 0, r.stderr + r.stdout);
const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
assert(!/\[[A-Z][A-Z_]{3,}\]|YOUR-DOMAIN|91XXXXXXXXXX/.test(html), 'no placeholders left');
assert(html.includes('https://static.cloudflareinsights.com/beacon.min.js') && html.includes('0123456789abcdef0123456789abcdef') && html.includes('Everything was planned to the minute'), 'analytics beacon and the consented review are in the page');
assert(html.includes('Test &amp; Co') && html.includes('https://trips.example.org/') && html.includes('apiBase: "https://api.example.org"') && html.includes('UDYAM-MH-12-3456789'));
assert(!fs.readFileSync(path.join(out, '404.html'), 'utf8').includes('XXXX'), '404 filled in');
assert(fs.readFileSync(path.join(out, 'robots.txt'), 'utf8').includes('https://trips.example.org/sitemap.xml'));
assert(new RegExp(`<lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`).test(fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8')), 'sitemap dated today');
const headers = fs.readFileSync(path.join(out, '_headers'), 'utf8'); const csp = headers.match(/Content-Security-Policy: (.*)/)[1];
const inline = [...html.matchAll(/<script(?![^>]*(?:src=|json))[^>]*>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
assert(inline.length >= 2 && inline.every(h => csp.includes(h)), 'CSP lists the hash of every inline script'); assert(csp.includes('connect-src \'self\' https://api.example.org') && !/unsafe-inline[^;]*;[^]*script/.test(csp.split('style-src')[0]));
assert(csp.includes('script-src \'self\'') && csp.includes('https://static.cloudflareinsights.com') && csp.includes('https://cloudflareinsights.com'), 'the CSP allows exactly the analytics hosts');
assert(csp.includes("frame-ancestors 'none'") && /script-src 'self' 'sha256-/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp), 'script-src has no unsafe-inline');

// 1b. Vercel: the brand can come from the BRAND_JSON env var (brand.json is private and not in git), and the build writes the Build Output API
{ const vo = path.join(tmp, 'vercel-out'), vd = path.join(tmp, 'vercel-dist');
  const r2 = spawnSync('python3', [path.join(ROOT, 'tools', 'personalize.py'), path.join(tmp, 'no-such-brand.json'), '--out', vd, '--vercel', '--vercel-out', vo], { encoding: 'utf8', env: { ...process.env, BRAND_JSON: JSON.stringify(brand) } });
  assert.equal(r2.status, 0, r2.stderr + r2.stdout);
  assert.notEqual(spawnSync('python3', [path.join(ROOT, 'tools', 'personalize.py'), path.join(tmp, 'no-such-brand.json'), '--out', path.join(tmp, 'x')], { encoding: 'utf8', env: { ...process.env, BRAND_JSON: '' } }).status, 0, 'no brand file and no BRAND_JSON is an error');
  const cfg = JSON.parse(fs.readFileSync(path.join(vo, 'config.json'), 'utf8')); assert.equal(cfg.version, 3);
  const all = cfg.routes.find(r => r.src === '^/(.*)$'); assert(all && all.continue, 'security headers apply to every path');
  const vcsp = all.headers['Content-Security-Policy'], vhtml = fs.readFileSync(path.join(vo, 'static', 'index.html'), 'utf8');
  const vin = [...vhtml.matchAll(/<script(?![^>]*(?:src=|json))[^>]*>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
  assert(vin.length >= 2 && vin.every(h => vcsp.includes(h)), 'the Vercel CSP lists the hash of every inline script in the page it serves'); assert(vcsp.includes('connect-src \'self\' https://api.example.org') && /frame-ancestors 'none'/.test(vcsp));
  assert(all.headers['Strict-Transport-Security'] && all.headers['X-Content-Type-Options'] === 'nosniff');
  assert(cfg.routes.some(r => r.src === '^/fonts/(.*)$' && /immutable/.test(r.headers['Cache-Control'])), 'fonts are cached for a year');
  assert(cfg.routes.some(r => r.status === 308 && /terms/.test(r.src) && r.headers.Location === '/$1/'), '/terms redirects to /terms/');
  const fsIdx = cfg.routes.findIndex(r => r.handle === 'filesystem'); assert(fsIdx > 0 && cfg.routes[fsIdx + 1].status === 404 && cfg.routes[fsIdx + 1].dest === '/404.html', 'unknown paths get the 404 page');
  for (const f of ['index.html', '404.html', 'robots.txt', 'terms/index.html', 'img/hero-range.svg']) assert(fs.existsSync(path.join(vo, 'static', f)), f + ' is in the Vercel output');
  assert(!fs.existsSync(path.join(vo, 'static', '_headers')) && !fs.existsSync(path.join(vo, 'static', 'brand')) && !fs.existsSync(path.join(vo, 'static', 'tests')), 'no private or build files are published'); }
// 2. personaliser refuses bad input
const bad = (patch, why) => { const f = path.join(tmp, 'bad.json'); fs.writeFileSync(f, JSON.stringify({ ...brand, ...patch })); const x = run(f, '--out', path.join(tmp, 'bad-out')); assert.notEqual(x.status, 0, why); };
bad({ domain: 'https://x.com/' }, 'scheme in domain'); bad({ analytics_token: 'not a token!' }, 'bad analytics token'); bad({ reviews: [{ quote: 'Great trip indeed', name: 'Ann', consent: false }] }, 'no consent'); bad({ reviews: [{ quote: 'Great trip indeed', name: 'Ann' }] }, 'consent missing'); bad({ reviews: 'x' }, 'reviews must be a list'); bad({ reviews: [{ quote: 'ok', name: 'A', consent: true }] }, 'review too short'); bad({ legal_reviewed: false }, 'legal pages must be reviewed'); bad({ legal_reviewed: undefined }, 'review flag missing'); bad({ email: 'not-an-email' }, 'bad email'); bad({ address: '' }, 'missing address'); bad({ whatsapp: '+91 98765' }, 'bad whatsapp'); bad({ founder: '' }, 'missing founder'); bad({ api_base: 'http://insecure.example' }, 'http api'); bad({ udyam: 'nope' }, 'bad udyam');
assert.notEqual(run(path.join(ROOT, 'tools', 'brand.example.json'), '--out', path.join(tmp, 'ex')).status, 0, 'example values rejected');
fs.mkdirSync(path.join(tmp, 'precious')); fs.writeFileSync(path.join(tmp, 'precious', 'keep.txt'), 'x');
assert.notEqual(run(bf, '--out', path.join(tmp, 'precious')).status, 0, 'refuses to overwrite a folder it did not create'); assert(fs.existsSync(path.join(tmp, 'precious', 'keep.txt')));
const noUd = path.join(tmp, 'nu.json'); fs.writeFileSync(noUd, JSON.stringify({ ...brand, udyam: '' })); assert.equal(run(noUd, '--out', path.join(tmp, 'nu-out')).status, 0);
assert(!fs.readFileSync(path.join(tmp, 'nu-out', 'index.html'), 'utf8').includes('class="udyam"'), 'badge hidden when no Udyam number');
// analytics and reviews are strictly opt-in: a build without them carries no beacon, no CSP allowance, no privacy sentence and no placeholder
const plainF = path.join(tmp, 'plain.json'); fs.writeFileSync(plainF, JSON.stringify({ ...brand, analytics_token: '', reviews: [] })); assert.equal(run(plainF, '--out', path.join(tmp, 'plain-out')).status, 0);
{ const o = path.join(tmp, 'plain-out'); const idx = fs.readFileSync(path.join(o, 'index.html'), 'utf8'), pv = fs.readFileSync(path.join(o, 'privacy', 'index.html'), 'utf8');
  assert(!/cloudflareinsights/.test(idx + pv + fs.readFileSync(path.join(o, '_headers'), 'utf8')), 'no analytics anywhere when no token is set'); assert(!pv.includes('Cloudflare Web Analytics') && !pv.includes('ANALYTICS_NOTE'), 'no leftover analytics placeholder'); assert(idx.includes('reviews: []')); }
// Turnstile is opt-in too: key present -> widget config, CSP hosts and a privacy line; absent -> none of it
{ const o = path.join(tmp, 'ts-out'); const f = path.join(tmp, 'ts.json'); fs.writeFileSync(f, JSON.stringify({ ...brand, turnstile_site_key: '0x4AAAAAAAtestKey_1-x' })); assert.equal(run(f, '--out', o).status, 0);
  const idx = fs.readFileSync(path.join(o, 'index.html'), 'utf8'), pv = fs.readFileSync(path.join(o, 'privacy', 'index.html'), 'utf8'), c = fs.readFileSync(path.join(o, '_headers'), 'utf8').match(/Content-Security-Policy: (.*)/)[1];
  assert(idx.includes('turnstileSiteKey: "0x4AAAAAAAtestKey_1-x"'), 'site key is in the page'); assert(/script-src[^;]*https:\/\/challenges\.cloudflare\.com/.test(c) && /frame-src 'self' https:\/\/challenges\.cloudflare\.com/.test(c) && /connect-src[^;]*https:\/\/challenges\.cloudflare\.com/.test(c), 'CSP allows Cloudflare challenges only for script, frame and connect');
  assert(pv.includes('Cloudflare Turnstile: checks that a form is filled in by a person') && !pv.includes('TURNSTILE_NOTE'), 'privacy page discloses Turnstile');
  const noApi = path.join(tmp, 'ts-noapi.json'); fs.writeFileSync(noApi, JSON.stringify({ ...brand, api_base: '', turnstile_site_key: '0x4AAAAAAAtestKey_1-x' })); assert.notEqual(run(noApi, '--out', path.join(tmp, 'ts-noapi-out')).status, 0, 'a site key without an API is refused');
  bad({ turnstile_site_key: 'bad key!' }, 'malformed site key'); }
{ const o = path.join(tmp, 'plain-out'); const all = ['privacy/index.html', '_headers'].map(n => fs.readFileSync(path.join(o, n), 'utf8')).join('\n');
  assert(!/challenges\.cloudflare\.com|TURNSTILE_NOTE|Turnstile/.test(all), 'no Turnstile allowance or privacy line without a key (the page script only ever loads it when a key is set)'); assert(fs.readFileSync(path.join(o, 'index.html'), 'utf8').includes('turnstileSiteKey: ""')); }
assert(fs.readFileSync(path.join(out, 'privacy', 'index.html'), 'utf8').includes('Cloudflare Web Analytics, which counts page views and referring sites without cookies'), 'the privacy page discloses analytics when it is on');
// brand text is JSON-escaped inside structured data and HTML-escaped in the page, even with quotes, & and <
const odd = path.join(tmp, 'odd.json'); fs.writeFileSync(odd, JSON.stringify({ ...brand, brand: 'Acme & "Sons" <b>' })); assert.equal(run(odd, '--out', path.join(tmp, 'odd-out')).status, 0);
const oddHtml = fs.readFileSync(path.join(tmp, 'odd-out', 'index.html'), 'utf8');
assert.equal(JSON.parse(oddHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]).name, 'Acme & "Sons" <b>', 'structured data keeps the real brand name');
assert(oddHtml.includes('Acme &amp; &quot;Sons&quot; &lt;b&gt;') && !oddHtml.includes('<b>Acme'), 'page text is HTML-escaped');
// a missing or malformed brand file gives a clear message, not a Python traceback
fs.writeFileSync(path.join(tmp, 'mal.json'), '{not json');
for (const f of [path.join(tmp, 'nope.json'), path.join(tmp, 'mal.json')]) { const x = run(f, '--out', path.join(tmp, 'x-out')); assert.notEqual(x.status, 0); assert(/cannot read/.test(x.stderr) && !/Traceback/.test(x.stderr), x.stderr); }

// 3. serve dist WITH its headers and drive real flows
const hdr = {}; let cur = null; for (const line of headers.split('\n')) { if (/^\//.test(line)) cur = line.trim(); else if (/^\s+\S/.test(line) && cur === '/*') { const [k, ...v] = line.trim().split(': '); hdr[k] = v.join(': '); } }
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain', '.xml': 'application/xml' };
const srv = http.createServer((q, s) => { let f = path.join(out, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith(path.sep)) f += 'index.html';
  if (!f.startsWith(out) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404, { ...hdr, 'content-type': 'text/html' }); return s.end(fs.readFileSync(path.join(out, '404.html'))); }
  const st = fs.statSync(f), range = q.headers.range; const base = { ...hdr, 'content-type': types[path.extname(f)] || 'application/octet-stream', 'accept-ranges': 'bytes' };
  if (range) { const [a, b2] = range.replace('bytes=', '').split('-'); const start = +a, end = b2 ? +b2 : st.size - 1; s.writeHead(206, { ...base, 'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1 }); return fs.createReadStream(f, { start, end }).pipe(s); }
  s.writeHead(200, { ...base, 'content-length': st.size }); fs.createReadStream(f).pipe(s); });

(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const violations = [], errs = []; p.on('console', m => { if (/content security policy|refused to/i.test(m.text())) violations.push(m.text().slice(0, 140)); }); p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => addEventListener('securitypolicyviolation', e => (window.__csp = (window.__csp || []).concat(e.violatedDirective + ' ' + e.blockedURI))));
  await p.route('https://api.example.org/**', r => { const u = new URL(r.request().url()); r.fulfill({ status: u.pathname === '/api/leads' ? 201 : 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(u.pathname === '/api/leads' ? { lead_id: 'dddddddd-0000-0000-0000-000000000000' } : { status: 'generating' }) }); });
  await p.route('https://static.cloudflareinsights.com/**', r => r.fulfill({ contentType: 'text/javascript', body: '' })); await p.route('https://cloudflareinsights.com/**', r => r.fulfill({ status: 204, body: '' }));
  await p.goto(base + '/'); await p.waitForLoadState('networkidle'); assert.equal(await p.locator('#proof').isVisible(), true, 'the consented review shows'); assert((await p.textContent('#proof')).includes('Everything was planned to the minute'));
  const resp = await p.request.get(base + '/'); for (const k of ['content-security-policy', 'x-content-type-options', 'strict-transport-security', 'referrer-policy', 'permissions-policy']) assert(resp.headers()[k], k + ' header served');
  assert((await p.title()).includes('Test & Co'), 'brand in title'); assert.equal(await p.locator('#tel').isVisible(), true, 'real number shows the header phone link');
  assert((await p.getAttribute('#tel', 'href')) === 'tel:+919876543210');
  // real flows under the CSP: popup, drawer, planner -> backend funnel (fetch allowed to api_base only)
  await p.evaluate(() => document.querySelector('[data-route=goa]').click()); await p.keyboard.press('Escape');
  await p.evaluate(() => document.querySelector('[data-bp=kerala]').click()); await p.keyboard.press('Escape');
  await p.evaluate(() => document.querySelector('#planner').scrollIntoView());
  await p.click('label.pk:has(input[name=dest][value="Kerala"])'); await p.fill('#from', 'Pune'); await p.fill('#when', 'Dec'); await p.click('label.pk:has(input[name=travel][value="train"])'); await p.click('#submit');
  await p.click('label.pk:has(input[name=group][value="3-6"])'); await p.click('label.pk:has(input[name=budget][value="5-10"])'); await p.click('#submit');
  await p.fill('#name', 'Asha'); await p.fill('#phone', '9876543210'); await p.check('#consent'); await p.click('#submit'); await p.waitForSelector('#confirm:not([hidden])');
  assert(await p.locator('#next button').count() >= 1, 'funnel reached the API through the CSP'); await p.waitForTimeout(500);
  assert.deepEqual(violations, [], 'no CSP violations in console'); assert.deepEqual(await p.evaluate(() => window.__csp || []), [], 'no securitypolicyviolation events'); assert.deepEqual(errs, []);
  assert.equal(await p.evaluate(() => { const s = document.createElement('script'); s.textContent = 'window.__injected = 1'; document.head.append(s); return window.__injected; }), undefined, 'an injected inline script is blocked');
  assert((await p.evaluate(() => window.__csp || [])).some(v => v.startsWith('script-src')), 'and the browser reports it');
  const nf = await p.goto(base + '/does-not-exist'); assert.equal(nf.status(), 404); assert((await p.textContent('h1')).includes("isn't on the map")); assert((await p.getAttribute('a.b', 'href')).startsWith('https://wa.me/919876543210'));
  // route landing page: shipped, personalised, runs under the strict CSP, hands the destination + campaign to the planner
  for (const L of JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'legal.json'), 'utf8'))) { const pg = fs.readFileSync(path.join(out, L.slug, 'index.html'), 'utf8'); assert(!/\[[A-Z][A-Z_]{3,}\]|YOUR-DOMAIN|91XXXXXXXXXX/.test(pg), `${L.slug}: no placeholders left`); assert(pg.includes('hello@trips.example.org') && pg.includes('919876543210'), `${L.slug}: contact details filled in`); if (L.slug !== 'refunds') assert(pg.includes('Asha Rao') && pg.includes('12 Example Road, Pune'), `${L.slug}: the operator's legal name and address are filled in`); }
  for (const R of JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'routes.json'), 'utf8'))) { assert(fs.existsSync(path.join(out, R.slug, 'index.html')), `${R.slug} shipped in the build`); assert(fs.readFileSync(path.join(out, R.slug, 'index.html'), 'utf8').includes(`https://trips.example.org/${R.slug}/`), `${R.slug} canonical is personalised`); }
  { const v0 = violations.length; await p.goto(base + '/rajasthan-trip-from-pune/?utm_source=ig'); await p.waitForLoadState('networkidle');
    assert((await p.title()).includes('Test & Co')); assert.equal(await p.getAttribute('link[rel=canonical]', 'href'), 'https://trips.example.org/rajasthan-trip-from-pune/');
    assert((await p.getAttribute('.cta-row a.btn-wa', 'href')).startsWith('https://wa.me/919876543210'));
    await p.click('.cta-row a.btn-primary >> nth=0'); await p.waitForURL(/\?trip=rajasthan/); assert(await p.isChecked('input[name=dest][value="Rajasthan"]'));
    assert.equal(await p.evaluate(() => JSON.parse(sessionStorage.getItem('attr')).utm_source), 'ig');
    assert.equal(violations.length, v0, 'no CSP violations on the route page or the hop to the planner'); assert.deepEqual(await p.evaluate(() => window.__csp || []), []); }
  console.log('LAUNCH OK: build, hashes, headers, strict CSP under real flows, 404, input validation'); await b.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.error('LAUNCH FAIL', e.message); try { srv.close(); } catch {} process.exit(1); });
