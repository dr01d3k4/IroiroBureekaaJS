((window) ->
	GameState =
		NONE: 0
		INITIALIZING: 1
		ADDING_NEW_ROW: 2
		PLAYER_FALLING: 3
		LANDING_CELLS: 4
		PRE_CLEARING: 5
		CLEARING: 6
		GAP_FILL_FALL: 7
		PAUSED: 8
		LOST: 9


	class Game
		constructor: ->
			@reset()



		reset: ->
			@grid = new Grid GRID_WIDTH, GRID_HEIGHT
			@state = GameState.NONE
			@previousState = GameState.NONE

			@nextRow = [ ]
			@newRow = [ ]
			@newRowSlideIn = 0
			@newRowSlideInTime = 0.22
			@addedRows = 0
			@startingRows = START_HEIGHT
			@newRowBaseTime = 12
			@newRowRandomTime = 10
			@newRowTime = @newRowBaseTime + randomNumberInclusive 0, @newRowRandomTime
			@newRowCumulativeTime = 0


			@fallingPieces = [ ]
			@nextFallingPieceColour = randomColour()


			@playerFallTime = 0.18
			@playerFastFallTime = 0.08

			@playerHorizontalMoveTime = 0.1
			@playerHorizontalTarget = Math.floor @grid.width / 2


			@landedCells = [ ]


			@floodClearLocations = [ ]
			@preClearedList = [ ]

			@preClearTime = 0.07
			@preClearCumulativeTime = 0

			@finalClearTime = 0.28
			@finalClearCumulativeTime = 0


			@gapFillTime = 0.08


			@score = 0
			@multiplier = 0
			@pointsPerCell = 5
			@minGroupSize = 3

			@gridCanvas = createCanvas gridPixelWidth, gridPixelHeight
			@outlineCanvas = createCanvas gridPixelWidth, canvasHeight
			@nextRowCanvas = createCanvas gridPixelWidth, bottomBarPixels
			@pausedCanvas = createCanvas gridPixelWidth, canvasHeight - topBarPixels



		init: ->
			@grid.init()
			@renderGrid()
			@renderOutline()
			@renderNextRow()
			@renderPausedScreen()
			@changeState GameState.INITIALIZING



		onResize: ->
			setCanvasSize @gridCanvas, gridPixelWidth, gridPixelHeight
			@renderGrid()
			@renderOutline()
			@renderNextRow()
			@renderPausedScreen()



		onFocusLost: ->
			@changeState GameState.PAUSED



		changeState: (newState, goingBack = false) ->
			if newState is GameState.PAUSED
				if @state isnt GameState.INITIALIZING and @state isnt GameState.ADDING_NEW_ROW
					@previousState = @state
					@state = GameState.PAUSED
				return

			@grid.clearMarkedForClear()
			@grid.clearLookedAt()

			if newState is GameState.LOST
				@previousState = GameState.NONE
				@state = GameState.LOST
				return

			@previousState = @state

			if not goingBack and @newRowCumulativeTime >= @newRowTime and newState is GameState.PLAYER_FALLING
				@newRowCumulativeTime = 0
				@newRowTime = @newRowBaseTime + randomNumberInclusive 0, @newRowRandomTime
				@changeState GameState.ADDING_NEW_ROW
			else
				@state = newState



		backState: ->
			@changeState @previousState, true



		update: (dt) ->
			return unless hasFocus

			switch @state
				when GameState.INITIALIZING
					if @addedRows < @startingRows
						@changeState GameState.ADDING_NEW_ROW
					else
						@changeState GameState.PLAYER_FALLING

				when GameState.ADDING_NEW_ROW
					@updateStateAddingNewRow dt

				when GameState.PLAYER_FALLING
					@updateStatePlayerFalling dt

				when GameState.LANDING_CELLS
					@updateLandingCells()

				when GameState.PRE_CLEARING
					@updatePreClearing dt

				when GameState.CLEARING
					@updateClearing dt

				when GameState.GAP_FILL_FALL
					@updateGapFillFall ddt

				when GameState.LOST
					@lose()

			if @grid.isDirty
				@grid.calculateLessStateChange()
				@renderGrid()


			if isKeyDown(Key.PAUSE) and wasKeyUp(Key.PAUSE)
				if @state is GameState.PAUSED
					@backState()
				else
					@changeState GameState.PAUSED

			unless @state is GameState.PAUSED
				@newRowCumulativeTime += dt
				if @newRowCumulativeTime > @newRowBaseTime
					@newRowCumulativeTime = @newRowTime



		updateStateAddingNewRow: (dt) ->
			if @nextRow.length is 0
				@nextRow = @generateNextRow()
				@renderNextRow()

			if @newRow.length is 0
				@newRow = @nextRow

			@newRowSlideIn += dt / @newRowSlideInTime

			if @newRowSlideIn >= 1
				for x in [0...@gridWidth] by 1

					if @grid.isSolidAt x, 0
						@changeState GameState.LOST
						return

					for y in [0...@gridHeight] by 1
						@grid.setColourAt x, y, @grid.getColourAt x, y + 1

				@newRow = [ ]
				@nextRow = @generateNextRow()
				@renderNextRow()
				@newRowSlideIn = 0
				@addedRows++
				@backState()



		generateNextRow: ->
			randomColour() for i in [0...@gridWidth] by 1



		updateStatePlayerFalling: (dt) ->
			@multiplier = 0

			if @fallingPieces.length is 0
				@grid.clearMarkedForClear()
				@fallingPieces.push [Math.floor(@gridWidth / 2), -1 / @playerFallTime, this.nextFallingPieceColour, true]
				@playerHorizontalTarget = @fallingPieces[0][0]
				@nextFallingPieceColour = randomColour()

			fallingPiece = @fallingPieces[0]

			@attemptMovePlayerHorizontal dt

			fallSpeed = @playerFallTime
			if isKeyDown Key.DOWN
				fallSpeed = @playerFastFallTime

			moved = @attemptMoveFallingPiece fallingPiece, 0, dt / fallSpeed

			if not moved
				@handleFallingPieceCollision fallingPiece

				return if @state is GameState.LOST

				@fallingPieces = [ ]

			if @fallingPieces.length is 0
				@grid.clearMarkedForClear
				@changeState GameState.LANDING_CELLS



		updateLandingCells: ->
			@grid.clearLookedAt()
			if @landedCells.length > 0
				for [x, y, colour, canStartClear] in @landedCells
					if canStartClear and @grid.isColourAt x, y + 1, colour
						unless @grid.isMarkedForClearAt(x, y) or @grid.isMarkedForClearAt(x, y + 1)
							cells = @grid.findFloodClearCells x, y, colour
							if cells.length >= @minGroupSize
								@markCellsForClear cells
								@multiplier++
								@startFloodClearAt x, y, colour, @floodClearLocations
								@grid.setMarkedForClearAt x, y, true
								@grid.setMarkedForClearAt x, y + 1, true
			
			@landedCells = [ ]
			@grid.clearMarkedForClear();
			if @floodClearLocations.length > 0
				@changeState GameState.PRE_CLEARING
			else
				@gameState.PLAYER_FALLING



		updatePreClearing: (dt) ->
			@preClearCumulativeTime += dt

			if @preClearCumulativeTime >= @preClearTime
				@floodClearLocations = @stepFloodClear @floodClearLocations
				@preClearCumulativeTime -= @preClearTime

			if @floodClearLocations.length is 0
				@changeState GameState.CLEARING
				@preClearCumulativeTime = 0



		updateClearing: (dt) ->
			@finalClearCumulativeTime += dt
			if @finalClearCumulativeTime >= @finalClearTime
				for [x, y] in @preClearedList
					@score += @pointsPerCell * @multiplier
					@grid.setEmptyAt x, y

				@preClearedList = [ ]
				@changeState GameState.GAP_FILL_FALL
				@finalClearCumulativeTime = 0



		updateGapFillFall: (dt) ->
			if @fallingPieces.length is 0
				@floodClearLocations = [ ]
				@fallingPieces = @findCellsToFall()
				@grid.clearMarkedForClear

			newFallingPieces = [ ]
			for fallingPiece in @fallingPieces
				moved = @attemptMoveFallingPiece fallingPiece, 0, dt / @gapFillTime
				
				if not moved
					@handleFallingPieceCollision fallingPiece
					return if @state is GameState.LOST

				else
					newFallingPieces.push fallingPiece

			@fallingPieces = newFallingPieces

			if @fallingPieces.length is 0
				@grid.clearMarkedForClear()
				@changeState GameState.LANDING_CELLS



		handleFallingPieceCollision: (fallingPiece) ->
			x = Math.floor fallingPiece[0]
			y = Math.floor fallingPiece[1]

			if y < 0
				@changeState GameState.LOST
				return

			colour = fallingPiece[2]
			canStartClear = fallingPieces[3]

			@setPieceOnGrid fallingPiece
			@landedCells.push fallingPiece



		attemptMovePlayerHorizontal: (dt) ->
			fallingPiece = @fallingPieces[0]

			if isMouseDown()
				@playerHorizontalTarget = Math.floor (getMouseX() / canvasHeight) * @gridWidth
			else
				direction = 0

				if isKeyDown Key.LEFT
					direction--

				if isKeyDown Key.RIGHT
					direction++

				if fallingPiece[0] is @playerHorizontalTarget or (playerHorizontalTarget > fallingPiece[0] and direction < 0) or (playerHorizontalTarget < fallingPiece[0] and direction > 0)
					@playerHorizontalTarget = Math.round fallingPiece[0] + direction

			if @playerHorizontalTarget < 0
				@playerHorizontalTarget = 0

			if @playerHorizontalTarget >= @gridWidth
				@playerHorizontalTarget = @gridWidth - 1

			moveAmount = dt / @playerHorizontalMoveTime

			if @playerHorizontalTarget > fallingPiece[0]
				fallingPiece[0] += moveAmount
			else if @playerHorizontalTarget < fallingPiece[0]
				fallingPiece[0] -= moveAmount

			if Math.abs(fallingPiece[0] - @playerHorizontalTarget) < moveAmount
				fallingPiece[0] = Math.round fallingPiece[0]

			movingRight = @playerHorizontalTarget > fallingPiece[0]
			xInMovingDirecton = if movingRight then Math.ceil fallingPiece[0] else Math.floor fallingPiece[0]

			if @grid.isSolidAt(xInMovingDirecton, Math.floor fallingPiece[1]) or @grid.isSolidAt(xInMovingDirecton, Math.ceil fallingPiece[1])
				fallingPiece[0] = Math.floor fallingPiece[0] + (if movingRight then 0.5 else 0)



		attemptMoveFallingPiece = (fallingPiece, dx, dy) ->
			collision = no
			collisionX = -1
			collisionY = -1

			newX = fallingPiece[0] + dx
			newY = fallingPiece[1] + dy

			if newX < 0
				fallingPiece[0] = 0

			if newX >= @gridWidth
				fallingPiece[0] = @gridWidth - 1

			if newY >= @gridHeight
				fallingPiece[1] = @gridHeight - 1
				return no


			startX = if dx <= 0 then Math.floor fallingPiece[0] else Math.ceil fallingPiece[0]
			endX = if dx <= 0 then Math.ceil fallingPiece[0] + dx else Math.floor fallingPiece[0]
			incX = if dx <= 0 then 1 else -1

			x = startX
			while (if dx <= 0 then x <= endX else x >= endX)
				for y in [Math.floor(fallingPiece[1])..Math.ceil(fallingPiece[1] + dy)] by 1
					if @grid.isSolidAt x, y
						collision = yes
						collisionX = x
						collisionY = y

				break if collision
				x += incX

			if collision
				fallingPiece[0] = collisionX
				fallingPiece[1] = collisionY
			else
				fallingPiece[0] += dx
				fallingPiece[1] += dy

			return not collision



		renderGrid: ->
			setCanvasSize @gridCanvas, gridPixelWidth, gridPixelHeight

			return unless grid?

			gridContext = @gridCanvas.getContext "2d"

			for colour in [0...@grid.renderLessStateChange.length] by 1
				points = @grid.renderLessStateChange[colour]
				continue if points.length is 0

				gridContext.fillStyle = allColours[colour]
				for [x, y] in points
					gridContext.fillRect Math.floor(x * cellSize), Math.floor(y * cellSize), cellSize, cellSize
			null



		renderOutline: ->
			setCanvasSize @outlineCanvas, gridPixelWidth, gridPixelHeight

			return unless @grid

			
) window