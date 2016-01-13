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

		this.grid.setColourAt(fallingPiece[0], fallingPiece[1], fallingPiece[2]); //////////////////////////////////////////////////////////////////////////////// What? Missing 2 parameters
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
					//////////////////////////////////////// fallingPiece[0] ?
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
			context.textAlign = "left";
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