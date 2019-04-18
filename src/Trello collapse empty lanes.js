// ==UserScript==
// @name         Trello collapse empty lanes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://trello.com/b/rJ0CUlsC/super-data-mission
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  var wrapperClass = "list-wrapper", sel = "div." + wrapperClass;

  var styleTag = document.createElement("style");
  styleTag.type = "text/css";
  styleTag.id = "lane-collapse";
  var textNode = document.createTextNode([
    "div." + wrapperClass + ".collapsed {",
    "  width: 50px",
    "}",
    sel + ".collapsed .list-header-name-assist { display: block; transform: rotate(180deg); writing-mode: vertical-lr; font-size: small; white-space: nowrap; margin-top: 20px; }",
    sel + ".collapsed textarea { display: none; }",
    sel + ".collapsed .list-header-target { transform: rotate(90deg); }",
    sel + ".collapsed .list-header-name { transform: rotate(90deg) }",
  ].join("\n"));
  styleTag.appendChild(textNode);
  document.head.appendChild(styleTag);

  var handlers = {
    mouseout: collapseIfEmpty,
    dragover: unCollapse,
    dragleave: collapseIfEmpty,
    drop: collapseIfEmpty,
    dragend: collapseIfEmpty
  };

  function defineDataProp(el) {
    if (!el) {
      return;
    }
    if (el.data) {
      return;
    }
    Object.defineProperties(el, {
      data: {
        enumerable: true,
        get() {
          return JSON.parse(el.getAttribute("data-auto-collapse") || "{}");
        },
        set(val) {
          el.setAttribute("data-auto-collapse", JSON.stringify(val));
        }
      },
    });
  }

  function autoCollapse(el) {
    defineDataProp(el);
    if (el.data.initialized) {
      return; // already auto-collapsing
    }
    el.data.initialized = true;
    collapseIfEmpty(el);
    el.childNodes.forEach(cn => {
      Object.keys(handlers).forEach(evName => {
        cn.addEventListener(evName, () => {
          handlers[evName](el);
        });
      });
    });
  }

  function unCollapse(el) {
    defineDataProp(el);
    var addCard = el.querySelector(".js-add-a-card");
    el.classList.remove("collapsed");
  }

  function collapse(el) {
    if (el.classList.contains("js-add-list")) {
      return;
    }
    defineDataProp(el);
    var addCard = el.querySelector(".js-add-a-card");
    el.classList.add("collapsed");
    if (el.data.addCardText) {
      addCard.innerText = el.data.addCardText || "Add";
    }
  }

  function collapseIfEmpty(el) {
    if (el.querySelector("a.list-card")) {
      unCollapse(el);
    } else {
      collapse(el);
    }
  }

  function isPlaceholder(node) {
    return node.tagName === "A" && node.classList.contains("placeholder");
  }

  var observer = new MutationObserver(function(mutationList, observer) {
    for (var mutation of mutationList) {
      var addedNodes = Array.from(mutation.addedNodes);
      addedNodes.forEach(node => {
        if (!node.querySelectorAll) {
          return;
        }
        Array.from(node.querySelectorAll("." + wrapperClass)).forEach(el => {
          autoCollapse(el);
        });
        if (isPlaceholder(node)) {
          // new placeholder -- ensure droppable surface is large enough
          unCollapse(node.closest("." + wrapperClass));
        }
        Array.from(node.querySelectorAll("a.list-card")).forEach(el => {
          unCollapse(node.closest("." + wrapperClass));
          el.addEventListener("drop", () => {
            console.log("dropped");
          });
          el.addEventListener("dragend", () => {
            console.log("dragend");
          });
        });
      });
      var removedNodes = Array.from(mutation.removedNodes);
      removedNodes.forEach(node => {
        if (!node.querySelectorAll) {
          return;
        }
        if (isPlaceholder(node)) {
          Array.from(document.querySelectorAll("." + wrapperClass)).forEach(el => collapseIfEmpty(el));
        }
      });
    }
  });
  observer.observe(document, { childList: true, subtree: true } );
  window.setTimeout(() => {
    Array.from(document.querySelectorAll("." + wrapperClass)).forEach(el => {
      autoCollapse(el);
    });
  }, 2000);
})();