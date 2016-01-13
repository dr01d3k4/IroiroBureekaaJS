((window) ->
	keys = [ ]
	previousKeys = [ ]



	for i in [0..256] by 1
		keys[i] = no
		previousKeys[i] = no



	onKeyDown = (event = window.event) ->
		keys[event.keyCode] = yes



	onKeyUp = (event = window.event) ->
		keys[event.keyCode] = no



	updateKeys = ->
		for i in [0...keys.length]
			previousKeys[i] = keys[i]
		null



	clearKeys = ->
		for i in [0...keys.length]
			keys[i] = no
			previousKeys[i] = no
		null



	Key =
		LEFT: [37, 65]
		RIGHT: [39, 68]
		DOWN: [40, 83]
		PAUSE: [80, 27]



	isKeyDownIn = (key, array) ->
		for i in [0...key.length]
			if array[key[i]]
				yes
		no



	isKeyDown = (key) ->
		isKeyDownIn key, keys



	isKeyUp = (key) ->
		not isKeyDownIn key, keys



	wasKeyDown = (key) ->
		isKeyDownIn key, previousKeys



	wasKeyUp = (key) ->
		not isKeyDownIn key, previousKeys



	window.onKeyDown = onKeyDown
	window.onKeyUp = onKeyUp
	window.updateKeys = updateKeys
	window.clearKeys = clearKeys
	window.Key = Key
	window.isKeyDown = isKeyDown
	window.isKeyUp = isKeyUp
	window.wasKeyDown = wasKeyDown
	window.wasKeyUp = wasKeyUp
) window