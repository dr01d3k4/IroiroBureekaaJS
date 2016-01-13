// Generated by CoffeeScript 1.6.3
(function(window) {
  var createCanvas, randomNumberExclusive, randomNumberInclusive, requestAnimFrame, setCanvasSize;
  requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();
  randomNumberExclusive = function(lower, upper) {
    return Math.floor(Math.random() * (upper - lower)) + lower;
  };
  randomNumberInclusive = function(lower, upper) {
    return Math.floor(Math.random() * (upper + 1 - lower)) + lower;
  };
  setCanvasSize = function(canvas, width, height) {
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    return canvas;
  };
  createCanvas = function(width, height) {
    return setCanvasSize(docuemnt.createElement("canvas"), width, height);
  };
  window.requestAnimFrame = requestAnimFrame;
  window.randomNumberExclusive = randomNumberExclusive;
  window.randomNumberInclusive = randomNumberInclusive;
  window.setCanvasSize = setCanvasSize;
  return window.createCanvas = createCanvas;
})(window);
