// ==UserScript==
// @name         Twitter auto-translate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://twitter.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    console.log("twitter auto-translate is active");
    const observer = new MutationObserver(function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            const added = Array.from(mutation.addedNodes);
            const addedText = added.map(el => el.textContent).join("");
            if (addedText.indexOf("Translate") > -1) {
                added.forEach(el => {
                    clickTranslate(el);
                });
            }
        }
    });
    observer.observe(document.querySelector("body"), {
        childList: true,
        subtree: true
    });

    function clickTranslate(parentNode) {
        const buttonLikes = Array.from((parentNode || document).querySelectorAll("div[role='button']"));
        buttonLikes.forEach(btn => {
            const text = (btn.textContent || "").trim().toLowerCase();
            if (text === "translate tweet") {
                btn.click();
            }
        });
    }

})();