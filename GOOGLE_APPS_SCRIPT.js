/**
 * SimpleScheduleAI — Scheduling Cost Calculator Lead Capture
 * Google Apps Script — paste this into your Google Sheet's script editor
 *
 * Setup steps:
 *  1. Open your Google Sheet (ID: 1ruwe--J0V1pLfcX1aFOvGaVlyKSsp32QU_3jigvvU7Y)
 *  2. Extensions → Apps Script
 *  3. Delete any existing code, paste this entire file
 *  4. Save (Ctrl+S)
 *  5. Click Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Copy the Web App URL
 *  7. Paste it into ROISection.astro replacing REPLACE_WITH_YOUR_APPS_SCRIPT_URL
 *  8. Re-deploy whenever you update this script (Deploy → Manage deployments → Edit)
 */

const SHEET_NAME    = "Calculator Leads"; // Will be created automatically if it doesn't exist
const NOTIFY_EMAILS = ["pradeep.pandey99@gmail.com", "gauthamail@gmail.com"];

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Title",
        "Hospital",
        "Email",
        "Mgmt Hours/Week",
        "OT Hours/Week",
        "Agency Shifts/Month",
        "RN Exits (Past Year)",
        "Mgmt Cost ($/yr)",
        "OT Cost ($/yr)",
        "Agency Cost ($/yr)",
        "Turnover Cost ($/yr)",
        "Total Hidden Cost ($/yr)",
      ]);

      // Freeze the header row
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp    || new Date().toISOString(),
      data.name         || "",
      data.title        || "",
      data.hospital     || "",
      data.email        || "",
      data.mgmtHours    || 0,
      data.otHours      || 0,
      data.agencyShifts || 0,
      data.rnExits      || 0,
      data.mgmtCost     || 0,
      data.otCost       || 0,
      data.agencyCost   || 0,
      data.turnoverCost || 0,
      data.totalCost    || 0,
    ]);

    // Send notification email to both founders
    const fmt = (n) => "$" + Number(n).toLocaleString("en-US");
    const subject = "New Scheduling Cost Calculator lead — " + (data.hospital || "Unknown Hospital");
    const body = [
      "Someone just completed the ROI calculator on SimpleScheduleAI.com.",
      "",
      "Name:     " + (data.name     || "—"),
      "Title:    " + (data.title    || "—"),
      "Hospital: " + (data.hospital || "—"),
      "Email:    " + (data.email    || "—"),
      "",
      "Their numbers:",
      "  Manager time cost:   " + fmt(data.mgmtCost),
      "  Overtime cost:       " + fmt(data.otCost),
      "  Agency fill cost:    " + fmt(data.agencyCost),
      "  Turnover cost:       " + fmt(data.turnoverCost),
      "  ─────────────────────────────",
      "  Total hidden cost:   " + fmt(data.totalCost) + "/yr",
      "",
      "Inputs used:",
      "  Manager hrs/week:    " + data.mgmtHours,
      "  OT hrs/week:         " + data.otHours,
      "  Agency shifts/month: " + data.agencyShifts,
      "  RN exits (past yr):  " + data.rnExits,
    ].join("\n");

    MailApp.sendEmail({
      to:      NOTIFY_EMAILS.join(","),
      subject: subject,
      body:    body,
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: GET handler for testing the deployment is live
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "ROI Calculator script is live" }))
    .setMimeType(ContentService.MimeType.JSON);
}
