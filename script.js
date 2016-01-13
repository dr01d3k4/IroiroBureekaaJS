var canvas = null;
var canvasBorderThickness = 1;
var context = null;


var hasFocus = true;


var windowWidth = 0;
var windowHeight = 0;
var oldWindowWidth = -1;
var oldWindowHeight = -1;
var canvasWidth = 0;
var canvasHeight = 0;
var gridPixelWidth = 0;
var gridPixelHeight = 0;


var screen = new Screen();
var cellSize = 1;


var topBarSize = 0.1;
var topBarPixels = 0;
var extraSize = 4;
var bottomBarSize = 0.03;
var bottomBarPixels = 0;



var scrollAmount = 0;
var scrollDelay = 0;



var scrollFunction = function () {
	window.scrollTo(0, scrollAmount);
};



var hideAddressBar = function () {
	setTimeout(scrollFunction, 1);
};



var changeScreen = function (newScreen) {
	screen.cleanUp();

	context.fillStyle = ColourString.NONE;
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	clearKeys();

	screen = newScreen;
	screen.init();
	screen.onResize();
};



var calculateCanvasSize = function () {
	if (!canvas) {
		return;
	}

	windowWidth = Math.floor(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
	windowHeight = Math.floor(window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
	
	if ((windowWidth === oldWindowWidth) && (windowHeight === oldWindowHeight)) {
		return;
	}


	topBarPixels = Math.floor(windowHeight * topBarSize);
	bottomBarPixels = Math.floor(windowHeight * bottomBarSize);

	cellSize = Math.floor((windowHeight - topBarPixels - bottomBarPixels - extraSize) / GRID_HEIGHT);

	gridPixelWidth = Math.floor(cellSize * GRID_WIDTH);
	if (gridPixelWidth > windowWidth) {
		cellSize = Math.floor((windowWidth - extraSize) / GRID_WIDTH);
		gridPixelWidth = Math.floor(cellSize * GRID_WIDTH);
	}

	gridPixelHeight = Math.floor(cellSize * GRID_HEIGHT);

	canvasWidth = Math.floor(gridPixelWidth);
	canvasHeight = Math.floor(gridPixelHeight) + topBarPixels + bottomBarPixels;

	setCanvasSize(canvas, canvasWidth, canvasHeight);

	oldWindowWidth = Math.floor(windowWidth);
	oldWindowHeight = Math.floor(windowHeight);

	screen.onResize();
	hideAddressBar();
};



var lastTime = Date.now();
var now = Date.now();
var dt = 0;
var main = function () {
	window.requestAnimFrame(main);

	now = Date.now();
	dt = (now - lastTime) / 1000.0;

	screen.update(dt);
	screen.render();

	updateKeys();
	updateMouse();

	lastTime = now;
};



var init = function () {
	setLanguage(Language.ENGLISH);
	
	canvas = createCanvas(GRID_WIDTH, GRID_HEIGHT);
	document.body.appendChild(canvas);

	calculateCanvasSize();

	context = canvas.getContext("2d");

	canvas.setAttribute("tabindex", "1");
	canvas.focus();

	canvas.onkeydown = onKeyDown;
	canvas.onkeyup = onKeyUp;
	canvas.onmousedown = onMouseDown;
	canvas.onmousemove = onMouseMove;
	canvas.onmouseup = onMouseUp;

	changeScreen(new Menu());

	lastTime = Date.now();
	main();
};



/*
onblur = function () {
	hasFocus = false;
	clearKeys();
	screen.onFocusLost();
};



onfocus = function () {
	hasFocus = true;
};
*/



onresize = calculateCanvasSize;



onload = init;