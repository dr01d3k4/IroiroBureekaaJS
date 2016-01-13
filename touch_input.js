(function (window) {
	var isTouchDevice = function () {
		return ("ontouchstart" in window) || ("onmsgesturechange" in window);
	};



	window.isTouchDevice = isTouchDevice;
})(window);