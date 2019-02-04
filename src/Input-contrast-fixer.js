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
        if (colorValue1 === null || colorValue2 === null) {
            return true; // couldn't get colors, let's try to do the best we can
        }
        var delta = calculateDelta(colorValue1, colorValue2);
        return delta < 5; // FIXME: this is a bit naive
    }

    function getRgbParts(color) {
        if (color.indexOf("rgba") > -1) {
            return color.replace(/rgba\(/, "")
                .replace(/\)/, "")
                .split(",")
        } else {
            return color.replace(/rgb\(/, "")
                .replace(/\)/, "")
                .split(",");
        }
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
        if (parts.length === 4) {
            if (parts[3].replace(/\s/, "") === "0") {
                console.log("transparent...", el);
                if (!el.parentElement) {
                    return null; // somewhere else, deal with it
                }
                return getComputedColor(el.parentElement, prop);
            }
        }
        return getColorValue(parts);
    }

    function calculateDelta(c1, c2) {
        return c1 > c2 ? c1 / c2 : c2 / c1;
    }

    function fixElement(el) {
        if (el.type === "hidden") {
            // no need to do this
            return;
        }

        var bgValue = getComputedColor(el, "backgroundColor");
        var fgValue = getComputedColor(el, "color");
        console.log({
            el,
            bgValue,
            fgValue
        });
        if (notEnoughContrast(bgValue, fgValue)) {
            el.style.color = FALLBACK_FOREGROUND;
            el.style.backgroundColor = FALLBACK_BACKGROUND;
        }
    }

    Array.from(document.querySelectorAll("input, textarea")).forEach(el => {
        fixElement(el);
    });

    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutationList, observer) {
            for (var mutation of mutationList) {
                var addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach(node => {
                    Array.from(node.querySelectorAll("input, textarea")).forEach(el => {
                        fixElement(el);
                    });
                });
            }
        });
        observer.observe(document, { childList: true, subtree: true } );
    }
})();