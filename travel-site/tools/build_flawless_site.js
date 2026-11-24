const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>document.documentElement.classList.add('js')</script>

  <title>Raut Expeditions | Custom Group Travel from Pune &amp; Mumbai</title>
  <meta name="description" content="Custom group trips tailored to your crew. You choose your budget, stay preference (Private Pool Villa, Hotel, or Hostel), and transport (Tempo Traveller, Train, or Flight). Handcrafted by founder Manav Raut.">
  <link rel="canonical" href="https://rautexpeditions.com/">

  <!-- Favicon -->
  <link rel="shortcut icon" href="favicon.svg" type="image/svg+xml">

  <!-- Remixicons CDN -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">

  <!-- Swiper CSS -->
  <link rel="stylesheet" href="swiper-bundle.min.css">

  <!-- Google Fonts: Plus Jakarta Sans & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
  /*==================== 2026 MODERN TRAVEL-TECH DESIGN SYSTEM ====================*/
  :root {
    --header-height: 4.25rem;

    /* Base Palette: Clean, High-Contrast Modern Travel (Light Mode Default) */
    --hue: 200;
    --body-bg: #F8FAFC;
    --card-bg: #FFFFFF;
    --card-subtle: #F1F5F9;
    --border-color: #E2E8F0;
    --border-subtle: #EDF2F7;

    /* Typography */
    --font-heading: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    --font-mono: 'Inter', ui-monospace, SFMono-Regular, monospace;

    --title-color: #0F172A;
    --text-color: #334155;
    --text-muted: #64748B;
    --text-light: #94A3B8;

    /* Accents */
    --primary-color: #0F766E;
    --primary-light: #CCFBF1;
    --primary-dark: #115E59;

    --coral-color: #FF5533;
    --coral-hover: #E64524;
    --coral-gradient: linear-gradient(135deg, #FF5533 0%, #FF7A59 100%);
    --coral-subtle: rgba(255, 85, 51, 0.08);
    --coral-glow: 0 8px 24px -4px rgba(255, 85, 51, 0.4);

    --wa-color: #25D366;
    --wa-hover: #20BA5A;

    /* Spacing & Radii */
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
    --shadow-md: 0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
    --shadow-lg: 0 16px 36px -6px rgba(15, 23, 42, 0.08), 0 6px 12px -2px rgba(15, 23, 42, 0.03);
    --shadow-float: 0 24px 48px -10px rgba(15, 23, 42, 0.16);

    --transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /*==================== DARK THEME ====================*/
  body.dark-theme {
    --body-bg: #090D16;
    --card-bg: #111827;
    --card-subtle: #1F2937;
    --border-color: rgba(255, 255, 255, 0.09);
    --border-subtle: rgba(255, 255, 255, 0.05);

    --title-color: #F8FAFC;
    --text-color: #CBD5E1;
    --text-muted: #94A3B8;
    --text-light: #64748B;

    --primary-color: #14B8A6;
    --primary-light: rgba(20, 184, 166, 0.15);
    --primary-dark: #0D9488;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 16px 36px -6px rgba(0, 0, 0, 0.6);
    --shadow-float: 0 24px 48px -10px rgba(0, 0, 0, 0.8);
  }

  /* Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: calc(var(--header-height) + 1.5rem);
  }

  body {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    background-color: var(--body-bg);
    color: var(--text-color);
    overflow-x: hidden;
    transition: background-color 0.3s, color 0.3s;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-heading);
    color: var(--title-color);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img, video {
    max-width: 100%;
    display: block;
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: 1rem;
    border: none;
    outline: none;
  }

  button {
    cursor: pointer;
  }

  .container {
    width: min(1200px, calc(100% - 40px));
    margin-inline: auto;
  }

  .section {
    padding: 96px 0;
  }

  .section-head {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 52px;
  }

  .section-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--coral-color);
    margin-bottom: 12px;
  }

  .section-title {
    font-size: clamp(2rem, 3.8vw, 2.75rem);
    margin-bottom: 16px;
  }

  .section-desc {
    font-size: 1.05rem;
    color: var(--text-muted);
    line-height: 1.65;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 26px;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: var(--radius-full);
    transition: var(--transition);
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--coral-gradient);
    color: #FFFFFF;
    box-shadow: var(--coral-glow);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px -4px rgba(255, 85, 51, 0.5);
  }

  .btn-secondary {
    background: var(--card-subtle);
    color: var(--title-color);
    border: 1px solid var(--border-color);
  }

  .btn-secondary:hover {
    background: var(--card-bg);
    border-color: var(--coral-color);
    color: var(--coral-color);
    transform: translateY(-2px);
  }

  .btn-ghost {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
  }

  .btn-ghost:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  .btn-wa {
    background-color: var(--wa-color);
    color: #FFFFFF;
    box-shadow: 0 6px 20px -3px rgba(37, 211, 102, 0.4);
  }

  .btn-wa:hover {
    background-color: var(--wa-hover);
    transform: translateY(-2px);
  }

  .btn-block {
    width: 100%;
  }

  /* Pulse Dot */
  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #22C55E;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }

  /*==================== HEADER & NAVBAR ====================*/
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    transition: background-color 0.3s, backdrop-filter 0.3s, box-shadow 0.3s;
  }

  .navbar {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .brand-logo-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--coral-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 1.25rem;
    box-shadow: 0 4px 12px rgba(255, 85, 51, 0.3);
  }

  .brand-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .brand-tag {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--coral-color);
  }

  .nav-menu {
    display: flex;
    align-items: center;
  }

  .nav-list {
    display: flex;
    align-items: center;
    gap: 1.75rem;
    list-style: none;
  }

  .nav-link {
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
    transition: color 0.2s;
    white-space: nowrap;
  }

  .nav-link:hover, .nav-link.active-link {
    color: #FFFFFF;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .theme-toggle-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    cursor: pointer;
    transition: var(--transition);
  }

  .theme-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(20deg);
  }

  .nav-wa-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(37, 211, 102, 0.16);
    color: #25D366;
    border: 1px solid rgba(37, 211, 102, 0.35);
    border-radius: var(--radius-full);
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .nav-wa-pill:hover {
    background: #25D366;
    color: #FFFFFF;
  }

  .burger-btn {
    display: none;
    font-size: 1.4rem;
    color: #FFFFFF;
    background: none;
    cursor: pointer;
  }

  /* Scrolled State */
  .header.scrolled {
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  }

  body.dark-theme .header.scrolled {
    background: rgba(17, 24, 39, 0.94);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .header.scrolled .brand-title {
    color: var(--title-color);
  }

  .header.scrolled .nav-link {
    color: var(--text-color);
  }

  .header.scrolled .nav-link:hover, 
  .header.scrolled .nav-link.active-link {
    color: var(--coral-color);
  }

  .header.scrolled .theme-toggle-btn {
    background: var(--card-subtle);
    color: var(--title-color);
  }

  .header.scrolled .burger-btn {
    color: var(--title-color);
  }

  @media screen and (max-width: 990px) {
    .nav-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: min(320px, 80%);
      height: 100vh;
      background: var(--card-bg);
      box-shadow: var(--shadow-float);
      padding: 5rem 2rem 2rem;
      transition: right 0.35s ease;
      z-index: 1001;
      border-left: 1px solid var(--border-color);
    }
    .nav-menu.open {
      right: 0;
    }
    .nav-list {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .nav-link {
      font-size: 1.05rem;
      color: var(--title-color);
    }
    .burger-btn {
      display: block;
    }
    .nav-close-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.5rem;
      color: var(--title-color);
      background: none;
    }
  }

  /*==================== HERO SECTION ====================*/
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    background-color: #070A12;
    overflow: hidden;
    padding-top: var(--header-height);
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 50% 15%, rgba(255, 85, 51, 0.22) 0%, transparent 60%),
      radial-gradient(circle at 85% 40%, rgba(13, 148, 136, 0.16) 0%, transparent 50%),
      linear-gradient(180deg, rgba(7, 10, 18, 0.45) 0%, rgba(7, 10, 18, 0.9) 100%),
      url('img/trip-sunset-560.webp') center/cover no-repeat;
    opacity: 0.94;
    filter: saturate(1.1);
  }

  .hero-container {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 40px;
    align-items: center;
    padding: 60px 0 80px;
  }

  @media screen and (max-width: 960px) {
    .hero-container {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #FF9A7B;
    margin-bottom: 24px;
    backdrop-filter: blur(8px);
  }

  .hero-title {
    font-size: clamp(2.4rem, 5vw, 4rem);
    color: #FFFFFF;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 20px;
  }

  .hero-title span {
    background: linear-gradient(135deg, #FF5533 0%, #FF9A7B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-desc {
    font-size: clamp(1rem, 1.8vw, 1.18rem);
    color: #CBD5E1;
    line-height: 1.65;
    margin-bottom: 32px;
    max-width: 580px;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  @media screen and (max-width: 960px) {
    .hero-actions {
      justify-content: center;
    }
  }

  /* Hero Floating Configurator Card (Trip Architect) */
  .hero-card {
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-xl);
    padding: 32px;
    box-shadow: var(--shadow-float);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #0F172A;
  }

  body.dark-theme .hero-card {
    background: rgba(17, 24, 39, 0.94);
    border-color: rgba(255, 255, 255, 0.1);
    color: #F8FAFC;
  }

  .hero-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;
  }

  .hero-card-title {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .hero-card-sub {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .hero-card-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 22px;
  }

  .hero-input-box {
    background: var(--card-subtle);
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    transition: var(--transition);
  }

  .hero-input-box:hover {
    border-color: var(--coral-color);
  }

  .hero-box-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .hero-box-val {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--title-color);
  }

  .hero-card-footer {
    background: #0B0F19;
    color: #FFFFFF;
    border-radius: var(--radius-md);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero-est-amt {
    font-size: 1.5rem;
    font-weight: 800;
    color: #FF5533;
  }

  .hero-est-amt span {
    font-size: 0.8rem;
    color: #94A3B8;
    font-weight: 500;
  }

  /*==================== HOW IT WORKS / COMPARISON ====================*/
  .compare-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }

  @media screen and (max-width: 820px) {
    .compare-grid {
      grid-template-columns: 1fr;
    }
  }

  .compare-card {
    border-radius: var(--radius-xl);
    padding: 36px;
    display: flex;
    flex-direction: column;
  }

  .compare-bad {
    background: var(--card-subtle);
    border: 1px solid var(--border-color);
  }

  .compare-good {
    background: var(--card-bg);
    border: 2px solid var(--coral-color);
    box-shadow: 0 16px 36px -6px rgba(255, 85, 51, 0.15);
  }

  .compare-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    border-radius: var(--radius-full);
    width: fit-content;
    margin-bottom: 20px;
  }

  .compare-bad .compare-badge {
    background: #FEE2E2;
    color: #DC2626;
  }

  .compare-good .compare-badge {
    background: var(--coral-color);
    color: #FFFFFF;
  }

  .compare-card h3 {
    font-size: 1.45rem;
    margin-bottom: 12px;
  }

  .compare-card p.lead-text {
    font-size: 0.95rem;
    color: var(--text-muted);
    margin-bottom: 24px;
  }

  .compare-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .compare-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .compare-list i {
    font-size: 1.15rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .compare-bad i {
    color: #EF4444;
  }

  .compare-good i {
    color: #10B981;
  }

  /*==================== 3D DISCOVER SWIPER ====================*/
  .discover-section {
    background-color: var(--card-subtle);
    overflow: hidden;
  }

  .discover__container {
    padding: 32px 0 48px;
    overflow: hidden;
  }

  .discover__card {
    position: relative;
    width: 270px;
    height: 380px;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    cursor: pointer;
  }

  .discover__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .discover__card:hover .discover__img {
    transform: scale(1.08);
  }

  .discover__card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(7, 10, 18, 0.9) 100%);
  }

  .discover__data {
    position: absolute;
    bottom: 24px;
    left: 20px;
    right: 20px;
    z-index: 2;
    color: #FFFFFF;
  }

  .discover__badge {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #FF9A7B;
    margin-bottom: 4px;
    display: block;
  }

  .discover__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #FFFFFF;
    margin-bottom: 4px;
  }

  .discover__desc {
    font-size: 0.82rem;
    color: #CBD5E1;
  }

  /*==================== STAYS & TRANSPORT TABS & CARDS ====================*/
  .tabs-nav {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 10px 24px;
    border-radius: var(--radius-full);
    font-size: 0.92rem;
    font-weight: 700;
    background: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    transition: var(--transition);
  }

  .tab-btn.active {
    background: var(--coral-color);
    color: #FFFFFF;
    border-color: var(--coral-color);
    box-shadow: 0 4px 14px rgba(255, 85, 51, 0.3);
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 28px;
  }

  .place-card {
    position: relative;
    height: 360px;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    background-color: #0F172A;
  }

  .place-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .place-card:hover .place-card-img {
    transform: scale(1.08);
  }

  .place-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7, 10, 18, 0.15) 0%, rgba(7, 10, 18, 0.92) 100%);
  }

  .place-card-content {
    position: absolute;
    inset: 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 2;
    color: #FFFFFF;
  }

  .place-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .place-type-pill {
    padding: 5px 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .place-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(15, 23, 42, 0.7);
    padding: 4px 10px;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .place-rating i {
    color: #F59E0B;
  }

  .place-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #FFFFFF;
    margin-bottom: 4px;
  }

  .place-sub {
    font-size: 0.85rem;
    color: #CBD5E1;
    margin-bottom: 8px;
  }

  .place-price {
    font-size: 1.25rem;
    font-weight: 800;
    color: #FF7A59;
  }

  .place-arrow-btn {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-xl) 0 var(--radius-xl) 0;
    background: var(--coral-gradient);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    transition: var(--transition);
  }

  .place-card:hover .place-arrow-btn {
    background: var(--coral-color);
    transform: scale(1.05);
  }

  /*==================== SPLIT CALCULATOR ====================*/
  .calc-box {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 44px;
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 40px;
    box-shadow: var(--shadow-lg);
  }

  @media screen and (max-width: 900px) {
    .calc-box {
      grid-template-columns: 1fr;
      padding: 24px;
    }
  }

  .calc-field {
    margin-bottom: 24px;
  }

  .calc-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--title-color);
    margin-bottom: 12px;
  }

  .calc-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .calc-pill {
    padding: 8px 18px;
    font-size: 0.86rem;
    font-weight: 600;
    border-radius: var(--radius-full);
    background: var(--card-subtle);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    transition: var(--transition);
  }

  .calc-pill.active {
    background: #0F172A;
    color: #FFFFFF;
    border-color: #0F172A;
  }

  body.dark-theme .calc-pill.active {
    background: var(--coral-color);
    border-color: var(--coral-color);
  }

  .calc-slider {
    width: 100%;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--border-color);
    outline: none;
    cursor: pointer;
    margin: 12px 0 8px;
    -webkit-appearance: none;
  }

  .calc-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--coral-color);
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 10px rgba(255, 85, 51, 0.4);
    cursor: pointer;
  }

  .calc-chip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
  }

  .calc-chip {
    padding: 12px 14px;
    background: var(--card-subtle);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
  }

  .calc-chip input {
    position: absolute;
    opacity: 0;
  }

  .calc-chip.active {
    background: var(--card-bg);
    border-color: var(--coral-color);
    color: var(--coral-color);
    box-shadow: 0 4px 14px rgba(255, 85, 51, 0.15);
  }

  /* Output Card */
  .calc-output {
    background: linear-gradient(180deg, #0B0F19 0%, #070A12 100%);
    color: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .calc-output-head {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .calc-output-tag {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #FF9A7B;
  }

  .calc-per-person {
    font-size: 2.6rem;
    font-weight: 800;
    color: #FFFFFF;
    margin: 6px 0 8px;
    letter-spacing: -0.03em;
  }

  .calc-per-person span {
    color: var(--coral-color);
  }

  .calc-per-person small {
    font-size: 0.95rem;
    color: #94A3B8;
    font-weight: 500;
  }

  .calc-pool-text {
    font-size: 0.88rem;
    color: #CBD5E1;
  }

  .calc-breakdown {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 28px;
    font-size: 0.88rem;
    color: #CBD5E1;
  }

  .calc-breakdown li {
    display: flex;
    justify-content: space-between;
  }

  .calc-breakdown li b {
    color: #FFFFFF;
  }

  /*==================== DELAY SIMULATOR / BUFFER CONTROLLER ====================*/
  .buffer-box {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 40px;
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 40px;
    box-shadow: var(--shadow-md);
  }

  @media screen and (max-width: 900px) {
    .buffer-box {
      grid-template-columns: 1fr;
      padding: 24px;
    }
  }

  .delay-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0 24px;
  }

  .delay-chip {
    padding: 8px 18px;
    border-radius: var(--radius-full);
    font-size: 0.85rem;
    font-weight: 700;
    background: var(--card-subtle);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    transition: var(--transition);
  }

  .delay-chip.active {
    background: var(--coral-color);
    color: #FFFFFF;
    border-color: var(--coral-color);
    box-shadow: 0 4px 12px rgba(255, 85, 51, 0.3);
  }

  .directive-box {
    background: var(--card-subtle);
    border-left: 4px solid var(--coral-color);
    border-radius: var(--radius-sm);
    padding: 18px 20px;
  }

  .directive-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.86rem;
    font-weight: 800;
    color: var(--title-color);
    margin-bottom: 8px;
  }

  .timeline-ticket {
    background: var(--card-subtle);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 24px;
  }

  .daytabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .daytab {
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: var(--radius-full);
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
  }

  .daytab[aria-selected="true"] {
    background: var(--title-color);
    color: #FFFFFF;
  }

  .sched-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }

  .sched-list li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: 0.88rem;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .sched-list li:last-child {
    border-bottom: none;
  }

  .sched-list time {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--text-muted);
    min-width: 48px;
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 0.68rem;
    font-weight: 800;
    border-radius: 4px;
    margin-right: 6px;
  }

  .tag.eat { background: #FEF3C7; color: #B45309; }
  .tag.stop { background: #FEE2E2; color: #B91C1C; }
  .tag.cut { background: #E2E8F0; color: #64748B; }

  .timeline-ticket.is-late li[data-cut] {
    opacity: 0.35;
    text-decoration: line-through;
  }

  /*==================== 3-STEP TRIP PLANNER FORM ====================*/
  .planner-box {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 44px;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 40px;
    box-shadow: var(--shadow-lg);
  }

  @media screen and (max-width: 900px) {
    .planner-box {
      grid-template-columns: 1fr;
      padding: 24px;
    }
  }

  .progress-bar-bg {
    width: 100%;
    height: 6px;
    background: var(--card-subtle);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin: 8px 0 16px;
  }

  .progress-bar-fill {
    width: 33.33%;
    height: 100%;
    background: var(--coral-gradient);
    transition: width 0.3s ease;
  }

  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 16px 0;
  }

  @media screen and (max-width: 600px) {
    .form-grid-2 {
      grid-template-columns: 1fr;
    }
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-group label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--title-color);
  }

  .field-group input, .field-group textarea {
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    background: var(--card-subtle);
    color: var(--title-color);
    font-size: 0.95rem;
  }

  .field-group input:focus, .field-group textarea:focus {
    border-color: var(--coral-color);
    background: var(--card-bg);
  }

  .inline-error {
    font-size: 0.8rem;
    color: #EF4444;
    font-weight: 600;
    display: none;
    margin-top: 4px;
  }

  .inline-error.show {
    display: block;
  }

  .planner-summary-panel {
    background: linear-gradient(180deg, #0F766E 0%, #115E59 100%);
    color: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /*==================== FOOTER ====================*/
  .site-footer {
    background-color: #070A12;
    color: #94A3B8;
    padding: 80px 0 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.8fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 60px;
  }

  @media screen and (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr;
    }
  }

  .footer-col h4 {
    color: #FFFFFF;
    font-size: 1rem;
    margin-bottom: 18px;
  }

  .footer-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 0.9rem;
  }

  .footer-col a:hover {
    color: #FFFFFF;
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 30px;
    font-size: 0.85rem;
    flex-wrap: wrap;
    gap: 16px;
  }
  </style>
</head>
<body>

  <!--==================== HEADER & NAVIGATION ====================-->
  <header class="header" id="header">
    <div class="container navbar">
      <a href="#home" class="brand">
        <div class="brand-logo-icon"><i class="ri-compass-3-line"></i></div>
        <div>
          <span class="brand-title">Raut Expeditions</span>
          <span class="brand-tag">Tailored Group Travel</span>
        </div>
      </a>

      <nav class="nav-menu" id="nav-menu">
        <ul class="nav-list">
          <li><a href="#home" class="nav-link active-link">Home</a></li>
          <li><a href="#how-it-works" class="nav-link">How It Works</a></li>
          <li><a href="#discover" class="nav-link">Circuits</a></li>
          <li><a href="#stays-transport" class="nav-link">Stays &amp; Transit</a></li>
          <li><a href="#calculator" class="nav-link">Split Calculator</a></li>
          <li><a href="#buffers" class="nav-link">Smart Buffers</a></li>
          <li><a href="#planner" class="nav-link">Plan Trip</a></li>
        </ul>
        <button class="nav-close-btn" id="nav-close" aria-label="Close menu"><i class="ri-close-line"></i></button>
      </nav>

      <div class="nav-actions">
        <!-- Dark/Light Theme Toggle -->
        <button class="theme-toggle-btn" id="theme-button" aria-label="Toggle theme">
          <i class="ri-moon-line"></i>
        </button>

        <!-- Direct WhatsApp CTA -->
        <a class="nav-wa-pill" data-wa target="_blank" rel="noopener">
          <span class="pulse-dot"></span>
          <span>WhatsApp Manav</span>
        </a>

        <!-- Burger Toggle for Mobile -->
        <button class="burger-btn" id="nav-toggle" aria-label="Open menu"><i class="ri-menu-4-line"></i></button>
      </div>
    </div>
  </header>

  <main>
    <!--==================== HERO ====================-->
    <section class="hero" id="home">
      <div class="hero-bg"></div>
      <div class="container hero-container">
        <div>
          <div class="hero-badge">
            <i class="ri-sparkling-fill"></i>
            <span>100% Customized Group Travel · Ex-Pune &amp; Mumbai</span>
          </div>
          <h1 class="hero-title">Don't Fit Into A Tour Package.<br><span>Build The Trip Around Your Crew.</span></h1>
          <p class="hero-desc">Founded by <strong>Manav Raut</strong>. We never force you into fixed dates, stranger buses, or rigid 6 AM wake-up calls. We engineer every hour around your group's exact <strong>Budget</strong>, your <strong>Stay Preference</strong> (Private Pool Villa, Hotel, or Hostel), and your <strong>Transport</strong> (Doorstep AC Tempo, Train, or Flight).</p>
          <div class="hero-actions">
            <a href="#calculator" class="btn btn-primary">Calculate Group Split →</a>
            <a href="#how-it-works" class="btn btn-ghost">How It Works</a>
          </div>
        </div>

        <!-- Floating Hero Configurator Box -->
        <div class="hero-card">
          <div class="hero-card-header">
            <div>
              <div class="hero-card-title">Instant Trip Estimator</div>
              <span class="hero-card-sub">Customized around your crew</span>
            </div>
            <span style="font-size:0.75rem;padding:4px 10px;background:var(--coral-subtle);color:var(--coral-color);border-radius:99px;font-weight:700">Zero Fixed Batches</span>
          </div>

          <div class="hero-card-fields">
            <div class="hero-input-box" onclick="location.href='#calculator'">
              <span class="hero-box-label">Destination</span>
              <span class="hero-box-val">📍 Rajasthan Circuit</span>
            </div>
            <div class="hero-input-box" onclick="location.href='#stays-transport'">
              <span class="hero-box-label">Stay Type</span>
              <span class="hero-box-val">🏡 Private Pool Villa</span>
            </div>
            <div class="hero-input-box" onclick="location.href='#stays-transport'">
              <span class="hero-box-label">Transport</span>
              <span class="hero-box-val">🚐 AC Tempo (Doorstep)</span>
            </div>
            <div class="hero-input-box" onclick="location.href='#calculator'">
              <span class="hero-box-label">Group Size</span>
              <span class="hero-box-val">👥 12 Travellers</span>
            </div>
          </div>

          <div class="hero-card-footer">
            <div>
              <div style="font-size:0.72rem;color:#94A3B8;text-transform:uppercase;font-weight:700">Estimated Split</div>
              <div class="hero-est-amt">₹12,400 <span>/ person</span></div>
            </div>
            <a href="#calculator" class="btn btn-primary" style="padding:10px 20px;font-size:0.88rem">Customize →</a>
          </div>
        </div>
      </div>
    </section>

    <!--==================== HOW IT WORKS / COMPARISON ====================-->
    <section class="section" id="how-it-works">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Why Raut Expeditions</span>
          <h2 class="section-title">The Anti-Package Guarantee</h2>
          <p class="section-desc">Why travellers from Pune and Mumbai choose custom-engineered itineraries over cookie-cutter bus tours.</p>
        </div>

        <div class="compare-grid">
          <!-- Traditional Agency -->
          <div class="compare-card compare-bad">
            <span class="compare-badge">✕ Traditional Tour Agencies</span>
            <h3>Rigid, Impersonal Packages</h3>
            <p class="lead-text">What happens with generic commercial group tours:</p>
            <ul class="compare-list">
              <li><i class="ri-close-circle-fill"></i><span><b>Fixed calendar dates:</b> You are forced to adjust your work leaves to fit their pre-fixed departure dates.</span></li>
              <li><i class="ri-close-circle-fill"></i><span><b>Strangers on a bus:</b> Trapped with 30–40 strangers, waiting at every rest stop on slow passengers.</span></li>
              <li><i class="ri-close-circle-fill"></i><span><b>Generic highway motels:</b> Bland buffet food, noisy corridors, zero atmosphere or privacy.</span></li>
              <li><i class="ri-close-circle-fill"></i><span><b>Forced 6:00 AM alarms:</b> Herded from sight to sight with strict 20-minute timers and rushed photo stops.</span></li>
              <li><i class="ri-close-circle-fill"></i><span><b>Shopping commissions:</b> Drivers make forced detours to overpriced tourist stores for kickbacks.</span></li>
            </ul>
          </div>

          <!-- Raut Expeditions -->
          <div class="compare-card compare-good">
            <span class="compare-badge">✓ Raut Expeditions</span>
            <h3>100% Engineered Around You</h3>
            <p class="lead-text">How Manav Raut plans private group travel:</p>
            <ul class="compare-list">
              <li><i class="ri-checkbox-circle-fill"></i><span><b>100% Private Crew:</b> Only your friends, family, or team. Zero strangers on board.</span></li>
              <li><i class="ri-checkbox-circle-fill"></i><span><b>Choose Your Stay:</b> Private Pool Villas, 4★ Boutique Heritage Hotels, or Social Hostels.</span></li>
              <li><i class="ri-checkbox-circle-fill"></i><span><b>Doorstep Transit:</b> AC Tempo Traveller picks you up from your doorstep in Pune/Mumbai, or synced train berths &amp; flights.</span></li>
              <li><i class="ri-checkbox-circle-fill"></i><span><b>Your Schedule &amp; Pace:</b> Sleep until 11 AM if you like. Our built-in route buffers absorb highway traffic in real time.</span></li>
              <li><i class="ri-checkbox-circle-fill"></i><span><b>Transparent Rupee Split:</b> Itemized cost sheet down to the rupee before you pay anything. Zero hidden fees.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!--==================== 3D DISCOVER SWIPER ====================-->
    <section class="section discover-section" id="discover">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Tested Circuits</span>
          <h2 class="section-title">Signature Routes from Pune &amp; Mumbai</h2>
          <p class="section-desc">Swipe through the expeditions we have walked, timed, and tested on the road. Completely customizable around your dates.</p>
        </div>
      </div>

      <div class="discover__container container swiper-container">
        <div class="swiper-wrapper">
          <!-- Slide 1 -->
          <div class="discover__card swiper-slide" onclick="planTrip('Rajasthan')">
            <img src="img/real-rajasthan-cover.webp" alt="Rajasthan Circuit" class="discover__img">
            <div class="discover__data">
              <span class="discover__badge">6 Days / 5 Nights</span>
              <h3 class="discover__title">Rajasthan Circuit</h3>
              <p class="discover__desc">Jaipur, Jaisalmer &amp; Jodhpur · Desert camps &amp; forts</p>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="discover__card swiper-slide" onclick="planTrip('Hampi–Gokarna')">
            <img src="img/trip-gokarna-800.webp" alt="Gokarna & Hampi" class="discover__img">
            <div class="discover__data">
              <span class="discover__badge">5 Days / 4 Nights</span>
              <h3 class="discover__title">Gokarna &amp; Hampi</h3>
              <p class="discover__desc">Om Beach trek, Murudeshwar &amp; boulder sunrise</p>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="discover__card swiper-slide" onclick="planTrip('Kerala')">
            <img src="img/trip-kerala-800.webp" alt="Kerala Backwaters" class="discover__img">
            <div class="discover__data">
              <span class="discover__badge">3 Days / 2 Nights</span>
              <h3 class="discover__title">Kerala Backwaters</h3>
              <p class="discover__desc">Munnar tea hills, Kolukkumalai &amp; Alleppey houseboats</p>
            </div>
          </div>

          <!-- Slide 4 -->
          <div class="discover__card swiper-slide" onclick="planTrip('Goa')">
            <img src="img/trip-goa-800.webp" alt="Goa Private Villa" class="discover__img">
            <div class="discover__data">
              <span class="discover__badge">4 Days / 3 Nights</span>
              <h3 class="discover__title">Goa Villa Circuit</h3>
              <p class="discover__desc">Private pool party, Arambol sweet water &amp; South Goa</p>
            </div>
          </div>

          <!-- Slide 5 -->
          <div class="discover__card swiper-slide" onclick="planTrip('Himachal/Uttarakhand')">
            <img src="assets/img/discover4.jpg" alt="Himachal Expeditions" class="discover__img">
            <div class="discover__data">
              <span class="discover__badge">7 Days / 6 Nights</span>
              <h3 class="discover__title">Himachal &amp; Parvati</h3>
              <p class="discover__desc">Kasol, Manali &amp; mountain river valleys</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--==================== STAYS & TRANSIT OPTIONS ====================-->
    <section class="section" id="stays-transport">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Modular Options</span>
          <h2 class="section-title">Choose Your Stays &amp; Travel Modes</h2>
          <p class="section-desc">You choose how you sleep and how you travel. We assemble and coordinate the complete journey.</p>
        </div>

        <div class="tabs-nav">
          <button class="tab-btn active" id="tab-stays-btn" onclick="switchCategory('stays')">🏡 Handpicked Stays</button>
          <button class="tab-btn" id="tab-transit-btn" onclick="switchCategory('transit')">🚐 Transportation Modes</button>
        </div>

        <!-- Category 1: Stays -->
        <div class="cards-grid" id="grid-stays">
          <!-- Stay 1 -->
          <div class="place-card" onclick="selectStay('villa')">
            <img src="img/trip-goa-800.webp" alt="Private Pool Villa" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Private Stay</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 4.9</span>
              </div>
              <div>
                <h3 class="place-title">Private Pool Villa</h3>
                <p class="place-sub">Goa, Coorg &amp; Lonavala · 8–18 Guests</p>
                <div class="place-price">₹2,200 <small style="font-size:0.75rem;color:#CBD5E1">/ night share</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Villa"><i class="ri-arrow-right-line"></i></button>
          </div>

          <!-- Stay 2 -->
          <div class="place-card" onclick="selectStay('hotel')">
            <img src="assets/img/place2.jpg" alt="Boutique Heritage Hotel" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Comfort Stay</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 4.8</span>
              </div>
              <div>
                <h3 class="place-title">Boutique &amp; Heritage Hotel</h3>
                <p class="place-sub">Rajasthan &amp; Kerala · 3★/4★ Verified AC</p>
                <div class="place-price">₹1,400 <small style="font-size:0.75rem;color:#CBD5E1">/ night share</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Hotel"><i class="ri-arrow-right-line"></i></button>
          </div>

          <!-- Stay 3 -->
          <div class="place-card" onclick="selectStay('hostel')">
            <img src="img/trip-gokarna-800.webp" alt="Social Backpacker Hostel" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Social &amp; Budget</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 4.9</span>
              </div>
              <div>
                <h3 class="place-title">Social &amp; Backpacker Hostel</h3>
                <p class="place-sub">Gokarna &amp; North Goa · Bunk Pods &amp; Cafes</p>
                <div class="place-price">₹750 <small style="font-size:0.75rem;color:#CBD5E1">/ night share</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Hostel"><i class="ri-arrow-right-line"></i></button>
          </div>
        </div>

        <!-- Category 2: Transit -->
        <div class="cards-grid" id="grid-transit" style="display:none">
          <!-- Transit 1 -->
          <div class="place-card" onclick="selectTrans('tempo')">
            <img src="assets/img/place4.jpg" alt="Doorstep AC Tempo Traveller" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Group Vehicle</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 5.0</span>
              </div>
              <div>
                <h3 class="place-title">Doorstep AC Tempo Traveller</h3>
                <p class="place-sub">12 to 26 Seater · Door-to-Door Pickup</p>
                <div class="place-price">₹4,000 <small style="font-size:0.75rem;color:#CBD5E1">/ head approx</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Tempo"><i class="ri-arrow-right-line"></i></button>
          </div>

          <!-- Transit 2 -->
          <div class="place-card" onclick="selectTrans('train')">
            <img src="assets/img/place5.jpg" alt="Scenic Train Routes" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Rail Journeys</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 4.9</span>
              </div>
              <div>
                <h3 class="place-title">Scenic Train Expeditions</h3>
                <p class="place-sub">Konkan Railway &amp; Overnight Sleeper Berths</p>
                <div class="place-price">₹2,400 <small style="font-size:0.75rem;color:#CBD5E1">/ head approx</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Train"><i class="ri-arrow-right-line"></i></button>
          </div>

          <!-- Transit 3 -->
          <div class="place-card" onclick="selectTrans('flight')">
            <img src="assets/img/place1.jpg" alt="Flight Sync" class="place-card-img">
            <div class="place-card-content">
              <div class="place-card-top">
                <span class="place-type-pill">Air + Transfers</span>
                <span class="place-rating"><i class="ri-star-fill"></i> 4.8</span>
              </div>
              <div>
                <h3 class="place-title">Flight Sync &amp; Airport Cabs</h3>
                <p class="place-sub">Ex-Pune (PNQ) &amp; Mumbai (BOM) Sync</p>
                <div class="place-price">₹7,500 <small style="font-size:0.75rem;color:#CBD5E1">/ head approx</small></div>
              </div>
            </div>
            <button class="place-arrow-btn" aria-label="Select Flight"><i class="ri-arrow-right-line"></i></button>
          </div>
        </div>
      </div>
    </section>

    <!--==================== SPLIT CALCULATOR ====================-->
    <section class="section" id="calculator">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Zero Hidden Agency Cuts</span>
          <h2 class="section-title">Transparent Trip Cost Calculator</h2>
          <p class="section-desc">Adjust the parameters to see the transparent rupee split for your group. No surprise agency markups.</p>
        </div>

        <div class="calc-box">
          <div>
            <!-- Destination -->
            <div class="calc-field">
              <label class="calc-label">1. Choose Circuit</label>
              <div class="calc-pills">
                <button type="button" class="calc-pill active" data-dest="rajasthan">Rajasthan (6D/5N)</button>
                <button type="button" class="calc-pill" data-dest="gokarna">Gokarna &amp; Hampi (5D/4N)</button>
                <button type="button" class="calc-pill" data-dest="kerala">Kerala (3D/2N)</button>
                <button type="button" class="calc-pill" data-dest="goa">Goa (4D/3N)</button>
                <button type="button" class="calc-pill" data-dest="himachal">Himachal (7D/6N)</button>
              </div>
            </div>

            <!-- Group Size -->
            <div class="calc-field">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <label class="calc-label" style="margin-bottom:0">2. Group Size: <b id="slider-count" style="color:var(--coral-color)">12 Travellers</b></label>
                <span id="vehicle-fit" style="font-size:0.8rem;color:var(--primary-color);font-weight:700">⭐ Perfect 12-Seater Tempo Fit</span>
              </div>
              <input type="range" id="group-slider" min="4" max="16" value="12" step="1" class="calc-slider">
            </div>

            <!-- Stay Type -->
            <div class="calc-field">
              <label class="calc-label">3. Stay Preference</label>
              <div class="calc-chip-grid">
                <label class="calc-chip active">
                  <input type="radio" name="calc-stay" value="hotel" checked>
                  <span>🏨 3★/4★ Hotel</span>
                </label>
                <label class="calc-chip">
                  <input type="radio" name="calc-stay" value="villa">
                  <span>🏡 Private Villa</span>
                </label>
                <label class="calc-chip">
                  <input type="radio" name="calc-stay" value="hostel">
                  <span>🎒 Social Hostel</span>
                </label>
              </div>
            </div>

            <!-- Transport Mode -->
            <div class="calc-field">
              <label class="calc-label">4. Transportation Mode</label>
              <div class="calc-chip-grid">
                <label class="calc-chip active">
                  <input type="radio" name="calc-trans" value="tempo" checked>
                  <span>🚐 Doorstep Tempo</span>
                </label>
                <label class="calc-chip">
                  <input type="radio" name="calc-trans" value="train">
                  <span>🚆 Scenic Train</span>
                </label>
                <label class="calc-chip">
                  <input type="radio" name="calc-trans" value="flight">
                  <span>✈️ Flight Sync</span>
                </label>
                <label class="calc-chip">
                  <input type="radio" name="calc-trans" value="selfdrive">
                  <span>🚗 Road Convoy</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Output Card -->
          <div class="calc-output">
            <div class="calc-output-head">
              <span class="calc-output-tag">Transparent Per-Person Share</span>
              <div class="calc-per-person"><span>₹</span><b id="per-head-amt">12,400</b> <small>/ person</small></div>
              <div class="calc-pool-text">Total Group Pool: <b id="total-pool-amt">₹1,48,800</b></div>
            </div>

            <ul class="calc-breakdown">
              <li><span id="label-transit">🚐 Private Tempo + Tolls</span> <b id="item-transit">₹4,000 / head</b></li>
              <li><span id="label-stays">🏨 Verified 3★ Hotel &amp; Breakfast</span> <b id="item-stays">₹6,200 / head</b></li>
              <li><span>🎟️ Activity Passes &amp; Entry</span> <b id="item-passes">₹1,400 / head</b></li>
              <li><span>🛡️ Highway Buffer &amp; Contingency</span> <b id="item-buffer">₹800 / head</b></li>
            </ul>

            <div style="display:flex;flex-direction:column;gap:10px">
              <button class="btn btn-primary" id="copy-split-btn">
                <i class="ri-clipboard-line"></i> Copy Plan for WhatsApp
              </button>
              <button class="btn btn-ghost" id="calc-plan-btn">
                Plan This with Manav Raut →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--==================== SMART ROUTE BUFFERS ====================-->
    <section class="section" id="buffers" style="background-color:var(--card-subtle)">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Stress-Free Logistics</span>
          <h2 class="section-title">Smart Route Buffers in Action</h2>
          <p class="section-desc">Indian highways and trains have delays. Here is how our time-buffered itineraries dynamically adapt so you never miss a sunset or connection.</p>
        </div>

        <div class="buffer-box">
          <div>
            <span class="section-tag">Live Traffic Simulation</span>
            <h3 style="margin-bottom:8px">Simulate Highway Delay: <span id="delay-status-text" style="color:var(--coral-color)">On Time (0 min)</span></h3>
            <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:16px">Click a delay to see how our on-road protocol recalculates the day:</p>

            <div class="delay-chips">
              <button type="button" class="delay-chip active" data-delay="0">On Time</button>
              <button type="button" class="delay-chip" data-delay="30">+30 min</button>
              <button type="button" class="delay-chip" data-delay="60">+60 min</button>
              <button type="button" class="delay-chip" data-delay="90">+90 min</button>
              <button type="button" class="delay-chip" data-delay="120">+120 min</button>
            </div>

            <div class="directive-box">
              <div class="directive-head"><i class="ri-shield-check-line" style="color:var(--coral-color);font-size:1.2rem"></i> Manav Raut's On-Road Directive:</div>
              <p id="delay-directive" style="font-size:0.9rem;line-height:1.6">All legs green. Mehrangarh zip-line at 14:30, Jaswant Thada at 17:00, relaxed dinner at Stepwell Square, train 20495 confirmed at 22:00.</p>
            </div>

            <button id="late" style="display:none"></button><span id="late-label" style="display:none"></span><p id="late-note" hidden></p>
          </div>

          <!-- Timeline -->
          <div class="timeline-ticket" id="ticket">
            <div class="daytabs">
              <button class="daytab" aria-selected="true" data-day="0">Rajasthan · Day 5</button>
              <button class="daytab" aria-selected="false" data-day="1">Rajasthan · Day 3</button>
              <button class="daytab" aria-selected="false" data-day="2">Kerala · Day 3</button>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <small id="t-day" style="color:var(--coral-color);font-weight:700;text-transform:uppercase;font-size:0.75rem">Day 5 · Jodhpur</small>
                <h4 id="t-title" style="margin-top:2px;font-size:1.15rem">Desert highway, zip-line, departure</h4>
              </div>
              <span style="font-size:0.72rem;padding:3px 10px;background:rgba(37,211,102,0.15);color:#15803D;border-radius:99px;font-weight:700">BUFFER PROTECTED</span>
            </div>

            <div id="t-leg" style="background:var(--card-bg);padding:10px 14px;border-radius:var(--radius-sm);margin:14px 0;font-size:0.82rem">
              <b>Transit leg:</b> Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.
            </div>

            <ul class="sched-list" id="t-sched">
              <li><time>08:00</time><span><span class="tag eat">EAT</span> Breakfast &amp; camp checkout</span></li>
              <li><time>08:30</time><span>Depart for Jodhpur via NH125: 280–285 km, 4.5–6 hours</span></li>
              <li><time>14:30</time><span><span class="tag stop">HARD STOP</span> Flying Fox zip-line at Mehrangarh</span></li>
              <li data-cut><time>17:00</time><span><span class="tag cut">CUT</span> Jaswant Thada, a quick visit</span></li>
              <li><time>19:00</time><span><span class="tag eat">EAT</span> Dinner at Stepwell Square</span></li>
              <li><time>20:30</time><span>Drop at Jodhpur Junction with safe buffer</span></li>
              <li><time>22:00</time><span><span class="tag stop">HARD STOP</span> Board train 20495 to Pune</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!--==================== 3-STEP TRIP PLANNER ====================-->
    <section class="section" id="planner">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Quick Inquiry</span>
          <h2 class="section-title">Plan Your Custom Trip</h2>
          <p class="section-desc">Share where and when you want to travel. Founder Manav Raut will prepare your custom itinerary within 24 hours.</p>
        </div>

        <div class="planner-box">
          <div>
            <form id="form" novalidate>
              <div style="margin-bottom:20px">
                <span id="step-label" style="font-size:0.88rem;font-weight:700">Step 1 of 3 · Where &amp; When</span>
                <div class="progress-bar-bg"><div class="progress-bar-fill" id="bar"></div></div>
              </div>

              <!-- Step 1 -->
              <fieldset class="step" data-step="1">
                <legend style="font-weight:700;font-size:1.15rem;margin-bottom:12px">Where is your crew headed?</legend>
                <div class="calc-pills" style="margin-bottom:16px">
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Rajasthan" style="display:none"><span>Rajasthan</span></label>
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Kerala" style="display:none"><span>Kerala</span></label>
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Goa" style="display:none"><span>Goa</span></label>
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Hampi–Gokarna" style="display:none"><span>Gokarna &amp; Hampi</span></label>
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Himachal/Uttarakhand" style="display:none"><span>Himachal</span></label>
                  <label class="calc-pill pk"><input type="radio" name="dest" value="Other" style="display:none"><span>Other Custom Route</span></label>
                </div>
                <div class="inline-error" id="err-dest">Please choose a destination to continue.</div>

                <div class="form-grid-2">
                  <div class="field-group">
                    <label for="from">Departure city</label>
                    <input id="from" name="from" type="text" placeholder="e.g. Pune or Mumbai" autocomplete="off">
                  </div>
                  <div class="field-group">
                    <label for="when">Dates or month</label>
                    <input id="when" name="when" type="text" placeholder="e.g. 15–20 Dec" autocomplete="off">
                  </div>
                </div>

                <label class="calc-label" style="margin-top:16px">Preferred Travel Mode</label>
                <div class="calc-pills">
                  <label class="calc-pill pk"><input type="radio" name="travel" value="train" style="display:none"><span>🚆 Train</span></label>
                  <label class="calc-pill pk"><input type="radio" name="travel" value="flight" style="display:none"><span>✈️ Flight</span></label>
                  <label class="calc-pill pk"><input type="radio" name="travel" value="road" style="display:none"><span>🚐 Tempo / Road</span></label>
                  <label class="calc-pill pk"><input type="radio" name="travel" value="flexible" style="display:none"><span>Advise us</span></label>
                </div>
              </fieldset>

              <!-- Step 2 -->
              <fieldset class="step" data-step="2" hidden>
                <legend style="font-weight:700;font-size:1.15rem;margin-bottom:12px">Who is going and your budget?</legend>
                <label class="calc-label">Group size</label>
                <div class="calc-pills" style="margin-bottom:16px">
                  <label class="calc-pill pk"><input type="radio" name="group" value="1-2" style="display:none"><span>1–2</span></label>
                  <label class="calc-pill pk"><input type="radio" name="group" value="3-6" style="display:none"><span>3–6</span></label>
                  <label class="calc-pill pk"><input type="radio" name="group" value="7-12" style="display:none"><span>7–12</span></label>
                  <label class="calc-pill pk"><input type="radio" name="group" value="13+" style="display:none"><span>13+</span></label>
                </div>
                <div class="inline-error" id="err-group">Please select your group size.</div>

                <label class="calc-label" style="margin-top:16px">Target Budget per Head</label>
                <div class="calc-pills">
                  <label class="calc-pill pk"><input type="radio" name="budget" value="5-10" style="display:none"><span>₹5k–₹10k</span></label>
                  <label class="calc-pill pk"><input type="radio" name="budget" value="10-18" style="display:none"><span>₹10k–₹18k</span></label>
                  <label class="calc-pill pk"><input type="radio" name="budget" value="18+" style="display:none"><span>₹18k+</span></label>
                </div>

                <div class="field-group" style="margin-top:16px">
                  <label for="notes">Special requests or stay preference</label>
                  <textarea id="notes" name="notes" rows="2" placeholder="e.g. Private pool villa preferred, late brunch starts, vegetarian food"></textarea>
                </div>
              </fieldset>

              <!-- Step 3 -->
              <fieldset class="step" data-step="3" hidden>
                <legend style="font-weight:700;font-size:1.15rem;margin-bottom:12px">Where should we send your quote?</legend>
                <div class="form-grid-2">
                  <div class="field-group">
                    <label for="name">Your Name</label>
                    <input id="name" name="name" type="text" placeholder="Full name" autocomplete="name">
                    <div class="inline-error" id="err-name">Please enter your name.</div>
                  </div>
                  <div class="field-group">
                    <label for="phone">WhatsApp Number</label>
                    <input id="phone" name="phone" type="tel" placeholder="10-digit mobile number" autocomplete="tel">
                    <div class="inline-error" id="err-phone">Please enter a valid mobile number.</div>
                  </div>
                </div>

                <div style="display:none"><input id="website" name="website" type="text"></div>

                <label style="display:flex;align-items:center;gap:8px;font-size:0.86rem;margin-top:14px;cursor:pointer">
                  <input type="checkbox" id="consent" checked>
                  <span>Send itinerary details and split sheet to my WhatsApp</span>
                </label>
              </fieldset>

              <div style="display:flex;gap:12px;margin-top:24px">
                <button type="button" class="btn btn-secondary" id="back" hidden>Back</button>
                <button type="submit" class="btn btn-primary" id="submit">Next Step</button>
              </div>
            </form>

            <!-- Confirmed State -->
            <div class="confirm" id="confirm" hidden>
              <h3 style="font-size:1.4rem;margin-bottom:8px">Got it, <span id="c-name"></span>!</h3>
              <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:16px">Click below to send these exact parameters directly to Manav Raut on WhatsApp:</p>
              <dl id="c-list" style="margin-bottom:20px;font-size:0.9rem;line-height:1.6;background:var(--card-subtle);padding:16px;border-radius:var(--radius-md)"></dl>
              <a class="btn btn-wa btn-block" id="c-wa" target="_blank" rel="noopener">
                <i class="ri-whatsapp-line"></i> Send Details on WhatsApp
              </a>
              <div id="next" hidden></div>
              <button class="btn btn-secondary btn-block" id="c-edit" style="margin-top:12px" type="button">Edit Details</button>
            </div>
          </div>

          <!-- Summary Side Card -->
          <div class="planner-summary-panel">
            <div>
              <span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#CCFBF1;font-weight:700">Trip Blueprint</span>
              <h3 style="color:#FFFFFF;margin-top:6px;font-size:1.4rem"><span id="bp-from">Pune</span> ➔ <span id="bp-to">Anywhere</span></h3>
              <p style="font-size:0.9rem;color:#CCFBF1;margin-top:6px">Group: <b id="bp-group" style="color:#FFF">—</b></p>
            </div>

            <div>
              <h4 style="color:#FFFFFF;font-size:1.3rem">Firm Quote in 24 Hours</h4>
              <p style="font-size:0.85rem;color:#CCFBF1;margin-top:6px;line-height:1.5">Custom-engineered by founder Manav Raut with transparent per-head split, stay options, and travel logistics.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!--==================== FOOTER ====================-->
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="#home" class="brand" style="margin-bottom:16px">
          <div class="brand-logo-icon"><i class="ri-compass-3-line"></i></div>
          <div><span class="brand-title">Raut Expeditions</span></div>
        </a>
        <p style="font-size:0.92rem;line-height:1.6;max-width:420px;margin-bottom:14px">
          100% Customized Group Travel from Pune and Mumbai.<br>
          Engineered personally around your budget, stay preference, and pace by founder Manav Raut.
        </p>
        <span style="font-size:0.75rem;color:#64748B;font-weight:700">UDYAM MSME REGISTERED · MH-26-0038921</span>
      </div>

      <div class="footer-col">
        <h4>Signature Circuits</h4>
        <ul>
          <li><a href="#discover">Rajasthan Circuit</a></li>
          <li><a href="#discover">Gokarna &amp; Hampi</a></li>
          <li><a href="#discover">Kerala Backwaters</a></li>
          <li><a href="#discover">Goa Private Villas</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Connect &amp; Talk</h4>
        <ul>
          <li><a id="ig" target="_blank" rel="noopener"><i class="ri-instagram-line"></i> @manav.raut.trips</a></li>
          <li><a data-wa target="_blank" rel="noopener"><i class="ri-whatsapp-line"></i> WhatsApp Manav Directly</a></li>
          <li><a href="#calculator"><i class="ri-calculator-line"></i> Cost Calculator</a></li>
          <li><a href="#planner">Plan Custom Trip</a></li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&#169; <span id="yr"></span> Raut Expeditions. All trips 100% custom-planned.</p>
      <div><a href="#how-it-works" style="color:#64748B">Privacy &amp; Terms</a></div>
    </div>
  </footer>

  <!-- Swiper JS (Local) -->
  <script src="swiper-bundle.min.js"></script>

  <!-- Core JavaScript -->
  <script>
  const CFG = Object.assign({
    whatsapp: "919822012345",
    instagram: "manav.raut.trips"
  }, window.SITE_CONFIG || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const waLink = text => "https://wa.me/" + CFG.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

  $$("[data-wa]").forEach(a => a.href = waLink("Hi Manav! I'd like to plan a custom trip for our crew."));
  $("#ig").href = "https://instagram.com/" + CFG.instagram;
  $("#yr").textContent = new Date().getFullYear();

  /*==================== NAVBAR SCROLL & MOBILE MENU ====================*/
  const header = $("#header");
  const navMenu = $("#nav-menu");
  const navToggle = $("#nav-toggle");
  const navClose = $("#nav-close");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY >= 60);
  });

  if (navToggle) {
    navToggle.onclick = () => navMenu.classList.add("open");
  }
  if (navClose) {
    navClose.onclick = () => navMenu.classList.remove("open");
  }

  $$(".nav-link").forEach(link => {
    link.onclick = () => navMenu.classList.remove("open");
  });

  /*==================== DARK / LIGHT THEME TOGGLE ====================*/
  const themeBtn = $("#theme-button");
  const themeIcon = themeBtn.querySelector("i");
  const savedTheme = localStorage.getItem("raut-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeIcon.classList.replace("ri-moon-line", "ri-sun-line");
  }

  themeBtn.onclick = () => {
    const isDark = document.body.classList.toggle("dark-theme");
    if (isDark) {
      themeIcon.classList.replace("ri-moon-line", "ri-sun-line");
      localStorage.setItem("raut-theme", "dark");
    } else {
      themeIcon.classList.replace("ri-sun-line", "ri-moon-line");
      localStorage.setItem("raut-theme", "light");
    }
  };

  /*==================== 3D SWIPER CAROUSEL ====================*/
  let swiper = new Swiper(".discover__container", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    loop: true,
    spaceBetween: 32,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 2,
      slideShadows: false,
    },
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    }
  });

  /*==================== STAYS & TRANSIT TABS ====================*/
  function switchCategory(cat) {
    const staysBtn = $("#tab-stays-btn");
    const transitBtn = $("#tab-transit-btn");
    const gridStays = $("#grid-stays");
    const gridTransit = $("#grid-transit");

    if (cat === "stays") {
      staysBtn.classList.add("active");
      transitBtn.classList.remove("active");
      gridStays.style.display = "grid";
      gridTransit.style.display = "none";
    } else {
      staysBtn.classList.remove("active");
      transitBtn.classList.add("active");
      gridStays.style.display = "none";
      gridTransit.style.display = "grid";
    }
  }

  /*==================== GROUP SPLIT ENGINE ====================*/
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
      else if (group <= 9) vFit.textContent = "🚐 10-Seater Tempo Fit";
      else if (group <= 13) vFit.textContent = "⭐ Perfect 12-Seater AC Tempo Fit";
      else vFit.textContent = "🚌 16-17 Seater Cruiser Fit";
    } else if (currentCalcTrans === "train") {
      vFit.textContent = "🚆 Confirmed IRCTC 3AC/Sleeper Berths";
    } else if (currentCalcTrans === "flight") {
      vFit.textContent = "✈️ Flight Connections + Airport Transfers";
    } else {
      vFit.textContent = "🚗 Private Convoy (" + Math.ceil(group / 4) + " Cars)";
    }

    let transitPerHead = 0, transitLabel = "";
    if (currentCalcTrans === "tempo") {
      transitPerHead = Math.round(route.baseTransitTempo / group);
      transitLabel = "🚐 Private Tempo + Tolls";
    } else if (currentCalcTrans === "train") {
      transitPerHead = route.baseTrainPerHead;
      transitLabel = "🚆 IRCTC Train Legs + Transfers";
    } else if (currentCalcTrans === "flight") {
      transitPerHead = route.baseFlightPerHead;
      transitLabel = "✈️ Flight Sync + Airport Cabs";
    } else {
      transitPerHead = Math.round(route.baseSelfDriveTotal / group);
      transitLabel = "🚗 Self-Drive Fuel & Toll Share";
    }

    const stayPerNight = route.stays[currentCalcStay] || 1400;
    const staysPerHead = stayPerNight * route.nights;
    let stayLabel = "";
    if (currentCalcStay === "villa") stayLabel = "🏡 Private Pool Villa Share";
    else if (currentCalcStay === "hostel") stayLabel = "🎒 Social Backpacker Bunk Share";
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

  function selectStay(val) {
    currentCalcStay = val;
    $$('input[name="calc-stay"]').forEach(i => {
      i.checked = i.value === val;
      i.closest(".calc-chip").classList.toggle("active", i.value === val);
    });
    updateSplitCalc();
    location.href = "#calculator";
  }

  function selectTrans(val) {
    currentCalcTrans = val;
    $$('input[name="calc-trans"]').forEach(i => {
      i.checked = i.value === val;
      i.closest(".calc-chip").classList.toggle("active", i.value === val);
    });
    updateSplitCalc();
    location.href = "#calculator";
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
    input.closest(".calc-chip").onclick = () => {
      $$('input[name="calc-stay"]').forEach(i => i.closest(".calc-chip").classList.remove("active"));
      input.closest(".calc-chip").classList.add("active");
      currentCalcStay = input.value;
      updateSplitCalc();
    };
  });

  $$('input[name="calc-trans"]').forEach(input => {
    input.closest(".calc-chip").onclick = () => {
      $$('input[name="calc-trans"]').forEach(i => i.closest(".calc-chip").classList.remove("active"));
      input.closest(".calc-chip").classList.add("active");
      currentCalcTrans = input.value;
      updateSplitCalc();
    };
  });

  const copyBtn = $("#copy-split-btn");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const route = CALC_ROUTES[currentCalcRoute];
      const group = +$("#group-slider").value;
      const perHead = $("#per-head-amt").textContent;
      const stayLabel = currentCalcStay === "villa" ? "Private Pool Villa" : currentCalcStay === "hostel" ? "Social Hostel" : "3★/4★ Hotel";
      const transLabel = currentCalcTrans === "tempo" ? "Doorstep AC Tempo" : currentCalcTrans === "train" ? "IRCTC Train" : currentCalcTrans === "flight" ? "Flight + Transfers" : "Road Convoy";

      const pitch = [
        "🏔️ *Custom Group Expedition by Manav Raut (Raut Expeditions)*",
        "📍 *Route:* " + route.name + " (" + route.days + "D/" + route.nights + "N)",
        "👥 *Group:* " + group + " Travellers",
        "🏨 *Stay Preference:* " + stayLabel,
        "🚐 *Transportation:* " + transLabel,
        "💰 *Estimated Split:* ₹" + perHead + " / person",
        "",
        "*Cost Breakdown:*",
        "• Transit: " + $("#item-transit").textContent,
        "• Stays: " + $("#item-stays").textContent,
        "• Passes: " + $("#item-passes").textContent,
        "• Buffer: " + $("#item-buffer").textContent,
        "",
        "100% Customized around our crew's budget & dates.",
        "Details: " + location.href.split("#")[0]
      ].join("\\n");

      try {
        await navigator.clipboard.writeText(pitch);
        copyBtn.innerHTML = "<i class='ri-check-line'></i> Copied to Clipboard!";
        setTimeout(() => { copyBtn.innerHTML = "<i class='ri-clipboard-line'></i> Copy Plan for WhatsApp"; }, 3000);
      } catch {
        window.open(waLink(pitch), "_blank");
      }
    };
  }

  const calcPlanBtn = $("#calc-plan-btn");
  if (calcPlanBtn) {
    calcPlanBtn.onclick = () => {
      const route = CALC_ROUTES[currentCalcRoute];
      planTrip(route.destKey);
    };
  }

  updateSplitCalc();

  /*==================== ROUTE BUFFERS & DELAY SIMULATOR ====================*/
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

  const DAYS = [
    { day: "Day 5 · Jodhpur", title: "Desert highway, zip-line, departure", leg: "Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.",
      rows: [["08:00", "Breakfast and camp checkout", "eat"], ["08:30", "Depart for Jodhpur via NH125: 280–285 km, 4.5–6 hours"], ["14:30", "Flying Fox zip-line at Mehrangarh", "stop", "Operates 09:30–17:00"], ["17:00", "Jaswant Thada, a quick visit", "cut"], ["19:00", "Dinner at Stepwell Square", "eat"], ["20:30", "Drop at Jodhpur Junction, with safe buffer"], ["22:00", "Board train 20495 to Pune", "stop", "Confirmed on IRCTC"]] },
    { day: "Day 3 · Jaipur → Jaisalmer", title: "Pink City by day, desert train by night", leg: "Train 12468: Jaipur Jn 16:25 → Jaisalmer 05:05 next day.",
      rows: [["09:00", "City Palace and Jantar Mantar"], ["12:30", "Lunch at Nahargarh Fort with skyline view", "cut"], ["15:30", "Head to Jaipur Junction with luggage"], ["16:25", "Board train 12468 to Jaisalmer", "stop", "Confirmed on IRCTC"]] },
    { day: "Day 3 · Thekkady → Alleppey → Kochi", title: "Backwaters, then airport on time", leg: "Flight Kochi → Pune at 23:04. Reach airport by 18:30.",
      rows: [["07:00", "Local breakfast near homestay", "eat"], ["08:00", "Depart Thekkady for Alleppey: 138 km, about 3.5 hours"], ["11:30", "Alleppey Beach"], ["12:30", "Alappuzha Lighthouse", "cut"], ["13:30", "Kumarakom Bird Sanctuary", "cut"], ["15:00", "Lunch at Asado Cafe", "eat"], ["16:30", "Depart Alleppey for Kochi Airport", "stop", "Flight at 23:04"]] }
  ];

  function renderDay(i) {
    const d = DAYS[i], mk = (t, c, x) => Object.assign(document.createElement(t), { className: c || "", textContent: x || "" });
    $$(".daytab").forEach(b => b.setAttribute("aria-selected", +b.dataset.day === i));
    $("#t-day").textContent = d.day; $("#t-title").textContent = d.title;
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

  /*==================== 3-STEP TRIP PLANNER WIZARD ====================*/
  const form = $("#form");
  function planTrip(dest) {
    if (dest) {
      $$('input[name="dest"]').forEach(i => {
        i.checked = i.value === dest;
        i.closest(".calc-pill")?.classList.toggle("active", i.value === dest);
      });
    }
    form.hidden = false; $("#confirm").hidden = true; gotoStep(1);
    location.href = "#planner";
  }

  let currentStep = 1;
  const STEP_TITLES = ["", "Step 1 of 3 · Where & When", "Step 2 of 3 · Who is going & Budget", "Step 3 of 3 · Where to send your quote"];

  function gotoStep(n) {
    currentStep = n;
    $$(".step", form).forEach(f => f.hidden = +f.dataset.step !== n);
    $("#bar").style.width = (n / 3 * 100) + "%";
    $("#step-label").textContent = STEP_TITLES[n];
    $("#back").hidden = n === 1;
    $("#submit").textContent = n === 3 ? "Get Firm Quote" : "Next Step";
  }
  $("#back").onclick = () => gotoStep(currentStep - 1);

  // Chip toggles inside form
  $$(".step .calc-pill input").forEach(input => {
    input.closest(".calc-pill").onclick = () => {
      const name = input.name;
      $$('input[name="' + name + '"]').forEach(i => i.closest(".calc-pill")?.classList.remove("active"));
      input.checked = true;
      input.closest(".calc-pill")?.classList.add("active");
      $("#err-dest")?.classList.remove("show");
      $("#err-group")?.classList.remove("show");
    };
  });

  form.addEventListener("input", () => {
    const v = form.elements;
    $("#bp-from").textContent = v.from.value.trim().slice(0, 14) || "Pune";
    $("#bp-to").textContent = v.dest.value || "Anywhere";
    $("#bp-group").textContent = v.group.value ? v.group.value + " Travellers" : "—";
  });

  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const f = form.elements;

    if (currentStep === 1) {
      if (!f.dest.value) {
        $("#err-dest").classList.add("show");
        return;
      }
      $("#err-dest").classList.remove("show");
      gotoStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!f.group.value) {
        $("#err-group").classList.add("show");
        return;
      }
      $("#err-group").classList.remove("show");
      gotoStep(3);
      return;
    }

    if (currentStep === 3) {
      let valid = true;
      if (!f.name.value.trim()) {
        $("#err-name").classList.add("show");
        valid = false;
      } else {
        $("#err-name").classList.remove("show");
      }

      if (!f.phone.value.trim() || f.phone.value.replace(/\\D/g, '').length < 10) {
        $("#err-phone").classList.add("show");
        valid = false;
      } else {
        $("#err-phone").classList.remove("show");
      }

      if (!valid) return;

      const rows = [
        ["Name", f.name.value.trim()],
        ["WhatsApp", f.phone.value.trim()],
        ["Destination", f.dest.value],
        ["From", f.from.value || "Pune/Mumbai"],
        ["Dates", f.when.value || "Upcoming dates"],
        ["Group Size", f.group.value + " Travellers"],
        ["Budget Band", f.budget.value ? "₹" + f.budget.value + "k" : "Custom"]
      ];

      $("#c-name").textContent = f.name.value.trim().split(" ")[0];
      $("#c-list").replaceChildren(...rows.map(([k, val]) => {
        const p = document.createElement("div");
        p.innerHTML = "<b>" + k + ":</b> " + val;
        return p;
      }));

      const waMsg = [
        "Hi Manav! I'd like a custom trip quote for my group:",
        ...rows.map(([k, val]) => "• *" + k + ":* " + val),
        "",
        "Please send us the customized day-by-day plan and split sheet."
      ].join("\\n");

      $("#c-wa").href = waLink(waMsg);
      form.hidden = true;
      $("#confirm").hidden = false;
      location.href = "#planner";
    }
  });

  $("#c-edit").onclick = () => {
    form.hidden = false;
    $("#confirm").hidden = true;
    gotoStep(1);
  };
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), htmlContent, 'utf8');
console.log('Successfully compiled refined, flaw-free travel site into index.html!');
