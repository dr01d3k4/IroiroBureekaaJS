// Generated by CoffeeScript 1.6.3
(function(window) {
  var Game, GameState;
  GameState = {
    NONE: 0,
    INITIALIZING: 1,
    ADDING_NEW_ROW: 2,
    PLAYER_FALLING: 3,
    LANDING_CELLS: 4,
    PRE_CLEARING: 5,
    CLEARING: 6,
    GAP_FILL_FALL: 7,
    PAUSED: 8,
    LOST: 9
  };
  return Game = (function() {
    var attemptMoveFallingPiece;

    function Game() {
      this.reset();
    }

    Game.prototype.reset = function() {
      this.grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
      this.state = GameState.NONE;
      this.previousState = GameState.NONE;
      this.nextRow = [];
      this.newRow = [];
      this.newRowSlideIn = 0;
      this.newRowSlideInTime = 0.22;
      this.addedRows = 0;
      this.startingRows = START_HEIGHT;
      this.newRowBaseTime = 12;
      this.newRowRandomTime = 10;
      this.newRowTime = this.newRowBaseTime + randomNumberInclusive(0, this.newRowRandomTime);
      this.newRowCumulativeTime = 0;
      this.fallingPieces = [];
      this.nextFallingPieceColour = randomColour();
      this.playerFallTime = 0.18;
      this.playerFastFallTime = 0.08;
      this.playerHorizontalMoveTime = 0.1;
      this.playerHorizontalTarget = Math.floor(this.grid.width / 2);
      this.landedCells = [];
      this.floodClearLocations = [];
      this.preClearedList = [];
      this.preClearTime = 0.07;
      this.preClearCumulativeTime = 0;
      this.finalClearTime = 0.28;
      this.finalClearCumulativeTime = 0;
      this.gapFillTime = 0.08;
      this.score = 0;
      this.multiplier = 0;
      this.pointsPerCell = 5;
      this.minGroupSize = 3;
      this.gridCanvas = createCanvas(gridPixelWidth, gridPixelHeight);
      this.outlineCanvas = createCanvas(gridPixelWidth, canvasHeight);
      this.nextRowCanvas = createCanvas(gridPixelWidth, bottomBarPixels);
      return this.pausedCanvas = createCanvas(gridPixelWidth, canvasHeight - topBarPixels);
    };

    Game.prototype.init = function() {
      this.grid.init();
      this.renderGrid();
      this.renderOutline();
      this.renderNextRow();
      this.renderPausedScreen();
      return this.changeState(GameState.INITIALIZING);
    };

    Game.prototype.onResize = function() {
      setCanvasSize(this.gridCanvas, gridPixelWidth, gridPixelHeight);
      this.renderGrid();
      this.renderOutline();
      this.renderNextRow();
      return this.renderPausedScreen();
    };

    Game.prototype.onFocusLost = function() {
      return this.changeState(GameState.PAUSED);
    };

    Game.prototype.changeState = function(newState, goingBack) {
      if (goingBack == null) {
        goingBack = false;
      }
      if (newState === GameState.PAUSED) {
        if (this.state !== GameState.INITIALIZING && this.state !== GameState.ADDING_NEW_ROW) {
          this.previousState = this.state;
          this.state = GameState.PAUSED;
        }
        return;
      }
      this.grid.clearMarkedForClear();
      this.grid.clearLookedAt();
      if (newState === GameState.LOST) {
        this.previousState = GameState.NONE;
        this.state = GameState.LOST;
        return;
      }
      this.previousState = this.state;
      if (!goingBack && this.newRowCumulativeTime >= this.newRowTime && newState === GameState.PLAYER_FALLING) {
        this.newRowCumulativeTime = 0;
        this.newRowTime = this.newRowBaseTime + randomNumberInclusive(0, this.newRowRandomTime);
        return this.changeState(GameState.ADDING_NEW_ROW);
      } else {
        return this.state = newState;
      }
    };

    Game.prototype.backState = function() {
      return this.changeState(this.previousState, true);
    };

    Game.prototype.update = function(dt) {
      if (!hasFocus) {
        return;
      }
      switch (this.state) {
        case GameState.INITIALIZING:
          if (this.addedRows < this.startingRows) {
            this.changeState(GameState.ADDING_NEW_ROW);
          } else {
            this.changeState(GameState.PLAYER_FALLING);
          }
          break;
        case GameState.ADDING_NEW_ROW:
          this.updateStateAddingNewRow(dt);
          break;
        case GameState.PLAYER_FALLING:
          this.updateStatePlayerFalling(dt);
          break;
        case GameState.LANDING_CELLS:
          this.updateLandingCells();
          break;
        case GameState.PRE_CLEARING:
          this.updatePreClearing(dt);
          break;
        case GameState.CLEARING:
          this.updateClearing(dt);
          break;
        case GameState.GAP_FILL_FALL:
          this.updateGapFillFall(ddt);
          break;
        case GameState.LOST:
          this.lose();
      }
      if (this.grid.isDirty) {
        this.grid.calculateLessStateChange();
        this.renderGrid();
      }
      if (isKeyDown(Key.PAUSE) && wasKeyUp(Key.PAUSE)) {
        if (this.state === GameState.PAUSED) {
          this.backState();
        } else {
          this.changeState(GameState.PAUSED);
        }
      }
      if (this.state !== GameState.PAUSED) {
        this.newRowCumulativeTime += dt;
        if (this.newRowCumulativeTime > this.newRowBaseTime) {
          return this.newRowCumulativeTime = this.newRowTime;
        }
      }
    };

    Game.prototype.updateStateAddingNewRow = function(dt) {
      var x, y, _i, _j, _ref, _ref1;
      if (this.nextRow.length === 0) {
        this.nextRow = this.generateNextRow();
        this.renderNextRow();
      }
      if (this.newRow.length === 0) {
        this.newRow = this.nextRow;
      }
      this.newRowSlideIn += dt / this.newRowSlideInTime;
      if (this.newRowSlideIn >= 1) {
        for (x = _i = 0, _ref = this.gridWidth; _i < _ref; x = _i += 1) {
          if (this.grid.isSolidAt(x, 0)) {
            this.changeState(GameState.LOST);
            return;
          }
          for (y = _j = 0, _ref1 = this.gridHeight; _j < _ref1; y = _j += 1) {
            this.grid.setColourAt(x, y, this.grid.getColourAt(x, y + 1));
          }
        }
        this.newRow = [];
        this.nextRow = this.generateNextRow();
        this.renderNextRow();
        this.newRowSlideIn = 0;
        this.addedRows++;
        return this.backState();
      }
    };

    Game.prototype.generateNextRow = function() {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.gridWidth; _i < _ref; i = _i += 1) {
        _results.push(randomColour());
      }
      return _results;
    };

    Game.prototype.updateStatePlayerFalling = function(dt) {
      var fallSpeed, fallingPiece, moved;
      this.multiplier = 0;
      if (this.fallingPieces.length === 0) {
        this.grid.clearMarkedForClear();
        this.fallingPieces.push([Math.floor(this.gridWidth / 2), -1 / this.playerFallTime, this.nextFallingPieceColour, true]);
        this.playerHorizontalTarget = this.fallingPieces[0][0];
        this.nextFallingPieceColour = randomColour();
      }
      fallingPiece = this.fallingPieces[0];
      this.attemptMovePlayerHorizontal(dt);
      fallSpeed = this.playerFallTime;
      if (isKeyDown(Key.DOWN)) {
        fallSpeed = this.playerFastFallTime;
      }
      moved = this.attemptMoveFallingPiece(fallingPiece, 0, dt / fallSpeed);
      if (!moved) {
        this.handleFallingPieceCollision(fallingPiece);
        if (this.state === GameState.LOST) {
          return;
        }
        this.fallingPieces = [];
      }
      if (this.fallingPieces.length === 0) {
        this.grid.clearMarkedForClear;
        return this.changeState(GameState.LANDING_CELLS);
      }
    };

    Game.prototype.updateLandingCells = function() {
      var canStartClear, cells, colour, x, y, _i, _len, _ref, _ref1;
      this.grid.clearLookedAt();
      if (this.landedCells.length > 0) {
        _ref = this.landedCells;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], x = _ref1[0], y = _ref1[1], colour = _ref1[2], canStartClear = _ref1[3];
          if (canStartClear && this.grid.isColourAt(x, y + 1, colour)) {
            if (!(this.grid.isMarkedForClearAt(x, y) || this.grid.isMarkedForClearAt(x, y + 1))) {
              cells = this.grid.findFloodClearCells(x, y, colour);
              if (cells.length >= this.minGroupSize) {
                this.markCellsForClear(cells);
                this.multiplier++;
                this.startFloodClearAt(x, y, colour, this.floodClearLocations);
                this.grid.setMarkedForClearAt(x, y, true);
                this.grid.setMarkedForClearAt(x, y + 1, true);
              }
            }
          }
        }
      }
      this.landedCells = [];
      this.grid.clearMarkedForClear();
      if (this.floodClearLocations.length > 0) {
        return this.changeState(GameState.PRE_CLEARING);
      } else {
        return this.gameState.PLAYER_FALLING;
      }
    };

    Game.prototype.updatePreClearing = function(dt) {
      this.preClearCumulativeTime += dt;
      if (this.preClearCumulativeTime >= this.preClearTime) {
        this.floodClearLocations = this.stepFloodClear(this.floodClearLocations);
        this.preClearCumulativeTime -= this.preClearTime;
      }
      if (this.floodClearLocations.length === 0) {
        this.changeState(GameState.CLEARING);
        return this.preClearCumulativeTime = 0;
      }
    };

    Game.prototype.updateClearing = function(dt) {
      var x, y, _i, _len, _ref, _ref1;
      this.finalClearCumulativeTime += dt;
      if (this.finalClearCumulativeTime >= this.finalClearTime) {
        _ref = this.preClearedList;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], x = _ref1[0], y = _ref1[1];
          this.score += this.pointsPerCell * this.multiplier;
          this.grid.setEmptyAt(x, y);
        }
        this.preClearedList = [];
        this.changeState(GameState.GAP_FILL_FALL);
        return this.finalClearCumulativeTime = 0;
      }
    };

    Game.prototype.updateGapFillFall = function(dt) {
      var fallingPiece, moved, newFallingPieces, _i, _len, _ref;
      if (this.fallingPieces.length === 0) {
        this.floodClearLocations = [];
        this.fallingPieces = this.findCellsToFall();
        this.grid.clearMarkedForClear;
      }
      newFallingPieces = [];
      _ref = this.fallingPieces;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fallingPiece = _ref[_i];
        moved = this.attemptMoveFallingPiece(fallingPiece, 0, dt / this.gapFillTime);
        if (!moved) {
          this.handleFallingPieceCollision(fallingPiece);
          if (this.state === GameState.LOST) {
            return;
          }
        } else {
          newFallingPieces.push(fallingPiece);
        }
      }
      this.fallingPieces = newFallingPieces;
      if (this.fallingPieces.length === 0) {
        this.grid.clearMarkedForClear();
        return this.changeState(GameState.LANDING_CELLS);
      }
    };

    Game.prototype.handleFallingPieceCollision = function(fallingPiece) {
      var canStartClear, colour, x, y;
      x = Math.floor(fallingPiece[0]);
      y = Math.floor(fallingPiece[1]);
      if (y < 0) {
        this.changeState(GameState.LOST);
        return;
      }
      colour = fallingPiece[2];
      canStartClear = fallingPieces[3];
      this.setPieceOnGrid(fallingPiece);
      return this.landedCells.push(fallingPiece);
    };

    Game.prototype.attemptMovePlayerHorizontal = function(dt) {
      var direction, fallingPiece, moveAmount, movingRight, xInMovingDirecton;
      fallingPiece = this.fallingPieces[0];
      if (isMouseDown()) {
        this.playerHorizontalTarget = Math.floor((getMouseX() / canvasHeight) * this.gridWidth);
      } else {
        direction = 0;
        if (isKeyDown(Key.LEFT)) {
          direction--;
        }
        if (isKeyDown(Key.RIGHT)) {
          direction++;
        }
        if (fallingPiece[0] === this.playerHorizontalTarget || (playerHorizontalTarget > fallingPiece[0] && direction < 0) || (playerHorizontalTarget < fallingPiece[0] && direction > 0)) {
          this.playerHorizontalTarget = Math.round(fallingPiece[0] + direction);
        }
      }
      if (this.playerHorizontalTarget < 0) {
        this.playerHorizontalTarget = 0;
      }
      if (this.playerHorizontalTarget >= this.gridWidth) {
        this.playerHorizontalTarget = this.gridWidth - 1;
      }
      moveAmount = dt / this.playerHorizontalMoveTime;
      if (this.playerHorizontalTarget > fallingPiece[0]) {
        fallingPiece[0] += moveAmount;
      } else if (this.playerHorizontalTarget < fallingPiece[0]) {
        fallingPiece[0] -= moveAmount;
      }
      if (Math.abs(fallingPiece[0] - this.playerHorizontalTarget) < moveAmount) {
        fallingPiece[0] = Math.round(fallingPiece[0]);
      }
      movingRight = this.playerHorizontalTarget > fallingPiece[0];
      xInMovingDirecton = movingRight ? Math.ceil(fallingPiece[0]) : Math.floor(fallingPiece[0]);
      if (this.grid.isSolidAt(xInMovingDirecton, Math.floor(fallingPiece[1])) || this.grid.isSolidAt(xInMovingDirecton, Math.ceil(fallingPiece[1]))) {
        return fallingPiece[0] = Math.floor(fallingPiece[0] + (movingRight ? 0.5 : 0));
      }
    };

    attemptMoveFallingPiece = function(fallingPiece, dx, dy) {
      var collision, collisionX, collisionY, endX, incX, newX, newY, startX, x, y, _i, _ref, _ref1;
      collision = false;
      collisionX = -1;
      collisionY = -1;
      newX = fallingPiece[0] + dx;
      newY = fallingPiece[1] + dy;
      if (newX < 0) {
        fallingPiece[0] = 0;
      }
      if (newX >= this.gridWidth) {
        fallingPiece[0] = this.gridWidth - 1;
      }
      if (newY >= this.gridHeight) {
        fallingPiece[1] = this.gridHeight - 1;
        return false;
      }
      startX = dx <= 0 ? Math.floor(fallingPiece[0]) : Math.ceil(fallingPiece[0]);
      endX = dx <= 0 ? Math.ceil(fallingPiece[0] + dx) : Math.floor(fallingPiece[0]);
      incX = dx <= 0 ? 1 : -1;
      x = startX;
      while ((dx <= 0 ? x <= endX : x >= endX)) {
        for (y = _i = _ref = Math.floor(fallingPiece[1]), _ref1 = Math.ceil(fallingPiece[1] + dy); _i <= _ref1; y = _i += 1) {
          if (this.grid.isSolidAt(x, y)) {
            collision = true;
            collisionX = x;
            collisionY = y;
          }
        }
        if (collision) {
          break;
        }
        x += incX;
      }
      if (collision) {
        fallingPiece[0] = collisionX;
        fallingPiece[1] = collisionY;
      } else {
        fallingPiece[0] += dx;
        fallingPiece[1] += dy;
      }
      return !collision;
    };

    Game.prototype.renderGrid = function() {
      var colour, gridContext, points, x, y, _i, _j, _len, _ref, _ref1;
      setCanvasSize(this.gridCanvas, gridPixelWidth, gridPixelHeight);
      if (typeof grid === "undefined" || grid === null) {
        return;
      }
      gridContext = this.gridCanvas.getContext("2d");
      for (colour = _i = 0, _ref = this.grid.renderLessStateChange.length; _i < _ref; colour = _i += 1) {
        points = this.grid.renderLessStateChange[colour];
        if (points.length === 0) {
          continue;
        }
        gridContext.fillStyle = allColours[colour];
        for (_j = 0, _len = points.length; _j < _len; _j++) {
          _ref1 = points[_j], x = _ref1[0], y = _ref1[1];
          gridContext.fillRect(Math.floor(x * cellSize), Math.floor(y * cellSize), cellSize, cellSize);
        }
      }
      return null;
    };

    Game.prototype.renderOutline = function() {
      setCanvasSize(this.outlineCanvas, gridPixelWidth, gridPixelHeight);
      if (!this.grid) {

      }
    };

    return Game;

  })();
})(window);