// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://www.reddit.com/r/RedditEmoteLoader
// @version        1.2
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

/* Woking on:

-Disable clicking X
-emote Table 
-Disable scroll


*/

//Options

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];
var subs=[ "mylittleandysonic1", "mlas1animotes", "mylittlewtf", "idliketobeatree", "mylittlelivestream", "vinylscratch", "daylightemotes", "mylittlesquidward", "mylittlenopenopenope", "mylittlenanners", "mylittlenosleep", "mylittledamon", "thebestpony", "tbpimagedump", "roseluck", "applejack", "mylittlemusician", "mylittlecelestias", "mylittlechaos", "mylittlealcoholic", "mylittlelistentothis", "surprise", "pinkiepie", "twilightSparkle", "minuette", "lyra", "mlplounge"];



//Environ variables - only change if something goes wrong.
var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var useExtraCSS = true;
var dispEmotePage = true;
var version = "1.2.0";
var daysBeforeUpdate = 3;
//Do not change below this line


var emoteStyle = document.createElement('style');
document.getElementsByTagName('head')[0].appendChild(emoteStyle);
var emoteSheet = document.styleSheets[document.styleSheets.length - 1];

var ch = new Array();
var ff = new Array();

var emoteSubs = new Array(subs.length);
var textSubs = new Array(subs.length);
var emoteRules = new Object();
var eCodes = new Object();

var loaded = 0;
var forced = false;
var error = false;

//
//Start main
//
if(checkUpdate())
{
	loadSubs(subs);
	subsLoaded();
	if(dispEmotePage)
	{
		createLink();
	}
}
else
{
	loadFromStorage();
}
	if(useExtraCSS)
	{
		CSSFlags();
	}




function checkUpdate() //Returns true if needs to be updated
{
	//Check version
	var s_vers = window.localStorage.getItem("RELVersion");
	
	console.log(s_vers);
	
	if(s_vers != version) return true;
	
	//Check time
	var s_time = parseInt(window.localStorage.getItem("RELTime"));
	
	var d = new Date();
	
	var daysSinceUpdate = (d.getTime() - s_time) / 86400000; //1 day in ms
	
	//console.log(daysSinceUpdate);
	
	if(daysSinceUpdate > daysBeforeUpdate) return true;
	
	console.log("No update: last update " + daysSinceUpdate + " days ago");
	
	return false;
}

function loadFromStorage()
{
	var emoteCSS = window.localStorage.getItem("RELEmoteCSS");
	//console.log(emoteCSS);
	try{
	JSON.parse(emoteCSS, function (key, value) 
	{
		//console.log(value);
		emoteSheet.insertRule(value,0);
	});
	} catch(e)
	{
		console.log("101: ");
		console.log(e);
	}
	
	if(dispEmotePage)
	{
		emoteSubs = JSON.parse(window.localStorage.getItem("RELEmoteCodes"));
		textSubs = JSON.parse(window.localStorage.getItem("RELTextCodes"));
		createLink();
	}

	
	
}


function subsLoaded()
{
	var sl = setInterval(function() 
	{
		//console.log(loaded);
		if(loaded >= subs.length)
		{
			saveCSS();
			clearInterval(sl);			
		}	
	
	},250);
	
}

function saveCSS()
{
	if(error)
	{
		error = false;
		alert("Update Failed");
		return;
	}
	
	for(var rule in emoteRules)
	{
		//console.log(rule);
		if(emoteRules.hasOwnProperty(rule))
		{
			emoteSheet.insertRule(emoteRules[rule],0);
			
		}	
	
	}
	var d = new Date();
	
	window.localStorage.setItem("RELTime",d.getTime()); //Save update time
	window.localStorage.setItem("RELVersion",version); //Version
	window.localStorage.setItem("RELEmoteCSS",JSON.stringify(emoteRules)); //Save emotes in storage
	window.localStorage.setItem("RELEmoteCodes",JSON.stringify(emoteSubs));
	window.localStorage.setItem("RELTextCodes",JSON.stringify(textSubs));
	
	console.log("All done");
	if(forced)
	{
		alert("Update sucessful");
		forced = false;
	}
	

}

