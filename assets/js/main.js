/* Pilotech — page d'accueil : préchargeur, apparitions, parallaxe légère. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Entrée du hero ---------- */
  function startHero() {
    var hero = document.querySelector(".hero");
    if (!hero || hero.classList.contains("is-ready")) return;
    hero.querySelectorAll("[data-hero]").forEach(function (el, i) { el.style.setProperty("--i", i); });
    requestAnimationFrame(function () { hero.classList.add("is-ready"); });
  }

  /* ---------- Préchargeur (une fois par session) ---------- */
  function initPreloader() {
    var el = document.getElementById("preloader");
    if (!el || doc.classList.contains("no-preloader") || reduce) {
      if (el) el.remove();
      startHero();
      return;
    }
    var start = Date.now(), minShown = 1500, finished = false;
    function done() {
      if (finished) return; finished = true;
      el.classList.add("is-done");
      try { sessionStorage.setItem("pilotech-portail", "1"); } catch (e) {}
      window.setTimeout(startHero, 350);
      window.setTimeout(function () { el.remove(); }, 1200);
    }
    function finish() { window.setTimeout(done, Math.max(0, minShown - (Date.now() - start))); }
    if (document.readyState === "complete") finish(); else window.addEventListener("load", finish);
    window.setTimeout(done, 4000); /* filet de sécurité si une image externe traîne */
  }

  /* ---------- En-tête : fond au défilement ---------- */
  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var on = false;
    function update() {
      var s = window.scrollY > 24;
      if (s !== on) { on = s; header.classList.toggle("is-scrolled", s); }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Apparitions au défilement ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduce) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    /* Décalage entre éléments frères */
    items.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute("data-reveal"); });
      el.style.setProperty("--i", siblings.indexOf(el));
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target;
          t.classList.add("is-visible"); io.unobserve(t);
          window.setTimeout(function () { t.classList.add("is-settled"); }, 2000);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Parallaxe du visuel du hero (souris + défilement) ---------- */
  function initParallax() {
    if (reduce) return;
    var root = document.querySelector("[data-parallax-root]");
    if (!root) return;
    var layers = root.querySelectorAll("[data-depth]");
    var mx = 0, my = 0, tx = 0, ty = 0, sy = 0, raf = null;
    var wide = window.matchMedia("(min-width: 1024px)");

    function frame() {
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth")) || 0;
        l.style.transform = "translate3d(" + (tx * d * 100).toFixed(2) + "px," + (ty * d * 100 - sy * d * 2.2).toFixed(2) + "px,0)";
      });
      raf = (Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001) ? requestAnimationFrame(frame) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        kick();
      }, { passive: true });
    }
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (!wide.matches) { if (sy) { sy = 0; kick(); } return; }
      sy = Math.min(y, 320);
      kick();
    }, { passive: true });
  }

  /* ---------- Cartes : légère inclinaison 3D au survol ---------- */
  function initTilt() {
    if (reduce || !finePointer) return;
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var product = card.querySelector(".card-product");
      var raf = null, rx = 0, ry = 0;
      function apply() {
        raf = null;
        card.style.transform = "perspective(1200px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-6px)";
        if (product) product.style.translate = (ry * -2.2).toFixed(1) + "px " + (rx * 2.2).toFixed(1) + "px";
      }
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        rx = py * -4; ry = px * 5;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
        if (product) product.style.translate = "";
      });
    });
  }

  function init() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
    initPreloader(); initHeader(); initReveal(); initParallax(); initTilt();
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
