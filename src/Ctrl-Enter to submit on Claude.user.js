// ==UserScript==
// @name         Ctrl-Enter to submit on Claude
// @namespace    http://tampermonkey.net/
// @version      2026-10-15
// @description  try to take over the world!
// @author       You
// @match        https://claude.ai/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=claude.ai
// @grant        none
// ==/UserScript==

(() => {
    const SYNTHETIC = "__ctrlEnterSynthetic";

    function redispatch(target, shiftKey) {
        const ev = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            shiftKey,
            bubbles: true,
            cancelable: true,
        });
        ev[SYNTHETIC] = true;
        target.dispatchEvent(ev);
    }

    window.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e[SYNTHETIC] || e.isComposing) {
            return;
        }
        const target = e.target;
        if (!(target instanceof HTMLElement) || !target.isContentEditable) {
            return; // only touch the composer, not other inputs
        }
        if (e.shiftKey || e.altKey || e.metaKey) {
            return; // leave existing combos alone
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        // plain Enter -> newline (Shift+Enter); Ctrl+Enter -> send (Enter)
        redispatch(target, !e.ctrlKey);
    }, true);
})();