// ==UserScript==
// @name         Unhide vars
// @namespace    http://tampermonkey.net/
// @version      2024-07-22
// @description  try to take over the world!
// @author       You
// @match        https://nomad.yumbi.com/ui/variables/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yumbi.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function unhideVars() {
        const targets = Array.from(document.querySelectorAll("button.show-hide-values"));
        if (targets.length === 0) {
            return true; // re-poll
        }
        for (const btn of targets) {
            btn.click();
        }
        return false;
    }

    function tryUnhideVars() {
        if (unhideVars()) {
            window.setTimeout(tryUnhideVars, 250);
        }
    }

    tryUnhideVars();
})();