// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://userscripts.org/users/systemoutprintln
// @version        0.5.4
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

//Options

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];
var subs=["mylittlepony","mylittlewtf","mylittlelistentothis","mylittlenanners","mylittleandysonic1"];

// Disables mylittlepony emotes on the MLPLounge 
var PLounge = true;

//Use Extra CSS from /r/extraCSS
var useExtraCSS = true;

//Environ variables - only change if something goes wrong.
var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

//Do not change below this line
var count=0;
var unique;

var ch = new Array();
var ff = new Array();

useSubs(subs);

if(useExtraCSS)
{
	CSSFlags();
}





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
		var SubCss = 'http://www.reddit.com/r/' + Subs[i] + '/stylesheet.css';
				
		sID [i] = addSub(SubCss);
		

		if(chrome){
			//sID[i].disabled = true;
		}
		else{
			sID[i].sheet.disabled = true;
		}

	
		waitForLoad(sID[i], i);	
		
		i++;
	}
	

	
}

function addSub(Sub)
{
	var head = document.getElementsByTagName("head")[0];
	
	var d = new Date();
	unique = d.getTime();
	
	var style;
	
	if(chrome)
	{
		style =	document.createElement('link');
		style.type = 'text/css'
		style.rel = 'stylesheet';
		
		style.href = Sub; //+ "?v=" + unique;
		style.media = "print";
		//style.disabled = true;	
	}
	else
	{
		style = document.createElement('style');
		style.textContent = '@import "' + Sub + '"';
		//style.sheet.disabled = true;	
	}
	
	head.appendChild(style);
	
	return style;


}



function waitForLoad(style, i)
{
	if(chrome)
	{
		var cssnum = document.styleSheets.length;
		ch[i] = setInterval(function() {
		//Try enable to test, then disable
			count++;
			var sheet;
			if(document.styleSheets.length > cssnum)
			{
				sheet = getStyle(style);
				if(sheet != -1)
				{
					remRules(style);
					
					clearInterval(ch[i]);
				}
			}
		}, 10);
	
	}else{
		ff[i] = setInterval(function() {
			try {
		
		
			style.sheet.cssRules;
			remRules(style);
		
			clearInterval(ff[i]);
			} catch (e){}
		}, 10); 
	}
}

function getStyle(sub)
{
	for(i=0; i < document.styleSheets.length; i++)
	{
		if(document.styleSheets[i].href == sub.href)
		{
			GM_log("Stylesheet " + sub.href + " = " + i);
			return document.styleSheets[i];	
		}
	}
	return -1;

}

function remRules(sub)
{
	var ssheet 
	var isCss;
	
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
			//GM_log(srule.selectorText);
		
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
	ruleWalker(ssheet);

}

function ruleWalker(stylesheet)
{
	GM_log(stylesheet.href);
	srules = stylesheet.cssRules;
	for(i = 0; i < srules.length; i++)
	{
		//GM_log(srules[i].selectorText);
	}
	

}


//// Special CSS flags ////

function CSSFlags()
{	
	if(chrome)
		{
		var chm = setInterval(function() {
		//Try enable to test, then disable
			if(document.styleSheets.length > 0)
			{
				addExtraCSS();
				clearInterval(chm);
			}
		}, 10);
	
	}else{
		var ffm = setInterval(function() {
			try 
			{
				document.styleSheets[0].cssRules;
				clearInterval(ffm);

			} catch (e){}
		}, 10); 
	}
	
}

function addExtraCSS()
{
	var css = new Array();
	//Dance (-d)
	css[0] = "a[href*=\'-d\']:hover {\
			-moz-transform: scaleX(-1);\
			-o-transform: scaleX(-1);\
			-webkit-transform: scaleX(-1);\
			transform: scaleX(-1);\
			}";
		
	var sheet = document.styleSheets[0];
	for(i = 0; i < css.length; i++)
	{
		sheet.insertRule(css[i], 0);
	}

}



