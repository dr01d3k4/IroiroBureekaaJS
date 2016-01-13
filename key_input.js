(function (window) {
	var keys = [ ];

	var previousKeys = [ ];


	for (var i = 0; i < 256; i++) {
		keys[i] = false;
		previousKeys[i] = false;
	}



	var onKeyDown = function (event) {
		event = event || window.event;
		keys[event.keyCode] = true;
	};




	var onKeyUp = function (event) {
		event = event || window.event;
		keys[event.keyCode] = false;
	};



	var updateKeys = function () {
		for (var i = 0; i < keys.length; i++) {
			previousKeys[i] = keys[i];
		}
	};



	var clearKeys = function () {
		for (var i = 0; i < keys.length; i++) {
			keys[i] = false;
			previousKeys[i] = false;
		}
	};



	var Key = {
		LEFT: [37, 65],  // <- a
		RIGHT: [39, 68], // -> d
		UP: [38, 87],	 // /\ w
		DOWN: [40, 83],  // \/ s
		PAUSE: [80, 27], // p  esc
		ENTER: [13], 	//
	};



	var isKeyDownIn = function (key, array) {
		for (var i = 0; i < key.length; i++) {
			if (array[key[i]]) {
				return true;
			}
		}
		return false;
	};



	var isKeyDown = function (key) {
		return isKeyDownIn(key, keys);
	};



	var isKeyUp = function (key) {
		return !isKeyDownIn(key, keys);
	};



	var wasKeyDown = function (key) {
		return isKeyDownIn(key, previousKeys);
	};



	var wasKeyUp = function (key) {
		return !isKeyDownIn(key, previousKeys);
	};



	window.onKeyDown = onKeyDown;
	window.onKeyUp = onKeyUp;
	window.updateKeys = updateKeys;
	window.clearKeys = clearKeys;
	window.Key = Key;
	window.isKeyDown = isKeyDown;
	window.isKeyUp = isKeyUp;
	window.wasKeyDown = wasKeyDown;
	window.wasKeyUp = wasKeyUp;
})(window);