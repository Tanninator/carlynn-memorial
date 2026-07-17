// Lightweight, build-free i18n for the memorial site.
//
// Model: English is the source of truth, written directly in the HTML. Any
// element that has translations carries them inline as attributes:
//
//   <h2 data-i18n-fr="Une petite vie" data-i18n-zh="短暂的一生">A little life</h2>
//
// On load we cache each element's original (English) innerHTML, then swap in the
// requested language's attribute value. `en` restores the cached original.
//
// This script also self-injects a fixed language dropdown pinned to the bottom
// -right of the viewport and its styles, so pages only need to (1) include this script and (2) tag their
// translatable elements. It dispatches `i18n:changed` on `document` so custom
// elements (e.g. <rsvp-form>) can re-render their own labels.
//
// Language resolution on first visit: saved choice → browser language → English.
(function () {
  var STORAGE_KEY = "carlynn-memorial::lang";
  var SUPPORTED = ["en", "zh", "fr"];
  var NAMES = { en: "English", zh: "简体中文", fr: "Français" };
  var SHORT = { en: "EN", zh: "中", fr: "FR" };
  var HTML_LANG = { en: "en", zh: "zh-Hans", fr: "fr" };

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || "en"];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i] || "").toLowerCase();
      if (l.indexOf("zh") === 0) return "zh";
      if (l.indexOf("fr") === 0) return "fr";
      if (l.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  var current = detect();
  var cache = null; // [{ el, en }] — filled once the DOM is ready

  function collect() {
    cache = [];
    var els = document.querySelectorAll("[data-i18n-fr],[data-i18n-zh]");
    for (var i = 0; i < els.length; i++) {
      cache.push({ el: els[i], en: els[i].innerHTML });
    }
  }

  function applyContent(lang) {
    if (!cache) return;
    for (var i = 0; i < cache.length; i++) {
      var item = cache[i];
      var val = item.en;
      if (lang !== "en") {
        var t = item.el.getAttribute("data-i18n-" + lang);
        if (t !== null) val = t;
      }
      if (item.el.innerHTML !== val) item.el.innerHTML = val;
    }
  }

  function apply(lang) {
    current = lang;
    document.documentElement.setAttribute("lang", HTML_LANG[lang] || lang);
    applyContent(lang);
    syncSwitch();
    document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: lang } }));
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0 || lang === current) {
      if (lang === current) closeSwitch();
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply(lang);
    closeSwitch();
  }

  // Expose synchronously (before DOMContentLoaded) so custom elements that
  // connect during parsing can read the active language at first render.
  window.I18N = {
    get lang() { return current; },
    supported: SUPPORTED.slice(),
    setLang: setLang,
  };

  // ---- Language dropdown (self-injected) --------------------------------

  var switchEl = null;

  var STYLE = [
    ".lang-switch{position:fixed;right:24px;bottom:24px;z-index:300;font-family:'Inter',system-ui,sans-serif;}",
    ".lang-btn{display:inline-flex;align-items:center;gap:7px;background:var(--navy,#0f1d31);",
    "border:1px solid var(--brass,#c89968);color:var(--ivory-soft,#d8cdb4);cursor:pointer;",
    "padding:10px 14px;font:inherit;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;",
    "box-shadow:0 10px 30px rgba(0,0,0,0.45);",
    "transition:color .2s ease,border-color .2s ease,transform .2s ease;}",
    ".lang-btn:hover{color:var(--brass-light,#e2c089);border-color:var(--brass-light,#e2c089);transform:translateY(-1px);}",
    ".lang-btn .globe{width:14px;height:14px;display:block;flex:0 0 auto;}",
    ".lang-btn .caret{width:8px;height:8px;display:block;flex:0 0 auto;transition:transform .2s ease;}",
    ".lang-switch.open .lang-btn .caret{transform:rotate(180deg);}",
    ".lang-menu{position:absolute;bottom:calc(100% + 8px);right:0;min-width:158px;margin:0;padding:6px 0;",
    "list-style:none;background:var(--navy,#0f1d31);border:1px solid var(--navy-line,#1f3251);",
    "box-shadow:0 24px 60px rgba(0,0,0,0.55);z-index:200;display:none;}",
    ".lang-switch.open .lang-menu{display:block;}",
    ".lang-menu li{padding:11px 20px;font-size:12px;letter-spacing:0.12em;color:var(--ivory-soft,#d8cdb4);",
    "cursor:pointer;white-space:nowrap;transition:background .15s ease,color .15s ease;}",
    ".lang-menu li:hover{background:rgba(200,153,104,0.10);color:var(--brass-light,#e2c089);}",
    ".lang-menu li[aria-selected='true']{color:var(--brass-light,#e2c089);}",
    ".lang-menu li[aria-selected='true']::after{content:'\\2713';margin-left:10px;color:var(--brass,#c89968);}",
    "@media (max-width:760px){.lang-switch{right:16px;bottom:16px;}.lang-btn{padding:9px 12px;}}",
  ].join("");

  var GLOBE = '<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z"/></svg>';
  var CARET = '<svg class="caret" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M1 3l4 4 4-4z"/></svg>';

  function buildSwitch() {
    if (document.querySelector(".lang-switch")) return;

    var style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    switchEl = document.createElement("div");
    switchEl.className = "lang-switch";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Choose language");
    btn.innerHTML = GLOBE + '<span class="lang-cur"></span>' + CARET;

    var menu = document.createElement("ul");
    menu.className = "lang-menu";
    menu.setAttribute("role", "listbox");
    SUPPORTED.forEach(function (lang) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("data-lang", lang);
      li.textContent = NAMES[lang];
      li.addEventListener("click", function () { setLang(lang); });
      menu.appendChild(li);
    });

    switchEl.appendChild(btn);
    switchEl.appendChild(menu);

    document.body.appendChild(switchEl);

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      switchEl.classList.toggle("open");
      btn.setAttribute("aria-expanded", switchEl.classList.contains("open") ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (switchEl && !switchEl.contains(e.target)) closeSwitch();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSwitch();
    });
  }

  function syncSwitch() {
    if (!switchEl) return;
    var cur = switchEl.querySelector(".lang-cur");
    if (cur) cur.textContent = SHORT[current] || current.toUpperCase();
    switchEl.querySelectorAll(".lang-menu li").forEach(function (li) {
      li.setAttribute("aria-selected", li.getAttribute("data-lang") === current ? "true" : "false");
    });
  }

  function closeSwitch() {
    if (!switchEl) return;
    switchEl.classList.remove("open");
    var btn = switchEl.querySelector(".lang-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function init() {
    collect();
    buildSwitch();
    apply(current);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
