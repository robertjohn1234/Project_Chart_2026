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

  // ---------- More daily content (edit or add lines freely; keep the commas) ----------
  const EN_JOKES = [
    "Why did the electrician get promoted?\nHe really knew how to make the right connections.",
    "Why was the cable tray so calm?\nIt knew how to carry the load.",
    "How does a ladder stay humble?\nIt knows its steps.",
    "What did the ground wire say to the live wire?\nStay safe out there, I've got your back.",
    "Why did the circuit breaker go to therapy?\nIt couldn't handle the pressure.",
    "I would tell you a construction joke...\nbut I'm still working on it.",
    "Why did the scarecrow win an award?\nHe was outstanding in his field.",
    "Why don't skeletons fight each other?\nThey don't have the guts.",
    "I told my crew to stay positive.\nNow they only talk about the plus side of the battery.",
    "What do you call a fake noodle?\nAn impasta.",
    "Why did the tape measure get a raise?\nIt always came up with the right length.",
    "I'm reading a book about anti-gravity.\nIt's impossible to put down."
  ];

  const TL_JOKES = [
    "Teacher: Juan, aling buwan ang may 28 araw?\nJuan: Lahat po, ma'am!",
    "Anong sabi ng bumbilya sa switch?\n\u201CIkaw lang ang nagpapaliwanag ng buhay ko.\u201D",
    "Boss: Bakit ka laging late?\nEmpleyado: Sir, mahaba po kasi ang pila... sa kama.",
    "Doktor: Mag-exercise ka para pumayat.\nPasyente: Nag-e-exercise na po ako, Doc!\nDoktor: Ano ginagawa mo?\nPasyente: Tumatalon po sa konklusyon.",
    "Pasahero: Manong, bakit ang bagal ng jeep?\nDriver: Para po matagal tayong magkasama, sir.",
    "Estudyante: Ma'am, may quiz po ba bukas?\nTeacher: Wala.\nEstudyante: Yehey!\nTeacher: Exam po.",
    "Pulis: Bakit mo binilisan ang takbo?\nDriver: Hinahabol ko po ang sweldo, sir.",
    "Customer: Miss, may discount ba kayo?\nTindera: Meron po, sir. Doon po sa kabilang tindahan.",
    "Anong tawag sa gutom na electrician?\nKailangan nang i-charge!",
    "Pare: Bakit ka may dalang hagdan sa meeting?\nKaibigan: Para umangat ang usapan.",
    "Anong sabi ng pusa sa daga?\n\u201CHindi kita kakainin... friend zone lang tayo.\u201D",
    "Nanay: Anak, bakit ang tahimik mo?\nAnak: Nay, nagbabayad po kasi ako ng utang... na loob."
  ];

  const LOVE = [
    "Love is not about finding someone perfect, but about choosing someone every day.",
    "The best kind of love makes you a better version of yourself.",
    "Home is wherever you are with the one you love.",
    "True love listens, even when the words run out.",
    "Love grows when we give without counting.",
    "A kind word and a faithful heart are worth more than a thousand gifts.",
    "Distance means nothing when someone means everything.",
    "To love and to be loved is the warmest kind of sunshine.",
    "Real love stays when it's hard and celebrates when it's easy.",
    "Love is the quiet promise to show up.",
    "Hold hands, hold hope, hold on.",
    "The strongest love is the one that forgives and starts again."
  ];

  const LIFE = [
    "A journey of a thousand miles begins with a single step.",
    "Fall seven times, stand up eight.",
    "The best time to plant a tree was twenty years ago. The second best time is now.",
    "Little by little, a little becomes a lot.",
    "Small efforts repeated every day build big results.",
    "Safety first, so everyone goes home to the people they love.",
    "A smooth sea never made a skilled sailor.",
    "Make each day worth remembering.",
    "Work with patience, finish with pride.",
    "Gratitude turns what we have into enough.",
    "Teamwork turns a heavy load into a light one.",
    "Do your best, then let the rest follow."
  ];

  const HORO = [
    "A small task you finish early today will free up your afternoon. Start with the one you have been avoiding.",
    "Good news may come through a coworker. Stay open and listen well.",
    "Patience pays off today. Double-check the details before you move on.",
    "Someone needs your help. A little kindness from you will go a long way.",
    "Your hard work is being noticed, even if no one says it out loud.",
    "Avoid rushing today. Slow and steady keeps you safe and on schedule.",
    "A new idea arrives in the middle of the day. Write it down before it slips away.",
    "Teamwork is your strength today. Share the load and share the credit.",
    "An old problem has a simple solution. Ask for a fresh pair of eyes.",
    "Take a short break. Rest now will give you more energy later.",
    "Money matters look steady. A small saving today brings comfort later.",
    "A friendly conversation brightens your day. Reach out to someone you miss.",
    "Stay calm when plans change. A better path may be just ahead.",
    "Family comes first this evening. Go home with a grateful heart.",
    "You are closer to your goal than you think. Keep going.",
    "A challenge turns into a lesson. Learn from it and move on with confidence.",
    "Trust your instincts at work today, but confirm with facts.",
    "Someone may surprise you with a kind word. Return the favor.",
    "Focus on one thing at a time. Quality beats speed today.",
    "A small act of courage opens a door. Speak up when it matters.",
    "Be generous with your time. What you give comes back in unexpected ways.",
    "Your energy is high. Use it to finish what you started.",
    "Listen more than you talk today. You will learn something valuable.",
    "A calm mind solves what a hurried one cannot. Breathe, then decide."
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

  // ---------- Daily inspiration: verse, jokes and quotes ----------
  const CATEGORIES = [
    { key: "verse", label: "Bible Verse", items: VERSES.map(v => ({ t: v.t, r: v.r + " (KJV)" })), quote: true },
    { key: "en", label: "English Jokes", items: EN_JOKES.map(t => ({ t })), quote: false },
    { key: "tl", label: "Tagalog Jokes", items: TL_JOKES.map(t => ({ t })), quote: false },
    { key: "love", label: "Love Quotes", items: LOVE.map(t => ({ t })), quote: true },
    { key: "life", label: "Life Quotes", items: LIFE.map(t => ({ t })), quote: true }
  ];

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
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
    }
  };

  let category = 0;
  const shown = {};

  // random = false: the item of the day (or the one already showing); true: a different random one
  function showItem(random) {
    const c = CATEGORIES[category];
    let i = shown[c.key];
    if (random) {
      do { i = Math.floor(Math.random() * c.items.length); } while (i === shown[c.key] && c.items.length > 1);
    } else if (i === undefined) {
      i = hash(todayKey() + "|" + c.key) % c.items.length;
    }
    shown[c.key] = i;
    const item = c.items[i];
    $("verseText").textContent = c.quote ? "\u201C" + item.t + "\u201D" : item.t;
    $("verseRef").textContent = item.r || c.label;
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

  // ---------- Horoscope (for fun): one message per sign per day ----------
  const SIGNS = [
    ["Aries", "\u2648", "Mar 21 \u2013 Apr 19"], ["Taurus", "\u2649", "Apr 20 \u2013 May 20"],
    ["Gemini", "\u264A", "May 21 \u2013 Jun 20"], ["Cancer", "\u264B", "Jun 21 \u2013 Jul 22"],
    ["Leo", "\u264C", "Jul 23 \u2013 Aug 22"], ["Virgo", "\u264D", "Aug 23 \u2013 Sep 22"],
    ["Libra", "\u264E", "Sep 23 \u2013 Oct 22"], ["Scorpio", "\u264F", "Oct 23 \u2013 Nov 21"],
    ["Sagittarius", "\u2650", "Nov 22 \u2013 Dec 21"], ["Capricorn", "\u2651", "Dec 22 \u2013 Jan 19"],
    ["Aquarius", "\u2652", "Jan 20 \u2013 Feb 18"], ["Pisces", "\u2653", "Feb 19 \u2013 Mar 20"]
  ];
  const LUCKY_COLORS = ["Red", "Green", "Blue", "Yellow", "White", "Orange", "Purple", "Gold"];

  function renderHoroscope() {
    const sign = SIGNS[Number($("signSelect").value)];
    const seed = todayKey() + "|" + sign[0];
    $("horoText").textContent = HORO[hash(seed) % HORO.length];
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
