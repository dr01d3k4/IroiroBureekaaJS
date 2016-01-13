((window) ->
	requestAnimFrame = (->
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		(callback) ->
			window.setTimeout callback, 1000 / 60
	)()



	randomNumberExclusive = (lower, upper) ->
		Math.floor(Math.random() * (upper - lower)) + lower



	randomNumberInclusive = (lower, upper) ->
		Math.floor(Math.random() * (upper + 1 - lower)) + lower



	setCanvasSize = (canvas, width, height) ->
		canvas.width = Math.floor width
		canvas.height = Math.floor height
		canvas



	createCanvas = (width, height) ->
		setCanvasSize docuemnt.createElement("canvas"), width, height


	
	window.requestAnimFrame = requestAnimFrame
	window.randomNumberExclusive = randomNumberExclusive
	window.randomNumberInclusive = randomNumberInclusive
	window.setCanvasSize = setCanvasSize
	window.createCanvas = createCanvas

) window