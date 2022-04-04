// ==UserScript==
// @name         Twitter DMs popup gtfo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  hides the DM popup on Twitter
// @author       You
// @match        https://twitter.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hideDms() {
        const elements = Array.from(document.querySelectorAll("[data-testid='DMDrawer']"));
        if (elements.length === 0) {
            return false;
        }
        elements.forEach(el => {
            el.style.display = "none";
        });
        return true;
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
        if (hideDms() || Date.now() - start > 60000) {
            window.clearInterval(interval);
        }
    }, 500);
})();