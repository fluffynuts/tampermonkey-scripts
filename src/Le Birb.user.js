// ==UserScript==
// @name         Le Birb
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    const logoImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABUYAAASwCAMAAAAAI2DjAAACx1BMVEUAAAAA//////8AgP8Aqv8Av/8zmf8kkv8rqv8cqv8gn/8XougameYUnesVquoime4kpO0epfAgn+8bofIcnPEYnvMapvIXovMhpvQfo/Ugn/QcofYdnfUanvYbpPYaou4hpe8fovAgn+8doPAenvAcn/Eco/Eao/IbofIfovMgn/IeoPMepPMcn/QdovMbo/QcofQbn/Qfoe8eoPAfo/Adn/EdovAcofEcovEbn/EbofIeoPIfo/Ido/IeovIcovMdoPMbofMcn/MeoPQfovMeofQeo/AdoPAdovEcn/EcofEcovEfoPEeofIeovIdoPIdofIcofIdo/IcoPMcovMeofMeovMdofMeoPMdoPEdovMcoPEcovEcofEeovEeoPEeofIdoPIdovIcovIdofIcofIcovIeoPMeofMdoPMdovMdofMdovMcofEeoPEeofEdoPEeovEdofIdovIcofIdoPIcoPIeofIeoPIeovIdofIdovMdoPMdofMcofMcovMeoPEeofEdofEdovEdoPEdofIcofIdovIcofIeoPIdofIeofIdoPIdofIdoPMdovIcofMcovMdofMeofMdoPEdofEdoPEdovEcovIdofIeofIdoPIdofIdoPIdofIdofIdovIcofIeofIdofMeovMdoPEdofMdofEcofIdofIdofIeovIdoPIdofIdofIcofIdoPIcovIeofIdofIdovIdofMdoPMdofEcofEcofIdovIeofIdofIdoPIdofIcofIdofIdofIeofIdofIdofIdovIdoPMdofMcofEeofEdofIdofIdovIdoPIdofIcofIdofIdofIeofIdofIdofIdovIdofIcofIdofMdofEdofIdofIdofIcofIdoPIdofIdofIdofIdofIdovIdofIeofIdofIdofMdofIdofIdofIdofIdofIkpPv+AAAA7HRSTlMAAAACAgQEBgYICAoKDAwODhAQEhIUFBYWGBgaGhwcHh4gICIiJCQmJigoKiosLC4uMDAyMjQ0NjY4ODo6PDw+PkBAQkJEREZGSEhKSkxMTk5QUFJSVFRWVlhYWlpcXF5eYGBiYmRkZmZoaGpqbG5ucHBycnR0dnZ4eHp6fHx+foGBg4OFhYeH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";

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fixTwitterLink() {
        const homeLink = document.querySelector("a[href='/home'][role='link'][aria-label='Twitter']");
        if (homeLink) {
            for (let el of Array.from(homeLink.children)) {
                homeLink.removeChild(el);
            }
            const img = document.createElement("img");
            img.src = logoImage;
            img.style.height = "32px";
            img.style.width = "32px";
            img.style.marginLeft = "10px";
            img.style.marginTop = "15px";
            homeLink.appendChild(img);
            console.log("fixed", homeLink);
        } else {
            console.log("can't find home link");
            await sleep(200);
            fixTwitterLink();
        }
    }

    function fixFavIcon() {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = logoImage;
        link.type = "image/x-icon";
        const head = document.querySelector("head");
        head.appendChild(link);
    }

    fixTwitterLink();
    fixFavIcon();
})();