// ==UserScript==
// @name         Better Jenkins
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://jenkins.codeo.co.za/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function checkBranchSelector() {
        if (!window.location.pathname.match(/\/build$/)) {
            return;
        }
        improveBranchSelector();
    }
    function improveBranchSelector() {
        const select = document.querySelector("select[fillurl$='?param=Branch']");
        if (!select) {
            return;
        }
        select.style.height = "350px";
        if (select.getAttribute("_fixed-up")) {
            return;
        }
        const options = Array.from(select.querySelectorAll("option"))
          .sort((a, b) => {
              if (a.value < b.value) {
                  return -1;
              }
              return a.value === b.value
                  ? 0
                  : 1
          });
        if (options.length === 0 || (options.length === 1 && options[0].value === "")) {
            // options may still be async-fetched?
            return;
        }
        console.log("ordering build options", {
            options
        });
        select.setAttribute("_fixed-up", "totally");
        options.forEach(o => o.remove());
        options.forEach(o => select.appendChild(o));
    }

    function checkConsoleLinks() {
        const anchors = Array.from(document.querySelectorAll("a.build-status-link[href$='console']"));
        anchors.forEach(a => {
            a.href = a.href.replace(/console$/, "consoleFull");
        });
    }

    function checkForSkipBuild() {
        const input = document.querySelector("input[value='SKIP_TESTS']");
        if (!input) {
            return;
        }
        const originalInput = input.nextElementSibling;
        if (originalInput.getAttribute("data-checky")) {
            return;
        }
        originalInput.setAttribute("data-checky", "1");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = originalInput.value !== "No";
        checkbox.addEventListener("click", e => {
            e.stopPropagation() /* otherwise the box is flipped back off by the parent element's hanlder  */
            handleChange();
        });
        originalInput.parentElement.appendChild(checkbox);
        var test = originalInput.parentElement;
        while (test && test.tagName !== "TR") {
            test = test.parentElement;
        }
        if (test) {
            test.addEventListener("click", () => {
                checkbox.checked = !checkbox.checked;
                handleChange();
            });
            test.style.cursor = "pointer";
        }
        originalInput.style.display = "none";


        function handleChange() {
            originalInput.value = checkbox.checked
               ? "Yes, I know what I'm doing"
               : "No";
        };
    }

    window.setInterval(() => {
        checkBranchSelector();
        checkConsoleLinks();
        checkForSkipBuild();
    }, 1000);
})();