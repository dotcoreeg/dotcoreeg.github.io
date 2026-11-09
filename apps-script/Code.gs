/**
 * DOT CORE — request log + backup receiver (Google Apps Script)
 *
 * Sheet "Requests": every request the website tries to send, one row per reference,
 *   with a Status column that is updated as delivery progresses:
 *     Started                       - the visitor pressed Send (no result recorded yet)
 *     Delivered: Formspree          - Formspree accepted it (email sent by Formspree)
 *     Delivered: Backup (email sent)- Formspree failed, this script emailed it
 *     Failed: visitor email app     - Formspree and this script both failed
 * Sheet "Failed": a copy of every request that did not reach us by the website itself.
 * Setup steps are in apps-script/README.md
 */
var NOTIFY_EMAIL = 'dot.core.eg@gmail.com';
var MAX_LEN = 30000;
var HEAD = ['Received (Cairo)', 'Last update (Cairo)', 'Reference', 'Status', 'Type', 'Source', 'Name', 'Email', 'Summary'];

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > MAX_LEN) return out_({ ok: false, error: 'too_large' });
    var d = JSON.parse(raw);
    if (d.website) return out_({ ok: true });
    var ref = clean_(d.reference);
    if (!/^DC-\d{4}-[A-Z0-9]{4}$/.test(ref)) return out_({ ok: false, error: 'bad_reference' });
    var email = String(d.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'bad_email' });
    var action = d.action || 'deliver';
    var status = ({ log: 'Started', deliver: 'Delivered: Backup (email sent)', formspree_ok: 'Delivered: Formspree', failed: 'Failed: visitor email app' })[action];
    if (!status) return out_({ ok: false, error: 'bad_action' });

    var lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      upsert_('Requests', ref, status, d, email, action !== 'log' || false);
      if (action === 'failed') upsert_('Failed', ref, status, d, email, true);
    } finally { lock.releaseLock(); }

    if (action === 'deliver') {
      MailApp.sendEmail({ to: NOTIFY_EMAIL, replyTo: email, subject: String(d.subject || '[DOT CORE] New request').slice(0, 200), body: String(d.message || '') + '\n\n— Received via backup receiver' });
    }
    return out_({ ok: true, reference: ref, status: status });
  } catch (err) {
    return out_({ ok: false, error: 'server' });
  }
}

function doGet() { return out_({ ok: true, service: 'DOT CORE request receiver' }); }

/* one row per reference; later calls update the status, never downgrade a final status to "Started" */
function upsert_(name, ref, status, d, email, isFinal) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('DOT CORE Requests');
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(HEAD); sh.setFrozenRows(1); }
  var now = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyy-MM-dd HH:mm:ss');
  var row = 0, n = sh.getLastRow();
  if (n > 1) { var refs = sh.getRange(2, 3, n - 1, 1).getValues(); for (var i = refs.length - 1; i >= 0; i--) { if (refs[i][0] === ref) { row = i + 2; break; } } }
  if (!row) {
    sh.appendRow([now, now, ref, status, clean_(d.type), clean_(d.source), clean_(d.name), clean_(email), clean_(d.message)]);
  } else {
    var cur = String(sh.getRange(row, 4).getValue());
    if (status === 'Started' && cur !== 'Started') return;             // never overwrite a result with "Started"
    sh.getRange(row, 2, 1, 3).setValues([[now, ref, status]]);
    if (!sh.getRange(row, 9).getValue()) sh.getRange(row, 9).setValue(clean_(d.message));
  }
  var color = status.indexOf('Failed') === 0 ? '#e8e8e8' : '#ffffff';
  sh.getRange(row || sh.getLastRow(), 1, 1, HEAD.length).setBackground(color);
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(v) { v = String(v == null ? '' : v).slice(0, 12000); return /^[=+\-@]/.test(v) ? "'" + v : v; }
