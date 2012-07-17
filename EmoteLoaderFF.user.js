// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://www.reddit.com/r/RedditEmoteLoader
// @version        2.0
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

/* To Do:
-Search Feature
-Fix duplicate manager - testing
-Close button - Testing
-Extra CSS - to do later
*/

//Options

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];

var subs = subs= [ "mylittleandysonic1", "mlas1animotes", "mylittlewtf", "mylittlepony", "mlplounge", "idliketobeatree", "mylittlelivestream", "vinylscratch", "daylightemotes", "mylittlesquidward", "mylittlenopenopenope", "mylittlenanners", "mylittlenosleep", "mylittledamon", "thebestpony", "tbpimagedump", "roseluck", "applejack", "mylittlemusician", "mylittlecelestias", "mylittlechaos", "mylittlealcoholic", "mylittlelistentothis", "surprise", "pinkiepie", "twilightSparkle", "minuette", "lyra", "mylittlefoodmanes", "futemotes"];



//Environ variables - only change if something goes wrong.
var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var useExtraCSS = true;
var dispEmotePage = true;
var version = "2.0";
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
console.log("Reddit Emote Loader, version: " + version);

if(checkUpdate())
{
	loadSync(subs);
	//subsLoaded();
	if(dispEmotePage)
	{
		createLink();
	}
}
else
{
	loadFromStorage();
}

//
//End main
//

///////////////////////////////////////////////////////////////////////////////
//
//				Step 1: Check update
//				If up to date go to 2A, otherwise 2B
//
//////////////////////////////////////////////////////////////////////////////

function checkUpdate() //Returns true if needs to be updated
{
    try
	{

	//Check version
	var s_vers = window.localStorage.getItem("RELVersion");
	
	//console.log(s_vers);
	
	if(s_vers != version) return true;
	
	//Check subs

	if(subs != JSON.parse(window.localStorage.getItem("RELSubs"))) return false;
	

	//Check time
	var s_time = parseInt(window.localStorage.getItem("RELTime"));
	
	var d = new Date();
	
	var daysSinceUpdate = (d.getTime() - s_time) / 86400000; //1 day in ms
	
	//console.log(daysSinceUpdate);
	
	if(daysSinceUpdate > daysBeforeUpdate) return true;
	
	console.log("No update: last update " + daysSinceUpdate + " days ago");
	}
	catch(e)
	{
	    console.log("no cache found");
		
		return true;
	}
	
	return false;
}

///////////////////////////////////////////////////////////////////////////////
//
//				Step 2A: Load from Storage
//				Skip to step 6
//
//////////////////////////////////////////////////////////////////////////////

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
		console.log("LoadFromStorage1: ");
		console.log(e);
	}
	
	if(dispEmotePage)
	{
		emoteSubs = JSON.parse(window.localStorage.getItem("RELEmoteCodes"));
		textSubs = JSON.parse(window.localStorage.getItem("RELTextCodes"));
		eCodes = JSON.parse(window.localStorage.getItem("RELEmoteSub"));
		createLink();
	}

	
	
}

///////////////////////////////////////////////////////////////////////////////
//
//				Step 2B: Start loading
//				Go to step 3
//
//////////////////////////////////////////////////////////////////////////////


/////////////////////// Async ///////////////////////////////
function loadAsync(Subs) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{

	var sID = new Array();
	
		
	for(i = 0; i < Subs.length ; i++)
	{
	
		
		
		
		emoteSubs[i] = new Array();
		textSubs[i] = new Array();
		
	
				
		sID [i] = addSub(Subs[i]);
		


		waitForLoadAsync(sID[i], i);	
	}
	

	
}
function waitForLoadAsync(style, i)
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
/////////////////// Sync /////////////////////
var syncI;

function loadSync(Subs)
{
  syncI = 0;
  loadSyncI(0);
  
}
function loadSyncI(i)
{
    
    if(i >= subs.length)
	{
	    saveCSS();
		return;
	}
	console.log("Loading: " + subs[i]);
	
    emoteSubs[i] = new Array();
	textSubs[i] = new Array();
	waitForLoadSync(addSub(subs[i]), i);

}
function waitForLoadSync(style, i)
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
					syncI++;
					loadSyncI(syncI);
					clearInterval(ch[i]);
				}
			
		}, 10);
	
	}else{
		ff[i] = setInterval(function() {
			try {
		
			console.log("Waiting...");
			style.sheet.cssRules;
			addRules(style);
		    syncI++;
			loadSyncI(syncI);
			clearInterval(ff[i]);
			} catch (e){}
		}, 10); 
	}
}
//////////////// Both ///////////////////////////

