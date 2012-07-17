


function addSub(Sub) //Just include sub name, i.e. /r/MLPlounge = MLPlounge
{

	var head = document.getElementsByTagName("head")[0];
	var newCSS = document.createElement('link');
	newCSS.type = 'text/css'
	newCSS.rel = 'stylesheet';
	
	var SubCss = 'http://www.reddit.com/r/' + Sub + '/stylesheet.css';
	
	newCSS.href = SubCss;
	
	headID.insertBefore(newCSS);

}