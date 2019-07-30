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

    Array.prototype.from = Array.prototype.from || function(src) {
        var result = [];
        if (!src.length) {
            return result;
        }
        for (var i = 0; i < src.length; i++) {
            result.push(src[i]);
        }
        return result;
    }

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

    function ensureFirstIsLarger(o) {
        if (o.first < o.second) {
            var swp = o.first;
            o.first = o.second;
            o.second = swp;
        }
        return o;
    }

    var transforms = {
        "+": function(o) { return o.first + o.second; },
        "-": function(o) {
            // negative results not supported (yet)
            ensureFirstIsLarger(o);
            return o.first - o.second;
        },
        "/": function(o) {
            // fractional results not supported yet
            ensureFirstIsLarger(o);
            var rem = o.first % o.second;
            o.first += rem;
            return o.first / o.second;
        },
        "*": function(o) { return o.first * o.second }
    };

    function generateProblem() {
        var operator = randomFrom(["+", "-"]);
        var lower = fetchLowerBound();
        var upper = fetchUpperBound();
        var randoms = {
            first: random(lower, upper),
            second: random(lower, upper)
        }
        var answer = transforms[operator](randoms);
        return Object.assign(randoms, {
            answer: answer,
            operator: operator
        });
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
            storeCorrect();
            fadeOut(find(idSel("overlay")));
            fadeOut(find(idSel("dialog")));
        } else {
            storeIncorrect();
            var dlg = document.getElementById(id("dialog"));
            shake(dlg);
            input.style.borderColor = "red";
            input.setSelectionRange(0, input.value.length);
        }

        // TODO: levelling
        var stats = calculateStats();
        // simple levelling: for every 50 delta, increment (could be decrement too) upper bound
        console.log(stats);
        var increment = Math.round(stats.delta / 25);
        var clamped = clamp(increment, -5, 5);
        // TODO: determine better upper bound for clamped upper
        var newUpper = clamp(stats.upper + increment, 15, 100);
        storeNumber("upper bound", newUpper);
        // TODO: alter lower bound too?
    }

    function clamp(number, min, max) {
        if (number > max) {
            return max;
        }
        if (number < min) {
            return min;
        }
        return number;
    }

    function calculateStats() {
        var correct = fetchStoredNumber("correct answers", 0);
        var incorrect = fetchStoredNumber("incorrect answers", 0);
        var total = correct + incorrect;
        var ratio = total === 0
            ? 0
            : correct / total
        var percent = Math.round(ratio * 100);
        return {
            upper: fetchStoredNumber("upper bound", 15),
            correct: correct,
            incorrect: incorrect,
            delta: correct - incorrect,
            percent: percent
        }
    }

    function storeCorrect() {
        incrementStoredValue("correct answers");
    }

    function storeIncorrect() {
        incrementStoredValue("incorrect answers");
    }

    function fetchLowerBound() {
        return fetchStoredNumber("lower bound", 0);
    }

    function fetchUpperBound() {
        return fetchStoredNumber("upper bound", 15);
    }

    function fetchStoredNumber(key, defaultValue) {
        var result = retrieveNumber(key);
        if (isNaN(result) && defaultValue !== undefined) {
            storeNumber(key, defaultValue);
            result = defaultValue;
        }
        return result;
    }

    function incrementStoredValue(key) {
        var stored = retrieveNumber(key);
        if (isNaN(stored)) {
            stored = 0;
        }
        stored++;
        storeNumber(key, stored);
    }

    function retrieveNumber(key) {
        return parseInt(retrieveValue(key));
    }

    function storeNumber(key, value) {
        storeValue(key, value);
    }

    function retrieveValue(key) {
        key = "youtube sums: " + (key || "");
        return localStorage.getItem(key);
    }
    function storeValue(key, value) {
        key = "youtube sums: " + (key || "");
        localStorage.setItem(key, value);
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

    function pauseVideo() {
        if (!find(idSel("dialog"))) {
            return;
        }
        Array.from(document.querySelectorAll("video")).forEach(v => v.pause());
    }

    function randomFrom(arr) {
        return arr[random(0, arr.length-1)];
    }

    function popSum() {
        pauseVideo();
        var overlay = makeOverlay();
        var dialog = makeDialog();
        var problem = generateProblem();
        var sum = makeSum(problem);
        var button = makeDoneButton();
        dialog.appendChild(button);
        var floater = makeFloaterFor(sum);
        dialog.appendChild(floater);
        dialog.appendChild(sum);
        document.body.appendChild(dialog);

        button.addEventListener("click", checkAnswer);
        window.addEventListener("load", focusAnswer);
        dialog.addEventListener("click", focusAnswer);
        overlay.addEventListener("click", focusAnswer);
        focusAnswer();
    }

    function focusAnswer() {
        var el = find(idSel("answer"));
        if (el) {
            el.focus();
        }
    }

    popSum();

    window.setInterval(function() {
        focusAnswer();
        pauseVideo();
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