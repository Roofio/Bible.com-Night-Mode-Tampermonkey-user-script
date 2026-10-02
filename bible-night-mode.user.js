// ==UserScript==
// @name         Bible.com Night Reading
// @namespace    https://www.bible.com/
// @version      1.0.0
// @description  Night mode for the YouVersion Bible reader
// @match        https://www.bible.com/*
// @match        https://bible.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "yv-night-reading";
  const STYLE_ID = "yv-night-style";
  const TOGGLE_ID = "yv-night-toggle";

  const CSS = `
    html.yv-night {
      color-scheme: dark;
      background-color: #141210 !important;
    }

    html.yv-night body,
    html.yv-night [class*="bg-canvas-light"],
    html.yv-night [class*="bg-canvas-secondary"],
    html.yv-night [class*="bg-surface-primary-light"] {
      background-color: #141210 !important;
    }

    html.yv-night [class*="__yv-bible-text"],
    html.yv-night [class*="__reader"],
    html.yv-night [class*="__reader"] [class*="__content"] {
      color: #e7e0d4 !important;
    }

    html.yv-night [class*="__reader"] h1,
    html.yv-night [class*="__heading"] {
      color: #f3efe6 !important;
    }

    html.yv-night [class*="__verse"] > [class*="__label"],
    html.yv-night [class*="__chapter"] > [class*="__label"] {
      color: #9a9186 !important;
    }

    html.yv-night [class*="__reader"] .ref,
    html.yv-night [class*="__note"],
    html.yv-night a[aria-label="Next Chapter"],
    html.yv-night a[aria-label="Previous Chapter"] {
      color: #d4b483 !important;
    }

    html.yv-night .cc-banner {
      background-color: #1c1a18 !important;
      color: #e7e0d4 !important;
    }

    html.yv-night .cc-banner a,
    html.yv-night .cc-banner button {
      color: #d4b483 !important;
    }

    html.yv-night [class*="aspect-video"] {
      background-color: #2a2622 !important;
    }

    #${TOGGLE_ID} {
      position: fixed;
      left: 50%;
      bottom: 88px;
      transform: translateX(-50%);
      z-index: 2147483646;
      margin: 0;
      padding: 8px 12px;
      border: 1px solid rgba(231, 224, 212, 0.28);
      border-radius: 999px;
      background: #1c1a18;
      color: #e7e0d4;
      font: 600 13px/1 system-ui, sans-serif;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }

    #${TOGGLE_ID}:hover {
      background: #2a2622;
    }

    #${TOGGLE_ID}[aria-pressed="false"] {
      background: #f4f1ea;
      color: #1c1a18;
      border-color: rgba(28, 26, 24, 0.2);
    }

    @media (min-width: 1024px) {
      #${TOGGLE_ID} {
        left: calc(var(--rail-w, 220px) + 16px);
        bottom: 16px;
        transform: none;
      }
    }
  `;

  let memory = null;

  function enabled() {
    if (memory !== null) return memory;
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      memory = value === null ? true : value === "1";
    } catch (error) {
      memory = true;
    }
    return memory;
  }

  function setEnabled(on) {
    memory = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch (error) {
      /* private mode can block storage; this page still toggles */
    }
  }

  function applyTheme() {
    const on = enabled();
    const root = document.documentElement;
    root.classList.toggle("dark", on);
    root.classList.toggle("yv-night", on);

    const button = document.getElementById(TOGGLE_ID);
    if (button) {
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.textContent = on ? "Night" : "Day";
    }
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function mountToggle() {
    if (!document.body || document.getElementById(TOGGLE_ID)) return;

    const button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.type = "button";
    button.addEventListener("click", function () {
      setEnabled(!enabled());
      applyTheme();
    });
    document.body.appendChild(button);
    applyTheme();
  }

  injectStyle();
  applyTheme();

  const classObserver = new MutationObserver(function () {
    if (!enabled()) return;
    const root = document.documentElement;
    if (!root.classList.contains("dark") || !root.classList.contains("yv-night")) {
      root.classList.add("dark", "yv-night");
    }
  });
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const bodyObserver = new MutationObserver(function () {
    mountToggle();
  });
  bodyObserver.observe(document.documentElement, { childList: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle);
  } else {
    mountToggle();
  }
})();
