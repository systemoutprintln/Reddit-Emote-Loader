// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://userscripts.org/users/systemoutprintln
// @version        0.1.5
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];
var subs=["mylittlepony","mylittlewtf","mylittlelistentothis","mylittlenanners","mylittleandysonic1"];

//Environ variables - only change if something goes wrong.
var chrome = false; //Is the browser Chrome

//Do not change below this line

chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var timer;
var count=0;
useSubs(subs);




function useSubs(Subs) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{
	//alert(chrome);
	var sID = new Array();
	
	var i = 0;
	while(i < Subs.length)
	{
		sID [i] = addSub(Subs[i]);
		if(chrome){
			//sID[i].disabled = true;
		}
		else{
			sID[i].sheet.disabled = true;
		}

		waitForLoad(sID[i]);
		i++;
	}


}

function addSub(Sub) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{
	var head = document.getElementsByTagName("head")[0];
	var SubCss = 'http://www.reddit.com/r/' + Sub + '/stylesheet.css';
	
	var style;
	
	if(chrome)
	{
		style =	document.createElement('link');
		style.type = 'text/css'
		style.rel = 'stylesheet';
		style.href = SubCss;
		//style.disabled = true;	
	}
	else
	{
		style = document.createElement('style');
		style.textContent = '@import "' + SubCss + '"';
		//style.sheet.disabled = true;	
	}
	
	head.appendChild(style);
	
	return style;


}



function waitForLoad(style)
{
	if(chrome)
	{
		var cssnum = document.styleSheets.length;
		var ch = setInterval(function() {
		//Try enable to test, then disable
			count++;
			if(document.styleSheets.length > cssnum)
			{
				var sheet = getStyle(style);
				if(sheet != -1)
				{
					sheet.disabled = true;
					remRules(style);
					
					clearInterval(ch);
				}
			}
		}, 1);
	
	}else{
		var ff = setInterval(function() {
			try {
			count++;
			//GM_log(count);
		
		
			style.sheet.cssRules;
			remRules(style);
		
			clearInterval(ff);
			} catch (e){}
		}, 10); 
	}
}

function getStyle(sub)
{
	for(i=0; i < document.styleSheets.length; i++)
	{
		if(document.styleSheets[i].href == sub.href) return document.styleSheets[i];	
	}
	return -1;

}

function remRules(sub)
{
	var ssheet 
	
	if(chrome)
	{
		ssheet = getStyle(sub);
		if(ssheet == -1) return;
		ssheet.disabled = true;
	}
	else
	{
		ssheet = sub.sheet.cssRules[0].styleSheet;
	}
	
	
	var srule;
	
	var emote = /a\[href\|="/

    var srules = ssheet.cssRules;
	
	GM_log(srules.length);
	
	for(i = 0; i < srules.length; i++)
	{
		srules = ssheet.cssRules;
		
		srule = srules[i];
		//GM_log(srule.selectorText);
		if(emote.test(srule.selectorText))
		{} else
		{
			ssheet.deleteRule(i);
			i--;			
		}
		
	
	}
	
	if(chrome)
	{
		sub.disabled = false;
	}
	else
	{
		sub.sheet.disabled = false;	
	}

}


//// Special CSS flags ////

//TODO

