// ==UserScript==
// @name         auto-reload hacker news
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://news.ycombinator.com
// @icon         https://www.google.com/s2/favicons?domain=ycombinator.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const
        refreshIntervalMinutes = 15,
        oneMinuteInMilliseconds = 60 * 1000,
        refreshIntervalMilliseconds = refreshIntervalMinutes * oneMinuteInMilliseconds;
    let lastInteraction = Date.now();

    function refreshIfIdle() {
        if (Date.now() - lastInteraction > refreshIntervalMilliseconds) {
            console.warn("reloading!");
            window.location.reload();
        } else {
            console.log("not idle - not refreshing just yet");
        }
    }

    function zeroPad(value) {
        value = `${value}`;
        while (value.length < 2) {
            value = `0${value}`
        }
        return value;
    }
    function timestamp() {
        var now = new Date();
        return [
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
        ].map(o => zeroPad(o))
            .join(":");
    }

    function datestamp() {
        var now = new Date();
        return [
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate(),
        ].map(o => zeroPad(o))
            .join("-");
    }

    window.addEventListener("mousemove", () => {
        lastInteraction = Date.now();
    });

    window.setInterval(() => {
        refreshIfIdle();
    }, oneMinuteInMilliseconds);

    var container = document.createElement("div");

    container.style.position = "fixed";
    container.style.right = "0px";
    container.style.top = "0px";
    container.style.fontSize = "0.6em";
    container.style.padding = "4px";

    function line(str) {
        var el = document.createElement("div");
        el.innerText = str;
        return el;
    }

    container.appendChild(line("Last loaded:"));
    container.appendChild(line(datestamp()));
    container.appendChild(line(timestamp()));
    document.body.appendChild(container);
})();