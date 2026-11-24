"use strict";
// Leads console. Every lead field is attacker-controlled, so nothing is ever put in via innerHTML: only textContent / properties.
const STATUSES = ["new", "generating", "preview_ready", "needs_manual", "failed", "quoted", "paid", "delivered", "lost"];
const PAGE = 50, KEYNAME = "adminKey";
const GROUP_GUESS = { "1-2": 2, "3-6": 5, "7-12": 10, "13+": 14 };   // starting point for the quote form; always editable
const FIELDS = [   // [name, label, default, step]  (mirrors the backend PricingInput)
  ["group_size", "Group size", 10, 1], ["nights", "Nights", 2, 1], ["room_occupancy", "People per room", 3, 1],
  ["room_rate_per_night", "Room cost per night (₹, our cost)", 0, 100], ["vehicles", "Vehicles", 1, 1],
  ["vehicle_cost_per_day", "Vehicle cost per day (₹)", 0, 100], ["vehicle_days", "Vehicle days", 3, 1],
  ["per_person_extra", "Other per-person costs (₹)", 0, 50], ["flat_extra", "Other flat costs (₹)", 0, 100],
  ["buffer_pct", "Contingency buffer %", 5, 1], ["markup_pct", "Markup on cost %", 15, 1],
];

// ---- pure helpers (also exercised by tests/admin.js) ----
const rupees = n => "₹" + Number(n).toLocaleString("en-IN");
const sourceOf = l => {
  const tag = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ");
  return tag || (l.referrer ? "referral: " + l.referrer : "direct");
};
const waLink = l => /^\d{10,15}$/.test(l.phone || "")
  ? "https://wa.me/" + l.phone + "?text=" + encodeURIComponent(`Hi ${l.name}! Thanks for your ${l.destination} trip enquiry. I'm picking it up now.`) : null;
const summarize = rows => {
  const byStatus = {}, bySource = {};
  for (const l of rows) { byStatus[l.status] = (byStatus[l.status] || 0) + 1; const s = sourceOf(l); bySource[s] = (bySource[s] || 0) + 1; }
  return { byStatus, topSources: Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 4) };
};
const MODE = { train: "train", flight: "flight", road: "road trip", flexible: "mode: advise me" };
const brief = l => [MODE[l.travel_mode], l.trip_length && l.trip_length + " days", l.group_type, l.stay_pref && "stay: " + l.stay_pref, l.interests && "likes " + l.interests].filter(Boolean).join(" · ");
const roundingOf = o => o.total - o.subtotal - o.gst;   // the per-person split is rounded up, so the lines can sum to a little less than the total
// ---- CSV export: every cell quoted, and a leading = + - @ neutralised (a stranger's name must never run as a spreadsheet formula) ----
const CSV_COLS = [["created_at", "When"], ["name", "Name"], ["phone", "Phone"], ["destination", "Destination"], ["service", "Service"], ["status", "Status"], ["departure_city", "From"],
  ["travel_dates", "Travel dates"], ["group_size", "Group size"], ["budget", "Budget band (thousand rupees per person)"], ["travel_mode", "Travel by"], ["trip_length", "Trip length (days)"],
  ["group_type", "Group type"], ["stay_pref", "Stay"], ["interests", "Interests"], ["notes", "Notes"]];
const csvCell = v => { let s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const toCsv = list => [[...CSV_COLS.map(c => c[1]), "Source"], ...list.map(l => [...CSV_COLS.map(([k]) => l[k]), sourceOf(l)])].map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
const matches = (l, q) => !q || [l.name, l.phone, l.destination].some(v => String(v || "").toLowerCase().includes(q.toLowerCase()));
window.__console = { sourceOf, waLink, summarize, matches, brief, roundingOf, toCsv };   // test hook; read-only helpers, no secrets

// ---- state + DOM ----
const $ = s => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {   // aria-* must be real attributes; Object.assign would only set an inert property
  const n = document.createElement(tag); for (const [k, v] of Object.entries(props)) k.startsWith("aria-") ? n.setAttribute(k, v) : (n[k] = v);
  n.append(...kids); return n; };
let key = "", rows = [], offset = 0, quoteLead = null, previewed = null;
try { key = sessionStorage.getItem(KEYNAME) || ""; } catch { /* private mode: key lives in memory only */ }

const show = signedIn => { $("#login").hidden = signedIn; $("#app").hidden = !signedIn; if (!signedIn) $("#key").focus(); };
const say = (t, ok) => { const m = $("#msg"); m.textContent = t || ""; m.classList.toggle("ok", !!ok); };
const signOut = why => { key = ""; rows = []; try { sessionStorage.removeItem(KEYNAME); } catch {} $("#key").value = ""; $("#login-msg").textContent = why || ""; render(); show(false); };

async function api(path, opts = {}) {
  const r = await fetch("/api/admin" + path, { ...opts, headers: { "X-Admin-Key": key, ...(opts.body ? { "Content-Type": "application/json" } : {}) } });
  if (r.status === 401) { signOut("That key was not accepted."); throw new Error("unauthorized"); }
  if (r.status === 429) throw new Error("Too many requests: wait a minute.");
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const d = data.detail; throw new Error(typeof d === "string" ? d : JSON.stringify(d || r.status).slice(0, 240)); }
  return data;
}