function addSub(Sub)
{
    console.log("Added: " + Sub);
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
		//console.log(SubCss);
		style.sheet.disabled = true;	
	}
	
	
	head.appendChild(style);
	
	//console.log("Added: " + style.href);
	
	return style;


}

///////////////////////////////////////////////////////////////////////////////
//
//				Step 3: Add rules
//				Go to step 4
//
//////////////////////////////////////////////////////////////////////////////

function addRules(sub)
{
console.log("Adding: " + sub);

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
	
	console.log("Adding 2:" + subI);
	
	
	
	var srule;
	
	var emote = /a\[href\|?="\/[A-Za-z0-9!#]+"]/

    var srules = ssheet.cssRules;
	
	var erules = emoteSheet.cssRules;
	
	var tempRules = new Object();
	var tempCodes = new Object();
	
	var addRule = true;
	

	for(i = 0; i < srules.length; i++)
	{
	console.log("Rule " i + "/" + srules.length);

		srules = ssheet.cssRules;
		
		srule = srules[i];
		

		//Test if it is an emote
		if(emote.test(srule.selectorText))
		{
			var rcss = srule.cssText;
			var rstext = srule.selectorText;
			var stext = rstext;
			var ecode;
			
			addRule = true;
			//Filter out rules that use emotes elsewhere
			if(!ruleFilter(stext))
			{
			  addRule = false;
			  continue;
			}
            //Get text rules
            if(srule.cssText.indexOf("cursor: text") != -1 || srule.cssText.indexOf("color:") != -1 )
			{
				ecode = stext.substring(stext.indexOf("/"));
				ecode = ecode.substring(0, ecode.indexOf("\"]"));
                textSubs[subI][textSubs[subI].length] = ecode;
				tempCodes[ecode] = subs[subI];
			}
			
			stext = rstext;
			
			//Get emote rules
			if(srule.cssText.indexOf("background-image") != -1)
			{	
				while(stext.indexOf("a[href") > -1)
				{
					stext = stext.substring(stext.indexOf("a[href") + 5);
					ecode = stext.substring(stext.indexOf("/"));
					ecode = ecode.substring(0, ecode.indexOf("\"]")); 
					emoteSubs[subI][emoteSubs[subI].length] = ecode;
					tempCodes[ecode] = subs[subI];

				}
			}
			stext = rstext;
			
			//Test for repeats of loaded subs
			var good = false;
			while(stext.indexOf("a[href") > -1)
				{
				    stext = stext.substring(stext.indexOf("a[href") + 5);
					ecode = stext.substring(stext.indexOf("/"));
					ecode = ecode.substring(0, ecode.indexOf("\"]")); 
										
					if(eCodes.hasOwnProperty(ecode))
					{
						//addRule = false;
						console.log(ecode + ": duplicate");
						rcss = rcss.replace(ecode,"/dup_dump");
				        rstext = rstext.replace(ecode,"/dup_dump");
					}
					else
					{
					    good = true; //If all rules are dup_dump, don't add it.
					}
				}
			addRule = addRule && good;
			
			stext = rstext;
			
			
			
			//Fix inner sub repeats
			
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
			eCodes[rule] = subs[subI];
		}
	}
	
	

	
	}
	catch(e)
	{
		error = true;
		console.log("addRules1: ")
		console.log(e);
	}
	
	//Delete the style
	var del = document.getElementById(subs[subI])
	del.parentNode.removeChild(del);


	console.log("Done: " + sub.href);

	
	loaded++;
	
}

///////////////////////////////////////////////////////////////////////////////
//
//				Step 4: Setup extra CSS
//				Go to step 5
//
//////////////////////////////////////////////////////////////////////////////


function ExtraCSS() 
{
	var css = new Array();
	

	for(i = 0; i < css.length; i++)
	{
		emoteRules["exCSS" + i] = css[i];
	}

}

