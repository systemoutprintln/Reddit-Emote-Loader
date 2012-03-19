// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://userscripts.org/users/systemoutprintln
// @include        http://www.reddit.com/*
// ==/UserScript==

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];
var subs=["mylittlepony"];

//Environ variables - only change if something goes wrong.
var chrome = true; //Is the browser Chrome

//Do not change below this line

var timer;
var count=0;
useSubs(subs);




function useSubs(Subs) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{
	var sID = new Array();
	
	var i = 0;
	while(i < Subs.length)
	{
		sID [i] = addSub(Subs[i]);
		waitForLoad(sID[i]);
		i++;
	}


}




function waitForLoad(style)
{
	if(chrome)
	{
		var cssnum = document.styleSheets.length;
		var ch = setInterval(function() {
			if(document.styleSheets.length > cssnum)
			{
				var sheet = getSub(sub);
				if(sheet != -1)
				{
					remRules(sheet);
					
					clearInterval(ch);
				}
			}
		}, 10);
	
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
		style.href = link;
	}
	else
	{
		document.createElement('style');
		style.textContent = '@import "' + SubCss + '"';
	}
	
	head.appendChild(style);
	
	return style;


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
		ssheet = sub;
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
}


/////////////////////////////// 

