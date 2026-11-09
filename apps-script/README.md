# Request log + backup receiver (Google Apps Script)

Every request sent from the website is recorded in a Google Sheet, whatever happens to it afterwards.

## What the sheet shows
**Requests** (all requests, one row per reference `DC-YYMM-XXXX`)
| Status | Meaning |
|---|---|
| Started | The visitor pressed Send; no result was recorded (e.g. the page was closed) |
| Delivered: Formspree | Formspree accepted it; Formspree emailed you |
| Delivered: Backup (email sent) | Formspree failed; this script emailed you |
| Failed: visitor email app | Formspree and this script both failed; the visitor's email app was opened and the visitor must press Send |

**Failed**: a copy of every request that did not reach you through the website itself (grey rows). Follow these up first.

## Setup / update
1. Open the Google Sheet **DOT CORE Requests** → Extensions → Apps Script.
2. Replace the code with `Code.gs`, save.
3. **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.** The URL stays the same. (First time: Deploy → New deployment → Web app, Execute as: Me, Access: Anyone.)
4. If the script asks for permission, accept it (Advanced → Go to project).
5. The `/exec` URL goes in `assets/js/config.js` as `BACKUP_ENDPOINT`.

Test: open the URL in a browser; it shows `{"ok":true,"service":"DOT CORE request receiver"}`.

## Notes
- Old rows from earlier tests used a different column layout; delete the old `Requests` sheet tab before the first run so the new headers are created.
- If the visitor's browser is offline, nothing can be logged. That is the one case no website code can record.
- Gmail sends about 100 script emails per day; sheet logging has no such limit.
