// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────
// 1. Go to https://script.google.com → click "New project"
// 2. Delete all existing code and paste this entire file
// 3. Click Deploy → New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Click Deploy → copy the Web App URL
// 5. Add it to Vercel: Settings → Environment Variables → APPS_SCRIPT_URL = <url>
//    (for local dev, add to your .env file)
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_ID = '15OHnobrv3jOEWp1DWaEq3VzFk4ChrvXuLnqDugaX4Vw';

const COL = { chapter1: 2, chapter2: 3, chapter3: 4 };

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const chapter = data.chapter;   // 'chapter1' | 'chapter2' | 'chapter3'
    const score   = parseInt(data.score);

    const col = COL[chapter];
    if (!col) {
      return respond({ success: false, reason: 'mixed not tracked' });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();

    // Find the first empty cell in this chapter's column (rows 2 onward)
    let targetRow = lastRow + 1;
    for (let row = 2; row <= lastRow; row++) {
      if (sheet.getRange(row, col).getValue() === '') {
        targetRow = row;
        break;
      }
    }

    sheet.getRange(targetRow, 1).setValue(targetRow - 1); // attempt number
    sheet.getRange(targetRow, col).setValue(score);

    return respond({ success: true, attempt: targetRow - 1, score });

  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Quick test — run this manually in the Apps Script editor to verify it works
function testPost() {
  const fake = { postData: { contents: JSON.stringify({ chapter: 'chapter1', score: 24, total: 30 }) } };
  Logger.log(doPost(fake).getContent());
}
