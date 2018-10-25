// ==UserScript==
// @name         Youtube Sums
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";
    var fontSize = 64; // other sizes may be based off of this
    var currentLocation = window.location.href;
    function id(part) {
        return "work-for-it-" + part;
    }

    function px(num) {
        return num + "px";
    }

    function setStyle(el, style) {
        Object.keys(style).forEach(function(k) {
            el.style[k] = style[k];
        });
    }

    function makeOverlay() {
        var overlay = document.createElement("div");
        setStyle(overlay, {
            width: "100%", //px(window.innerWidth);
            height: "100%", //px(window.innerHeight);
            position: "fixed",
            background: "black",
            zIndex: "99999",
            opacity: 0.8
        });
        overlay.id = id("overlay");
        document.body.appendChild(overlay);
        return overlay;
    }

    function makeDialog() {
        var dlg = document.createElement("div");
        setStyle(dlg, {
            border: "1px solid white",
            width: "80%",
            height: "80%",
            marginLeft: "10%",
            marginTop: px(Math.round(window.innerHeight * 0.1)),
            background: "#111",
            position: "fixed",
            zIndex: "999999",
            borderRadius: "4px",
            textAlign: "center",
            verticalAlign: "middle"
        });

        dlg.id = id("dialog");
        return dlg;
    }

    function makeDoneButton() {
        var button = document.createElement("button");
        button.id = id("done-button");
        button.innerText = "Ok";
        setStyle(button, {
            position: "absolute",
            right: "5%",
            bottom: "5%"
        });
        return button;
    }

    function makeSumContainer() {
        var sumContainer = document.createElement("div");
        var partSize = fontSize + 10;
        var dlgWidth = window.innerWidth * 0.8;
        setStyle(sumContainer, {
            display: "inline-block"
        });
        return sumContainer;
    }

    function makeSumPart() {
        var sumPart = document.createElement("div");
        setStyle(sumPart, {
            display: "inline-block",
            width: px(fontSize + 10),
            height: px(fontSize + 10),
            fontSize: px(fontSize),
            padding: "10px",
            color: "white"
        });
        return sumPart;
    }

    function makeSumParts() {
        return [
            makeSumPart(), // first number
            makeSumPart(), // operation
            makeSumPart(), // second number
            makeSumPart(), // =
            makeSumPart(), // answer
        ];
    }

    function random(min, max) {
        return min + Math.round(Math.random() * (max - min));
    }

    var transforms = {
        "+": function(a, b) { return a + b; },
        "-": function(a, b) { return a - b; },
        "/": function(a, b) { return a / b; },
        "*": function(a, b) { return a * b; }
    };

    function generateProblem(operator) {
        var first = random(0, 10);
        var second = random(0, 10);
        operator = operator || "+";
        var answer = transforms[operator](first, second);
        return {
            first: first,
            second: second,
            answer: answer,
            operator: operator
        };
    }

    function createAnswerInput(answer) {
        var input = document.createElement("input");
        input.id = id("answer");
        setStyle(input, {
            border: "1px solid #eee",
            borderRadius: px(4),
            fontSize: px(fontSize),
            width: px(Math.round(fontSize * 1.5)),
            textAlign: "center"
        });

        input.setAttribute("data-answer", answer);
        input.addEventListener("keypress", function(ev) {
            input.style.borderColor = "#eee";
            if (ev.keyCode === 13) {
                checkAnswer();
            }
        });
        return input;
    }

    function makeSum(problem) {
        var sumContainer = makeSumContainer();
        var sumParts = makeSumParts();

        sumParts[0].innerText = problem.first;
        sumParts[1].innerText = problem.operator;
        sumParts[2].innerText = problem.second;
        sumParts[3].innerText = "=";

        var answerInput = createAnswerInput(problem.answer);
        sumParts[4].appendChild(answerInput);


        sumParts.forEach(function(o) {
            sumContainer.appendChild(o);
        });

        return sumContainer;
    }

    function find(q) {
        return document.querySelector(q);
    }

    function idSel(i) {
        return "#" + id(i);
    }

    function checkAnswer() {
        var btn = find(idSel("done-button"));
        btn.disabled = "disabled";
        var input = find(idSel("answer"));
        var answer = parseInt(input.getAttribute("data-answer"));
        var entered = parseInt(input.value);
        if (entered === answer) {
            fadeOut(find(idSel("overlay")));
            fadeOut(find(idSel("dialog")));
        } else {
            var dlg = document.getElementById(id("dialog"));
            shake(dlg);
            input.style.borderColor = "red";
        }
    }

    function shake(el, positions) {
        positions = positions || [10, -10, 10, -10, 0];
        window.setTimeout(function() {
            el.style.left = px(positions.shift());
            if (positions.length) {
                shake(el, positions);
            } else {
                var btn = find(idSel("done-button"));
                btn.disabled = "";
            }
        }, 100);
    }

    function fadeOut(el, opacities) {
        opacities = opacities || [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
        window.setTimeout(function() {
            el.style.opacity = opacities.shift() + "";
            if (opacities.length) {
                fadeOut(el, opacities);
            } else {
                el.remove();
            }
        }, 100);
    }

    function makeFloaterFor(child) {
        var floater = document.createElement("div");
        setStyle(floater, {
            float: "left",
            height: "50%",
            width: "100%",
            marginBottom: "-50px",
        });
        child.style.clear = "both";
        return floater;
    }

    function popSum() {
        var overlay = makeOverlay();
        var dialog = makeDialog();
        var problem = generateProblem("+");
        var sum = makeSum(problem);
        var button = makeDoneButton();
        dialog.appendChild(button);
        var floater = makeFloaterFor(sum);
        dialog.appendChild(floater);
        dialog.appendChild(sum);
        document.body.appendChild(dialog);

        button.addEventListener("click", checkAnswer);
        window.addEventListener("load", function() {
            console.log("focusing answer");
            find(idSel("answer")).focus();
        });
    }
    popSum();

    window.setInterval(function() {
        if (window.location.href !== currentLocation) {
            console.log({
                href: window.location.href,
                currentLocation: currentLocation
            });
            currentLocation = window.location.href;
            popSum();
        }
    }, 1000);
})();