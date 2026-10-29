// ==UserScript==
// @name         Notion: visible link colours
// @namespace    https://codeo.co.za/
// @version      1.0.0
// @description  Unvisited links blue, visited links red, inside Notion page content
// @match        https://app.notion.com/*
// @match        https://www.notion.so/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const css = `
        /* Light theme */
        .notion-page-content a[href],
        .notion-page-content a[href] * {
            color: #1a5fd6 !important;
            border-bottom-color: currentColor !important;
            text-decoration-color: currentColor !important;
        }
        .notion-page-content a[href]:visited,
        .notion-page-content a[href]:visited * {
            color: #c62828 !important;
            border-bottom-color: #c62828 !important;
            text-decoration-color: #c62828 !important;
        }

        /* Dark theme: lighter shades for contrast */
        .notion-dark-theme .notion-page-content a[href],
        .notion-dark-theme .notion-page-content a[href] * {
            color: #6ea8ff !important;
        }
        .notion-dark-theme .notion-page-content a[href]:visited,
        .notion-dark-theme .notion-page-content a[href]:visited * {
            color: #ff7070 !important;
            border-bottom-color: #ff7070 !important;
            text-decoration-color: #ff7070 !important;
        }
    `;

    const style = document.createElement("style");
    style.id = "notion-visible-link-colours";
    style.textContent = css;

    // At document-start <head> may not exist yet; documentElement always does,
    // and Notion's SPA navigation never replaces it, so this survives page changes.
    (document.head || document.documentElement).appendChild(style);
})();
