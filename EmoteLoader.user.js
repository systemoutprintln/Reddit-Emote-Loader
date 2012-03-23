// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://www.reddit.com/r/RedditEmoteLoader
// @version        0.7.1
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
var walked = false;

var emoteStyle = document.createElement('style');
document.getElementsByTagName('head')[0].appendChild(emoteStyle);

var emoteSheet = document.styleSheets[document.styleSheets.length - 1];

var ch = new Array();
var ff = new Array();

var emoteCodes = new Array();
var textCodes = new Array();

useSubs(subs);

if(useExtraCSS)
{
	CSSFlags();
}
createLink();





function useSubs(Subs) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{
	//alert(chrome);
	var sID = new Array();
		
	for(i = 0; i < Subs.length; i++)
	{
		var sReg = new RegExp(Subs[i].toLowerCase());
		if(sReg.test(document.URL.toLowerCase()))
		{		
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
					continue;
				}
			
			}
		}
		var SubCss = document.location.protocol + "//" + document.domain + "/r/" + Subs[i] + '/stylesheet.css';
		
		GM_log("Added: " + SubCss);
		
	
				
		sID [i] = addSub(SubCss);
		

		if(chrome){
			//sID[i].disabled = true;
		}
		else{
			sID[i].sheet.disabled = true;
		}

		waitForLoad(sID[i], i);	
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
	try{
	if(chrome)
	{
		sub.media = "all";
		ssheet = getStyle(sub);
		if(ssheet == -1)
		{
			disable(sub)
			return;
		
		}
		
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
			emoteSheet.insertRule(srule.cssText,0); //Insert rule into our sheet
			var stext = srule.selectorText;
			
			if(srule.cssText.indexOf("background-image") != -1) //Images
			{	
				var ecode 
				while(stext.indexOf("a[href") > -1)
				{
					stext = stext.substring(stext.indexOf("a[href") + 5);
					ecode = stext.substring(stext.indexOf("/"));
					ecode = ecode.substring(0, ecode.indexOf("\"]")); 
					//GM_log(ecode);
					emoteCodes[emoteCodes.length] = ecode;
				}
			}
			if(srule.cssText.indexOf("cursor: text") != -1) //Text
			{
				ecode = stext.substring(stext.indexOf("/"));
				ecode = ecode.substring(0, ecode.indexOf("\"]")); 
				//GM_log(ecode);
				textCodes[textCodes.length] = ecode;	
			}
			
		
		} else
		{
			//ssheet.deleteRule(i);
			//i--;			
		}
		
	
	}

	GM_log(ssheet);
	
	
	}
	catch(e)
	{
		GM_log(e)
		
	}
	
	
	
	if(chrome)
	{
		sub.media = "print";
		sub.disabled = true;
		GM_log("Done: " + sub.href);
	}
	else
	{
		sub.sheet.disabled = true;	
	}
	

}

function disable(style)
{
	//GM_log("Error with " + style.href);
	var Hlinks = document.getElementsByTagName("link");
	for(i = 0; i < Hlinks.length; i++)
	{
		if(Hlinks[i].getAttribute("href") == style.href)
		{
			Hlinks[i].parentNode.removeChild(Hlinks[i]);
			
		}
	
	}

}

function styleWalker()
{
	if(!walked){
	ssheets = document.styleSheets;
	for(i = 0; i < ssheets.length; i++)
	{
		GM_log(i + " = " + ssheets[i].href);
		GM_log(ssheets[i]);
	}
	}
	walked = true;
	

}


//// Special CSS flags ////



function CSSFlags()
{
	var css = new Array();
	//Emote link
	css[0] = ".emotelink { color:blue; text-align:right; font-size:12px; position: fixed; top:50px; right: 10px; z-index: 1000; width:100px height:80px}";
	
	//Emote page
	css[1] = ".emoteoverlay {background-color:white; opacity: 1; position: fixed; top: 0; left: 0; height:100%;  width:100%; z-index: 1001;overflow : auto; }";
	
	
	//Dance (-d)
	css[2] = "a[href*=\'-d\']:hover {\
			-moz-transform: scaleX(-1);\
			-o-transform: scaleX(-1);\
			-webkit-transform: scaleX(-1);\
			transform: scaleX(-1);\
			}";
	
	//Reverse (-r)
	
	css[3] = "a[href*=\'-r\'] {\
			-moz-transform: scaleX(-1);\
			-o-transform: scaleX(-1);\
			-webkit-transform: scaleX(-1);\
			transform: scaleX(-1);\
			}";
			
			
		

	for(i = 0; i < css.length; i++)
	{
		emoteSheet.insertRule(css[i], 0);
	}

}

//// Emote page ////
function createLink()
{
	var link_e = document.createElement("div");
	link_e.id = "emoteLink";
	link_e.innerText = "Emotes";
	link_e.className = "emotelink";
	link_e.style = "cursor:hand";
	link_e.onclick = openEmotePage;
	document.body.appendChild(link_e);
					
	

}

function openEmotePage()
{
	var over = document.createElement("div");
	over.id = "EmoteOverlay";
	over.className = "emoteoverlay";
	over.onclick = exitEmotePage;
	document.body.appendChild(over);
	
	
	for(i = 0; i < emoteCodes.length; i++)
	{
		var emote_lnk = document.createElement("a");
		emote_lnk.href = emoteCodes[i];
		emote_lnk.title = 	emoteCodes[i];
		emote_lnk.onclick = exitEmotePage;		
		over.appendChild(emote_lnk);
	}
		for(i = 0; i < textCodes.length; i++)
	{
		var emote_lnk = document.createElement("a");
		emote_lnk.href = textCodes[i];
		emote_lnk.innerText = 	textCodes[i];
		emote_lnk.onclick = exitEmotePage;		
		over.appendChild(emote_lnk);
	}
	

}

function exitEmotePage()
{
	document.body.removeChild(document.getElementById("EmoteOverlay"));
	//alert(ecode);
}



