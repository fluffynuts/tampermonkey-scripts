// ==UserScript==
// @name         Input contrast fixer
// @version      0.1
// @description  Uses computed styles on inputs & textareas to determine if the site's inputs are readable
//               and adjusts them to be the bg/fg of the document body
// @author       davydm@gmail.com
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var MIN_DELTA = 5;
    var computedBody = window.getComputedStyle(document.body);
    var FALLBACK_BACKGROUND = computedBody.backgroundColor;
    var FALLBACK_FOREGROUND = computedBody.color;

    var fallbackBgValue = getColorValue(getRgbParts(FALLBACK_BACKGROUND));
    var fallbackFgValue = getColorValue(getRgbParts(FALLBACK_FOREGROUND));

    if (notEnoughContrast(fallbackBgValue, fallbackFgValue)) {
        console.log("falling back on system colors");
        FALLBACK_FOREGROUND = "WindowText";
        FALLBACK_BACKGROUND = "Window";
    }

    function notEnoughContrast(colorValue1, colorValue2) {
        var delta = calculateDelta(colorValue1, colorValue2);
        return delta < 5; // FIXME: this is a bit naive
    }

    function getRgbParts(color) {
        return color.replace(/rgb\(/, "")
            .replace(/\)/, "")
            .split(",");
    }

    function getColorValue(colorParts) {
        var asNumbers = colorParts.map(i => parseInt(i));
        return asNumbers[0] * 1000000 +
               asNumbers[1] * 1000 +
               asNumbers[2];
    }

    function getComputedColor(el, prop) {
        var computed = window.getComputedStyle(el);
        var computedColor = computed[prop];
        var parts = getRgbParts(computedColor);
        return getColorValue(parts);
    }

    function calculateDelta(c1, c2) {
        return c1 > c2 ? c1 / c2 : c2 / c1;
    }

    document.querySelectorAll("input, textarea").forEach(el => {
        if (el.type === "hidden") {
            // no need to do this
            return;
        }

        var bgValue = getComputedColor(el, "backgroundColor");
        var fgValue = getComputedColor(el, "color");

        if (notEnoughContrast(bgValue, fgValue)) {
            el.style.color = FALLBACK_FOREGROUND;
            el.style.backgroundColor = FALLBACK_BACKGROUND;
        }
    });
})();