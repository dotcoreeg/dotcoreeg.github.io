/* DOT CORE — site configuration (edit here)
   GitHub Pages is static, so forms need a form backend to deliver by email directly.
   1. Create a free form at https://formspree.io (or similar) that forwards to dot.core.eg@gmail.com
   2. Paste its endpoint below, e.g. 'https://formspree.io/f/xxxxxxxx'
   While empty (or if sending fails), a request opens the visitor's email app with the summary prefilled. */
/* BACKUP_ENDPOINT: Google Apps Script web app URL (see apps-script/README.md). Used automatically if ENDPOINT fails. */
window.DC = { ENDPOINT: 'https://formspree.io/f/xeaawnwn', BACKUP_ENDPOINT: 'https://script.google.com/macros/s/AKfycbykjaYeBgvdD4eoow9p9hf57mWMKEtLK_rweKY9Fnef7AO4cEac6nkKNw0D4thiiyOX/exec', EMAIL: 'dot.core.eg@gmail.com' };
