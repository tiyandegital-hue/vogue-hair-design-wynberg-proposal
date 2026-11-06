// Vogue Hair Design audit — interactions
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth anchor scrolling (native via CSS; JS fallback for older browsers)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", a.getAttribute("href"));
      }
    });
  });

  // Score dials: count-up + arc draw on scroll
  var CIRC = 2 * Math.PI * 52; // 326.73
  function animateDial(dial) {
    if (dial.dataset.done) return;
    dial.dataset.done = "1";
    var num = dial.querySelector(".dial-num");
    var target = parseInt(num.getAttribute("data-target"), 10);
    var arc = dial.querySelector(".dial-arc");
    var arcTarget = parseInt(arc.getAttribute("data-arc"), 10);
    arc.style.strokeDashoffset = String(CIRC * (1 - arcTarget / 100));
    var start = null, dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var dialObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) animateDial(en.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".dial").forEach(function (d) { dialObserver.observe(d); });

  // Finding cards: stagger 60-90ms on scroll + underline draw via .in-view
  var cards = Array.prototype.slice.call(document.querySelectorAll(".finding"));
  var cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var idx = cards.indexOf(en.target);
      var delay = (idx % 3) * 75; // 0 / 75 / 150ms stagger within a row
      setTimeout(function () { en.target.classList.add("in-view"); }, delay);
      cardObserver.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  cards.forEach(function (c) { cardObserver.observe(c); });

  // Sticky copper progress rail (desktop): tracks scroll through the 7 findings
  var rail = document.getElementById("railFill");
  var findings = document.getElementById("findings");
  function updateRail() {
    if (!rail || !findings) return;
    var rect = findings.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    var pct = total > 0 ? (passed / total) * 100 : 0;
    rail.style.height = Math.min(Math.max(pct, 0), 100).toFixed(1) + "%";
  }
  window.addEventListener("scroll", updateRail, { passive: true });
  window.addEventListener("resize", updateRail);
  updateRail();

  // Scroll-spy nav active states
  var spyLinks = document.querySelectorAll("[data-spy]");
  var spyMap = {};
  spyLinks.forEach(function (l) { spyMap[l.getAttribute("data-spy")] = l; });
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        spyLinks.forEach(function (l) { l.classList.remove("active"); });
        var link = spyMap[en.target.id];
        if (link) link.classList.add("active");
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  ["overview", "good-news", "findings", "fix-plan", "walkthrough"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });
})();