function loadSubs(Subs) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{

	var sID = new Array();
	
		
	for(i = 0; i < Subs.length ; i++)
	{
	
		
		
		
		emoteSubs[i] = new Array();
		textSubs[i] = new Array();
		
	
				
		sID [i] = addSub(Subs[i]);
		


		waitForLoad(sID[i], i);	
	}
	

	
}

function addSub(Sub)
{
	var d = new Date();
	var t = d.getTime(); //Ensure fresh CSS
	var head = document.getElementsByTagName("head")[0];
	var SubCss = "http://" + document.domain + "/r/" + Sub + '/stylesheet.css?v=' + t;
	
	var style;
	
	if(chrome)
	{
	
		style =	document.createElement('link');
		style.type = 'text/css'
		style.rel = 'stylesheet';
		style.id = Sub;
		
		style.href = SubCss;
		style.media = "print";
	
	}
	else
	{
		style = document.createElement('style');
		style.textContent = '@import "' + SubCss + '"';
		console.log(SubCss);
		style.sheet.disabled = true;	
	}
	
	
	head.appendChild(style);
	
	//console.log("Added: " + style.href);
	
	return style;


}



function waitForLoad(style, i)
{
	if(chrome)
	{
		var cssnum = document.styleSheets.length;
		ch[i] = setInterval(function() {
			var sheet;
				sheet = getStyle(style);
				if(sheet != -1)
				{
					addRules(style);
					
					clearInterval(ch[i]);
				}
			
		}, 10);
	
	}else{
		ff[i] = setInterval(function() {
			try {
		
		
			style.sheet.cssRules;
			addRules(style);
		
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
			
			return document.styleSheets[i];	
		}
	}
	return -1;

}

function getSub(style)
{
	var subMatch;
	for(i = 0; i < subs.length; i++)
	{
		subMatch = new RegExp(subs[i])
		if(subMatch.test(style.href))
		{
			return i;
		}
		
	
	}
	
	return 0;

}

function addRules(sub)
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
			console.log("315: " + sub.href);
			error = true;
			return;
		
		}
		
	}
	else
	{
	ssheet = sub.sheet.cssRules[0].styleSheet;
	}
	
	var subI = getSub(ssheet);
	
	
	
	var srule;
	
	var emote = /a\[href\|?="\/[A-Za-z0-9!#]+"]/

    var srules = ssheet.cssRules;
	
	var erules = emoteSheet.cssRules;
	
	var tempRules = new Object();
	var tempCodes = new Object();
	
	var addRule = true;
	
	
	for(i = 0; i < srules.length; i++)
	{
		srules = ssheet.cssRules;
		
		srule = srules[i];
		

		//Test if it is an emote
		if(emote.test(srule.selectorText))
		{
			var rcss = srule.cssText;
			var stext = srule.selectorText;
			var ecode;
			
			



			if(srule.cssText.indexOf("background-image") != -1) //Images
			{	
				addRule = true;
				
				while(stext.indexOf("a[href") > -1)
				{
					stext = stext.substring(stext.indexOf("a[href") + 5);
					ecode = stext.substring(stext.indexOf("/"));
					ecode = ecode.substring(0, ecode.indexOf("\"]")); 
										
					if(eCodes.hasOwnProperty(ecode))
					{
						addRule = false;
					}
					

					emoteSubs[subI][emoteSubs[subI].length] = ecode;
					tempCodes[ecode] = "Exists";
				}
			}
			if(srule.cssText.indexOf("cursor: text") != -1) //Text
			{
				ecode = stext.substring(stext.indexOf("/"));
				ecode = ecode.substring(0, ecode.indexOf("\"]")); 
				
				if(eCodes.hasOwnProperty(ecode))
				{
					addRule = false;
				}
				
				textSubs[subI][textSubs[subI].length] = ecode;
				tempCodes[ecode] = "Exists";
			}
			
			//Test for repeat
			stext = srule.selectorText;
			if(addRule)
			{
			
				while(tempRules.hasOwnProperty(stext))
				{
					stext += "d";
				}
				//Add it
				tempRules[stext] = rcss;
			}
			
			
		
		}
		
	
	}

	//console.log(ssheet);
	
	//Merge rules / codes
	for(var rule in tempRules)
	{
		if(tempRules.hasOwnProperty(rule))
		{
			emoteRules[rule] = tempRules[rule];
		}
	}
	
		for(var rule in tempCodes)
	{
		if(tempCodes.hasOwnProperty(rule))
		{
			eCodes[rule] = "Exists";
		}
	}
	
	

	
	}
	catch(e)
	{
		error = true;
		console.log("414: " + e)
		
	}
	
	//Delete the style
	var del = document.getElementById(subs[subI])
	del.parentNode.removeChild(del);


	console.log("Done: " + sub.href);

	
	loaded++;
	

}


