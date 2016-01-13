((window) ->
	GRID_WIDTH = 14
	GRID_HEIGHT = 20
	START_HEIGHT = 6



	class Grid
		constructor: (width, height) ->
			@width = width
			@height = height
			@grid = [ ]
			@markedForClear = [ ]
			@lookedAt = [ ]
			@isDirty = no
			@renderLessStateChange = [ ]



		init: ->
			for x in [0...@width] by 1
				@grid[x] = [ ]
				@markedForClear[x] = [ ]
				@lookedAt[x] = [ ]
				for y in [0...@height] by 1
					@grid[x][y] = Colour.NONE
					@markedForClear[x][y] = no
					@lookedAt[x][y] = no
			null



		inBounds: (x, y) -> x >= 0 and x < @width and y >= 0 and y < @height



		getColourAt: (x, y) ->
			if @inBounds x, y
				@grid[x][y]
			else
				Color.NONE



		setColourAt: (x, y, colour) ->
			if @inBounds x, y
				@grid[x][y] = colour
				@isDirty = yes



		isColourAt: (x, y, colour) ->
			return colour is @getColourAt x, y



		isEmptyAt: (x, y) ->
			return @isColourAt x, y, Colour.NONE



		isSolidAt: (x, y) ->
			return not isEmptyAt x, y



		setEmptyAt: (x, y) ->
			@setColourAt x, y, Colour.NONE



		isMarkedForClearAt: (x, y) ->
			if @inBounds x, y
				return @markedForClear[x][y]
			else
				no



		setMarkedForClearAt: (x, y, mark) ->
			if @inBounds x, y
				@markedForClear[x][y] = mark



		clearMarkedForClear: ->
			for x in [0...@width] by 1
				for y in [0...@height] by 1
					@markedForClear[x][y] = no
			null



		hasBeenLookedAt: (x, y) ->
			if @inBounds x, y
				@lookedAt[x][y]
			else
				yes



		setLookedAt: (x, y, look) ->
			if @inBounds x, y
				@lookedAt[x][y] = look



		clearLookedAt: ->
			for x in [0...@width] by 1
				for y in [0...@height] by 1
					@lookedAt[x][y] = no
			null



		calculateLessStateChange = ->
			return unless @isDirty

			@renderLessStateChange = [ ]

			this.renderLessStateChange[i] = [ ] for i in [0...colourIndexLength] by 1

			for x in [0...@width] by 1
				for y in [0...@height] by 1
					@renderLessStateChange[colourToIndex[@grid[x][y]]].push [x, y]

			@isDirty = no


		findFloodClearCellsRecursive: (x, y, colour, cells) ->
			if @isColourAt(x, y, colour) and not @hasBeenLookedAt x, y
				cells.push [x, y]
				@setLookedAt x, y, yes
				@findFloodClearCellsRecursive x, y - 1, colour, cells
				@findFloodClearCellsRecursive x + 1, y, colour, cells
				@findFloodClearCellsRecursive x, y + 1, colour, cells
				@findFloodClearCellsRecursive x - 1, y, colour, cells
		

		findFloodClearCells: (x, y, colour) ->
			cells = [ ]
			@clearLookedAt()
			@findFloodClearCellsRecursive x, y, colour, cells
			@clearLookedAt()
			cells



	window.GRID_WIDTH = GRID_WIDTH
	window.GRID_HEIGHT = GRID_HEIGHT
	window.START_HEIGHT = START_HEIGHT
	window.Grid = Grid

) window