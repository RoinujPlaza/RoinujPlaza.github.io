/* Roinuj Plaza — interactions */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on load ---------- */
  window.addEventListener("DOMContentLoaded", function () {
    requestAnimationFrame(function () {
      document.body.classList.add("loaded");
    });
  });

  /* ---------- fake live viewer counter ---------- */
  var viewerCount = $("#viewerCount");
  var viewerBadge = $("#viewerBadge");
  var viewers = 35;
  var VIEWERS_MIN = 28;
  var VIEWERS_MAX = 46;

  function renderViewers() {
    viewerCount.textContent = String(viewers);
    viewerBadge.textContent = viewers + "+";
  }

  setInterval(function () {
    var delta = Math.floor(Math.random() * 7) - 3; // -3..+3
    viewers = Math.min(VIEWERS_MAX, Math.max(VIEWERS_MIN, viewers + delta));
    renderViewers();
  }, 4000);

  /* ---------- music toggle ---------- */
  var musicBtn = $("#musicBtn");
  var bgm = $("#bgm");

  function setMusicState(playing) {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.title = playing ? "Pause music" : "Play music";
  }

  musicBtn.addEventListener("click", function () {
    if (bgm.paused) {
      var p = bgm.play();
      if (p && typeof p.catch === "function") {
        p.then(function () { setMusicState(true); }).catch(function () {
          setMusicState(false);
          musicBtn.title = "Audio unavailable";
        });
      } else {
        setMusicState(true);
      }
    } else {
      bgm.pause();
      setMusicState(false);
    }
  });

  bgm.addEventListener("play", function () { setMusicState(true); });
  bgm.addEventListener("pause", function () { setMusicState(false); });
  bgm.addEventListener("error", function () {
    musicBtn.disabled = true;
    musicBtn.title = "music file missing (drop assets/music.mp3)";
  });

  /* ---------- mobile drawer (burger menu) ---------- */
  var burger = $("#burgerBtn");
  var sidebar = $("#sidebar");
  var scrim = $("#scrim");

  function setDrawer(open) {
    sidebar.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    updateBodyLock();
  }

  function updateBodyLock() {
    var locked = sidebar.classList.contains("open")
      || !$("#commentsDialog").classList.contains("hidden")
      || !$("#aboutDialog").classList.contains("hidden")
      || !$("#certLightbox").classList.contains("hidden")
      || $("#scene").classList.contains("select-mode");
    document.body.classList.toggle("no-scroll", locked);
  }

  burger.addEventListener("click", function () {
    setDrawer(!sidebar.classList.contains("open"));
  });
  $("#drawerClose").addEventListener("click", function () { setDrawer(false); });
  scrim.addEventListener("click", function () { setDrawer(false); });

  document.querySelectorAll(".sidebar .nav a, .sidebar .hire-btn").forEach(function (el) {
    el.addEventListener("click", function () { setDrawer(false); });
  });

  /* ---------- character select -> projects overlay ---------- */
  var castSlot = $("#castS1");
  var sceneEl = $("#scene");
  var projectsGrid = $("#projectsGrid");

  function positionSelectedChar() {
    var r = castSlot.getBoundingClientRect();
    var useNarrow = window.innerWidth <= 900;
    var targetX = window.innerWidth * (useNarrow ? 0.82 : 0.81);
    var shift = targetX - (r.left + r.width / 2);
    castSlot.style.setProperty("--shift", shift.toFixed(1) + "px");
  }

  function setProjects(open) {
    if (open) {
      if (!dialog.classList.contains("hidden")) closeDialog();
      if (!aboutDialog.classList.contains("hidden")) closeAbout();
      if (sidebar.classList.contains("open")) setDrawer(false);
      positionSelectedChar();
    }
    castSlot.classList.toggle("active", open);
    castSlot.setAttribute("aria-expanded", String(open));
    sceneEl.classList.toggle("select-mode", open);
    updateBodyLock();
    if (open) {
      var firstClose = projectsGrid.querySelector(".card-close");
      if (firstClose) firstClose.focus();
    } else if (document.contains(castSlot)) {
      castSlot.focus();
    }
  }

  castSlot.addEventListener("click", function () {
    setProjects(!sceneEl.classList.contains("select-mode"));
  });
  castSlot.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      setProjects(!sceneEl.classList.contains("select-mode"));
    }
  });
  document.querySelectorAll(".card-close").forEach(function (btn) {
    btn.addEventListener("click", function () { setProjects(false); });
  });

  window.addEventListener("resize", function () {
    if (sceneEl.classList.contains("select-mode")) positionSelectedChar();
  });

  document.querySelectorAll(".demo-link").forEach(function (link) {
    link.addEventListener("click", function (ev) {
      ev.preventDefault(); // placeholder until real demos exist
    });
  });

  /* tap anywhere (outside cards/character) to close */
  sceneEl.addEventListener("click", function (ev) {
    if (!sceneEl.classList.contains("select-mode")) return;
    if (projectsGrid.contains(ev.target)) return;
    if (castSlot.contains(ev.target)) return;
    setProjects(false);
  });

  /* ---------- comments (local guestbook) ---------- */
  var STORAGE_KEY = "roinuj.plaza.comments";
  var dialog = $("#commentsDialog");
  var list = $("#commentList");
  var form = $("#commentForm");
  var input = $("#commentInput");
  var MAX_COMMENTS = 50;

  function loadComments() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveComments(comments) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      /* storage unavailable (private mode / file:// restriction): keep in-page only */
    }
  }

  function formatWhen(ts) {
    try {
      return new Date(ts).toLocaleString();
    } catch (e) {
      return "";
    }
  }

  function renderComments() {
    var comments = loadComments();
    list.textContent = "";
    if (comments.length === 0) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "no comments yet — be the first!";
      list.appendChild(empty);
      return;
    }
    comments.forEach(function (c) {
      var li = document.createElement("li");
      li.textContent = c.t;
      var when = document.createElement("span");
      when.className = "when";
      when.textContent = formatWhen(c.at);
      li.appendChild(when);
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    var comments = loadComments();
    comments.unshift({ t: text.slice(0, 140), at: Date.now() });
    saveComments(comments.slice(0, MAX_COMMENTS));
    input.value = "";
    renderComments();
  });

  function openDialog() {
    renderComments();
    dialog.classList.remove("hidden");
    updateBodyLock();
    input.focus();
  }

  function closeDialog() {
    dialog.classList.add("hidden");
    updateBodyLock();
  }

  $("#commentsBtn").addEventListener("click", openDialog);
  $("#commentsClose").addEventListener("click", closeDialog);
  dialog.addEventListener("click", function (ev) {
    if (ev.target === dialog) closeDialog();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    if (!$("#certLightbox").classList.contains("hidden")) { closeCert(); return; }
    if (!$("#aboutDialog").classList.contains("hidden")) { closeAbout(); return; }
    if (!dialog.classList.contains("hidden")) { closeDialog(); return; }
    if (sceneEl.classList.contains("select-mode")) { setProjects(false); return; }
    if (sidebar.classList.contains("open")) setDrawer(false);
  });

  /* ---------- about dialog + cert lightbox ---------- */
  var aboutDialog = $("#aboutDialog");
  var certLightbox = $("#certLightbox");
  var certZoom = $("#certZoom");
  var lastAboutTrigger = null;

  function openAbout(trigger) {
    lastAboutTrigger = trigger || null;
    if (!dialog.classList.contains("hidden")) closeDialog();
    if (sidebar.classList.contains("open")) setDrawer(false);
    aboutDialog.classList.remove("hidden");
    updateBodyLock();
  }
  function closeAbout() {
    aboutDialog.classList.add("hidden");
    updateBodyLock();
    if (lastAboutTrigger && document.contains(lastAboutTrigger)) {
      lastAboutTrigger.focus();
    }
    lastAboutTrigger = null;
  }

  function openCert(card) {
    certZoom.innerHTML = card.innerHTML;
    certLightbox.classList.remove("hidden");
    updateBodyLock();
  }
  function closeCert() {
    certLightbox.classList.add("hidden");
    updateBodyLock();
  }

  $("#aboutLink").addEventListener("click", function (ev) {
    ev.preventDefault();
    openAbout(ev.currentTarget);
  });
  $("#projectsLink").addEventListener("click", function (ev) {
    ev.preventDefault();
    setProjects(true);
  });
  var heroAbout = $("#heroAbout");
  heroAbout.addEventListener("click", function () { openAbout(heroAbout); });
  heroAbout.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      openAbout(heroAbout);
    }
  });
  aboutDialog.addEventListener("click", function (ev) {
    if (ev.target === aboutDialog) closeAbout();
  });
  document.querySelectorAll(".cert-card[data-cert]").forEach(function (card) {
    card.addEventListener("click", function () { openCert(card); });
  });
  certLightbox.addEventListener("click", closeCert);

  var ghChart = $(".github-chart");
  if (ghChart) {
    ghChart.addEventListener("error", function () {
      var note = document.createElement("p");
      note.className = "github-fallback";
      note.textContent = "contributions chart unavailable (offline?)";
      ghChart.replaceWith(note);
    });
  }

  /* ---------- nav placeholders ---------- */
  document.querySelectorAll(".nav a[data-soon]").forEach(function (link) {
    link.addEventListener("click", function (ev) {
      ev.preventDefault();
      link.classList.remove("wiggle");
      void link.offsetWidth; // restart animation
      link.classList.add("wiggle");
    });
    link.setAttribute("title", "coming soon");
  });

  /* ---------- scene parallax ---------- */
  var scene = $("#scene");
  var sceneBg = $(".scene-bg");
  var cast = document.querySelector(".cast");
  var targetX = 0, targetY = 0, curX = 0, curY = 0;
  var MAX_SHIFT = 10;
  var rafId = null;

  function tick() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    sceneBg.style.transform =
      "scale(1.04) translate3d(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px,0)";
    if (cast) {
      cast.style.transform =
        "translate3d(" + (curX * 1.4).toFixed(2) + "px," + (curY * 1.4).toFixed(2) + "px,0)";
    }
    if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function kick() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  if (!reduceMotion && scene && sceneBg && window.matchMedia("(pointer: fine)").matches) {
    scene.addEventListener("pointermove", function (ev) {
      var r = scene.getBoundingClientRect();
      targetX = ((ev.clientX - r.left) / r.width - 0.5) * 2 * MAX_SHIFT * -1;
      targetY = ((ev.clientY - r.top) / r.height - 0.5) * 2 * MAX_SHIFT * -1;
      kick();
    });
    scene.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      kick();
    });
  }
})();
