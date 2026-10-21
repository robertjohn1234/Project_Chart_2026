const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// ---- Settings you may need to change -------------------------------------
// The Excel file must be in the same folder as this script.
const EXCEL_FILE = path.join(__dirname, "daily activities.xlsx");
const OUTPUT_FILE = path.join(__dirname, "daily-data.json");
// One line is saved here for every report date, so history builds up
// even though finished items are removed from the Excel the next day.
const HISTORY_FILE = path.join(__dirname, "daily-history.json");
// The sheet to read (if not found, the first sheet is used).
const SHEET_NAME = "ActionItems";
// ---------------------------------------------------------------------------

const HEADER_SCAN_ROWS = 15;

// Reads a cell's real value, including the result of formula cells
function rawValue(cell) {
  let v = cell.value;
  if (v && typeof v === "object" && !(v instanceof Date)) {
    if ("result" in v) v = v.result;
    else if (Array.isArray(v.richText)) v = v.richText.map(t => t.text).join("");
    else if ("text" in v) v = v.text;
  }
  return v;
}

function cellText(cell) {
  const v = rawValue(cell);
  if (v === null || v === undefined || v instanceof Date) return "";
  if (typeof v === "object") return "";
  return String(v).trim();
}

const pad2 = n => String(n).padStart(2, "0");
const round4 = v => (v === null ? null : Math.round(v * 10000) / 10000);

// Finds the header row (ACTION ITEM / ASSIGNED / STATUS / NOTES) and its columns
function findHeader(sheet) {
  const lastRow = Math.min(HEADER_SCAN_ROWS, sheet.rowCount);
  for (let r = 1; r <= lastRow; r++) {
    const row = sheet.getRow(r);
    const cols = {};
    for (let c = 1; c <= sheet.columnCount; c++) {
      const t = cellText(row.getCell(c)).toLowerCase();
      if (t === "action item") cols.action = c;
      else if (t === "assigned") cols.assigned = c;
      else if (t === "status") cols.status = c;
      else if (t === "notes") cols.notes = c;
    }
    if (cols.action && cols.assigned && cols.status && cols.notes) {
      return { row: r, cols };
    }
  }
  throw new Error(
    'Header row not found. Expected cells named ACTION ITEM, ASSIGNED, STATUS and NOTES near the top of the sheet.'
  );
}

// Finds the report date above the table (a real date, or text like "DATE: 10/20/2026")
function findReportDate(sheet, headerRow) {
  for (let r = 1; r <= headerRow; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= sheet.columnCount; c++) {
      const v = rawValue(row.getCell(c));

      if (v instanceof Date && !isNaN(v.getTime())) {
        return v.toISOString().slice(0, 10);
      }

      if (typeof v === "string") {
        const us = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); // month/day/year
        if (us) return `${us[3]}-${pad2(us[1])}-${pad2(us[2])}`;
        const iso = v.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (iso) return iso[0];
      }
    }
  }
  throw new Error(
    "Report date not found above the table. Put the date (for example 10/20/2026) in a cell above the header row."
  );
}

// Status cell: a percentage (0.72 or 72%) or text such as "On Hold", "Pending", "Not Started"
function parseStatus(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return { percent: null, text: "" };
  }

  if (typeof raw === "number") {
    if (raw < 0) return { percent: null, text: "" };
    if (raw <= 1) return { percent: raw, text: "" };
    if (raw <= 100) return { percent: raw / 100, text: "" };
    return { percent: null, text: "" };
  }

  const text = String(raw).trim();
  const m = text.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (m) return { percent: parseFloat(m[1]) / 100, text: "" };
  return { percent: null, text: text.toLowerCase() };
}

// Decides the state of one activity from its status and notes
function deriveState(percent, statusText, notes) {
  const n = notes.toLowerCase();
  const s = statusText;

  if (percent !== null && percent >= 1) return "done";
  if (/^done\b/.test(n) || s === "done") return "done";
  if (/^on[\s-]*hold\b/.test(n) || /^on[\s-]*hold\b/.test(s)) return "hold";
  if (/^pending\b/.test(n) || s === "pending") return "pending";
  if (s === "not started" || percent === 0) return "not-started";
  return "progress";
}

