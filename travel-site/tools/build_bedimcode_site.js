const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>document.documentElement.classList.add('js')</script>

  <title>Raut Expeditions | 100% Custom Group Travel by Manav Raut</title>
  <meta name="description" content="Custom group trips from Pune & Mumbai. Engineered around your budget, stay preference (Private Villa, Hotel, Hostel), and transport (Tempo, Train, Flight). Founded by Manav Raut.">
  <link rel="canonical" href="https://rautexpeditions.com/">

  <!-- Favicon -->
  <link rel="shortcut icon" href="favicon.svg" type="image/svg+xml">

  <!-- Remixicons CDN -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">

  <!-- Swiper CSS (Local) -->
  <link rel="stylesheet" href="swiper-bundle.min.css">

  <!-- Google Fonts: Raleway & Open Sans (Bedimcode Reference) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Raleway:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
  /*==================== BEDIMCODE DESIGN SYSTEM & VARIABLES ====================*/
  :root {
    --header-height: 4rem;

    /* Colors: Refined Emerald/Teal & Coral Accent (Bedimcode HSL Theme) */
    --hue-color: 190;
    --first-color: hsl(var(--hue-color), 64%, 22%);
    --first-color-second: hsl(var(--hue-color), 64%, 22%);
    --first-color-alt: hsl(var(--hue-color), 64%, 16%);
    --title-color: hsl(var(--hue-color), 64%, 18%);
    --text-color: hsl(var(--hue-color), 24%, 35%);
    --text-color-light: hsl(var(--hue-color), 8%, 60%);
    --input-color: hsl(var(--hue-color), 24%, 97%);
    --body-color: hsl(var(--hue-color), 100%, 99%);
    --card-color: #FFFFFF;
    --border-color: hsl(var(--hue-color), 20%, 90%);
    --white-color: #FFF;
    --scroll-bar-color: hsl(var(--hue-color), 12%, 90%);
    --scroll-thumb-color: hsl(var(--hue-color), 12%, 75%);

    /* Vibrant Accent for Travel SOP & CTAs */
    --accent-color: #FF5533;
    --accent-hover: #E04424;
    --accent-gradient: linear-gradient(135deg, #FF5533 0%, #FF7A59 100%);
    --accent-glow: 0 8px 24px -4px rgba(255, 85, 51, 0.4);

    /* Typography */
    --body-font: 'Open Sans', system-ui, sans-serif;
    --title-font: 'Raleway', system-ui, sans-serif;
    --display-font: 'Plus Jakarta Sans', system-ui, sans-serif;

    --biggest-font-size: 2.5rem;
    --h1-font-size: 1.5rem;
    --h2-font-size: 1.25rem;
    --h3-font-size: 1rem;
    --normal-font-size: .938rem;
    --small-font-size: .813rem;
    --smaller-font-size: .75rem;

    --font-medium: 500;
    --font-semi-bold: 600;
    --font-bold: 700;

    /* Margins */
    --mb-0-25: .25rem;
    --mb-0-5: .5rem;
    --mb-0-75: .75rem;
    --mb-1: 1rem;
    --mb-1-25: 1.25rem;
    --mb-1-5: 1.5rem;
    --mb-2: 2rem;
    --mb-2-5: 2.5rem;
    --mb-3: 3rem;

    /* z index */
    --z-tooltip: 10;
    --z-fixed: 100;

    /* Hover overlay */
    --img-transition: .4s cubic-bezier(0.16, 1, 0.3, 1);
    --img-scale: scale(1.08);

    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-full: 9999px;
  }

  @media screen and (min-width: 968px) {
    :root {
      --biggest-font-size: 3.75rem;
      --h1-font-size: 2.25rem;
      --h2-font-size: 1.75rem;
      --h3-font-size: 1.25rem;
      --normal-font-size: 1rem;
      --small-font-size: .875rem;
      --smaller-font-size: .813rem;
    }
  }

  /*==================== DARK THEME ====================*/
  body.dark-theme {
    --first-color-second: hsl(var(--hue-color), 54%, 12%);
    --title-color: hsl(var(--hue-color), 24%, 95%);
    --text-color: hsl(var(--hue-color), 8%, 75%);
    --input-color: hsl(var(--hue-color), 29%, 16%);
    --body-color: hsl(var(--hue-color), 29%, 10%);
    --card-color: hsl(var(--hue-color), 29%, 14%);
    --border-color: rgba(255, 255, 255, 0.08);
    --scroll-bar-color: hsl(var(--hue-color), 12%, 48%);
    --scroll-thumb-color: hsl(var(--hue-color), 12%, 36%);
  }

  /* Base Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: calc(var(--header-height) + 1rem);
  }

  body {
    font-family: var(--body-font);
    font-size: var(--normal-font-size);
    background-color: var(--body-color);
    color: var(--text-color);
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color .3s, color .3s;
  }

  h1, h2, h3, h4 {
    color: var(--title-color);
    font-weight: var(--font-bold);
    font-family: var(--title-font);
    line-height: 1.25;
  }

  ul {
    list-style: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img, video {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button, input, select, textarea {
    border: none;
    font-family: var(--body-font);
    font-size: var(--normal-font-size);
  }

  button {
    cursor: pointer;
  }

  input, textarea {
    outline: none;
  }

  /* Reusable Classes */
  .section {
    padding: 5.5rem 0 3rem;
  }

  .section__title {
    font-size: var(--h2-font-size);
    color: var(--title-color);
    text-align: center;
    margin-bottom: var(--mb-0-5);
  }

  .section__subtitle {
    display: block;
    font-size: var(--small-font-size);
    color: var(--accent-color);
    text-align: center;
    font-weight: var(--font-bold);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: var(--mb-2);
  }

  .section__desc {
    max-width: 640px;
    margin: 0 auto var(--mb-3);
    text-align: center;
    color: var(--text-color);
  }

  .container {
    max-width: 1140px;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
  }

  @media screen and (min-width: 1180px) {
    .container {
      margin-left: auto;
      margin-right: auto;
    }
  }

  .grid {
    display: grid;
    gap: 1.5rem;
  }

  /*==================== BUTTONS ====================*/
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    column-gap: .5rem;
    background-color: var(--first-color);
    color: var(--white-color);
    padding: 1rem 1.8rem;
    font-weight: var(--font-semi-bold);
    border-radius: var(--radius-sm);
    transition: all .3s ease;
    white-space: nowrap;
  }

  .button:hover {
    background-color: var(--first-color-alt);
    transform: translateY(-2px);
  }

  .button--accent {
    background: var(--accent-gradient);
    color: #FFFFFF;
    box-shadow: var(--accent-glow);
  }

  .button--accent:hover {
    box-shadow: 0 12px 28px -4px rgba(255, 85, 51, 0.5);
    transform: translateY(-2px);
  }

  .button--link {
    background: none;
    padding: 0;
    color: var(--white-color);
    font-weight: var(--font-semi-bold);
  }

  .button--link:hover {
    background: none;
    color: var(--accent-color);
    transform: none;
  }

  .button--flex {
    display: inline-flex;
    align-items: center;
    column-gap: .4rem;
  }

  .button--wa {
    background-color: #25D366;
    color: #FFFFFF;
    box-shadow: 0 6px 20px -3px rgba(37, 211, 102, 0.4);
  }

  .button--wa:hover {
    background-color: #20BA5A;
  }

  /*==================== HEADER & NAV (BEDIMCODE STYLE) ====================*/
  .header {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-fixed);
    background-color: transparent;
    transition: background-color .4s, box-shadow .4s, backdrop-filter .4s;
  }

  .nav {
    height: var(--header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav__logo {
    display: flex;
    align-items: center;
    gap: .5rem;
    color: var(--white-color);
    font-weight: var(--font-bold);
    font-family: var(--display-font);
    font-size: 1.15rem;
    letter-spacing: -.02em;
  }

  .nav__logo-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--accent-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFF;
    font-size: 1.1rem;
  }

  .nav__logo-sub {
    font-size: .68rem;
    display: block;
    font-weight: var(--font-semi-bold);
    color: var(--accent-color);
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .nav__menu {
    position: relative;
  }

  .nav__list {
    display: flex;
    align-items: center;
    column-gap: 2rem;
  }

  .nav__link {
    color: var(--text-color-light);
    font-weight: var(--font-semi-bold);
    text-transform: uppercase;
    font-size: var(--smaller-font-size);
    letter-spacing: .06em;
    transition: color .3s;
    white-space: nowrap;
  }

  .nav__link:hover, .active-link {
    color: var(--white-color);
  }

  .active-link {
    position: relative;
  }

  .active-link::after {
    content: '';
    position: absolute;
    bottom: -.5rem;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-color);
    border-radius: var(--radius-full);
  }

  .nav__actions {
    display: flex;
    align-items: center;
    column-gap: 1.25rem;
  }

  .change-theme {
    color: var(--white-color);
    font-size: 1.25rem;
    cursor: pointer;
    transition: color .3s, transform .3s;
  }

  .change-theme:hover {
    color: var(--accent-color);
    transform: rotate(20deg);
  }

  .nav__cta-wa {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .5rem 1rem;
    background: rgba(37, 211, 102, 0.15);
    color: #25D366;
    border: 1px solid rgba(37, 211, 102, 0.35);
    border-radius: var(--radius-full);
    font-size: var(--smaller-font-size);
    font-weight: var(--font-bold);
  }

  .nav__cta-wa:hover {
    background: #25D366;
    color: #FFF;
  }

  .nav__toggle, .nav__close {
    font-size: 1.35rem;
    cursor: pointer;
  }

  .nav__toggle {
    color: var(--white-color);
    display: none;
  }

  /* Scrolled Header */
  .scroll-header {
    background-color: var(--body-color);
    box-shadow: 0 4px 20px rgba(14, 55, 63, 0.12);
  }

  .scroll-header .nav__logo {
    color: var(--title-color);
  }

  .scroll-header .nav__link {
    color: var(--text-color);
  }

  .scroll-header .nav__link:hover, 
  .scroll-header .active-link {
    color: var(--accent-color);
  }

  .scroll-header .change-theme,
  .scroll-header .nav__toggle {
    color: var(--title-color);
  }

  @media screen and (max-width: 890px) {
    .nav__menu {
      position: fixed;
      background-color: var(--body-color);
      top: 0;
      right: -100%;
      width: 75%;
      height: 100vh;
      box-shadow: -2px 0 12px rgba(14, 55, 63, 0.2);
      padding: 4rem 2rem 2rem;
      transition: .4s ease;
      z-index: var(--z-fixed);
    }
    .nav__list {
      flex-direction: column;
      row-gap: 2rem;
      align-items: flex-start;
    }
    .nav__link {
      font-size: var(--normal-font-size);
      color: var(--title-color);
    }
    .nav__close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      color: var(--title-color);
    }
    .nav__toggle {
      display: block;
    }
    .show-menu {
      right: 0;
    }
  }

  /*==================== HOME (HERO) ====================*/
  .home {
    position: relative;
    height: 100vh;
    min-height: 640px;
    background-color: #070A12;
  }

  .home__img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(0.65);
  }

  .home__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7, 10, 18, 0.4) 0%, rgba(7, 10, 18, 0.85) 100%);
  }

  .home__container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;
  }

  .home__data {
    max-width: 680px;
    margin-top: 2rem;
  }

  .home__data-subtitle {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    font-size: var(--small-font-size);
    font-weight: var(--font-bold);
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--accent-color);
    margin-bottom: var(--mb-0-75);
    background: rgba(255, 85, 51, 0.12);
    padding: .35rem .9rem;
    border-radius: var(--radius-full);
  }

  .home__data-title {
    color: var(--white-color);
    font-size: var(--biggest-font-size);
    font-weight: var(--font-medium);
    margin-bottom: var(--mb-1-5);
    line-height: 1.15;
  }

  .home__data-title b {
    font-weight: var(--font-bold);
    color: #FFFFFF;
  }

  .home__data-desc {
    color: #CBD5E1;
    font-size: var(--normal-font-size);
    margin-bottom: var(--mb-2);
    max-width: 540px;
  }

  .home__btns {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .home__social {
    position: absolute;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;
    z-index: 2;
  }

  .home__social-link {
    color: var(--white-color);
    font-size: 1.35rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .3s ease;
  }

  .home__social-link:hover {
    background: var(--accent-color);
    color: #FFF;
    transform: scale(1.15);
  }

  @media screen and (max-width: 768px) {
    .home__social {
      position: static;
      flex-direction: row;
      column-gap: 1.25rem;
      margin-top: 2rem;
      transform: none;
    }
  }

  /* Bedimcode home info preview card (Floating at bottom-right) */
  .home__info {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    background-color: rgba(14, 55, 63, 0.85);
    backdrop-filter: blur(12px);
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    column-gap: 1rem;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 2;
  }

  .home__info-title {
    display: block;
    color: var(--white-color);
    font-size: var(--small-font-size);
    font-weight: var(--font-semi-bold);
    margin-bottom: var(--mb-0-25);
  }

  .home__info-sub {
    font-size: var(--smaller-font-size);
    color: var(--text-color-light);
  }

  .home__info-overlay {
    width: 70px;
    height: 70px;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .home__info-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--img-transition);
  }

  .home__info:hover .home__info-img {
    transform: var(--img-scale);
  }

  @media screen and (max-width: 968px) {
    .home__info {
      display: none;
    }
  }

  /*==================== ABOUT (THE MANAV RAUT SOP) ====================*/
  .about__container {
    grid-template-columns: 1fr;
    row-gap: 3rem;
    align-items: center;
  }

  @media screen and (min-width: 768px) {
    .about__container {
      grid-template-columns: repeat(2, 1fr);
      column-gap: 3.5rem;
    }
  }

  .about__data {
    text-align: left;
  }

  .about__title {
    text-align: left;
    margin-bottom: var(--mb-1-5);
  }

  .about__description {
    margin-bottom: var(--mb-1-5);
    color: var(--text-color);
    line-height: 1.7;
  }

  .about__sop-points {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    margin-bottom: var(--mb-2);
  }

  .about__sop-point {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    font-size: var(--small-font-size);
    color: var(--title-color);
    font-weight: var(--font-semi-bold);
  }

  .about__sop-point i {
    color: var(--accent-color);
    font-size: 1.1rem;
    margin-top: 2px;
  }

  /* Overlapping images (Bedimcode signature layout) */
  .about__img {
    display: flex;
    column-gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  .about__img-overlay {
    overflow: hidden;
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(14, 55, 63, 0.15);
  }

  .about__img-one {
    width: 180px;
    height: 280px;
    object-fit: cover;
    transition: var(--img-transition);
  }

  .about__img-two {
    width: 240px;
    height: 360px;
    object-fit: cover;
    transition: var(--img-transition);
  }

  .about__img-one:hover, .about__img-two:hover {
    transform: var(--img-scale);
  }

  /*==================== DISCOVER (SWIPER 3D COVERFLOW) ====================*/
  .discover__container {
    overflow: hidden;
    padding: 2rem 0;
  }

  .discover__card {
    position: relative;
    width: 250px;
    height: 360px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(14, 55, 63, 0.2);
    cursor: pointer;
  }

  .discover__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--img-transition);
  }

  .discover__card:hover .discover__img {
    transform: var(--img-scale);
  }

  .discover__data {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    z-index: 2;
  }

  .discover__card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(7, 10, 18, 0.85) 100%);
  }

  .discover__title {
    color: var(--white-color);
    font-size: var(--h3-font-size);
    margin-bottom: var(--mb-0-25);
  }

  .discover__description {
    display: block;
    color: #E2E8F0;
    font-size: var(--smaller-font-size);
    font-weight: var(--font-medium);
  }

  /*==================== EXPERIENCE (BEDIMCODE STATS) ====================*/
  .experience__container {
    row-gap: 2.5rem;
    justify-content: center;
    align-items: center;
  }

  @media screen and (min-width: 768px) {
    .experience__container {
      grid-template-columns: repeat(2, 1fr);
      column-gap: 3rem;
    }
  }

  .experience__content {
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1.5rem;
    justify-items: center;
    text-align: center;
  }

  .experience__number {
    font-size: var(--biggest-font-size);
    font-weight: var(--font-bold);
    color: var(--accent-color);
    margin-bottom: var(--mb-0-5);
  }

  .experience__description {
    font-size: var(--small-font-size);
    font-weight: var(--font-semi-bold);
  }

  .experience__img {
    position: relative;
    padding-bottom: 2rem;
  }

  .experience__overlay {
    overflow: hidden;
    border-radius: var(--radius-md);
    box-shadow: 0 10px 25px rgba(14, 55, 63, 0.15);
  }

  .experience__overlay:nth-child(1) {
    width: 280px;
    margin-right: 2rem;
  }

  .experience__overlay:nth-child(2) {
    width: 150px;
    position: absolute;
    top: 2.5rem;
    right: 0;
  }

  .experience__img-one, .experience__img-two {
    transition: var(--img-transition);
  }

  .experience__img-one:hover, .experience__img-two:hover {
    transform: var(--img-scale);
  }

  /*==================== VIDEO (BEDIMCODE PLAY/PAUSE) ====================*/
  .video__container {
    padding-bottom: 1rem;
    max-width: 860px;
  }

  .video__content {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(14, 55, 63, 0.2);
  }

  .video__content video {
    width: 100%;
    max-height: 480px;
    object-fit: cover;
  }

  .video__button {
    position: absolute;
    right: 1.5rem;
    bottom: 1.5rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent-gradient);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--accent-glow);
    transition: transform .3s;
  }

  .video__button:hover {
    transform: scale(1.12);
  }

  .video__button-icon {
    font-size: 1.5rem;
  }

  /*==================== PLACES & STAYS (BEDIMCODE CARD GRID) ====================*/
  .place__container {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .place__card {
    position: relative;
    height: 320px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(14, 55, 63, 0.12);
    cursor: pointer;
  }

  .place__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--img-transition);
  }

  .place__card:hover .place__img {
    transform: var(--img-scale);
  }

  .place__card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7, 10, 18, 0.2) 0%, rgba(7, 10, 18, 0.88) 100%);
  }

  .place__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.25rem;
    z-index: 2;
  }

  .place__rating {
    align-self: flex-end;
    display: flex;
    align-items: center;
    background: rgba(14, 55, 63, 0.7);
    backdrop-filter: blur(8px);
    padding: .3rem .6rem;
    border-radius: var(--radius-full);
    color: var(--white-color);
  }

  .place__rating-icon {
    font-size: .85rem;
    color: #F59E0B;
    margin-right: .25rem;
  }

  .place__rating-number {
    font-size: var(--small-font-size);
    font-weight: var(--font-bold);
  }

  .place__data {
    color: var(--white-color);
  }

  .place__title {
    color: var(--white-color);
    font-size: var(--h3-font-size);
    margin-bottom: var(--mb-0-25);
  }

  .place__subtitle {
    display: block;
    font-size: var(--smaller-font-size);
    color: #CBD5E1;
    margin-bottom: var(--mb-0-5);
  }

  .place__price {
    display: block;
    font-size: 1.15rem;
    font-weight: var(--font-bold);
    color: #FF7A59;
  }

  .place__button {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg) 0 var(--radius-lg) 0;
    background: var(--accent-gradient);
    color: #FFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: background .3s;
  }

  .place__button:hover {
    background: var(--accent-color);
  }

  /*==================== INTERACTIVE SPLIT CALCULATOR ====================*/
  .calc-section {
    background-color: var(--body-color);
  }

  .calc__box {
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 2.5rem;
    box-shadow: 0 10px 30px rgba(14, 55, 63, 0.08);
  }

  @media screen and (max-width: 860px) {
    .calc__box {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
  }

  .calc__field {
    margin-bottom: 1.5rem;
  }

  .calc__label {
    display: block;
    font-size: var(--small-font-size);
    font-weight: var(--font-bold);
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--title-color);
    margin-bottom: .75rem;
  }

  .calc-pill-group {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
  }

  .calc-pill {
    padding: .5rem 1.1rem;
    font-size: var(--small-font-size);
    font-weight: var(--font-semi-bold);
    border-radius: var(--radius-full);
    background: var(--input-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    transition: all .2s;
  }

  .calc-pill.active {
    background: var(--first-color);
    color: var(--white-color);
    border-color: var(--first-color);
  }

  .calc-range {
    width: 100%;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--border-color);
    outline: none;
    cursor: pointer;
    margin: .75rem 0 .5rem;
    -webkit-appearance: none;
  }

  .calc-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent-color);
    border: 3px solid #FFF;
    box-shadow: 0 2px 8px rgba(255, 85, 51, 0.4);
    cursor: pointer;
  }

  .calc-tier-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: .75rem;
  }

  .calc-radio {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: .75rem 1rem;
    background: var(--input-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: var(--small-font-size);
    font-weight: var(--font-semi-bold);
    color: var(--text-color);
    cursor: pointer;
    transition: all .2s;
  }

  .calc-radio input {
    position: absolute;
    opacity: 0;
  }

  .calc-radio.active {
    background: var(--card-color);
    border-color: var(--accent-color);
    color: var(--accent-color);
    box-shadow: 0 4px 12px rgba(255, 85, 51, 0.15);
  }

  /* Output Summary Card */
  .calc__summary {
    background: linear-gradient(180deg, var(--first-color) 0%, var(--first-color-alt) 100%);
    color: var(--white-color);
    border-radius: var(--radius-md);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .calc__price-box {
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .calc__price-title {
    font-size: var(--smaller-font-size);
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #FF9A7B;
    font-weight: var(--font-bold);
  }

  .calc__price-val {
    font-size: 2.4rem;
    font-weight: var(--font-bold);
    color: #FFF;
    margin: .25rem 0 .5rem;
  }

  .calc__price-val span {
    font-size: 1.2rem;
    color: #FF5533;
  }

  .calc__price-val small {
    font-size: var(--small-font-size);
    color: #CBD5E1;
    font-weight: normal;
  }

  .cost-breakdown {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .75rem;
    font-size: var(--small-font-size);
    margin-bottom: 1.5rem;
  }

  .cost-breakdown li {
    display: flex;
    justify-content: space-between;
    color: #CBD5E1;
  }

  .cost-breakdown li b {
    color: #FFF;
  }

  /*==================== DELAY SCRUBBER ====================*/
  .delay__box {
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2.5rem;
  }

  @media screen and (max-width: 860px) {
    .delay__box {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
  }

  .delay-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin: 1rem 0 1.5rem;
  }

  .delay-chip {
    padding: .5rem 1rem;
    font-size: var(--small-font-size);
    font-weight: var(--font-bold);
    border-radius: var(--radius-full);
    background: var(--input-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .delay-chip.active {
    background: var(--accent-color);
    color: #FFF;
    border-color: var(--accent-color);
  }

  .delay-advisor-box {
    background: var(--body-color);
    border-left: 4px solid var(--accent-color);
    border-radius: var(--radius-sm);
    padding: 1.25rem;
  }

  .advisor-head {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-weight: var(--font-bold);
    color: var(--title-color);
    font-size: var(--small-font-size);
    margin-bottom: .5rem;
  }

  /* Timeline Ticket */
  .ticket {
    background: var(--body-color);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
  }

  .daytabs {
    display: flex;
    gap: .5rem;
    margin-bottom: 1.25rem;
  }

  .daytab {
    padding: .5rem 1rem;
    font-size: var(--smaller-font-size);
    font-weight: var(--font-bold);
    border-radius: var(--radius-full);
    background: var(--input-color);
    color: var(--text-color);
  }

  .daytab[aria-selected="true"] {
    background: var(--title-color);
    color: #FFF;
  }

  .sched {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .75rem;
    margin-top: 1rem;
  }

  .sched li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    font-size: var(--small-font-size);
    padding-bottom: .75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .sched li:last-child {
    border-bottom: none;
  }

  .sched time {
    font-weight: var(--font-bold);
    color: var(--text-color-light);
    min-width: 48px;
  }

  .tag {
    display: inline-block;
    padding: 2px 6px;
    font-size: .65rem;
    font-weight: var(--font-bold);
    border-radius: 4px;
    margin-right: 6px;
  }

  .tag.eat { background: #FEF3C7; color: #B45309; }
  .tag.stop { background: #FEE2E2; color: #B91C1C; }
  .tag.cut { background: #E2E8F0; color: #64748B; }

  .ticket.is-late li[data-cut] {
    opacity: 0.35;
    text-decoration: line-through;
  }

  /*==================== 3-STEP CUSTOM PLANNER ====================*/
  .planner__box {
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 2.5rem;
  }

  @media screen and (max-width: 860px) {
    .planner__box {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
  }

  .planner-progress {
    margin-bottom: 1.5rem;
  }

  .progress-bar-bg {
    width: 100%;
    height: 6px;
    background: var(--input-color);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: .5rem;
  }

  .progress-bar-fill {
    width: 33.33%;
    height: 100%;
    background: var(--accent-gradient);
    transition: width .3s;
  }

  .form-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }

  @media screen and (max-width: 600px) {
    .form-inputs {
      grid-template-columns: 1fr;
    }
  }

  .form-field label {
    display: block;
    font-size: var(--small-font-size);
    font-weight: var(--font-bold);
    color: var(--title-color);
    margin-bottom: .4rem;
  }

  .form-field input, .form-field textarea {
    width: 100%;
    padding: .85rem 1rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    background: var(--input-color);
    color: var(--title-color);
  }

  .form-field input:focus, .form-field textarea:focus {
    border-color: var(--accent-color);
  }

  .choice-grid {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin: .5rem 0 1rem;
  }

  .choice-chip {
    padding: .5rem 1rem;
    background: var(--input-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-full);
    font-size: var(--small-font-size);
    font-weight: var(--font-semi-bold);
    cursor: pointer;
  }

  .choice-chip input {
    position: absolute;
    opacity: 0;
  }

  .choice-chip:has(input:checked) {
    background: var(--first-color);
    color: #FFF;
    border-color: var(--first-color);
  }

  .planner__summary {
    background: var(--first-color);
    color: #FFF;
    border-radius: var(--radius-md);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /*==================== FOOTER ====================*/
  .footer__container {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2.5rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--border-color);
  }

  .footer__title {
    font-size: var(--h3-font-size);
    margin-bottom: var(--mb-1);
  }

  .footer__links {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    font-size: var(--small-font-size);
  }

  .footer__link:hover {
    color: var(--accent-color);
  }

  .footer__rights {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
    font-size: var(--smaller-font-size);
    flex-wrap: wrap;
    gap: 1rem;
  }

  /* Scroll Up */
  .scrollup {
    position: fixed;
    right: 1.5rem;
    bottom: -20%;
    background-color: var(--first-color);
    padding: .6rem;
    display: flex;
    opacity: .9;
    z-index: var(--z-tooltip);
    transition: .4s;
    border-radius: var(--radius-sm);
    color: var(--white-color);
  }

  .scrollup:hover {
    background-color: var(--first-color-alt);
    opacity: 1;
  }

  .show-scroll {
    bottom: 5rem;
  }
  </style>
</head>
<body>

  <!--==================== HEADER & NAVBAR (BEDIMCODE STYLE) ====================-->
  <header class="header" id="header">
    <nav class="nav container">
      <a href="#home" class="nav__logo">
        <div class="nav__logo-icon"><i class="ri-compass-3-line"></i></div>
        <div>
          <span>Raut Expeditions</span>
          <span class="nav__logo-sub">Custom Travel SOP</span>
        </div>
      </a>

      <div class="nav__menu" id="nav-menu">
        <ul class="nav__list">
          <li class="nav__item"><a href="#home" class="nav__link active-link">Home</a></li>
          <li class="nav__item"><a href="#about" class="nav__link">About SOP</a></li>
          <li class="nav__item"><a href="#discover" class="nav__link">Discover</a></li>
          <li class="nav__item"><a href="#place" class="nav__link">Stays &amp; Transit</a></li>
          <li class="nav__item"><a href="#calculator" class="nav__link">Split Engine</a></li>
          <li class="nav__item"><a href="#sample" class="nav__link">Delay Scrubber</a></li>
          <li class="nav__item"><a href="#planner" class="nav__link">Plan Trip</a></li>
        </ul>

        <i class="ri-close-line nav__close" id="nav-close"></i>
      </div>

      <div class="nav__actions">
        <!-- Theme Dark/Light Switcher -->
        <i class="ri-moon-line change-theme" id="theme-button" title="Toggle Theme"></i>

        <!-- WhatsApp Hotline -->
        <a class="nav__cta-wa" data-wa target="_blank" rel="noopener">
          <i class="ri-whatsapp-line"></i>
          <span>WhatsApp Manav</span>
        </a>

        <!-- Burger Toggle (Mobile) -->
        <div class="nav__toggle" id="nav-toggle">
          <i class="ri-function-line"></i>
        </div>
      </div>
    </nav>
  </header>

  <main class="main">
    <!--==================== HOME (HERO) ====================-->
    <section class="home" id="home">
      <img src="assets/img/home1.jpg" alt="Scenic Group Expedition" class="home__img">
      <div class="home__overlay"></div>

      <div class="home__container container">
        <div class="home__data">
          <span class="home__data-subtitle">✨ 100% Tailored Group Travel · Ex-Pune &amp; Mumbai</span>
          <h1 class="home__data-title">Don't Fit Into A Tour Package.<br><b>Build The Trip Around Your Crew.</b></h1>
          <p class="home__data-desc">Founded by <strong>Manav Raut</strong>. We never force you onto stranger buses or rigid 6 AM alarms. We engineer every hour around your exact <strong>Budget</strong>, your <strong>Stay Preference</strong> (Private Villa, Hotel, or Hostel), and seamless <strong>Transit</strong> (Doorstep AC Tempo, Train, or Flight).</p>
          <div class="home__btns">
            <a href="#calculator" class="button button--accent">Configure Group Split</a>
            <a href="#about" class="button button--flex">The Manav SOP <i class="ri-arrow-right-line"></i></a>
          </div>
        </div>

        <!-- Vertical Social Links -->
        <div class="home__social">
          <a data-wa target="_blank" rel="noopener" class="home__social-link" title="Chat on WhatsApp"><i class="ri-whatsapp-line"></i></a>
          <a id="ig" target="_blank" rel="noopener" class="home__social-link" title="Follow on Instagram"><i class="ri-instagram-line"></i></a>
          <a href="#planner" class="home__social-link" title="Plan My Trip"><i class="ri-send-plane-line"></i></a>
        </div>

        <!-- Floating Bottom-Right Info Card (Bedimcode Reference) -->
        <div class="home__info">
          <div>
            <span class="home__info-title">Curated Stays &amp; Transit</span>
            <span class="home__info-sub">Villas · Hotels · Hostels</span>
            <a href="#place" class="button--link button--flex" style="margin-top: .5rem; font-size: .8rem">
              Explore Options <i class="ri-arrow-right-line"></i>
            </a>
          </div>
          <div class="home__info-overlay">
            <img src="assets/img/home2.jpg" alt="Preview stay" class="home__info-img">
          </div>
        </div>
      </div>
    </section>

    <!--==================== ABOUT (THE MANAV RAUT SOP) ====================-->
    <section class="about section" id="about">
      <div class="about__container container grid">
        <div class="about__data">
          <span class="section__subtitle">The Anti-Package Philosophy</span>
          <h2 class="section__title about__title">"I Used To Hold The Tour Guide Flag.<br>Here Is Why I Stopped."</h2>
          <p class="about__description">Hi, I'm <strong>Manav Raut</strong>. I spent years in commercial travel watching agencies herd 40 strangers into cramped buses with rigid 6 AM alarms and bland buffets. Travel should be personal.<br><br>My SOP is simple: <strong>I plan everything 100% according to your group.</strong></p>
          
          <div class="about__sop-points">
            <div class="about__sop-point">
              <i class="ri-checkbox-circle-fill"></i>
              <span><b>Your Stay Type:</b> Private Pool Villas, Boutique 4★ Hotels, or Social Hostels.</span>
            </div>
            <div class="about__sop-point">
              <i class="ri-checkbox-circle-fill"></i>
              <span><b>Your Transit:</b> Doorstep AC Tempo Traveller, scenic IRCTC train berths, or synced flights.</span>
            </div>
            <div class="about__sop-point">
              <i class="ri-checkbox-circle-fill"></i>
              <span><b>Your Budget:</b> Reverse-engineered down to the rupee with transparent cost sheets.</span>
            </div>
            <div class="about__sop-point">
              <i class="ri-checkbox-circle-fill"></i>
              <span><b>Your Pace:</b> Sleep until 11 AM if you like; our on-road delay buffers absorb traffic dynamically.</span>
            </div>
          </div>

          <a href="#calculator" class="button button--accent">Calculate Fair Split</a>
        </div>

        <!-- Overlapping Images (Bedimcode signature layout) -->
        <div class="about__img">
          <div class="about__img-overlay">
            <img src="assets/img/about1.jpg" alt="Crew on the road" class="about__img-one">
          </div>
          <div class="about__img-overlay">
            <img src="img/trip-crew-560.webp" alt="Manav Raut trip crew" class="about__img-two">
          </div>
        </div>
      </div>
    </section>

    <!--==================== DISCOVER (SWIPER 3D COVERFLOW) ====================-->
    <section class="discover section" id="discover">
      <span class="section__subtitle">Signature Circuits</span>
      <h2 class="section__title">Discover Our Ground-Tested Routes</h2>
      <p class="section__desc">Swipe through the circuits we have walked, timed, and optimized. 100% customizable around your dates and budget.</p>

      <div class="discover__container container swiper-container">
        <div class="swiper-wrapper">
          <!-- Slide 1 -->
          <div class="discover__card swiper-slide" onclick="plan('custom', 'Rajasthan')">
            <img src="assets/img/discover1.jpg" alt="Rajasthan Circuit" class="discover__img">
            <div class="discover__data">
              <h3 class="discover__title">Rajasthan Circuit</h3>
              <span class="discover__description">6 Days / 5 Nights · Desert &amp; Forts</span>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="discover__card swiper-slide" onclick="plan('custom', 'Hampi–Gokarna')">
            <img src="img/trip-gokarna-800.webp" alt="Gokarna & Hampi" class="discover__img">
            <div class="discover__data">
              <h3 class="discover__title">Gokarna &amp; Hampi</h3>
              <span class="discover__description">5 Days / 4 Nights · Beach Treks &amp; Ruins</span>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="discover__card swiper-slide" onclick="plan('custom', 'Kerala')">
            <img src="img/trip-kerala-800.webp" alt="Kerala Backwaters" class="discover__img">
            <div class="discover__data">
              <h3 class="discover__title">Kerala Backwaters</h3>
              <span class="discover__description">3 Days / 2 Nights · Tea Hills &amp; Houseboats</span>
            </div>
          </div>

          <!-- Slide 4 -->
          <div class="discover__card swiper-slide" onclick="plan('custom', 'Goa')">
            <img src="img/trip-goa-800.webp" alt="Goa Hidden Gems" class="discover__img">
            <div class="discover__data">
              <h3 class="discover__title">Goa Private Villas</h3>
              <span class="discover__description">4 Days / 3 Nights · Pool Parties &amp; Lagoons</span>
            </div>
          </div>

          <!-- Slide 5 -->
          <div class="discover__card swiper-slide" onclick="plan('custom', 'Himachal/Uttarakhand')">
            <img src="assets/img/discover4.jpg" alt="Himachal Expeditions" class="discover__img">
            <div class="discover__data">
              <h3 class="discover__title">Himachal &amp; Parvati</h3>
              <span class="discover__description">7 Days / 6 Nights · Kasol, Manali &amp; Valleys</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--==================== EXPERIENCE (BEDIMCODE STATS) ====================-->
    <section class="experience section">
      <span class="section__subtitle">Track Record</span>
      <h2 class="section__title">With Our Ground Experience<br>We Plan Your Flawless Holiday</h2>

      <div class="experience__container container grid">
        <div class="experience__content grid">
          <div class="experience__data">
            <h2 class="experience__number">500+</h2>
            <span class="experience__description">Travellers <br> Planned For</span>
          </div>
          <div class="experience__data">
            <h2 class="experience__number">100%</h2>
            <span class="experience__description">Bespoke <br> Private SOP</span>
          </div>
          <div class="experience__data">
            <h2 class="experience__number">80K+</h2>
            <span class="experience__description">Instagram <br> Community</span>
          </div>
        </div>

        <div class="experience__img grid">
          <div class="experience__overlay">
            <img src="img/real-rajasthan-cover.webp" alt="Real trip cover" class="experience__img-one">
          </div>
          <div class="experience__overlay">
            <img src="assets/img/experience2.jpg" alt="Trip moment" class="experience__img-two">
          </div>
        </div>
      </div>
    </section>

    <!--==================== VIDEO (BEDIMCODE PLAY/PAUSE) ====================-->
    <section class="video section">
      <span class="section__subtitle">On-Road Reality</span>
      <h2 class="section__title">Watch A Real Group Roadtrip</h2>

      <div class="video__container container">
        <p class="section__desc">See what a true private expedition looks like on the road. No forced alarms, just good music, private vehicles, and stunning stops.</p>

        <div class="video__content">
          <video id="video-file" poster="img/poster-waterfall.webp" loop playsinline>
            <source src="video/waterfall.mp4" type="video/mp4">
          </video>

          <button class="video__button" id="video-button" aria-label="Play/Pause Video">
            <i class="ri-play-line video__button-icon" id="video-icon"></i>
          </button>
        </div>
      </div>
    </section>

    <!--==================== PLACES & STAYS (BEDIMCODE CARD GRID) ====================-->
    <section class="place section" id="place">
      <span class="section__subtitle">Stays &amp; Transit Options</span>
      <h2 class="section__title">Curated For Your Group's Vibe</h2>
      <p class="section__desc">Pick your stay preference and travel mode. Every booking is hand-selected and verified by Manav Raut.</p>

      <div class="place__container container grid">
        <!-- Card 1: Villa -->
        <div class="place__card" onclick="selectStay('villa')">
          <img src="img/trip-goa-800.webp" alt="Private Pool Villa" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">4.9</span></span>
            <div class="place__data">
              <h3 class="place__title">Private Pool Villa</h3>
              <span class="place__subtitle">Goa, Coorg &amp; Lonavala · 8–18 Pax</span>
              <span class="place__price">₹2,200 <small style="font-size:.7rem;color:#FFF">/ night share</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>

        <!-- Card 2: Boutique Hotel -->
        <div class="place__card" onclick="selectStay('hotel')">
          <img src="assets/img/place2.jpg" alt="Boutique Heritage Hotel" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">4.8</span></span>
            <div class="place__data">
              <h3 class="place__title">Boutique &amp; Heritage Hotel</h3>
              <span class="place__subtitle">Rajasthan &amp; Kerala · 3★/4★ AC</span>
              <span class="place__price">₹1,400 <small style="font-size:.7rem;color:#FFF">/ night share</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>

        <!-- Card 3: Social Hostel -->
        <div class="place__card" onclick="selectStay('hostel')">
          <img src="img/trip-gokarna-800.webp" alt="Social Backpacker Hostel" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">4.9</span></span>
            <div class="place__data">
              <h3 class="place__title">Social &amp; Surf Hostel</h3>
              <span class="place__subtitle">Gokarna &amp; North Goa · Bunk Pods</span>
              <span class="place__price">₹750 <small style="font-size:.7rem;color:#FFF">/ night share</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>

        <!-- Card 4: Tempo Traveller -->
        <div class="place__card" onclick="selectTrans('tempo')">
          <img src="assets/img/place4.jpg" alt="Doorstep AC Tempo Traveller" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">5.0</span></span>
            <div class="place__data">
              <h3 class="place__title">Doorstep AC Tempo</h3>
              <span class="place__subtitle">12–26 Seater · Door-to-Door Pickup</span>
              <span class="place__price">₹4,000 <small style="font-size:.7rem;color:#FFF">/ head approx</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>

        <!-- Card 5: Train -->
        <div class="place__card" onclick="selectTrans('train')">
          <img src="assets/img/place5.jpg" alt="Scenic Rail Expeditions" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">4.9</span></span>
            <div class="place__data">
              <h3 class="place__title">Scenic Train Expeditions</h3>
              <span class="place__subtitle">Konkan Railway &amp; Overnight Sleeper</span>
              <span class="place__price">₹2,400 <small style="font-size:.7rem;color:#FFF">/ head approx</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>

        <!-- Card 6: Flight -->
        <div class="place__card" onclick="selectTrans('flight')">
          <img src="assets/img/place1.jpg" alt="Flight & Airport Transfers" class="place__img">
          <div class="place__content">
            <span class="place__rating"><i class="ri-star-fill place__rating-icon"></i><span class="place__rating-number">4.8</span></span>
            <div class="place__data">
              <h3 class="place__title">Flight Sync + Transfers</h3>
              <span class="place__subtitle">Ex-Pune (PNQ) &amp; Mumbai (BOM)</span>
              <span class="place__price">₹7,500 <small style="font-size:.7rem;color:#FFF">/ head approx</small></span>
            </div>
          </div>
          <button class="place__button" title="Select this"><i class="ri-arrow-right-line"></i></button>
        </div>
      </div>
    </section>

    <!--==================== GROUP SPLIT ENGINE & CONFIGURATOR ====================-->
    <section class="calc-section section" id="calculator">
      <span class="section__subtitle">100% Configurable SOP</span>
      <h2 class="section__title">Custom Trip &amp; Split Configurator</h2>
      <p class="section__desc">Select destination, group size, stay type, and transportation. See the live transparent per-head split.</p>

      <div class="calc__box container">
        <div class="calc__controls">
          <!-- 1. Destination -->
          <div class="calc__field">
            <label class="calc__label">1. Select Destination</label>
            <div class="calc-pill-group" role="radiogroup">
              <button type="button" class="calc-pill active" data-dest="rajasthan">Rajasthan Circuit (6D/5N)</button>
              <button type="button" class="calc-pill" data-dest="gokarna">Gokarna &amp; Hampi (5D/4N)</button>
              <button type="button" class="calc-pill" data-dest="kerala">Kerala Backwaters (3D/2N)</button>
              <button type="button" class="calc-pill" data-dest="goa">Goa Hidden Gems (4D/3N)</button>
              <button type="button" class="calc-pill" data-dest="himachal">Himachal Circuit (7D/6N)</button>
            </div>
          </div>

          <!-- 2. Group Size Slider -->
          <div class="calc__field">
            <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
              <label class="calc__label">2. Group Size: <b id="slider-count" style="color:var(--accent-color)">12 Travellers</b></label>
              <span id="vehicle-fit" style="font-size:.8rem;color:var(--first-color);font-weight:bold">⭐ Perfect 12-Seater AC Tempo Fit</span>
            </div>
            <input type="range" id="group-slider" min="4" max="16" value="12" step="1" class="calc-range">
          </div>

          <!-- 3. Stay Choice -->
          <div class="calc__field">
            <label class="calc__label">3. Stay Preference</label>
            <div class="calc-tier-group">
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
          <div class="calc__field">
            <label class="calc__label">4. Transportation Mode</label>
            <div class="calc-tier-group">
              <label class="calc-radio active">
                <input type="radio" name="calc-trans" value="tempo" checked>
                <span>🚐 Doorstep Tempo</span>
              </label>
              <label class="calc-radio">
                <input type="radio" name="calc-trans" value="train">
                <span>🚆 Scenic Train</span>
              </label>
              <label class="calc-radio">
                <input type="radio" name="calc-trans" value="flight">
                <span>✈️ Flight Sync</span>
              </label>
              <label class="calc-radio">
                <input type="radio" name="calc-trans" value="selfdrive">
                <span>🚗 Road Convoy</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Output Summary Card -->
        <div class="calc__summary">
          <div class="calc__price-box">
            <span class="calc__price-title">Estimated Per-Person Share</span>
            <div class="calc__price-val"><span>₹</span><b id="per-head-amt">12,400</b> <small>/ person</small></div>
            <div style="font-size:.85rem;color:#E2E8F0">Total Group Pool: <b id="total-pool-amt">₹1,48,800</b></div>
          </div>

          <ul class="cost-breakdown">
            <li><span id="label-transit">🚐 Private Tempo + Tolls</span> <b id="item-transit">₹4,000 / head</b></li>
            <li><span id="label-stays">🏨 Verified 3★ Hotel &amp; Breakfast</span> <b id="item-stays">₹6,200 / head</b></li>
            <li><span>🎟️ Activity Passes &amp; Entry</span> <b id="item-passes">₹1,400 / head</b></li>
            <li><span>🛡️ Highway Buffer &amp; Contingency</span> <b id="item-buffer">₹800 / head</b></li>
          </ul>

          <div style="display:flex;flex-direction:column;gap:.75rem">
            <button class="button button--accent" id="copy-split-btn">
              <i class="ri-clipboard-line"></i> Copy Plan for WhatsApp
            </button>
            <button class="button" id="calc-plan-btn" style="background:rgba(255,255,255,0.15)">
              Plan With Manav Raut →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!--==================== DELAY MISSION CONTROL ====================-->
    <section class="section" id="sample">
      <span class="section__subtitle">Real-World Resilience</span>
      <h2 class="section__title">Delay Mission Control</h2>
      <p class="section__desc">See how Manav Raut's dynamic cut-lists handle Mumbai-Pune Expressway jams or delayed flights without ruining sunset views.</p>

      <div class="delay__box container">
        <div>
          <span class="section__subtitle" style="text-align:left">Interactive Simulator</span>
          <h3 style="margin-bottom:.5rem">Highway Delay: <span id="delay-status-text" style="color:var(--accent-color)">On Time (0 min)</span></h3>
          <p style="font-size:var(--small-font-size);color:var(--text-color);margin-bottom:1rem">Click a delay to watch our on-road protocol recalculate the schedule:</p>

          <div class="delay-buttons">
            <button type="button" class="delay-chip active" data-delay="0">On Time</button>
            <button type="button" class="delay-chip" data-delay="30">+30 min</button>
            <button type="button" class="delay-chip" data-delay="60">+60 min</button>
            <button type="button" class="delay-chip" data-delay="90">+90 min</button>
            <button type="button" class="delay-chip" data-delay="120">+120 min</button>
          </div>

          <div class="delay-advisor-box">
            <div class="advisor-head"><i class="ri-shield-check-line" style="color:var(--accent-color);font-size:1.2rem"></i> Manav Raut's Directive:</div>
            <p id="delay-directive" style="font-size:var(--small-font-size);line-height:1.6">All legs green. Mehrangarh zip-line at 14:30, Jaswant Thada at 17:00, relaxed dinner at Stepwell Square, train 20495 confirmed at 22:00.</p>
          </div>

          <button id="late" style="display:none"></button><span id="late-label" style="display:none"></span><p id="late-note" hidden></p>
        </div>

        <!-- Live Ticket -->
        <div class="ticket" id="ticket">
          <div class="daytabs">
            <button class="daytab" aria-selected="true" data-day="0">Rajasthan · Day 5</button>
            <button class="daytab" aria-selected="false" data-day="1">Rajasthan · Day 3</button>
            <button class="daytab" aria-selected="false" data-day="2">Kerala · Day 3</button>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <small id="t-day" style="color:var(--accent-color);font-weight:bold;text-transform:uppercase;font-size:.75rem">Day 5 · Jodhpur</small>
              <h4 id="t-title" style="margin-top:2px">Desert highway, zip-line, departure</h4>
            </div>
            <span style="font-size:.7rem;padding:3px 8px;background:rgba(37,211,102,0.15);color:#15803D;border-radius:99px;font-weight:bold">LIVE BLUEPRINT</span>
          </div>

          <div id="t-leg" style="background:var(--input-color);padding:.6rem .8rem;border-radius:var(--radius-sm);margin:1rem 0;font-size:var(--smaller-font-size)">
            <b>Transit leg:</b> Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.
          </div>

          <ul class="sched" id="t-sched">
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
    </section>

    <!--==================== 3-STEP CUSTOM TRIP PLANNER ====================-->
    <section class="section" id="planner">
      <span class="section__subtitle">Get Your Custom Quote</span>
      <h2 class="section__title">Plan Your Trip In 60 Seconds</h2>
      <p class="section__desc">Tell us where, when, and your group size. Manav Raut will prepare your custom blueprint within 24 hours.</p>

      <div class="planner__box container">
        <div>
          <form id="form" novalidate>
            <div class="planner-progress">
              <div class="progress-bar-bg"><div class="progress-bar-fill" id="bar"></div></div>
              <span id="step-label" style="font-size:var(--small-font-size);font-weight:bold">Step 1 of 3 · Where &amp; when</span>
            </div>

            <!-- Step 1 -->
            <fieldset class="step" data-step="1">
              <legend style="font-weight:bold;font-size:1.1rem;margin-bottom:.5rem">Where are you headed?</legend>
              <div class="choice-grid">
                <label class="choice-chip pk"><input type="radio" name="dest" value="Rajasthan"><span>Rajasthan</span></label>
                <label class="choice-chip pk"><input type="radio" name="dest" value="Kerala"><span>Kerala</span></label>
                <label class="choice-chip pk"><input type="radio" name="dest" value="Goa"><span>Goa</span></label>
                <label class="choice-chip pk"><input type="radio" name="dest" value="Hampi–Gokarna"><span>Hampi–Gokarna</span></label>
                <label class="choice-chip pk"><input type="radio" name="dest" value="Himachal/Uttarakhand"><span>Himachal</span></label>
                <label class="choice-chip pk"><input type="radio" name="dest" value="Other"><span>Other</span></label>
              </div>

              <div class="form-inputs">
                <div class="form-field">
                  <label for="from">Departure city</label>
                  <input id="from" name="from" type="text" placeholder="e.g. Pune" autocomplete="off">
                </div>
                <div class="form-field">
                  <label for="when">Dates or month</label>
                  <input id="when" name="when" type="text" placeholder="e.g. 15–20 Dec" autocomplete="off">
                </div>
              </div>

              <label class="calc__label">Mode of Travel</label>
              <div class="choice-grid">
                <label class="choice-chip pk"><input type="radio" name="travel" value="train"><span>Train</span></label>
                <label class="choice-chip pk"><input type="radio" name="travel" value="flight"><span>Flight</span></label>
                <label class="choice-chip pk"><input type="radio" name="travel" value="road"><span>Tempo / Road</span></label>
                <label class="choice-chip pk"><input type="radio" name="travel" value="flexible"><span>Advise us</span></label>
              </div>

              <label class="calc__label">Trip Duration</label>
              <div class="choice-grid">
                <label class="choice-chip pk"><input type="radio" name="triplen" value="2-3"><span>2–3 days</span></label>
                <label class="choice-chip pk"><input type="radio" name="triplen" value="4-5"><span>4–5 days</span></label>
                <label class="choice-chip pk"><input type="radio" name="triplen" value="6-8"><span>6–8 days</span></label>
                <label class="choice-chip pk"><input type="radio" name="triplen" value="9+"><span>9+ days</span></label>
              </div>
            </fieldset>

            <!-- Step 2 -->
            <fieldset class="step" data-step="2" hidden>
              <legend style="font-weight:bold;font-size:1.1rem;margin-bottom:.5rem">Group Size &amp; Budget</legend>
              <label class="calc__label">Group size</label>
              <div class="choice-grid">
                <label class="choice-chip pk"><input type="radio" name="group" value="1-2"><span>1–2</span></label>
                <label class="choice-chip pk"><input type="radio" name="group" value="3-6"><span>3–6</span></label>
                <label class="choice-chip pk"><input type="radio" name="group" value="7-12"><span>7–12</span></label>
                <label class="choice-chip pk"><input type="radio" name="group" value="13+"><span>13+</span></label>
              </div>

              <label class="calc__label">Target Budget per Person</label>
              <div class="choice-grid">
                <label class="choice-chip pk"><input type="radio" name="budget" value="5-10"><span>₹5k–₹10k</span></label>
                <label class="choice-chip pk"><input type="radio" name="budget" value="10-18"><span>₹10k–₹18k</span></label>
                <label class="choice-chip pk"><input type="radio" name="budget" value="18+"><span>₹18k+</span></label>
              </div>

              <div style="display:none">
                <input type="radio" name="service" value="custom" checked>
              </div>

              <div class="form-field" style="margin-top:1rem">
                <label for="notes">Notes / Special Preferences</label>
                <textarea id="notes" name="notes" rows="2" placeholder="e.g. Private pool villa preferred, late mornings, veg food only"></textarea>
              </div>
            </fieldset>

            <!-- Step 3 -->
            <fieldset class="step" data-step="3" hidden>
              <legend style="font-weight:bold;font-size:1.1rem;margin-bottom:.5rem">Where to send your quote?</legend>
              <div class="form-inputs">
                <div class="form-field">
                  <label for="name">Your Name</label>
                  <input id="name" name="name" type="text" placeholder="Full Name" autocomplete="name">
                </div>
                <div class="form-field">
                  <label for="phone">WhatsApp Number</label>
                  <input id="phone" name="phone" type="tel" placeholder="10-digit number" autocomplete="tel">
                </div>
              </div>

              <div style="display:none"><input id="website" name="website" type="text"></div>

              <label style="display:flex;align-items:center;gap:.5rem;font-size:var(--small-font-size);margin-top:1rem">
                <input type="checkbox" id="consent" checked>
                <span>Send my blueprint and split sheet to WhatsApp</span>
              </label>
            </fieldset>

            <div style="display:flex;gap:1rem;margin-top:1.5rem">
              <button type="button" class="button" id="back" style="background:var(--input-color);color:var(--title-color)" hidden>Back</button>
              <button type="submit" class="button button--accent" id="submit">Next Step</button>
            </div>
          </form>

          <!-- Confirmed State -->
          <div class="confirm" id="confirm" hidden>
            <h3 style="margin-bottom:.5rem">Got it, <span id="c-name"></span>!</h3>
            <p style="margin-bottom:1rem;font-size:var(--small-font-size)">Click below to message Manav Raut directly on WhatsApp with your exact blueprint parameters:</p>
            <dl id="c-list" style="margin-bottom:1rem;font-size:var(--small-font-size);line-height:1.6"></dl>
            <a class="button button--wa" id="c-wa" target="_blank" rel="noopener">
              <i class="ri-whatsapp-line"></i> Send Details on WhatsApp
            </a>
            <div id="next" hidden></div>
            <button class="button--link" id="c-edit" style="display:block;margin-top:1rem;color:var(--text-color)" type="button">Edit Details</button>
          </div>
        </div>

        <!-- Right Summary Preview -->
        <div class="planner__summary">
          <div>
            <span style="font-size:var(--smaller-font-size);text-transform:uppercase;letter-spacing:.08em;color:#FF9A7B;font-weight:bold">LIVE BLUEPRINT SPEC</span>
            <h3 style="color:#FFF;margin-top:.5rem"><span id="bp-from">Pune</span> ➔ <span id="bp-to">Anywhere</span></h3>
            <p style="font-size:var(--small-font-size);color:#CBD5E1;margin-top:.25rem">Group: <b id="bp-group" style="color:#FFF">—</b></p>
          </div>

          <div>
            <h4 style="color:#FFF;font-size:1.3rem">Firm Quote in 24 Hours</h4>
            <p style="font-size:var(--smaller-font-size);color:#CBD5E1;margin-top:.5rem">Personalized by Manav Raut. Itemized per-head split, stay confirmation, and travel logistics with zero agency markups.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!--==================== FOOTER (BEDIMCODE STYLE) ====================-->
  <footer class="footer section">
    <div class="footer__container container grid">
      <div class="footer__content">
        <a href="#home" class="footer__logo" style="display:flex;align-items:center;gap:.5rem;color:var(--title-color);font-weight:bold;font-size:1.2rem;margin-bottom:1rem">
          <div class="nav__logo-icon"><i class="ri-compass-3-line"></i></div>
          <span>Raut Expeditions</span>
        </a>
        <p class="footer__description" style="font-size:var(--small-font-size);line-height:1.6;margin-bottom:1rem">
          100% Tailored Private Group Expeditions from Pune &amp; Mumbai.<br>
          Engineered personally by founder Manav Raut.
        </p>
        <span style="font-size:var(--smaller-font-size);color:var(--text-color-light);font-weight:bold">UDYAM MSME REGISTERED · MH-26-0038921</span>
      </div>

      <div class="footer__data">
        <h3 class="footer__title">Signature Circuits</h3>
        <ul class="footer__links">
          <li><a href="#discover" class="footer__link">Rajasthan Circuit</a></li>
          <li><a href="#discover" class="footer__link">Gokarna &amp; Hampi</a></li>
          <li><a href="#discover" class="footer__link">Kerala Backwaters</a></li>
          <li><a href="#discover" class="footer__link">Goa Private Villas</a></li>
        </ul>
      </div>

      <div class="footer__data">
        <h3 class="footer__title">The Custom SOP</h3>
        <ul class="footer__links">
          <li><a href="#about" class="footer__link">Why No Fixed Packages</a></li>
          <li><a href="#place" class="footer__link">Villa / Hotel / Hostel Stays</a></li>
          <li><a href="#place" class="footer__link">Tempo / Train / Flight Transit</a></li>
          <li><a href="#sample" class="footer__link">Delay Scrubber Protocol</a></li>
        </ul>
      </div>

      <div class="footer__data">
        <h3 class="footer__title">Connect &amp; Talk</h3>
        <ul class="footer__links">
          <li><a id="ig2" target="_blank" rel="noopener" class="footer__link"><i class="ri-instagram-line"></i> @manav.raut.trips</a></li>
          <li><a data-wa target="_blank" rel="noopener" class="footer__link"><i class="ri-whatsapp-line"></i> WhatsApp Manav Directly</a></li>
          <li><a href="#calculator" class="footer__link"><i class="ri-calculator-line"></i> Split Configurator</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__rights container">
      <p class="footer__copy">&#169; <span id="yr"></span> Raut Expeditions. All rights reserved.</p>
      <div class="footer__terms">
        <a href="#about" class="footer__terms-link" style="color:var(--text-color-light)">Privacy &amp; Terms</a>
      </div>
    </div>
  </footer>

  <!-- Scroll Up Button -->
  <a href="#" class="scrollup" id="scroll-up" aria-label="Scroll to top">
    <i class="ri-arrow-up-line scrollup__icon"></i>
  </a>

  <!-- Swiper JS & ScrollReveal JS (Local) -->
  <script src="swiper-bundle.min.js"></script>
  <script src="scrollreveal.min.js"></script>

  <!-- Main JavaScript Logic -->
  <script>
  /*==================== RUNTIME CONFIG ====================*/
  const CFG = Object.assign({
    whatsapp: "919822012345",
    instagram: "manav.raut.trips",
    apiBase: ""
  }, window.SITE_CONFIG || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const waLink = text => "https://wa.me/" + CFG.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

  $$("[data-wa]").forEach(a => a.href = waLink("Hi Manav! I want to plan a custom trip for my group."));
  $("#ig").href = $("#ig2").href = "https://instagram.com/" + CFG.instagram;
  $("#yr").textContent = new Date().getFullYear();

  /*==================== BEDIMCODE MENU TOGGLE ====================*/
  const navMenu = document.getElementById('nav-menu'),
        navToggle = document.getElementById('nav-toggle'),
        navClose = document.getElementById('nav-close');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu');
    });
  }

  if (navClose) {
    navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
    });
  }

  const navLink = document.querySelectorAll('.nav__link');
  function linkAction() {
    navMenu.classList.remove('show-menu');
  }
  navLink.forEach(n => n.addEventListener('click', linkAction));

  /*==================== SCROLL HEADER (BEDIMCODE) ====================*/
  function scrollHeader() {
    const header = document.getElementById('header');
    if (this.scrollY >= 100) header.classList.add('scroll-header');
    else header.classList.remove('scroll-header');
  }
  window.addEventListener('scroll', scrollHeader);

  /*==================== SWIPER 3D COVERFLOW (BEDIMCODE) ====================*/
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

  /*==================== VIDEO PLAY/PAUSE (BEDIMCODE) ====================*/
  const videoFile = document.getElementById('video-file'),
        videoButton = document.getElementById('video-button'),
        videoIcon = document.getElementById('video-icon');

  function playPause() {
    if (videoFile.paused) {
      videoFile.play();
      videoIcon.classList.add('ri-pause-line');
      videoIcon.classList.remove('ri-play-line');
    } else {
      videoFile.pause();
      videoIcon.classList.remove('ri-pause-line');
      videoIcon.classList.add('ri-play-line');
    }
  }
  if (videoButton) videoButton.addEventListener('click', playPause);

  if (videoFile) {
    videoFile.addEventListener('ended', () => {
      videoIcon.classList.remove('ri-pause-line');
      videoIcon.classList.add('ri-play-line');
    });
  }

  /*==================== SCROLL UP BUTTON (BEDIMCODE) ====================*/
  function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    if (this.scrollY >= 200) scrollUp.classList.add('show-scroll');
    else scrollUp.classList.remove('show-scroll');
  }
  window.addEventListener('scroll', scrollUp);

  /*==================== DARK / LIGHT THEME TOGGLE (BEDIMCODE) ====================*/
  const themeButton = document.getElementById('theme-button');
  const darkTheme = 'dark-theme';
  const iconTheme = 'ri-sun-line';

  const selectedTheme = localStorage.getItem('selected-theme');
  const selectedIcon = localStorage.getItem('selected-icon');

  const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
  const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-sun-line' : 'ri-moon-line';

  if (selectedTheme) {
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
    themeButton.classList[selectedIcon === 'ri-sun-line' ? 'add' : 'remove'](iconTheme);
  }

  themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
  });

  /*==================== SCROLL REVEAL ANIMATIONS (BEDIMCODE) ====================*/
  if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
      distance: '60px',
      duration: 2200,
      reset: false,
    });

    sr.reveal('.home__data, .home__social, .home__info, .discover__container, .experience__data, .place__card, .calc__box, .delay__box, .planner__box', {
      origin: 'top',
      interval: 100,
    });

    sr.reveal('.about__data, .video__description', {
      origin: 'left',
    });

    sr.reveal('.about__img, .video__content', {
      origin: 'right',
      interval: 100,
    });
  }

  /*==================== GROUP SPLIT ENGINE (MANAV RAUT SOP) ====================*/
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
      i.closest(".calc-radio").classList.toggle("active", i.value === val);
    });
    updateSplitCalc();
    location.href = "#calculator";
  }

  function selectTrans(val) {
    currentCalcTrans = val;
    $$('input[name="calc-trans"]').forEach(i => {
      i.checked = i.value === val;
      i.closest(".calc-radio").classList.toggle("active", i.value === val);
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
      plan("custom", route.destKey);
    };
  }

  updateSplitCalc();

  /*==================== DELAY SIMULATOR ====================*/
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
    { day: "Day 5 · Jodhpur", title: "Desert highway, zip-line, departure", leg: "Jaisalmer → Jodhpur by Tempo Traveller (NH125), then train 20495 to Pune at 22:00.", note: "Drop Jaswant Thada. Protect the zip-line and the 22:00 train.",
      rows: [["08:00", "Breakfast and camp checkout", "eat"], ["08:30", "Depart for Jodhpur via NH125: 280–285 km, 4.5–6 hours"], ["14:30", "Flying Fox zip-line at Mehrangarh", "stop", "Operates 09:30–17:00"], ["17:00", "Jaswant Thada, a quick visit", "cut"], ["19:00", "Dinner at Stepwell Square", "eat"], ["20:30", "Drop at Jodhpur Junction, with safe buffer"], ["22:00", "Board train 20495 to Pune", "stop", "Confirmed on IRCTC"]] },
    { day: "Day 3 · Jaipur → Jaisalmer", title: "Pink City by day, desert train by night", leg: "Train 12468: Jaipur Jn 16:25 → Jaisalmer 05:05 next day.", note: "Drop Nahargarh. Keep the 15:30 start for the station.",
      rows: [["09:00", "City Palace and Jantar Mantar"], ["12:30", "Lunch at Nahargarh Fort with skyline view", "cut"], ["15:30", "Head to Jaipur Junction with luggage"], ["16:25", "Board train 12468 to Jaisalmer", "stop", "Confirmed on IRCTC"]] },
    { day: "Day 3 · Thekkady → Alleppey → Kochi", title: "Backwaters, then airport on time", leg: "Flight Kochi → Pune at 23:04. Reach airport by 18:30.", note: "Drop Kumarakom and lighthouse.",
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

  /*==================== PLANNER FORM ====================*/
  const form = $("#form");
  function plan(service, dest) {
    if (dest) form.elements.dest.value = dest;
    form.hidden = false; $("#confirm").hidden = true; gotoStep(1);
    location.href = "#planner";
  }

  let step = 1;
  const STEP_LABEL = ["", "Where & when", "Who's going & budget", "Where to send it"];

  function gotoStep(n) {
    step = n;
    $$(".step", form).forEach(f => f.hidden = +f.dataset.step !== n);
    $("#bar").style.width = (n / 3 * 100) + "%";
    $("#step-label").textContent = "Step " + n + " of 3 · " + STEP_LABEL[n];
    $("#back").hidden = n === 1;
    $("#submit").textContent = n === 3 ? "Get Firm Quote" : "Next Step";
  }
  $("#back").onclick = () => gotoStep(step - 1);

  form.addEventListener("input", () => {
    const v = form.elements;
    $("#bp-from").textContent = v.from.value.trim().slice(0, 14) || "Pune";
    $("#bp-to").textContent = v.dest.value || "Anywhere";
    $("#bp-group").textContent = v.group.value || "—";
  });

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
      location.href = "#planner";
    }
  });

  $("#c-edit").onclick = () => { form.hidden = false; $("#confirm").hidden = true; gotoStep(1); };
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), htmlContent, 'utf8');
console.log('Successfully compiled Bedimcode-referenced travel site into index.html!');
