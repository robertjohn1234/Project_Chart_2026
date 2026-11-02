// Builds the site header and navigation on every page.
// To add a new dashboard, add one line to DASHBOARDS below.
(function () {
  const DASHBOARDS = [
    { href: "/cable-status", label: "Cable Status" },
    { href: "/s-curve", label: "S-Curve" },
    { href: "/daily", label: "Daily Activities" },
    { href: "/categories", label: "LV Categories" }
  ];

  // Works with or without ".html" in the address (e.g. /cable-status and /cable-status.html)
  const clean = p => p.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/(.)\/$/, "$1");
  const path = clean(location.pathname);
  const onHome = path === "/";
  const onDashboards = DASHBOARDS.some(d => clean(d.href) === path);

  // Colors the browser bar on phones
  const theme = document.createElement("meta");
  theme.name = "theme-color";
  theme.content = "#0065B2";
  document.head.appendChild(theme);

  const current = flag => (flag ? ' aria-current="page"' : "");

  let html =
    '<header class="topbar"><div class="topbar-inner">' +
    '<a class="brand" href="/" aria-label="PH PERTAMA dashboard home">' +
    '<img class="brand-logo" src="/images/phpertama-logo.jpg" alt="PH PERTAMA logo" onerror="this.style.display=\'none\'">' +
    '<div class="brand-copy"><div class="brand-name">PH PERTAMA ISTC</div>' +
    '<div class="brand-subtitle">Project Dashboard</div></div></a>' +
    '<nav class="main-nav" aria-label="Main navigation">' +
    '<a href="/"' + current(onHome) + ">Home</a>" +
    '<a href="' + DASHBOARDS[0].href + '"' + current(onDashboards) + ">Dashboards</a>" +
    "</nav></div></header>";

  if (onDashboards) {
    html +=
      '<nav class="sub-nav" aria-label="Dashboards"><div class="sub-nav-inner">' +
      DASHBOARDS.map(d => '<a href="' + d.href + '"' + current(clean(d.href) === path) + ">" + d.label + "</a>").join("") +
      "</div></nav>";
  }

  const host = document.getElementById("site-header");
  if (host) host.innerHTML = html;
})();
