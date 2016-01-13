((window) ->
	Colour =
		NONE: "#ffffff"

		RED: "#bb0000"
		GREEN: "#00bb00"
		BLUE: "#0000bb"
		YELLOW: "#bbbb00"

		LIGHT_RED: "#ff1010"
		LIGHT_GREEN: "#10ff10"
		LIGHT_BLUE: "#1010ff"



	colourToIndex = { }
	colourToIndex[Colour.NONE] = 0

	colourToIndex[Colour.RED] = 1
	colourToIndex[Colour.GREEN] = 2
	colourToIndex[Colour.BLUE] = 3
	colourToIndex[Colour.YELLOW] = 4

	colourToIndex[Colour.LIGHT_RED] = 5
	colourToIndex[Colour.LIGHT_GREEN] = 6
	colourToIndex[Colour.LIGHT_BLUE] = 7



	allColours = [Colour.NONE, Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW, Colour.LIGHT_RED, Colour.LIGHT_GREEN, Colour.LIGHT_BLUE, Colour.LIGHT_YELLOW]
	colourIndexLength = allColours.length



	randomColours = [Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW]
	randomColoursLength = randomColours.length

	randomColour = -> randomColours[randomNumberExclusive 0, randomColoursLength]



	lighterColour = (colour) ->
		switch colour
			when Colour.RED then Colour.LIGHT_RED
			when Colour.GREEN then Colour.LIGHT_GREEN
			when Colour.BLUE then Colour.LIGHT_BLUE
			when Colour.YELLOW then Colour LIGHT_YELLOW
			else Colour.NONE



	window.Colour = Colour
	window.colourToIndex = colourToIndex
	window.allColours = allColours
	window.colourIndexLength = colourIndexLength
	window.randomColour = randomColour
	window.lighterColour = lighterColour

) window