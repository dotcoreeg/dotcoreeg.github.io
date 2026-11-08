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

## Brand and motion
Strictly monochrome (no accent colour). Logo = solid circle (the "dot") + CORE; the circle is the DOT.
Hero cell cycles the four Cores (PCB routing, Embedded MCU/bus, Robotics IK arm, Automation conveyor + control loop); click the index at the bottom to jump. Every section header has its own generated motion (orbit, process flow, leadership tree, voice waveform, FAQ decision tree, partner network, contact beacon). No assets needed.
Optional real footage: `assets/video/network.mp4` (Partners header, muted loop, 720p, under 3 MB, own or licensed).

## Team
Leadership = Founder & CEO + one head per Core (PCB, Embedded, Robotics, Automation). Replace names, roles and photos; unannounced Cores can keep "Placeholder" until the lead is confirmed.

## Contact box and request forms
Config lives at the top of the "request routing" block in `assets/js/main.js` (`CATS`). Each entry = one purpose: name, hint, keyword regex (drives the suggestion shown under the contact box), `q` (the few fields the box asks for) and `f` (the full form fields). Add or remove purposes there; the select, tiles-to-purpose link and forms update automatically.
Purposes: 14 engineering services, 3 programs, 7 company (careers, partnerships, suppliers, events, press, complaint, general). The box never blocks sending; it only suggests the matching form.
Set `FORM_ENDPOINT` so messages arrive by email directly; otherwise they open in the visitor's email app.
Review the wording of the Complaint and Careers hints before publishing (they describe how you handle them).

## Request forms (separate page)
`request.html` holds the full per-discipline forms (sections, progress, review summary, local draft, reference ID).
The catalogue lives in `assets/js/requests.js` (`CATS`), shared with the contact box on the home page.
Set the form endpoint and email in `assets/js/config.js` (`ENDPOINT`, `EMAIL`). Deep links: `request.html?type=pcb|embedded|robotics|automation|mechanical|power|iot|ai|mbd|prototype|test|review|repair|education|student|research|careers|partnership|supplier|events|press|complaint|general`.
