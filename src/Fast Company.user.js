// ==UserScript==
// @name         Better Fast Company
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.fastcompany.com/*
// @icon         https://www.google.com/s2/favicons?domain=fastcompany.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function removeIfFound(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.remove();
        }
    }

    function unfuck() {
        removeIfFound(".tp-modal");
        removeIfFound(".tp-backdrop");
        document.body.classList.remove("tp-modal-open");
    }

    window.setInterval(unfuck, 1000);

})();