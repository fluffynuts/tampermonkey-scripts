// ==UserScript==
// @name         SumoLogic enhancements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://service.eu.sumologic.com/ui/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    function displayFieldNames() {
        Array.from(document.querySelectorAll("#search-query-fields [title]")).forEach(el => {
            const text = el.textContent.trim();
            if (!text.match(new RegExp(el.title))) {
                el.textContent = `${text} (${el.title})`;
                el.setAttribute("_visited", "true");
            }
        })
    }

    setInterval(() => {
        displayFieldNames();
    }, 2000);
})();