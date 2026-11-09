/* DOT CORE — site configuration (edit here)
   GitHub Pages is static, so forms need a form backend to deliver by email directly.
   1. Create a free form at https://formspree.io (or similar) that forwards to dot.core.eg@gmail.com
   2. Paste its endpoint below, e.g. 'https://formspree.io/f/xxxxxxxx'
   While empty (or if sending fails), a request opens the visitor's email app with the summary prefilled. */
/* BACKUP_ENDPOINT: Google Apps Script web app URL (see apps-script/README.md). Used automatically if ENDPOINT fails. */
window.DC = { ENDPOINT: 'https://formspree.io/f/xeaawnwn', BACKUP_ENDPOINT: 'https://script.google.com/macros/s/AKfycbw6KvEUUlwyAF_iMO7nrgrXakjHS_8mugb3cGaJ4ReAjfLjL7wqj2E4LDVG0UnsBuJx/exec', EMAIL: 'dot.core.eg@gmail.com' };
