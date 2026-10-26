/* ============================================================
   HOME PAGE THEMES  (public/themes.js)
   ------------------------------------------------------------
   TO CHANGE THE THEME, EDIT ONLY THE TWO LINES BELOW, SAVE, PUSH.

   EVENT   - which event / holiday:
               "new-year"          (Jan 1)
               "valentines"        (Feb 14)
               "holy-week"         (Easter Sunday, date is calculated)
               "labor-day"         (May 1)
               "independence-day"  (Jun 12)
               "buwan-ng-wika"     (August)
               "halloween"         (Oct 31)
               "bonifacio-day"     (Nov 30)
               "christmas"         (Dec 25)
               "auto"              (picks the event nearest to today)

   VARIANT - the look, from 1 to 5. Each event has 5 looks,
             their names are listed in the EVENTS section below.
   ============================================================ */
const EVENT = "halloween";
const VARIANT = 4;


/* ============================================================
   Everything below is the theme data. You normally do not need
   to touch it, except to edit a message or a color.

   Each look is:  [name, main, dark, accent, highlight, stripe]
     main      = buttons, titles, selected tabs (must be a dark color)
     dark      = banner and bulletin background (darker than main)
     accent    = top border of cards, banner stripe
     highlight = chip, active dot, gold-like details (light color)
     stripe    = third color of the banner stripe
   ============================================================ */
