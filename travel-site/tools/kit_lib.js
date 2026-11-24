// Pure helpers for the invoice: Indian number formatting, amount in words, GST split. Tested by tests/kit.js.
const inr = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const below100 = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
const below1000 = n => (n >= 100 ? ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? below100(n % 100) : '');
function words(n) { if (n === 0) return 'zero'; const parts = []; for (const [div, name] of [[10000000, 'crore'], [100000, 'lakh'], [1000, 'thousand']]) { if (n >= div) { parts.push(below1000(Math.floor(n / div)) + ' ' + name); n %= div; } } if (n) parts.push(below1000(n)); return parts.join(' '); }
const rupeesInWords = v => { const r = Math.floor(v), p = Math.round((v - r) * 100); const w = 'Rupees ' + words(r) + (p ? ' and ' + words(p) + ' paise' : '') + ' only'; return w.charAt(0).toUpperCase() + w.slice(1); };


// Totals for an invoice. GST is charged only when the seller has a GSTIN; same state = CGST + SGST halves, otherwise IGST.
function computeInvoice(kit) {
  const iv = kit.invoice, gst = !!kit.gstin, same = (iv.customer_state || '').trim().toLowerCase() === (kit.state || '').trim().toLowerCase();
  const rows = iv.items.map(it => ({ ...it, amount: Math.round(it.qty * it.rate * 100) / 100 }));
  const sub = Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  const rate = gst ? iv.gst_rate_pct : 0, tax = Math.round(sub * rate) / 100;
  const rounded = Math.round(sub + tax), roundOff = Math.round((rounded - (sub + tax)) * 100) / 100;
  return { rows, sub, gst, same, rate, tax, cgst: gst && same ? tax / 2 : 0, sgst: gst && same ? tax / 2 : 0, igst: gst && !same ? tax : 0, rounded, roundOff, balance: rounded - (iv.advance_received || 0) };
}
module.exports = { inr, words, rupeesInWords, computeInvoice };
