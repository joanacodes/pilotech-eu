/* Pilotech — page d'accueil : préchargeur, apparitions, parallaxe légère. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Entrée du hero ---------- */
  function startHero() {
    var hero = document.querySelector(".hero");
    if (!hero || hero.classList.contains("is-ready")) { doc.classList.add("is-loaded"); return; }
    hero.querySelectorAll("[data-hero]").forEach(function (el, i) { el.style.setProperty("--i", i); });
    requestAnimationFrame(function () { hero.classList.add("is-ready"); doc.classList.add("is-loaded"); });
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


  /* ---------- Avis : défilement automatique, arrêté dès que l'on touche ---------- */
  function initSlider() {
    var root = document.querySelector("[data-slider]");
    if (!root) return;
    var track = root.querySelector("[data-track]");
    var toggle = root.querySelector("[data-toggle]");
    var toggleLabel = root.querySelector("[data-toggle-label]");
    var progress = root.querySelector("[data-progress]");
    var bar = progress ? progress.parentNode : null;
    var DELAY = 5000;
    var stopped = reduce, hovering = false, visible = false, timer = null;
    if (bar) bar.style.setProperty("--slide-ms", DELAY + "ms");

    var cards = Array.prototype.slice.call(track.querySelectorAll(".review"));
    /* Position exacte de chaque carte : pas de conflit avec l'aimantation (scroll-snap) sur Safari */
    function offsetOf(card) { return card.offsetLeft - (parseFloat(getComputedStyle(track).paddingLeft) || 0); }
    function currentIndex() {
      var x = track.scrollLeft, best = 0, bestD = Infinity;
      cards.forEach(function (c, k) { var d = Math.abs(offsetOf(c) - x); if (d < bestD) { bestD = d; best = k; } });
      return best;
    }
    function go(dir) {
      if (!cards.length) return;
      var max = track.scrollWidth - track.clientWidth;
      var i = currentIndex() + dir;
      var left;
      if (dir > 0 && (i >= cards.length || track.scrollLeft >= max - 4)) left = 0;
      else if (i < 0) left = max;
      else left = Math.min(offsetOf(cards[i]), max);
      track.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
    }
    function running() { return !stopped && !hovering && visible && !document.hidden; }
    function restartBar() {
      if (!bar) return;
      bar.classList.remove("is-running");
      void bar.offsetWidth; /* relance l'animation */
      if (running()) bar.classList.add("is-running");
    }
    function schedule() {
      window.clearTimeout(timer);
      restartBar();
      if (running()) timer = window.setTimeout(function () { go(1); schedule(); }, DELAY);
    }
    function setStopped(v) {
      stopped = v;
      toggle.setAttribute("aria-pressed", v ? "true" : "false");
      toggleLabel.textContent = v ? "Lecture" : "Pause";
      schedule();
    }

    /* Toucher, faire glisser ou utiliser les flèches arrête le défilement : on lit à son rythme. */
    track.addEventListener("pointerdown", function () { if (!stopped) setStopped(true); }, { passive: true });
    track.addEventListener("wheel", function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !stopped) setStopped(true); }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setStopped(true); go(e.key === "ArrowRight" ? 1 : -1); }
    });
    root.querySelector("[data-next]").addEventListener("click", function () { setStopped(true); go(1); });
    root.querySelector("[data-prev]").addEventListener("click", function () { setStopped(true); go(-1); });
    toggle.addEventListener("click", function () { setStopped(!stopped); });

    /* Souris posée sur les avis : pause le temps de la lecture. */
    if (finePointer) {
      track.addEventListener("mouseenter", function () { hovering = true; schedule(); });
      track.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    }
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(track);
    } else { visible = true; }
    setStopped(stopped);
  }


  /* ---------- Formulaires FormSubmit (fenêtre e-mail et formulaire de devis) ---------- */
  function doneHTML(title, extra) {
    return '<div class="contact-done" role="status">' +
      '<span class="done-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h2>' + title + '</h2>' +
      '<p>Merci ! L\u2019équipe Pilotech vous répond sous 24 heures ouvrées.</p>' + (extra || "") + '</div>';
  }
  function wireForm(form, onSuccess) {
    if (!form) return;
    var error = form.querySelector("[data-form-error]");
    var errorText = error ? error.textContent : "";
    var next = form.querySelector('input[name="_next"]');
    if (next && /^https?:/.test(window.location.origin)) next.value = new URL(next.getAttribute("data-next-path"), window.location.href).href;

    form.addEventListener("input", function (e) {
      e.target.classList.remove("is-invalid");
      if (form.checkValidity() && error) error.hidden = true;
    });
    form.addEventListener("change", function (e) { e.target.classList.remove("is-invalid"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("[required]").forEach(function (f) {
        if ((f.tagName === "INPUT" && f.type !== "checkbox") || f.tagName === "TEXTAREA") { if (f.value.trim() === "") f.value = ""; }
        var bad = !f.checkValidity();
        f.classList.toggle("is-invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        if (error) { error.textContent = errorText; error.hidden = false; }
        firstBad.focus(); return;
      }
      if (!window.fetch || !window.FormData) { form.submit(); return; }

      var btn = form.querySelector('button[type="submit"]');
      var label = form.querySelector("[data-submit-label]");
      var labelText = label.textContent;
      btn.disabled = true; label.textContent = "Envoi en cours…";
      window.fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST", headers: { Accept: "application/json" }, body: new FormData(form)
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          if (data && (data.success === false || data.success === "false")) throw new Error(data.message || "refus");
          onSuccess();
        })
        .catch(function () {
          /* Repli : envoi classique, FormSubmit redirige ensuite vers merci.html */
          btn.disabled = false; label.textContent = labelText;
          form.submit();
        });
    });
  }

  function initQuote() {
    var box = document.querySelector("[data-quote]");
    if (!box) return;
    wireForm(box.querySelector("form"), function () {
      box.innerHTML = doneHTML("Demande envoyée");
      box.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- Fenêtre « Nous écrire » (FormSubmit) ---------- */
  function initContact() {
    var dialog = document.getElementById("contact");
    if (!dialog) return;
    var body = dialog.querySelector("[data-contact-body]");
    var original = body.innerHTML;
    var sent = false;

    function open() {
      if (sent) { body.innerHTML = original; sent = false; bindForm(); }
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
      doc.classList.add("has-dialog");
    }
    function close() {
      if (typeof dialog.close === "function") dialog.close(); else { dialog.removeAttribute("open"); onClose(); }
    }
    function onClose() { doc.classList.remove("has-dialog"); }

    document.querySelectorAll("[data-open-contact]").forEach(function (b) { b.addEventListener("click", open); });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("[data-close-contact]")) close();
    });
    dialog.addEventListener("close", onClose);

    function bindForm() {
      wireForm(dialog.querySelector("[data-contact-form]"), function () {
        sent = true;
        body.innerHTML = doneHTML("Message envoyé",
          '<button type="button" class="btn btn-tekno contact-submit" data-close-contact style="margin-top:1.6rem"><span>Fermer</span></button>');
      });
    }
    bindForm();
  }

  function init() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
    initPreloader(); initHeader(); initReveal(); initParallax(); initTilt(); initSlider(); initContact(); initQuote();
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
