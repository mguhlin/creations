/* ============================================================
   NSPA AI Pulse — Google Apps Script backend (Code.gs)
   ============================================================
   This is the tiny, free "backend" that lets a static GitHub
   site write to a Google Sheet. You paste this into a Google
   Apps Script project bound to your Sheet, deploy it as a Web
   App, and put the resulting URL into config.js.

   What it stores (one row per response):
     timestamp | id | a1 a2 a3 a4 a5 | use | conf | usePct | confPct | archetype

   It NEVER receives or stores a name or email. The site does
   not collect them.
   ============================================================ */

var SHEET_NAME = "Responses";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    sheet.appendRow([
      data.ts || new Date().toISOString(),
      data.id || "",
      data.a1, data.a2, data.a3, data.a4, data.a5,
      data.use, data.conf, data.usePct, data.confPct,
      data.arch || ""
    ]);

    return json_({ ok: true, rows: readRows_(sheet) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = getSheet_();
  if (e && e.parameter && e.parameter.action === "count") {
    return json_({ count: Math.max(0, sheet.getLastRow() - 1) });
  }
  return json_({ ok: true, rows: readRows_(sheet) });
}

/* Return only the fields the chart needs — id + the two percentages.
   No raw answers are sent back to the browser. */
function readRows_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  // columns: 1 ts, 2 id, ... 10 usePct, 11 confPct
  var ids   = sheet.getRange(2, 2,  last - 1, 1).getValues();
  var uses  = sheet.getRange(2, 10, last - 1, 1).getValues();
  var confs = sheet.getRange(2, 11, last - 1, 1).getValues();
  var rows = [];
  for (var i = 0; i < ids.length; i++) {
    rows.push({ id: ids[i][0], usePct: uses[i][0], confPct: confs[i][0] });
  }
  return rows;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "timestamp", "id", "a1", "a2", "a3", "a4", "a5",
      "use", "conf", "usePct", "confPct", "archetype"
    ]);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