const shown = () => { const q = $("#q").value.trim(), f = $("#filter").value; return rows.filter(l => matches(l, q) && (!f || l.status === f)); };   // what the table shows is what the export contains
function render() {
  const vis = shown();
  $("#export").textContent = `Export CSV (${vis.length})`; $("#export").disabled = !vis.length;
  const body = $("#rows"); body.replaceChildren();
  for (const l of vis) {
    const sel = el("select", { "aria-label": "Status for " + l.name });
    for (const s of STATUSES) sel.append(el("option", { value: s, textContent: s.replace("_", " "), selected: s === l.status }));
    sel.onchange = async () => { try { await api(`/leads/${l.id}/status`, { method: "PATCH", body: JSON.stringify({ status: sel.value }) }); l.status = sel.value; say("Status updated.", true); renderSummary(); } catch (e) { sel.value = l.status; say(e.message); } };
    const act = el("div", { className: "act" });
    const wa = waLink(l); if (wa) act.append(el("a", { href: wa, target: "_blank", rel: "noopener noreferrer", textContent: "WhatsApp" }));
    act.append(el("button", { className: "sm", type: "button", textContent: "Quote", onclick: () => openQuote(l) }));
    if (l.status === "paid") act.append(el("button", { className: "sm", type: "button", textContent: "Re-send", onclick: async () => { try { const r = await api(`/leads/${l.id}/fulfill`, { method: "POST" }); say(`Delivery re-queued (${r.queued}).`, true); } catch (e) { say(e.message); } } }));
    const trip = [l.travel_dates, l.group_size && l.group_size + " people", l.budget && "₹" + l.budget + "k pp"].filter(Boolean).join(" · ");
    body.append(el("tr", {},
      el("td", { textContent: new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) }),
      el("td", {}, el("b", { textContent: l.name }), el("small", { textContent: l.phone })),
      el("td", {}, el("b", { textContent: `${l.destination} · ${l.service}` }), el("small", { textContent: [l.departure_city && "from " + l.departure_city, trip].filter(Boolean).join(" · ") }),
        ...[brief(l) && el("small", { textContent: brief(l) }), l.notes && el("small", { textContent: "Note: " + l.notes })].filter(Boolean)),
      el("td", { textContent: sourceOf(l) }), el("td", {}, sel), el("td", {}, act)));
  }
  if (!vis.length) body.append(el("tr", {}, el("td", { colSpan: 6, textContent: rows.length ? "No leads match." : "No leads yet." })));
  renderSummary();
}

function renderSummary() {
  const { byStatus, topSources } = summarize(rows), box = $("#summary"); box.replaceChildren();
  box.append(el("div", { className: "stat" }, el("b", { textContent: String(rows.length) }), el("span", { textContent: "loaded" })));
  for (const s of STATUSES) if (byStatus[s]) box.append(el("div", { className: "stat" }, el("b", { textContent: String(byStatus[s]) }), el("span", { textContent: s.replace("_", " ") })));
  for (const [s, n] of topSources) box.append(el("div", { className: "stat" }, el("b", { textContent: String(n) }), el("span", { textContent: "via " + s })));
}

async function load(more) {
  if (!more) { offset = 0; rows = []; }
  say("Loading…");
  try {
    const got = await api(`/leads?limit=${PAGE}&offset=${offset}`); rows = rows.concat(got); offset += got.length;
    $("#more").hidden = got.length < PAGE; say(""); show(true); render();
  } catch (e) {
    if (e.message === "unauthorized") return;
    if ($("#app").hidden) { show(false); $("#login-msg").textContent = "Could not load leads: " + e.message; } else say(e.message);   // never leave a blank page
  }
}

