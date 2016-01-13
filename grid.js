(function (window) {
	var GRID_WIDTH = 14;
	var GRID_HEIGHT = 22;
	var START_HEIGHT = Math.ceil(GRID_HEIGHT / 4.0);



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
	};



	Grid.prototype.setCellWorth = function (x, y, worth) {
		if (this.inBounds(x, y)) {
			this.cellWorth[x][y] = worth;
		}
	};



	Grid.prototype.isExactlyColourAt = function (x, y, colour) {
		return (this.getColourAt(x, y) === colour);
	};



	Grid.prototype.isColourAt = function (x, y, colour) {
		var colourOnGrid = this.getColourAt(x, y);
		if (colourOnGrid === colour) {
			return true;
		} else if (((colour === Colour.WILD) && (colourOnGrid !== Colour.NONE)) || (colourOnGrid === Colour.WILD)) {
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