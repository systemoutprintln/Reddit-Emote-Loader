// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://userscripts.org/users/systemoutprintln
// @version        0.2.0
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

//Options

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];
var subs=["mlplounge","mylittlepony","mylittlewtf","mylittlelistentothis","mylittlenanners","mylittleandysonic1"];

// Plounge specific emotes on the PLounge?
// Disables mylittlepony emotes on the MLPLounge 
var PLounge = true;

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
		var sReg = new RegExp(Subs[i].toLowerCase());
		if(sReg.test(document.URL.toLowerCase()))
		{		
			i++;
			continue; //Don't load this site's stylesheet
		}
		
		if(PLounge)
		{
			sReg = /mlplounge/
			if(sReg.test(document.URL.toLowerCase()))
			{
				sReg = /mylittlepony/
				if(sReg.test(Subs[i]))
				{
					i++;
					continue;
				}
			
			}
		}
				
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
		style.media = "print";
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
			var sheet;
			if(document.styleSheets.length > cssnum)
			{
				sheet = getStyle(style);
				if(sheet != -1)
				{
					remRules(style);
					
					clearInterval(ch);
				}
			}
		}, 5);
	
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
		sub.media = "all";
		ssheet = getStyle(sub);
		if(ssheet == -1) return;
		
	}
	else
	{
		ssheet = sub.sheet.cssRules[0].styleSheet;
	}
	
	
	var srule;
	
	var emote = /a\[href\|="/

    var srules = ssheet.cssRules;
	
	//GM_log(srules.length);
	
	for(i = 0; i < srules.length; i++)
	{
		srules = ssheet.cssRules;
		
		srule = srules[i];
		//GM_log(srule.selectorText);
		if(emote.test(srule.selectorText))
		{
			GM_log(srule.selectorText);
		
		} else
		{
			ssheet.deleteRule(i);
			i--;			
		}
		
	
	}
	
	if(chrome)
	{
		//sub.media = "all";
		GM_log("Done");
	}
	else
	{
		sub.sheet.disabled = false;	
	}

}


//// Special CSS flags ////

//TODO

