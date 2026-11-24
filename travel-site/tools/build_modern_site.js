const fs = require('fs');
const path = require('path');

const htmlContent = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>

<!-- SEO & Metadata for Manav Raut (Raut Expeditions) -->
<title>Raut Expeditions | 100% Custom Group Travel by Manav Raut</title>
<meta name="description" content="Custom group trips from Pune & Mumbai engineered around your crew. You choose your budget, stay (Private Villa, Hotel, or Hostel), and transit (Doorstep Tempo, Train, or Flight). Planned personally by Manav Raut.">
<link rel="canonical" href="https://rautexpeditions.com/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0F172A">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="Raut Expeditions">
<meta property="og:title" content="Raut Expeditions | Custom Group Trips from Pune & Mumbai">
<meta property="og:description" content="No rigid packages. Choose your stay (Villa, Hotel, Hostel), transport (Tempo, Train, Flight), and budget. Personal SOP by Manav Raut.">
<meta property="og:url" content="https://rautexpeditions.com/">
<meta property="og:image" content="og-image.png">
<meta name="twitter:card" content="summary_large_image">

<!-- Google Fonts: Plus Jakarta Sans & Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Raut Expeditions",
  "slogan": "Your Crew. Your Budget. 100% Custom Trips.",
  "image": "og-image.png",
  "telephone": "+919822012345",
  "description": "Bespoke group travel agency based in Pune & Mumbai, Maharashtra. Founded by Manav Raut. We engineer custom expeditions around your budget, stay preference, and transit.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Pune",
    "addressRegion": "Maharashtra",
    "addressCountry": "IN"
  },
  "areaServed": ["Pune", "Mumbai", "Pimpri-Chinchwad", "Maharashtra"]
}
</script>

<style>
/* ==========================================================================
   RAUT EXPEDITIONS — MODERN DESIGN SYSTEM (2026 TRAVEL-TECH SPEC)
   Clean, Premium, High-Contrast Luxury Travel Aesthetics
   ========================================================================== */
:root {
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'Inter', ui-monospace, SFMono-Regular, Menlo, monospace;
  
  /* Modern Dark Palette */
  --dark-950: #070A12;
  --dark-900: #0B0F19;
  --dark-800: #111827;
  --dark-700: #1F2937;
  --dark-border: rgba(255, 255, 255, 0.08);
  --dark-border-hover: rgba(255, 255, 255, 0.16);
  
  /* Modern Light Canvas */
  --bg-canvas: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-card-subtle: #F1F5F9;
  --border-light: #E2E8F0;
  --border-subtle: #EDF2F7;
  
  /* Typography Colors */
  --ink-900: #0F172A;
  --ink-700: #334155;
  --ink-500: #64748B;
  --ink-400: #94A3B8;
  
  /* Primary & Brand Accents */
  --coral-500: #FF5533;
  --coral-600: #E64524;
  --coral-gradient: linear-gradient(135deg, #FF5533 0%, #FF7A59 100%);
  --coral-subtle: rgba(255, 85, 51, 0.08);
  --coral-glow: 0 10px 25px -4px rgba(255, 85, 51, 0.35);
  
  /* Trust Emerald / Teal */
  --teal-500: #0D9488;
  --teal-600: #0F766E;
  --teal-subtle: #CCFBF1;
  --teal-glow: 0 8px 20px -3px rgba(13, 148, 136, 0.3);
  
  /* Amber / Gold */
  --amber-500: #F59E0B;
  --amber-subtle: #FEF3C7;
  
  /* Radii & Shadows */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 6px 18px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 20px 35px -8px rgba(15, 23, 42, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.03);
  --shadow-float: 0 25px 50px -12px rgba(0, 0, 0, 0.22);
}

/* Base Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 96px;
  color-scheme: light;
}

body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-700);
  background: var(--bg-canvas);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

img, video {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  border: none;
  background: none;
  cursor: pointer;
}

h1, h2, h3, h4 {
  color: var(--ink-900);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.wrap {
  width: min(1200px, calc(100% - 40px));
  margin-inline: auto;
}

/* Common Text Styles */
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--coral-500);
  margin-bottom: 12px;
}

.section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 56px;
}

.section-head h2 {
  font-size: clamp(2rem, 3.8vw, 2.75rem);
  margin-bottom: 16px;
}

.section-head p {
  font-size: 1.1rem;
  color: var(--ink-500);
}

.gradient-text {
  background: linear-gradient(135deg, #FF5533 0%, #FF9A7B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Buttons & Badges */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 14px 28px;
  border-radius: var(--radius-full);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.btn-primary {
  background: var(--coral-gradient);
  color: #FFFFFF;
  box-shadow: var(--coral-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -4px rgba(255, 85, 51, 0.45);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-wa {
  background: #25D366;
  color: #FFFFFF;
  box-shadow: 0 8px 20px -3px rgba(37, 211, 102, 0.35);
}

.btn-wa:hover {
  background: #20BA5A;
  transform: translateY(-2px);
}

.btn-block {
  width: 100%;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22C55E;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulseGreen 2s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* ==========================================================================
   NAVBAR — FLOATING GLASS ISLAND (SINGLE LINE, ZERO WRAPPING)
   ========================================================================== */
.hdr {
  position: sticky;
  top: 16px;
  z-index: 1000;
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px 10px 24px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: var(--radius-full);
  box-shadow: 0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
  transition: all 0.3s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--coral-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(255, 85, 51, 0.3);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--ink-900);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.brand-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--coral-500);
}

/* Nav links: Single line, strict nowrap */
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  flex-wrap: nowrap;
}

.nav-links a {
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-700);
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: all 0.15s ease;
}

.nav-links a:hover {
  color: var(--coral-500);
  background: var(--coral-subtle);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-wa {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  font-size: 0.86rem;
  font-weight: 700;
  color: #15803D;
  background: #DCFCE7;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-wa:hover {
  background: #BBF7D0;
  transform: translateY(-1px);
}

.nav-plan {
  padding: 10px 20px;
  font-size: 0.88rem;
}

.burger-btn {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: var(--bg-card-subtle);
  color: var(--ink-900);
}

/* Mobile drawer */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: #FFFFFF;
    padding: 20px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-float);
    border: 1px solid var(--border-light);
    gap: 8px;
  }
  .nav-links.open {
    display: flex;
  }
  .nav-links a {
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--radius-md);
  }
  .burger-btn {
    display: flex;
  }
}

/* ==========================================================================
   HERO SECTION — DARK LUXURY CINEMATIC ATMOSPHERE
   Zero Cartoon SVGs, Clean Modern Grid, High-Fashion Travel Aesthetics
   ========================================================================== */
.hero {
  position: relative;
  background: var(--dark-950);
  color: #FFFFFF;
  padding: 80px 0 100px;
  margin-top: -80px; /* pull under floating nav */
  padding-top: 130px;
  overflow: hidden;
}

/* Ambient glow & backdrop */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: 
    radial-gradient(circle at 50% 10%, rgba(255, 85, 51, 0.18) 0%, transparent 60%),
    radial-gradient(circle at 90% 40%, rgba(13, 148, 136, 0.12) 0%, transparent 50%),
    linear-gradient(180deg, rgba(7, 10, 18, 0.75) 0%, #070A12 100%),
    url('img/trip-sunset-560.webp') center 35%/cover no-repeat;
  opacity: 0.94;
  filter: saturate(1.1);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 920px;
  margin: 0 auto 48px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #FF9A7B;
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
}

.hero-content h1 {
  font-size: clamp(2.4rem, 5.2vw, 4.2rem);
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.1;
  margin-bottom: 22px;
  letter-spacing: -0.03em;
}

.hero-content p.lead {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: #CBD5E1;
  line-height: 1.65;
  max-width: 780px;
  margin: 0 auto 36px;
}

.hero-content p.lead strong {
  color: #FFFFFF;
}

/* ==========================================================================
   FLOATING TRIP ARCHITECT CARD (AIRBNB / WANDERLOG STYLE HERO SELECTOR)
   ========================================================================== */
.architect-card {
  position: relative;
  z-index: 3;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-float);
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: var(--ink-900);
  max-width: 1040px;
  margin: 0 auto;
}

.architect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.architect-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.12rem;
  font-weight: 700;
}

.architect-sub {
  font-size: 0.85rem;
  color: var(--ink-500);
  font-weight: 500;
}

.architect-sop-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--coral-subtle);
  color: var(--coral-500);
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: var(--radius-full);
}

.architect-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

@media (max-width: 900px) {
  .architect-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 580px) {
  .architect-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}

.arch-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.arch-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-500);
}

.arch-box {
  padding: 14px 16px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--ink-900);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
}

.arch-box:hover {
  border-color: var(--coral-500);
  background: #FFFFFF;
}

.arch-result-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dark-900);
  color: #FFFFFF;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
  gap: 16px;
}

.arch-estimate {
  display: flex;
  flex-direction: column;
}

.arch-est-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94A3B8;
  font-weight: 600;
}

.arch-est-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: #FFFFFF;
}

.arch-est-val span {
  font-size: 0.88rem;
  color: #94A3B8;
  font-weight: 500;
}

.arch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ==========================================================================
   SOP PHILOSOPHY: MANAV RAUT'S METHODOLOGY VS OUTDATED TOUR AGENCIES
   ========================================================================== */
.section-sop {
  padding: 96px 0;
  background: #FFFFFF;
}

.sop-vs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 40px;
}

@media (max-width: 820px) {
  .sop-vs-grid {
    grid-template-columns: 1fr;
  }
}

.vs-card {
  padding: 36px;
  border-radius: var(--radius-xl);
  position: relative;
}

.vs-bad {
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
}

.vs-bad .vs-badge {
  background: #FEE2E2;
  color: #DC2626;
}

.vs-good {
  background: #FFFFFF;
  border: 2px solid var(--coral-500);
  box-shadow: 0 16px 36px -6px rgba(255, 85, 51, 0.15);
}

.vs-good .vs-badge {
  background: var(--coral-500);
  color: #FFFFFF;
}

.vs-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: var(--radius-full);
  margin-bottom: 20px;
}

.vs-card h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.vs-card p.desc {
  font-size: 0.95rem;
  color: var(--ink-500);
  margin-bottom: 24px;
}

.vs-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vs-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.95rem;
  line-height: 1.45;
}

