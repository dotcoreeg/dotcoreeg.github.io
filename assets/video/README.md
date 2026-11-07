# DOT CORE — Corporate Website

Static site (HTML + CSS + vanilla JS). No build step. Live: https://dotcoreeg.github.io/

## Files
- `index.html`, `privacy.html`, `404.html`
- `assets/css/style.css`, `assets/js/main.js`
- `favicon.svg`, `robots.txt`, `sitemap.xml`, `.nojekyll`

## Deploy (GitHub Pages)
1. Create a public repository named exactly `dotcoreeg.github.io` under the `dotcoreeg` account.
2. Upload the CONTENTS of this folder to the `main` branch root (include the hidden `.nojekyll`).
3. Settings -> Pages -> Deploy from a branch -> `main` / `/ (root)`.

## Contact form
GitHub Pages has no server. Until a form endpoint is set, the form opens the visitor's email app with the message prefilled.
To receive submissions directly: create a free form at formspree.io (or similar) that forwards to dot.core.eg@gmail.com, then paste its URL into `FORM_ENDPOINT` at the top of `assets/js/main.js`.

## Placeholders to replace (search `data-placeholder` in index.html)
- Selected projects under each Core (4 blocks)
- Partner logos (8 slots)
- Team (4 profiles): name, role, photo
- Testimonials (3 slides)
Remove the "Sample" / "Placeholder" chips once content is real and approved. Do not publish invented clients, projects or quotes.

## Team photos
Replace the `<canvas data-ht="person">` inside `.person__ph` with `<img src="assets/img/name.jpg" alt="Full Name">` and add `.person__ph img{width:100%;height:100%;object-fit:cover;filter:grayscale(1)}`.

## Privacy
`privacy.html` is a plain-language draft. Have it reviewed by a qualified advisor before relying on it.

## Accent color (copper = live / active)
One accent only: `--accent` at the top of `assets/css/style.css` (copper `#C2703D`, `#D4814A` in dark theme).
Rule: use it only for what is live or active (brand dot, the launching Core, signal pulses, active slide, focus). Everything else stays monochrome. Change the hex in one place to change it everywhere.

## Hero animation and video
The large hero cell is a generated Robotics Core R&D motion: a 2-link arm solved with inverse kinematics tracking a figure-eight path, copper trajectory trail, live joint-angle telemetry. It follows the mouse on hover (MODE MANUAL). No assets needed.
Optional video slots (muted loops, 720p, under 3 MB, own or licensed footage): `assets/video/network.mp4` in the Partners header cell. A `<video>` can also be added inside `.hx-a2` if you ever prefer footage over the animation.

## Team
Leadership = Founder & CEO + one head per Core (PCB, Embedded, Robotics, Automation). Replace names, roles and photos; unannounced Cores can keep "Placeholder" until the lead is confirmed.
