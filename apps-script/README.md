# Backup receiver (Google Apps Script)

Used automatically when Formspree fails (quota reached, outage). Every request is logged to a Google Sheet and emailed to you.

1. Create a new Google Sheet named **DOT CORE Requests** (with dot.core.eg@gmail.com).
2. Menu **Extensions → Apps Script**. Delete the sample code, paste the contents of `Code.gs`, save.
3. **Deploy → New deployment → Type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorise when asked (Google shows an "unverified app" warning for your own script: Advanced → Go to project).
5. Copy the **Web app URL** (ends with `/exec`) and paste it into `assets/js/config.js` as `BACKUP_ENDPOINT`.
6. After any later code change: **Deploy → Manage deployments → Edit → New version**. The URL stays the same.

Test: open the URL in a browser; it should show `{"ok":true,"service":"DOT CORE request receiver"}`.

Limits: Gmail accounts can send roughly 100 emails/day through Apps Script; the Sheet logging has no such limit, so nothing is lost even if emails stop.
