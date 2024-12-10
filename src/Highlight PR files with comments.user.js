// ==UserScript==
// @name         Highlight PR files with comments
// @namespace    http://tampermonkey.net/
// @version      2024-02-29
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*/pull/*/files*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var style = `
    .file:has(.timeline-comment-group) {
       border: 1px solid red;
    }
    `;


    console.log("----- the magic will begin -----");
    var tag = document.createElement("style");
    tag.innerText = style;
    var head = document.querySelector("head");
    head.appendChild(tag);
    console.log("----- the magic is out there -----");
})();