// ==UserScript==
// @name         Input contrast fixer
// @version      0.1
// @description  Uses computed styles on inputs & textareas to determine if the site's inputs are readable
//               and adjusts them to be black-on-white (configurable via FALLBACK_FOREGROUND and FALLBACK_BACKGROUND)
// @author       davydm@gmail.com
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var FALLBACK_FOREGROUND = "black";
    var FALLBACK_BACKGROUND = "white";

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

    document.querySelectorAll("input, textarea").forEach(el => {
        if (el.type === "hidden") {
            // no need to do this
            return;
        }
        var computed = window.getComputedStyle(el);
        var computedBackground = computed.backgroundColor;
        var computedForeground = computed.color;

        var bgParts = getRgbParts(computedBackground);
        var fgParts = getRgbParts(computedForeground);

        var bgValue = getColorValue(bgParts);
        var fgValue = getColorValue(fgParts);

        var delta = fgValue < bgValue
             ? bgValue / fgValue
             : fgValue / bgValue;
        if (delta < 1.5) {
            el.style.color = FALLBACK_FOREGROUND;
            el.style.backgroundColor = FALLBACK_BACKGROUND;
        }
    });
})();