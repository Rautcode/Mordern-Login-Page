// Builds the GhumoCo brand kit outputs (social banners, cards, invoice, brand guide) into brand/out/.
// Run from travel-site/:  node tools/make_kit.js
// Uses brand/kit.json (your real details, git-ignored) if it exists, otherwise brand/kit.example.json.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const B = path.join(__dirname, '..', 'brand'), T = path.join(B, 'templates'), OUT = process.env.KIT_OUT || path.join(B, 'out');
const kitFile = process.env.KIT_FILE || (fs.existsSync(path.join(B, 'kit.json')) ? path.join(B, 'kit.json') : path.join(B, 'kit.example.json'));
const kit = JSON.parse(fs.readFileSync(kitFile, 'utf8'));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (tpl, tok) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => { if (!(k in tok)) throw new Error('missing token ' + k); return k.endsWith('_html') ? tok[k] : esc(tok[k]); });
for (const d of ['social', 'cards', 'docs']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const { inr, rupeesInWords, computeInvoice } = require('./kit_lib');

(async () => {
  const b = await chromium.launch(); const tmpFiles = new Set();
  const open = async (tpl, tok, vp, dsf = 1) => { const html = fill(fs.readFileSync(path.join(T, tpl), 'utf8'), tok); const tmp = path.join(T, '.tmp-' + tpl); fs.writeFileSync(tmp, html); tmpFiles.add(tmp);
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: dsf }); await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250); return p; };
  const png = async (tpl, tok, vp, out, dsf) => { const p = await open(tpl, tok, vp, dsf); await p.screenshot({ path: path.join(OUT, out) }); await p.close(); };
  const pdf = async (tpl, tok, vp, out, preview) => { const p = await open(tpl, tok, vp, preview ? preview.dsf : 1); await p.pdf({ path: path.join(OUT, out), preferCSSPageSize: true, printBackground: true });
    if (preview) await p.screenshot({ path: path.join(OUT, preview.png) }); await p.close(); };

  // ---- social banners
  const P = { crew: ['trip-crew-560.webp', 'The crew, mid-ride'], kerala: ['trip-kerala-800.webp', 'Kerala, monsoon light'], goa: ['trip-goa-800.webp', 'Goa, from the hilltop'], gokarna: ['trip-gokarna-800.webp', 'Gokarna trail'] };
  const pics = keys => keys.map((k, i) => `<figure class="pola ${'abc'[i]}"><img src="../../img/${P[k][0]}" alt=""><figcaption>${esc(P[k][1])}</figcaption></figure>`).join('');
  const social = [
    ['post', 'post-1-intro', 'light', ['crew', 'kerala'], 'Your India trip, planned minute by minute.', 'Around your budget. For solo travellers, couples, families and groups.', 'Message us on WhatsApp'],
    ['post', 'post-2-kerala', 'dark', ['kerala'], 'Kerala in 3 days', 'Munnar, Thekkady and Alleppey, with exact timings.', 'Ask for this plan'],
    ['post', 'post-3-goa', 'light', ['goa'], 'Goa, beyond the usual beaches', 'A 4-day hidden-gems-and-classics plan built around your budget.', 'Ask for this plan'],
    ['post', 'post-4-gokarna', 'dark', ['gokarna'], 'Gokarna to Hampi', 'A beach trek, a temple viewpoint and a boulder sunrise in 5 days.', 'Plan this trip'],
    ['post', 'post-5-how-it-works', 'light', [], 'Tell us. Get a plan. Go.', 'Share your dates, budget and who is travelling. Get a written quote within 24 hours.', 'Start on WhatsApp'],
    ['post', 'post-6-review-TEMPLATE', 'dark', [], '“Words from a real traveller go here.”', 'First name, trip. Use only with the traveller’s written yes.', 'Plan your trip'],
    ['story', 'story-1-intro', 'dark', ['crew'], 'Your India trip, planned minute by minute.', 'Around your budget. Quote in 24 hours.', 'Message us on WhatsApp'],
    ['story', 'story-2-kerala', 'light', ['kerala'], 'Kerala in 3 days', 'Munnar, Thekkady and Alleppey.', 'Ask for this plan'],
    ['story', 'story-3-goa', 'dark', ['goa'], 'Goa, beyond the usual beaches', 'A 4-day plan built around your budget.', 'Ask for this plan'],
    ['cover', 'cover-wide', 'dark', ['crew', 'kerala', 'goa'], 'Custom India trips, planned minute by minute.', 'Solo travellers, couples, families and groups. Quote in 24 hours.', 'Message us on WhatsApp'],
  ];
  const size = { post: [1080, 1080], story: [1080, 1920], cover: [1640, 624] };
  for (const [tpl, name, variant, ph, headline, sub, cta] of social) {
    const [w, h] = size[tpl];
    await png(tpl + '.html', { variant, layout: ph.length === 0 ? 'nopic' : ph.length === 1 ? 'solo' : '', logo: variant === 'dark' ? 'ghumoco-logo-reversed.svg' : 'ghumoco-logo.svg', headline, sub, cta, website: kit.website, pics_html: pics(ph) }, { width: w, height: h }, `social/${name}.png`);
  }

  // ---- cards (95 x 57 mm and 111 x 154 mm include 3 mm bleed; PNGs are 300 dpi)
  const card = [359, 215], a6 = [420, 582];
  await pdf('card-front.html', kit, { width: card[0], height: card[1] }, 'cards/business-card-front.pdf', { dsf: 3.125, png: 'cards/business-card-front.png' });
  await pdf('card-back.html', kit, { width: card[0], height: card[1] }, 'cards/business-card-back.pdf', { dsf: 3.125, png: 'cards/business-card-back.png' });
  await pdf('thankyou-front.html', { ...kit, photo: 'trip-kerala-800.webp', caption: 'Your trip, your photo here' }, { width: a6[0], height: a6[1] }, 'cards/thank-you-card-front.pdf', { dsf: 3.125, png: 'cards/thank-you-card-front.png' });
  await pdf('thankyou-back.html', kit, { width: a6[0], height: a6[1] }, 'cards/thank-you-card-back.pdf', { dsf: 3.125, png: 'cards/thank-you-card-back.png' });
  fs.writeFileSync(path.join(OUT, 'docs/email-signature.html'), fill(fs.readFileSync(path.join(T, 'email-signature.html'), 'utf8'), kit));

  // ---- invoice / quote
  const iv = kit.invoice, c = computeInvoice(kit), gst = c.gst, rows = c.rows, sub = c.sub, rate = c.rate, tax = c.tax, rounded = c.rounded, roundOff = c.roundOff, same = c.same;
  const line = (l, v, cls = '') => `<div class="${cls}"><span>${l}</span><span>${v}</span></div>`;
  let totals = line('Subtotal', inr(sub));
  if (gst) totals += same ? line(`CGST ${rate / 2}%`, inr(tax / 2)) + line(`SGST ${rate / 2}%`, inr(tax / 2)) : line(`IGST ${rate}%`, inr(tax));
  if (roundOff) totals += line('Round off', (roundOff > 0 ? '+' : '-') + inr(Math.abs(roundOff)));
  totals += line('Total', inr(rounded), 'g');
  if (iv.advance_received) totals += line('Advance received', '-' + inr(iv.advance_received)) + line('Balance due', inr(rounded - iv.advance_received), 'due');
  const isQuote = iv.doc_type === 'quote';
  const tok = {
    doc_title: isQuote ? 'QUOTE' : gst ? 'TAX INVOICE' : 'INVOICE', number: iv.number, date: iv.date, due: iv.due, place_of_supply: iv.customer_state || '-', trip: iv.trip,
    legal_name: kit.legal_name, trade_line: 'Trading as ' + kit.brand, address: kit.address, contact_line: `${kit.phone} · ${kit.email}`,
    seller_ids_html: `<div>Udyam: ${esc(kit.udyam)}</div><div>${gst ? 'GSTIN: ' + esc(kit.gstin) : 'Not registered under GST'}</div>`,
    customer_name: iv.customer_name, customer_address: iv.customer_address, customer_phone: iv.customer_phone,
    customer_gstin_html: iv.customer_gstin ? `<div>GSTIN: ${esc(iv.customer_gstin)}</div>` : '',
    rows_html: rows.map(r => `<tr><td>${esc(r.description)}${r.detail ? `<small>${esc(r.detail)}</small>` : ''}</td><td class="c">${r.qty}</td><td class="r">${inr(r.rate)}</td><td class="r">${inr(r.amount)}</td></tr>`).join(''),
    totals_html: totals, total_words: rupeesInWords(rounded),
    payment_html: esc(kit.payment).replace(/\n/g, '<br>'), terms_html: esc(kit.terms),
    footer: `${kit.legal_name} · Udyam ${kit.udyam}${gst ? ' · GSTIN ' + kit.gstin : ''} · ${kit.website}${gst ? '' : ' · Tax treatment: confirm with your CA before you register or charge GST'}`,
    watermark_html: iv.sample ? '<div class="wm">SAMPLE</div>' : '',
  };
  await pdf('invoice.html', tok, { width: 794, height: 1123 }, 'docs/invoice-sample.pdf', { dsf: 1.5, png: 'docs/invoice-sample.png' });
  await pdf('guide.html', { brand: kit.brand, tagline: kit.tagline, website: kit.website }, { width: 1123, height: 794 }, 'docs/brand-guide.pdf');

  await b.close(); for (const f of tmpFiles) fs.unlinkSync(f);
  console.log('kit built from', path.basename(kitFile), '->', path.relative(process.cwd(), OUT));
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
