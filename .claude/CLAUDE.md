# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, French-language showcase website for **TF Renov64**, a renovation and construction company based in Orthez (64300). Plain HTML/CSS/JS: no build step, no package manager, no tests. It is deployed with **GitHub Pages from the `main` branch root** on the custom domain **https://tfrenov64.fr** (the `CNAME` file; registrar IONOS, DNS: 4 A records to GitHub's 185.199.108–111.153 and `www` CNAME to `nokiachollet-ux.github.io`). The old https://nokiachollet-ux.github.io/Tod/ redirects there. `main` is protected by a ruleset (PR required), so GitHub's own "Custom domain" field can't commit `CNAME`: change the domain through a PR. Pages caches pages for about 10 min.

Business details supplied by the owner (use exactly these):
- Mobile 06 56 79 34 65 (`tel:+33656793465`), used for every "call" button. Landline 09 51 05 57 38 (`tel:+33951055738`), shown in the topbar, the footer and the contact page.
- SIRET 791 122 328 00028. Based in 64300 Orthez (no street address given).
- Service area: Pyrénées-Atlantiques (64), Landes (40), Hautes-Pyrénées (65).
- Not provided yet, so intentionally absent (don't invent them): email, opening hours, founding year, team size, figures, customer reviews, labels/certifications, real project photos. All photos are Unsplash/Pexels stock images.

All user-facing copy is in French.

**Public repository.** The repo must stay public for free GitHub Pages, so everything committed is readable by anyone, and every file outside a dot-folder is also served on the live site. Keep this guide in `.claude/` (Jekyll never publishes dot-folders) and don't add notes, prompts, drafts or a README at the root. Never commit anything the owner hasn't made public: personal email, home address, client names, quotes, invoices, credentials. **No comments in HTML, CSS or JS**: they are readable in the page source; explain design decisions in this guide instead.

## Running locally

```bash
python3 -m http.server 8765     # then open http://localhost:8765/index.html
```

Google Fonts and every photo (Unsplash/Pexels, hotlinked) load from CDNs, so the page needs network access to look right. There is no animation library any more (see "Motion" below).

There is no test suite. Check layout changes in headless Chromium (Playwright is preinstalled in cloud sessions; use `NODE_PATH=$(npm root -g) node script.js`):
- **No horizontal scroll:** `document.documentElement.scrollWidth <= clientWidth` on all 5 pages, at widths from 320 to 1920 px.
- **Short laptop viewports** (1280×800, 1366×680), to check that the home hero's "Demander un devis gratuit" button is above the fold.
- **The mobile menu in landscape** (740×360).
- **Hallmark's linter** (see "Design system" below), the check the redesign was built against.

## Architecture

**Pages.** There are 5 pages (plus `404.html`, below): `index.html`, `a-propos.html`, `services.html`, `contact.html`, plus `mentions-legales.html` (legal notice + privacy policy at `#confidentialite`, `noindex`, linked from the footer only; no nav item is active on it). They all share one `style.css` and one `script.js`. The header, the mobile menu, the footer and the `.mobile-bar` (sticky Call / Quote bar shown below 768 px) are **duplicated verbatim in each HTML file**. A change to any of them must be made in all 5 files.

**Services structure (owner's request: keep it simple for customers).** The client's trades are grouped into **three families**, used everywhere (home cards, Services page details + quick-access chips, footer, the "what to tell us" list on Contact):
1. **Toiture** (`#toiture`): couverture, charpente, zinguerie.
2. **Maçonnerie & façades** (`#maconnerie`): maçonnerie, enduits, peinture extérieure.
3. **Rénovation intérieure** (`#interieur`): placo, peinture intérieure, carrelage, salles de bains.

Don't add a new family or a stand-alone trade without the owner's request; a new trade goes inside one of the three.

**Content rule (owner's request).** Each content block lives on **one page only**, to avoid repetition:
- Guarantees (`.guarantees`): home page only.
- "Quatre étapes" (`.process`) and the FAQ: Services only.
- Service area (`.zone`): Contact only.
- The closing `.close` band (terracotta) has page-specific wording, distinct from the Contact hero. Contact has none.

Also avoid repeating the same fact within a single page (e.g. "un seul interlocuteur" belongs to the home "about" block, not also to the hero or the guarantees). Removed at the owner's request or because they relied on invented data: customer reviews, the team section, the towns shown as buttons, the key-figures strip, the "réalisations" gallery (stock photos) and the about-page timeline.

**Design system: Hallmark, theme Broadside (redesign of November 2026).** The site was redesigned in full with the Hallmark design skill (github.com/Nutlope/hallmark, MIT), theme **Broadside**: a printer's sale bill. Buff paper, the brand navy as the ink, the brand terracotta as the only accent, square corners, no shadows, rules at 1 px or 5 px, double-rule frames (`.plate`, `.desk`, `.btn--frame`). Three faces from Google Fonts: **Six Caps** (tall condensed wood capitals, the `h1` lines and big figures), **Bevan** (slab capitals: `h2`, `h3`, wordmark, labels of facts), **Archivo Narrow** 400/500/600 (everything read). Hallmark's rules that the site keeps:
- Every colour and font goes through a token in `:root` (`--color-*`, `--font-*`); spacing only through `--space-*`; sections part by `--section-gap*`.
- No eyebrows (small capitals above a heading), no tracked-caps labels, no middle-dot lists (`A · B · C`), no em/en dashes in copy, no coloured word inside a heading, no icon tiles, no invented figures or reviews.
- Buttons are uppercase Archivo Narrow, 48 px tall; one filled (`.btn`) per screen, the others `.btn--frame`. Links are underlined ink, terracotta on hover.
- Photos are shown in slots (`<figure class="plate"><div data-slot="…" data-alt="what the owner's own photo should show">`), printed as a navy duotone by CSS. When the owner sends real chantier photos, replace the `<img>` inside the slot; the treatment and crop follow.
- The terracotta appears once per screen as a whole line or figure (the phone number, "3 départements"), never inside a heading.
- `overflow-x: clip` on `html` and `body`; every hover/transition has a reduced-motion fallback; content is visible without JavaScript.

The Hallmark "stamp" (its record of the build's decisions) normally sits as a comment on line 1 of the CSS; this project forbids comments, so it lives here instead and is prepended to a temporary copy of `style.css` only when linting:

```
/* Hallmark · shape: Bento Grid · genre: editorial · theme: Broadside (deal 1/3, seed local-roofing-masonry-interior-f578·5ea7eaa3·2026-11-27·r0) · redesign: full · draw: a17030 · job: hire
 * hero: Stage (/), Banner (/services.html, /a-propos.html, /contact.html, /mentions-legales.html), Corridor (/404.html) · nav: edge-aligned · footer: letter close · imagery: photographs, the site's own 7, duotone ink paper · signature: the mobile number set in fitted wood capitals, the one terracotta line of the first screen · broadside: bill
 * axes: light/display-condensed/warm · posture: committed · contrast: pass · fold: pass · v2.0.0 */
/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4 · weakest: S, the trades could be any builder's; the phone number set as the bill's headline line makes it this firm's */
/* Hallmark · dismissed 76 · every photograph is one the site already carried, kept as the owner's material in slots for their own chantier photos */
/* Hallmark · waive 78 · Long Document shape on mentions-legales.html · les mentions légales se lisent comme un texte suivi, leurs titres annotent chaque clause */
/* Hallmark · waive 44c · Banner posture on services, a-propos, contact and mentions-legales · the inner pages open on their content, so the first section shows above the fold */
/* Hallmark · dropped #services, gsap.min.js, ScrollTrigger.min.js, pexels-photo-5259822.jpeg as a band background · the scroll cue was decoration, the theme is printed and still, type never sits on a photograph */
```

To lint: install the skill (`npx skills add nutlope/hallmark`, or clone it), copy the site to a scratch folder with that stamp prepended to `style.css`, serve or open it, then `node <skill>/scripts/sloplint.mjs . --genre editorial --render` (the render tier needs `puppeteer-core` and Chrome; in cloud sessions point `CHROME_PATH` at a wrapper that runs `/opt/pw-browsers/chromium --no-sandbox`). Lint `404.html` through the local server with `--url`, since its root-absolute paths don't resolve from disk. The November 2026 redesign ended at 0 Floor and 0 Reflex findings on the five pages.

**Page layout pattern.** Every page has the same structure:
1. `.site-header`: `position: sticky` with `top: calc(-1 * var(--topbar-h))`, so the navy `.topbar` (service area, landline) scrolls away and the `.nav` stays. No JavaScript involved.
2. `section.hero` inside `<main id="main">` (a skip link targets it). Home: text on 5 columns, a framed photo on 7 (Hallmark's "Stage" posture), filling the screen under the header. Inner pages add `.hero--page`: shorter, text on 6 columns, photo on 5; on Services the quick-access `.chips-nav` sits at the hero's foot. `mentions-legales.html` uses `.hero--solo` (no photo), `404.html` `.hero--center`.
3. The content sections, then the closing `.close` band, then `footer.footer` (a "letter close": the wordmark and a sentence, then three short link lists, then the legal line).

**Section spacing.** `.section` has `padding-block: var(--section-gap)`, and `.section + .section { padding-top: 0 }` stops two paper sections from stacking two paddings. Bands (`.band--ink` navy, `.band--paper` darker buff, `.band--accent` terracotta, each with a faint grain) carry their own padding. A few plain class rules after it tune the gap after the hero (`.hero--page + .section`, `.service-details …`, `.hero--page + .contact-page`) so the space between the hero's last line and the next content stays under about 160 px.

**Fitted lines (`.fit`).** Each Six Caps line is its own `<span class="fit">`, never wrapping, sized by `script.js` so it fills its column exactly (measured once the fonts load, again on resize), capped by the CSS custom property `--fit-max` (a unitless px number set per context: hero, `.phone-line`, `.count`). Without JavaScript the lines simply wrap at `--text-display`. Two `max-height` media queries shrink the home hero's caps so the quote button stays above the fold on short laptops.

**Motion.** Broadside is "printed, so still": no reveal, no parallax, no GSAP (removed in the redesign, along with `data-reveal`, `data-reveal-img`, `data-parallax`, the sticky hero and the `.sheet`). Only colour hovers, a 1 px press on buttons and the menu's clip-path. Don't bring back scroll animations without the owner asking.

**`script.js`** does four things: footer year; removes a photo that fails to load (its slot then shows its paper wash); `window.hallmarkSlots({ hero: 'photo.jpg' })` to swap slot photos from the console; fitting the `.fit` lines; the mobile menu.

**SEO conventions.**
- Each `<h1>` starts with a `.kicker` span (a Bevan line, part of the heading, not a separate label) carrying the page's keyword + town (e.g. "Couvreur, maçon et plaquiste à Orthez"), followed by the slogan as `.fit` lines. Keep one distinct target query per page; titles ≤ 60 characters, descriptions ≤ 160.
- The trade nouns people search for (couvreur, charpentier, zingueur, maçon, ravalement, plaquiste, peintre, carreleur) appear in the Services intro paragraphs; keep them when rewriting copy.
- Internal links use descriptive anchors ("Nos travaux de toiture", not "Voir le détail"); trade mentions in body text link to the matching `services.html#…` anchor.
- **Indexable pages** (`index`, `a-propos`, `services`, `contact`) each carry an absolute `<link rel="canonical">` on `https://tfrenov64.fr/…` (home is `/`) and Open Graph tags (title/description copied from the page, image = the page's hero photo at `w=1200`). Keep them in sync when a title or description changes. They are the only URLs in `sitemap.xml`; `robots.txt` allows everything and points to the sitemap.
- `mentions-legales.html` and `404.html` are `noindex` and stay out of the sitemap.
- **JSON-LD** (`HomeAndConstructionBusiness`) is on the home page only, with owner-supplied data only (name, phones, Orthez 64300, the 3 departments, SIRET). Don't add hours, reviews, street address or ratings until the owner provides them.
- **`404.html`** is served by GitHub Pages for any unknown URL, at any depth, so all its local links and assets use root-absolute paths (`/style.css`, `/index.html`). It reuses the shared header/footer (no active nav item).

**Mobile menu.** Below 960 px, `#nav-links` becomes a full-screen overlay. It is hidden with `clip-path` plus `visibility`, so links aren't focusable while it is closed. It is scrollable for landscape phones. The JS closes it when the window is resized past 960 px; keep that value in sync with the CSS breakpoint.

**Quote request (`contact.html#devis`).** There is **no form** (owner's request: the old one wasn't wired to any backend). `#devis` is a single double-framed `.desk` (also `.contact-box`): the title, a short checklist of what to tell us, and a `<dl>` with the mobile (fitted, terracotta), the landline and the town. Every "Demander un devis" button on the site links to `contact.html#devis`. If a real form is wanted later (once hosting with PHP is in place), it goes back inside this card.

**CSS conventions.**
- BEM-like class names (`block__element--modifier`); no comments.
- Tokens in `:root`: Hallmark's shared scale (`--space-*`, `--text-*`, `--section-gap*`, `--container` 1440 px with `--gutter`, `--gap-columns`, `--z-*`, durations and easings) plus the Broadside colours: `--color-paper` (buff) / `-2` / `-3`, `--color-ink` = brand navy #1F2A44, `--color-ink-2` #2A3758, `--color-muted`, `--color-rule`, `--color-accent` = terracotta #B04530, `--color-accent-strong` #943826 (the closing band), `--color-accent-ink` (buff text on terracotta). Layout uses a 12-column grid (`.grid12`, `.head`).
- **Contrast:** terracotta #B04530 is used only for large type (the fitted phone, figures) and decoration on buff; small text stays navy or `--color-muted`. On the navy and terracotta bands text is buff, and focus rings switch to `--color-accent-ink`.
- **Tap targets:** small standalone links (`.link`, breadcrumb, footer and topbar links) get `padding-block` (with an equal negative `margin-block` where the layout must not move).
- **Favicon:** `favicon.svg` (navy square + logo house), `favicon.ico` (16/32/48) and `apple-touch-icon.png` (180, square corners) at the root, linked with relative paths in every `<head>`. Regenerate the PNG/ICO from the SVG if the logo changes.
- **Alt texts** describe what the stock photo shows (trade-related words welcome) and differ between pages; never claim a photo shows the company's own work. `data-alt` on a slot says what the owner's own photo should show there.
- Responsive overrides are grouped at the end of `style.css`, desktop-first: 1180 (phone number leaves the nav), 1080, 960 (burger menu; grids stack), 768 (`.mobile-bar`, lists stack), 640 (16 px gutter, topbar shows only the landline), 400. Plus the landscape-menu query (`max-width: 960px` and `max-height: 520px`) and the two short-screen hero queries.
- Large images use `srcset` with 800 / 1400 / 2200 widths through the CDN's `w=` parameter.
