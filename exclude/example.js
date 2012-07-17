
addCSS("example.css");
var sheet = getSheet("example.css");
//If I add an alert() here it works
removeRules(sheet);

function addCSS(link) 
{
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement('style');
	style.textContent = '@import "' + url + '"';
	head.appendChild(newCSS);
}

function removeRules(ssheet)
{


	var srule;

    var srules = ssheet.cssRules; //This is where I get the access error
	
	...
	
}