//// Special CSS flags ////



function CSSFlags() //TODO: Replace with stylesheet
{
	var css = new Array();
	
	//Dance (-d)
	css[0] = "a[href*=\'-d\']:hover {\
			-moz-transform: scaleX(-1);\
			-o-transform: scaleX(-1);\
			-webkit-transform: scaleX(-1);\
			transform: scaleX(-1);\
			}";
	
	//Reverse (-r)
	
	css[1] = "a[href*=\'-r\'] {\
			-moz-transform: scaleX(-1);\
			-o-transform: scaleX(-1);\
			-webkit-transform: scaleX(-1);\
			transform: scaleX(-1);\
			}";
			
	//Flip (-f)
	
		css[2] = "a[href*=\'-f\'] {\
			-moz-transform: scaleY(-1);\
			-o-transform: scaleY(-1);\
			-webkit-transform: scaleY(-1);\
			transform: scaleY(-1);\
			}";
	
	//Inline (-inp)
	
		css[3] = "a[href*=\'-inp\'] {float:none !important;display:inline-block !important}";
		
	//Right (-ar)
	
		css[4] = "a[href*=\'-ar\'] {float:right !important;display:inline-block !important}";
		
	//Rotates (-45/90...)
	var j = 5;
	for(i = 45; i < 360; i+= 45)
	{
		css[j] = "a[href*=\'-" + i + "\']{-moz-transform:rotate(" + i + "deg)scaleX(1);-o-transform:rotate(" + i + "deg)scaleX(1);-webkit-transform:rotate(" + i + "deg)scaleX(1);image-rendering:-moz-crisp-edges}"			
		j++;
	}		

	for(i = 0; i < css.length; i++)
	{
		emoteSheet.insertRule("a[href^=\'/\']" + css[i], 0);
	}

}

//// Emote page ////
function createLink()
{
	var css = new Array();
	//Emote link
	css[0] = ".emotelink { color:blue; cursor:pointer; text-align:right; font-size:12px; position: fixed; bottom:20%; right: 10px; z-index: 1000; width:100px height:80px}";
	
	//Emote page
	css[1] = ".emoteoverlay {background-color:lightgrey; opacity: 1; position: fixed; top: 0; left: 0; height:100%;  width:100%; z-index: 1001;}";
	
	//Sub header text
	css[2] = ".subHeader{font-size:30px; text-align:center; color:black;}"
	
	//Sub display
	css[3] = ".subdisp {background-color:white; overflow-x: visible !important; overflow-y: auto; position: fixed; top: 0; left: 20%; height:100%;  width:80%;}"
	
	//Sub holder
	css[4] = ".subhld {background-color:lightgrey; opacity: 1; position: fixed; top: 0; left: 0; height:100%;  width:20%; z-index: 1001; overflow : auto;}";

	//Sub links
	css[5] = ".sublnk {background-color:lightblue; width:100%; left: 0px; font-size:15px; text-align:center;}"
	
	css[6] = ".sublnk:hover {background-color:yellow; cursor:pointer;}"
	
	//Force update
	css[7] = ".forup {background-color:white; width:100%; left: 0px; font-size:15px; text-align:center;}"
	
	css[8] = ".forup:hover {background-color:yellow; cursor:pointer;}"
	
	//Disable clicking
	css[9] = ".clickdis{  pointer-events: none;   cursor: default; }"

	
	for(i = 0; i < css.length; i++)
	{
		emoteSheet.insertRule(css[i], 0);
	}
	
	var link_e = document.createElement("div");
	link_e.id = "emoteLink";
	link_e.innerHTML = "Emotes";
	link_e.className = "emotelink";
	link_e.onclick = openEmotePage;
	document.body.appendChild(link_e);
	
	//console.log(emoteSheet);
					
	

}

