(function (window) {
	var Screen = function () { };

	Screen.prototype.init = function () { };
	Screen.prototype.onResize = function () { };
	Screen.prototype.update = function (dt) { };
	Screen.prototype.render = function () { };
	Screen.prototype.cleanUp = function () { };
	Screen.prototype.onFocusLost = function () { };

	window.Screen = Screen;
})(window);