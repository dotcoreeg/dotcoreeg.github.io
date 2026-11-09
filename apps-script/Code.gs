/**
 * DOT CORE — backup form receiver (Google Apps Script)
 * Receives requests from the website, logs them to a Google Sheet and emails a copy.
 * Setup steps are in apps-script/README.md
 */
var NOTIFY_EMAIL = 'dot.core.eg@gmail.com';   // where requests are emailed
var SHEET_NAME   = 'Requests';
var MAX_LEN      = 20000;                      // reject oversized payloads

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > MAX_LEN) return out_({ ok: false, error: 'too_large' });
    var d = JSON.parse(raw);
    if (d.website) return out_({ ok: true });                       // honeypot: silently accept
    var email = String(d.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'bad_email' });

    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('DOT CORE Requests');
      var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sh.getLastRow() === 0) sh.appendRow(['Received (Cairo)', 'Reference', 'Type', 'Source', 'Name', 'Email', 'Status', 'Summary']);
      var ts = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyy-MM-dd HH:mm');
      sh.appendRow([ts, clean_(d.reference), clean_(d.type), clean_(d.source), clean_(d.name), clean_(email), 'New', clean_(d.message)]);
    } finally { lock.releaseLock(); }

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: String(d.subject || '[DOT CORE] New request').slice(0, 200),
      body: String(d.message || '') + '\n\n— Received via backup receiver'
    });
    return out_({ ok: true, reference: clean_(d.reference) });
  } catch (err) {
    return out_({ ok: false, error: 'server' });
  }
}

function doGet() { return out_({ ok: true, service: 'DOT CORE request receiver' }); }

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
/* neutralise spreadsheet formula injection */
function clean_(v) { v = String(v == null ? '' : v).slice(0, 8000); return /^[=+\-@]/.test(v) ? "'" + v : v; }
