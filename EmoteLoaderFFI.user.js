// ==UserScript==
// @name           Reddit Emote Loader Installer
// @namespace      http://www.reddit.com/r/RedditEmoteLoader
// @version        1.0
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

console.log("Start");

var e = document.createElement("script");

e.src = 'https://github.com/systemoutprintln/Reddit-Emote-Loader/raw/master/EmoteLoaderFF.user.js';
e.type="text/javascript";
document.getElementsByTagName("head")[0].appendChild(e);

console.log("Done");
