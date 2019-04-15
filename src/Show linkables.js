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
  var tipTTL = 5000;
  var opacityStep = 0.1;
  var currentEl = null;
  var lastShown = null;
  var tipShouldBeVisible = false;
  var [ tip, tipText, tipInput ] = makeTip();
  window._tip = tip;

  function makeTip() {
    var documentStyle = window.getComputedStyle(document.body);
    var tipElement = document.createElement("div");
    var tipTextElement = document.createElement("span");
    var tipInputElement = makeTipInputElement();

    tipElement.appendChild(tipTextElement);
    tipElement.appendChild(tipInputElement);

    tipElement.style.display = "fixed";
    tipElement.style.bottom = px(0);
    tipElement.style.right = px(0);
    tipElement.style.color = documentStyle.color;
    tipElement.style.background = documentStyle.backgroundColor;
    tipElement.style.border = "1px solid " + tipElement.style.color;
    tipElement.style.opacity = 0;
    tipElement.style.position = "fixed";
    tipElement.style.padding = "5px";
    tipElement.style.zIndex = 10000;
    tipElement.id = "show-linkables-overlay";
    document.body.appendChild(tipElement);

    return [tipElement, tipTextElement, tipInputElement];
  }

  function makeTipInputElement() {
    var result = document.createElement("input");
    result.type = "text";
    result.style.width = px(0);
    result.style.height = px(0);
    result.style.border = "none";
    return result;
  }

  function probablyNotInteresting(el) {
    if (el.tagName === "A") {
      return true;
    }
    return ["answer", "link", "comment"].reduce((acc, cur) => {
      return acc || el.id.indexOf(cur) > -1;
    }, false);
  }

  function process(el) {
    if (probablyNotInteresting(el)) {
      return;
    }
    el.addEventListener("mousemove", function(ev) {
      if (!ev.shiftKey && !currentEl) {
        return;
      }
      ev.stopPropagation();
      currentEl = el;
      showTipFor(el);
    });
  }

  function showTipFor(el) {
    var href = makeLinkFor(el);
    tipText.innerText = [
      "Press Ctrl+Alt+Shift+C to copy url: ",
      href
    ].join("");
    tipInput.value = href;
    showTip();
  }

  function hideTip() {
    tip.style.display = "none";
  }

  function showTip() {
    if (tipShouldBeVisible) {
      tip.style.opacity = 1;
      lastShown = new Date();
    }
  }

  window.setInterval(function() {
    if (!lastShown || !currentEl) {
      return;
    }
    var now = new Date();
    if (now.getTime() - lastShown.getTime() > tipTTL) {
      var currentOpacity = parseFloat(tip.style.opacity);
      if (currentOpacity <= 0) {
        currentEl = null;
        return;
      }
      currentOpacity -= opacityStep;
      tip.style.opacity = currentOpacity.toString();
    }
  }, 100);

  document.addEventListener("keydown", function(ev) {
    if (ev.altKey && ev.shiftKey && ev.ctrlKey) {
      tipShouldBeVisible = true;
      if (ev.key === "C") {
        tipInput.select();
        document.execCommand("copy");
      }
    }
  });

  document.addEventListener("keyup", function(ev) {
    tipShouldBeVisible = false;
  });



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

  function px(num) {
    return Math.round(num) + "px";
  }

  Array.from(document.querySelectorAll("[id]")).forEach(el => {
    process(el);
  });

  if (window.MutationObserver) {
    var observer = new MutationObserver((mutationList, observer) => {
      for (var mutation of mutationList) {
        var addedNodes = Array.from(mutation.addedNodes);
        addedNodes.forEach(node => {
          if (node === tip) {
            return; // easy-out
          }
          if (!node.querySelectorAll) {
            return;
          }
          Array.from(node.querySelectorAll("input, textarea")).forEach(el => {
            process(el);
          });
        });
      }
    });
    observer.observe(document, { childList: true, subtree: true } );
  }
})();
