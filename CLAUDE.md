# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, French-language showcase website for a roofing craftsman ("couvreur"). Plain HTML/CSS/JS: no build step, no package manager, no tests. It is deployed with **GitHub Pages from the `main` branch root**: https://nokiachollet-ux.github.io/Tod/ (Pages caches pages for about 10 min).

All business details are still **placeholders in square brackets**: `[NOM]`, `[VILLE]`, `[DÉPARTEMENT]`, `[TÉLÉPHONE]`, `[EMAIL]`, `[ADRESSE]`, `[ANNÉE]`, `[Commune N]`, `[XX]`, etc. Keep them as placeholders unless the owner provides real values. Figures such as "25 ans", "1 200+" and "4,9/5" are examples, not real data. All user-facing copy is in French.

## Running locally

```bash
python3 -m http.server 8765     # then open http://localhost:8765/index.html
```

GSAP, Google Fonts and every photo (Unsplash/Pexels, hotlinked) load from CDNs, so the page needs network access to look right. Without GSAP the site still renders fully, just without animations (see below).

There is no test suite. Check layout changes in headless Chromium (Playwright is preinstalled in cloud sessions; use `NODE_PATH=$(npm root -g) node script.js`):
- **No horizontal scroll:** `document.documentElement.scrollWidth <= clientWidth` on all 4 pages, at widths from 320 to 1920 px.
- **Short laptop viewports** (1280×650, 1366×680), to check the hero.
- **The mobile menu in landscape** (740×360).
- **The page with real animations:** run it without `reducedMotion: 'reduce'` and scroll the page; otherwise `[data-reveal]` elements stay hidden.

## Architecture

**Pages.** There are 4 pages: `index.html`, `a-propos.html`, `services.html`, `contact.html`. They all share one `style.css` and one `script.js`. The header, the mobile menu, the footer and the `.mobile-bar` (sticky Call / Quote bar shown below 768 px) are **duplicated verbatim in each HTML file**. A change to any of them must be made in all 4 files.

**Content rule (owner's request).** Each content block lives on **one page only**, to avoid repetition:
- Guarantees and key figures (`.stats`): home page only.
- "Quatre étapes" (`.process`): Services only.
- Service area (`.zone`): Contact only.
- The closing `.cta-band` has page-specific wording, distinct from the Contact hero.

Also avoid repeating the same fact (e.g. "48 h", "garantie 10 ans") within a single page. Removed at the owner's request: the reviews section ("avis clients"), the team section, and the list of towns shown as buttons.

**Page layout pattern.** Every page has the same structure:
1. `.site-header`: a fixed header made of `.topbar` and `.nav`. When the page is scrolled past 40 px, the JS adds `.is-scrolled`, which slides the topbar away and gives the nav a light background.
2. `section.hero`: `position: sticky; top: 0` with `min-height: 100svh`. Inner pages add `.hero--page`.
3. `div.sheet`: holds all the other sections and slides over the sticky hero (rounded top, `z-index: 2`).
4. `footer.footer`.

`script.js` sets the hero's `top` to `min(0, innerHeight − heroHeight)`. This makes a hero taller than the viewport scroll to its bottom before it sticks. Don't reintroduce a fixed `height: 100vh` on `.hero`: the content would hide under the header on short laptops.

**Section spacing.** `.section` adds `padding-block: var(--section)`. Many sections reset `padding-top: 0` so that two light sections in a row don't stack two paddings. A light section that follows the dark `.guarantees` panel gets its top padding back via `.guarantees + .section`. When reordering sections, avoid placing two dark blocks (`.guarantees`, `.cta-band`) next to each other.

**Animations (`script.js` + CSS).** The animation system works in three layers:
- **Gating.** An inline script in each `<head>` adds `.js`, and adds `.anim` unless reduced motion is requested. The hidden initial states (`.js.anim [data-reveal]`, `[data-reveal-img]`, the hero lines) are scoped to `.js.anim`. If GSAP fails to load or the user prefers reduced motion, `script.js` removes `.anim` and everything stays visible. Any new hidden-until-animated state must follow the same pattern.
- **Data-attribute hooks**, set in the HTML and handled generically:
  - `data-reveal`: fade/slide in on scroll, via `ScrollTrigger.batch`. After the animation, the element gets `.is-in` and its inline styles are cleared so the CSS hover transitions work again.
  - `data-reveal-img`: clip-path "curtain" reveal.
  - `data-parallax`: scrubbed image parallax. The image is 120% tall, with `margin-top: -10%`.
  - `data-count` (with `data-decimals`): number counters, formatted for `fr-FR`.
- **Non-animation behaviour** sits above the GSAP early `return` in `script.js`, so it runs even without GSAP: footer year, broken-image fallback, header scroll state, hero sticky offset, mobile menu, form validation.

**Mobile menu.** Below 960 px, `#nav-links` becomes a full-screen overlay. It is hidden with `clip-path` plus `visibility`, so links aren't focusable while it is closed. It is scrollable for landscape phones. The JS closes it when the window is resized past 960 px; keep that value in sync with the CSS breakpoint.

**Quote form (`contact.html`).** It is **not wired to any backend**. `script.js` checks the `[required]` fields, then resets the form and shows `.quote-form__success`. To make it work, set the form's `action` to a real endpoint (Formspree, PHP…).

**CSS conventions.**
- BEM-like class names (`block__element--modifier`).
- Design tokens are defined in `:root`: navy / cream / terracotta colours, `--gutter`, `--section`, `--topbar-h`, `--nav-h`.
- Fluid sizes use `clamp()`. Hero titles are also capped by viewport height (`min(…vw, …svh)`).
- Responsive overrides are grouped at the end of `style.css`, desktop-first, at these breakpoints: 1180 (compact header), 1080, 960 (burger menu; most grids collapse), 768 (phone layout, `.mobile-bar`), 600, 400 (buttons may wrap). There is also a landscape-menu query: `max-width: 960px` and `max-height: 520px`.
- Large images use `srcset` with 800 / 1400 / 2200 widths through the CDN's `w=` parameter.
