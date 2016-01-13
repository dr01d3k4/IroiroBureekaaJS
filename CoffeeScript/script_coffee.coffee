canvas = null
canvasBorderThickness = 4
context = null


hasFocus = yes


windowWidth = 0
windowHeight = 0
oldWindowWidth = -1
oldWindowHeight = -1
canvasWidth = 0
canvasHeight = 0
gridPixelWidth = 0
gridPixelHeight = 0


game = null
cellSize = 1


topBarSize = 0.1
topBarPixels = 0
extraSize = 8
bottomBarSize = 0.02
bottomBarPixels = 0



scrollAmount = 10
scrollDelay = 1


scrollFunction = ->
	window.scrollTo 0, scrollAmount



calculateCanvasSize = ->
	return unless canvas?

	setTimeout scrollFunction, scrollDelay


	windowWidth = Math.floor window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
	windowHeight = Math.floor window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

	
	return if windowWidth is oldWindowWidth and windowHeight is oldWindowHeight


	topBarPixels = Math.floor windowWidth * topBarSize
	bottomBarPixels = Math.floor windowHeight * bottomBarSize

	cellSize = Math.floor (windowWidth - topBarPixels - bottomBarPixels - extraSize) / GRID_HEIGHT

	gridPixelWidth = Math.floor cellSize * GRID_WIDTH
	if gridPixelWidth > windowWidth
		cellSize = Math.floor (windowWidth - extraSize) / GRID_WIDTH
		gridPixelWidth = Math.floor cellSize * GRID_WIDTH


	gridPixelHeight = Math.floor cellSize * GRID_HEIGHT

	canvasWidth = Math.floor gridPixelWidth
	canvasHeight = Math.floor gridPixelHeight + topBarPixels + bottomBarPixels

	setCanvasSize canvas, canvasWidth, canvasHeight 

	oldWindowWidth = Math.floor windowWidth
	oldWindowHeight = Math.floor windowHeight

	setTimeout scrollFunction, scrollDelay

	game.onResize() if game?



lastTime = Date.now()
now = Date.now()
dt = 0
main = ->
	window.requestAnimFrame main

	now = Date.now
	dt = (now - lastTime) / 1000.0

	game.update dt
	game.render()

	updateKeys()
	updateMouse()

	lastTime = now



init = ->
	canvas = createCanvas GRID_WIDTH, GRID_HEIGHT
	document.body.appendChild canvas
	calculateCanvasSize()

	context = canvas.getContext "2d"

	canvas.setAttribute "tabindex", "1"
	canvas.focus()


	canvas.onkeydown = onKeyDown
	canvas.onkeyup = onKeyUp
	canvas.onmousedown = onMouseDown
	canvas.onmousemove = onMouseMove
	canvas.onmouseup = onMouseUp

	game = new Game()
	game.init()

	lastTime = Date.now()
	main()



onResize = ->
	calculateCanvasSize()



###
onblur = ->
	hasFocus = no
	clearKeys()
	game.onFocusLost if game?



onFocus = ->
	hasFocus = yes
###



onLoad = init