// ==UserScript==
// @name           Test
// @namespace      http://notawebsite.com
// @include        http://www.reddit.com/*
// ==/UserScript==

var subs=["MLPlounge","mylittlelistentothis"];
/*
var sheet = document.createElement('style')
sheet.innerHTML = 
"div.titlebox \
{								\
        background-color: purple;\
}								\
";			
document.body.appendChild(sheet);
*/

GM_log("purple");
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
		
		i++;
	}
	for(j = 0; j < i; j++)
	{
		waitForLoad(sID[j]);
	}


}




function waitForLoad(style)
{
	var fi = setInterval(function() {
	try {
		count++;
		GM_log(count);
		
		
		style.sheet.cssRules;
		remRules(style);
		
		clearInterval(fi);
  } catch (e){GM_log(e);}
}, 10);  
}



function addSub(Sub) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement('style');
	var SubCss = 'http://www.reddit.com/r/' + Sub + '/stylesheet.css';
	//style.id = Sub;
	style.textContent = '@import "' + SubCss + '"';
	
	head.appendChild(style);
	
	return style;


}
/*
function getStyle(sub)
{
	for(i=0; i < document.styleSheets.length; i++)
	{
		if(document.styleSheets[i].ownerNode.id == sub) return document.styleSheets[i];	
	}
	return -1;

}
*/


function remRules(sub)
{
	var ssheet = sub.sheet.cssRules[0].styleSheet;
	
	if(ssheet == -1){
		GM_log("No such sub:"+sub);
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

