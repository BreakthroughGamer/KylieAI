// Kylie AI waitlist: receives form posts from index.html and appends them to this Google Sheet.
//
// Setup (once):
//   1. Create a Google Sheet. Extensions -> Apps Script. Paste this file in, then save.
//   2. Deploy -> New deployment -> type "Web app".
//        Execute as: Me    Who has access: Anyone
//   3. Copy the web app URL (ends in /exec) into SIGNUP_ENDPOINT in index.html.
//
// After editing this script, use Deploy -> Manage deployments -> edit -> Version: "New version"
// so the same /exec URL picks up your changes.

const SHEET_NAME = 'Signups';
// New columns go at the end so rows already in the sheet stay lined up.
const HEADERS = [
  'Timestamp', 'Email', 'Chat', 'Image', 'Video', 'Notes',
  'Referrer', 'UTM source', 'UTM medium', 'UTM campaign',
  'Voice', 'Style', 'Character', '18+ confirmed',
];

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot field: real visitors never fill it in.
  if (p.website) return json_({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return json_({ ok: false, error: 'invalid_email' });
  }
  if (p.age_confirmed !== 'yes') return json_({ ok: false, error: 'age_not_confirmed' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();

    // Skip duplicate signups.
    const existing = sheet.getRange('B:B').createTextFinder(email).matchEntireCell(true).findNext();
    if (existing) return json_({ ok: true, duplicate: true });

    sheet.appendRow([
      new Date(),
      clean_(email, 254),
      clean_(p.chat, 3),
      clean_(p.image, 3),
      clean_(p.video, 3),
      clean_(p.notes, 1000),
      clean_(p.referrer, 500),
      clean_(p.utm_source, 100),
      clean_(p.utm_medium, 100),
      clean_(p.utm_campaign, 100),
      clean_(p.voice, 3),
      clean_(p.style, 20),
      clean_(p.character, 40),
      'yes',
    ]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to check the deployment is live.
function doGet() {
  return json_({ ok: true, service: 'kylie-ai-waitlist' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  // Write the header row on first use, and extend it when new columns are added.
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Trims, caps length, and stops text like "=HYPERLINK(...)" from running as a formula.
function clean_(value, maxLen) {
  let s = String(value || '').trim().slice(0, maxLen);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
