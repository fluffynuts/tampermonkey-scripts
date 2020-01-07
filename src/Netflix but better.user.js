// ==UserScript==
// @name         Netflix but better
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.netflix.com/watch/*
// @grant        none
// ==/UserScript==
// relies on the VideoSpeedController addon for remembering playback speed

(function() {
    'use strict';
    function adjust() {
        var stored = localStorage.getItem("speed");
        if (!stored) {
            stored = 1.5;
        } else {
            stored = parseFloat(stored);
        }
        var outer = document.querySelector("div#controller span.draggable");
        var controls = document.querySelector("span#controls");
        var faster = controls.querySelector("[data-action='faster']");
        var slower = controls.querySelector("[data-action='slower']");

        function increase() {
            faster.click();
        }

        function decrease() {
            slower.click();
        }

        function currentSpeed() {
            return parseFloat(outer.innerText.trim());
        }

        function test() {
            var current = currentSpeed();
            if (current < stored) {
                increase();
                return true;
            }
            else if (current > stored)
            {
                decrease();
                return true;
            }
            return false;
        }

        function adjustIfNecessary() {
            window.setTimeout(function() {
                if (test()) {
                    adjustIfNecessary();
                } else {
                    adjustIfNecessary();
                }
            }, 100);
        }

        adjustIfNecessary();

        function storeCurrentSpeed() {
            var current = currentSpeed();
            localStorage.setItem("speed", current);
        }
        faster.addEventListener("click", function() {
            window.setTimeout(function() {
                storeCurrentSpeed();
            }, 100);
        });
        slower.addEventListener("click", function() {
            window.setTimeout(function() {
                storeCurrentSpeed();
            }, 100);
        });
    }


    function waitForControls() {
        return new Promise(function(resolve, reject) {
            window.setTimeout(function check() {
                if (document.querySelector("div#controller span.draggable")) {
                    resolve();
                } else {
                    window.setTimeout(check, 50);
                }
            }, 50);
        });
    }

    function autoSkipIntro() {
        window.setInterval(function skipIfCanSkip() {
            var button = document.querySelector("[aria-label='Skip Intro']");
            if (button) {
                button.click();
            }
        }, 2500);
    }

    var currentUrl = window.location.toString();
    function watchUrl() {
        window.setInterval(function() {
            if (window.location.toString() !== currentUrl) {
                currentUrl = window.location.toString();
                window.setTimeout(init, 2000);
            }
        }, 1000);
    }

    function init() {
        waitForControls().then(function() {
            adjust();
            watchUrl();
        });
    }
    init();
    autoSkipIntro();
})();