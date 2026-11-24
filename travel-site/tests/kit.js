// Brand kit: invoice maths (GST split, rounding, words) and a full build of the kit from a GST-registered example.
const assert = require('assert'); const fs = require('fs'); const os = require('os'); const path = require('path'); const { execFileSync } = require('child_process');
const { inr, rupeesInWords, computeInvoice, words } = require('../tools/kit_lib');
assert.equal(rupeesInWords(123456.5), 'Rupees one lakh twenty three thousand four hundred fifty six and fifty paise only');
assert.equal(rupeesInWords(3000), 'Rupees three thousand only'); assert.equal(rupeesInWords(10000000), 'Rupees one crore only'); assert.equal(words(0), 'zero'); assert.equal(inr(1234567.5), '₹12,34,567.50');
const base = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'brand', 'kit.example.json'), 'utf8'));
const mk = (gstin, custState, extra = {}) => ({ ...base, gstin, state: 'Maharashtra', invoice: { ...base.invoice, customer_state: custState, gst_rate_pct: 5, items: [{ description: 'x', qty: 2, rate: 1000 }, { description: 'y', qty: 1, rate: 1001 }], ...extra } });
let c = computeInvoice(mk('', 'Goa')); assert(!c.gst && c.tax === 0 && c.rounded === 3001, 'no GSTIN, no GST, ever');
c = computeInvoice(mk('27ABCDE1234F1Z5', 'maharashtra ')); assert(c.same && c.cgst === c.sgst && c.cgst === 75.025 && c.igst === 0 && c.tax === 150.05, 'same state: CGST and SGST halves'); assert.equal(c.rounded, 3151); assert.equal(c.roundOff, -0.05, 'rounded to the nearest rupee, with the round-off shown');
c = computeInvoice(mk('27ABCDE1234F1Z5', 'Goa')); assert(!c.same && c.igst === 150.05 && c.cgst === 0, 'other state: IGST');
c = computeInvoice(mk('27ABCDE1234F1Z5', 'Goa', { advance_received: 1000 })); assert.equal(c.balance, 2151);
// full build into a temp folder from a GST-registered, non-sample kit
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-')); const f = path.join(tmp, 'kit.json'); fs.writeFileSync(f, JSON.stringify({ ...mk('27ABCDE1234F1Z5', 'Goa'), invoice: { ...mk('27ABCDE1234F1Z5', 'Goa').invoice, sample: false } }));
execFileSync('node', [path.join(__dirname, '..', 'tools', 'make_kit.js')], { env: { ...process.env, KIT_FILE: f, KIT_OUT: path.join(tmp, 'out') }, stdio: 'pipe' });
for (const x of ['social/post-1-intro.png', 'social/story-1-intro.png', 'social/cover-wide.png', 'cards/business-card-front.pdf', 'cards/business-card-back.pdf', 'cards/thank-you-card-back.pdf', 'docs/invoice-sample.pdf', 'docs/brand-guide.pdf', 'docs/email-signature.html']) assert(fs.statSync(path.join(tmp, 'out', x)).size > 1000, x + ' was not produced');
const png = fs.readFileSync(path.join(tmp, 'out', 'social', 'post-1-intro.png')); assert.equal(png.readUInt32BE(16), 1080); assert.equal(png.readUInt32BE(20), 1080, 'Instagram post is 1080x1080');
const story = fs.readFileSync(path.join(tmp, 'out', 'social', 'story-1-intro.png')); assert.equal(story.readUInt32BE(20), 1920);
try { const txt = execFileSync('pdftotext', [path.join(tmp, 'out', 'docs', 'invoice-sample.pdf'), '-'], { encoding: 'utf8' });
  assert(/TAX INVOICE/.test(txt) && /IGST 5%/.test(txt) && !/SAMPLE/.test(txt) && /Rupees three thousand one hundred fifty one only/.test(txt) && /GSTIN: 27ABCDE1234F1Z5/.test(txt), 'invoice text: ' + txt.slice(0, 400)); } catch (e) { if (e.code !== 'ENOENT') throw e; console.log('(pdftotext not installed: invoice text check skipped)'); }
fs.rmSync(tmp, { recursive: true, force: true }); console.log('KIT OK: invoice maths, GST split, full kit build');
