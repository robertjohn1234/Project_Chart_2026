
const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const EXCEL_FILE = path.join(
  __dirname,
  "Cable Percentage -.xlsx"
);
const SHEET_NAME = "Per week";

// Serve Chart.js locally and the dashboard files.
app.use(
  "/vendor",
  express.static(
    path.join(__dirname, "node_modules", "chart.js", "dist")
  )
);
app.use(express.static(path.join(__dirname, "public")));

// Read the latest weekly cable installation data.
app.get("/api/data", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE);

    const sheet = workbook.getWorksheet(SHEET_NAME);

    if (!sheet) {
      return res.status(404).json({
        error: `Worksheet "${SHEET_NAME}" was not found.`
      });
    }

    // Row 1 contains the reporting dates, starting in column C.
    const weeks = [];

    for (let col = 3; col <= sheet.columnCount; col++) {
      const value = sheet.getRow(1).getCell(col).value;

      if (value instanceof Date && !isNaN(value.getTime())) {
        weeks.push({
          column: col,
          date: value.toISOString().slice(0, 10)
        });
      } else if (typeof value === "string" && value.trim()) {
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
      return res.status(400).json({
        error: "No reporting dates were found in row 1."
      });
    }

    // Latest date is the rightmost valid date column.
    const latest = weeks[weeks.length - 1];
    const previous = weeks.length > 1
      ? weeks[weeks.length - 2]
      : null;

    const areas = [];
    let currentSection = "";

    for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);
      const sectionValue = row.getCell(1).text.trim();
      const areaName = row.getCell(2).text.trim();

      // A section heading appears in column A.
      if (sectionValue) {
        currentSection = sectionValue;
      }

      // Only include rows that have an area name in column B.
      if (!areaName) continue;

      const progress = weeks.map(week => {
        const cell = row.getCell(week.column);
        const value = cell.value;

        if (value === null || value === undefined || value === "") {
          return null;
        }

        // Excel percentage cells are normally stored as fractions.
        const numeric = Number(value);

        if (!Number.isFinite(numeric)) return null;

        // Also support numeric values entered as 25 to mean 25%.
        return numeric > 1 ? numeric / 100 : numeric;
      });

      const latestValue = progress[progress.length - 1];
      const previousValue = progress.length > 1
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

    // Summarize each section using a simple average of its areas.
    const sections = [...new Set(areas.map(item => item.section))];

    const summary = sections.map(section => {
      const sectionAreas = areas.filter(
        item => item.section === section
      );

      const valid = sectionAreas.filter(
        item => item.latest !== null
      );

      const average = valid.length
        ? valid.reduce((sum, item) => sum + item.latest, 0) / valid.length
        : null;

      return { section, average };
    });

    res.json({
      title: sheet.getCell("A1").text,
      latestDate: latest.date,
      previousDate: previous ? previous.date : null,
      weeks: weeks.map(week => week.date),
      areas,
      summary
    });
  } catch (error) {
    console.error("Excel reading error:", error);
    res.status(500).json({
      error: "Unable to read the Excel workbook. Check the filename and close the workbook in Excel before retrying if needed."
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Express API is working on Render"
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("Express is healthy");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cable dashboard running on port ${PORT}`);
});