.vs-icon-bad {
  color: #EF4444;
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.vs-icon-good {
  color: var(--teal-500);
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ==========================================================================
   STAY CHOICES (HOTEL / VILLA / HOSTEL)
   ========================================================================== */
.section-stays {
  padding: 96px 0;
  background: var(--bg-canvas);
}

.stay-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

@media (max-width: 960px) {
  .stay-grid {
    grid-template-columns: 1fr;
  }
}

.stay-card {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.stay-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--coral-500);
}

.stay-media {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.stay-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.stay-card:hover .stay-media img {
  transform: scale(1.05);
}

.stay-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.stay-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.stay-content h3 {
  font-size: 1.35rem;
  margin-bottom: 10px;
}

.stay-content p {
  color: var(--ink-500);
  font-size: 0.92rem;
  line-height: 1.55;
  margin-bottom: 18px;
}

.stay-perks {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--ink-700);
  font-weight: 500;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
  margin-top: auto;
}

.stay-perks li {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==========================================================================
   MULTI-MODAL TRANSIT (TEMPO, TRAINS, FLIGHTS, SELF-DRIVE)
   ========================================================================== */
.section-transit {
  padding: 96px 0;
  background: #FFFFFF;
}

.transit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .transit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .transit-grid {
    grid-template-columns: 1fr;
  }
}

.transit-card {
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 28px;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.transit-card:hover {
  background: #FFFFFF;
  border-color: var(--coral-500);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.transit-icon {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.transit-card h3 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.transit-card p {
  font-size: 0.88rem;
  color: var(--ink-500);
  line-height: 1.5;
  margin-bottom: 16px;
}

.transit-tag {
  margin-top: auto;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--teal-600);
  background: var(--teal-subtle);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  display: inline-block;
}

/* ==========================================================================
   INTERACTIVE TRIP CONFIGURATOR & SPLIT CALCULATOR
   ========================================================================== */
.calc-section {
  padding: 96px 0;
  background: var(--bg-canvas);
}

.calc-box {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 36px;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 40px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 960px) {
  .calc-box {
    grid-template-columns: 1fr;
    padding: 24px;
  }
}

.calc-field {
  margin-bottom: 28px;
}

.calc-lbl {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-900);
  margin-bottom: 12px;
}

.calc-lbl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calc-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--teal-600);
  background: var(--teal-subtle);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

/* Pills for Destination */
.calc-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.calc-pill {
  padding: 9px 18px;
  font-size: 0.86rem;
  font-weight: 600;
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  color: var(--ink-700);
  transition: all 0.15s ease;
}

.calc-pill:hover {
  border-color: var(--coral-500);
  color: var(--coral-500);
}

.calc-pill.active {
  background: var(--ink-900);
  color: #FFFFFF;
  border-color: var(--ink-900);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

/* Range Slider */
.calc-range {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--border-light);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  margin: 12px 0 8px;
}

.calc-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--coral-500);
  border: 3px solid #FFFFFF;
  box-shadow: 0 4px 10px rgba(255, 85, 51, 0.4);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.calc-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.range-marks {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: var(--ink-400);
  font-weight: 600;
}

/* Radio button tier chips */
.calc-tier-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.calc-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-700);
}

.calc-radio input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.calc-radio:hover {
  border-color: var(--coral-500);
}

.calc-radio.active {
  background: #FFFFFF;
  border: 2px solid var(--coral-500);
  color: var(--coral-500);
  box-shadow: 0 4px 14px rgba(255, 85, 51, 0.15);
}

/* Summary Card Output */
.calc-summary-card {
  background: linear-gradient(180deg, var(--dark-900) 0%, var(--dark-950) 100%);
  color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary-top {
  border-bottom: 1px solid var(--dark-border);
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.est-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FF9A7B;
}

.per-head-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 6px 0 10px;
}

.per-head-price .currency {
  font-size: 1.8rem;
  font-weight: 700;
  color: #FF5533;
}

.per-head-price b {
  font-size: 2.8rem;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.03em;
}

.per-head-price small {
  font-size: 0.95rem;
  color: #94A3B8;
  font-weight: 500;
}

.total-pool {
  font-size: 0.88rem;
  color: #CBD5E1;
}

.total-pool b {
  color: #FFFFFF;
}

.cost-breakdown {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.cost-breakdown li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.86rem;
  color: #94A3B8;
}

.cost-breakdown li b {
  color: #FFFFFF;
  font-weight: 600;
}

.calc-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calc-footnote {
  font-size: 0.75rem;
  color: #64748B;
  text-align: center;
  margin-top: 14px;
}

/* ==========================================================================
   DELAY MISSION CONTROL & TIMELINE SIMULATION
   ========================================================================== */
.section-delay {
  padding: 96px 0;
  background: #FFFFFF;
}

.delay-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 36px;
  align-items: start;
}

@media (max-width: 900px) {
  .delay-grid {
    grid-template-columns: 1fr;
  }
}

.delay-control-box {
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 32px;
}

.delay-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 24px;
}

.delay-chip {
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  color: var(--ink-700);
  transition: all 0.15s ease;
}

.delay-chip:hover {
  border-color: var(--coral-500);
}

.delay-chip.active {
  background: var(--coral-500);
  color: #FFFFFF;
  border-color: var(--coral-500);
  box-shadow: 0 4px 12px rgba(255, 85, 51, 0.3);
}

.delay-advisor-box {
  background: #FFFFFF;
  border-radius: var(--radius-md);
  padding: 20px;
  border-left: 4px solid var(--coral-500);
  box-shadow: var(--shadow-sm);
}

.advisor-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--ink-900);
  margin-bottom: 8px;
}

#delay-directive {
  font-size: 0.92rem;
  color: var(--ink-700);
  line-height: 1.5;
}

/* Timeline Cards */
.ticket-wrap {
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.daytabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.daytab {
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  color: var(--ink-700);
}

.daytab[aria-selected="true"] {
  background: var(--ink-900);
  color: #FFFFFF;
  border-color: var(--ink-900);
}

.ticket {
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--border-light);
}

.t-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.t-head small {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--coral-500);
}

.t-head h3 {
  font-size: 1.25rem;
  margin-top: 4px;
}

.leg {
  background: var(--bg-canvas);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.86rem;
  margin-bottom: 20px;
}

.sched {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sched li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 0.9rem;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.sched li:last-child {
  border-bottom: none;
}

.sched time {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.84rem;
  color: var(--ink-500);
  min-width: 50px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: 1px;
}

.tag.eat {
  background: #FEF3C7;
  color: #B45309;
}

.tag.stop {
  background: #FEE2E2;
  color: #B91C1C;
}

.tag.cut {
  background: #F1F5F9;
  color: #64748B;
}

.ticket.is-late li[data-cut] {
  opacity: 0.35;
  text-decoration: line-through;
}

/* ==========================================================================
   PHOTO & VIDEO REEL (REAL MEDIA ONLY)
   ========================================================================== */
.section-reel {
  padding: 96px 0;
  background: var(--dark-900);
  color: #FFFFFF;
  overflow: hidden;
}

.section-reel h2 {
  color: #FFFFFF;
}

.reel-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0 30px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.reel-scroll::-webkit-scrollbar {
  height: 6px;
}

.reel-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.reel-item {
  flex: 0 0 320px;
  height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  scroll-snap-align: start;
}

.reel-item img, .reel-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-cap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 20px 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  font-size: 0.88rem;
  font-weight: 600;
  color: #FFFFFF;
}

/* ==========================================================================
   FOUNDER SPOTLIGHT — MANAV RAUT
   ========================================================================== */
.section-founder {
  padding: 96px 0;
  background: #FFFFFF;
}

.founder-card {
  background: linear-gradient(135deg, var(--bg-canvas) 0%, #FFFFFF 100%);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 48px;
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 48px;
  align-items: center;
  box-shadow: var(--shadow-lg);
}

@media (max-width: 860px) {
  .founder-card {
    grid-template-columns: 1fr;
    padding: 28px;
  }
}

.founder-quote {
  font-size: 1.15rem;
  line-height: 1.65;
  color: var(--ink-700);
  margin-bottom: 24px;
}

.founder-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.founder-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--coral-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #FFFFFF;
}

.founder-info h4 {
  font-size: 1.15rem;
  margin-bottom: 2px;
}

.founder-info span {
  font-size: 0.82rem;
  color: var(--ink-500);
  font-weight: 600;
}

.founder-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #FFFFFF;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  text-align: center;
}

.founder-stat b {
  display: block;
  font-size: 1.6rem;
  color: var(--coral-500);
  font-weight: 800;
}

.founder-stat span {
  font-size: 0.78rem;
  color: var(--ink-500);
  font-weight: 600;
}

/* ==========================================================================
   PROVEN ROUTES & SIGNATURE PACKAGES
   ========================================================================== */
.section-routes {
  padding: 96px 0;
  background: var(--bg-canvas);
}

.route-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.route-tab {
  padding: 10px 22px;
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  color: var(--ink-700);
}

.route-tab[aria-selected="true"] {
  background: var(--ink-900);
  color: #FFFFFF;
  border-color: var(--ink-900);
}

.route-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

@media (max-width: 820px) {
  .route-grid {
    grid-template-columns: 1fr;
  }
}

.route-card {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.route-img {
  height: 220px;
  position: relative;
}

.route-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.route-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 12px;
  background: rgba(15, 23, 42, 0.85);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.route-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.route-body h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
}

.route-meta {
  display: flex;
  gap: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--coral-500);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.route-hl {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--ink-700);
  margin-bottom: 24px;
}

.route-hl li::before {
  content: "•";
  color: var(--coral-500);
  font-weight: bold;
  display: inline-block;
  width: 1em;
}

.route-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

/* ==========================================================================
   3-STEP CUSTOM PLANNER (LEAD CAPTURE)
   ========================================================================== */
.section-planner {
  padding: 96px 0;
  background: #FFFFFF;
}

.planner-wrap {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 48px;
  box-shadow: var(--shadow-lg);
}

@media (max-width: 900px) {
  .planner-wrap {
    grid-template-columns: 1fr;
    padding: 24px;
  }
}

.planner-progress {
  margin-bottom: 28px;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  width: 33.33%;
  height: 100%;
  background: var(--coral-gradient);
  transition: width 0.3s ease;
}

.progress-step-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-900);
}

.form-step legend {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 16px;
}

.choice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.choice-chip {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
}

.choice-chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.choice-chip:has(input:checked) {
  background: var(--coral-500);
  color: #FFFFFF;
  border-color: var(--coral-500);
}

.form-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .form-inputs {
    grid-template-columns: 1fr;
  }
}

.form-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink-700);
  margin-bottom: 6px;
}

.form-field input, .form-field textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: #FFFFFF;
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
}

.form-field input:focus, .form-field textarea:focus {
  border-color: var(--coral-500);
  box-shadow: 0 0 0 3px rgba(255, 85, 51, 0.15);
}

