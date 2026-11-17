// Loads the source data for the dashboard. Used by the generate-*.js scripts.
//
// WHERE YOUR DATA COMES FROM
//   Option A - Google Sheets, "Publish to web" (read-only, only the tabs you publish):
//     1. In the Google Sheet:  File > Share > Publish to web
//     2. Pick ONE tab (not "Entire document"), choose "Comma-separated values (.csv)", click Publish.
//     3. Copy the link and paste it between the quotes of that tab below.
//     Repeat for each tab. Tabs left empty ("") are not read from Google.
//   Option B - an Excel file in the data folder (used when no Google link is set for that source).
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const SOURCES = {
  cable: {
    file: "Progress Monitoring Report.xlsx",   // Excel fallback, put it in the data folder
    tabs: {
      "Weekly Monitoring": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCwf6sR3sEpS5DZaj2bS6cfHMQ2qA_xYSNoGmhisryMlLFDb4szcuA0wMbuacRAayc6PEu7jZlMebi/pub?gid=1263376792&single=true&output=csv",   // weekly progress per area (the LIVE column is the latest week)
      "Cable Summary": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCwf6sR3sEpS5DZaj2bS6cfHMQ2qA_xYSNoGmhisryMlLFDb4szcuA0wMbuacRAayc6PEu7jZlMebi/pub?gid=1989174840&single=true&output=csv"        // totals per zone and the "LV by Category and Area" block
    }
  },
  scurve: { file: "scurve_Quickchart.xlsx", tabs: {} },
  daily:  { file: "Daily_Activities.xlsx",  tabs: {} }
};

// ---- CSV reading ----------------------------------------------------------
// Splits CSV text into rows of cells (handles quotes, commas and line breaks inside quotes)
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// Plain numbers become numbers; everything else (text, "57%", dates) stays text
function toValue(text) {
  const t = text.trim();
  if (t === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return text;
}

async function downloadTab(name, url) {
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (error) {
    throw new Error(`Could not reach Google Sheets for the tab "${name}" (${error.message}). Check the internet connection.`);
  }
  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("text/html")) {
    throw new Error(
      `Could not download the tab "${name}" (HTTP ${res.status}). ` +
      `Check the link: it must be the "Publish to web" link of that tab, with format "Comma-separated values (.csv)".`
    );
  }
  return parseCsv(await res.text());
}

// ---- Loading --------------------------------------------------------------
const cache = new Map();

// Returns an ExcelJS workbook, or null if the source has no Google link and no Excel file.
// The same workbook is loaded only once per run.
function loadWorkbook(key) {
  if (!cache.has(key)) cache.set(key, read(key));
  return cache.get(key);
}

async function read(key) {
  const source = SOURCES[key];
  if (!source) throw new Error(`Unknown source "${key}".`);
  const workbook = new ExcelJS.Workbook();

  const linked = Object.entries(source.tabs).filter(([, url]) => url.trim());
  if (linked.length) {
    for (const [name, url] of linked) {
      console.log(`Downloading "${name}" from Google Sheets...`);
      const sheet = workbook.addWorksheet(name);
      for (const cells of await downloadTab(name, url.trim())) sheet.addRow(cells.map(toValue));
    }
    return workbook;
  }

  const file = path.join(DATA_DIR, source.file);
  if (!fs.existsSync(file)) return null;
  console.log(`Reading "${key}" from ${source.file} (no Google link set).`);
  await workbook.xlsx.readFile(file);
  return workbook;
}

module.exports = { loadWorkbook, DATA_DIR, SOURCES, parseCsv };
