const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "dashboard-data.json");
const SCURVE_FILE = path.join(__dirname, "scurve-data.json");
const DAILY_FILE = path.join(__dirname, "daily-data.json");
const DAILY_HISTORY_FILE = path.join(__dirname, "daily-history.json");

// Optional: smaller downloads for big text files. Install once with:  npm install compression
try { app.use(require("compression")()); } catch (error) { /* not installed: works fine without it */ }

// Quote, joke and horoscope text files (cached by the browser for an hour)
app.use("/content", express.static(path.join(__dirname, "public", "content"), { maxAge: "1h" }));

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

// Bulletin board: every sub-folder of public/images/bulletin is a tab, e.g. "Electrical Team".
// Images placed directly in the bulletin folder go into a "General" tab.
// File and folder names become the captions and tab names (a leading number like "01_" only sets the order).
const BULLETIN_DIR = path.join(__dirname, "public", "images", "bulletin");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const prettyName = n => n.replace(/^\d{1,3}[\s_.-]+/, "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();

function listImages(dir) {
  try {
    return fs.readdirSync(dir).filter(f => IMAGE_RE.test(f)).sort(natural);
  } catch (error) {
    return [];
  }
}

app.get("/api/bulletin", (req, res) => {
  const slidesFor = (files, folder) =>
    files.map(f => ({
      src: "/images/bulletin/" + (folder ? encodeURIComponent(folder) + "/" : "") + encodeURIComponent(f),
      name: prettyName(path.parse(f).name) || f
    }));

  const groups = [];
  const rootFiles = listImages(BULLETIN_DIR);
  if (rootFiles.length) groups.push({ name: "General", slides: slidesFor(rootFiles, "") });

  let folders = [];
  try {
    folders = fs.readdirSync(BULLETIN_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name).sort(natural);
  } catch (error) {
    folders = [];
  }
  folders.forEach(folder => {
    const files = listImages(path.join(BULLETIN_DIR, folder));
    if (files.length) groups.push({ name: prettyName(folder) || folder, slides: slidesFor(files, folder) });
  });

  res.set("Cache-Control", "no-cache").json(groups);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cable dashboard running on port ${PORT}`);
  console.log("Dashboard JSON exists:", fs.existsSync(DATA_FILE));
  console.log("S-curve JSON exists:", fs.existsSync(SCURVE_FILE));
  console.log("Daily JSON exists:", fs.existsSync(DAILY_FILE));
});
