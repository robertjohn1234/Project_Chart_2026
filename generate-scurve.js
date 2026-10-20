const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// ---- Settings you may need to change -------------------------------------
// The Excel file must be in the same folder as this script.
const EXCEL_FILE = path.join(__dirname, "scurve_Quickchart.xlsx");
const OUTPUT_FILE = path.join(__dirname, "scurve-data.json");
// The sheet to read. If you create a new baseline sheet later, change this.
const SHEET_NAME = "S-Curve Baseline2 July-Nov 26";
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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

// Returns a number, or null if the cell is empty or not a number
function cellNumber(cell) {
  let v = rawValue(cell);
  if (v === null || v === undefined || v === "") return null;

  if (typeof v === "string") {
    const text = v.trim();
    const n = parseFloat(text.replace("%", ""));
    if (!Number.isFinite(n)) return null;
    return text.includes("%") ? n / 100 : n;
  }

  if (typeof v !== "number") return null;
  return Number.isFinite(v) ? v : null;
}

const round6 = v => (v === null ? null : Math.round(v * 1e6) / 1e6);

// Finds a row by the label written in column A
function findRow(sheet, label) {
  const wanted = label.toLowerCase();
  for (let r = 1; r <= sheet.rowCount; r++) {
    if (cellText(sheet.getRow(r).getCell(1)).toLowerCase() === wanted) {
      return r;
    }
  }
  throw new Error(
    `Row labelled "${label}" not found in column A of sheet "${SHEET_NAME}".`
  );
}

async function generateScurve() {
  console.log("Converting S-curve workbook to JSON...");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Worksheet "${SHEET_NAME}" not found.`);
  }

  const monthRow = findRow(sheet, "Month");
  const weekRow = findRow(sheet, "Week");
  const planWeeklyRow = findRow(sheet, "Planned Weekly");
  const actualWeeklyRow = findRow(sheet, "Actual Weekly");
  const baseline1Row = findRow(sheet, "Baseline % Accu.");
  const baseline2Row = findRow(sheet, "Baseline #2 % Accu.");
  const actualCumRow = findRow(sheet, "Actual Accu.");

  const weeks = [];
  let year = null;
  let previousMonth = null;

  for (let col = 2; col <= sheet.columnCount; col++) {
    const monthText = cellText(sheet.getRow(monthRow).getCell(col));
    const weekText = cellText(sheet.getRow(weekRow).getCell(col));
    if (!monthText || !weekText) continue;

    const monthIndex = MONTH_NAMES.findIndex(m =>
      m.toLowerCase().startsWith(monthText.slice(0, 3).toLowerCase())
    );
    const weekMatch = weekText.match(/\d+/);
    if (monthIndex < 0 || !weekMatch) continue;

    // Year: row 1 holds the year where a new year starts (e.g. 2025, 2026).
    // If the month goes back from December to January, the year moves on.
    const yearText = cellText(sheet.getRow(1).getCell(col));
    const yearNumber = parseInt(yearText, 10);
    if (Number.isFinite(yearNumber) && yearNumber > 2000) {
      year = yearNumber;
    } else if (year !== null && previousMonth !== null && monthIndex < previousMonth) {
      year += 1;
    }
    previousMonth = monthIndex;

    if (year === null) {
      throw new Error("No year found in row 1 (expected something like 2025 in the first column).");
    }

    const get = rowNum => round6(cellNumber(sheet.getRow(rowNum).getCell(col)));

    const planWeekly = get(planWeeklyRow);
    const actualWeekly = get(actualWeeklyRow);
    const baseline1Cum = get(baseline1Row);
    const baseline2Cum = get(baseline2Row);
    const actualCum = get(actualCumRow);

    // The plan used for comparison: Baseline #2 when it exists, else Baseline #1
    const planCum = baseline2Cum !== null ? baseline2Cum : baseline1Cum;
    // Positive = behind plan, negative = ahead (same sign as the Excel "Variance" row)
    const gapPP =
      planCum !== null && actualCum !== null
        ? Math.round((planCum - actualCum) * 100000) / 1000
        : null;

    const monthName = MONTH_NAMES[monthIndex];
    const weekNumber = Number(weekMatch[0]);

    weeks.push({
      label: `${monthName.slice(0, 3)} W${weekNumber}`,
      title: `${monthName} ${year}, Week ${weekNumber}`,
      month: monthName,
      year,
      week: weekNumber,
      planWeekly,
      actualWeekly,
      baseline1Cum,
      baseline2Cum,
      actualCum,
      planCum,
      gapPP
    });
  }

  if (!weeks.length) {
    throw new Error("No weekly columns found (check the Month and Week rows).");
  }

  let latestIndex = -1;
  weeks.forEach((w, i) => {
    if (w.actualCum !== null) latestIndex = i;
  });
  if (latestIndex < 0) {
    throw new Error('No actual progress found in the "Actual Accu." row.');
  }

  // First week of the current baseline (where Baseline #2 starts)
  const windowStart = Math.max(0, weeks.findIndex(w => w.baseline2Cum !== null));

  const data = {
    sheet: SHEET_NAME,
    latestIndex,
    windowStart,
    weeks
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), "utf8");

  console.log("S-curve conversion successful!");
  console.log("Weeks:", weeks.length);
  console.log("Latest actual week:", weeks[latestIndex].title);
  console.log("Output:", OUTPUT_FILE);
}

module.exports = { generateScurve };

// Lets you also run it alone:  node generate-scurve.js
if (require.main === module) {
  generateScurve().catch(error => {
    console.error("S-curve conversion failed:", error);
    process.exitCode = 1;
  });
}
