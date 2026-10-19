
const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CONFIGURATION
// ========================================

const EXCEL_FILE = path.join(
  __dirname,
  "Cable Percentage -.xlsx"
);

const SHEET_NAME = "Per week";

// Cached dashboard data
let cachedData = null;
let loadError = null;
let isLoading = false;

// ========================================
// STATIC FILES
// ========================================

app.use(
  "/vendor",
  express.static(
    path.join(__dirname, "node_modules", "chart.js", "dist")
  )
);

app.use(express.static(path.join(__dirname, "public")));

// ========================================
// HEALTH CHECK
// ========================================

app.get("/health", (req, res) => {
  res.status(200).send("Express is healthy");
});

// ========================================
// LOAD AND PROCESS EXCEL
// ========================================

async function loadDashboardData() {
  if (isLoading) {
    console.log("Excel loading already in progress.");
    return;
  }

  isLoading = true;

  try {
    console.log("------------------------------------");
    console.log("Loading Excel workbook...");
    console.log("Excel file path:", EXCEL_FILE);
    console.log("Excel file exists:", fs.existsSync(EXCEL_FILE));

    if (!fs.existsSync(EXCEL_FILE)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE}`);
    }

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(EXCEL_FILE);

    console.log("Excel workbook loaded successfully.");

    const sheet = workbook.getWorksheet(SHEET_NAME);

    if (!sheet) {
      throw new Error(`Worksheet "${SHEET_NAME}" was not found.`);
    }

    // ------------------------------------
    // REPORTING DATES
    // ------------------------------------

    const weeks = [];

    for (let col = 3; col <= sheet.columnCount; col++) {
      const value = sheet.getRow(1).getCell(col).value;

      if (
        value instanceof Date &&
        !isNaN(value.getTime())
      ) {
        weeks.push({
          column: col,
          date: value.toISOString().slice(0, 10)
        });
      } else if (
        typeof value === "string" &&
        value.trim()
      ) {
        const parsed = new Date(value);

        if (!isNaN(parsed.getTime())) {
          weeks.push({
            column: col,
            date: parsed.toISOString().slice(0, 10)
          });
        }
      }
    }

    if (weeks.length === 0) {
      throw new Error("No reporting dates were found in row 1.");
    }

    const latest = weeks[weeks.length - 1];

    const previous =
      weeks.length > 1
        ? weeks[weeks.length - 2]
        : null;

    // ------------------------------------
    // AREA PROGRESS
    // ------------------------------------

    const areas = [];
    let currentSection = "";

    for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);

      const sectionValue = row.getCell(1).text.trim();
      const areaName = row.getCell(2).text.trim();

      if (sectionValue) {
        currentSection = sectionValue;
      }

      if (!areaName) {
        continue;
      }

      const progress = weeks.map((week) => {
        const value = row.getCell(week.column).value;

        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return null;
        }

        const numeric = Number(value);

        if (!Number.isFinite(numeric)) {
          return null;
        }

        // Convert values such as 75 to 0.75
        return numeric > 1 ? numeric / 100 : numeric;
      });

      const latestValue = progress[progress.length - 1];

      const previousValue =
        progress.length > 1
          ? progress[progress.length - 2]
          : null;

      areas.push({
        section: currentSection,
        area: areaName,
        progress,
        latest: latestValue,
        previous: previousValue,
        change:
          latestValue === null || previousValue === null
            ? null
            : (latestValue - previousValue) * 100
      });
    }

    // ------------------------------------
    // SECTION SUMMARY
    // ------------------------------------

    const sections = [
      ...new Set(areas.map((item) => item.section))
    ];

    const summary = sections.map((section) => {
      const sectionAreas = areas.filter(
        (item) => item.section === section
      );

      const valid = sectionAreas.filter(
        (item) => item.latest !== null
      );

      const average = valid.length
        ? valid.reduce(
            (sum, item) => sum + item.latest,
            0
          ) / valid.length
        : null;

      return {
        section,
        average
      };
    });

    // Save the processed result in memory
    cachedData = {
      title: sheet.getCell("A1").text,
      latestDate: latest.date,
      previousDate: previous ? previous.date : null,
      weeks: weeks.map((week) => week.date),
      areas,
      summary
    };

    loadError = null;

    console.log("Dashboard data cached successfully.");
    console.log("Reporting dates:", weeks.length);
    console.log("Areas found:", areas.length);
    console.log("------------------------------------");

  } catch (error) {
    loadError = error.message;

    console.error("EXCEL LOADING ERROR:");
    console.error(error.stack || error);

  } finally {
    isLoading = false;
  }
}

// ========================================
// API: RETURN CACHED DATA
// ========================================

app.get("/api/data", (req, res) => {
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  return res.status(503).json({
    error: "Dashboard data is not ready yet.",
    details: loadError || "The Excel workbook is still loading."
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cable dashboard running on port ${PORT}`);
  console.log("Excel file:", EXCEL_FILE);

  // Load the workbook only once at startup
  loadDashboardData();
});
