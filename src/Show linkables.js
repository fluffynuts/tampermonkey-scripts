// ==UserScript==
// @name         Show linkables
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  add hover-over linkables for things with ids so you can easily get a link to, eg an SO answer
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var hovers = [],
        activeHovers = [],
        visibleDisplay = ""; // fixme: want absolute!

    function probablyNotInteresting(el) {
        if (el.tagName === "A") {
            return true;
        }
        return ["answer", "link", "comment"].reduce((acc, cur) => {
            return acc || el.id.indexOf(cur) > -1;
        }, false);
    }

    function addIdLink(el) {
        console.log("add id link for", el);
        if (probablyNotInteresting(el)) {
            return;
        }

        var clientRect = el.getBoundingClientRect();
        var hover = document.createElement("div");
        var link = makeLinkFor(el);
        hovers.push(hover);
        hover.style.display = "inline-block";
        // hover.style.position = "absolute";
        // hover.style.top = px(clientRect.top);
        // hover.style.left = px(clientRect.left);
        hover.style.cursor = "pointer";
        hover.style.background = "white";
        hover.style.color = "black";
        hover.style.border = "1px solid #111";
        hover.style.opacity = 0;
        hover.style.display = "none";
        hover.innerText = "Copy link: " + link;
        hover.setAttribute("data-opacity", 0);
        var hoverInput = document.createElement("input");
        //hoverInput.style.display = "none";
        hoverInput.style.width = "0px";
        hoverInput.style.padding = "0px";
        hoverInput.style.border = "none";
        hoverInput.value = link;
        hover.appendChild(hoverInput);
        hover.addEventListener("click", function() {
            hoverInput.select();
            document.execCommand("copy");

        });
        el.appendChild(hover);
        el.addEventListener("mousemove", function(ev) {
            ev.stopPropagation();
            show(hover);
        });
    }

    window.setInterval(() => {
        var life = 5000, interval = 100, step = interval / life;
        hovers.forEach(hover => {
            var opacity = parseFloat(hover.getAttribute("data-opacity"));
            if (opacity <= 0) {
                hover.style.display = "none";
                var idx = activeHovers.indexOf(hover);
                if (idx > -1) {
                    activeHovers.splice(idx, 1);
                }
                return;
            }
            opacity -= step;
            hover.setAttribute("data-opacity", opacity);
            hover.style.opacity = opacity + "";
            hover.style.display = visibleDisplay;
        });
    }, 100);

    function makeLinkFor(el) {
        var l = window.location;
        return [
            l.protocol,
            "//",
            l.host,
            l.pathname,
            "#",
            el.id
            ].join("");
    }

    function show(el) {
        el.setAttribute("data-opacity", 1);
        var idx = activeHovers.indexOf(el);
        if (idx === -1) {
            activeHovers.push(el);
        }
    }

    function px(num) {
        return Math.round(num) + "px";
    }

    Array.from(document.querySelectorAll("[id]")).forEach(el => {
        addIdLink(el);
    });

    if (window.MutationObserver) {
        var observer = new MutationObserver((mutationList, observer) => {
            for (var mutation of mutationList) {
                var addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach(node => {
                    Array.from(node.querySelectorAll("input, textarea")).forEach(el => {
                        addIdLink(el);
                    });
                });
            }
        });
        observer.observe(document, { childList: true, subtree: true } );
    }
})();