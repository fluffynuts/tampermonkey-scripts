// ==UserScript==
// @name         Death to "More Tweets"
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://twitter.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const debug = false;
    let scanTimeout = null;

    function log() {
        if (debug) {
            console.log.apply(console, Array.from(arguments));
        }
    }

    let lastMarker;

    function cleanupAfter(marker) {
        if (!marker) {
            return;
        }
        while (marker.nextElementSibling) {
            log("delete next", marker.nextElementSibling);
            marker.nextElementSibling.remove();
        }
        if (marker.style.display !== "none") {
            log("hide marker");
            marker.style.display = "none";
        }
    }

    function scan() {
        log("look for conversation container");
        var container = document.querySelector("[aria-label='Timeline: Conversation']");
        if (!container) {
            return triggerScan();
        }
        if (lastMarker) {
            log("test last marker");
            if (!lastMarker.isConnected) {
                log("last marker not connected any more");
                lastMarker = undefined;
            } else {
                cleanupAfter(lastMarker);
            }
        }
        log("look for more tweets header")
        var headers = Array.from(container.querySelectorAll("h2"));
        for (var header of headers) {
            if ((header.innerText || "").trim().toLowerCase() != "more tweets") {
                continue;
            }
            var marker = tryFindParentOf(header, "data-testid", "cellInnerDiv", container);
            cleanupAfter(marker);
            lastMarker = marker;
        }
        triggerScan();
    }

    function tryFindParentOf(el, attr, value, stopEl) {
        var current = el.parentElement;
        while (current && current != stopEl) {
            var currentVal = current.getAttribute(attr);
            if (currentVal === value) {
                return current;
            }
            current = current.parentElement;
        }
    }

    function triggerScan() {
        if (scanTimeout) {
            window.clearTimeout(scanTimeout);
        }
        scanTimeout = window.setTimeout(scan, 1000);
    }

    triggerScan();
    // Your code here...
})();