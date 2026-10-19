
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const EXCEL_FILE = path.join(
  __dirname,
  "Cable Percentage -.xlsx"
);

const OUTPUT_FILE = path.join(
  __dirname,
  "dashboard-data.json"
);

const SHEET_NAME = "Per week";

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
    const value = sheet.getRow(1).getCell(col).value;
    let date = null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      date = value;
    } else if (typeof value === "string" && value.trim()) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    if (date) {
      weeks.push({
        column: col,
        date: date.toISOString().slice(0, 10)
      });
    }
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
      const value = row.getCell(column).value;

      if (value === null || value === undefined || value === "") {
        return null;
      }

      const number = Number(value);

      if (!Number.isFinite(number)) return null;

      return number > 1 ? number / 100 : number;
    });

    const latest = progress[progress.length - 1];
    const previous =
      progress.length > 1
        ? progress[progress.length - 2]
        : null;

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
        ? valid.reduce((sum, item) => sum + item.latest, 0) /
          valid.length
        : null
    };
  });

  const data = {
    title: sheet.getCell("A1").text,
    latestDate: weeks[weeks.length - 1].date,
    previousDate:
      weeks.length > 1
        ? weeks[weeks.length - 2].date
        : null,
    weeks: weeks.map(item => item.date),
    areas,
    summary
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(data),
    "utf8"
  );

  console.log("Conversion successful!");
  console.log("Areas:", areas.length);
  console.log("Reporting dates:", weeks.length);
  console.log("Output:", OUTPUT_FILE);
}

main().catch(error => {
  console.error("Conversion failed:", error);
  process.exitCode = 1;
});
