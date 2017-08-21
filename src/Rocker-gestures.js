// ==UserScript==
// @name         Rocker gestures
// @updateURL    https://openuserjs.org/meta/fluffynuts/Rocker-gestures.meta.js
// @copyright    2017, Davyd McColl (https://github.com/fluffynuts)
// @version      0.1
// @description  Provides simple forward and back gestures via mouse button rocking (back with right-left and fwd with left-right)
// @license      BSD
// @author       fluffynuts
// @grant        none
// @include      *
// ==/UserScript==
// ==OpenUserJS==
// @author       fluffynuts
// ==/OpenUserJs==
(function() {
    'use strict';
    var last,
        lookup = [undefined, "left", undefined, "right"],
        actions = {
            "rightleft": () => window.history.back(),
            "leftright": () => window.history.forward()
        },
        stopNextContextMenu = false;
    
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("contextmenu", onContextMenu);
    // Your code here...
    function onMouseDown(ev) {
        if (last) {
            runFor(ev);
        } else {
            last = lookup[ev.which];
        }
    }
    function onMouseUp(ev) {
        var current = lookup[ev.which];
        if (current === last) {
            stop(ev);
            last = undefined;
        }
    }
    function onContextMenu(ev) {
        var result = !stopNextContextMenu;
        stopNextContextMenu = false;
        if (!result) {
            stop(ev);
        }
        return result;
    }
    function runFor(ev) {
        var current = lookup[ev.which];
        var handler = actions[(last || "")+(current || "")];
        if (handler) {
            stop(ev);
            stopNextContextMenu = true;
            handler();
        }
    }
    function stop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }
})();