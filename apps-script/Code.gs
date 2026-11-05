/**
 * N250 hub sync - Google Apps Script web app (bound to the Google Sheet).
 * Anyone with the web app URL can READ the data (GET). Only requests that
 * carry the secret token (Script property TOKEN) can WRITE (POST).
 * Source of truth: the "State" sheet. Summary / Logs / Done are readable
 * copies rewritten on every save; editing them by hand does not feed back.
 */
const CHUNK = 40000; // a cell holds 50,000 characters at most
const LABELS = {
  chain: 'Chain lube', oiltop: 'Engine oil level top-up', oil: 'Engine oil + filter change',
  valve: 'Valve tappet clearance', fhose: 'Fuel pump hoses', nrb: 'Swing arm bearing grease',
  tb: 'Throttle body cleaning', air: 'Air filter + O-ring', pads: 'Brake pads replace',
  plug: 'Spark plug replace', bf: 'Brake fluid (DOT 4) + seals', fork: 'Fork oil + seals'
};

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readState_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('State');
  if (!sh || sh.getLastRow() < 1) return {};
  const txt = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => r[0]).join('');
  try { return JSON.parse(txt); } catch (e) { return {}; }
}

function doGet() {
  return out_(readState_());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    const tok = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!tok || b.k !== tok) return out_({ ok: 0, err: 'bad token' });
    if (!b.d || typeof b.d !== 'object') return out_({ ok: 0, err: 'bad data' });
    write_(b.d);
    return out_({ ok: 1 });
  } catch (err) {
    return out_({ ok: 0, err: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function put_(sh, rows) {
  sh.clearContents();
  if (rows.length) sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}

function write_(s) {
  const json = JSON.stringify(s);
  const parts = [];
  for (let i = 0; i < json.length; i += CHUNK) parts.push([json.slice(i, i + CHUNK)]);
  put_(sheet_('State'), parts);

  put_(sheet_('Summary'), [
    ['Odometer (km)', s.odo || 0],
    ['Sale date', s.sale || ''],
    ['Last synced', new Date()]
  ]);

  const logs = (s.logs || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.km || 0) - (a.km || 0));
  put_(sheet_('Logs'), [['Date', 'Km', 'Type', 'Note']].concat(logs.map(l => [l.date, l.km, l.type, l.note || ''])));

  const done = s.done || {}, dt = s.dt || {};
  put_(sheet_('Done'), [['Item', 'Done at km', 'Marked on']].concat(Object.keys(done).map(k => [LABELS[k] || k, done[k], dt[k] ? new Date(dt[k]) : ''])));
}
