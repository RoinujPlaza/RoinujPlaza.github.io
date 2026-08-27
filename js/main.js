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
      || !$("#hireDialog").classList.contains("hidden")
      || $("#scene").classList.contains("select-mode")
      || $("#scene").classList.contains("stack-mode")
      || $("#scene").classList.contains("typing-mode");
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
  var projectsVeil = $("#projectsVeil");

  function positionSelectedChar() {
    var r = castSlot.getBoundingClientRect();
    var useNarrow = window.innerWidth <= 900;
    var targetX = window.innerWidth * (useNarrow ? 0.81 : 0.79);
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

  /* ---------- middle character -> stack and tools ---------- */
  var castSlot2 = $("#castS2");
  var stackGrid = $("#stackGrid");
  var stackVeil = $("#stackVeil");

  function positionSelectedChar2() {
    var r = castSlot2.getBoundingClientRect();
    var useNarrow = window.innerWidth <= 900;
    var targetX = window.innerWidth * (useNarrow ? 0.86 : 0.75);
    var shift = targetX - (r.left + r.width / 2);
    castSlot2.style.setProperty("--shift", shift.toFixed(1) + "px");
  }

  function setStack(open) {
    if (open) {
      if (sceneEl.classList.contains("select-mode")) setProjects(false);
      if (!dialog.classList.contains("hidden")) closeDialog();
      if (!aboutDialog.classList.contains("hidden")) closeAbout();
      if (sidebar.classList.contains("open")) setDrawer(false);
      positionSelectedChar2();
    }
    castSlot2.classList.toggle("active", open);
    castSlot2.setAttribute("aria-expanded", String(open));
    sceneEl.classList.toggle("stack-mode", open);
    updateBodyLock();
    if (open) {
      stackGrid.focus && stackGrid.focus();
    } else if (document.contains(castSlot2)) {
      castSlot2.focus();
    }
  }

  // make setProjects also close stack (mutual exclusive)
  var _origSetProjects = setProjects;
  setProjects = function (open) {
    if (open && sceneEl.classList.contains("stack-mode")) setStack(false);
    _origSetProjects(open);
  };

  castSlot2.addEventListener("click", function () {
    setStack(!sceneEl.classList.contains("stack-mode"));
  });
  castSlot2.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      setStack(!sceneEl.classList.contains("stack-mode"));
    }
  });

  window.addEventListener("resize", function () {
    if (sceneEl.classList.contains("stack-mode")) positionSelectedChar2();
  });

  sceneEl.addEventListener("click", function (ev) {
    if (!sceneEl.classList.contains("stack-mode")) return;
    if (stackGrid.contains(ev.target)) return;
    if (castSlot2.contains(ev.target)) return;
    setStack(false);
  });

  /* populate infinite marquees */
  (function populateMarquees() {
    var stacks = {
      marqueeFrontend: [
        { src: "assets/stack/html5.svg", alt: "HTML5" },
        { src: "assets/stack/css3.svg", alt: "CSS3" },
        { src: "assets/stack/javascript.svg", alt: "JavaScript" },
        { src: "assets/stack/nextjs.svg", alt: "Next.js" },
        { src: "assets/stack/flutter.svg", alt: "Flutter" }
      ],
      marqueeBackend: [
        { src: "assets/stack/mongodb.svg", alt: "MongoDB" },
        { src: "assets/stack/php.svg", alt: "PHP" },
        { src: "assets/stack/dart.svg", alt: "Dart" },
        { src: "assets/stack/mysql.svg", alt: "MySQL" }
      ],
      marqueeTools: [
        { src: "assets/stack/git.svg", alt: "Git" },
        { src: "assets/stack/github.svg", alt: "GitHub" },
        { src: "assets/stack/vscode.svg", alt: "VS Code" }
      ]
    };

    // pad shorter rows so all have 5 tiles (equally full marquee)
    var maxLen = 5;
    Object.keys(stacks).forEach(function (k) {
      var orig = stacks[k].slice();
      while (stacks[k].length < maxLen) {
        stacks[k].push(orig[stacks[k].length % orig.length]);
      }
    });

    function buildTrack(id, items) {
      var track = document.getElementById(id);
      if (!track) return;
      function addSet(hidden) {
        items.forEach(function (it) {
          var tile = document.createElement("div");
          tile.className = "tech-tile";
          if (hidden) tile.setAttribute("aria-hidden", "true");
          var img = document.createElement("img");
          img.src = it.src;
          img.alt = it.alt;
          img.loading = "lazy";
          img.draggable = false;
          img.addEventListener("error", function () {
            // fallback: show text label if logo missing
            img.style.display = "none";
            var fallback = document.createElement("span");
            fallback.textContent = it.alt;
            fallback.style.fontFamily = '"Silkscreen", monospace';
            fallback.style.fontSize = "10px";
            fallback.style.textAlign = "center";
            tile.appendChild(fallback);
          });
          tile.appendChild(img);
          track.appendChild(tile);
        });
      }
      addSet(false);
      addSet(true); // duplicate for seamless loop
    }

    Object.keys(stacks).forEach(function (id) { buildTrack(id, stacks[id]); });
  })();

  /* ---------- third character -> typing test ---------- */
  var castSlot3 = $("#castS3");
  var typingGrid = $("#typingGrid");
  var typingVeil = $("#typingVeil");
  var typingText = $("#typingText");
  var typingInput = $("#typingInput");
  var wpmEl = $("#wpm");
  var accEl = $("#acc");
  var timeEl = $("#time");
  var typingRestart = $("#typingRestart");

  var snippets = [
    "function greet(name) {\n  return `Hello, ${name}!`;\n}",
    "<div class=\"card\">\n  <h1>Roinuj Plaza</h1>\n  <p>Hello World</p>\n</div>",
    ".card {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
    "const sum = (a, b) => a + b;\nconsole.log(sum(2, 3));",
    "async function fetchData(url) {\n  const res = await fetch(url);\n  return res.json();\n}",
    "<?php\n  echo \"Hello, Roinuj!\";\n?>",
    "SELECT * FROM users\nWHERE active = 1\nORDER BY name;",
    "<nav class=\"nav\">\n  <a href=\"#\">Home</a>\n</nav>"
  ];
  var currentSnippet = "";
  var timer = null;
  var timeLeft = 30;
  var started = false;

  function positionSelectedChar3() {
    var r = castSlot3.getBoundingClientRect();
    var useNarrow = window.innerWidth <= 900;
    var targetX = window.innerWidth * (useNarrow ? 0.86 : 0.82);
    var shift = targetX - (r.left + r.width / 2);
    castSlot3.style.setProperty("--shift", shift.toFixed(1) + "px");
  }

  function renderSnippet() {
    typingText.textContent = "";
    for (var i = 0; i < currentSnippet.length; i++) {
      var span = document.createElement("span");
      span.textContent = currentSnippet[i];
      span.className = "pending";
      typingText.appendChild(span);
    }
  }

  function pickSnippet() {
    currentSnippet = snippets[Math.floor(Math.random() * snippets.length)];
    renderSnippet();
    typingInput.value = "";
    typingInput.disabled = false;
    wpmEl.textContent = "0";
    accEl.textContent = "100%";
    timeLeft = 30;
    timeEl.textContent = timeLeft + "s";
    started = false;
    clearInterval(timer);
    timer = null;
  }

  function updateStats() {
    var typed = typingInput.value;
    var correct = 0;
    for (var i = 0; i < typed.length && i < currentSnippet.length; i++) {
      if (typed[i] === currentSnippet[i]) correct++;
    }
    var elapsed = 30 - timeLeft;
    var mins = elapsed / 60 || 0.01;
    var wpm = Math.round((correct / 5) / mins);
    if (!isFinite(wpm) || wpm < 0) wpm = 0;
    if (typed.length === 0) wpm = 0;
    wpmEl.textContent = String(wpm);
    var acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    accEl.textContent = acc + "%";
    var spans = typingText.children;
    for (var j = 0; j < spans.length; j++) {
      if (j < typed.length) {
        spans[j].className = typed[j] === currentSnippet[j] ? "correct" : "incorrect";
      } else {
        spans[j].className = "pending";
      }
    }
  }

  function startTimer() {
    if (started) return;
    started = true;
    timer = setInterval(function () {
      timeLeft--;
      timeEl.textContent = timeLeft + "s";
      updateStats();
      if (timeLeft <= 0) {
        clearInterval(timer);
        timer = null;
        typingInput.disabled = true;
      }
    }, 1000);
  }

  function setTyping(open) {
    if (open) {
      if (sceneEl.classList.contains("select-mode")) setProjects(false);
      if (sceneEl.classList.contains("stack-mode")) setStack(false);
      if (!dialog.classList.contains("hidden")) closeDialog();
      if (!aboutDialog.classList.contains("hidden")) closeAbout();
      if (sidebar.classList.contains("open")) setDrawer(false);
      positionSelectedChar3();
      pickSnippet();
    } else {
      clearInterval(timer);
      timer = null;
    }
    castSlot3.classList.toggle("active", open);
    castSlot3.setAttribute("aria-expanded", String(open));
    sceneEl.classList.toggle("typing-mode", open);
    updateBodyLock();
    if (open) {
      typingInput.focus();
    } else if (document.contains(castSlot3)) {
      castSlot3.focus();
    }
  }

  // wrap previous wrappers to also close typing
  var _origSetProjects2 = setProjects;
  setProjects = function (open) {
    if (open && sceneEl.classList.contains("typing-mode")) setTyping(false);
    _origSetProjects2(open);
  };
  var _origSetStack = setStack;
  setStack = function (open) {
    if (open && sceneEl.classList.contains("typing-mode")) setTyping(false);
    _origSetStack(open);
  };

  castSlot3.addEventListener("click", function () {
    setTyping(!sceneEl.classList.contains("typing-mode"));
  });
  castSlot3.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      setTyping(!sceneEl.classList.contains("typing-mode"));
    }
  });

  typingInput.addEventListener("input", function () {
    startTimer();
    updateStats();
    if (typingInput.value.length >= currentSnippet.length) {
      clearInterval(timer);
      timer = null;
      typingInput.disabled = true;
    }
  });
  typingRestart.addEventListener("click", pickSnippet);

  window.addEventListener("resize", function () {
    if (sceneEl.classList.contains("typing-mode")) positionSelectedChar3();
  });

  sceneEl.addEventListener("click", function (ev) {
    if (!sceneEl.classList.contains("typing-mode")) return;
    if (typingGrid.contains(ev.target)) return;
    if (typingVeil.contains(ev.target)) { setTyping(false); return; }
    if (castSlot3.contains(ev.target)) return;
    // any other click outside grid/veil/character also closes (covers empty scene area)
    // keep open if clicking typing input area already handled
  });
  typingVeil.addEventListener("click", function () { setTyping(false); });
  projectsVeil.addEventListener("click", function () { setProjects(false); });
  stackVeil.addEventListener("click", function () { setStack(false); });

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
    if (!hireDialog.classList.contains("hidden")) { closeHire(); return; }
    if (!$("#aboutDialog").classList.contains("hidden")) { closeAbout(); return; }
    if (!dialog.classList.contains("hidden")) { closeDialog(); return; }
    if (sceneEl.classList.contains("typing-mode")) { setTyping(false); return; }
    if (sceneEl.classList.contains("stack-mode")) { setStack(false); return; }
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
    if (sceneEl.classList.contains("select-mode")) setProjects(false);
    if (sceneEl.classList.contains("stack-mode")) setStack(false);
    if (sceneEl.classList.contains("typing-mode")) setTyping(false);
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
    if (sceneEl.classList.contains("select-mode")) setProjects(false);
    else setProjects(true);
  });
  $("#stackLink").addEventListener("click", function (ev) {
    ev.preventDefault();
    if (sceneEl.classList.contains("stack-mode")) setStack(false);
    else setStack(true);
  });
  $("#typingLink").addEventListener("click", function (ev) {
    ev.preventDefault();
    if (sceneEl.classList.contains("typing-mode")) setTyping(false);
    else setTyping(true);
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

  /* ---------- hire form ---------- */
  var hireDialog = $("#hireDialog");
  var hireForm = $("#hireForm");
  var hireStatus = $("#hireStatus");
  var hireSend = hireForm.querySelector(".hire-send");

  function openHire() {
    if (!dialog.classList.contains("hidden")) closeDialog();
    if (!aboutDialog.classList.contains("hidden")) closeAbout();
    if (sceneEl.classList.contains("select-mode")) setProjects(false);
    if (sceneEl.classList.contains("stack-mode")) setStack(false);
    if (sceneEl.classList.contains("typing-mode")) setTyping(false);
    if (sidebar.classList.contains("open")) setDrawer(false);
    hireStatus.textContent = "";
    hireDialog.classList.remove("hidden");
    updateBodyLock();
    hireForm.querySelector("input[name='name']").focus();
  }

  function closeHire() {
    hireDialog.classList.add("hidden");
    updateBodyLock();
  }

  $("#hireBtn").addEventListener("click", openHire);
  $("#hireClose").addEventListener("click", closeHire);
  hireDialog.addEventListener("click", function (ev) {
    if (ev.target === hireDialog) closeHire();
  });
  hireForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    hireSend.disabled = true;
    hireStatus.textContent = "sending...";
    fetch("https://formsubmit.co/ajax/plazaroinuj5@gmail.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(hireForm)
    }).then(function (res) {
      if (!res.ok) throw new Error("send failed");
      hireStatus.textContent = "message sent!";
      hireForm.reset();
    }).catch(function () {
      hireStatus.textContent = "could not send. please try again.";
    }).finally(function () {
      hireSend.disabled = false;
    });
  });

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
