// ==UserScript==
// @name           Reddit Emote Loader
// @namespace      http://www.reddit.com/r/RedditEmoteLoader
// @version        3.5
// @include        http://www.reddit.com/*
// @include        http://reddit.com/*
// @include        http://*.reddit.com/*
// ==/UserScript==

/* To Do:
-Progress bar at top for updating
*/

//Options

// To add a sub add a comma then the sub name in quotes after the last entry
// For example with MLPLounge it should look like the following:
// var subs=["mylittlepony","MLPlounge"];

var subs= [ "mylittleandysonic1", "mlas1animotes", "mylittlewtf",  "mlplounge", "mylittlepony", "idliketobeatree", "mylittlelivestream", "vinylscratch", "daylightemotes", "mylittlesquidward", "mylittlenopenopenope", "mylittlenanners", "mylittlenosleep", "mylittledamon", "thebestpony", "tbpimagedump", "roseluck", "applejack", "mylittlemusician", "mylittlecelestias", "mylittlechaos", "mylittlealcoholic", "mylittlelistentothis", "surprise", "pinkiepie", "twilightSparkle", "minuette", "lyra", "MyLittleSports", "mylittlefoodmanes", "futemotes", "mylittlecombiners", "MyLittleBannerTest"];



//Environ variables - only change if something goes wrong.
var chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var useExtraCSS = true;
var dispEmotePage = true;
var version = "3.5.0";
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
//Testing
showPB(1);
if(checkUpdate())
{
    //alert("Loading emotes...");
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

	if(JSON.stringify(subs) != window.localStorage.getItem("RELSubs")) return true;


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

	var r = Math.floor(Math.random()*10000); //Get random number
	var head = document.getElementsByTagName("head")[0];
	var SubCss = "http://" + document.domain + "/r/" + Sub + '/stylesheet.css?v=' + r;

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

	var ssheet 
	var isCss;
	try{
	if(chrome)
	{
		sub.media = "all";
		ssheet = getStyle(sub);
		if(ssheet == -1)
		{
			console.log("addRules: " + sub.href);
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
	var emcss = /[href\*="[A-Za-z0-9!#]+\-combine"]/ //For combined emotes

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
		else if(emcss.test(srule.selectorText))
		{
		    var rccss = srule.cssText;
			var cstext = srule.selectorText;
			while(tempRules.hasOwnProperty(cstext))
			{
				cstext += "d";
			}
			//Add it
			tempRules[cstext] = rccss;
		
		
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
			if(!eCodes.hasOwnProperty(rule)) //Prevent overwrite
			{
				eCodes[rule] = subs[subI];
			}
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
    var ecssar = ExCss.split("\n");
	
	for(i=0; i < ecssar.length; i++)
	{
	    emoteRules["exCSS" + i] = ecssar[i];
	}
	
	if(chrome)
	{
	   ecssar = ecssCH.split("\n");
	}
	else
	{
	    ecssar = ecssFF.split("\n");
	}
	
	for(i=0; i < ecssar.length; i++)
	{
	    emoteRules["exCSSsp" + i] = ecssar[i];
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

	emotePageCSS();
	if(useExtraCSS)
	{
		ExtraCSS();
	}
    try{
	for(var rule in emoteRules)
	{
		if(emoteRules.hasOwnProperty(rule))
		{
		    //console.log(rule);
			emoteSheet.insertRule(emoteRules[rule],0);
			

		}	

	}
	}
	catch(e)
	{
	    console.log("SaveCSS");
		console.log(e);
		error = true;
	}
	
		if(error)
	{
		error = false;
		alert("Update Failed");
		return;
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
	//alert("Update sucessful\nPlease refresh the page");
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
		emote_lnk.onclick = function(){return false;}
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
		emote_lnk.onclick = (function(opt) {
    return function() {
       emoteClick(opt);
	   return false;
    };
	return false;})(emoteSubs[sub][i]); 
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
function emoteClick(ecode)
{
    var pb = prompt("Copy and paste the following emote code:","[](" + ecode +")");
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
		emote_lnk.onclick = (function(opt) {
    return function() {
       emoteClick(opt);
	   return false;
    };
	})(results[i]);
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
//				Progress Bar
//
//////////////////////////////////////////////////////////////////////////////
var max;
var cur;

function showPB(nSteps)
{
    var progbar = document.createElement("div");
	progbar.id = "ProgBar";
	progbar.style = "posistion: absolute; height: 5%; bottom: 0px; left: 0px;";
	progbar.innerhtml = "Please wait: Emotes loading";
	document.body.appendChild(progbar);
	
}

function advancePB()
{

}

function hidePB()
{

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

//////////////////////////////////////////////////////// Extra CSS //////////////////////////////////////////////////////

var ExCss = "a[href^=\"/\"][href*=\"-blink!\"] {text-decoration: blink !important}\n\
a[href^=\"/\"][href*=\"-comicsans!\"] {font-family: \"Comic-Sans MS\", cursive}\n\
a[href^=\"/\"][href*=\"-impact!\"] {font-family: Impact, Charcoal, sans-serif}\n\
a[href^=\"/\"][href*=\"-tahoma!\"] {font-family: Tahoma, Geneva, sans-serif}\n\
a:hover[href^=\'/\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(0deg)scaleX(1);-o-transform:rotate(0deg)scaleX(1);-webkit-transform:rotate(0deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(45deg)scaleX(1);-o-transform:rotate(45deg)scaleX(1);-webkit-transform:rotate(45deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(90deg)scaleX(1);-o-transform:rotate(90deg)scaleX(1);-webkit-transform:rotate(90deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(135deg)scaleX(1);-o-transform:rotate(135deg)scaleX(1);-webkit-transform:rotate(135deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(180deg)scaleX(1);-o-transform:rotate(180deg)scaleX(1);-webkit-transform:rotate(180deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(225deg)scaleX(1);-webkit-transform:rotate(225deg)scaleX(1);-o-transform:rotate(225deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(270deg)scaleX(1);-o-transform:rotate(270deg)scaleX(1);-webkit-transform:rotate(270deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(315deg)scaleX(1);-o-transform:rotate(315deg)scaleX(1);-webkit-transform:rotate(315deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-d\']{-moz-transform:rotate(0deg)scaleX(-1);-o-transform:rotate(0deg)scaleX(-1);-webkit-transform:rotate(0deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-d\']{-moz-transform:rotate(45deg)scaleX(-1);-o-transform:rotate(45deg)scaleX(-1);-webkit-transform:rotate(45deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-d\']{-moz-transform:rotate(90deg)scaleX(-1);-o-transform:rotate(90deg)scaleX(-1);-webkit-transform:rotate(90deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-d\']{-moz-transform:rotate(135deg)scaleX(-1);-webkit-transform:rotate(135deg)scaleX(-1);-o-transform:rotate(135deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-d\']{-moz-transform:rotate(180deg)scaleX(-1);-o-transform:rotate(180deg)scaleX(-1);-webkit-transform:rotate(180deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-d\']{-moz-transform:rotate(225deg)scaleX(-1);-o-transform:rotate(225deg)scaleX(-1);-webkit-transform:rotate(225deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-d\']{-moz-transform:rotate(270deg)scaleX(-1);-o-transform:rotate(270deg)scaleX(-1);-webkit-transform:rotate(270deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-d\']{-moz-transform:rotate(315deg)scaleX(-1);-o-transform:rotate(315deg)scaleX(-1);-webkit-transform:rotate(315deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(45deg)scaleX(1);-webkit-transform:rotate(45deg)scaleX(1);-o-transform:rotate(45deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(90deg)scaleX(1);-webkit-transform:rotate(90deg)scaleX(1);-o-transform:rotate(90deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(135deg)scaleX(1);-webkit-transform:rotate(135deg)scaleX(1);-o-transform:rotate(135deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(180deg)scaleX(1);-webkit-transform:rotate(180deg)scaleX(1);-o-transform:rotate(180deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(225deg)scaleX(1);-webkit-transform:rotate(225deg)scaleX(1);-o-transform:rotate(225deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(270deg)scaleX(1);-webkit-transform:rotate(270deg)scaleX(1);-o-transform:rotate(270deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-d\']{-moz-transform:rotate(315deg)scaleX(1);-webkit-transform:rotate(315deg)scaleX(1);-o-transform:rotate(315deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(45deg)scaleX(-1);-webkit-transform:rotate(45deg)scaleX(-1);-o-transform:rotate(45deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(90deg)scaleX(-1);-webkit-transform:rotate(90deg)scaleX(-1);-o-transform:rotate(90deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(135deg)scaleX(-1);-webkit-transform:rotate(135deg)scaleX(-1);-o-transform:rotate(135deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(180deg)scaleX(-1);-o-transform:rotate(180deg)scaleX(-1);-webkit-transform:rotate(180deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(225deg)scaleX(-1);-o-transform:rotate(225deg)scaleX(-1);-webkit-transform:rotate(225deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(270deg)scaleX(-1);-o-transform:rotate(270deg)scaleX(-1);-webkit-transform:rotate(270deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\']{-moz-transform:rotate(315deg)scaleX(-1);-o-transform:rotate(315deg)scaleX(-1);-webkit-transform:rotate(315deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-spin],a:hover[href^=\'/\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin 2s infinite linear;-webkit-animation:spin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-45 2s infinite linear;-webkit-animation:spin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-90 2s infinite linear;-webkit-animation:spin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-135 2s infinite linear;-webkit-animation:spin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-180 2s infinite linear;-webkit-animation:spin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-225 2s infinite linear;-webkit-animation:spin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-270 2s infinite linear;-webkit-animation:spin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-315 2s infinite linear;-webkit-animation:spin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-r 2s infinite linear;-webkit-animation:spin-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-45-r 2s infinite linear;-webkit-animation:spin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-90-r 2s infinite linear;-webkit-animation:spin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-135-r 2s infinite linear;-webkit-animation:spin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-180-r 2s infinite linear;-webkit-animation:spin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-225-r 2s infinite linear;-webkit-animation:spin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-270-r 2s infinite linear;-webkit-animation:spin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-315-r 2s infinite linear;-webkit-animation:spin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-45 2s infinite linear;-webkit-animation:spin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-90 2s infinite linear;-webkit-animation:spin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-135 2s infinite linear;-webkit-animation:spin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-180 2s infinite linear;-webkit-animation:spin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-225 2s infinite linear;-webkit-animation:spin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-270 2s infinite linear;-webkit-animation:spin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-315 2s infinite linear;-webkit-animation:spin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-45-r 2s infinite linear;-webkit-animation:spin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-90-r 2s infinite linear;-webkit-animation:spin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-135-r 2s infinite linear;-webkit-animation:spin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-180-r 2s infinite linear;-webkit-animation:spin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-225-r 2s infinite linear;-webkit-animation:spin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-270-r 2s infinite linear;-webkit-animation:spin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=-spin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-spin]{-moz-animation:spin-315-r 2s infinite linear;-webkit-animation:spin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-xspin],a:hover[href^=\'/\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin 2s infinite linear;-webkit-animation:xspin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-45 2s infinite linear;-webkit-animation:xspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-90 2s infinite linear;-webkit-animation:xspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-135 2s infinite linear;-webkit-animation:xspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-180 2s infinite linear;-webkit-animation:xspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-225 2s infinite linear;-webkit-animation:xspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-270 2s infinite linear;-webkit-animation:xspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-315 2s infinite linear;-webkit-animation:xspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-r 2s infinite linear;-webkit-animation:xspin-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-45-r 2s infinite linear;-webkit-animation:xspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-90-r 2s infinite linear;-webkit-animation:xspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-135-r 2s infinite linear;-webkit-animation:xspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-180-r 2s infinite linear;-webkit-animation:xspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-225-r 2s infinite linear;-webkit-animation:xspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-270-r 2s infinite linear;-webkit-animation:xspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-315-r 2s infinite linear;-webkit-animation:xspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-45 2s infinite linear;-webkit-animation:xspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-90 2s infinite linear;-webkit-animation:xspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-135 2s infinite linear;-webkit-animation:xspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-180 2s infinite linear;-webkit-animation:xspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-225 2s infinite linear;-webkit-animation:xspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-270 2s infinite linear;-webkit-animation:xspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-315 2s infinite linear;-webkit-animation:xspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-45-r 2s infinite linear;-webkit-animation:xspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-90-r 2s infinite linear;-webkit-animation:xspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-135-r 2s infinite linear;-webkit-animation:xspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-180-r 2s infinite linear;-webkit-animation:xspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-225-r 2s infinite linear;-webkit-animation:xspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-270-r 2s infinite linear;-webkit-animation:xspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=-xspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-xspin]{-moz-animation:xspin-315-r 2s infinite linear;-webkit-animation:xspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-yspin],a:hover[href^=\'/\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin 2s infinite linear;-webkit-animation:yspin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-45 2s infinite linear;-webkit-animation:yspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-90 2s infinite linear;-webkit-animation:yspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-135 2s infinite linear;-webkit-animation:yspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-180 2s infinite linear;-webkit-animation:yspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-225 2s infinite linear;-webkit-animation:yspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-270 2s infinite linear;-webkit-animation:yspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-315 2s infinite linear;-webkit-animation:yspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-r 2s infinite linear;-webkit-animation:yspin-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-45-r 2s infinite linear;-webkit-animation:yspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-90-r 2s infinite linear;-webkit-animation:yspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-135-r 2s infinite linear;-webkit-animation:yspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-180-r 2s infinite linear;-webkit-animation:yspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-225-r 2s infinite linear;-webkit-animation:yspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-270-r 2s infinite linear;-webkit-animation:yspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-315-r 2s infinite linear;-webkit-animation:yspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-45 2s infinite linear;-webkit-animation:yspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-90 2s infinite linear;-webkit-animation:yspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-135 2s infinite linear;-webkit-animation:yspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-180 2s infinite linear;-webkit-animation:yspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-225 2s infinite linear;-webkit-animation:yspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-270 2s infinite linear;-webkit-animation:yspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-315 2s infinite linear;-webkit-animation:yspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-45-r 2s infinite linear;-webkit-animation:yspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-90-r 2s infinite linear;-webkit-animation:yspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-135-r 2s infinite linear;-webkit-animation:yspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-180-r 2s infinite linear;-webkit-animation:yspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-225-r 2s infinite linear;-webkit-animation:yspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-270-r 2s infinite linear;-webkit-animation:yspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=-yspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-yspin]{-moz-animation:yspin-315-r 2s infinite linear;-webkit-animation:yspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-zspin],a:hover[href^=\'/\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin 2s infinite linear;-webkit-animation:zspin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-45 2s infinite linear;-webkit-animation:zspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-90 2s infinite linear;-webkit-animation:zspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-135 2s infinite linear;-webkit-animation:zspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-180 2s infinite linear;-webkit-animation:zspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-225 2s infinite linear;-webkit-animation:zspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-270 2s infinite linear;-webkit-animation:zspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-315 2s infinite linear;-webkit-animation:zspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-r 2s infinite linear;-webkit-animation:zspin-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-45-r 2s infinite linear;-webkit-animation:zspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-90-r 2s infinite linear;-webkit-animation:zspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-135-r 2s infinite linear;-webkit-animation:zspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-180\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-180\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-180-r 2s infinite linear;-webkit-animation:zspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-225\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-225\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-225-r 2s infinite linear;-webkit-animation:zspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-270-r 2s infinite linear;-webkit-animation:zspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-315-r 2s infinite linear;-webkit-animation:zspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-45 2s infinite linear;-webkit-animation:zspin-45 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-90 2s infinite linear;-webkit-animation:zspin-90 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-135 2s infinite linear;-webkit-animation:zspin-135 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-180 2s infinite linear;-webkit-animation:zspin-180 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-225 2s infinite linear;-webkit-animation:zspin-225 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-270 2s infinite linear;-webkit-animation:zspin-270 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-315 2s infinite linear;-webkit-animation:zspin-315 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-226\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-45-r 2s infinite linear;-webkit-animation:zspin-45-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-270\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-90-r 2s infinite linear;-webkit-animation:zspin-90-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-315\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-135-r 2s infinite linear;-webkit-animation:zspin-135-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-180-r 2s infinite linear;-webkit-animation:zspin-180-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-45\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-225-r 2s infinite linear;-webkit-animation:zspin-225-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-90\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-270-r 2s infinite linear;-webkit-animation:zspin-270-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=-zspin],a:hover[href^=\'/\'][href*=\'-135\'][href*=\'-f\'][href*=\'-r\'][href*=\'-d\'][href*=-zspin]{-moz-animation:zspin-315-r 2s infinite linear;-webkit-animation:zspin-315-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a:hover[href^=\'/\'][href$=\'-rd\']{-moz-transform:rotate(0deg)scaleX(1);-o-transform:rotate(0deg)scaleX(1);-webkit-transform:rotate(0deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-90d\'],a:hover[href^=\'/\'][href$=\'-90rd\']{-moz-transform:rotate(90deg)scaleX(1);-o-transform:rotate(90deg)scaleX(1);-webkit-transform:rotate(90deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-180d\'],a:hover[href^=\'/\'][href$=\'-fd\']{-moz-transform:rotate(180deg)scaleX(1);-o-transform:rotate(180deg)scaleX(1);-webkit-transform:rotate(180deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-270d\'],a:hover[href^=\'/\'][href$=\'-270rd\']{-moz-transform:rotate(270deg)scaleX(1);-o-transform:rotate(270deg)scaleX(1);-webkit-transform:rotate(270deg)scaleX(1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-rd\']{-moz-transform:rotate(0deg)scaleX(-1);-o-transform:rotate(0deg)scaleX(-1);-webkit-transform:rotate(0deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-90r\'],a[href^=\'/\'][href$=\'-90rd\'],a:hover[href^=\'/\'][href$=\'-90d\']{-moz-transform:rotate(90deg)scaleX(-1);-o-transform:rotate(90deg)scaleX(-1);-webkit-transform:rotate(90deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-fd\'],a:hover[href^=\'/\'][href$=\'-180d\']{-moz-transform:rotate(180deg)scaleX(-1);-o-transform:rotate(180deg)scaleX(-1);-webkit-transform:rotate(180deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\'/\'][href$=\'-270r\'],a[href^=\'/\'][href$=\'-270rd\'],a:hover[href^=\'/\'][href$=\'-270d\']{-moz-transform:rotate(270deg)scaleX(-1);-o-transform:rotate(270deg)scaleX(-1);-webkit-transform:rotate(270deg)scaleX(-1);image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-ispin]{-moz-animation:spin 2s infinite linear;-webkit-animation:spin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-rotate],a[href*=-lrotate]{-moz-animation:zspin 2s infinite linear;-webkit-animation:zspin 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
a[href^=\"/\"][href*=-rrotate],a[href*=-lrrotate]{-moz-animation:zspin-r 2s infinite linear;-webkit-animation:zspin-r 2s infinite linear;image-rendering:-moz-crisp-edges}\n\
.md{overflow-y:hidden !important}\n\
a[href^=\"/\"][href*=\"-inp\"]{float: none !important;display: inline-block !important}\n\
a[href^=\"/\"][href*=\"-ar\"]{float: right !important}\n\
a[href=\"/sp\"]{display:inline-block;padding-right:100%}"

var ecssFF = "@-moz-keyframes spin{from{-moz-transform:rotate(0deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(0deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-45{from{-moz-transform:rotate(45deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(45deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-90{from{-moz-transform:rotate(90deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(90deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-135{from{-moz-transform:rotate(135deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(135deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-180{from{-moz-transform:rotate(180deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(180deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-225{from{-moz-transform:rotate(225deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(225deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-270{from{-moz-transform:rotate(270deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(270deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-315{from{-moz-transform:rotate(315deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(315deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-r{from{-moz-transform:rotate(0deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(0deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-45-r{from{-moz-transform:rotate(45deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(45deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-90-r{from{-moz-transform:rotate(90deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(90deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-135-r{from{-moz-transform:rotate(135deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(135deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-180-r{from{-moz-transform:rotate(180deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(180deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-225-r{from{-moz-transform:rotate(225deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(225deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-270-r{from{-moz-transform:rotate(270deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(270deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes spin-315-r{from{-moz-transform:rotate(315deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-moz-transform:rotate(315deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-moz-keyframes xspin{from{-moz-transform:rotate(0deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(0deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-45{from{-moz-transform:rotate(45deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(45deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-90{from{-moz-transform:rotate(90deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(90deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-135{from{-moz-transform:rotate(135deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(135deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-180{from{-moz-transform:rotate(180deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(180deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-225{from{-moz-transform:rotate(225deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(225deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-270{from{-moz-transform:rotate(270deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(270deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-315{from{-moz-transform:rotate(315deg)scaleX(1)rotateX(0deg)}to{-moz-transform:rotate(315deg)scaleX(1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-r{from{-moz-transform:rotate(0deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(0deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-45-r{from{-moz-transform:rotate(45deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(45deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-90-r{from{-moz-transform:rotate(90deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(90deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-135-r{from{-moz-transform:rotate(135deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(135deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-180-r{from{-moz-transform:rotate(180deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(180deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-225-r{from{-moz-transform:rotate(225deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(225deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-270-r{from{-moz-transform:rotate(270deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(270deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes xspin-315-r{from{-moz-transform:rotate(315deg)scaleX(-1)rotateX(0deg)}to{-moz-transform:rotate(315deg)scaleX(-1)rotateX(360deg)}}\n\
@-moz-keyframes yspin{from{-moz-transform:rotate(0deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(0deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-45{from{-moz-transform:rotate(45deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(45deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-90{from{-moz-transform:rotate(90deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(90deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-135{from{-moz-transform:rotate(135deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(135deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-180{from{-moz-transform:rotate(180deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(180deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-225{from{-moz-transform:rotate(225deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(225deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-270{from{-moz-transform:rotate(270deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(270deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-315{from{-moz-transform:rotate(315deg)scaleX(1)rotatey(0deg)}to{-moz-transform:rotate(315deg)scaleX(1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-r{from{-moz-transform:rotate(0deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(0deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-45-r{from{-moz-transform:rotate(45deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(45deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-90-r{from{-moz-transform:rotate(90deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(90deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-135-r{from{-moz-transform:rotate(135deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(135deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-180-r{from{-moz-transform:rotate(180deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(180deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-225-r{from{-moz-transform:rotate(225deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(225deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-270-r{from{-moz-transform:rotate(270deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(270deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes yspin-315-r{from{-moz-transform:rotate(315deg)scaleX(-1)rotatey(0deg)}to{-moz-transform:rotate(315deg)scaleX(-1)rotatey(360deg)}}\n\
@-moz-keyframes zspin{from{-moz-transform:rotate(0deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(0deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-45{from{-moz-transform:rotate(45deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(45deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-90{from{-moz-transform:rotate(90deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(90deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-135{from{-moz-transform:rotate(135deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(135deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-180{from{-moz-transform:rotate(180deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(180deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-225{from{-moz-transform:rotate(225deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(225deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-270{from{-moz-transform:rotate(270deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(270deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-315{from{-moz-transform:rotate(315deg)scaleX(1)rotatez(0deg)}to{-moz-transform:rotate(315deg)scaleX(1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-r{from{-moz-transform:rotate(0deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(0deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-45-r{from{-moz-transform:rotate(45deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(45deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-90-r{from{-moz-transform:rotate(90deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(90deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-135-r{from{-moz-transform:rotate(135deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(135deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-180-r{from{-moz-transform:rotate(180deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(180deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-225-r{from{-moz-transform:rotate(225deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(225deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-270-r{from{-moz-transform:rotate(270deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(270deg)scaleX(-1)rotatez(360deg)}}\n\
@-moz-keyframes zspin-315-r{from{-moz-transform:rotate(315deg)scaleX(-1)rotatez(0deg)}to{-moz-transform:rotate(315deg)scaleX(-1)rotatez(360deg)}}"

var ecssCH = "@-webkit-keyframes spin{from{-webkit-transform:rotate(0deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(0deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-45{from{-webkit-transform:rotate(45deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(45deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-90{from{-webkit-transform:rotate(90deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(90deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-135{from{-webkit-transform:rotate(135deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(135deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-180{from{-webkit-transform:rotate(180deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(180deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-225{from{-webkit-transform:rotate(225deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(225deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-270{from{-webkit-transform:rotate(270deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(270deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-315{from{-webkit-transform:rotate(315deg)scaleX(1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(315deg)scaleX(1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-r{from{-webkit-transform:rotate(0deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(0deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-45-r{from{-webkit-transform:rotate(45deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(45deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-90-r{from{-webkit-transform:rotate(90deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(90deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-135-r{from{-webkit-transform:rotate(135deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(135deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-180-r{from{-webkit-transform:rotate(180deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(180deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-225-r{from{-webkit-transform:rotate(225deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(225deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-270-r{from{-webkit-transform:rotate(270deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(270deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes spin-315-r{from{-webkit-transform:rotate(315deg)scaleX(-1)rotateX(0deg)rotateY(0deg)rotateZ(0deg)}to{-webkit-transform:rotate(315deg)scaleX(-1)rotateX(360deg)rotateY(360deg)rotateZ(360deg)}}\n\
@-webkit-keyframes xspin{from{-webkit-transform:rotate(0deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(0deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-45{from{-webkit-transform:rotate(45deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(45deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-90{from{-webkit-transform:rotate(90deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(90deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-135{from{-webkit-transform:rotate(135deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(135deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-180{from{-webkit-transform:rotate(180deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(180deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-225{from{-webkit-transform:rotate(225deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(225deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-270{from{-webkit-transform:rotate(270deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(270deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-315{from{-webkit-transform:rotate(315deg)scaleX(1)rotateX(0deg)}to{-webkit-transform:rotate(315deg)scaleX(1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-r{from{-webkit-transform:rotate(0deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(0deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-45-r{from{-webkit-transform:rotate(45deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(45deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-90-r{from{-webkit-transform:rotate(90deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(90deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-135-r{from{-webkit-transform:rotate(135deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(135deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-180-r{from{-webkit-transform:rotate(180deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(180deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-225-r{from{-webkit-transform:rotate(225deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(225deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-270-r{from{-webkit-transform:rotate(270deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(270deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes xspin-315-r{from{-webkit-transform:rotate(315deg)scaleX(-1)rotateX(0deg)}to{-webkit-transform:rotate(315deg)scaleX(-1)rotateX(360deg)}}\n\
@-webkit-keyframes yspin{from{-webkit-transform:rotate(0deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(0deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-45{from{-webkit-transform:rotate(45deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(45deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-90{from{-webkit-transform:rotate(90deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(90deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-135{from{-webkit-transform:rotate(135deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(135deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-180{from{-webkit-transform:rotate(180deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(180deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-225{from{-webkit-transform:rotate(225deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(225deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-270{from{-webkit-transform:rotate(270deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(270deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-315{from{-webkit-transform:rotate(315deg)scaleX(1)rotatey(0deg)}to{-webkit-transform:rotate(315deg)scaleX(1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-r{from{-webkit-transform:rotate(0deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(0deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-45-r{from{-webkit-transform:rotate(45deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(45deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-90-r{from{-webkit-transform:rotate(90deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(90deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-135-r{from{-webkit-transform:rotate(135deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(135deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-180-r{from{-webkit-transform:rotate(180deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(180deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-225-r{from{-webkit-transform:rotate(225deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(225deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-270-r{from{-webkit-transform:rotate(270deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(270deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes yspin-315-r{from{-webkit-transform:rotate(315deg)scaleX(-1)rotatey(0deg)}to{-webkit-transform:rotate(315deg)scaleX(-1)rotatey(360deg)}}\n\
@-webkit-keyframes zspin{from{-webkit-transform:rotate(0deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(0deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-45{from{-webkit-transform:rotate(45deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(45deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-90{from{-webkit-transform:rotate(90deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(90deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-135{from{-webkit-transform:rotate(135deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(135deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-180{from{-webkit-transform:rotate(180deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(180deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-225{from{-webkit-transform:rotate(225deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(225deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-270{from{-webkit-transform:rotate(270deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(270deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-315{from{-webkit-transform:rotate(315deg)scaleX(1)rotatez(0deg)}to{-webkit-transform:rotate(315deg)scaleX(1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-r{from{-webkit-transform:rotate(0deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(0deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-45-r{from{-webkit-transform:rotate(45deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(45deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-90-r{from{-webkit-transform:rotate(90deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(90deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-135-r{from{-webkit-transform:rotate(135deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(135deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-180-r{from{-webkit-transform:rotate(180deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(180deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-225-r{from{-webkit-transform:rotate(225deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(225deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-270-r{from{-webkit-transform:rotate(270deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(270deg)scaleX(-1)rotatez(360deg)}}\n\
@-webkit-keyframes zspin-315-r{from{-webkit-transform:rotate(315deg)scaleX(-1)rotatez(0deg)}to{-webkit-transform:rotate(315deg)scaleX(-1)rotatez(360deg)}}"
