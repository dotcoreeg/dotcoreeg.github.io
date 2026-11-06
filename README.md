# DOT CORE — Corporate Website

Static site (HTML + CSS + vanilla JS). No build step.

Live: https://dotcoreeg.github.io/

## Structure
- `index.html` — single-page corporate site
- `assets/css/style.css`, `assets/js/main.js`
- `favicon.svg`, `404.html`, `.nojekyll`

## Deploy (GitHub Pages)
1. Create a public repository named exactly `dotcoreeg.github.io` under the `dotcoreeg` account.
2. Push these files to the `main` branch root.
3. Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`.
4. Site goes live at https://dotcoreeg.github.io/ within a minute or two.

## Content rules
Only state what DOT CORE actually does today. Add portfolio and case studies only when real, approved projects exist.

## Placeholders to replace before going public
Search `index.html` for `data-placeholder` (8 blocks):
- **Projects** (4 cards): title, description, specs, year. Remove the "Sample" tag.
- **Team** (4 cards): name, role, photo (replace the initials block with an `<img>`). Remove the "Placeholder" tag.
- **Stats** strip: currently only real facts (4 Cores planned, 1 launching, 5 stages, Cairo). Update as the company grows.
