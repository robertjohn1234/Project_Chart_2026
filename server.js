
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(
  __dirname,
  "dashboard-data.json"
);

app.use(
  "/vendor",
  express.static(
    path.join(__dirname, "node_modules", "chart.js", "dist")
  )
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).send("Express is healthy");
});

app.get("/api/data", (req, res) => {
  try {
    const json = fs.readFileSync(DATA_FILE, "utf8");
    res.type("application/json").send(json);
  } catch (error) {
    console.error("Dashboard JSON error:", error.message);

    res.status(500).json({
      error: "Unable to read dashboard-data.json",
      details: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cable dashboard running on port ${PORT}`);
  console.log(
    "Dashboard JSON exists:",
    fs.existsSync(DATA_FILE)
  );
});
