# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, French-language showcase website for **TF Renov64**, a renovation and construction company based in Orthez (64300). Plain HTML/CSS/JS: no build step, no package manager, no tests. It is deployed with **GitHub Pages from the `main` branch root**: https://nokiachollet-ux.github.io/Tod/ (Pages caches pages for about 10 min).

Business details supplied by the owner (use exactly these):
- Mobile 06 56 79 34 65 (`tel:+33656793465`), used for every "call" button. Landline 09 51 05 57 38 (`tel:+33951055738`), shown in the topbar, the footer and the contact page.
- SIRET 791 122 328 00028. Based in 64300 Orthez (no street address given).
- Service area: Pyrénées-Atlantiques (64), Landes (40), Hautes-Pyrénées (65).
- Not provided yet, so intentionally absent (don't invent them): email, opening hours, founding year, team size, figures, customer reviews, labels/certifications, real project photos. All photos are Unsplash/Pexels stock images.

All user-facing copy is in French.

**Public repository.** The repo must stay public for free GitHub Pages, so everything committed is readable by anyone, and every file outside a dot-folder is also served on the live site. Keep this guide in `.claude/` (Jekyll never publishes dot-folders) and don't add notes, prompts, drafts or a README at the root. Never commit anything the owner hasn't made public: personal email, home address, client names, quotes, invoices, credentials.

## Running locally

```bash
python3 -m http.server 8765     # then open http://localhost:8765/index.html
```

GSAP, Google Fonts and every photo (Unsplash/Pexels, hotlinked) load from CDNs, so the page needs network access to look right. Without GSAP the site still renders fully, just without animations (see below).

There is no test suite. Check layout changes in headless Chromium (Playwright is preinstalled in cloud sessions; use `NODE_PATH=$(npm root -g) node script.js`):
- **No horizontal scroll:** `document.documentElement.scrollWidth <= clientWidth` on all 5 pages, at widths from 320 to 1920 px.
- **Short laptop viewports** (1280×650, 1366×680), to check the hero.
- **The mobile menu in landscape** (740×360).
- **The page with real animations:** run it without `reducedMotion: 'reduce'` and scroll the page; otherwise `[data-reveal]` elements stay hidden.

## Architecture

**Pages.** There are 5 pages: `index.html`, `a-propos.html`, `services.html`, `contact.html`, plus `mentions-legales.html` (legal notice + privacy policy at `#confidentialite`, `noindex`, linked from the footer only; no nav item is active on it). They all share one `style.css` and one `script.js`. The header, the mobile menu, the footer and the `.mobile-bar` (sticky Call / Quote bar shown below 768 px) are **duplicated verbatim in each HTML file**. A change to any of them must be made in all 5 files.

**Services structure (owner's request: keep it simple for customers).** The client's trades are grouped into **three families**, used everywhere (home cards, Services page details + quick-access chips, footer, the "what to tell us" list on Contact):
1. **Toiture** (`#toiture`): couverture, charpente, zinguerie.
2. **Maçonnerie & façades** (`#maconnerie`): maçonnerie, enduits, peinture extérieure.
3. **Rénovation intérieure** (`#interieur`): placo, peinture intérieure, carrelage, salles de bains.

Don't add a new family or a stand-alone trade without the owner's request; a new trade goes inside one of the three.

**Content rule (owner's request).** Each content block lives on **one page only**, to avoid repetition:
- Guarantees (`.guarantees`): home page only.
- "Quatre étapes" (`.process`) and the FAQ: Services only.
- Service area (`.zone`): Contact only.
- The closing `.cta-band` has page-specific wording, distinct from the Contact hero.

Also avoid repeating the same fact within a single page (e.g. "un seul interlocuteur" belongs to the home "about" block, not also to the hero or the guarantees). Removed at the owner's request or because they relied on invented data: customer reviews, the team section, the towns shown as buttons, the key-figures strip, the "réalisations" gallery (stock photos) and the about-page timeline.

**Page layout pattern.** Every page has the same structure:
1. `.site-header`: a fixed header made of `.topbar` and `.nav`. When the page is scrolled past 40 px, the JS adds `.is-scrolled`, which slides the topbar away and gives the nav a light background.
2. `section.hero`: `position: sticky; top: 0` with `min-height: 100svh`. Inner pages add `.hero--page`.
3. `div.sheet`: holds all the other sections and slides over the sticky hero (rounded top, `z-index: 2`).
4. `footer.footer`.

`script.js` sets the hero's `top` to `min(0, innerHeight − heroHeight)`. This makes a hero taller than the viewport scroll to its bottom before it sticks. Don't reintroduce a fixed `height: 100vh` on `.hero`: the content would hide under the header on short laptops.

**Section spacing.** `.section` adds `padding-block: var(--section)`, and one general rule, `.section + :where(.section) { padding-top: 0 }`, stops two light sections in a row from stacking two paddings. The dark blocks (`.guarantees`, `.cta-band`) don't carry `.section`, so a light section after them keeps its full top padding with no extra rule. Don't add per-section `padding-top: 0` resets. Deliberate exceptions are plain class rules placed later in `style.css` (`.values`, `.about--page`, `.service-details`, `.chips-nav`); the `:where()` keeps the general rule weak enough for them to win. When reordering sections, avoid placing two dark blocks next to each other.

**Animations (`script.js` + CSS).** The animation system works in three layers:
- **Gating.** An inline script in each `<head>` adds `.js`, and adds `.anim` unless reduced motion is requested **or the viewport is taller than 1600 px** (search-engine renderers use a very tall viewport and never scroll, so scroll-revealed blocks would stay hidden). `script.js` skips all GSAP work when `.anim` is absent, and a `resize` handler (`showAll`) kills every animation and clears inline styles if the window later grows past 1600 px. `.hero`'s `min-height` is capped at `min(100svh, 1600px)` for the same reason. Keep the three 1600 values in sync. The hidden initial states (`.js.anim [data-reveal]`, `[data-reveal-img]`, the hero lines) are scoped to `.js.anim`. If GSAP fails to load or the user prefers reduced motion, `script.js` removes `.anim` and everything stays visible. Any new hidden-until-animated state must follow the same pattern. The hero's keyword line, lead and buttons are **never** hidden (only slid with `y`), so the home LCP is the lead text at first paint; only `.hero__eyebrow` (the breadcrumb on inner pages) and `.hero__scroll` start at opacity 0.
- **Data-attribute hooks**, set in the HTML and handled generically:
  - `data-reveal`: fade/slide in on scroll, via `ScrollTrigger.batch`. After the animation, the element gets `.is-in` and its inline styles are cleared so the CSS hover transitions work again.
  - `data-reveal-img`: clip-path "curtain" reveal.
  - `data-parallax`: scrubbed image parallax. The image is 120% tall, with `margin-top: -10%`.
- **Non-animation behaviour** sits above the GSAP early `return` in `script.js`, so it runs even without GSAP: footer year, broken-image fallback, header scroll state, hero sticky offset, mobile menu.

**SEO conventions.**
- Each `<h1>` starts with a `.hero__kicker` span (eyebrow style) carrying the page's keyword + town (e.g. "Couvreur, maçon et plaquiste à Orthez"), followed by the visual slogan lines. Keep one distinct target query per page; titles ≤ 60 characters, descriptions ≤ 160.
- The trade nouns people search for (couvreur, charpentier, zingueur, maçon, ravalement, plaquiste, peintre, carreleur) appear in the Services intro paragraphs; keep them when rewriting copy.
- Internal links use descriptive anchors ("Nos travaux de toiture", not "Voir le détail"); trade mentions in body text link to the matching `services.html#…` anchor.
- **The site is indexable** (the former github.io-only `noindex` script was removed so PageSpeed Insights can audit SEO). Only `mentions-legales.html` keeps a static `noindex`. If a duplicate go-live domain is added later, set a canonical to the final domain.
- Not done yet (need the final domain or owner input): canonical, sitemap.xml, robots.txt, 404 page, Open Graph, JSON-LD.

**Mobile menu.** Below 960 px, `#nav-links` becomes a full-screen overlay. It is hidden with `clip-path` plus `visibility`, so links aren't focusable while it is closed. It is scrollable for landscape phones. The JS closes it when the window is resized past 960 px; keep that value in sync with the CSS breakpoint.

**Quote request (`contact.html#devis`).** There is **no form** (owner's request: the old one wasn't wired to any backend). `#devis` is a single `.contact-box` card: the title, a short checklist of what to tell us, and the phone numbers and town (`.contact-card`) inside the same card. Every "Demander un devis" button on the site links to `contact.html#devis`. If a real form is wanted later (once hosting with PHP is in place), it goes back inside this card.

**CSS conventions.**
- BEM-like class names (`block__element--modifier`).
- Design tokens are defined in `:root`: navy / cream / terracotta colours, `--gutter`, `--section`, `--topbar-h`, `--nav-h`.
- **Contrast:** base `--terracotta` (#C8553D) is only 4.35:1 on white, so it is kept for decoration (dots, lines, icons, borders) and the large hero `em`. Text and button backgrounds on light surfaces use `--terracotta-600` (5.6:1 with white; hover `--terracotta-700`). On dark surfaces use `#F0B7A8` (`.eyebrow--light`).
- **Tap targets:** small standalone links (`.link-arrow`, breadcrumb, footer links) get `padding-block` (with an equal negative `margin-block` where the layout must not move) so the hit area is at least 32 px tall at 360 px wide.
- **Favicon:** `favicon.svg` (navy square + logo house), `favicon.ico` (16/32/48) and `apple-touch-icon.png` (180, square corners) at the root, linked with relative paths in every `<head>`. Regenerate the PNG/ICO from the SVG if the logo changes.
- **Alt texts** describe what the stock photo shows (trade-related words welcome) and differ between pages; never claim a photo shows the company's own work. Decorative/background images use `alt=""`.
- Fluid sizes use `clamp()`. Hero titles are also capped by viewport height (`min(…vw, …svh)`).
- Responsive overrides are grouped at the end of `style.css`, desktop-first, at these breakpoints: 1180 (compact header), 1080, 960 (burger menu; most grids collapse), 768 (phone layout, `.mobile-bar`), 600, 400 (buttons may wrap). There is also a landscape-menu query: `max-width: 960px` and `max-height: 520px`.
- Large images use `srcset` with 800 / 1400 / 2200 widths through the CDN's `w=` parameter.
