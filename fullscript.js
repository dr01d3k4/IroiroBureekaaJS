////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ideas.js

/*
- 2 pieces falling at once, control left one with asd, right with arrows
- If no points after 5 blocks, you get a grey block that can't be destroyed (or goes away after x drops)
*/




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// util.js

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




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// translation.js

(function (window) {
	var Language = {
		ENGLISH: "en",
		JAPANESE: "jap"
	};

	var language = Language.ENGLISH;



	var translations = {
		"en": {
			"TITLE": "Iroiro Burēkā!",
			"TITLE_WORD_ONE": "Iroiro",
			"TITLE_WORD_TWO": "Burēkā!",

			"MENU_PLAY": "Play",
			"MENU_HIGHSCORES": "Highscores",
			"MENU_SETTINGS": "Settings",
			"MENU_HELP": "Help",

			"GAME_SCORE": "Score: %d pts",
			"GAME_SCORE_EXTRA": "Score: %d pts + %d",
			"GAME_NEXT_PIECE": "Next: ",
			"GAME_PAUSED": "Paused",
			"GAME_BACK_MENU": "Back to menu",
			"GAME_SURE_LEAVE": "Are you sure?",
			"GAME_YES": "Yes",
			"GAME_OVER": "Game over!",
		},



		"jap": {
			"TITLE": "イロイロ・ブレーカー！",
			"TITLE_WORD_ONE": "イロイロ",
			"TITLE_WORD_TWO": "ブレーカー！",

			"MENU_PLAY": "スタート",
			"MENU_HIGHSCORES": "スコア記録",
			"MENU_SETTINGS": "設定",
			"MENU_HELP": "ヘルプ",

			"GAME_SCORE": "スコア: %dポイント",
			"GAME_SCORE_EXTRA": "スコア: %dポイント + %d",
			"GAME_NEXT_PIECE": "次: ",
			"GAME_PAUSED": "一時停止",
			"GAME_BACK_MENU": "トップに戻る",
			"GAME_SURE_LEAVE": "本当によろしですか？",
			"GAME_YES": "はい",
			"GAME_OVER": "ゲームオーバー"
		}
	};



	var setLanguage = function (newLanguage) {
		if (newLanguage in translations) {
			language = newLanguage;
			document.title = getTranslation("TITLE");
		} else {
			// console.log("Unknown language " + newLanguage);
		}
	};



	var getTranslation = function (key) { 
		if (key in translations[language]) {
			return translations[language][key];
		} else if (key in translations[Language.ENGLISH]) {
			// console.log("No translation for " + key + " in " + language + ". Using English");
			return translations[Language.ENGLISH][key];
		} else {
			// console.log("Unknown translation lookup key " + key + " in " + language + ((language !=== Language.ENGLISH) ? (" or " + Language.ENGLISH) : ""));
			return "No translation available";
		}
	};



	window.Language = Language;
	window.setLanguage = setLanguage;
	window.getTranslation = getTranslation;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// key_input.js

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




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// mouse_input.js

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




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// touch_input.js

(function (window) {
	var isTouchDevice = function () {
		return ("ontouchstart" in window) || ("onmsgesturechange" in window);
	};



	window.isTouchDevice = isTouchDevice;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// colour.js

(function (window) {
	var ColourString = {
		NONE: "#ffffff",
		OUT_OF_BOUNDS: "#101010",

		RED: "#c00000",
		GREEN: "#00c000",
		BLUE: "#0000c0",
		YELLOW: "#dfdf00",
		WILD: "#c000c0",

		LIGHT_RED: "#ff1414",
		LIGHT_GREEN: "#14ff14",
		LIGHT_BLUE: "#1414ff",
		LIGHT_YELLOW: "#f2f214",
		LIGHT_WILD: "#ff00ff",

		TEXT: "#000000",
		GUI_BACKGROUND: "#bbbbbb",
		PAUSED_BACKGROUND: "#141414",
		PAUSED_TEXT: "#f0f0f0",
		PAUSE_BUTTON_BACKGROUND: "#505050",
		PAUSE_BUTTON_BAR: "#bbbbbb",
		OUTLINE: "#000000",
		MULTIPLIER_TEXT: "#141414"
	};



	var Colour = {
		NONE: 0,
		OUT_OF_BOUNDS: 1,
		RED: 2,
		GREEN: 3,
		BLUE: 4,
		YELLOW: 5,
		WILD: 6,
		LIGHT_RED: 7,
		LIGHT_GREEN: 8,
		LIGHT_BLUE: 9,
		LIGHT_YELLOW: 10,
		LIGHT_WILD: 11
	};



	var colourStringLookup = [
		ColourString.NONE, ColourString.OUT_OF_BOUNDS,
		ColourString.RED, ColourString.GREEN, ColourString.BLUE, ColourString.YELLOW, ColourString.WILD,
		ColourString.LIGHT_RED, ColourString.LIGHT_GREEN, ColourString.LIGHT_BLUE, ColourString.LIGHT_YELLOW, ColourString.LIGHT_WILD
	];
	var colourCount = colourStringLookup.length;

	

	var randomColours = [Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW, Colour.WILD];
	var randomColoursLength = randomColours.length;
	var randomColourProbability = [32.4, 32.4, 25, 10, 0.2];

	for (var i = 0; i < randomColourProbability.length; i++) {
		randomColourProbability[i] /= 100;
	}

	var randomColour = function () {
		var random = Math.random();
		var cumulative = 0;
		for (var i = 0; i < randomColourProbability.length; i++) {
			cumulative += randomColourProbability[i];
			if (random <= cumulative) {
				return randomColours[i];
			}
		}
	};


	var colourToPoints = [0, 0, 1.5, 1.5, 2, 4.5, 6];
	var colourPointsScale = 10;
	for (var i = 0; i < colourToPoints.length; i++) {
		colourToPoints[i] = Math.floor(colourToPoints[i] * colourPointsScale);
	}

	var getColourPoints = function (colour) {
		if (isLightColour(colour)) {
			colour = darkerColour(colour);
		}
		return colourToPoints[colour];
	};



	var lighterColour = function (colour) {
		if (colour === Colour.RED) {
			return Colour.LIGHT_RED;
		} else if (colour === Colour.GREEN) {
			return Colour.LIGHT_GREEN;
		} else if (colour === Colour.BLUE) {
			return Colour.LIGHT_BLUE;
		} else if (colour === Colour.YELLOW) {
			return Colour.LIGHT_YELLOW;
		} else if (colour === Colour.WILD) {
			return Colour.LIGHT_WILD;
		} else {
			return Colour.OUT_OF_BOUNDS;
		}
	};



	var darkerColour = function (colour) {
		if (colour === Colour.LIGHT_RED) {
			return Colour.RED;
		} else if (colour === Colour.LIGHT_GREEN) {
			return Colour.GREEN;
		} else if (colour === Colour.LIGHT_BLUE) {
			return Colour.BLUE;
		} else if (colour === Colour.LIGHT_YELLOW) {
			return Colour.YELLOW;
		} else if (colour === Colour.LIGHT_WILD) {
			return Colour.WILD;
		} else {
			return Colour.OUT_OF_BOUNDS;
		}
	};



	var isLightColour = function (colour) {
		return ((colour === Colour.LIGHT_RED) || (colour === Colour.LIGHT_GREEN)
			|| (colour === Colour.LIGHT_BLUE) || (colour === Colour.LIGHT_YELLOW)
			|| (colour === Colour.LIGHT_WILD));
	};

	
	
	window.ColourString = ColourString;
	window.Colour = Colour
	window.colourStringLookup = colourStringLookup;
	window.colourCount = colourCount;
	window.randomColour = randomColour;
	window.colourToPoints = colourToPoints;
	window.getColourPoints = getColourPoints;
	window.lighterColour = lighterColour;
	window.darkerColour = darkerColour;
	window.isLightColour = isLightColour;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// grid.js

(function (window) {
	var GRID_WIDTH = 14;
	var GRID_HEIGHT = 22;
	var START_HEIGHT = Math.ceil(GRID_HEIGHT / 4);



	var Grid = function (width, height) {
		this.width = width;
		this.height = height;

		this.grid = [ ];
		this.markedForClear = [ ];
		this.lookedAt = [ ];

		this.isDirty = false;
		this.renderLessStateChange = [ ];

		this.cellWorth = [ ];
	};



	Grid.prototype.init = function () {
		for (var x = 0; x < this.width; x++) {
			this.grid[x] = [ ];
			this.markedForClear[x] = [ ];
			this.lookedAt[x] = [ ];
			this.cellWorth[x] = [ ];
			for (var y = 0; y < this.height; y++) {
				this.grid[x][y] = Colour.NONE;
				this.markedForClear[x][y] = false;
				this.lookedAt[x][y] = false;
				this.cellWorth[x][y] = 0;
			}
		}
	};



	Grid.prototype.inBounds = function (x, y) {
		return ((x >= 0) && (x < this.width) && (y >= 0) && (y < this.height));
	};



	Grid.prototype.getColourAt = function (x, y) {
		if (this.inBounds(x, y)) {
			return this.grid[x][y];
		} else {
			return Colour.OUT_OF_BOUNDS;
		}
	};



	Grid.prototype.setColourAt = function (x, y, colour) {
		if (this.inBounds(x, y)) {
			this.grid[x][y] = colour;
			this.isDirty = true;
		}
	};



	Grid.prototype.getCellWorth = function (x, y) {
		if (this.inBounds(x, y)) {
			return this.cellWorth[x][y];
		} else {
			return 0;
		}
	}

	Grid.prototype.setCellWorth = function (x, y, worth) {
		if (this.inBounds(x, y)) {
			this.cellWorth[x][y] = worth;
		}
	}



	Grid.prototype.isExactlyColourAt = function (x, y, colour) {
		return (this.getColourAt(x, y) === colour);
	};



	Grid.prototype.isColourAt = function (x, y, colour) {
		var colourOnGrid = this.getColourAt(x, y);
		if (colourOnGrid === colour) {
			return true;
		} else if (((colour == Colour.WILD) && (colourOnGrid !== Colour.NONE)) || (colourOnGrid == Colour.WILD)) {
			return true;
		} else {
			return false;
		}
	};



	Grid.prototype.isEmptyAt = function (x, y) {
		return this.isExactlyColourAt(x, y, Colour.NONE);
	};



	Grid.prototype.isSolidAt = function (x, y) {
		var colour = this.getColourAt(x, y);
		return ((colour !== Colour.NONE) && (colour !== Colour.OUT_OF_BOUNDS));
	};



	Grid.prototype.setEmptyAt = function (x, y) {
		this.setColourAt(x, y, Colour.NONE);
	};



	Grid.prototype.isMarkedForClearAt = function (x, y) {
		if (this.inBounds(x, y)) {
			return this.markedForClear[x][y];
		} else {
			return false;
		}
	};



	Grid.prototype.setMarkedForClearAt = function (x, y, mark) {
		if (this.inBounds(x, y)) {
			this.markedForClear[x][y] = mark;
		}
	};



	Grid.prototype.clearMarkedForClear = function () {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.markedForClear[x][y] = false;
			}
		}
	};



	Grid.prototype.hasBeenLookedAt = function (x, y) {
		if (this.inBounds(x, y)) {
			return this.lookedAt[x][y];
		} else {
			return true;
		}
	};



	Grid.prototype.setLookedAt = function (x, y, look) {
		if (this.inBounds(x, y)) {
			this.lookedAt[x][y] = look;
		}
	};



	Grid.prototype.clearLookedAt = function () {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.lookedAt[x][y] = false;
			}
		}
	};



	Grid.prototype.calculateLessStateChange = function () {
		if (!this.isDirty) {
			return;
		}

		this.renderLessStateChange = [ ];

		for (var i = 0; i < colourCount; i++) {
			this.renderLessStateChange[i] = [ ];
		}

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.renderLessStateChange[this.getColourAt(x, y)].push([x, y]);
			}
		}

		this.isDirty = false;
	};



	Grid.prototype.findFloodClearCellsRecursive = function (x, y, colour, cells) {
		if (this.isColourAt(x, y, colour) && !this.hasBeenLookedAt(x, y)) {
			cells.push([x, y]);
			this.setLookedAt(x, y, true);
			this.findFloodClearCellsRecursive(x, y - 1, colour, cells);
			this.findFloodClearCellsRecursive(x + 1, y, colour, cells);
			this.findFloodClearCellsRecursive(x, y + 1, colour, cells);
			this.findFloodClearCellsRecursive(x - 1, y, colour, cells);
		}
	};



	Grid.prototype.findFloodClearCells = function (x, y, colour) {
		var cells = [ ];
		this.clearLookedAt();
		this.findFloodClearCellsRecursive(x, y, colour, cells);
		this.clearLookedAt();
		return cells;
	};



	Grid.prototype.findCellsToFall = function () {
		var fallingPieces = [ ];
		for (var x = 0; x < this.width; x++) {
			var shouldFall = this.isEmptyAt(x, this.height - 1);
			for (var y = this.height - 2; y >= 0; y--) {
				if (this.isEmptyAt(x, y)) {
					shouldFall = true;
				} else {
					if (shouldFall) {
						fallingPieces.push([x, y, this.getColourAt(x, y), this.isEmptyAt(x, y + 1)]);
					}
				}
			}
		}

		return fallingPieces;
	};



	Grid.prototype.setFallingPiecesEmpty = function (fallingPieces) {
		for (var i = 0; i <  fallingPieces.length; i++) {
			this.setEmptyAt(fallingPieces[i][0], fallingPieces[i][1]);
		}
	};



	window.GRID_WIDTH = GRID_WIDTH;
	window.GRID_HEIGHT = GRID_HEIGHT;
	window.START_HEIGHT = START_HEIGHT;
	window.Grid = Grid;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// screen.js

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




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// game.js

(function (window) {
	var GameState = {
		NONE: 0,
		INITIALIZING: 1,
		ADDING_NEW_ROW: 2,
		PLAYER_FALLING: 3,
		LANDING_CELLS: 4,
		PRE_CLEARING: 5,
		CLEARING: 6,
		GAP_FILL_FALL: 7,
		PAUSED: 8,
		LOST: 9,
		GAME_OVER: 10
	};



	var Game = function Game () {
		this.reset();
	};

	Game.prototype = new Screen();
	Game.prototype.constructor = Game;
	


	Game.prototype.reset = function () {
		this.grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
		this.state = GameState.NONE;
		this.previousState = GameState.NONE;
		this.gridWidth = this.grid.width;
		this.gridHeight = this.grid.height;
		this.sureLeave = false;

		this.nextRow = [ ];
		this.newRow = [ ];
		this.newRowSlideIn = 0;
		this.newRowSlideInTime = 0.14;
		this.addedRows = 0;
		this.startingRows = START_HEIGHT;
		this.newRowBaseTime = 6;
		this.newRowRandomTime = 12;
		this.newRowTime = this.newRowBaseTime + randomNumberInclusive(0, this.newRowRandomTime);
		this.newRowCumulativeTime = 0;

		this.fallingPieces = [ ];
		this.nextFallingPieceColour = randomColour();

		this.playerFallTime = 0.15;
		this.playerFastFallTime = 0.09;

		this.playerHorizontalMoveTime = 0.092;
		this.playerHorizontalTarget = Math.floor(this.gridWidth / 2);

		this.landedCells = [ ];

		this.floodClearLocations = [ ];
		this.preClearedList = [ ];

		this.preClearTime = 0.05;
		this.preClearCumulativeTime = 0;

		this.finalClearTime = 0.32;
		this.finalClearCumulativeTime = 0;

		this.gapFillTime = 0.12;

		this.score = 0;
		this.scoreChange = 0;
		this.multiplier = 0;
		this.minGroupSize = 3;

		this.gridCanvas = createCanvas(1, 1);
		this.outlineCanvas = createCanvas(1, 1);
		this.nextRowCanvas = createCanvas(1, 1);
		this.pausedCanvas = createCanvas(1, 1);

		this.pauseButtonSize = 1;
		this.pauseButtonX = 1;
		this.pauseButtonY = 1;
		this.pauseButtonCanvas = createCanvas(1, 1);

		this.leaveButtonX = 1;
		this.leaveButtonY = 1;
		this.leaveButtonWidth = 1;
		this.leaveButtonHeight = 1;
		this.leaveButtonBottomPadding = 1; 

		this.gameOverCanvas = createCanvas(1, 1);

		this.wildColourMultiplierMinimum = 3;
	};



	Game.prototype.init = function () {
		this.grid.init();
		this.changeState(GameState.INITIALIZING);
	};



	Game.prototype.onResize = function () {
		setCanvasSize(this.gridCanvas, gridPixelWidth, gridPixelHeight);
		this.renderGrid();
		this.renderOutline();
		this.renderNextRow();
		this.renderPausedScreen();
		this.renderPauseButton();
		this.renderGameOver();
	};



	Game.prototype.onFocusLost = function () {
		this.changeState(GameState.PAUSED);
	};



	Game.prototype.changeState = function (newState, goingBack) {
		if (goingBack === null) {
			goingBack = false;
		}

		if ((newState == GameState.PLAYER_FALLING) || (newState == GameState.GAP_FILL_FALL)) {
			for (var x = 0; x < this.gridWidth; x++) {
				for (var y = 0; y < this.gridHeight; y++) {
					this.grid.setCellWorth(x, y, getColourPoints(this.grid.getColourAt(x, y)));
				}
			}
		}

		if (this.sureLeave) {
			this.sureLeave = false;
			this.renderPausedScreen();
		}

		if (newState === GameState.PAUSED) {
			if ((this.state !== GameState.INITIALIZING) && (this.state != GameState.ADDING_NEW_ROW)) {
				this.previousState = this.state;
				this.state = GameState.PAUSED;
			}
			return;
		}

		this.grid.clearMarkedForClear();
		this.grid.clearLookedAt();

		if ((newState === GameState.LOST) || (newState === GameState.GAME_OVER)) {
			this.previousState = GameState.NONE;
			this.state = newState;
			this.renderGameOver();
			return;
		}

		this.previousState = this.state;

		if (!goingBack && (this.newRowCumulativeTime >= this.newRowTime) && (newState === GameState.PLAYER_FALLING)) {
			this.newRowCumulativeTime = 0;
			this.newRowTime = this.newRowBaseTime + randomNumberInclusive(0, this.newRowRandomTime);
			this.changeState(GameState.ADDING_NEW_ROW);
		} else {
			this.state = newState;
		}
	};



	Game.prototype.backState = function () {
		this.changeState(this.previousState, true);
	};



	Game.prototype.update = function (dt) {
		if (!hasFocus) {
			return;
		}

		if (this.state === GameState.PAUSED) {
			if (isMouseDown() && wasMouseUp() && (getMouseY() > topBarPixels)) {
				if (isMouseOver(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight)) {
					if (this.sureLeave) {
						changeScreen(new Menu());
					} else {
						this.sureLeave = true;
						this.renderPausedScreen();
					}
				} else {
					this.backState();
					setMouseDown(false);
				}
				return;
			}
		}

		if (this.state === GameState.GAME_OVER) {
			if (isMouseDown() && wasMouseUp() && isMouseOver(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight)) {
				changeScreen(new Menu());
			}
		}

		if ((isMouseDown() && wasMouseUp() && isMouseOver(this.pauseButtonX, this.pauseButtonY, this.pauseButtonSize, this.pauseButtonSize)) 
			|| (isKeyDown(Key.PAUSE) && wasKeyUp(Key.PAUSE))) {
			if (this.state === GameState.PAUSED) {
				this.backState();
			} else  {
				this.changeState(GameState.PAUSED);
			}
		}

		switch (this.state) {
			case GameState.INITIALIZING: {
				if (this.addedRows < this.startingRows) {
					this.changeState(GameState.ADDING_NEW_ROW);
				} else {
					this.changeState(GameState.PLAYER_FALLING);
				}
				break;
			}

			case GameState.ADDING_NEW_ROW: {
				this.updateStateAddingNewRow(dt);
				break;
			}

			case GameState.PLAYER_FALLING: {
				this.updateStatePlayerFalling(dt);
				break;	
			}

			case GameState.LANDING_CELLS: {
				this.updateLandingCells();
				break;
			}

			case GameState.PRE_CLEARING: {
				this.updatePreClearing(dt);
				break;
			}

			case GameState.CLEARING: {
				this.updateClearing(dt);
				break;
			}

			case GameState.GAP_FILL_FALL: {
				this.updateGapFillFall(dt);
				break;
			}

			case GameState.LOST: {
				this.multiplier = 0;
				this.score += this.scoreChange;
				this.scoreChange = 0;
				this.lose();
				break;
			}

			case GameState.GAME_OVER: {
				break;
			}

			case GameState.NONE:
			default: {
				break;
			}
		}

		if (this.grid.isDirty) {
			this.grid.calculateLessStateChange();
			this.renderGrid();
		}

		if (this.state != GameState.PAUSED) {
			this.newRowCumulativeTime += dt;
			if (this.newRowCumulativeTime > this.newRowTime) {
				this.newRowCumulativeTime = this.newRowTime;
			}
		}
	};



	Game.prototype.updateStateAddingNewRow = function (dt) {
		if (this.nextRow.length === 0) {
			this.nextRow = this.generateNextRow();
			this.renderNextRow();
		}
		if (this.newRow.length === 0) {
			this.newRow = this.nextRow;
		}

		this.newRowSlideIn += dt / this.newRowSlideInTime;

		if (this.newRowSlideIn >= 1) {
			for (var x = 0; x < this.gridWidth; x++) {
				if (this.grid.isSolidAt(x, 0)) {
					this.changeState(GameState.LOST);
					return;
				}

				for (var y = 0; y < this.gridHeight - 1; y++) {
					this.grid.setColourAt(x, y, this.grid.getColourAt(x, y + 1));
				}

				this.grid.setColourAt(x, this.gridHeight - 1, this.newRow[x]);
			}

			for (var x = 0; x < this.gridWidth; x++) {
				for (var y = 0; y < this.gridHeight; y++) {
					this.grid.setCellWorth(x, y, getColourPoints(this.grid.getColourAt(x, y)));
				}
			}

			this.newRow = [ ];
			this.nextRow = this.generateNextRow();
			this.renderNextRow();
			this.newRowSlideIn = 0;
			this.addedRows++;
			this.backState();
		}
	};



	Game.prototype.generateNextRow = function () {
		var nextRow = [ ];
		for (var i = 0; i < this.gridWidth; i++) {
			nextRow[i] = randomColour();
		};
		return nextRow;
	};



	Game.prototype.updateStatePlayerFalling = function (dt) {
		if (this.fallingPieces.length === 0) {
			this.grid.clearMarkedForClear();
			var newColour = this.nextFallingPieceColour;
			if (this.multiplier >= this.wildColourMultiplierMinimum) {
				newColour = Colour.WILD;
			} else {
				this.nextFallingPieceColour = randomColour();
			}
			this.fallingPieces.push([Math.floor(this.gridWidth / 2), -0.75 / this.playerFallTime, newColour, true]);
			this.playerHorizontalTarget = this.fallingPieces[0][0];		
		}

		this.multiplier = 0;

		var fallingPiece = this.fallingPieces[0];

		this.attemptMovePlayerHorizontal(dt);

		var fallSpeed = this.playerFallTime;
		if (isKeyDown(Key.DOWN)) {
			fallSpeed = this.playerFastFallTime;
		}

		var moved = this.attemptMoveFallingPiece(fallingPiece, 0, dt / fallSpeed);

		if (!moved) {
			if (!this.handleFallingPieceCollision(fallingPiece)) {
				return;
			}

			this.fallingPieces = [ ];
		}

		if (this.fallingPieces.length === 0) {
			this.grid.clearMarkedForClear();
			this.changeState(GameState.LANDING_CELLS);
		}
	};



	Game.prototype.updateLandingCells = function () {
		this.grid.clearLookedAt();

		if (this.landedCells.length > 0) {
			for (var i = 0; i < this.landedCells.length; i++) {

				var x = Math.floor(this.landedCells[i][0]);
				var y = Math.floor(this.landedCells[i][1]);
				var colour = this.landedCells[i][2];
				var canStartClear = this.landedCells[i][3];

				if (canStartClear && this.grid.isColourAt(x, y + 1, colour)) {
					if (!this.grid.isMarkedForClearAt(x, y) && !this.grid.isMarkedForClearAt(x, y + 1)) {
						var newColour = this.grid.getColourAt(x, y + 1);
						if (newColour === Colour.WILD) {
							newColour = colour;

							if (colour === Colour.WILD) {
								continue;
							}
						}

						var cells = this.grid.findFloodClearCells(x, y, newColour);
						if (cells.length >= this.minGroupSize) {
							if (colour !== Colour.WILD) {
								this.grid.setColourAt(x, y, colour);
								this.grid.setCellWorth(x, y, getColourPoints(newColour));
							} else {
								this.grid.setColourAt(x, y, Colour.WILD);
								this.grid.setCellWorth(x, y, getColourPoints(Colour.WILD));
							}

							this.markCellsForClear(cells);
							this.multiplier++;

							this.startFloodClearAt(x, y, newColour, this.floodClearLocations);
							this.grid.setMarkedForClearAt(x, y, true);
							this.grid.setMarkedForClearAt(x, y + 1, true);

						}
					}
				}
			}
		}

		this.landedCells = [ ];
		this.grid.clearMarkedForClear();
		if (this.floodClearLocations.length > 0) {
			this.changeState(GameState.PRE_CLEARING);
		} else {
			this.score += this.scoreChange;
			this.scoreChange = 0;
			this.changeState(GameState.PLAYER_FALLING);
		}
	};



	Game.prototype.updatePreClearing = function (dt) {
		this.preClearCumulativeTime += dt;
		while (this.preClearCumulativeTime >= this.preClearTime) {
			// this.scoreChange += this.floodClearLocations.length *  * this.multiplier;
			for (var i = 0; i < this.floodClearLocations.length; i++) {
				this.scoreChange += this.grid.getCellWorth(this.floodClearLocations[i][0], this.floodClearLocations[i][1]) * this.multiplier;
			}
			this.floodClearLocations = this.stepFloodClear(this.floodClearLocations);
			this.preClearCumulativeTime -= this.preClearTime;
		}

		if (this.floodClearLocations.length === 0) {
			this.changeState(GameState.CLEARING);
			this.preClearCumulativeTime = 0;
		}
	};



	Game.prototype.updateClearing = function (dt) {
		this.finalClearCumulativeTime += dt;
		if (this.finalClearCumulativeTime >= this.finalClearTime) {
			for (var i = 0; i < this.preClearedList.length; i++) {
				this.grid.setEmptyAt(this.preClearedList[i][0], this.preClearedList[i][1]);
			}

			this.preClearedList = [ ];
			this.changeState(GameState.GAP_FILL_FALL);
			this.finalClearCumulativeTime = 0;
		}
	};



	Game.prototype.updateGapFillFall = function (dt) {
		if (this.fallingPieces.length === 0) {
			this.floodClearLocations = [ ];
			this.fallingPieces = this.grid.findCellsToFall();
			this.grid.setFallingPiecesEmpty(this.fallingPieces);
			this.grid.clearMarkedForClear();
		}

		var newFallingPieces = [ ];
		for (var i = 0; i < this.fallingPieces.length; i++) {
			var fallingPiece = this.fallingPieces[i];
			var moved = this.attemptMoveFallingPiece(fallingPiece, 0, dt / this.gapFillTime);
			if (!moved) {
				if (!this.handleFallingPieceCollision(fallingPiece)) {
					return;
				}
			} else {
				newFallingPieces.push([fallingPiece[0], fallingPiece[1], fallingPiece[2], fallingPiece[3]]);
			}
		}

		this.fallingPieces = newFallingPieces;

		if (this.fallingPieces.length === 0) {
			this.grid.clearMarkedForClear();
			this.changeState(GameState.LANDING_CELLS);
		}
	};



	Game.prototype.handleFallingPieceCollision = function (fallingPiece) {
		var x = Math.floor(fallingPiece[0]);
		var y = Math.floor(fallingPiece[1]);
		if (y < 0) {
			this.changeState(GameState.LOST);
			return false;
		}
		var colour = fallingPiece[2];
		var canStartClear = fallingPiece[3];

		this.grid.setColourAt(fallingPiece[0], fallingPiece[1], fallingPiece[2]);
		this.grid.setCellWorth(getColourPoints(fallingPiece[2]));
		this.landedCells.push([fallingPiece[0], fallingPiece[1], fallingPiece[2], fallingPiece[3]]);
		return true;
	};



	Game.prototype.attemptMovePlayerHorizontal = function (dt) {
		var fallingPiece = this.fallingPieces[0];

		if (fallingPiece[1] < -1) {
			this.playerHorizontalTarget = fallingPiece[0];
			return;
		}

		if (isMouseDown() && (getMouseY() > topBarPixels)) {
			this.playerHorizontalTarget = Math.floor((getMouseX() / canvasWidth) * this.gridWidth);
		} else {
			var direction = 0;
			if (isKeyDown(Key.LEFT)) {
				direction--;
			}
			if (isKeyDown(Key.RIGHT)) {
				direction++;
			}

			if ((direction != 0)
				&& ((fallingPiece[0] === this.playerHorizontalTarget)
					|| ((this.playerHorizontalTarget > fallingPiece[0]) && (direction < 0))
					|| ((this.playerHorizontalTarget < fallingPiece[0]) && (direction > 0)))) {
				this.playerHorizontalTarget = Math.round(fallingPiece[0] + direction);
			}
		}

		if (this.playerHorizontalTarget < 0) {
			this.playerHorizontalTarget = 0;
		}

		if (this.playerHorizontalTarget >= this.gridWidth) {
			this.playerHorizontalTarget = this.gridWidth - 1;
		}

		if (fallingPiece[0] !== this.playerHorizontalTarget) {
			var moveAmount = dt / this.playerHorizontalMoveTime;
			var moveDirection = (this.playerHorizontalTarget > fallingPiece[0]) ? 1 : -1;
			
			if (Math.abs(fallingPiece[0] - this.playerHorizontalTarget) < moveAmount) {
				fallingPiece[0] = Math.round(this.playerHorizontalTarget);
			} else {
				fallingPiece[0] += moveAmount * moveDirection;
			}

			var x = fallingPiece[0];
			var y = fallingPiece[1];

			if (this.grid.isSolidAt(Math.floor(x), Math.floor(y)) || this.grid.isSolidAt(Math.floor(x), Math.ceil(y))) {
				fallingPiece[0] = Math.ceil(x);
				this.playerHorizontalTarget = fallingPiece[0];
			}

			if (this.grid.isSolidAt(Math.ceil(x), Math.floor(y)) || this.grid.isSolidAt(Math.ceil(x), Math.ceil(y))) {
				fallingPiece[0] = Math.floor(x);
				this.playerHorizontalTarget = fallingPiece[0];
			}
		}
	};



	Game.prototype.attemptMoveFallingPiece = function (fallingPiece, dx, dy) {
		var collision = false;
		var collidedAtLeastOnce = false;
		var collisionX = -1;
		var collisionY = -1;

		var newX = fallingPiece[0] + dx;
		var newY = fallingPiece[1] + dy;

		if (newX <= 0) {
			fallingPiece[0] = 0;
		}

		if (newX >= this.gridWidth - 1) {
			fallingPiece[0] = this.gridWidth - 1;
		}

		if (newY >= this.gridHeight - 1) {
			fallingPiece[1] = this.gridHeight - 1;
			return false;
		}

		if (fallingPiece[1] > -1) {
			var checkForCollision = true;

			var startX = (dx <= 0) ? Math.floor(fallingPiece[0]) : Math.ceil(fallingPiece[0]);
			var endX = (dx <= 0) ? Math.ceil(fallingPiece[0] + dx) : Math.floor(fallingPiece[0]);
			var incX = (dx <= 0) ? 1 : -1;

			while (checkForCollision) {
				collision = false;
				checkForCollision = false;

				if ((fallingPiece[1] < -1) && collidedAtLeastOnce){
					collision = true;
					collisionX = Math.floor(x);
					collisionY = Math.floor(fallingPiece[1]);
					break;
				}

				for (var x = startX; (dx <= 0) ? (x <= endX) : (x >= endX); x += incX) {
					for (var y = Math.floor(fallingPiece[1]); y < Math.ceil(fallingPiece[1] + dy) + 1; y++) {
						if (this.grid.isSolidAt(x, y)) {
							collision = true;
							collisionX = x;
							collisionY = y;
							break;
						}
					}
					if (collision) {
						break;
					}
				}

				if (collision) {
					checkForCollision = true;
					collidedAtLeastOnce = true;
					fallingPiece[1] = Math.floor(collisionY - 1);
					dy = 0;
				} else {
					checkForCollision = false;
				}
			}
		}

		if (collidedAtLeastOnce) {
			fallingPiece[0] = collisionX;
		} else {
			fallingPiece[0] += dx;
			fallingPiece[1] += dy;
		}

		return !collidedAtLeastOnce;
	};



	Game.prototype.renderGrid = function () {
		setCanvasSize(this.gridCanvas, gridPixelWidth, gridPixelHeight);

		if (!this.grid) {
			return;
		}

		var gridContext = this.gridCanvas.getContext("2d");

		for (var colour = 0; colour < this.grid.renderLessStateChange.length; colour++) {
			var points = this.grid.renderLessStateChange[colour];
			if (points.length === 0) {
				continue;
			}

			gridContext.fillStyle = colourStringLookup[colour];
			for (var i = 0; i < points.length; i++) {
				gridContext.fillRect(Math.floor(points[i][0] * cellSize), Math.floor(points[i][1] * cellSize), cellSize, cellSize);
			}
		}
	};



	Game.prototype.renderOutline = function () {
		setCanvasSize(this.outlineCanvas, gridPixelWidth, canvasHeight);

		if (!this.grid) {
			return;
		}

		var outlineContext = this.outlineCanvas.getContext("2d");

		outlineContext.strokeStyle = "black";
		outlineContext.lineWidth = "1";
		outlineContext.beginPath();

		for (var x = 0; x <= this.gridWidth; x++) {
			outlineContext.moveTo((x * cellSize) - 0.5, 0);
			outlineContext.lineTo((x * cellSize) - 0.5, canvasHeight);
		}

		for (var y = 0; y <= this.gridHeight; y++) {
			outlineContext.moveTo(0, (y * cellSize) - 0.5);
			outlineContext.lineTo(canvasWidth, (y * cellSize) - 0.5);
		}

		outlineContext.stroke();
	};



	Game.prototype.renderNextRow = function () {
		setCanvasSize(this.nextRowCanvas, gridPixelWidth, bottomBarPixels);

		var nextRowContext = this.nextRowCanvas.getContext("2d");
		nextRowContext.fillStyle = ColourString.GUI_BACKGROUND;
		nextRowContext.fillRect(0, 0, gridPixelWidth, bottomBarPixels);

		if (this.nextRow.length === 0) {
			return;
		}

		var smaller = 3;
		for (var i = 0; i < this.nextRow.length; i++) {
			nextRowContext.fillStyle = colourStringLookup[this.nextRow[i]];
			nextRowContext.fillRect(Math.floor((i * cellSize) + (smaller / 2)), smaller, Math.ceil(cellSize - smaller), bottomBarPixels);
		}
	};



	Game.prototype.renderPausedScreen = function () {
		setCanvasSize(this.pausedCanvas, gridPixelWidth, canvasHeight - topBarPixels);
		var pausedContext = this.pausedCanvas.getContext("2d");

		pausedContext.fillStyle = ColourString.PAUSED_BACKGROUND;
		pausedContext.fillRect(0, 0, canvasWidth, canvasHeight - topBarPixels);

		pausedContext.fillStyle = ColourString.PAUSED_TEXT;
		pausedContext.textAlign = "center";
		pausedContext.font = "bold " + (this.sureLeave ? "28" : "32") + "pt sans-serif";
		var pausedText = this.sureLeave ? getTranslation("GAME_SURE_LEAVE") : getTranslation("GAME_PAUSED");
		pausedContext.fillText(pausedText, gridPixelWidth / 2, (canvasHeight - topBarPixels) / 2);


		var buttonText = this.sureLeave ? getTranslation("GAME_YES") : getTranslation("GAME_BACK_MENU");
		pausedContext.textAlign = "center";
		pausedContext.textBaseline = "middle";
		pausedContext.font = "24pt sans-serif";
		this.leaveButtonWidth = Math.max(pausedContext.measureText(buttonText).width + (canvasWidth * 0.05), canvasWidth * 0.5);
		this.leaveButtonHeight = canvasHeight * 0.08;
		this.leaveButtonBottomPadding = canvasHeight * 0.2;
		this.leaveButtonX = (canvasWidth - this.leaveButtonWidth) / 2;
		this.leaveButtonY = canvasHeight - (this.leaveButtonHeight + this.leaveButtonBottomPadding) + topBarPixels;

		pausedContext.fillStyle = ColourString.GUI_BACKGROUND;
		pausedContext.fillRect(this.leaveButtonX, this.leaveButtonY - topBarPixels, this.leaveButtonWidth, this.leaveButtonHeight);

		pausedContext.fillStyle = ColourString.TEXT;
		pausedContext.fillText(buttonText, canvasWidth / 2, this.leaveButtonY - topBarPixels + (this.leaveButtonHeight / 2));
	};



	Game.prototype.renderPauseButton = function () {
		this.pauseButtonSize = topBarPixels * 0.8;
		this.pauseButtonX = canvasWidth - topBarPixels * 0.9;
		this.pauseButtonY = topBarPixels * 0.1;

		setCanvasSize(this.pauseButtonCanvas, this.pauseButtonSize, this.pauseButtonSize);

		var pauseButtonContext = this.pauseButtonCanvas.getContext("2d");
		pauseButtonContext.fillStyle = ColourString.PAUSE_BUTTON_BACKGROUND;
		pauseButtonContext.fillRect(0, 0, this.pauseButtonSize, this.pauseButtonSize);

		pauseButtonContext.fillStyle = ColourString.PAUSE_BUTTON_BAR;
		pauseButtonContext.fillRect(this.pauseButtonSize * 0.2, this.pauseButtonSize * 0.15, this.pauseButtonSize * 0.2, this.pauseButtonSize * 0.7);
		pauseButtonContext.fillRect(this.pauseButtonSize * 0.6, this.pauseButtonSize * 0.15, this.pauseButtonSize * 0.2, this.pauseButtonSize * 0.7);
	};



	Game.prototype.renderGameOver = function () {
		setCanvasSize(this.gameOverCanvas, canvasWidth, canvasHeight);

		var gameOverContext = this.gameOverCanvas.getContext("2d");
		gameOverContext.fillStyle = ColourString.NONE;
		gameOverContext.fillRect(0, 0, canvasWidth, canvasHeight);

		gameOverContext.fillStyle = ColourString.TEXT;
		gameOverContext.textAlign = "center";
		gameOverContext.textBaseline = "middle";
		gameOverContext.font = "bold 38pt sans-serif";
		var gameOverText = getTranslation("GAME_OVER");
		gameOverContext.fillText(gameOverText, canvasWidth / 2, canvasHeight * 0.25);

		var scoreText = getTranslation("GAME_SCORE").replace("%d", Math.floor(this.score));
		gameOverContext.font = "bold 28pt sans-serif";
		gameOverContext.fillText(scoreText, canvasWidth / 2, canvasHeight * 0.5);

		var buttonText = getTranslation("GAME_BACK_MENU");
		gameOverContext.textAlign = "center";
		gameOverContext.textBaseline = "middle";
		gameOverContext.font = "24pt sans-serif";
		this.leaveButtonWidth = Math.max(gameOverContext.measureText(buttonText).width + (canvasWidth * 0.05), canvasWidth * 0.5);
		this.leaveButtonHeight = canvasHeight * 0.08;
		this.leaveButtonBottomPadding = canvasHeight * 0.2;
		this.leaveButtonX = (canvasWidth - this.leaveButtonWidth) / 2;
		this.leaveButtonY = canvasHeight - (this.leaveButtonHeight + this.leaveButtonBottomPadding) + topBarPixels;

		gameOverContext.fillStyle = ColourString.GUI_BACKGROUND;
		gameOverContext.fillRect(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight);

		gameOverContext.fillStyle = ColourString.TEXT;
		gameOverContext.fillText(buttonText, canvasWidth / 2, this.leaveButtonY + (this.leaveButtonHeight / 2));
	};



	Game.prototype.render = function () {
		if (this.state != GameState.GAME_OVER) {
			context.translate(0, topBarPixels, 0);
			{

				context.drawImage(this.gridCanvas, 0, -this.newRowSlideIn * cellSize);

				if (this.state === GameState.ADDING_NEW_ROW) {
					for (var x = 0; x < this.newRow.length; x++) {
						context.fillStyle = colourStringLookup[this.newRow[x]];
						context.fillRect(x * cellSize, Math.floor((this.gridHeight - this.newRowSlideIn) * cellSize), cellSize, cellSize);
					}
				}

				for (var i = 0; i < this.fallingPieces.length; i++) {
					context.fillStyle = colourStringLookup[this.fallingPieces[i][2]];
					context.fillRect(Math.floor(this.fallingPieces[i][0] * cellSize), Math.floor(this.fallingPieces[i][1] * cellSize), cellSize, cellSize);
				}

				if (this.multiplier != 0) {
					context.textAlign = "center"
					context.textBaseline = "middle";
					context.fillStyle = ColourString.MULTIPLIER_TEXT;
					context.font = "bold 11pt sans-serif";

					var multiplierText = "x" + Math.round(this.multiplier);

					for (var x = 0; x < this.gridWidth; x++) {
						for (var y = 0; y < this.gridHeight; y++) {
							var colour = this.grid.getColourAt(x, y);
							if (isLightColour(colour)) {
								multiplierText = "+" + (this.grid.getCellWorth(x, y) * this.multiplier);
								context.fillText(multiplierText, Math.floor((x + 0.5) * cellSize), Math.floor((y + 0.5) * cellSize), cellSize * 0.9);
							}
						}
					}
				}
			}
			context.translate(0, -topBarPixels, 0);

			context.drawImage(this.nextRowCanvas, 0, canvasHeight - bottomBarPixels);
			// context.drawImage(this.outlineCanvas, 0, topBarPixels);

			context.fillStyle = ColourString.GUI_BACKGROUND;
			context.fillRect(0, 0, canvasWidth, topBarPixels);

			var offset = topBarPixels * 0.15;

			context.fillStyle = ColourString.TEXT;
			context.font = "bold 14pt sans-serif";
			context.textAlign = "left"
			context.textBaseline = "top";

			var scoreText = "";
			var maxWidth = canvasWidth; //  * 0.7;

			if (this.scoreChange === 0) {
				scoreText = getTranslation("GAME_SCORE").replace("%d", Math.floor(this.score));
			} else {
				scoreText = getTranslation("GAME_SCORE_EXTRA").replace("%d", Math.floor(this.score)).replace("%d", this.scoreChange);
				maxWidth = canvasWidth * 0.5;
			}

			context.fillText(scoreText, offset, offset); // , maxWidth);
			var nextText = getTranslation("GAME_NEXT_PIECE")
			var nextWidth = context.measureText(nextText).width;
			context.fillText(nextText, offset, offset * 3.3);

			context.fillStyle = colourStringLookup[this.nextFallingPieceColour];
			context.fillRect(offset + nextWidth, offset * 3.25, topBarPixels / 2.5, topBarPixels / 2.5);

			context.drawImage(this.pauseButtonCanvas, this.pauseButtonX, this.pauseButtonY);

			if (isMouseOver(this.pauseButtonX, this.pauseButtonY, this.pauseButtonSize, this.pauseButtonSize)) {
				context.beginPath();
				context.strokeStyle = ColourString.OUTLINE;
				context.lineWidth = "3";
				context.rect(this.pauseButtonX, this.pauseButtonY, this.pauseButtonSize, this.pauseButtonSize);
				context.stroke();
			}

			if (this.state === GameState.PAUSED) {
				context.drawImage(this.pausedCanvas, 0, topBarPixels);

				if (isMouseOver(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight)) {
					context.beginPath();
					context.strokeStyle = ColourString.OUTLINE;
					context.lineWidth = "3";
					context.rect(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight);
					context.stroke();
				}
			} else {
				// if (!isTouchDevice() || (isTouchDevice() && isMouseDown())) {
				if (this.state != GameState.PAUSED) {
					var cellY = Math.floor(((getMouseY() - topBarPixels) / gridPixelHeight) * this.gridHeight);
					if ((cellY >= 0) && (cellY < this.gridHeight)) {
						var cellX = Math.floor((getMouseX() / gridPixelWidth) * this.gridWidth);
						/*
						var topY = 0;
						for (topY = 0; topY < this.gridHeight, this.grid.isEmptyAt(cellX, topY); topY++) {
						}
						context.fillStyle = "#dddddd";
						context.fillRect(cellX * cellSize, 0, cellSize, topY * cellSize);
						*/
						context.beginPath();
						context.strokeStyle = ColourString.OUTLINE;
						context.lineWidth = "3";
						context.rect(cellX * cellSize, topBarPixels + (cellY * cellSize), cellSize, cellSize);
						context.stroke();
					}
				}

				
				// }
			}
		} else {
			context.drawImage(this.gameOverCanvas, 0, 0);
			if (isMouseOver(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight)) {
				context.beginPath();
				context.strokeStyle = ColourString.OUTLINE;
				context.lineWidth = "3";
				context.rect(this.leaveButtonX, this.leaveButtonY, this.leaveButtonWidth, this.leaveButtonHeight);
				context.stroke();
			}
		}
	};



	Game.prototype.lose = function () {
		this.changeState(GameState.GAME_OVER);
	};



	Game.prototype.startFloodClearAt = function (x, y, colour, floodClearList) {
		if (this.grid.isColourAt(x, y, colour) && !this.grid.hasBeenLookedAt(x, y)) {
			floodClearList.push([x, y, colour]);
			this.grid.setLookedAt(x, y, true);
		}
	};



	Game.prototype.stepFloodClear = function (floodClearList) {
		var newClearList = [ ];
		this.grid.clearLookedAt();

		for (var i = 0; i < floodClearList.length; i++) {
			var x = floodClearList[i][0];
			var y = floodClearList[i][1];
			var colour = floodClearList[i][2];
			var lighter = lighterColour(colour);

			if (this.grid.getColourAt(x, y) === Colour.WILD) {
				lighter = lighterColour(Colour.WILD);
			}

			this.grid.setColourAt(x, y, lighter);
			this.grid.setCellWorth(x, y, getColourPoints(lighter));

			this.preClearedList.push([x, y]);

			this.startFloodClearAt(x, y - 1, colour, newClearList);
			this.startFloodClearAt(x + 1, y, colour, newClearList);
			this.startFloodClearAt(x, y + 1, colour, newClearList);
			this.startFloodClearAt(x - 1, y, colour, newClearList);
		}

		return newClearList;
	};



	Game.prototype.markCellsForClear = function (cells) {
		for (var i = 0; i < cells.length; i++) {
			this.grid.setMarkedForClearAt(cells[i][0], cells[i][1], true);
		}
	};

	

	window.Game = Game;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// menu.js

(function (window) {
	var Menu = function () {
		this.waitTime = 2;
		this.currentTime = 0;

		this.titleWidth = 720;
		this.titleHeight = 320;
		this.titleCanvas = createCanvas(this.titleWidth, this.titleHeight);

		this.buttons = [getTranslation("MENU_PLAY"), getTranslation("MENU_HIGHSCORES"), getTranslation("MENU_SETTINGS"), getTranslation("MENU_HELP")];
		this.buttonColours = [Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW];
		this.selectedButton = -1;

		this.keyDownWaitTime = 0.25;
		this.keyDownCooldown = 0;

		this.titleHorizontalPadding = 1;
		this.titleVerticalPadding = 1;
		this.titleRenderHeight = 1;

		this.buttonStepHeight = 1;
		this.buttonStartHeight = 1;
		this.halfButtonStepHeight = 0.5;
		this.buttonMaxWidth = 1;
	};

	Menu.prototype = new Screen();
	Menu.prototype.constructor = Menu;



	Menu.prototype.init = function () {
		this.renderTitle();
	};



	Menu.prototype.onResize = function () {
		this.titleHorizontalPadding = canvasWidth * 0.02;
		this.titleVerticalPadding = canvasHeight * 0.02;
		this.titleRenderHeight = canvasHeight * 0.25;

		this.buttonStepHeight = canvasHeight * 0.15;
		this.buttonStartHeight = this.titleRenderHeight + (this.buttonStepHeight * 0.5);
		this.buttonMaxWidth = canvasWidth * 0.95;
		this.halfButtonStepHeight = this.buttonStepHeight / 2;
	};



	Menu.prototype.update = function (dt) {
		this.keyDownCooldown -= dt;
		if (this.keyDownCooldown <= 0) {
			this.keyDownCooldown = 0;
		}
		if (!isKeyDown(Key.UP) && !isKeyDown(Key.DOWN)) {
			this.keyDownCooldown = 0;
		}

		var mouseX = getMouseX();
		var mouseY = getMouseY();

		if ((mouseY >= this.buttonStartHeight) && (mouseY <= this.buttonStartHeight + (this.buttons.length * this.buttonStepHeight))
			&& (mouseX >= canvasWidth * 0.1) && (mouseX <= canvasWidth * 0.9)) {
			if (isMouseDown()) {
				clearKeys();
			}

			mouseY -= this.buttonStartHeight;
			var newSelected = Math.floor(mouseY / this.buttonStepHeight);

			if (newSelected < this.buttons.length) {
				this.selectedButton = newSelected;

				if (isMouseDown() && wasMouseUp()) {
					this.performButtonClick();
				}
			}
		
		}/* else {
			this.selectedButton = -1;
		}*/
		else if (this.keyDownCooldown <= 0) {
			var direction = 0;

			if (isKeyDown(Key.UP)) {
				direction--;
			}

			if (isKeyDown(Key.DOWN)) {
				direction++;
			}

			if (direction != 0) {
				this.keyDownCooldown = this.keyDownWaitTime;
				this.selectedButton += direction;

				if (this.selectedButton < 0) {
					this.selectedButton = this.buttons.length - 1;
				}

				if (this.selectedButton >= this.buttons.length) {
					this.selectedButton = 0;
				}
			}
		}

		if (isKeyDown(Key.ENTER)) {
			this.performButtonClick();
		}
	};



	Menu.prototype.performButtonClick = function () {
		switch (this.selectedButton) {
			case 0: {
				changeScreen(new Game());
				break;
			}
		}
	};



	Menu.prototype.renderTitle = function () {
		var titleContext = this.titleCanvas.getContext("2d");

		titleContext.textBaseline = "top"
		titleContext.font = "italic bolder 82pt sans-serif";
		titleContext.fillStyle = ColourString.RED;
		titleContext.textAlign = "left";
		titleContext.fillText(getTranslation("TITLE_WORD_ONE"), 0, 0);

		titleContext.fillStyle = ColourString.GREEN;
		titleContext.textAlign = "right";
		titleContext.fillText(getTranslation("TITLE_WORD_TWO"), this.titleWidth, this.titleHeight / 2);
	};



	Menu.prototype.render = function () {
		context.fillStyle = ColourString.NONE;
		context.fillRect(0, 0, canvasWidth, canvasHeight);

		context.drawImage(this.titleCanvas, this.titleHorizontalPadding, this.titleVerticalPadding, canvasWidth - (2 * this.titleHorizontalPadding), this.titleRenderHeight);

		context.textAlign = "center";
		context.textBaseline = "middle"
		

		for (var i = 0; i < this.buttons.length; i++) {
			var buttonText = this.buttons[i];
			if (i === this.selectedButton) {
				context.fillStyle = colourStringLookup[lighterColour(this.buttonColours[this.selectedButton])];
				context.font = "bolder 38pt sans-serif";
				// buttonText = "> " + buttonText + " <";
			} else {
				context.fillStyle = colourStringLookup[this.buttonColours[i]];
				context.font = "38pt sans-serif";
			}
			context.fillText(buttonText, canvasWidth / 2, this.buttonStartHeight + this.halfButtonStepHeight + (i * this.buttonStepHeight), this.buttonMaxWidth);
		}

		// context.fillStyle = colourStringLookup[lighterColour(this.buttonColours[this.selectedButton])];
		// context.font = "bolder 38pt sans-serif";
		// context.fillText("> " + this.buttons[this.selectedButton] + " <", canvasWidth / 2, this.buttonStartHeight + this.halfButtonStepHeight + (this.selectedButton * this.buttonStepHeight), this.buttonMaxWidth);
	};



	window.Menu = Menu;
})(window);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// script.js

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