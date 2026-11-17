const fs = require("fs");
const path = require("path");
const { loadWorkbook, DATA_DIR } = require("./sheets");
const { generateScurve } = require("./generate-scurve");
const { generateDaily } = require("./generate-daily");
const { generateCategories } = require("./generate-categories");

const OUTPUT_FILE = path.join(DATA_DIR, "dashboard-data.json");
// The weekly sheet: the new workbook calls it "Weekly Monitoring", the old one "Per week".
const SHEET_NAMES = ["Weekly Monitoring", "Per week"];
// The LIVE column of the sheet (today's figures, calculated from the cable list):
// true  = the dashboard shows the live figures as the latest week
// false = the dashboard shows only the weeks you recorded
const INCLUDE_LIVE = true;

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

const pad = n => String(n).padStart(2, "0");

// Returns { date: "YYYY-MM-DD", live: true/false }, or null if the header is not a date.
// Accepts real dates, "m/d/yyyy", "yyyy-mm-dd", "Aug 22, 2026" and the LIVE column ("LIVE 11/17/2026").
function cellDate(cell) {
  const v = rawValue(cell);

  if (v instanceof Date && !isNaN(v.getTime())) {
    return { date: v.toISOString().slice(0, 10), live: false };
  }
  if (typeof v !== "string") return null;

  let text = v.trim();
  const live = /^live\b/i.test(text);
  if (live) text = text.replace(/^live\s*/i, "");

  let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return { date: `${m[1]}-${pad(m[2])}-${pad(m[3])}`, live };

  m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // month/day/year, like the sheet shows it
  if (m) return { date: `${m[3]}-${pad(m[1])}-${pad(m[2])}`, live };

  if (/^[A-Za-z]{3,9}\.? \d{1,2},? \d{4}$/.test(text)) {
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
      return { date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`, live };
    }
  }
  return null;
}

async function main() {
  console.log("Reading cable progress...");

  const workbook = await loadWorkbook("cable");
  if (!workbook) {
    throw new Error("No source for the cable data. Set the Google Sheet link in scripts/sheets.js.");
  }

  const sheet = SHEET_NAMES.map(name => workbook.getWorksheet(name)).find(Boolean);

  if (!sheet) {
    throw new Error(`Worksheet "${SHEET_NAMES.join('" or "')}" not found. Check the tab link in scripts/sheets.js.`);
  }

  const weeks = [];

  for (let col = 3; col <= sheet.columnCount; col++) {
    const header = cellDate(sheet.getRow(1).getCell(col));
    if (header && (INCLUDE_LIVE || !header.live)) weeks.push({ column: col, date: header.date });
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

  // And the LV category figures and their history (see generate-categories.js)
  console.log("");
  await generateCategories();
}

main().catch(error => {
  console.error("Conversion failed:", error);
  process.exitCode = 1;
});
