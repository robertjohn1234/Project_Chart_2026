const fs = require("fs");
const path = require("path");

// ---- Settings you may need to change -------------------------------------
// Same Excel file that generate-data.js reads (same folder as this script).
const EXCEL_FILE = path.join(__dirname, "Cable Percentage -.xlsx");
const DATA_FILE = path.join(__dirname, "category-data.json");
const HISTORY_FILE = path.join(__dirname, "category-history.json");
// Sheets and layout. These match the clean workbook.
const LV_SHEET = "Mill LV Cables";   // cables start at row 4
const MAP_SHEET = "Category Map";    // rules start at row 4 (A = pattern, B = category)
const FIRST_ROW = 4;
const MAP_LAST_ROW = 40;
// Columns in the LV sheet
const COL = { id: 1, laying: 2, from: 4, termFrom: 5, to: 6, termTo: 7 };
// Overall % = laying x 80 % + termination (from) x 10 % + termination (to) x 10 %
const WEIGHTS = { laying: 0.8, termFrom: 0.1, termTo: 0.1 };
const UNASSIGNED = "Unassigned";
const ZONES = ["Zone1 - RML", "Zone2 - FIN", "Zone3 - CBD", UNASSIGNED];
// ---------------------------------------------------------------------------

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
  if (v === null || v === undefined || v instanceof Date || typeof v === "object") return "";
  return String(v).trim();
}

// Zone: from the FROM name, otherwise from the TO name (same rule as the Excel Zone column in AP)
function zoneOf(from, to) {
  // Special case you set in the Excel: the RL+SB.Z.01 / Z.02 boards belong to RML / FIN
  const f = String(from || "").toLowerCase();
  if (f.includes("rl+sb.z.01")) return ZONES[0];
  if (f.includes("rl+sb.z.02")) return ZONES[1];
  const tests = [
    ["rml+", ZONES[0]],
    ["fin+", ZONES[1]],
    ["cbd+", ZONES[2]]
  ];
  for (const name of [from, to]) {
    const t = String(name || "").toLowerCase();
    for (const [key, zone] of tests) if (t.includes(key)) return zone;
  }
  return UNASSIGNED;
}

// Category: the LAST rule whose pattern appears in "FROM | TO" wins (same as the Excel formula)
function categoryOf(from, to, rules) {
  const text = (String(from || "") + " | " + String(to || "")).toLowerCase();
  let found = "Other";
  for (const rule of rules) {
    if (rule.pattern && text.includes(rule.pattern.toLowerCase())) found = rule.category;
  }
  return found;
}

const isDone = value => String(value || "").trim().toLowerCase() === "done";
const isCancelled = value => String(value || "").trim().toLowerCase() === "cancelled";

// records: [{ id, laying, from, termFrom, to, termTo }]
// returns one row per category + zone
function buildRows(records, rules, categoryOrder) {
  const map = new Map();
  for (const r of records) {
    const category = categoryOf(r.from, r.to, rules);
    const zone = zoneOf(r.from, r.to);
    const key = category + "||" + zone;
    if (!map.has(key)) {
      map.set(key, { category, zone, target: 0, laying: 0, termFrom: 0, termTo: 0 });
    }
    const row = map.get(key);
    if (!isCancelled(r.laying)) row.target += 1; // cancelled cables are not part of the target
    if (isDone(r.laying)) row.laying += 1;
    if (isDone(r.termFrom)) row.termFrom += 1;
    if (isDone(r.termTo)) row.termTo += 1;
  }
  const order = name => {
    const i = categoryOrder.indexOf(name);
    return i === -1 ? 999 : i;
  };
  return [...map.values()].sort(
    (a, b) => order(a.category) - order(b.category) || ZONES.indexOf(a.zone) - ZONES.indexOf(b.zone)
  );
}

function todayText() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function readHistory() {
  try {
    const list = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

async function generateCategories() {
  console.log("Reading LV categories...");
  if (!fs.existsSync(EXCEL_FILE)) {
    console.log("Excel file not found, categories skipped.");
    return;
  }

  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);
  const lv = workbook.getWorksheet(LV_SHEET);
  const mapSheet = workbook.getWorksheet(MAP_SHEET);
  if (!lv || !mapSheet) {
    console.log(`Sheet "${LV_SHEET}" or "${MAP_SHEET}" not found, categories skipped.`);
    console.log("(Use the clean workbook, it has both sheets.)");
    return;
  }

  // Rules from the Category Map sheet
  const rules = [];
  const categoryOrder = [];
  for (let r = FIRST_ROW; r <= MAP_LAST_ROW; r++) {
    const pattern = cellText(mapSheet.getRow(r).getCell(1));
    const category = cellText(mapSheet.getRow(r).getCell(2));
    if (category && !categoryOrder.includes(category)) categoryOrder.push(category);
    if (pattern && category) rules.push({ pattern, category });
  }
  categoryOrder.push("Other");

  // Cables (only rows whose cable ID is text, this skips the SUBTOTAL row under the data)
  const records = [];
  for (let r = FIRST_ROW; r <= lv.rowCount; r++) {
    const row = lv.getRow(r);
    const id = rawValue(row.getCell(COL.id));
    if (typeof id !== "string" || !id.trim() || id.trim().startsWith("=")) continue;
    records.push({
      id: id.trim(),
      laying: cellText(row.getCell(COL.laying)),
      from: cellText(row.getCell(COL.from)),
      termFrom: cellText(row.getCell(COL.termFrom)),
      to: cellText(row.getCell(COL.to)),
      termTo: cellText(row.getCell(COL.termTo))
    });
  }

  const rows = buildRows(records, rules, categoryOrder);
  const date = todayText();

  const data = {
    date,
    weights: WEIGHTS,
    zones: ZONES,
    categories: categoryOrder.filter(name => rows.some(row => row.category === name)),
    cables: records.length,
    rows
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), "utf8");

  // One snapshot per day. Running again on the same day replaces that day's snapshot.
  const history = readHistory().filter(item => item.date !== date);
  history.push({ date, rows });
  history.sort((a, b) => a.date.localeCompare(b.date));
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history), "utf8");

  console.log("Categories:", data.categories.length, "| cables:", records.length);
  console.log("Snapshots saved:", history.length, "(latest " + date + ")");
}

module.exports = { generateCategories, buildRows, zoneOf, categoryOf };

if (require.main === module) {
  generateCategories().catch(error => {
    console.error("Category conversion failed:", error);
    process.exitCode = 1;
  });
}
