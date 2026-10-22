(function () {
  "use strict";

  // ---------- Bible verses (King James Version) ----------
  const VERSES = [
    { r: "John 3:16", t: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    { r: "Psalm 23:1", t: "The LORD is my shepherd; I shall not want." },
    { r: "Philippians 4:13", t: "I can do all things through Christ which strengtheneth me." },
    { r: "Jeremiah 29:11", t: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
    { r: "Proverbs 3:5-6", t: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
    { r: "Romans 8:28", t: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
    { r: "Isaiah 41:10", t: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness." },
    { r: "Joshua 1:9", t: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
    { r: "Psalm 46:1", t: "God is our refuge and strength, a very present help in trouble." },
    { r: "Matthew 11:28", t: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
    { r: "Psalm 121:1-2", t: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth." },
    { r: "Psalm 91:11", t: "For he shall give his angels charge over thee, to keep thee in all thy ways." },
    { r: "Proverbs 16:3", t: "Commit thy works unto the LORD, and thy thoughts shall be established." },
    { r: "Colossians 3:23", t: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men." },
    { r: "Galatians 6:9", t: "And let us not be weary in well doing: for in due season we shall reap, if we faint not." },
    { r: "1 Corinthians 13:13", t: "And now abideth faith, hope, charity, these three; but the greatest of these is charity." },
    { r: "Psalm 37:4", t: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart." },
    { r: "Matthew 6:33", t: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
    { r: "Isaiah 40:31", t: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
    { r: "Psalm 118:24", t: "This is the day which the LORD hath made; we will rejoice and be glad in it." },
    { r: "2 Timothy 1:7", t: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
    { r: "Matthew 5:16", t: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven." },
    { r: "Luke 2:11", t: "For unto you is born this day in the city of David a Saviour, which is Christ the Lord." },
    { r: "Luke 2:14", t: "Glory to God in the highest, and on earth peace, good will toward men." },
    { r: "Isaiah 9:6", t: "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace." }
  ];

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

  // ---------- Verse viewer ----------
  let lastVerse = -1;
  function showVerse() {
    let i;
    do { i = Math.floor(Math.random() * VERSES.length); } while (i === lastVerse && VERSES.length > 1);
    lastVerse = i;
    $("verseText").textContent = "\u201C" + VERSES[i].t + "\u201D";
    $("verseRef").textContent = VERSES[i].r + " (KJV)";
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
  showVerse();
  $("verseBtn").addEventListener("click", showVerse);
  initCarousel();
  initGlance();
})();
