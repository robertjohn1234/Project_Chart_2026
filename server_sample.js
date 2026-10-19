
const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const excelPath = path.join(__dirname, "data.xlsx");

// Make Chart.js available locally, without a CDN.
app.use(
  "/vendor",
  express.static(path.join(__dirname, "node_modules", "chart.js", "dist"))
);

// Serve the dashboard.
app.use(express.static(path.join(__dirname, "public")));

// Create a sample Excel workbook if it does not exist.
async function createSampleWorkbook() {
  if (fs.existsSync(excelPath)) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  sheet.columns = [
    { header: "Month", key: "month", width: 18 },
    { header: "Sales", key: "sales", width: 15 },
    { header: "Expenses", key: "expenses", width: 15 },
  ];

  sheet.addRows([
    { month: "January", sales: 50000, expenses: 32000 },
    { month: "February", sales: 62000, expenses: 38000 },
    { month: "March", sales: 58000, expenses: 35000 },
    { month: "April", sales: 75000, expenses: 42000 },
    { month: "May", sales: 70000, expenses: 40000 },
    { month: "June", sales: 85000, expenses: 47000 },
  ]);

  await workbook.xlsx.writeFile(excelPath);
  console.log("Sample data.xlsx created.");
}

// API: read Excel data and send it to the dashboard.
app.get("/api/data", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);

    const sheet = workbook.getWorksheet("Data");
    const rows = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      rows.push({
        month: row.getCell(1).text,
        sales: Number(row.getCell(2).value) || 0,
        expenses: Number(row.getCell(3).value) || 0,
      });
    });

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to read Excel data." });
  }
});

async function startServer() {
  await createSampleWorkbook();

  app.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
