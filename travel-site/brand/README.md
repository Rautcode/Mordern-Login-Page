# GhumoCo brand kit

Everything here is generated from templates, so you can change the words or the details and rebuild. The logo is **temporary** (see below).

## What is in the kit
| Folder / file | What it is |
|---|---|
| `ghumoco-logo*.svg / .png` | Logos: primary, reversed (for dark), white, one-colour, with tagline. SVG is the master; PNGs are for Instagram, WhatsApp and documents. |
| `ghumoco-mountains-light.svg / -dark.svg` | The mountain-range band that runs along the bottom of banners and cards (same greens, cream snow caps and orange sun as the logo). Regenerate with `python3 tools/make_mountains.py`. |
| `ghumoco-mark*.svg`, `ghumoco-profile-640.png`, `favicon-*.png`, `apple-touch-icon-180.png` | The icon on its own, profile picture and favicons. |
| `out/social/` | Instagram posts (1080x1080), stories and WhatsApp status (1080x1920), wide cover (1640x624). |
| `out/cards/` | Business card front/back (95x57 mm with 3 mm bleed) and A6 thank-you card (111x154 mm with bleed): print PDFs and 300 dpi PNGs. |
| `out/docs/` | Invoice/quote (A4 PDF), 4-page brand guide, email signature. |
| `templates/` | The HTML/CSS behind all of it. |
| `kit.example.json` | Example details. Copy to `kit.json` and fill in your own. |

`out/` and `kit.json` are not committed to git (your phone number, address and bank details stay private). Rebuild any time with `npm run kit` (from `travel-site/`).

## Make it yours
1. `cp brand/kit.example.json brand/kit.json`, then edit: name, phone, email, website, Instagram, legal name, address, Udyam number, GSTIN (leave `""` if you are not GST-registered), payment details and terms.
2. `npm run kit`. Files appear in `brand/out/`.
3. Banner words and photos are the `social` list in `tools/make_kit.js`. Use only photos you took or have permission to use, and only with the written yes of the people in them.
4. The review post (`post-6-review-TEMPLATE`) is a template: put in a traveller's words **only** after they agree in writing, and delete the file name's `TEMPLATE` when you do.

## Invoice notes (not tax advice)
- The sample is watermarked SAMPLE. Set `"sample": false` in `kit.json` for a real one.
- With no GSTIN the document says "INVOICE" and charges no GST. With a GSTIN it says "TAX INVOICE", and splits the tax into CGST + SGST (customer in your state) or IGST (another state). The rate is `gst_rate_pct` in `kit.json`.
- Whether GST applies to your services, at what rate, and whether you can claim input credit depends on how you structure the package. **Confirm with a CA** before you charge GST or register. Add the correct SAC code on the line description when your CA gives it.
- Numbers are rounded to the nearest rupee with the round-off shown. Keep your own invoice number sequence.
- `invoice.doc_type: "quote"` turns it into a QUOTE.

## Printing
Send the PDFs to a printer. They include 3 mm bleed; keep text inside the safe area (already done). Colours are given in HEX/RGB: ask the printer for a colour proof before a large run. Fonts are free and may be used commercially (`../fonts/LICENSES.txt`).

## Logo
The current logo (a G with a forward arrow) is a **temporary** placeholder drawn for the site. It has not been checked against existing trademarks. Before you print in volume, run an image search and the IP India trademark search. To change the logo later, replace the SVGs (or edit `tools/make_logo.py`), run `python3 tools/make_logo.py && node tools/export_logo.js`, then `npm run kit`.
