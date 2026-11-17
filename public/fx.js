// FX: animations and extras for the whole dashboard. Loaded by nav.js on every page.
// Everything is switched here. Set a line to false to turn that effect off.
(function () {
  "use strict";

  var FX = {
    pageFade: true,    // soft fade when a page opens or you click a link
    heroWords: true,   // the Home greeting slides in word by word
    floaters: true,    // slow floating icons behind the Home greeting
    heroShine: true,   // a slow light sweep across the Home banner
    reveal: true,      // sections slide in as you scroll
    countUp: true,     // numbers count up when they appear
    mascot: true,      // the helper in the corner
    present: true      // "Present" button on the dashboard pages
  };
  var MASCOT_NAME = "Hardy";
  var FLOATERS = ["⚙️", "⚡", "🔌", "🏗️", "👷", "🔧"]; // gear, bolt, plug, crane, worker, wrench

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  root.classList.add("fx");
  var $ = function (id) { return document.getElementById(id); };
  var path = location.pathname.replace(/\.html$/, "").replace(/(.)\/$/, "$1");

  // ---------------------------------------------------------------- page fade
  function initPageFade() {
    if (reduce) return;
    document.body.classList.add("fx-fade");
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("download")) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname || root.classList.contains("fx-present")) return;
      e.preventDefault();
      document.body.classList.add("fx-leave");
      setTimeout(function () { location.href = a.href; }, 180);
    });
    window.addEventListener("pageshow", function () { document.body.classList.remove("fx-leave"); });
  }

  // --------------------------------------------------------------- hero words
  function splitHero() {
    var h = $("heroTitle");
    if (!h) return;
    var text = h.textContent;
    if (!text || h.dataset.fxSplit === text) return;
    h.dataset.fxSplit = text;
    h.textContent = "";
    text.split(/\s+/).forEach(function (word, i, all) {
      var s = document.createElement("span");
      s.className = "fx-word";
      s.style.setProperty("--i", i);
      s.textContent = word;
      h.appendChild(s);
      if (i < all.length - 1) h.appendChild(document.createTextNode(" "));
    });
  }
  function initHeroWords() {
    var h = $("heroTitle");
    if (!h) return;
    splitHero();
    if (window.MutationObserver) new MutationObserver(splitHero).observe(h, { childList: true, characterData: true, subtree: true });
  }

  var XMAS_ICONS = ["\u2744\uFE0F", "\uD83C\uDF84", "\u2B50", "\uD83C\uDF81", "\uD83D\uDD14", "\u2603\uFE0F", "\uD83C\uDF1F"]; // snowflake, tree, star, gift, bell, snowman, glowing star

  // Icons that match the current theme: the ones themes.js already uses, Christmas icons, or the work icons
  function floaterIcons(hero) {
    var found = [];
    var old = hero.querySelectorAll(".hero-fx span");
    for (var k = 0; k < old.length; k++) if (found.indexOf(old[k].textContent) < 0) found.push(old[k].textContent);
    if (found.length) return found;
    if (document.body.classList.contains("theme-christmas")) return XMAS_ICONS;
    return FLOATERS;
  }

  function initFloaters() {
    var hero = document.querySelector(".hero");
    if (!hero || reduce) return;
    var icons = floaterIcons(hero);
    var box = document.createElement("div");
    box.className = "hero-float";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 12; i++) {
      var s = document.createElement("span");
      s.textContent = icons[i % icons.length];
      s.style.left = 40 + (i * 7) % 56 + "%"; // right side, mostly away from the text
      s.style.fontSize = 24 + (i * 7) % 22 + "px";
      s.style.animationDuration = 20 + (i * 5) % 14 + "s";
      s.style.animationDelay = -(i * 2.7) + "s";
      box.appendChild(s);
    }
    hero.insertBefore(box, hero.firstChild);
  }

  function initShine() {
    var hero = document.querySelector(".hero");
    if (!hero || reduce) return;
    var shine = document.createElement("div");
    shine.className = "hero-shine";
    shine.setAttribute("aria-hidden", "true");
    hero.insertBefore(shine, hero.firstChild);
  }

  // ------------------------------------------------------------ count-up numbers
  var NUMBER = /^([+\-]?)(\d+(?:\.\d+)?)((?:%|\s?pp)?(?:\s[A-Za-z][A-Za-z ]*)?)$/;
  function countUp(el) {
    if (reduce || el.dataset.fxCount || el.children.length) return;
    var original = el.textContent.trim();
    var m = original.match(NUMBER);
    if (!m) return;
    el.dataset.fxCount = "1";
    var target = parseFloat(m[2]);
    var decimals = (m[2].split(".")[1] || "").length;
    var start = null, duration = 1000;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = p === 1 ? original : m[1] + (target * eased).toFixed(decimals) + m[3];
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function countInside(el) {
    if (!FX.countUp) return;
    if (el.matches(".glance-value, .card-value")) countUp(el);
    var list = el.querySelectorAll(".glance-value, .card-value");
    for (var i = 0; i < list.length; i++) countUp(list[i]);
  }

  // ------------------------------------------------------------- scroll reveal
  var REVEAL = ".page-heading, .section-title, .carousel, .verse-card, .safety-card, .focus-card, .glance-card, .card, .panel, .footer";
  var io = null;
  function revealScan(scope) {
    var items = (scope || document).querySelectorAll(REVEAL);
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (el.dataset.fx) continue;
      el.dataset.fx = "1";
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", Math.min(index, 6) * 70 + "ms");
      if (FX.reveal && io) { el.classList.add("fx-reveal"); io.observe(el); }
      else countInside(el);
    }
  }
  function initReveal() {
    if (reduce || !("IntersectionObserver" in window)) { FX.reveal = false; }
    else {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("fx-in");
          io.unobserve(entry.target);
          countInside(entry.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });
    }
    revealScan();
    var main = document.querySelector("main");
    if (main && window.MutationObserver) {
      var timer = null;
      new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () { revealScan(main); }, 60);
      }).observe(main, { childList: true, subtree: true });
    }
  }

  // ------------------------------------------------------------------ mascot
  var HELMET_SVG =
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M10 64c0-11 9-17 22-17s22 6 22 17z" fill="#0065B2"/>' +
    '<path d="M22 64l4-13h12l4 13z" fill="#F2A900" opacity=".9"/>' +
    '<g class="fx-arm"><rect x="48" y="46" width="7" height="14" rx="3.5" fill="#0065B2"/><circle cx="52" cy="45" r="4" fill="#F5C9A0"/></g>' +
    '<circle cx="32" cy="34" r="13" fill="#F5C9A0"/>' +
    '<circle cx="24.5" cy="40" r="2.6" fill="#F4A58A" opacity=".55"/><circle cx="39.5" cy="40" r="2.6" fill="#F4A58A" opacity=".55"/>' +
    '<ellipse class="fx-eye" cx="27" cy="36.5" rx="1.9" ry="2.3" fill="#14213D"/><ellipse class="fx-eye" cx="37" cy="36.5" rx="1.9" ry="2.3" fill="#14213D"/>' +
    '<path d="M27.5 42q4.5 4 9 0" stroke="#14213D" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M17 30c0-11 7-17 15-17s15 6 15 17z" fill="#F2A900"/>' +
    '<rect x="29" y="12" width="6" height="14" rx="3" fill="#E39B00"/>' +
    '<rect x="13" y="29" width="38" height="5" rx="2.5" fill="#E39B00"/>' +
    '</svg>';

  var info = { cable: null, daily: null };
  function getJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); }).catch(function () { return null; });
  }
  function shortDate(s) {
    var d = new Date(s + "T00:00:00");
    return isNaN(d) ? "last week" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function messages() {
    var m = [];
    var c = info.cable, d = info.daily;
    if (c && c.summary) {
      c.summary.filter(function (s) { return s.average !== null; }).slice(0, 3).forEach(function (s) {
        m.push(s.section + " cabling is at " + (s.average * 100).toFixed(1) + "% on average.");
      });
      var movers = (c.areas || []).filter(function (a) { return a.change !== null && a.change > 0; })
        .sort(function (a, b) { return b.change - a.change; });
      if (movers.length) {
        var a = movers[0];
        m.push("Great job! " + a.section + " " + a.area + " moved +" + a.change.toFixed(1) + " points since " + shortDate(c.previousDate) + ".");
      }
      var near = (c.areas || []).filter(function (a) { return a.latest !== null && a.latest >= 0.95 && a.latest < 1; });
      if (near.length) m.push(near[0].section + " " + near[0].area + " is almost done at " + (near[0].latest * 100).toFixed(1) + "%!");
      var done = (c.areas || []).filter(function (a) { return a.latest !== null && a.latest >= 1; });
      if (done.length) m.push(done.length + " area" + (done.length > 1 ? "s are" : " is") + " already at 100%. Well done, team!");
    }
    if (d && d.summary) {
      m.push(d.summary.done + " of " + d.summary.total + " daily activities are done" + (d.summary.hold ? ", " + d.summary.hold + " on hold." : "."));
    }
    m.push("Tip: open a dashboard and press the Present button for a full-screen slide view.");
    m.push("Tip: on Cable Status, click a LV zone to see its categories.");
    return m;
  }

  function initMascot() {
    try {
      var q = new URLSearchParams(location.search).get("helper");
      if (q === "on") localStorage.removeItem("fxHelperOff");
      if (q === "off") localStorage.setItem("fxHelperOff", "1");
      if (localStorage.getItem("fxHelperOff") === "1") return;
    } catch (e) { /* storage blocked: show the helper */ }

    var wrap = document.createElement("div");
    wrap.className = "fx-mascot";
    wrap.innerHTML =
      '<div class="fx-bubble" hidden role="status"><div class="fx-bubble-name"></div><div class="fx-bubble-text"></div>' +
      '<div class="fx-bubble-actions"><button type="button" data-a="next">Another</button><button type="button" data-a="close">Close</button><button type="button" data-a="off">Hide helper</button></div></div>' +
      '<button class="fx-mascot-btn" type="button" aria-label="' + MASCOT_NAME + ', your project helper. Click for an update.">' + HELMET_SVG + '</button>';
    document.body.appendChild(wrap);

    var bubble = wrap.querySelector(".fx-bubble");
    var text = wrap.querySelector(".fx-bubble-text");
    wrap.querySelector(".fx-bubble-name").textContent = MASCOT_NAME;
    var list = null, i = 0, hideTimer = null, loading = null;

    function load() {
      if (!loading) {
        loading = Promise.all([getJson("/api/data"), getJson("/api/daily")]).then(function (r) {
          info.cable = r[0]; info.daily = r[1];
          list = messages();
          if (path === "/") list.unshift("Hi team! I'm " + MASCOT_NAME + ", your project helper. Click me for an update!");
          else list.unshift("Hi! I'm " + MASCOT_NAME + ". Click me for a quick update.");
        });
      }
      return loading;
    }
    function say(next) {
      load().then(function () {
        if (next) i = (i + 1) % list.length;
        text.textContent = list[i];
        bubble.hidden = false;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () { bubble.hidden = true; }, 9000);
      });
    }
    wrap.querySelector(".fx-mascot-btn").addEventListener("click", function () { say(!bubble.hidden); });
    bubble.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-a");
      if (a === "next") say(true);
      if (a === "close") bubble.hidden = true;
      if (a === "off") {
        try { localStorage.setItem("fxHelperOff", "1"); } catch (err) { /* ignore */ }
        wrap.remove();
      }
    });

    // Say hello once per visit to the site (not on every page)
    var greeted = false;
    try { greeted = sessionStorage.getItem("fxHello") === "1"; sessionStorage.setItem("fxHello", "1"); } catch (e) { /* ignore */ }
    if (!greeted) setTimeout(function () { say(false); }, 2200);
  }

  // ------------------------------------------------------- presentation mode
  function initPresent() {
    var bar = document.querySelector(".sub-nav-inner");
    var main = document.querySelector("main.page-shell");
    if (!bar || !main) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fx-present-btn";
    btn.textContent = "▶ Present";
    btn.title = "Full-screen slides. Arrow keys or swipe to move, Esc to exit.";
    bar.appendChild(btn);

    var ctl = document.createElement("div");
    ctl.className = "fx-pres-ctl";
    ctl.innerHTML = '<button type="button" data-a="prev" aria-label="Previous slide">&#8249;</button><span class="fx-pres-count" aria-live="polite"></span>' +
      '<button type="button" data-a="next" aria-label="Next slide">&#8250;</button><button type="button" class="fx-pres-exit" data-a="exit">Exit</button>';
    document.body.appendChild(ctl);
    var count = ctl.querySelector(".fx-pres-count");

    var slides = [], idx = 0, active = false;

    function collect() {
      return Array.prototype.filter.call(main.children, function (c) {
        if (c.matches(".page-heading, .footer, script, style, .filter-panel")) return false;
        if (c.hidden || getComputedStyle(c).display === "none") return false;
        return c.textContent.trim() !== "" || c.querySelector("canvas");
      });
    }
    function show(n) {
      idx = Math.max(0, Math.min(slides.length - 1, n));
      slides.forEach(function (s, k) { s.classList.toggle("fx-cur", k === idx); });
      count.textContent = (idx + 1) + " / " + slides.length;
      window.scrollTo(0, 0);
      // Charts need to measure their new size
      [60, 350].forEach(function (ms) { setTimeout(function () { window.dispatchEvent(new Event("resize")); }, ms); });
    }
    function enter() {
      slides = collect();
      if (!slides.length) return;
      slides.forEach(function (s) { s.classList.add("fx-slide"); });
      active = true;
      root.classList.add("fx-present");
      show(0);
      var req = root.requestFullscreen || root.webkitRequestFullscreen;
      if (req) { try { var p = req.call(root); if (p && p.catch) p.catch(function () { /* stays in page mode */ }); } catch (e) { /* ignore */ } }
    }
    function exit() {
      if (!active) return;
      active = false;
      root.classList.remove("fx-present");
      slides.forEach(function (s) { s.classList.remove("fx-slide", "fx-cur"); });
      if (document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen(); } catch (e) { /* ignore */ } }
      setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 60);
    }

    btn.addEventListener("click", enter);
    ctl.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-a");
      if (a === "prev") show(idx - 1);
      if (a === "next") show(idx + 1);
      if (a === "exit") exit();
    });
    document.addEventListener("keydown", function (e) {
      if (!active) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); show(idx + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(idx - 1); }
      else if (e.key === "Home") show(0);
      else if (e.key === "End") show(slides.length - 1);
      else if (e.key === "Escape") exit();
    });
    document.addEventListener("fullscreenchange", function () { if (active && !document.fullscreenElement) exit(); });
    var x0 = null;
    document.addEventListener("touchstart", function (e) { if (active) x0 = e.touches[0].clientX; }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (!active || x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // -------------------------------------------------------------------- start
  function start() {
    if (FX.pageFade) initPageFade();
    if (FX.heroWords) initHeroWords();
    if (FX.floaters) initFloaters();
    if (FX.heroShine) initShine();
    initReveal();
    if (FX.mascot) initMascot();
    if (FX.present) initPresent();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
