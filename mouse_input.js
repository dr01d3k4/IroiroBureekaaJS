(function (window) {
	var mouse = {
		down: false,
		x: -1,
		y: -1
	};

	var previousMouse = {
		down: false,
		x: -1,
		y: -1
	};


	var mouseLetGo = false;



	var updateMouse = function () {
		previousMouse.down = mouse.down;
		previousMouse.x = mouse.x;
		previousMouse.y = mouse.y;
		
		if (mouseLetGo) {
			mouse.down = false;
			mouseLetGo = false;
		}
	};



	var getMousePosition = function (event) {
		var x = -1;
		var y = -1;

		if ((event.x === undefined) || (event.y === undefined)) {
			x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		} else {
			x = event.x;
			y = event.y;
		}

		x -= canvas.offsetLeft + canvasBorderThickness;
		y -= canvas.offsetTop + canvasBorderThickness;

		return [x, y];
	};



	var setMousePosition = function (event) {
		event = event || window.event;
		var pos = getMousePosition(event);
		mouse.x = pos[0];
		mouse.y = pos[1];

	};



	var onMouseDown = function (event) {
		mouse.down = true;
		setMousePosition(event);
	};



	var onMouseMove = function (event) {
		setMousePosition(event);
	};



	var onMouseUp = function (event) {
		mouseLetGo = true;
		setMousePosition(event);
	};



	var isMouseDown = function () {
		return mouse.down;
	};



	var isMouseUp = function () {
		return !mouse.down
	};



	var getMouseX = function () {
		return mouse.x;
	};



	var getMouseY = function () {
		return mouse.y;
	};



	var isMouseOver = function (x, y, width, height) {
		return ((getMouseX() >= x) && (getMouseX() <= x + width) && (getMouseY() >= y) && (getMouseY() <= y + height));
	};



	var wasMouseDown = function () {
		return previousMouse.down;
	};



	var wasMouseUp = function () {
		return !previousMouse.down;
	};



	var setMouseDown = function (down) {
		mouse.down = down;
	};



	window.updateMouse = updateMouse;
	window.onMouseDown = onMouseDown;
	window.onMouseMove = onMouseMove;
	window.onMouseUp = onMouseUp;
	window.isMouseDown = isMouseDown;
	window.isMouseUp = isMouseUp;
	window.getMouseX = getMouseX;
	window.getMouseY = getMouseY;
	window.isMouseOver = isMouseOver;
	window.wasMouseDown = wasMouseDown;
	window.wasMouseUp = wasMouseUp;
	window.setMouseDown = setMouseDown;
})(window);
