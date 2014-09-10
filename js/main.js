(function(app,fc) {
	window.addEventListener('load', function() {
	    fc.attach(document.body);
	    app.init();
	}, false);
})(SHIPFAMFINDER, FastClick);