// Text after "On hold:" in the notes
function holdReason(notes) {
  return notes.replace(/^on[\s-]*hold\s*[:\-–]?\s*/i, "").trim();
}

const STATES = ["done", "progress", "hold", "pending", "not-started"];

function countStates(items) {
  const counts = { total: items.length };
  STATES.forEach(state => {
    counts[state] = items.filter(i => i.state === state).length;
  });
  return counts;
}

function averagePercent(items) {
  const values = items.filter(i => i.percent !== null).map(i => i.percent);
  return values.length
    ? round4(values.reduce((a, b) => a + b, 0) / values.length)
    : null;
}

// Adds (or replaces) today's line in the history file
function updateHistory(data) {
  let history = { days: [] };

  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    } catch (error) {
      throw new Error(
        `${path.basename(HISTORY_FILE)} could not be read (${error.message}). Fix or delete it, then run again.`
      );
    }
    if (!history || !Array.isArray(history.days)) history = { days: [] };
  }

  const bySupervisor = {};
  data.supervisors.forEach(sv => {
    bySupervisor[sv.name] = {
      total: sv.total,
      done: sv.done,
      progress: sv.progress,
      hold: sv.hold,
      pending: sv.pending,
      "not-started": sv["not-started"]
    };
  });

  const entry = {
    date: data.reportDate,
    ...data.summary,
    supervisors: bySupervisor
  };

  history.days = history.days.filter(d => d.date !== entry.date);
  history.days.push(entry);
  history.days.sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history), "utf8");
  return history.days.length;
}

// Returns false (and does nothing) if the Excel file is not in the folder
async function generateDaily() {
  console.log("Converting daily activities workbook to JSON...");

  if (!fs.existsSync(EXCEL_FILE)) {
    console.log(
      `SKIPPED: ${path.basename(EXCEL_FILE)} not found in this folder. Daily activities were not updated.`
    );
    return false;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);

  const sheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  if (!sheet) {
    throw new Error("The workbook has no worksheets.");
  }

  const header = findHeader(sheet);
  const reportDate = findReportDate(sheet, header.row);
  const { action, assigned, status, notes } = header.cols;

  const items = [];

  for (let r = header.row + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const actionText = cellText(row.getCell(action));
    if (!actionText) continue; // blank or black separator rows

    const assignedText = cellText(row.getCell(assigned)) || "Unassigned";
    const notesText = cellText(row.getCell(notes));
    const parsed = parseStatus(rawValue(row.getCell(status)));
    const state = deriveState(parsed.percent, parsed.text, notesText);

    let percent = parsed.percent;
    if (state === "done" && percent === null) percent = 1;
    if (state === "not-started" && percent === null) percent = 0;

    items.push({
      action: actionText,
      assigned: assignedText,
      percent: round4(percent),
      state,
      notes: notesText,
      reason: state === "hold" ? holdReason(notesText) : ""
    });
  }

  // Group by supervisor (same name in any capitalisation = same supervisor)
  const groups = new Map();
  items.forEach(item => {
    const key = item.assigned.toLowerCase();
    if (!groups.has(key)) groups.set(key, { name: item.assigned, items: [] });
    groups.get(key).items.push(item);
  });

  const supervisors = [...groups.values()].map(group => ({
    name: group.name,
    ...countStates(group.items),
    avgPercent: averagePercent(group.items),
    items: group.items
  }));

  const data = {
    sheet: sheet.name,
    reportDate,
    summary: { ...countStates(items), avgPercent: averagePercent(items) },
    supervisors
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), "utf8");
  const historyDays = updateHistory(data);

  console.log("Daily activities conversion successful!");
  console.log("Report date:", reportDate);
  console.log("Supervisors:", supervisors.length, "| Activities:", items.length);
  console.log(
    "Done:", data.summary.done,
    "| In progress:", data.summary.progress,
    "| On hold:", data.summary.hold
  );
  console.log("Days saved in history:", historyDays);
  return true;
}

module.exports = { generateDaily };

// Lets you also run it alone:  node generate-daily.js
if (require.main === module) {
  generateDaily().catch(error => {
    console.error("Daily activities conversion failed:", error);
    process.exitCode = 1;
  });
}