function emotePageCSS()
{
    var css = new Array();
	//Emote link
	css[0] = ".emotelink { color:blue; cursor:pointer; text-align:right; font-size:12px; position: fixed; bottom:20%; right: 10px; z-index: 1000; width:100px height:80px}";
	
	//Emote page
	css[1] = ".emoteoverlay {background-color:lightgrey; opacity: 1; position: fixed; top: 0; left: 0; height:100%;  width:100%; z-index: 1001;}";
	
	//Sub header text
	css[2] = ".subHeader{font-size:30px; text-align:center; color:black;}"
	
	//Sub display
	css[3] = ".subdisp {background-color:white; overflow-y: auto; position: fixed; top: 0; left: 20%; height:100%;  width:80%;}"
	
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
	
	//Emote div
	css[10] = ".ediv{ border:1px solid black; float:none !important;display:inline-block !important}"
	
	
	//Exit button
	css[11] = ".exitbtn {background-color:#F27777; width:100%; left: 0px; font-size:15px; text-align:center;}"
	
	css[12] = ".exitbtn:hover {background-color:yellow; cursor:pointer;}"
	//Search button
	css[13] = ".searchb {background-color:lightblue; width:200px; left: 0px; font-size:15px; text-align:center;}"
	
	css[14] = ".searchb:hover {background-color:yellow; cursor:pointer;}"
	
	//Search box
	
	css.push(".searchi {margin: 30px 10px 10px 10px;}");
	

	
	for(i = 0; i < css.length; i++)
	{
		emoteRules["epageCSS" + i] = css[i];
	}
}

///////////////////////////////////////////////////////////////////////////////
//
//				Step 5: Cache CSS
//				Done
//
//////////////////////////////////////////////////////////////////////////////

/*
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
*/

function saveCSS()
{

    
	if(error)
	{
		error = false;
		alert("Update Failed");
		return;
	}
	
	emotePageCSS();
	if(useExtraCSS)
	{
		ExtraCSS();
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
	window.localStorage.setItem("RELSubs",JSON.stringify(subs)); //Saves subs that are chosen
	window.localStorage.setItem("RELEmoteCSS",JSON.stringify(emoteRules)); //Save emotes in storage
	window.localStorage.setItem("RELEmoteCodes",JSON.stringify(emoteSubs));
	window.localStorage.setItem("RELEmoteSub",JSON.stringify(eCodes));
	window.localStorage.setItem("RELTextCodes",JSON.stringify(textSubs));
	
	console.log("All done");
	alert("Update sucessful\nPlease refresh the page");
	if(forced)
	{

		forced = false;
	}
	
}



///////////////////////////////////////////////////////////////////////////////
//
//				Step 6: Setup emote page
//				Done
//
//////////////////////////////////////////////////////////////////////////////

// link setup
function createLink()
{

	
	var link_e = document.createElement("div");
	link_e.id = "emoteLink";
	link_e.innerHTML = "Emotes";
	link_e.className = "emotelink";
	link_e.onclick = openEmotePage;
	document.body.appendChild(link_e);
	
	//console.log(emoteSheet);
					
	

}

//Open page
function openEmotePage()
{
	document.documentElement.style.overflow = 'hidden';

	var over = document.createElement("div");
	over.id = "EmoteOverlay";
	over.className = "emoteoverlay";
	//over.onclick = exitEmotePage;
	document.body.appendChild(over);
	
	var sub_disp = document.createElement("div");
	sub_disp.id = "SubDisplay";
	sub_disp.className = "subdisp";
	//sub_disp.onclick = exitEmotePage;
	over.appendChild(sub_disp);
	
	var sub_hold = document.createElement("div");
	sub_hold.className = "subhld";
	over.appendChild(sub_hold);
	
    var exit_btn = document.createElement("button");
		exit_btn.innerHTML = "Exit";
		exit_btn.className = "exitbtn";
		exit_btn.onclick = exitEmotePage;
		sub_hold.appendChild(exit_btn);
		
		
	var search_lnk = document.createElement("button");
		search_lnk.innerHTML = "Search" ;
		search_lnk.className = "forup";
		
		
		search_lnk.onclick = function() {
       searchPage("SubDisplay");
	};
	sub_hold.appendChild(search_lnk);
	
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

//Show emotes on page
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
	//s_title.onclick = exitEmotePage;
	s_title.innerHTML = "/r/" + subs[sub].toLowerCase();
	par.appendChild(s_title);
	
	
	for(i = 0; i < textSubs[sub].length; i++)
	{
		var emote_lnk = document.createElement("a");
		emote_lnk.href = textSubs[sub][i];
		emote_lnk.innerText = 	textSubs[sub][i];
		//emote_lnk.onclick = exitEmotePage;		
		par.appendChild(emote_lnk);
	}

	
		var emote_lnk = document.createElement("a");
		emote_lnk.href = "/sp";
		//emote_lnk.onclick = exitEmotePage;
		par.appendChild(emote_lnk);
		


	
	for(i = 0; i < emoteSubs[sub].length; i++)
	{

		var e_div = document.createElement("table");
		e_div.className = "ediv";
		par.appendChild(e_div);
		
		var emote_lnk = document.createElement("a");
		emote_lnk.href = emoteSubs[sub][i];
		emote_lnk.title = 	emoteSubs[sub][i];
		emote_lnk.onclick = function(){return false;}
		//emote_lnk.className = "clickdis";		
		e_div.appendChild(emote_lnk);
		
		var emote_id = document.createElement("p");
		emote_id.innerText = emoteSubs[sub][i] + "\n" + eCodes[emoteSubs[sub][i]];
		e_div.appendChild(emote_id);
		/*
		var sub_id = document.createElement("p");
		emote_id.innerText = eCodes[emoteSubs[sub][i]];
		e_div.appendChild(sub_id);
		*/
	}
	
	
	}catch(e){
	console.log("AddEmotes1:");	
	console.log(e);
	}


}