// ---- quote dialog: you can only save numbers you have just previewed ----
const inputs = () => Object.fromEntries(FIELDS.map(([n]) => [n, $("#q-" + n)]));
function payload() {
  const v = Object.fromEntries(Object.entries(inputs()).map(([n, i]) => [n, Number(i.value)]));
  const body = { group_size: v.group_size, nights: v.nights, room_occupancy: v.room_occupancy, room_rate_per_night: v.room_rate_per_night, vehicles: v.vehicles,
    vehicle_cost_per_day: v.vehicle_cost_per_day, vehicle_days: v.vehicle_days, buffer_pct: v.buffer_pct, markup_pct: v.markup_pct, per_person_items: [], flat_items: [] };
  if (v.per_person_extra > 0) body.per_person_items.push({ name: "Per-person extras", cost: v.per_person_extra });
  if (v.flat_extra > 0) body.flat_items.push({ name: "Other flat costs", cost: v.flat_extra });
  return body;
}
function openQuote(l) {
  quoteLead = l; previewed = null; $("#quote-save").disabled = true; $("#quote-out").replaceChildren(); $("#quote-msg").textContent = "";
  $("#quote-for").textContent = `${l.name} · ${l.destination} · ${l.group_size || "group size not given"}`;
  const box = $("#quote-fields"); box.replaceChildren();
  for (const [n, label, def, step] of FIELDS) {
    const i = el("input", { id: "q-" + n, type: "number", min: 0, step, value: String(n === "group_size" ? GROUP_GUESS[l.group_size] || def : def) });
    i.oninput = () => { previewed = null; $("#quote-save").disabled = true; };
    box.append(el("label", { htmlFor: "q-" + n }, label, i));
  }
  $("#quote").showModal();
}
function showResult(o) {
  const out = $("#quote-out"), dl = el("dl");
  const line = (k, v, cls) => { dl.append(el("dt", { textContent: k }), el("dd", { textContent: v, className: cls || "" })); };
  for (const [k, v] of Object.entries(o.breakdown)) line(k, rupees(v));
  line("Cost before buffer", rupees(o.base_cost)); line("Buffer", rupees(o.buffer)); line(`Markup (${o.margin_on_price_pct}% of price)`, rupees(o.markup)); line("GST", rupees(o.gst)); if (roundingOf(o)) line("Rounding (even per-person split)", rupees(roundingOf(o)));
  line("Customer total", rupees(o.total), "total"); line("Per person", rupees(o.per_person), "total"); line("Advance link would charge", rupees(o.advance));
  out.replaceChildren(dl);
}
$("#quote-preview").onclick = async () => {
  $("#quote-msg").textContent = "";
  try { const body = payload(); const o = await api("/margin-calc", { method: "POST", body: JSON.stringify(body) }); showResult(o); previewed = JSON.stringify(body); $("#quote-save").disabled = false; }
  catch (e) { $("#quote-msg").textContent = e.message; }
};
$("#quote-save").onclick = async () => {
  if (!quoteLead || previewed !== JSON.stringify(payload())) { $("#quote-msg").textContent = "Preview these exact numbers first."; return; }
  try { const o = await api(`/leads/${quoteLead.id}/quote`, { method: "POST", body: previewed }); quoteLead.status = "quoted"; $("#quote").close(); render(); say(`Quote saved: ${rupees(o.total)} total, ${rupees(o.per_person)} per person.`, true); }
  catch (e) { $("#quote-msg").textContent = e.message; }
};
$("#quote-close").onclick = () => $("#quote").close();

// ---- wiring ----
$("#filter").append(...STATUSES.map(s => el("option", { value: s, textContent: s.replace("_", " ") })));
$("#filter").onchange = $("#q").oninput = render;
$("#refresh").onclick = () => load(false);
$("#export").onclick = () => {
  const list = shown(); if (!list.length) return;
  const url = URL.createObjectURL(new Blob(["\uFEFF" + toCsv(list)], { type: "text/csv;charset=utf-8" }));   // BOM so Excel reads the rupee sign and Devanagari correctly
  const a = el("a", { href: url, download: `leads-${new Date().toISOString().slice(0, 10)}.csv` }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  say(`Exported ${list.length} lead${list.length === 1 ? "" : "s"}${$("#more").hidden ? "" : ". More leads exist: press Load more first to include them"}. The file holds customers' phone numbers: use it only to plan their trips.`, true);
};
$("#more").onclick = () => load(true);
$("#signout").onclick = () => signOut("");
$("#login-form").onsubmit = e => { e.preventDefault(); key = $("#key").value.trim(); if (!key) return; try { sessionStorage.setItem(KEYNAME, key); } catch {} $("#login-msg").textContent = ""; load(false); };
if (key) load(false); else show(false);
