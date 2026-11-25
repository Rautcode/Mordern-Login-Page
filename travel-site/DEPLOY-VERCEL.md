# Deploy the site on Vercel

The site is static. This repo is already set up for Vercel: `vercel.json` defines the build, and the build writes Vercel's Build Output
(`.vercel/output`) with the site **and** the strict security headers (Vercel ignores the `_headers` file that Cloudflare and Netlify read).

## Read this first: Vercel's free plan is for non-commercial use
Vercel's Hobby (free) plan is meant for personal, non-commercial projects. A business site should be on a paid plan (Pro). Cloudflare Pages
is free for commercial use and works with the same build (`npm run build`, then upload `dist/`). If you want the free option, use that instead.
Check Vercel's current terms and pricing before you pick a plan.

## One-time setup (about 20 minutes)
1. **Make your brand file.** In `travel-site/`: `cp tools/brand.example.json brand.json`, fill in every value (domain `ghumoco.com`, WhatsApp number,
   Instagram, your name, legal name, email, address, Udyam), read `dist/terms/`, `refunds/` and `privacy/` after a local `npm run build`, and set `"legal_reviewed": true`.
   Leave `api_base` empty for now (WhatsApp-only mode).
2. **Turn it into one line:** `node tools/brand_env.js brand.json` prints your brand JSON on a single line. Copy it. It contains only public site details (no secrets).
3. **Import the repo in Vercel:** Add New > Project > pick `Rautcode/Mordern-Login-Page`.
   - **Root Directory:** `travel-site`
   - **Framework Preset:** Other (Vercel reads `vercel.json`; leave Build Command, Install Command and Output Directory as they are, and do not set an Output Directory)
   - **Environment Variables:** name `BRAND_JSON`, value the one line from step 2, for Production **and** Preview.
4. **Production branch:** Settings > Git > Production Branch. Use `main` once the work is merged, or the branch `claude/busy-hopper-1405z8` until then.
5. **Deploy.** In the build log you should see `ok: wrote Vercel output ... routes`. If it says `python3: command not found`, tell me (the build then needs a small change).

## Your domain (ghumoco.com)
1. Vercel > the project > Settings > Domains > add `ghumoco.com` and `www.ghumoco.com`.
2. Vercel shows the exact DNS records to create (usually an `A` record for the bare domain and a `CNAME` for `www`). Use **the values Vercel shows you**, not values from memory.
3. Add them at your registrar (Namecheap: Domain List > Manage > Advanced DNS. GoDaddy: DNS > Manage). Delete any "parking" or default records for the same names.
4. Wait for Vercel to show a green check (minutes to a few hours). The HTTPS certificate is automatic.

## Check it after it is live
- Open `https://ghumoco.com`: the header shows GhumoCo, the hero has the mountains, the photo reel and clips load, and `/terms`, `/refunds`, `/privacy`, `/rajasthan-trip-from-pune/` open.
- Headers: `curl -I https://ghumoco.com` (PowerShell: `curl.exe -I https://ghumoco.com`) must show `content-security-policy`, `strict-transport-security` and `x-content-type-options: nosniff`. **If the security policy is missing, Vercel did not pick up the Build Output.** Do not launch; tell me.
- Browser console: no red errors. Send yourself a test WhatsApp enquiry and tap every WhatsApp link on your own phone.
- Submit `https://ghumoco.com/sitemap.xml` in Google Search Console.

## Updating the site
Push to the production branch: Vercel rebuilds and publishes. Every other branch and pull request gets its own preview address (Vercel marks previews as not for search engines).
To roll back, open Deployments and promote an earlier one.

## What this does not cover
Vercel hosts only the website. The API (leads, previews, payments, WhatsApp webhook) is a separate service: see `travel-backend/README.md`. Until you set `api_base`, the planner sends every enquiry to your WhatsApp.
