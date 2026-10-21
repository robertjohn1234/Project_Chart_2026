const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "dashboard-data.json");
const SCURVE_FILE = path.join(__dirname, "scurve-data.json");
const DAILY_FILE = path.join(__dirname, "daily-data.json");
const DAILY_HISTORY_FILE = path.join(__dirname, "daily-history.json");

// Serves Chart.js to the browser at /vendor/chart.umd.js
app.use(
  "/vendor",
  express.static(path.join(__dirname, "node_modules", "chart.js", "dist"))
);

// Serves the website files (index.html, s-curve.html, style.css, images)
app.use(express.static(path.join(__dirname, "public")));

// Used by Render to check that the server is alive
app.get("/health", (req, res) => {
  res.status(200).send("Express is healthy");
});

// Reads a JSON file and sends it to the web page
function sendJsonFile(res, file) {
  const name = path.basename(file);
  try {
    const json = fs.readFileSync(file, "utf8");
    res
      .set("Cache-Control", "no-cache")
      .type("application/json")
      .send(json);
  } catch (error) {
    console.error(`${name} error:`, error.message);

    const missing = error.code === "ENOENT";
    res.status(missing ? 503 : 500).json({
      error: missing
        ? `${name} not found. Run update-dashboard.bat and commit the file.`
        : `Unable to read ${name}`,
      details: error.message
    });
  }
}

// Cable status data
app.get("/api/data", (req, res) => sendJsonFile(res, DATA_FILE));

// S-curve data
app.get("/api/scurve", (req, res) => sendJsonFile(res, SCURVE_FILE));

// Daily activities (today's report) and the saved day-by-day history
app.get("/api/daily", (req, res) => sendJsonFile(res, DAILY_FILE));
app.get("/api/daily-history", (req, res) => sendJsonFile(res, DAILY_HISTORY_FILE));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cable dashboard running on port ${PORT}`);
  console.log("Dashboard JSON exists:", fs.existsSync(DATA_FILE));
  console.log("S-curve JSON exists:", fs.existsSync(SCURVE_FILE));
  console.log("Daily JSON exists:", fs.existsSync(DAILY_FILE));
});
