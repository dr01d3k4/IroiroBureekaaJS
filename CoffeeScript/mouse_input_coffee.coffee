((window) ->
	mouse =
		down: no
		x: -1
		y: -1

	mouseLetGo = no



	updateMouse = ->
		if mouseLetGo
			mouse.down = no
			mouseLetGo = no



	getMousePosition = (event) ->
		[
			(event.x ? (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft))
				- canvas.offsetLeft + canvasBorderThickness,
			(event.y ? (event.clientY + document.body.scrollTop + document.documentElement.scrollTop))
				- canvas.offsetTop + canvasBorderThickness
		]



	setMousePosition = (event  = window.event) ->
		pos = getMousePosition event
		mouse.x = pos[0]
		mouse.y = pos[1]



	onMouseDown = (event = window.event) ->
		mouse.down = yes
		setMousePosition event



	onMouseMove = (event = window.event) ->
		setMousePosition event



	onMouseUp = (event = window.event) ->
		mouseLetGo = yes
		setMousePosition event



	isMouseDown = ->
		mouse.down



	isMouseUp = ->
		!mouse.down



	getMouseX = ->
		mouse.x



	getMouseY = ->
		mouse.y



	window.updateMouse = updateMouse
	window.onMouseDown = onMouseDown
	window.onMouseMove = onMouseMove
	window.onMouseUp = onMouseUp
	window.isMouseDown = isMouseDown
	window.isMouseUp = isMouseUp
	window.getMouseX = getMouseX
	window.getMouseY = getMouseY
) window