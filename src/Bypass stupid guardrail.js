// ==UserScript==
// @name         Bypass stupid guardrail
// @namespace    http://tampermonkey.net/
// @version      2026-10-15
// @description  try to take over the world!
// @author       You
// @match        https://deployments.yumbi.com/projects/*/deployments/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yumbi.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const PHRASE_SELECTOR = "[data-new-deployment-target=\"confirmPhrase\"]";
    const INPUT_SELECTOR = "[data-new-deployment-target=\"confirmInput\"]";
    const BUTTON_SELECTOR = "[data-new-deployment-target=\"confirmButton\"]";

    /**
     * @param {HTMLElement} el
     * @returns {boolean}
     */
    function isVisible(el) {
        return el.getClientRects().length > 0;
    }

    /** @returns {void} */
    function tryFill() {
        const phraseEl = document.querySelector(PHRASE_SELECTOR);
        const input = document.querySelector(INPUT_SELECTOR);
        if (!(phraseEl instanceof HTMLElement) || !(input instanceof HTMLInputElement)) {
            return;
        }
        if (!isVisible(input)) {
            return;
        }

        const phrase = (phraseEl.textContent ?? "").trim();
        if (phrase === "" || input.value === phrase) {
            return;
        }

        input.value = phrase;
        // Stimulus listens via data-action="input->new-deployment#checkProductionConfirmation",
        // so a bubbling "input" event is what enables the button.
        input.dispatchEvent(new Event("input", { bubbles: true }));

        // Focus (don't click) the deploy button, so Enter / Space is the one deliberate action left.
        const button = document.querySelector(BUTTON_SELECTOR);
        if (button instanceof HTMLButtonElement) {
            requestAnimationFrame(() => button.focus());
        }
    }

    let scheduled = false;

    /** @returns {void} */
    function scheduleFill() {
        if (scheduled) {
            return;
        }
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            tryFill();
        });
    }

    const observer = new MutationObserver((/** @type {MutationRecord[]} */ _mutations) => scheduleFill());
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["open", "class", "style", "hidden"]
    });

    scheduleFill();
})();