.form-nav {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.err {
  color: #EF4444;
  font-size: 0.78rem;
  margin-top: 4px;
  font-weight: 600;
}

.planner-summary-box {
  background: linear-gradient(180deg, var(--dark-900) 0%, var(--dark-950) 100%);
  color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary-route {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 18px;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  font-size: 0.9rem;
  color: #94A3B8;
}

.summary-big {
  font-size: 1.6rem;
  font-weight: 800;
  color: #FFFFFF;
}

/* ==========================================================================
   FAQ SECTION
   ========================================================================== */
.section-faq {
  padding: 96px 0;
  background: var(--bg-canvas);
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
}

.faq-item[open] {
  border-color: var(--coral-500);
  box-shadow: var(--shadow-sm);
}

.faq-item summary {
  padding: 20px 24px;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--ink-900);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: "+";
  font-size: 1.4rem;
  color: var(--coral-500);
  font-weight: 400;
}

.faq-item[open] summary::after {
  content: "−";
}

.faq-item p {
  padding: 0 24px 20px;
  font-size: 0.95rem;
  color: var(--ink-700);
  line-height: 1.6;
}

/* ==========================================================================
   MODERN FOOTER
   ========================================================================== */
.site-footer {
  background: var(--dark-950);
  color: #94A3B8;
  padding: 80px 0 40px;
  border-top: 1px solid var(--dark-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 60px;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.footer-brand h3 {
  color: #FFFFFF;
  font-size: 1.4rem;
  margin-bottom: 12px;
}

.footer-col h4 {
  color: #FFFFFF;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.92rem;
}

.footer-col a:hover {
  color: #FFFFFF;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--dark-border);
  padding-top: 30px;
  font-size: 0.85rem;
  flex-wrap: wrap;
  gap: 16px;
}

/* Mobile Fixed Action Bar */
.mbar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-light);
  gap: 12px;
}

@media (max-width: 768px) {
  .mbar {
    display: flex;
  }
}
</style>
</head>
<body>

<!-- ==========================================================================
     STICKY FLOATING NAVBAR (NO WRAPPING, ULTRA CLEAN)
     ========================================================================== -->
<header class="hdr" id="hdr">
  <div class="nav-bar">
    <a href="#top" class="brand" aria-label="Raut Expeditions home">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">Raut Expeditions</span>
        <span class="brand-tag">Custom Travel SOP</span>
      </div>
    </a>

    <nav class="nav-links" id="links" aria-label="Primary Navigation">
      <a href="#custom-sop">The Custom SOP</a>
      <a href="#stays">Stay Types</a>
      <a href="#transit">Transit Modes</a>
      <a href="#calculator">Split Calculator</a>
      <a href="#sample">Delay Simulator</a>
      <a href="#routes">Routes</a>
      <a href="#faq">FAQ</a>
    </nav>

    <div class="nav-actions">
      <a class="nav-wa" data-wa target="_blank" rel="noopener">
        <span class="pulse-dot"></span>
        <span>WhatsApp</span>
      </a>
      <a href="#planner" class="btn btn-primary nav-plan" id="nav-plan-btn">Plan My Trip</a>
      <button class="burger-btn" id="burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="links">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="main">

<!-- ==========================================================================
     HERO SECTION — MODERN CINEMATIC TRAVEL TECH
     ========================================================================== -->
<section class="hero" id="top">
  <div class="hero-bg"></div>
  <div class="wrap">
    <div class="hero-content">
      <div class="hero-badge">
        <span>✨ 100% Tailored Group Travel · Pune &amp; Mumbai · Zero Fixed Packages</span>
      </div>
      <h1>Don't Fit Into a Tour Package.<br><span class="gradient-text">Build The Trip Around Your Crew.</span></h1>
      <p class="lead">Founded by <strong>Manav Raut</strong>. We never force you onto stranger buses or rigid 6 AM alarms. We engineer every hour around your group's exact <strong>Budget</strong>, your <strong>Stay Preference</strong> (Private Pool Villa, Hotel, or Hostel), and seamless <strong>Transit</strong> (Doorstep AC Tempo, Train, or Flight). You set the vibe; we make it flawless.</p>
    </div>

    <!-- Floating Trip Architect Hero Card -->
    <div class="architect-card" id="architect">
      <div class="architect-header">
        <div>
          <div class="architect-title">
            <span>⚡ Interactive Trip Architect</span>
          </div>
          <span class="architect-sub">Configure your group's blueprint in real-time</span>
        </div>
        <span class="architect-sop-badge">✓ Manav Raut's Bespoke SOP</span>
      </div>

      <div class="architect-grid">
        <!-- Col 1: Destination -->
        <div class="arch-col">
          <span class="arch-label">1. Destination</span>
          <div class="arch-box" onclick="location.href='#calculator'">
            <span>📍 Rajasthan Circuit</span>
            <small>6D/5N</small>
          </div>
        </div>

        <!-- Col 2: Stay Choice -->
        <div class="arch-col">
          <span class="arch-label">2. Stay Type</span>
          <div class="arch-box" onclick="location.href='#stays'">
            <span>🏡 Private Pool Villa</span>
            <small>Choice</small>
          </div>
        </div>

        <!-- Col 3: Transit Choice -->
        <div class="arch-col">
          <span class="arch-label">3. Transportation</span>
          <div class="arch-box" onclick="location.href='#transit'">
            <span>🚐 Doorstep Tempo</span>
            <small>AC 12s</small>
          </div>
        </div>

        <!-- Col 4: Group Size -->
        <div class="arch-col">
          <span class="arch-label">4. Group Size</span>
          <div class="arch-box" onclick="location.href='#calculator'">
            <span>👥 12 Travellers</span>
            <small>Friends</small>
          </div>
        </div>
      </div>

      <div class="arch-result-strip">
        <div class="arch-estimate">
          <span class="arch-est-label">Estimated Transparent Cost</span>
          <div class="arch-est-val">₹12,400 <span>/ person (All-inclusive stays + transit)</span></div>
        </div>
        <div class="arch-actions">
          <a href="#calculator" class="btn btn-ghost">Customize in Split Engine →</a>
          <a class="btn btn-primary" data-wa target="_blank" rel="noopener">WhatsApp Manav</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================================================
     SOP PHILOSOPHY: MANAV RAUT'S METHODOLOGY VS OUTDATED TOUR AGENCIES
     ========================================================================== -->
<section class="section-sop" id="custom-sop">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">The Anti-Package Guarantee</span>
      <h2>Why Fixed Tour Packages Are Dead</h2>
      <p>How Manav Raut’s custom planning SOP gives your group complete freedom without the chaotic arguments.</p>
    </div>

    <div class="sop-vs-grid">
      <!-- Old Way -->
      <div class="vs-card vs-bad">
        <span class="vs-badge">❌ Traditional Tour Agency</span>
        <h3>Rigid, Impersonal Packages</h3>
        <p class="desc">What happens when you book a typical online group tour or commercial package:</p>
        <ul class="vs-list">
          <li>
            <span class="vs-icon-bad">✕</span>
            <span><b>Fixed calendar dates:</b> You are forced to adjust your leaves to fit their pre-scheduled batches.</span>
          </li>
          <li>
            <span class="vs-icon-bad">✕</span>
            <span><b>30–40 Strangers on a slow bus:</b> Awkward group dynamics, waiting on slow strangers at every rest stop.</span>
          </li>
          <li>
            <span class="vs-icon-bad">✕</span>
            <span><b>Generic 3-star highway motels:</b> Basic rooms, bland buffet meals, and zero atmosphere.</span>
          </li>
          <li>
            <span class="vs-icon-bad">✕</span>
            <span><b>Forced 6:00 AM wake-ups:</b> You are herded like schoolkids from one monument queue to another.</span>
          </li>
          <li>
            <span class="vs-icon-bad">✕</span>
            <span><b>Hidden shopping markups:</b> Drivers take you to overpriced souvenir shops to collect their commission.</span>
          </li>
        </ul>
      </div>

      <!-- Manav's SOP -->
      <div class="vs-card vs-good">
        <span class="vs-badge">✓ Manav Raut's Bespoke SOP</span>
        <h3>100% Engineered Around You</h3>
        <p class="desc">How we plan private group travel from Pune &amp; Mumbai:</p>
        <ul class="vs-list">
          <li>
            <span class="vs-icon-good">✓</span>
            <span><b>100% Private Crew:</b> Only your circle of friends, family, or team. Zero strangers.</span>
          </li>
          <li>
            <span class="vs-icon-good">✓</span>
            <span><b>Stay Where You Want:</b> Choose between luxury private pool villas, 4★ boutique hotels, or surf hostels.</span>
          </li>
          <li>
            <span class="vs-icon-good">✓</span>
            <span><b>Doorstep Multi-Modal Transit:</b> AC Tempo Traveller picks you up from your Pune home, or synced train berths &amp; flights.</span>
          </li>
          <li>
            <span class="vs-icon-good">✓</span>
            <span><b>Your Pace &amp; Timeline:</b> Sleep until 11 AM if you want. Our built-in delay buffers adapt the day in real-time.</span>
          </li>
          <li>
            <span class="vs-icon-good">✓</span>
            <span><b>Transparent Budget Split:</b> Itemized down to the rupee before you pay a single rupee. Zero surprises.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================================================
     STAY TYPES SHOWCASE (VILLA / HOTEL / HOSTEL)
     ========================================================================== -->
<section class="section-stays" id="stays">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Stay Options</span>
      <h2>You Pick The Vibe. We Secure The Stays.</h2>
      <p>Whether you want late-night poolside parties or quiet boutique balcony views, we curate verified properties that fit your exact budget.</p>
    </div>

    <div class="stay-grid">
      <!-- Stay 1: Villa -->
      <article class="stay-card">
        <div class="stay-media">
          <img src="img/trip-goa-800.webp" alt="Private pool villa in Goa" loading="lazy">
          <span class="stay-badge">🏡 PRIVATE POOL VILLAS</span>
        </div>
        <div class="stay-content">
          <h3>Private Pool Villas</h3>
          <p>Perfect for groups of 8 to 18 friends. Complete private estate with swimming pool, Bluetooth party sound, private lawn, and barbecue chef on demand.</p>
          <ul class="stay-perks">
            <li>✓ Zero noise complaints &amp; complete crew privacy</li>
            <li>✓ Late night pool dips &amp; private kitchen</li>
            <li>✓ Ideal for Goa, Lonavala, Coorg, and Alibaug</li>
          </ul>
        </div>
      </article>

      <!-- Stay 2: Boutique Hotel -->
      <article class="stay-card">
        <div class="stay-media">
          <img src="img/real-rajasthan-cover.webp" alt="Heritage boutique hotel in Rajasthan" loading="lazy">
          <span class="stay-badge">🏨 BOUTIQUE &amp; HERITAGE HOTELS</span>
        </div>
        <div class="stay-content">
          <h3>Boutique &amp; Heritage Stays</h3>
          <p>For couples, families, and comfort travelers who want 4-star comfort, scenic valley views, historical architecture, and authentic regional breakfast spreads.</p>
          <ul class="stay-perks">
            <li>✓ Verified cleanliness, AC comfort &amp; room service</li>
            <li>✓ Prime locations near heritage sights &amp; viewpoints</li>
            <li>✓ Curated for Rajasthan, Kerala, and Himachal</li>
          </ul>
        </div>
      </article>

      <!-- Stay 3: Social Hostel -->
      <article class="stay-card">
        <div class="stay-media">
          <img src="img/trip-gokarna-800.webp" alt="Cliffside backpacker hostel in Gokarna" loading="lazy">
          <span class="stay-badge">🎒 SOCIAL &amp; SURF HOSTELS</span>
        </div>
        <div class="stay-content">
          <h3>Social &amp; Backpacker Hostels</h3>
          <p>For young explorers, backpackers, and creative crews wanting cafe vibes, co-working desks, beach access, and budget-friendly private or dorm pods.</p>
          <ul class="stay-perks">
            <li>✓ Lively common lounges &amp; sunset beach cafes</li>
            <li>✓ Budget-optimized without sacrificing safety</li>
            <li>✓ Handpicked in Gokarna, North Goa, and Kasol</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ==========================================================================
     MULTI-MODAL TRANSIT FLEET
     ========================================================================== -->
<section class="section-transit" id="transit">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Multi-Modal Mobility</span>
      <h2>Seamless Door-to-Door Transportation</h2>
      <p>From your doorstep in Pune or Mumbai all the way to your stay. We manage vehicles, train berths, and flight transfers.</p>
    </div>

    <div class="transit-grid">
      <!-- Mode 1: Tempo -->
      <div class="transit-card">
        <div class="transit-icon">🚐</div>
        <h3>Doorstep AC Tempo Traveller</h3>
        <p>10 to 26 seater pushback recliners. Door-to-door pickup across Pune (Kothrud, Viman Nagar, Wakad) &amp; Mumbai. High-end party audio &amp; vetted mountain drivers.</p>
        <span class="transit-tag">Most Popular for Groups</span>
      </div>

      <!-- Mode 2: Train -->
      <div class="transit-card">
        <div class="transit-icon">🚆</div>
        <h3>Scenic Rail Expeditions</h3>
        <p>Confirmed group berths on scenic routes: Konkan Railway, Vande Bharat, and overnight express sleeper trains. Station transfers waiting on arrival.</p>
        <span class="transit-tag">Scenic &amp; Budget-Smart</span>
      </div>

      <!-- Mode 3: Flight -->
      <div class="transit-card">
        <div class="transit-icon">✈️</div>
        <h3>Flight Coordination &amp; Transfers</h3>
        <p>We sync group flight schedules out of Pune (PNQ) and Mumbai (BOM), coordinating arrivals with private AC vehicle transfers directly to your villa or hotel.</p>
        <span class="transit-tag">Fast Long-Distance</span>
      </div>

      <!-- Mode 4: Self-Drive -->
      <div class="transit-card">
        <div class="transit-icon">🚗</div>
        <h3>Self-Drive &amp; Convoy Support</h3>
        <p>For driving enthusiasts. We plan the exact turn-by-turn route, fuel stops, mountain ghat safety windows, walkie-talkie support, and mechanic roadside backup.</p>
        <span class="transit-tag">Ultimate Roadtrip</span>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================================================
     GROUP SPLIT CALCULATOR & CONFIGURATOR
     ========================================================================== -->
<section class="calc-section" id="calculator">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Interactive Cost Engine</span>
      <h2>Custom Trip &amp; Fair Split Configurator</h2>
      <p>Configure every parameter to see the transparent per-head split. Planned strictly according to your crew.</p>
    </div>

    <div class="calc-box">
      <div class="calc-controls">
        <!-- 1. Destination -->
        <div class="calc-field">
          <label class="calc-lbl">1. Select Circuit / Destination</label>
          <div class="calc-pill-group" role="radiogroup" aria-label="Route Selection">
            <button type="button" class="calc-pill active" data-dest="rajasthan">Rajasthan Circuit (6D/5N)</button>
            <button type="button" class="calc-pill" data-dest="gokarna">Gokarna &amp; Hampi (5D/4N)</button>
            <button type="button" class="calc-pill" data-dest="kerala">Kerala Backwaters (3D/2N)</button>
            <button type="button" class="calc-pill" data-dest="goa">Goa Hidden Gems (4D/3N)</button>
            <button type="button" class="calc-pill" data-dest="himachal">Himachal / Uttarakhand (7D/6N)</button>
          </div>
        </div>

        <!-- 2. Group Size Slider -->
        <div class="calc-field">
          <div class="calc-lbl-row">
            <label for="group-slider" class="calc-lbl">2. Group Size: <b id="slider-count">12 Travellers</b></label>
            <span class="calc-badge" id="vehicle-fit">⭐ Perfect 12-Seater AC Tempo Traveller Fit</span>
          </div>
          <input type="range" id="group-slider" min="4" max="16" value="12" step="1" class="calc-range" aria-label="Adjust group size">
          <div class="range-marks">
            <span>4 friends</span>
            <span>8 (Innova)</span>
            <span>12 (AC Tempo)</span>
            <span>16+ Cruiser</span>
          </div>
        </div>

        <!-- 3. Stay Choice -->
        <div class="calc-field">
          <label class="calc-lbl">3. Stay Preference (Manav's SOP)</label>
          <div class="calc-tier-group" role="radiogroup" aria-label="Stay Standard">
            <label class="calc-radio active">
              <input type="radio" name="calc-stay" value="hotel" checked>
              <span>🏨 3★/4★ Hotel</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="calc-stay" value="villa">
              <span>🏡 Private Villa</span>
            </label>
            <label class="calc-radio">
              <input type="radio" name="calc-stay" value="hostel">
              <span>🎒 Social Hostel</span>
            </label>
          </div>
        </div>

        <!-- 4. Transport Mode -->
        <div class="calc-field">
          <label class="calc-lbl">4. Mode of Transport</label>
          <div class="calc-tier-group" role="radiogroup" aria-label="Transport Mode" style="grid-template-columns: repeat(2, 1fr);">
            <label class="calc-radio active" data-trans-opt="tempo">
              <input type="radio" name="calc-trans" value="tempo" checked>
              <span>🚐 Doorstep AC Tempo</span>
            </label>
            <label class="calc-radio" data-trans-opt="train">
              <input type="radio" name="calc-trans" value="train">
              <span>🚆 IRCTC Train + Cabs</span>
            </label>
            <label class="calc-radio" data-trans-opt="flight">
              <input type="radio" name="calc-trans" value="flight">
              <span>✈️ Flight Sync + Cabs</span>
            </label>
            <label class="calc-radio" data-trans-opt="selfdrive">
              <input type="radio" name="calc-trans" value="selfdrive">
              <span>🚗 Roadtrip Convoy</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Live Split Output Card -->
      <aside class="calc-summary-card">
        <div class="summary-top">
          <span class="est-tag">TRANSPARENT PER-HEAD SHARE</span>
          <div class="per-head-price">
            <span class="currency">₹</span><b id="per-head-amt">12,400</b><small>/ person</small>
          </div>
          <div class="total-pool">Total Group Pool: <b id="total-pool-amt">₹1,48,800</b></div>
        </div>

        <ul class="cost-breakdown">
          <li>
            <span id="label-transit">🚐 Private Tempo Traveller + Fuel + Tolls</span>
            <b id="item-transit">₹4,000 / head</b>
          </li>
          <li>
            <span id="label-stays">🏨 Verified 3★ Hotel &amp; Breakfast</span>
            <b id="item-stays">₹6,200 / head</b>
          </li>
          <li>
            <span>🎟️ Monument Passes &amp; Key Activities</span>
            <b id="item-passes">₹1,400 / head</b>
          </li>
          <li>
            <span>🛡️ Manav's Contingency &amp; Highway Buffer</span>
            <b id="item-buffer">₹800 / head</b>
          </li>
        </ul>

        <div class="calc-actions">
          <button type="button" class="btn btn-primary btn-block" id="copy-split-btn">
            <span>📋 Copy Blueprint for WhatsApp</span>
          </button>
          <button type="button" class="btn btn-ghost btn-block" id="calc-plan-btn">
            <span>Plan this with Manav Raut →</span>
          </button>
        </div>
        <p class="calc-footnote">100% customisable. Every detail is shaped around your budget and group requirements.</p>
      </aside>
    </div>
  </div>
</section>

<!-- ==========================================================================
     DELAY MISSION CONTROL & REAL-TIME SCRUBBER
     ========================================================================== -->
<section class="section-delay" id="sample">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Highway &amp; Traffic Resilience</span>
      <h2>Delay Mission Control</h2>
      <p>Watch how Manav Raut's SOP dynamically recalculates your day when real-world traffic strikes. Key moments are 100% protected.</p>
    </div>

    <div class="delay-grid">
      <!-- Left: Interactive Delay Scrubber -->
      <div class="delay-control-box">
        <span class="kicker">Simulate a Real Delay</span>
        <h3 style="margin-bottom: 8px">Traffic Simulator: <span id="delay-status-text" style="color:var(--coral-500)">On Time (0 min)</span></h3>
        <p style="font-size:0.92rem;color:var(--ink-500);margin-bottom:16px">Select an on-road delay to see how our cut-lists protect your train or flight connections:</p>

        <div class="delay-buttons" role="group" aria-label="Select trip delay">
          <button type="button" class="delay-chip active" data-delay="0">On Time</button>
          <button type="button" class="delay-chip" data-delay="30">+30 min</button>
          <button type="button" class="delay-chip" data-delay="60">+60 min</button>
          <button type="button" class="delay-chip" data-delay="90">+90 min</button>
          <button type="button" class="delay-chip" data-delay="120">+120 min</button>
        </div>

        <div class="delay-advisor-box" id="delay-advisor">
          <div class="advisor-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Manav Raut's On-Road Directive:</span>
          </div>
          <p id="delay-directive">All legs green. Mehrangarh zip-line at 14:30, Jaswant Thada at 17:00, relaxed dinner at Stepwell Square, train 20495 confirmed at 22:00.</p>
        </div>

        <button class="toggle" id="late" aria-pressed="false" style="display:none"><span id="late-label">Late toggle</span></button>
        <p id="late-note" hidden>Drop Jaswant Thada. Protect the zip-line and the 22:00 train.</p>
      </div>

      <!-- Right: Live Timeline Ticket -->
      <div class="ticket-wrap">
        <div class="daytabs" role="tablist" aria-label="Sample days">
          <button class="daytab" role="tab" aria-selected="true" data-day="0">Rajasthan · Day 5</button>
          <button class="daytab" role="tab" aria-selected="false" data-day="1">Rajasthan · Day 3</button>
          <button class="daytab" role="tab" aria-selected="false" data-day="2">Kerala · Day 3</button>
        </div>

        <article class="ticket" id="ticket" aria-label="Sample day plan">
          <div class="t-head">
            <div>
              <small id="t-day">Day 5 · Jodhpur</small>
              <h3 id="t-title">Desert highway, zip-line, departure</h3>
            </div>
            <span class="calc-badge">Live Working Plan</span>
          </div>

          <div class="leg" id="t-leg">
            <b>Transit leg:</b> Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.
          </div>

          <ul class="sched" id="t-sched">
            <li><time>08:00</time><span><span class="tag eat">EAT</span><span class="what">Breakfast and camp checkout</span></span></li>
            <li><time>08:30</time><span><span class="what">Depart for Jodhpur via NH125: 280–285 km, 4.5–6 hours</span></span></li>
            <li><time>14:30</time><span><span class="tag stop">HARD STOP</span><span class="what">Flying Fox zip-line at Mehrangarh. Book the earliest slot</span><small>Operates 09:30–17:00 only. 90–120 min tour</small></span></li>
            <li data-cut><time>17:00</time><span><span class="tag cut">CUT</span><span class="what">Jaswant Thada, a quick visit</span></span></li>
            <li><time>19:00</time><span><span class="tag eat">EAT</span><span class="what">Dinner at Stepwell Square (Toorji Ka Jhalra)</span></span></li>
            <li><time>20:30</time><span><span class="what">Drop at Jodhpur Junction, with a real buffer</span></span></li>
            <li><time>22:00</time><span><span class="tag stop">HARD STOP</span><span class="what">Board train 20495 to Pune</span><small>Confirmed on IRCTC</small></span></li>
          </ul>
        </article>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================================================
     PROVEN ROUTES & PACKAGES
     ========================================================================== -->
<section class="section-routes" id="routes">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Tested Blueprints</span>
      <h2>Signature Expeditions from Pune</h2>
      <p>Routes we have personally scouted, timed, and ground-tested. Grab the ready blueprint or let us execute the entire trip.</p>
    </div>

    <div class="route-tabs" role="tablist" aria-label="Filter routes">
      <button class="route-tab tab" role="tab" aria-selected="true" data-f="all">All Trips</button>
      <button class="route-tab tab" role="tab" aria-selected="false" data-f="weekend">Weekend Batches</button>
      <button class="route-tab tab" role="tab" aria-selected="false" data-f="multi">Multi-City Classics</button>
      <button class="route-tab tab" role="tab" aria-selected="false" data-f="north">North India Circuits</button>
    </div>

    <div class="route-grid" id="trips" role="tabpanel">
      <!-- Route 1: Rajasthan -->
      <article class="route-card card" data-id="rajasthan" data-cats="multi north">
        <div class="route-img" data-photo="rajasthan">
          <img src="img/real-rajasthan-cover.webp" alt="Rajasthan Desert Circuit" loading="lazy">
          <span class="route-badge">6 DAYS / 5 NIGHTS</span>
        </div>
        <div class="route-body">
          <h3>Rajasthan Circuit: Jaipur → Jaisalmer → Jodhpur</h3>
          <div class="route-meta"><span>8–16 PEOPLE</span> · <span>EX-PUNE/MUMBAI</span></div>
          <ul class="route-hl">
            <li>3 chained overnight express train legs + Tempo Traveller desert run</li>
            <li>Amer &amp; Mehrangarh Fort closing-time strategy</li>
            <li>Sam Sand Dunes luxury desert camp &amp; sunset</li>
            <li>15+ verified street food &amp; dining stops</li>
          </ul>
          <div class="route-actions">
            <button class="btn btn-primary" data-trip="rajasthan">Plan this trip</button>
            <button class="btn btn-ghost" style="color:var(--ink-700);border-color:var(--border-light)" data-route="rajasthan">View Details</button>
          </div>
        </div>
      </article>

      <!-- Route 2: Gokarna -->
      <article class="route-card card" data-id="gokarna" data-cats="weekend multi">
        <div class="route-img" data-photo="gokarna">
          <img src="img/trip-gokarna-800.webp" alt="Gokarna and Hampi" loading="lazy">
          <span class="route-badge">5 DAYS / 4 NIGHTS</span>
        </div>
        <div class="route-body">
          <h3>Gokarna, Murudeshwar &amp; Hampi Expedition</h3>
          <div class="route-meta"><span>10–16 PEOPLE</span> · <span>EX-PUNE TEMPO</span></div>
          <ul class="route-hl">
            <li>Doorstep AC Tempo Traveller direct from Pune/PCMC</li>
            <li>Kudle to Om Beach cliffside trek timed before dusk</li>
            <li>Murudeshwar Shiva statue &amp; coastal views</li>
            <li>Hampi boulder sunrise &amp; coracle river ride</li>
          </ul>
          <div class="route-actions">
            <button class="btn btn-primary" data-trip="gokarna">Plan this trip</button>
            <button class="btn btn-ghost" style="color:var(--ink-700);border-color:var(--border-light)" data-route="gokarna">View Details</button>
          </div>
        </div>
      </article>

      <!-- Route 3: Kerala -->
      <article class="route-card card" data-id="kerala" data-cats="multi">
        <div class="route-img" data-photo="kerala">
          <img src="img/trip-kerala-800.webp" alt="Kerala backwaters" loading="lazy">
          <span class="route-badge">3 DAYS / 2 NIGHTS</span>
        </div>
        <div class="route-body">
          <h3>Kerala: Munnar, Thekkady &amp; Alleppey Backwaters</h3>
          <div class="route-meta"><span>4–12 PEOPLE</span> · <span>FLIGHT + TEMPO</span></div>
          <ul class="route-hl">
            <li>Red-eye flight in, late flight out: maximized 3 full days</li>
            <li>Kolukkumalai 4x4 sunrise jeeps &amp; Sathram safari</li>
            <li>Traditional Kalaripayattu martial arts show</li>
            <li>Alleppey luxury houseboat backwater cruise</li>
          </ul>
          <div class="route-actions">
            <button class="btn btn-primary" data-trip="kerala">Plan this trip</button>
            <button class="btn btn-ghost" style="color:var(--ink-700);border-color:var(--border-light)" data-route="kerala">View Details</button>
          </div>
        </div>
      </article>

      <!-- Route 4: Goa -->
      <article class="route-card card" data-id="goa" data-cats="weekend">
        <div class="route-img" data-photo="goa">
          <img src="img/trip-goa-800.webp" alt="Goa hidden gems" loading="lazy">
          <span class="route-badge">4 DAYS / 3 NIGHTS</span>
        </div>
        <div class="route-body">
          <h3>Goa Hidden Gems &amp; Private Villa Circuit</h3>
          <div class="route-meta"><span>6–16 PEOPLE</span> · <span>EX-PUNE ROADTRIP</span></div>
          <ul class="route-hl">
            <li>North Goa private pool villa + sundowner spots</li>
            <li>Arambol sweet water lake &amp; cliff walks</li>
            <li>South Goa Cola Lagoon kayak &amp; Butterfly Beach boat</li>
            <li>Fontainhas Latin Quarter heritage food walk</li>
          </ul>
          <div class="route-actions">
            <button class="btn btn-primary" data-trip="goa">Plan this trip</button>
            <button class="btn btn-ghost" style="color:var(--ink-700);border-color:var(--border-light)" data-route="goa">View Details</button>
          </div>
        </div>
      </article>
    </div>
    <p class="note" id="no-trips" hidden style="margin-top:20px;text-align:center">Looking for a custom destination? <a href="#planner" style="color:var(--coral-500);font-weight:700">Tell us where you want to go →</a></p>
  </div>
</section>

<!-- ==========================================================================
     MEDIA REEL (REAL PHOTOS & VIDEOS ONLY)
     ========================================================================== -->
<section class="section-reel" id="road">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker" style="color:#FF9A7B">Authentic Road Footage</span>
      <h2>Zero Stock Photography. Our Actual Expeditions.</h2>
      <p style="color:#94A3B8">Snapshots and video clips from the groups we plan for across Maharashtra, Karnataka, Goa, and Rajasthan.</p>
    </div>
  </div>

  <div class="reel-scroll wrap">
    <div class="reel-item">
      <video muted loop playsinline preload="none" poster="img/poster-waterfall.webp">
        <source src="video/waterfall.mp4" type="video/mp4">
      </video>
      <div class="reel-cap">Waterfall pause, Western Ghats</div>
    </div>
    <div class="reel-item">
      <img src="img/trip-crew-560.webp" alt="The road crew on motorbikes" loading="lazy">
      <div class="reel-cap">The Crew, mid-expedition</div>
    </div>
    <div class="reel-item">
      <video muted loop playsinline preload="none" poster="img/poster-houseboat.webp">
        <source src="video/houseboat.mp4" type="video/mp4">
      </video>
      <div class="reel-cap">Private houseboat, Alleppey</div>
    </div>
    <div class="reel-item">
      <img src="img/reel-statue-520.webp" alt="Shiva statue Murudeshwar" loading="lazy">
      <div class="reel-cap">Murudeshwar coastal cliffs</div>
    </div>
    <div class="reel-item">
      <video muted loop playsinline preload="none" poster="img/poster-hills.webp">
        <source src="video/hills.mp4" type="video/mp4">
      </video>
      <div class="reel-cap">Kolukkumalai hilltops</div>
    </div>
  </div>

  <div class="wrap" style="text-align:center;margin-top:36px">
    <a class="btn btn-ghost" id="ig" target="_blank" rel="noopener">
      <span>See more on Instagram @manav.raut.trips →</span>
    </a>
  </div>
</section>

<!-- ==========================================================================
     FOUNDER SPOTLIGHT — MANAV RAUT
     ========================================================================== -->
<section class="section-founder" id="about">
  <div class="wrap">
    <div class="founder-card">
      <div>
        <span class="kicker">Founder &amp; Expedition Architect</span>
        <h2 style="margin-bottom:16px">"I used to hold the tour guide flag. Here is why I stopped."</h2>
        <p class="founder-quote">"Hi, I'm <strong>Manav Raut</strong>. I spent years in the Indian tourism industry watching agencies herd 40 strangers into cramped buses with rigid 6:00 AM wake-ups and tasteless buffet food. Travel shouldn't feel like high school detention.<br><br>My SOP is simple: <strong>I plan every single trip according to your group.</strong> If your crew wants a private pool villa in Goa with a doorstep AC Tempo Traveller and noon starts, that is what we build. If you want a backpacker hostel circuit with scenic train berths, that is what we deliver. Your budget, your stay style, your pace."</p>
        
        <div class="founder-meta">
          <div class="founder-avatar">MR</div>
          <div class="founder-info">
            <h4>Manav Raut</h4>
            <span>Founder, Raut Expeditions · Pune, Maharashtra</span>
          </div>
        </div>

        <a class="btn btn-wa" data-wa target="_blank" rel="noopener">
          <span>Chat Directly with Manav on WhatsApp →</span>
        </a>
      </div>

      <div class="founder-stats">
        <div class="founder-stat">
          <b>500+</b>
          <span>Travellers Planned For</span>
        </div>
        <div class="founder-stat">
          <b>80K+</b>
          <span>Instagram Community</span>
        </div>
        <div class="founder-stat">
          <b>100%</b>
          <span>Custom Private Groups</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================================================
     CUSTOM 3-STEP TRIP INQUIRY (LEAD CAPTURE)
     ========================================================================== -->
<section class="section-planner" id="planner">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Stop Wasting 15 Hours in Group Chats</span>
      <h2>Request Your Custom Blueprint</h2>
      <p>Tell us your destination, dates, stay preference, and budget. Get your personalized quote within 24 hours.</p>
    </div>

    <div class="planner-wrap">
      <div>
        <form id="form" novalidate>
          <div class="planner-progress">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" id="bar"></div>
            </div>
            <span class="progress-step-text" id="step-label">Step 1 of 3 · Where &amp; when</span>
          </div>

          <!-- Step 1 -->
          <fieldset class="form-step step" data-step="1">
            <legend>Where is your group headed?</legend>
            <div class="choice-grid" role="radiogroup" aria-label="Destination">
              <label class="choice-chip pk"><input type="radio" name="dest" value="Rajasthan"><span>Rajasthan</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Kerala"><span>Kerala</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Goa"><span>Goa</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Hampi–Gokarna"><span>Hampi–Gokarna</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Konkan"><span>Konkan</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Himachal/Uttarakhand"><span>Himachal / Uttarakhand</span></label>
              <label class="choice-chip pk"><input type="radio" name="dest" value="Other"><span>Other</span></label>
            </div>
            <div class="err" data-for="dest"></div>

            <div class="form-inputs" style="margin-top:16px">
              <div class="form-field">
                <label for="from">Departure city</label>
                <input id="from" name="from" type="text" maxlength="40" list="cities" placeholder="e.g. Pune" autocomplete="off">
                <datalist id="cities"><option>Pune</option><option>Mumbai</option><option>Bengaluru</option><option>Delhi</option></datalist>
                <div class="err" data-for="from"></div>
              </div>
              <div class="form-field">
                <label for="when">Travel dates or month</label>
                <input id="when" name="when" type="text" maxlength="40" placeholder="e.g. 15–20 Dec" autocomplete="off">
                <div class="err" data-for="when"></div>
              </div>
            </div>

            <label class="calc-lbl" style="margin-top:16px">Mode of Travel</label>
            <div class="choice-grid" role="radiogroup" aria-label="Mode of travel">
              <label class="choice-chip pk"><input type="radio" name="travel" value="train"><span>Train</span></label>
              <label class="choice-chip pk"><input type="radio" name="travel" value="flight"><span>Flight</span></label>
              <label class="choice-chip pk"><input type="radio" name="travel" value="road"><span>Tempo / Roadtrip</span></label>
              <label class="choice-chip pk"><input type="radio" name="travel" value="flexible"><span>Advise us</span></label>
            </div>
            <div class="err" data-for="travel"></div>

            <label class="calc-lbl" style="margin-top:16px">Trip Duration</label>
            <div class="choice-grid" role="radiogroup" aria-label="Trip length">
              <label class="choice-chip pk"><input type="radio" name="triplen" value="2-3"><span>2–3 days</span></label>
              <label class="choice-chip pk"><input type="radio" name="triplen" value="4-5"><span>4–5 days</span></label>
              <label class="choice-chip pk"><input type="radio" name="triplen" value="6-8"><span>6–8 days</span></label>
              <label class="choice-chip pk"><input type="radio" name="triplen" value="9+"><span>9+ days</span></label>
            </div>
          </fieldset>

          <!-- Step 2 -->
          <fieldset class="form-step step" data-step="2" hidden>
            <legend>Who's going &amp; your budget?</legend>
            <label class="calc-lbl">Group size</label>
            <div class="choice-grid" role="radiogroup" aria-label="Group size">
              <label class="choice-chip pk"><input type="radio" name="group" value="1-2"><span>1–2</span></label>
              <label class="choice-chip pk"><input type="radio" name="group" value="3-6"><span>3–6</span></label>
              <label class="choice-chip pk"><input type="radio" name="group" value="7-12"><span>7–12</span></label>
              <label class="choice-chip pk"><input type="radio" name="group" value="13+"><span>13+</span></label>
            </div>
            <div class="err" data-for="group"></div>

            <label class="calc-lbl" style="margin-top:16px">What service do you need?</label>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
              <label style="display:flex;align-items:center;gap:8px;font-size:0.9rem"><input type="radio" name="service" value="blueprint"> Ready Blueprint PDF <span id="bp-lbl"></span></label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.9rem"><input type="radio" name="service" value="custom" checked> Custom Day-by-Day Itinerary</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.9rem"><input type="radio" name="service" value="complete"> Full Package Execution (Stays + Transit)</label>
            </div>
            <div class="err" data-for="service"></div>

            <label class="calc-lbl">Approximate budget per head</label>
            <div class="choice-grid" role="radiogroup" aria-label="Budget per person">
              <label class="choice-chip pk"><input type="radio" name="budget" value="5-10"><span>₹5k–₹10k</span></label>
              <label class="choice-chip pk"><input type="radio" name="budget" value="10-18"><span>₹10k–₹18k</span></label>
              <label class="choice-chip pk"><input type="radio" name="budget" value="18+"><span>₹18k+</span></label>
            </div>
            <div class="err" data-for="budget"></div>

            <details style="margin-top:16px;background:#FFFFFF;padding:16px;border-radius:var(--radius-md);border:1px solid var(--border-light)">
              <summary style="font-weight:700;font-size:0.88rem;cursor:pointer">More Details (Stay style &amp; notes)</summary>
              <div style="margin-top:14px">
                <label class="calc-lbl">Group type</label>
                <div class="choice-grid"><label class="choice-chip pk"><input type="radio" name="gtype" value="friends"><span>Friends</span></label><label class="choice-chip pk"><input type="radio" name="gtype" value="family"><span>Family</span></label><label class="choice-chip pk"><input type="radio" name="gtype" value="colleagues"><span>Colleagues</span></label></div>

                <label class="calc-lbl" style="margin-top:10px">Stay preference</label>
                <div class="choice-grid"><label class="choice-chip pk"><input type="radio" name="stay" value="budget"><span>Hostel</span></label><label class="choice-chip pk"><input type="radio" name="stay" value="comfort"><span>Hotel</span></label><label class="choice-chip pk"><input type="radio" name="stay" value="premium"><span>Private Villa</span></label></div>

                <div class="form-field" style="margin-top:12px">
                  <label for="notes">Notes / Special Requests</label>
                  <textarea id="notes" name="notes" rows="2" placeholder="e.g. Must have private pool, late mornings, veg food"></textarea>
                </div>
              </div>
            </details>
          </fieldset>

          <!-- Step 3 -->
          <fieldset class="form-step step" data-step="3" hidden>
            <legend>Where should we send your quote?</legend>
            <div class="form-inputs">
              <div class="form-field">
                <label for="name">Your Name</label>
                <input id="name" name="name" type="text" maxlength="60" autocomplete="name" placeholder="First and last name">
                <div class="err" data-for="name"></div>
              </div>
              <div class="form-field">
                <label for="phone">WhatsApp Number</label>
                <input id="phone" name="phone" type="tel" inputmode="tel" maxlength="16" placeholder="10-digit mobile number" autocomplete="tel">
                <div class="err" data-for="phone"></div>
              </div>
            </div>

            <div style="display:none"><input id="website" name="website" type="text" tabindex="-1"></div>

            <div style="margin-top:16px">
              <label style="display:flex;align-items:flex-start;gap:8px;font-size:0.85rem">
                <input type="checkbox" id="consent" checked>
                <span>I agree to be contacted by Manav Raut on WhatsApp regarding this trip quote.</span>
              </label>
              <div class="err" data-for="consent"></div>
            </div>
          </fieldset>

          <div class="form-nav">
            <button type="button" class="btn btn-ghost" id="back" style="color:var(--ink-700);border-color:var(--border-light)" hidden>Back</button>
            <button class="btn btn-primary" type="submit" id="submit">Next Step</button>
          </div>
        </form>

        <!-- Confirmation state -->
        <div class="confirm" id="confirm" hidden tabindex="-1">
          <h3 style="font-size:1.4rem;margin-bottom:12px">Got it, <span id="c-name"></span>! Tap below to finish.</h3>
          <dl id="c-list" style="margin-bottom:20px;font-size:0.9rem;line-height:1.6"></dl>
          <a class="btn btn-wa btn-block" id="c-wa" target="_blank" rel="noopener">
            <span>Send Details to Manav on WhatsApp →</span>
          </a>
          <div class="next" id="next" hidden style="margin-top:16px"></div>
          <button class="btn btn-ghost btn-block" id="c-edit" style="color:var(--ink-700);margin-top:12px" type="button">Edit details</button>
        </div>
      </div>

      <!-- Right Summary Panel -->
      <aside class="planner-summary-box">
        <div>
          <span class="est-tag">LIVE SPECIFICATIONS</span>
          <div class="summary-route">
            <span id="bp-from">Pune</span> ➔ <span id="bp-to">Anywhere</span>
          </div>
          <div class="summary-details">
            <div>Group Size: <b id="bp-group" style="color:#FFF">—</b></div>
            <div>Package Tier: <b id="bp-svc" style="color:#FFF">Custom Plan</b></div>
          </div>
        </div>

        <div>
          <div class="summary-big" id="est-main">Quote in 24 hours</div>
          <p id="est-sub" style="font-size:0.88rem;color:#94A3B8;margin-top:8px">Every itinerary and cost breakdown is custom-engineered around your crew's budget, dates, and stay preference.</p>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- ==========================================================================
     FREQUENTLY ASKED QUESTIONS
     ========================================================================== -->
<section class="section-faq" id="faq">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker">Got Questions?</span>
      <h2>Frequently Asked Questions</h2>
      <p>Everything you need to know about our custom planning process and execution.</p>
    </div>

    <div class="faq-list">
      <details class="faq-item" name="faq">
        <summary>Do you book trains and flights, or just provide numbers?</summary>
        <p>The Blueprint and Custom Plan tiers give you exact train and flight numbers, confirmed IRCTC timings, and optimal flight legs. With a Full Package Execution, our team handles the actual hotel bookings, Tempo Traveller assignments, and tickets directly.</p>
      </details>
      <details class="faq-item" name="faq">
        <summary>Can you organize an AC Tempo Traveller and Private Villa from Pune?</summary>
        <p>Yes, absolutely! Door-to-door pickups from Pune (Kothrud, Viman Nagar, Hinjawadi, PCMC) or Mumbai in 10 to 26 seater Tempo Travellers paired with private pool villas in Goa, Lonavala, Coorg, or Gokarna is our most popular format.</p>
      </details>
      <details class="faq-item" name="faq">
        <summary>How fast will I receive my custom quote &amp; itinerary?</summary>
        <p>Within 24 hours of receiving your confirmed details, complete with a free Day 1 preview and itemized per-head split. One free revision is always included.</p>
      </details>
      <details class="faq-item" name="faq">
        <summary>How do advances and payments work?</summary>
        <p>Full execution packages run on a standard 50% advance to lock down verified stays and private transport. Every line item is completely transparent before you make a transfer, with zero hidden agency markups.</p>
      </details>
      <details class="faq-item" name="faq">
        <summary>Do you cover Himachal, Kasol, and Manali circuits?</summary>
        <p>Yes. We have vetted ground coordinators across Himachal Pradesh, Uttarakhand, and Rajasthan. Select 'Himachal / Uttarakhand' in the planner and we will build it.</p>
      </details>
    </div>
  </div>
</section>

</main>

<!-- ==========================================================================
     MODERN DARK FOOTER
     ========================================================================== -->
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <h3>Raut Expeditions</h3>
        <p style="max-width:440px;line-height:1.6">100% Custom Group Travel from Pune &amp; Mumbai. No rigid tour packages. Engineered around your budget, stay preference, and pace by founder Manav Raut.</p>
        <div style="margin-top:16px;font-size:0.75rem;color:#64748B;letter-spacing:0.08em;font-weight:700">UDYAM MSME REGISTERED · MH-26-0038921</div>
      </div>

      <div class="footer-col">
        <h4>Signature Routes</h4>
        <ul>
          <li><a href="rajasthan-trip-from-pune/">Rajasthan Circuit</a></li>
          <li><a href="kerala-trip-from-pune/">Kerala Backwaters</a></li>
          <li><a href="#routes">Goa Private Villas</a></li>
          <li><a href="#routes">Gokarna &amp; Hampi</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Connect &amp; Talk</h4>
        <ul>
          <li><a id="ig2" target="_blank" rel="noopener">Instagram @manav.raut.trips</a></li>
          <li><a data-wa target="_blank" rel="noopener">WhatsApp Manav</a></li>
          <li><a href="#calculator">Split Configurator</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; <span id="yr"></span> Raut Expeditions. All trips 100% customized around your budget.</span>
      <button data-open="privacy" style="color:#94A3B8;cursor:pointer">Privacy Policy</button>
    </div>
  </div>
</footer>

<!-- Mobile Bottom Bar -->
<nav class="mbar" aria-label="Mobile actions">
  <a class="btn btn-wa btn-block" data-wa target="_blank" rel="noopener">WhatsApp</a>
  <a class="btn btn-primary btn-block" id="mbar-plan" href="#planner">Plan My Trip</a>
</nav>

<!-- Modals & Dialogs (Preserved for full compatibility) -->
<dialog id="d-route" style="border:none;border-radius:20px;padding:32px;max-width:600px;margin:auto;box-shadow:var(--shadow-float);backdrop-filter:blur(10px)">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <h3 id="dr-t" style="font-size:1.3rem"></h3>
    <button data-close style="font-size:1.4rem;cursor:pointer">&times;</button>
  </div>
  <p id="dr-sum" style="color:var(--ink-500);font-size:0.95rem;margin-bottom:16px"></p>
  <ul class="sched" id="dr-days" style="max-height:260px;overflow-y:auto;margin-bottom:20px"></ul>
  <div style="display:flex;gap:12px">
    <button class="btn btn-primary btn-block" id="dr-cta">Plan this route</button>
    <button class="btn btn-ghost btn-block" style="color:var(--ink-700);border-color:var(--border-light)" id="dr-share">Share with group</button>
  </div>
</dialog>

<dialog id="d-zoom" style="border:none;border-radius:16px;padding:24px;max-width:90vw;margin:auto">
  <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3 id="zm-t"></h3><button data-close>&times;</button></div>
  <div id="zm-box"></div>
</dialog>

<dialog id="d-privacy" style="border:none;border-radius:16px;padding:32px;max-width:540px;margin:auto;line-height:1.6">
  <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h3>How We Use Your Details</h3><button data-close>&times;</button></div>
  <p>We collect your name, WhatsApp number, and trip preferences strictly to build your itinerary and quote. We never sell your data or spam you.</p>
</dialog>

<!-- ==========================================================================
     CORE INTERACTIVE JAVASCRIPT LOGIC (SPLIT ENGINE, DELAY SIMULATOR, FORMS)
     ========================================================================== -->
<script>
// Runtime config
const CFG = Object.assign({
  whatsapp: "919822012345",
  instagram: "manav.raut.trips",
  apiBase: "",
  pollMs: 4000, pollMax: 45,
  photos: {},
  siteUrl: "",
  refundPolicy: "",
  reviews: []
}, window.SITE_CONFIG || {});

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const track = (name, data = {}) => { try { window.gtag && gtag("event", name, data); } catch {} };

const waLink = text => "https://wa.me/" + CFG.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

// Static links wiring
$$("[data-wa]").forEach(a => a.href = waLink("Hi Manav! I want to plan a custom trip for my crew."));
$("#ig").href = $("#ig2").href = "https://instagram.com/" + CFG.instagram;
$("#yr").textContent = new Date().getFullYear();

// Burger toggle
const burger = $("#burger"), links = $("#links");
if (burger && links) {
  burger.onclick = () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  };
  links.onclick = e => {
    if (e.target.closest("a")) {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  };
}

// Sample Days Switcher
const DAYS = [
  { day: "Day 5 · Jodhpur", title: "Desert highway, zip-line, departure", leg: "Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.", note: "Drop Jaswant Thada. Protect the zip-line and the 22:00 train.",
    rows: [["08:00", "Breakfast and camp checkout", "eat"], ["08:30", "Depart for Jodhpur via NH125: 280–285 km, 4.5–6 hours"], ["14:30", "Flying Fox zip-line at Mehrangarh. Book the earliest slot", "stop", "Operates 09:30–17:00 only. 90–120 min tour"], ["17:00", "Jaswant Thada, a quick visit", "cut"], ["19:00", "Dinner at Stepwell Square (Toorji Ka Jhalra)", "eat"], ["20:30", "Drop at Jodhpur Junction, with a real buffer"], ["22:00", "Board train 20495 to Pune", "stop", "Confirmed on IRCTC"]] },
  { day: "Day 3 · Jaipur → Jaisalmer", title: "Pink City by day, desert train by night", leg: "Train 12468: Jaipur Jn 16:25 → Jaisalmer 05:05 next day.", note: "Drop Nahargarh. Keep the 15:30 start for the station.",
    rows: [["09:00", "City Palace and Jantar Mantar"], ["12:30", "Lunch at Nahargarh Fort with a skyline view", "cut"], ["15:30", "Head to Jaipur Junction with luggage, leaving margin for winding road"], ["16:25", "Board train 12468 to Jaisalmer. Overnight on board", "stop", "Confirmed on IRCTC"]] },
  { day: "Day 3 · Thekkady → Alleppey → Kochi", title: "Backwaters, then the airport on time", leg: "Flight Kochi → Pune at 23:04. Reach the airport by 18:30.", note: "Drop Kumarakom and the lighthouse. Leave Alleppey by 16:30 sharp.",
    rows: [["07:00", "Local breakfast near the homestay, then checkout", "eat"], ["08:00", "Depart Thekkady for Alleppey via Changanassery: 138 km, about 3.5 hours"], ["11:30", "Alleppey Beach. No swimming in monsoon"], ["12:30", "Alappuzha Lighthouse. Cash only", "cut"], ["13:30", "Kumarakom Bird Sanctuary and boat ride", "cut"], ["15:00", "Lunch at Asado Cafe: karimeen pollichathu", "eat"], ["16:30", "Depart Alleppey for Kochi Airport (83 km, about 2 hours)", "stop", "Flight at 23:04. Reach airport by 18:30"]] }
];

function renderDay(i) {
  const d = DAYS[i], mk = (t, c, x) => Object.assign(document.createElement(t), { className: c || "", textContent: x || "" });
  $$(".daytab").forEach(b => b.setAttribute("aria-selected", +b.dataset.day === i));
  $("#t-day").textContent = d.day; $("#t-title").textContent = d.title; $("#late-note").textContent = d.note;
  $("#t-leg").replaceChildren(mk("b", "", "Transit leg: "), d.leg);
  $("#t-sched").replaceChildren(...d.rows.map(([time, what, kind, small]) => {
    const li = document.createElement("li"), body = document.createElement("span");
    li.append(mk("time", "", time));
    if (kind === "eat") body.append(mk("span", "tag eat", "EAT"));
    if (kind === "stop") body.append(mk("span", "tag stop", "HARD STOP"));
    if (kind === "cut") { body.append(mk("span", "tag cut", "CUT")); li.dataset.cut = ""; }
    body.append(mk("span", "what", what));
    if (small) body.append(mk("small", "", " (" + small + ")"));
    li.append(body);
    return li;
  }));
}
$$(".daytab").forEach((b, idx) => b.onclick = () => renderDay(idx));

// Delay Simulator Directives
const DIRECTIVES = {
  0: { label: "On Time (0 min)", text: "All legs green. Mehrangarh zip-line at 14:30, Jaswant Thada at 17:00, relaxed dinner at Stepwell Square, train 20495 confirmed at 22:00.", isLate: false },
  30: { label: "+30 min buffer", text: "Manageable. We squeeze lunch by 20 mins and enter Mehrangarh by 15:00. Flying Fox zip-line is 100% protected.", isLate: false },
  60: { label: "+60 min delay", text: "⚠️ Caution: Zip-line takes 100 minutes. We flag Jaswant Thada as candidate for cut to preserve the 22:00 train buffer.", isLate: true },
  90: { label: "+90 min delay", text: "✂️ CUT TRIGGERED: Jaswant Thada dropped! Driver takes NH125 bypass straight to Toorji dinner to protect the 22:00 train.", isLate: true },
  120: { label: "+120 min emergency", text: "🚨 EMERGENCY PROTOCOL: Skip sitting dinner; grab packed kachoris en route. Direct drop at Jodhpur Jn by 20:30. Never gamble with train 20495.", isLate: true }
};

$$(".delay-chip").forEach(chip => {
  chip.onclick = () => {
    $$(".delay-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const delay = +chip.dataset.delay;
    const info = DIRECTIVES[delay];
    $("#delay-status-text").textContent = info.label;
    $("#delay-directive").textContent = info.text;
    $("#ticket").classList.toggle("is-late", info.isLate);
  };
});

// Group Split Engine
const CALC_ROUTES = {
  rajasthan: { name: "Rajasthan Circuit", destKey: "Rajasthan", days: 6, nights: 5, baseTransitTempo: 48000, baseTrainPerHead: 2400, baseFlightPerHead: 7500, baseSelfDriveTotal: 18000, stays: { hotel: 1400, villa: 2200, hostel: 750 }, activities: 1400, buffer: 800 },
  gokarna: { name: "Gokarna & Hampi", destKey: "Hampi–Gokarna", days: 5, nights: 4, baseTransitTempo: 42000, baseTrainPerHead: 1900, baseFlightPerHead: 6800, baseSelfDriveTotal: 15000, stays: { hotel: 1250, villa: 1950, hostel: 700 }, activities: 900, buffer: 700 },
  kerala: { name: "Kerala Backwaters", destKey: "Kerala", days: 3, nights: 2, baseTransitTempo: 28000, baseTrainPerHead: 2200, baseFlightPerHead: 8200, baseSelfDriveTotal: 14000, stays: { hotel: 1600, villa: 2500, hostel: 850 }, activities: 1200, buffer: 600 },
  goa: { name: "Goa Hidden Gems", destKey: "Goa", days: 4, nights: 3, baseTransitTempo: 32000, baseTrainPerHead: 1400, baseFlightPerHead: 6200, baseSelfDriveTotal: 12000, stays: { hotel: 1300, villa: 2400, hostel: 700 }, activities: 800, buffer: 600 },
  himachal: { name: "Himachal / Uttarakhand", destKey: "Himachal/Uttarakhand", days: 7, nights: 6, baseTransitTempo: 58000, baseTrainPerHead: 2800, baseFlightPerHead: 9000, baseSelfDriveTotal: 22000, stays: { hotel: 1500, villa: 2600, hostel: 800 }, activities: 1600, buffer: 1000 }
};

let currentCalcRoute = "rajasthan";
let currentCalcStay = "hotel";
let currentCalcTrans = "tempo";

function updateSplitCalc() {
  const route = CALC_ROUTES[currentCalcRoute];
  const slider = $("#group-slider");
  if (!slider) return;
  const group = +slider.value;
  $("#slider-count").textContent = group + " Travellers";

  const vFit = $("#vehicle-fit");
  if (currentCalcTrans === "tempo") {
    if (group <= 6) vFit.textContent = "🚗 SUV / Ertiga Private Fit";
    else if (group <= 9) vFit.textContent = "🚐 10-Seater Tempo Traveller Fit";
    else if (group <= 13) vFit.textContent = "⭐ Perfect 12-Seater AC Tempo Traveller Fit";
    else vFit.textContent = "🚌 16-17 Seater Cruiser Fit";
  } else if (currentCalcTrans === "train") {
    vFit.textContent = "🚆 IRCTC Train Sleeper / 3AC + Local Auto/Cabs";
  } else if (currentCalcTrans === "flight") {
    vFit.textContent = "✈️ Flight Connections + Local Sightseeing Cabs";
  } else {
    vFit.textContent = "🚗 Private Roadtrip Convoy (" + Math.ceil(group / 4) + " Cars)";
  }

  let transitPerHead = 0, transitLabel = "";
  if (currentCalcTrans === "tempo") {
    transitPerHead = Math.round(route.baseTransitTempo / group);
    transitLabel = "🚐 Private Tempo Traveller + Fuel + Tolls";
  } else if (currentCalcTrans === "train") {
    transitPerHead = route.baseTrainPerHead;
    transitLabel = "🚆 IRCTC Train Legs + Station Cabs";
  } else if (currentCalcTrans === "flight") {
    transitPerHead = route.baseFlightPerHead;
    transitLabel = "✈️ Flight Estimate + Airport Transfers";
  } else {
    transitPerHead = Math.round(route.baseSelfDriveTotal / group);
    transitLabel = "🚗 Self-Drive Fuel, Tolls & Parking Share";
  }

  const stayPerNight = route.stays[currentCalcStay] || 1400;
  const staysPerHead = stayPerNight * route.nights;
  let stayLabel = "";
  if (currentCalcStay === "villa") stayLabel = "🏡 Private Pool Villa / Homestay Share";
  else if (currentCalcStay === "hostel") stayLabel = "🎒 Backpacker Hostel Bunk Dorms";
  else stayLabel = "🏨 Verified 3★/4★ AC Hotel & Breakfast";

  const activitiesPerHead = route.activities;
  const bufferPerHead = route.buffer;
  const totalPerHead = transitPerHead + staysPerHead + activitiesPerHead + bufferPerHead;
  const totalGroupPool = totalPerHead * group;

  $("#per-head-amt").textContent = totalPerHead.toLocaleString("en-IN");
  $("#total-pool-amt").textContent = "₹" + totalGroupPool.toLocaleString("en-IN");
  $("#label-transit").textContent = transitLabel;
  $("#item-transit").textContent = "₹" + transitPerHead.toLocaleString("en-IN") + " / head";
  $("#label-stays").textContent = stayLabel;
  $("#item-stays").textContent = "₹" + staysPerHead.toLocaleString("en-IN") + " / head";
  $("#item-passes").textContent = "₹" + activitiesPerHead.toLocaleString("en-IN") + " / head";
  $("#item-buffer").textContent = "₹" + bufferPerHead.toLocaleString("en-IN") + " / head";
}

$$(".calc-pill").forEach(p => {
  p.onclick = () => {
    $$(".calc-pill").forEach(x => x.classList.remove("active"));
    p.classList.add("active");
    currentCalcRoute = p.dataset.dest;
    updateSplitCalc();
  };
});

const groupSliderEl = $("#group-slider");
if (groupSliderEl) groupSliderEl.oninput = updateSplitCalc;

$$('input[name="calc-stay"]').forEach(input => {
  input.closest(".calc-radio").onclick = () => {
    $$('input[name="calc-stay"]').forEach(i => i.closest(".calc-radio").classList.remove("active"));
    input.closest(".calc-radio").classList.add("active");
    currentCalcStay = input.value;
    updateSplitCalc();
  };
});

$$('input[name="calc-trans"]').forEach(input => {
  input.closest(".calc-radio").onclick = () => {
    $$('input[name="calc-trans"]').forEach(i => i.closest(".calc-radio").classList.remove("active"));
    input.closest(".calc-radio").classList.add("active");
    currentCalcTrans = input.value;
    updateSplitCalc();
  };
});

// Copy Pitch Button
const copyBtn = $("#copy-split-btn");
if (copyBtn) {
  copyBtn.onclick = async () => {
    const route = CALC_ROUTES[currentCalcRoute];
    const group = +$("#group-slider").value;
    const perHead = $("#per-head-amt").textContent;
    const stayLabel = currentCalcStay === "villa" ? "Private Pool Villa" : currentCalcStay === "hostel" ? "Social Hostels" : "3★/4★ Hotel";
    const transLabel = currentCalcTrans === "tempo" ? "Doorstep AC Tempo" : currentCalcTrans === "train" ? "IRCTC Train + Cabs" : currentCalcTrans === "flight" ? "Flight + Cabs" : "Roadtrip Convoy";

    const pitch = [
      "🏔️ *Custom Group Plan by Manav Raut (Raut Expeditions)*",
      "📍 *Route:* " + route.name + " (" + route.days + "D/" + route.nights + "N)",
      "👥 *Group:* " + group + " Travellers",
      "🏨 *Stay Preference:* " + stayLabel,
      "🚐 *Transportation:* " + transLabel,
      "💰 *Estimated Split:* ₹" + perHead + " / person",
      "",
      "*Per-person breakdown:*",
      "• Transit: " + $("#item-transit").textContent,
      "• Stays: " + $("#item-stays").textContent,
      "• Passes: " + $("#item-passes").textContent,
      "• Delay Buffer: " + $("#item-buffer").textContent,
      "",
      "100% Customized around our budget & dates.",
      "Details: " + location.href.split("#")[0]
    ].join("\\n");

    try {
      await navigator.clipboard.writeText(pitch);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = "<span>✅ Copied to Clipboard!</span>";
      setTimeout(() => { copyBtn.innerHTML = orig; }, 3000);
    } catch {
      window.open(waLink(pitch), "_blank");
    }
  };
}

const calcPlanBtn = $("#calc-plan-btn");
if (calcPlanBtn) {
  calcPlanBtn.onclick = () => {
    const route = CALC_ROUTES[currentCalcRoute];
    plan("custom", route.destKey);
  };
}

updateSplitCalc();

// Trips data for modals
const TRIPS = {
  rajasthan: { title: "Rajasthan Circuit: Jaipur → Jaisalmer → Jodhpur", dest: "Rajasthan", sum: "6 Days / 5 Nights · Group package quoted around your budget", days: ["Day 1: Overnight train 12955 to Jaipur", "Day 2: Jaipur: Amer Fort & Sheesh Mahal, street-food crawl", "Day 3: City Palace, Jantar Mantar, train 12468 to Jaisalmer", "Day 4: Jaisalmer Fort, Kuldhara, Sam Sand Dunes camp", "Day 5: Drive to Jodhpur (NH125), Flying Fox at Mehrangarh, train 20495 to Pune", "Day 6: Arrive Pune Junction"] },
  gokarna: { title: "Gokarna → Murudeshwar → Hampi (Ex-Pune)", dest: "Hampi–Gokarna", sum: "5 Days / 4 Nights · Group package quoted around your budget", days: ["Day 1: Overnight AC Tempo drive from Pune/PCMC", "Day 2: Gokarna Kudle & Om Beach cliff trek", "Day 3: Murudeshwar viewpoint → Hampi", "Day 4: Hampi boulder sunrise + coracle ride", "Day 5: Return to Pune"] },
  kerala: { title: "Kerala: Munnar, Thekkady & Alleppey", dest: "Kerala", sum: "3 Days / 2 Nights · Group package quoted around your budget", days: ["Day 1: Land Kochi 03:30, drive to Munnar: Tea Museum & Top Station", "Day 2: Kolukkumalai sunrise jeeps, Sathram jungle safari", "Day 3: Alleppey houseboat cruise, Kochi airport by 18:30"] },
  goa: { title: "Goa Hidden Gems & Private Villa Circuit", dest: "Goa", sum: "4 Days / 3 Nights · Group package quoted around your budget", days: ["Day 1: Pune → North Goa private villa, sundowners", "Day 2: Arambol sweet water lake & sunset", "Day 3: South Goa Cola Lagoon & Butterfly Beach", "Day 4: Fontainhas walk → return to Pune"] }
};

// Route filters
$$(".tab").forEach(tab => tab.onclick = () => {
  $$(".tab").forEach(x => x.setAttribute("aria-selected", x === tab));
  $$("#trips .card").forEach(c => {
    const ok = tab.dataset.f === "all" || c.dataset.cats.split(" ").includes(tab.dataset.f);
    c.hidden = !ok;
  });
  $("#no-trips").hidden = !(tab.dataset.f === "north");
});

// Dialogs
$$("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); }));
$$("[data-open=privacy]").forEach(b => b.onclick = () => $("#d-privacy").showModal());
$$("[data-route]").forEach(b => {
  b.onclick = () => {
    const t = TRIPS[b.dataset.route];
    $("#dr-t").textContent = t.title;
    $("#dr-sum").textContent = t.sum;
    $("#dr-days").replaceChildren(...t.days.map(x => Object.assign(document.createElement("li"), { textContent: x })));
    $("#dr-cta").onclick = () => { $("#d-route").close(); plan("custom", t.dest); };
    $("#dr-share").onclick = () => window.open(waLink("Check out this " + t.title + " trip by Manav Raut: " + location.href), "_blank");
    $("#d-route").showModal();
  };
});

// Planner Form Handlers
const form = $("#form");
function plan(service, dest) {
  if (service) form.elements.service.value = service;
  if (dest) form.elements.dest.value = dest;
  form.hidden = false; $("#confirm").hidden = true; gotoStep(1);
  $("#planner").scrollIntoView({ behavior: "smooth" });
}

$$("[data-plan]").forEach(b => b.onclick = () => plan(b.dataset.plan));
$$("[data-trip]").forEach(b => b.onclick = () => plan("custom", TRIPS[b.dataset.trip].dest));

const STEPS = [null, ["dest", "from", "when", "travel"], ["group", "service", "budget"], ["name", "phone", "consent"]];
const STEP_LABEL = ["", "Where & when", "Who's going", "Where to send it"];
let step = 1;

function gotoStep(n) {
  step = n;
  $$(".step", form).forEach(f => f.hidden = +f.dataset.step !== n);
  $("#bar").style.width = (n / 3 * 100) + "%";
  $("#step-label").textContent = "Step " + n + " of 3 · " + STEP_LABEL[n];
  $("#back").hidden = n === 1;
  $("#submit").textContent = n === 3 ? "Get My Firm Quote" : "Next Step";
}
$("#back").onclick = () => gotoStep(step - 1);

function updateEst() {
  const v = form.elements;
  $("#bp-from").textContent = v.from.value.trim().slice(0, 14) || "Pune";
  $("#bp-to").textContent = v.dest.value || "Anywhere";
  $("#bp-group").textContent = v.group.value || "—";
}
form.addEventListener("input", updateEst);

form.addEventListener("submit", ev => {
  ev.preventDefault();
  const f = form.elements;
  if (step === 1) {
    if (!f.dest.value) return alert("Please select a destination");
    gotoStep(2); return;
  }
  if (step === 2) {
    if (!f.group.value) return alert("Please select group size");
    gotoStep(3); return;
  }
  if (step === 3) {
    if (!f.name.value.trim()) return alert("Please enter your name");
    if (!f.phone.value.trim()) return alert("Please enter your WhatsApp number");
    
    const rows = [
      ["Name", f.name.value],
      ["WhatsApp", f.phone.value],
      ["Destination", f.dest.value],
      ["From", f.from.value || "Pune"],
      ["Dates", f.when.value || "Upcoming"],
      ["Group Size", f.group.value],
      ["Budget", f.budget.value || "Custom"]
    ];

    $("#c-name").textContent = f.name.value.split(" ")[0];
    $("#c-list").replaceChildren(...rows.map(([k, val]) => {
      const p = document.createElement("div");
      p.innerHTML = "<b>" + k + ":</b> " + val;
      return p;
    }));

    const waMsg = [
      "Hi Manav! I'd like a custom trip quote for my crew:",
      ...rows.map(([k, val]) => "• *" + k + ":* " + val),
      "",
      "Please send me the day-by-day plan and split sheet."
    ].join("\\n");

    $("#c-wa").href = waLink(waMsg);
    form.hidden = true;
    $("#confirm").hidden = false;
    $("#confirm").scrollIntoView({ behavior: "smooth" });
  }
});

$("#c-edit").onclick = () => { form.hidden = false; $("#confirm").hidden = true; gotoStep(1); };
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), htmlContent, 'utf8');
console.log('Successfully wrote modern index.html!');
