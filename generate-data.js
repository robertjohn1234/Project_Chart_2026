const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const { generateScurve } = require("./generate-scurve");
const { generateDaily } = require("./generate-daily");

const EXCEL_FILE = path.join(__dirname, "Cable Percentage -.xlsx");
const OUTPUT_FILE = path.join(__dirname, "dashboard-data.json");
const SHEET_NAME = "Per week";

// Reads a cell's real value, including results of formula cells
function rawValue(cell) {
  let v = cell.value;
  if (v && typeof v === "object" && !(v instanceof Date)) {
    if ("result" in v) v = v.result;
    else if (Array.isArray(v.richText)) v = v.richText.map(t => t.text).join("");
    else if ("text" in v) v = v.text;
  }
  return v;
}

// Returns a number (0 to 1 or 0 to 100), or null if the cell is empty/invalid
function cellNumber(cell) {
  let v = rawValue(cell);
  if (v === null || v === undefined || v === "") return null;

  if (typeof v === "string") {
    const text = v.trim();
    const n = parseFloat(text.replace("%", ""));
    if (!Number.isFinite(n)) return null;
    return text.includes("%") ? n / 100 : n;
  }

  if (typeof v !== "number") return null; // dates, errors, objects
  return Number.isFinite(v) ? v : null;
}

// Returns a date as "YYYY-MM-DD", or null if the header is not a date
function cellDate(cell) {
  const v = rawValue(cell);

  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }

  if (typeof v === "string" && v.trim()) {
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  return null;
}

async function main() {
  console.log("Converting Excel workbook to JSON...");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);

  const sheet = workbook.getWorksheet(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Worksheet "${SHEET_NAME}" not found.`);
  }

  const weeks = [];

  for (let col = 3; col <= sheet.columnCount; col++) {
    const date = cellDate(sheet.getRow(1).getCell(col));
    if (date) weeks.push({ column: col, date });
  }

  if (!weeks.length) {
    throw new Error("No reporting dates found in row 1.");
  }

  const areas = [];
  let currentSection = "";

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);
    const section = row.getCell(1).text.trim();
    const area = row.getCell(2).text.trim();

    if (section) currentSection = section;
    if (!area) continue;

    const progress = weeks.map(({ column }) => {
      const n = cellNumber(row.getCell(column));
      if (n === null) return null;
      return n > 1 ? n / 100 : n;
    });

    const latest = progress[progress.length - 1];
    const previous =
      progress.length > 1 ? progress[progress.length - 2] : null;

    areas.push({
      section: currentSection,
      area,
      progress,
      latest,
      previous,
      change:
        latest === null || previous === null
          ? null
          : (latest - previous) * 100
    });
  }

  const sections = [...new Set(areas.map(item => item.section))];

  const summary = sections.map(section => {
    const items = areas.filter(item => item.section === section);
    const valid = items.filter(item => item.latest !== null);

    return {
      section,
      average: valid.length
        ? valid.reduce((sum, item) => sum + item.latest, 0) / valid.length
        : null
    };
  });

  const data = {
    title: sheet.getCell("A1").text,
    latestDate: weeks[weeks.length - 1].date,
    previousDate: weeks.length > 1 ? weeks[weeks.length - 2].date : null,
    weeks: weeks.map(item => item.date),
    areas,
    summary
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), "utf8");

  console.log("Conversion successful!");
  console.log("Areas:", areas.length);
  console.log("Reporting dates:", weeks.length);
  console.log("Output:", OUTPUT_FILE);

  // Also convert the S-curve workbook (see generate-scurve.js)
  console.log("");
  await generateScurve();

  // And the daily activities report (skipped if the Excel file is not there)
  console.log("");
  await generateDaily();
}

main().catch(error => {
  console.error("Conversion failed:", error);
  process.exitCode = 1;
});
