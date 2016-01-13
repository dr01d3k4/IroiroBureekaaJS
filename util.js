(function (window) {
	var requestAnimFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();



	var randomNumberExclusive = function (lower, upper) {
		return Math.floor(Math.random() * (upper - lower)) + lower;
	};



	var randomNumberInclusive = function (lower, upper) {
		return Math.floor(Math.random() * (upper + 1 - lower)) + lower;
	};



	var setCanvasSize = function (canvas, width, height) {
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height);
		return canvas;
	};



	var createCanvas = function (width, height) {
		return setCanvasSize(document.createElement("canvas"), width, height);
	};



	window.requestAnimFrame = requestAnimFrame;
	window.randomNumberExclusive = randomNumberExclusive;
	window.randomNumberInclusive = randomNumberInclusive;
	window.setCanvasSize = setCanvasSize;
	window.createCanvas = createCanvas;
})(window);