function openEmotePage()
{
	var over = document.createElement("div");
	over.id = "EmoteOverlay";
	over.className = "emoteoverlay";
	//over.onclick = exitEmotePage;
	document.body.appendChild(over);
	
	var sub_disp = document.createElement("div");
	sub_disp.id = "SubDisplay";
	sub_disp.className = "subdisp";
	sub_disp.onclick = exitEmotePage;
	over.appendChild(sub_disp);
	
	var sub_hold = document.createElement("div");
	sub_hold.className = "subhld";
	over.appendChild(sub_hold);
	

	
	var i = 0;
	while(i < subs.length)
	{
		var j;
		j = i;
		var sub_lnk = document.createElement("button");
		sub_lnk.innerHTML = subs[j].toLowerCase() ;
		sub_lnk.className = "sublnk";
		
		
		sub_lnk.onclick = (function(opt) {
    return function() {
       addEmotes(opt,"SubDisplay");
    };
	})(j);  //Yo dawg I heard you liked functions
		
		sub_hold.appendChild(sub_lnk);
		i++;
	}
	
	var force_up = document.createElement("button");
		force_up.innerHTML = "Force Update";
		force_up.className = "forup";
		force_up.onclick = forceUpdate;
	sub_hold.appendChild(force_up);
	
	

}


function addEmotes(sub, parID)
{

	try
	{
	var par = document.getElementById(parID);
	if(par.hasChildNodes())
	{
		while(par.childNodes.length >= 1)
		{
			par.removeChild(par.firstChild);
		}
	
	}

	var s_title = document.createElement("div");
	s_title.className = "subHeader";
	s_title.onclick = exitEmotePage;
	s_title.innerHTML = "/r/" + subs[sub].toLowerCase();
	par.appendChild(s_title);
	
	
	for(i = 0; i < textSubs[sub].length; i++)
	{
		var emote_lnk = document.createElement("a");
		emote_lnk.href = textSubs[sub][i];
		emote_lnk.innerText = 	textSubs[sub][i];
		emote_lnk.onclick = exitEmotePage;		
		par.appendChild(emote_lnk);
	}

	
		var emote_lnk = document.createElement("a");
		emote_lnk.href = "/sp";
		emote_lnk.onclick = exitEmotePage;
		par.appendChild(emote_lnk);
		
		var e_table = document.createElement("table");
		par.appendChild(e_table)

		
		for(i = 0; i < emoteSubs[sub].length; i++)
	{
		var e_td = document.createElement("td");
		e_table.appendChild(e_td);
		
		var emote_lnk = document.createElement("a");
		emote_lnk.href = emoteSubs[sub][i];
		emote_lnk.title = 	emoteSubs[sub][i];
		emote_lnk.onclick = exitEmotePage;	
		//emote_lnk.className = "clickdis";		
		e_td.appendChild(emote_lnk);	
		
	}
	
	
	}catch(e){console.log("686: " + e);}


}

function forceUpdate()
{
	loaded = 0;
	forced = true;
	emoteRules = new Object();
	eCodes = new Object();
	
	loadSubs(subs);
	subsLoaded();
	exitEmotePage();
	
}

function exitEmotePage()
{
	document.body.removeChild(document.getElementById("EmoteOverlay"));
	//alert(ecode);
}