(function () {
  "use strict";

  var EVENTS = {
    "new-year": {
      label: "New Year", greet: "Happy New Year!", after: "Happy New Year!",
      month: 1, day: 1, span: 7, dots: false,
      icons: ["🎆", "✨", "🎉", "🥂"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Happy New Year to the whole team, may it be a safe and successful one!",
      looks: [
        ["Midnight Gold", "#1c2340", "#0e1226", "#b8860b", "#f4d06f", "#c0262d"],
        ["Fireworks",     "#2d1b69", "#1a0f40", "#e03131", "#ffd43b", "#1c7ed6"],
        ["Silver Bells",  "#343f4f", "#1e2631", "#1971c2", "#e9ecef", "#adb5bd"],
        ["Fresh Start",   "#0b6e63", "#064540", "#e8590c", "#ffe066", "#1971c2"],
        ["Countdown",     "#5b1a6e", "#350e42", "#f08c00", "#ffc9c9", "#15aabf"]
      ]
    },
    "valentines": {
      label: "Valentine's Day", greet: "Happy Valentine's Day!", after: "Spread the love!",
      month: 2, day: 14, span: 1, dots: false,
      icons: ["💖", "🌹", "💌", "💕"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Happy Hearts Day to the whole team!",
      looks: [
        ["Rose Red",       "#a4133c", "#6a0d28", "#ff4d6d", "#ffd1dc", "#590d22"],
        ["Blush",          "#b0306a", "#761b45", "#e64980", "#ffe3ec", "#f783ac"],
        ["Royal Romance",  "#5a189a", "#3c096c", "#d6336c", "#ffc2d4", "#9d4edd"],
        ["Sweetheart",     "#c2255c", "#7c1238", "#f06595", "#fff0f6", "#fa5252"],
        ["Red and Gold",   "#8b1e2d", "#55101b", "#c9a227", "#f6d776", "#d6336c"]
      ]
    },
    "holy-week": {
      label: "Easter Sunday", greet: "Happy Easter!", after: "He is risen!",
      easter: true, span: 1, dots: false,
      icons: ["🕊️", "✝️", "🌿", "🕯️"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Wishing the whole team a peaceful and reflective Holy Week.",
      looks: [
        ["Lent Violet",         "#4b2a73", "#2d1a47", "#7c4dbb", "#e0cffc", "#adb5bd"],
        ["Dawn of Easter",      "#5b3f8c", "#382558", "#f0b429", "#fff3bf", "#a5d8ff"],
        ["Olive Branch",        "#4a5d23", "#2c3a14", "#8a6d3b", "#e9ecb9", "#6c757d"],
        ["Sacred White & Gold", "#3d3a56", "#25233a", "#b8860b", "#f1e4b3", "#e9ecef"],
        ["Passion Crimson",     "#6a1b2a", "#400e18", "#8e44ad", "#f3d9fa", "#495057"]
      ]
    },
    "labor-day": {
      label: "Labor Day", greet: "Happy Labor Day!", after: "Thank you for your hard work!",
      month: 5, day: 1, span: 1, dots: false,
      icons: ["🛠️", "👷", "🏗️", "⚙️"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Happy Labor Day, thank you to every worker on the team!",
      looks: [
        ["Hard Hat Yellow", "#1c3d5a", "#112638", "#f08c00", "#ffd43b", "#2b8a3e"],
        ["Steel Worker",    "#37474f", "#212d33", "#e8590c", "#ffcc80", "#78909c"],
        ["Blueprint",       "#0b4f8a", "#06335a", "#f59f00", "#a5d8ff", "#1c7ed6"],
        ["Safety Green",    "#1b5e3a", "#0f3a24", "#f08c00", "#c0eb75", "#fab005"],
        ["Red Banner",      "#8b1e2d", "#550f1a", "#1971c2", "#ffe066", "#f08c00"]
      ]
    },
    "independence-day": {
      label: "Independence Day", greet: "Maligayang Araw ng Kalayaan!", after: "Mabuhay ang Pilipinas!",
      month: 6, day: 12, span: 1, dots: false,
      icons: ["🇵🇭", "☀️", "⭐", "🦅"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Maligayang Araw ng Kalayaan to the whole team!",
      looks: [
        ["Philippine Flag", "#0038a8", "#00246f", "#ce1126", "#fcd116", "#ffffff"],
        ["Sampaguita",      "#0f5c6e", "#083a46", "#ce1126", "#fcd116", "#0038a8"],
        ["Araw at Tala",    "#00297a", "#001a52", "#e03131", "#ffe066", "#fcd116"],
        ["Bayanihan",       "#0a3d8f", "#062a63", "#d9480f", "#ffd43b", "#2b8a3e"],
        ["Kalayaan",        "#7a0c1c", "#4a0610", "#0038a8", "#fcd116", "#ffffff"]
      ]
    },
    "buwan-ng-wika": {
      label: "Buwan ng Wika", greet: "Maligayang Buwan ng Wika!", after: "",
      month: 8, day: 1, span: 31, dots: false,
      icons: ["📚", "🖋️", "🌾", "🎋"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Maligayang Buwan ng Wika sa buong team!",
      looks: [
        ["Barong Pina", "#6b4f2a", "#432f14", "#2f7d4f", "#f3e3b3", "#c0262d"],
        ["Kawayan",     "#2f6f3e", "#1b4524", "#b8860b", "#d8f0a5", "#8a6d3b"],
        ["Nipa Hut",    "#5a3d1e", "#36230f", "#e8590c", "#ffd8a8", "#2f7d4f"],
        ["Sinag",       "#1c4b82", "#0f2f55", "#f59f00", "#ffe8a3", "#ce1126"],
        ["Banig",       "#7a1f3d", "#4b1025", "#f08c00", "#ffd6a5", "#2f7d4f"]
      ]
    },
    "halloween": {
      label: "Halloween", greet: "Happy Halloween!", after: "",
      month: 10, day: 31, span: 1, dots: false,
      icons: ["🎃", "🦇", "👻", "🕸️"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Happy Halloween to the whole team, stay safe and enjoy the treats!",
      looks: [
        ["Classic Pumpkin", "#4a1d6e", "#2a0f40", "#e8590c", "#f59f00", "#2b8a3e"],
        ["Haunted Night",   "#1f2a44", "#0f1526", "#7048e8", "#ff922b", "#5c940d"],
        ["Witch's Brew",    "#1b4d3e", "#0e2b23", "#7b2cbf", "#a9e34b", "#e8590c"],
        ["Blood Moon",      "#7a0f1f", "#3f0610", "#d6336c", "#ffd43b", "#343a40"],
        ["Ghostly Mist",    "#364a5e", "#1d2a38", "#e8590c", "#dee2e6", "#7950f2"]
      ]
    },
    "bonifacio-day": {
      label: "Bonifacio Day", greet: "Happy Bonifacio Day!", after: "Mabuhay ang mga bayani!",
      month: 11, day: 30, span: 1, dots: false,
      icons: ["🇵🇭", "⭐", "📜", "🔥"],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Honoring Gat Andres Bonifacio and all our heroes.",
      looks: [
        ["Katipunan Red", "#7a0c1c", "#4a0610", "#ce1126", "#f6d776", "#0038a8"],
        ["Bolo and Banner", "#5c1a1a", "#3a0f0f", "#c0262d", "#ffd8a8", "#343a40"],
        ["Andres Blue",   "#123f7a", "#0b2750", "#ce1126", "#ffe066", "#fcd116"],
        ["Heritage Gold", "#4a3a2a", "#2b2118", "#b02a30", "#f0c24b", "#1f4e8c"],
        ["Bayani Green",  "#1d5b3a", "#0f3823", "#ce1126", "#f6d776", "#0038a8"]
      ]
    },
    "christmas": {
      label: "Christmas", greet: "Merry Christmas!", after: "Season's greetings",
      month: 12, day: 25, span: 1, dots: true,
      icons: [],
      sub: "Welcome to the PH PERTAMA ISTC project dashboard. Merry Christmas to the whole team!",
      looks: [
        ["Classic Christmas", "#0f4d2e", "#0a3320", "#c0262d", "#e0b441", "#1f7a4a"],
        ["Winter Frost",      "#0b4f8a", "#082f54", "#c0262d", "#cfe8ff", "#5aa9e6"],
        ["Candy Cane",        "#a51c30", "#6b0f1e", "#1f7a4a", "#f5f0e1", "#ffffff"],
        ["Golden Noel",       "#5c3d0a", "#3a2606", "#b02a30", "#f0c24b", "#2f6f4f"],
        ["Northern Night",    "#1b2a5c", "#101a3c", "#2fa36b", "#ffd966", "#c0262d"]
      ]
    }
  };

  // ---------- helpers ----------
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }

  // Easter Sunday (Gregorian calendar)
  function easter(year) {
    var a = year % 19, b = Math.floor(year / 100), c = year % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function eventDate(ev, year) {
    return ev.easter ? easter(year) : new Date(year, ev.month - 1, ev.day);
  }

  function rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function luminance(hex) {
    var c = rgb(hex).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  // Dark text on light colors, white text on dark colors
  function readableOn(hex) { return luminance(hex) > 0.4 ? "#1a1a1a" : "#ffffff"; }

  // "auto": the event happening now, or the nearest one coming up
  function pickAuto(today) {
    var best = null, bestDiff = 1e9;
    Object.keys(EVENTS).forEach(function (key) {
      var ev = EVENTS[key];
      [today.getFullYear(), today.getFullYear() + 1].forEach(function (y) {
        var diff = daysBetween(today, eventDate(ev, y));
        var inWindow = diff <= 0 && diff > -ev.span;
        var value = inWindow ? -1 : diff;
        if (value >= -1 && value < bestDiff) { bestDiff = value; best = key; }
      });
    });
    return best;
  }

  // ---------- apply ----------
  function apply() {
    var today = new Date();
    var key = EVENT === "auto" ? pickAuto(today) : EVENT;
    var ev = EVENTS[key];
    if (!ev) {
      if (window.console) console.warn("themes.js: unknown EVENT '" + EVENT + "'");
      return;
    }
    var idx = Math.min(Math.max(Math.round(Number(VARIANT)) || 1, 1), ev.looks.length) - 1;
    var look = ev.looks[idx];
    var body = document.body;

    var vars = {
      "--green": look[1],        // main
      "--green-dark": look[2],   // dark
      "--red": look[3],          // accent
      "--gold": look[4],         // highlight
      "--stripe3": look[5],
      "--glow": "rgba(" + rgb(look[4]).join(",") + ",0.3)",
      "--chip-text": readableOn(look[4])
    };
    Object.keys(vars).forEach(function (k) { body.style.setProperty(k, vars[k]); });
    body.classList.add("theme-" + key, "look-" + (idx + 1));
    if (!ev.dots) body.classList.add("no-dots");

    // (the header keeps the company colors, so the theme only changes the Home page)

    var sub = document.getElementById("heroSub");
    if (sub && ev.sub) sub.textContent = ev.sub;

    // Chip: countdown, greeting on the day, or an after-message
    var chip = document.getElementById("xmasChip");
    if (chip) {
      var date = eventDate(ev, today.getFullYear());
      var diff = daysBetween(today, date);
      var text = "";
      if (diff > 0) text = diff + (diff === 1 ? " day" : " days") + " until " + ev.label;
      else if (diff > -ev.span) text = ev.greet;
      else text = ev.after || "";
      chip.textContent = text;
      chip.hidden = !text;
    }

    // Falling icons in the banner
    var hero = document.querySelector(".hero");
    if (hero && ev.icons.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var fx = document.createElement("div");
      fx.className = "hero-fx";
      fx.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 14; i++) {
        var s = document.createElement("span");
        s.textContent = ev.icons[i % ev.icons.length];
        s.style.left = Math.round((i + Math.random() * 0.8) * (100 / 14)) + "%";
        s.style.fontSize = (16 + Math.round(Math.random() * 14)) + "px";
        s.style.animationDuration = (9 + Math.random() * 9).toFixed(1) + "s";
        s.style.animationDelay = (-Math.random() * 14).toFixed(1) + "s";
        fx.appendChild(s);
      }
      hero.insertBefore(fx, hero.firstChild);
    }
  }

  apply();
})();
