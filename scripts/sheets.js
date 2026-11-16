// Loads the three source workbooks. Used by the generate-*.js scripts.
//
// WHERE YOUR DATA COMES FROM
//   Paste the Google Sheet link (or just its ID) between the quotes below.
//   The sheet must be shared:  Share > General access > "Anyone with the link" > Viewer.
//   Leave a link empty ("") to read the Excel file from the data folder instead.
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const SOURCES = {
  cable:  { sheet: "", file: "Cable Percentage -.xlsx" },  // sheets: Per week, Mill LV Cables, Category Map
  scurve: { sheet: "", file: "scurve_Quickchart.xlsx" },
  daily:  { sheet: "", file: "Daily_Activities.xlsx" }
};

// Takes a full Google Sheets link or a bare ID and returns the ID
function sheetId(value) {
  const text = String(value || "").trim();
  const match = text.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : text;
}

async function download(id, name) {
  const base = process.env.SHEETS_BASE_URL || "https://docs.google.com/spreadsheets/d";
  const url = `${base}/${id}/export?format=xlsx`;
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (error) {
    throw new Error(`Could not reach Google Sheets for "${name}" (${error.message}). Check the internet connection.`);
  }
  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("text/html")) {
    throw new Error(
      `Could not download the Google Sheet for "${name}" (HTTP ${res.status}). ` +
      `Check the link, and that sharing is set to "Anyone with the link" - Viewer.`
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

const cache = new Map();

// Returns an ExcelJS workbook, or null if there is no Google link and no Excel file.
// The same workbook is loaded only once per run.
function loadWorkbook(key) {
  if (!cache.has(key)) cache.set(key, read(key));
  return cache.get(key);
}

async function read(key) {
  const source = SOURCES[key];
  if (!source) throw new Error(`Unknown source "${key}".`);
  const workbook = new ExcelJS.Workbook();

  if (source.sheet.trim()) {
    console.log(`Downloading "${key}" from Google Sheets...`);
    await workbook.xlsx.load(await download(sheetId(source.sheet), key));
    return workbook;
  }

  const file = path.join(DATA_DIR, source.file);
  if (!fs.existsSync(file)) return null;
  console.log(`Reading "${key}" from ${source.file} (no Google link set).`);
  await workbook.xlsx.readFile(file);
  return workbook;
}

module.exports = { loadWorkbook, DATA_DIR, SOURCES };
