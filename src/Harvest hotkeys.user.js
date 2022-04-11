// ==UserScript==
// @name         Harvest hotkeys
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://codeoza.harvestapp.com/*
// @icon         https://www.google.com/s2/favicons?domain=harvestapp.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    window.addEventListener("keyup", ev => {
        if (!ev.altKey || !ev.key == "a") {
            return;
        }
        const button = document.querySelector("button.button-new-time-entry");
        if (!button) {
            return;
        }
        button.click();
    });
})();