/* ============================================================
   HAZARA TIMES — interactivity
   Theme (dark/light), language (EN/FA + RTL), hero slider,
   bookmarks, scroll reveal, reading progress, lightbox, search,
   and a front-end account (register/login) demo.
   State persists in-memory only (no browser storage used).
   ============================================================ */
(function () {
  "use strict";

  var I18N = {
    en: {
      tagline: "History • Culture • Identity • Heritage",
      nav_home: "Home", nav_history: "History", nav_culture: "Culture",
      nav_arts: "Arts & Literature", nav_music: "Music", nav_bamyan: "Bamyan",
      nav_food: "Food", nav_community: "Community", dir: "ltr"
    },
    fa: {
      tagline: "تاریخ • فرهنگ • هویت • میراث",
      nav_home: "خانه", nav_history: "تاریخ", nav_culture: "فرهنگ",
      nav_arts: "هنر و ادبیات", nav_music: "موسیقی", nav_bamyan: "بامیان",
      nav_food: "غذا", nav_community: "جامعه", dir: "rtl"
    }
  };

  /* Preference storage — persists language & theme across page
     navigation. Falls back silently if storage is unavailable. */
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  window.toast = toast;

  function setTheme(mode, announce) {
    document.documentElement.setAttribute("data-theme", mode);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) { el.textContent = mode === "dark" ? "☀" : "☾"; });
    store("ht_theme", mode);
    if (announce) toast(mode === "dark" ? "Dark mode on" : "Light mode on");
  }
  window.toggleTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(cur === "dark" ? "light" : "dark", true);
  };

  function applyLang(lang, announce) {
    lang = (lang === "fa") ? "fa" : "en";
    var d = I18N[lang];
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", d.dir);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); if (d[k]) el.textContent = d[k];
    });
    /* Per-element translations: each element carries its own Dari text in
       data-fa. The English original is captured once into data-en. */
    document.querySelectorAll("[data-fa]").forEach(function (el) {
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
      el.textContent = (lang === "fa") ? el.getAttribute("data-fa") : el.getAttribute("data-en");
    });
    document.querySelectorAll("[data-fa-ph]").forEach(function (el) {
      if (!el.hasAttribute("data-en-ph")) el.setAttribute("data-en-ph", el.getAttribute("placeholder") || "");
      el.setAttribute("placeholder", (lang === "fa") ? el.getAttribute("data-fa-ph") : el.getAttribute("data-en-ph"));
    });
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
    store("ht_lang", lang);
    if (announce) toast(lang === "fa" ? "زبان: فارسی / دری" : "Language: English");
  }
  window.setLang = function (lang) { applyLang(lang, true); };

  function initSlider() {
    var slider = document.querySelector(".slider");
    if (!slider) return;
    var slides = slider.querySelectorAll(".slide");
    var dotsWrap = slider.querySelector(".slider-dots");
    var i = 0, timer;
    slides.forEach(function (_, idx) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (idx + 1));
      b.addEventListener("click", function () { go(idx); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function go(n) {
      slides[i].classList.remove("active"); dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active"); dots[i].classList.add("active");
    }
    function next() { go(i + 1); }
    function prev() { go(i - 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 6000); }
    var nb = slider.querySelector(".slider-arrow.next"), pb = slider.querySelector(".slider-arrow.prev");
    if (nb) nb.addEventListener("click", function () { next(); reset(); });
    if (pb) pb.addEventListener("click", function () { prev(); reset(); });
    go(0); reset();
  }

  var bookmarks = {};
  window.toggleBookmark = function (btn, title) {
    var id = title || btn.getAttribute("data-title") || "article";
    if (bookmarks[id]) { delete bookmarks[id]; btn.classList.remove("saved"); toast("Removed from bookmarks"); }
    else { bookmarks[id] = true; btn.classList.add("saved"); toast("Saved to bookmarks"); }
  };

  window.shareArticle = function (kind) { toast(kind ? "Sharing via " + kind + "…" : "Link copied to clipboard"); };

  window.subscribe = function (e) {
    e.preventDefault();
    var inp = e.target.querySelector("input");
    if (inp && inp.value) { toast("Thank you for subscribing!"); inp.value = ""; }
    return false;
  };

  window.postComment = function (e) {
    e.preventDefault();
    var ta = e.target.querySelector("textarea");
    if (ta && ta.value.trim()) {
      var list = document.getElementById("comment-list");
      var c = document.createElement("div");
      c.className = "comment";
      c.innerHTML = '<div class="ava" style="background:var(--turquoise)">You</div><div>' +
        '<div><span class="name">You</span><span class="time">just now</span></div><p></p></div>';
      c.querySelector("p").textContent = ta.value;
      list.insertBefore(c, list.firstChild); ta.value = ""; toast("Comment posted");
    }
    return false;
  };

  window.filterCards = function (cat, btn) {
    document.querySelectorAll(".filters button").forEach(function (b) { b.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    document.querySelectorAll("[data-cat]").forEach(function (c) {
      c.style.display = (cat === "all" || c.getAttribute("data-cat") === cat) ? "" : "none";
    });
  };
  window.searchCards = function (q) {
    q = q.toLowerCase();
    document.querySelectorAll("[data-cat]").forEach(function (c) {
      c.style.display = c.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
    });
  };

  window.openLightbox = function (src) {
    var lb = document.getElementById("lightbox"); if (!lb) return;
    lb.querySelector("img").src = src; lb.classList.add("open");
  };
  window.closeLightbox = function () { var lb = document.getElementById("lightbox"); if (lb) lb.classList.remove("open"); };

  window.toggleDrawer = function () { var d = document.getElementById("drawer"); if (d) d.classList.toggle("open"); };

  function initProgress() {
    var bar = document.querySelector(".reading-progress");
    if (!bar) return;
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
    }, { passive: true });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ===== Accounts / Auth (FRONT-END DEMO ONLY) =====
     No real authentication; no password stored or sent.
     Replace the BACKEND HOOK blocks with real API calls. */
  var currentUser = null;

  function gIcon(letter, color) {
    return '<span style="width:18px;height:18px;border-radius:50%;display:inline-grid;' +
      'place-items:center;background:' + color + ';color:#fff;font-weight:800;font-size:12px">' + letter + '</span>';
  }

  function fieldHTML(id, label, name, type, ph, ac, extra) {
    return '<div class="field" id="' + id + '"><label>' + label + '</label>' +
      '<input name="' + name + '" type="' + type + '" placeholder="' + ph + '" autocomplete="' + ac + '">' +
      (extra || '') + '<div class="err">Please check this field.</div></div>';
  }

  function buildAuthHTML() {
    var aside =
      '<div class="auth-aside">' +
        '<div class="a-brand"><span class="mark">H</span> Hazara Times</div>' +
        '<div class="a-copy">' +
          '<h3>Join a community preserving Hazara heritage</h3>' +
          '<p>Create a free account to bookmark stories, join the conversation and get the Weekly Dispatch.</p>' +
          '<div class="a-list">' +
            '<div><span class="tick">+</span> Bookmark and save articles</div>' +
            '<div><span class="tick">+</span> Comment and join discussions</div>' +
            '<div><span class="tick">+</span> Personalised recommendations</div>' +
            '<div><span class="tick">+</span> Free — and always ad-light</div>' +
          '</div>' +
        '</div>' +
        '<div style="position:relative;font-size:13px;color:#cfd8e0">History • Culture • Identity • Heritage</div>' +
      '</div>';

    var reg =
      '<form class="auth-form active" id="formRegister" novalidate>' +
        '<h2>Create your account</h2><div class="sub">It takes less than a minute.</div>' +
        fieldHTML('f-name', 'Full name', 'name', 'text', 'Your name', 'name') +
        fieldHTML('f-email', 'Email', 'email', 'email', 'you@email.com', 'email') +
        fieldHTML('f-pw', 'Password', 'password', 'password', 'At least 8 characters', 'new-password',
          '<div class="pw-meter"><span id="pwBar"></span></div>') +
        '<div class="auth-row"><label><input type="checkbox" id="agree"> I agree to the Terms &amp; Privacy Policy</label></div>' +
        '<button class="btn btn-block" type="submit">Create account</button>' +
        '<div class="auth-divider">or continue with</div>' +
        '<div class="social-row">' +
          '<button type="button" class="social-btn" data-social="Google">' + gIcon('G', '#4285F4') + ' Google</button>' +
          '<button type="button" class="social-btn" data-social="Facebook">' + gIcon('f', '#1877F2') + ' Facebook</button>' +
        '</div>' +
        '<div class="auth-foot">Already a member? <a href="#" data-goto="login">Sign in</a></div>' +
      '</form>';

    var log =
      '<form class="auth-form" id="formLogin" novalidate>' +
        '<h2>Welcome back</h2><div class="sub">Sign in to continue.</div>' +
        fieldHTML('l-email', 'Email', 'email', 'email', 'you@email.com', 'email') +
        fieldHTML('l-pw', 'Password', 'password', 'password', 'Your password', 'current-password') +
        '<div class="auth-row"><label><input type="checkbox"> Remember me</label>' +
          '<a href="#" data-forgot="1">Forgot password?</a></div>' +
        '<button class="btn btn-block" type="submit">Sign in</button>' +
        '<div class="auth-foot">New here? <a href="#" data-goto="register">Create an account</a></div>' +
      '</form>';

    var main =
      '<div class="auth-main">' +
        '<button class="auth-close" aria-label="Close" data-close="1">×</button>' +
        '<div class="auth-tabs">' +
          '<button id="tabReg" class="active" data-goto="register">Create account</button>' +
          '<button id="tabLog" data-goto="login">Sign in</button>' +
        '</div>' + reg + log +
      '</div>';

    var overlay = document.createElement("div");
    overlay.className = "auth-overlay"; overlay.id = "authOverlay";
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Account");
    overlay.innerHTML = '<div class="auth-modal">' + aside + main + '</div>';
    return overlay;
  }

  function injectAuth() {
    if (!document.getElementById("authOverlay")) {
      var overlay = buildAuthHTML();
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closeAuth(); });
      overlay.addEventListener("click", function (e) {
        var t = e.target.closest("[data-goto],[data-close],[data-social],[data-forgot]");
        if (!t) return;
        e.preventDefault();
        if (t.hasAttribute("data-close")) closeAuth();
        else if (t.hasAttribute("data-goto")) authTab(t.getAttribute("data-goto"));
        else if (t.hasAttribute("data-social")) socialAuth(t.getAttribute("data-social"));
        else if (t.hasAttribute("data-forgot")) toast("Password reset is a demo here");
      });
      document.getElementById("formRegister").addEventListener("submit", doRegister);
      document.getElementById("formLogin").addEventListener("submit", doLogin);
      var pw = document.querySelector("#f-pw input");
      if (pw) pw.addEventListener("input", function () { pwStrength(this.value); });
    }

    var tools = document.querySelector(".header-tools");
    if (tools && !document.getElementById("acctWrap")) {
      var wrap = document.createElement("div");
      wrap.className = "acct-wrap"; wrap.id = "acctWrap";
      var btn = document.createElement("button");
      btn.className = "account-btn"; btn.id = "acctBtn";
      btn.addEventListener("click", acctClick);
      var menu = document.createElement("div");
      menu.className = "account-menu"; menu.id = "acctMenu";
      wrap.appendChild(btn); wrap.appendChild(menu);
      var mt = tools.querySelector(".menu-toggle");
      if (mt) tools.insertBefore(wrap, mt); else tools.appendChild(wrap);
    }

    document.addEventListener("click", function (e) {
      var m = document.getElementById("acctMenu"), w = document.getElementById("acctWrap");
      if (m && w && !w.contains(e.target)) m.classList.remove("open");
    });
  }

  function openAuth(tab) { document.getElementById("authOverlay").classList.add("open"); authTab(tab || "register"); }
  function closeAuth() { var o = document.getElementById("authOverlay"); if (o) o.classList.remove("open"); }
  function authTab(which) {
    var reg = which === "register";
    document.getElementById("formRegister").classList.toggle("active", reg);
    document.getElementById("formLogin").classList.toggle("active", !reg);
    document.getElementById("tabReg").classList.toggle("active", reg);
    document.getElementById("tabLog").classList.toggle("active", !reg);
  }
  window.openAuth = openAuth; window.closeAuth = closeAuth;

  function setInvalid(id, bad) { var el = document.getElementById(id); if (el) el.classList.toggle("invalid", bad); return !bad; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function pwStrength(v) {
    var s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    var bar = document.getElementById("pwBar"); if (!bar) return;
    var colors = ["#d6453d", "#e0913b", "#c79a3b", "#1ba39c", "#0f7d77"];
    bar.style.width = [10, 35, 60, 85, 100][s] + "%"; bar.style.background = colors[s];
  }

  function doRegister(e) {
    e.preventDefault();
    var f = e.target, name = f.name.value.trim(), email = f.email.value.trim(), pw = f.password.value, ok = true;
    ok = setInvalid("f-name", !name) && ok;
    ok = setInvalid("f-email", !validEmail(email)) && ok;
    ok = setInvalid("f-pw", pw.length < 8) && ok;
    if (!document.getElementById("agree").checked) { toast("Please accept the Terms to continue"); ok = false; }
    if (!ok) return false;
    /* BACKEND HOOK: POST {name,email,password} to /api/register */
    currentUser = { name: name, email: email };
    closeAuth(); renderAccount(); toast("Welcome, " + name.split(" ")[0] + "! Account created.");
    return false;
  }

  function doLogin(e) {
    e.preventDefault();
    var f = e.target, email = f.email.value.trim(), pw = f.password.value, ok = true;
    ok = setInvalid("l-email", !validEmail(email)) && ok;
    ok = setInvalid("l-pw", !pw) && ok;
    if (!ok) return false;
    /* BACKEND HOOK: POST {email,password} to /api/login */
    currentUser = { name: email.split("@")[0], email: email };
    closeAuth(); renderAccount(); toast("Signed in successfully");
    return false;
  }

  function socialAuth(p) { toast("Continue with " + p + " (demo)"); }
  function acctClick() { if (currentUser) document.getElementById("acctMenu").classList.toggle("open"); else openAuth("register"); }
  function logout() { currentUser = null; document.getElementById("acctMenu").classList.remove("open"); renderAccount(); toast("Signed out"); }
  window.logout = logout;

  var USER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>';

  function renderAccount() {
    var btn = document.getElementById("acctBtn"), menu = document.getElementById("acctMenu");
    if (!btn) return;
    if (currentUser) {
      var ini = currentUser.name.trim().split(/\s+/).map(function (s) { return s[0]; }).join("").slice(0, 2).toUpperCase();
      btn.classList.add("signed-in");
      btn.innerHTML = '<span class="av-mini">' + ini + '</span><span class="lbl">' + currentUser.name.split(" ")[0] + '</span>';
      menu.innerHTML =
        '<div class="am-head"><div class="n">' + currentUser.name + '</div><div class="e">' + currentUser.email + '</div></div>' +
        '<a href="#" data-act="My profile">My profile</a>' +
        '<a href="#" data-act="Saved articles">Saved articles</a>' +
        '<a href="#" data-act="Settings">Settings</a>' +
        '<button class="am-item" data-act="logout">Sign out</button>';
      menu.querySelectorAll("[data-act]").forEach(function (el) {
        el.addEventListener("click", function (ev) {
          ev.preventDefault();
          var a = el.getAttribute("data-act");
          if (a === "logout") logout(); else toast(a + " (demo)");
        });
      });
    } else {
      btn.classList.remove("signed-in");
      btn.innerHTML = USER_ICON + '<span class="lbl">Sign in</span>';
      if (menu) { menu.classList.remove("open"); menu.innerHTML = ""; }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTheme(read("ht_theme") === "dark" ? "dark" : "light", false);
    applyLang(read("ht_lang") || "en", false);
    injectAuth(); renderAccount();
    var d = document.getElementById("today");
    if (d) d.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    initSlider(); initProgress(); initReveal();
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeLightbox(); closeAuth(); } });
  });
})();
