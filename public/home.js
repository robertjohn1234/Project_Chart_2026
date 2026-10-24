(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // ---------- Hero: greeting, date, Christmas countdown ----------
  function initHero() {
    const now = new Date();
    const h = now.getHours();
    $("heroTitle").textContent = (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + ", team!";
    $("heroDate").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((new Date(now.getFullYear(), 11, 25) - today) / 86400000);
    const chip = $("xmasChip");
    chip.textContent = days > 0 ? days + (days === 1 ? " day" : " days") + " until Christmas" : days === 0 ? "Merry Christmas!" : "Season's greetings";
    chip.hidden = false;
  }

  // ---------- Daily inspiration: verse, jokes and quotes ----------
  // The texts are in files in public/content (one item per line), not in this script.
  // Line format:   text      or      text || reference      (write \n for a line break)
  const CATEGORIES = [
    { key: "verse", label: "Bible Verse", file: "verse", quote: true },
    { key: "en", label: "English Jokes", file: "english-jokes", quote: false },
    { key: "tl", label: "Tagalog Jokes", file: "tagalog-jokes", quote: false },
    { key: "love", label: "Love Quotes", file: "love-quotes", quote: true },
    { key: "life", label: "Life Quotes", file: "life-quotes", quote: true }
  ];

  // Loads one content file (only when it is needed) and returns its lines
  async function loadLines(file) {
    const res = await fetch("/content/" + file + ".txt");
    if (!res.ok) throw new Error(file);
    return (await res.text()).split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  }

  function parseItem(line) {
    const cut = line.lastIndexOf(" || ");
    const text = (cut >= 0 ? line.slice(0, cut) : line).replace(/\\n/g, "\n").trim();
    return { t: text, r: cut >= 0 ? line.slice(cut + 4).trim() : "" };
  }

  // Same text all day for everyone, a different one tomorrow
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  // Counts days (local date), so every day moves on to the next block of the list.
  // PER_DAY items are shown each day, and nothing repeats until the whole list has been used:
  // with 310 lines in a file = 31 days without a repeat.
  const PER_DAY = 10;
  function dayNumber() {
    const d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  let category = 0;
  const shown = {};

  // next = false: show today's item (or the one already showing); true: the next of today's PER_DAY items
  async function showItem(next) {
    const c = CATEGORIES[category];
    if (!c.items) {
      $("verseText").textContent = "Loading...";
      $("verseRef").textContent = "";
      try {
        c.items = (await loadLines(c.file)).map(parseItem);
      } catch (e) {
        $("verseText").textContent = "Could not load " + c.label + ". Check public/content/" + c.file + ".txt";
        return;
      }
      if (CATEGORIES[category] !== c) return; // another category was chosen meanwhile
    }
    if (!c.items.length) {
      $("verseText").textContent = "Nothing here yet. Add lines to public/content/" + c.file + ".txt";
      return;
    }

    const perDay = Math.min(PER_DAY, c.items.length);
    let slot = shown[c.key] === undefined ? 0 : shown[c.key];
    if (next) slot = (slot + 1) % perDay;
    shown[c.key] = slot;

    const item = c.items[(dayNumber() * PER_DAY + slot) % c.items.length];
    $("verseText").textContent = c.quote ? "\u201C" + item.t + "\u201D" : item.t;
    $("verseRef").textContent = (item.r || c.label) + " \u00B7 " + (slot + 1) + " of " + perDay + " today";
  }

  function initInspiration() {
    const saved = Number(store.get("inspoCategory"));
    if (Number.isInteger(saved) && saved >= 0 && saved < CATEGORIES.length) category = saved;

    const box = $("inspoChips");
    CATEGORIES.forEach((c, n) => {
      const b = el("button", "", c.label);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(n === category));
      b.addEventListener("click", () => {
        category = n;
        store.set("inspoCategory", String(n));
        [...box.children].forEach((x, k) => x.setAttribute("aria-selected", String(k === n)));
        showItem(false);
      });
      box.appendChild(b);
    });

    $("verseBtn").addEventListener("click", () => showItem(true));
    showItem(false);
  }

  // ---------- Horoscope (for fun): one message per sign per day, from public/content/horoscope.txt ----------
  const SIGNS = [
    ["Aries", "\u2648", "Mar 21 \u2013 Apr 19"], ["Taurus", "\u2649", "Apr 20 \u2013 May 20"],
    ["Gemini", "\u264A", "May 21 \u2013 Jun 20"], ["Cancer", "\u264B", "Jun 21 \u2013 Jul 22"],
    ["Leo", "\u264C", "Jul 23 \u2013 Aug 22"], ["Virgo", "\u264D", "Aug 23 \u2013 Sep 22"],
    ["Libra", "\u264E", "Sep 23 \u2013 Oct 22"], ["Scorpio", "\u264F", "Oct 23 \u2013 Nov 21"],
    ["Sagittarius", "\u2650", "Nov 22 \u2013 Dec 21"], ["Capricorn", "\u2651", "Dec 22 \u2013 Jan 19"],
    ["Aquarius", "\u2652", "Jan 20 \u2013 Feb 18"], ["Pisces", "\u2653", "Feb 19 \u2013 Mar 20"]
  ];
  const LUCKY_COLORS = ["Red", "Green", "Blue", "Yellow", "White", "Orange", "Purple", "Gold"];
  let horoLines = null;

  async function renderHoroscope() {
    if (!horoLines) {
      try { horoLines = await loadLines("horoscope"); }
      catch (e) { $("horoText").textContent = "Horoscope is not available right now."; return; }
    }
    if (!horoLines.length) { $("horoText").textContent = "Add lines to public/content/horoscope.txt"; return; }

    // Each sign gets a different message every day, and none repeats until the list is used up
    // (372 lines = 31 days for 12 signs)
    const signIndex = Number($("signSelect").value);
    const sign = SIGNS[signIndex];
    const seed = todayKey() + "|" + sign[0];
    $("horoText").textContent = horoLines[(dayNumber() * SIGNS.length + signIndex) % horoLines.length];
    $("horoMeta").textContent =
      "Lucky number: " + (1 + hash(seed + "n") % 99) + " \u00B7 Lucky color: " + LUCKY_COLORS[hash(seed + "c") % LUCKY_COLORS.length];
  }

  function initHoroscope() {
    const select = $("signSelect");
    SIGNS.forEach((s, n) => select.appendChild(new Option(s[1] + "\uFE0E " + s[0] + " (" + s[2] + ")", String(n))));
    const saved = Number(store.get("horoSign"));
    select.value = String(Number.isInteger(saved) && saved >= 0 && saved < SIGNS.length ? saved : 0);
    select.addEventListener("change", () => { store.set("horoSign", select.value); renderHoroscope(); });
    renderHoroscope();
  }

  // ---------- Bulletin board: tabs (groups) + carousel ----------
  async function initCarousel() {
    const track = $("carouselTrack");
    let groups = [];
    try {
      const res = await fetch("/api/bulletin", { cache: "no-store" });
      groups = res.ok ? await res.json() : [];
    } catch (e) { groups = []; }
    groups = groups.filter(g => g.slides && g.slides.length);

    if (!groups.length) {
      const empty = el("div", "carousel-empty");
      empty.appendChild(el("strong", "", "Bulletin board"));
      empty.appendChild(el("span", "", "No announcements yet. Add images to public/images/bulletin and push."));
      track.replaceWith(empty);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tabsBox = $("bulletinTabs");
    let slides = [], figures = [], dotButtons = [], index = 0, timer = null, current = 0;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      figures.forEach((f, n) => f.setAttribute("aria-hidden", String(n !== index)));
      dotButtons.forEach((b, n) => b.setAttribute("aria-current", String(n === index)));
      $("carouselCount").textContent = (index + 1) + " / " + slides.length;
    }
    function start() {
      if (!reduce && slides.length > 1 && !timer) timer = setInterval(() => { if (!document.hidden) go(index + 1); }, 6000);
    }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    // Shows one group (tab): rebuilds the slides and dots
    function show(g) {
      current = g;
      slides = groups[g].slides;
      track.replaceChildren();
      $("carouselDots").replaceChildren();

      figures = slides.map((s, i) => {
        const fig = el("figure", "slide");
        const img = document.createElement("img");
        img.src = s.src;
        img.alt = s.name;
        if (i > 0) img.loading = "lazy";
        fig.appendChild(img);
        fig.appendChild(el("figcaption", "", s.name));
        track.appendChild(fig);
        return fig;
      });

      dotButtons = slides.map((s, i) => {
        const b = el("button");
        b.type = "button";
        b.setAttribute("aria-label", "Show announcement " + (i + 1) + ": " + s.name);
        b.addEventListener("click", () => { go(i); restart(); });
        $("carouselDots").appendChild(b);
        return b;
      });

      const many = slides.length > 1;
      $("prevBtn").hidden = !many;
      $("nextBtn").hidden = !many;
      $("carouselBar").hidden = !many;

      [...tabsBox.children].forEach((t, n) => {
        t.setAttribute("aria-selected", String(n === g));
        t.tabIndex = n === g ? 0 : -1;
      });

      go(0);
      restart();
    }

    // Tabs (hidden when there is only the "General" group)
    if (!(groups.length === 1 && groups[0].name === "General")) {
      groups.forEach((g, n) => {
        const t = el("button", "", g.name + " (" + g.slides.length + ")");
        t.type = "button";
        t.setAttribute("role", "tab");
        t.setAttribute("aria-controls", "carousel");
        t.addEventListener("click", () => show(n));
        t.addEventListener("keydown", e => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const next = (n + (e.key === "ArrowRight" ? 1 : -1) + groups.length) % groups.length;
          show(next);
          tabsBox.children[next].focus();
        });
        tabsBox.appendChild(t);
      });
      tabsBox.hidden = false;
    }

    $("prevBtn").addEventListener("click", () => { go(index - 1); restart(); });
    $("nextBtn").addEventListener("click", () => { go(index + 1); restart(); });

    const box = $("carousel");
    box.addEventListener("mouseenter", stop);
    box.addEventListener("mouseleave", start);
    box.addEventListener("focusin", stop);
    box.addEventListener("focusout", start);
    box.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { go(index - 1); restart(); }
      if (e.key === "ArrowRight") { go(index + 1); restart(); }
    });

    let startX = null;
    box.addEventListener("touchstart", e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
    box.addEventListener("touchend", e => {
      if (startX !== null) {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }
      startX = null;
      start();
    });

    show(0);
  }

  // ---------- Project at a glance ----------
  const pct0 = v => Math.round(v * 100) + "%";
  const pct1 = v => (v * 100).toFixed(1) + "%";
  const gapText = g => g === null || g === undefined ? "" : g > 0 ? g.toFixed(1) + " pp behind plan" : g < 0 ? Math.abs(g).toFixed(1) + " pp ahead of plan" : "on plan";

  function tile(href, label, value, sub, more) {
    const a = el("a", "glance-card");
    a.href = href;
    a.appendChild(el("div", "glance-label", label));
    a.appendChild(el("div", "glance-value", value));
    a.appendChild(el("div", "glance-sub", sub));
    a.appendChild(el("div", "glance-more", more + " \u2192"));
    return a;
  }

  async function getJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(url);
    return res.json();
  }

  async function initGlance() {
    const box = $("glance");
    const [cable, scurve, daily] = await Promise.allSettled([
      getJson("/api/data"), getJson("/api/scurve"), getJson("/api/daily")
    ]);
    const na = "Data not available yet";

    if (cable.status === "fulfilled") {
      const d = cable.value;
      const vals = d.areas.filter(a => a.latest !== null).map(a => a.latest);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      box.appendChild(tile("/cable-status.html", "Cable pulling & termination",
        avg === null ? "\u2014" : pct1(avg),
        d.summary.filter(s => s.average !== null).map(s => s.section + " " + pct0(s.average)).join(" \u00B7 "),
        "Open Cable Status"));
    } else box.appendChild(tile("/cable-status.html", "Cable pulling & termination", "\u2014", na, "Open Cable Status"));

    if (scurve.status === "fulfilled") {
      const d = scurve.value, w = d.weeks[d.latestIndex];
      box.appendChild(tile("/s-curve.html", "Project S-curve (actual)", pct1(w.actualCum),
        "Plan " + pct1(w.planCum) + " \u00B7 " + gapText(w.gapPP), "Open S-Curve"));
    } else box.appendChild(tile("/s-curve.html", "Project S-curve (actual)", "\u2014", na, "Open S-Curve"));

    if (daily.status === "fulfilled") {
      const s = daily.value.summary;
      box.appendChild(tile("/daily.html", "Daily activities", s.hold + " on hold",
        s.progress + " in progress \u00B7 " + s.done + " done \u00B7 " + s.total + " total", "Open Daily Activities"));
    } else box.appendChild(tile("/daily.html", "Daily activities", "\u2014", na, "Open Daily Activities"));
  }

  initHero();
  initInspiration();
  initHoroscope();
  initCarousel();
  initGlance();
})();
