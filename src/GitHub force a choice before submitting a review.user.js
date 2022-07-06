// ==UserScript==
// @name         GitHub force a choice before submitting a review
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  prevents you from accidentally submitting only a comment review when you intended to approve / request
// @author       You
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function forceSelectingAnOption() {
        if (!isOnFilesPage()) {
            return;
        }

        const options = Array.from(
            document.querySelectorAll("[name='pull_request_review[event]']")
        );
        if (options.length == 0) {
            return false;
        }
        const button = Array.from(
            document.querySelectorAll("button")
        ).filter(el => el.innerText.trim().toLowerCase() == "submit review")[0];
        if (!button) {
            return false;
        }
        button.setAttribute("disabled", "disabled");
        options.forEach(opt => {
            opt.checked = false;
            opt.addEventListener("change", () => button.removeAttribute("disabled"));
        });
        return true;
    }

    function tryForcing() {
        if (!forceSelectingAnOption()) {
            window.setTimeout(tryForcing, 500);
        }
    }

    function isOnFilesPage() {
        return window.location.hash === "#submit-review" ||
            window.location.toString().match(/\/files$/);
    }

    let
      currentHash = window.location.hash,
      lastHash = undefined;
    window.setInterval(() => {
        currentHash = window.location.hash;
        if (currentHash !== lastHash) {
            tryForcing();
        }
        lastHash = currentHash;
    }, 1000);
})();