//Create search page
function searchPage(parID)
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
	s_title.className = "searchHeader";

	par.appendChild(s_title);
	
	var search_in = document.createElement("input");
	search_in.type = "text";
	search_in.id = "search_box";
	search_in.className = "searchi";
	s_title.appendChild(search_in);
	
	var search_button = document.createElement("button");
	search_button.className = "searchb";
	search_button.innerHTML = "Search";
	search_button.onclick = startSearch;
	s_title.appendChild(search_button);
	
	var s_title = document.createElement("div");
	s_title.id = "searchResults";

	par.appendChild(s_title);
}

function startSearch()
{
    addSearchResults(searchResults(".*" + document.getElementById("search_box").value + ".*"),"searchResults");
}

//Get search results
function searchResults(SearchRegex)
{
	var resEmotes = new Array();
	
	var search = RegExp(SearchRegex,"i");
	
	for(var code in eCodes)
	{
	    //Add it to the search results
	    if(search.test(code))
		{
		    resEmotes.push(code);
		}
	}
	
	return resEmotes;
}

//Display the results and their sub
function addSearchResults(results, parID)
{
    var par = document.getElementById(parID);
	if(par.hasChildNodes())
	{
		while(par.childNodes.length >= 1)
		{
			par.removeChild(par.firstChild);
		}
	
	}
	
	for(i = 0; i < results.length; i++)
	{
		var e_div = document.createElement("table");
		e_div.className = "ediv";
		par.appendChild(e_div);
		
		var emote_lnk = document.createElement("a");
		emote_lnk.href = results[i];
		emote_lnk.title = 	results[i];
		emote_lnk.onclick = function(){return false;}
		//emote_lnk.className = "clickdis";		
		e_div.appendChild(emote_lnk);
		
		var emote_id = document.createElement("p");
		emote_id.innerText = results[i] + "\n" + eCodes[results[i]];
		e_div.appendChild(emote_id);
		/*
		var sub_id = document.createElement("p");
		emote_id.innerText = eCodes[results[i]];
		e_div.appendChild(sub_id);
		*/
		
	}

}

//Force update the script
function forceUpdate()
{
	loaded = 0;
	forced = true;
	
	//Reset globals
emoteSubs = new Array(subs.length);
textSubs = new Array(subs.length);

emoteRules = new Object();
eCodes = new Object();
	
	loadSync(subs);
	//subsLoaded();
	exitEmotePage();
	
}

//Exit the page
function exitEmotePage()
{
	document.documentElement.style.overflow = 'visible';
	document.body.removeChild(document.getElementById("EmoteOverlay"));
	//alert(ecode);
}





///////////////////////////////////////////////////////////////////////////////
//
//				Utilities
//
//////////////////////////////////////////////////////////////////////////////

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


function ruleFilter(sel_text)
{
	var filter = new Array();
	var good = true;
	
	//Thumbnails
	filter[0] = /.thumbnail/
	
	filter[1] = /.expando/
	
	var i = 0;
	for( i = 0; i < filter.length; i++)
	{
	    if(filter[i].test(sel_text))
		{
		    good = false;
		}
	}
	
	return good;

}

