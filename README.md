# Junwang Chen Academic Homepage

This repository hosts the academic homepage for Junwang Chen:

```text
https://junwangchen1541.github.io
```

The site uses Jekyll and GitHub Pages, with a custom **Personal Observatory** design built on the existing [academicpages](https://github.com/academicpages/academicpages.github.io) repository.

## Personal Observatory

A midnight-blue, moonlit academic portfolio: cold white typography, champagne-gold details, original lunar and polar illustrations, and generous editorial spacing. The home page connects research interests, public projects, education, honors, and contact information.

The visual system includes a seeded Canvas star field, pointer-responsive constellations and lunar parallax, animated SVG polar contours, scroll reveals, and a reading progress indicator. Animation follows the system reduced-motion preference and can be paused from the home page. Canvas rendering suspends when offscreen or when the tab is hidden. Essential content and navigation remain available without JavaScript.

## Languages

English lives at `/`; the complete Chinese edition lives at `/zh/`. Each edition includes the homepage, research, projects, honors, and CV. The persistent `中文` / `EN` link switches to the corresponding page and preserves homepage section anchors when JavaScript is enabled. Ordinary links stay in the selected language, and language switching also works without JavaScript.

Shared navigation and metadata translations are maintained in `_data/observatory.yml`. English content lives in `_pages/`; Chinese content lives in `_pages/zh/`. Each page declares `language` and `translation_url` in its front matter. The shared layout emits localized titles, descriptions, document language, canonical URLs, and alternate-language links. Chinese typography is styled separately while preserving the moonlit visual system.

All production assets are served locally. Cormorant Garamond is distributed under the SIL Open Font License in `assets/fonts/OFL.txt`; the moon, polar atlas, and project illustrations are original decorative artwork, not experimental or observational data.

## Main Content

- `_pages/about.html`: designed homepage and bilingual introduction
- `_pages/research.md`: research interests
- `_pages/projects.md`: selected projects
- `_pages/awards.md`: honors, awards, and service
- `_pages/cv.md`: web CV
- `_config.yml`: site metadata and sidebar profile
- `_data/navigation.yml`: top navigation
- `_layouts/observatory.html`: shared header, metadata, footer, and interior-page layout
- `assets/css/observatory.css`: responsive visual system
- `assets/js/observatory.js`: progressive motion and interactions
- `images/moon.svg`, `images/observatory-mark.svg`: original visual assets

The Observatory navigation is maintained in `_layouts/observatory.html`. The legacy academicpages navigation remains in `_data/navigation.yml` for template pages.

## Local Preview

Install Ruby dependencies, then run:

```bash
bundle install
bundle exec jekyll serve
```

The site will be served at:

```text
http://127.0.0.1:4000
```

## Deployment and verification

Pushing `main` runs `.github/workflows/build-gh-pages.yml`, builds the complete Jekyll site, and publishes `_site` to the `gh-pages` branch. GitHub Pages serves that branch.

The November 2026 redesign was checked in Chromium at widths from 320 to 1920 pixels, including mobile navigation, keyboard Escape, research disclosures, internal links, animation pause/resume, pointer parallax, reduced motion, and content with JavaScript disabled. The homepage passed an automated axe WCAG A/AA scan. Browser verification files and screenshots are kept in the ignored `local/` directory.
