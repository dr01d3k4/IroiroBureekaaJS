(function (window) {
	var ColourString = {
		NONE: "#ffffff",
		OUT_OF_BOUNDS: "#101010",

		RED: "#c00000",
		GREEN: "#00c000",
		BLUE: "#0000c0",
		YELLOW: "#dfdf00",
		WILD: "#c000c0",

		LIGHT_RED: "#ff1414",
		LIGHT_GREEN: "#14ff14",
		LIGHT_BLUE: "#1414ff",
		LIGHT_YELLOW: "#f2f214",
		LIGHT_WILD: "#ff00ff",

		TEXT: "#000000",
		GUI_BACKGROUND: "#bbbbbb",
		PAUSED_BACKGROUND: "#141414",
		PAUSED_TEXT: "#f0f0f0",
		PAUSE_BUTTON_BACKGROUND: "#505050",
		PAUSE_BUTTON_BAR: "#bbbbbb",
		OUTLINE: "#000000",
		MULTIPLIER_TEXT: "#141414"
	};



	var Colour = {
		NONE: 0,
		OUT_OF_BOUNDS: 1,
		RED: 2,
		GREEN: 3,
		BLUE: 4,
		YELLOW: 5,
		WILD: 6,
		LIGHT_RED: 7,
		LIGHT_GREEN: 8,
		LIGHT_BLUE: 9,
		LIGHT_YELLOW: 10,
		LIGHT_WILD: 11
	};



	var colourStringLookup = [
		ColourString.NONE, ColourString.OUT_OF_BOUNDS,
		ColourString.RED, ColourString.GREEN, ColourString.BLUE, ColourString.YELLOW, ColourString.WILD,
		ColourString.LIGHT_RED, ColourString.LIGHT_GREEN, ColourString.LIGHT_BLUE, ColourString.LIGHT_YELLOW, ColourString.LIGHT_WILD
	];
	var colourCount = colourStringLookup.length;

	

	var randomColours = [Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW, Colour.WILD];
	var randomColoursLength = randomColours.length;
	var randomColourProbability = [32.4, 32.4, 25, 10, 0.2];

	for (var i = 0; i < randomColourProbability.length; i++) {
		randomColourProbability[i] /= 100;
	}

	var randomColour = function () {
		var random = Math.random();
		var cumulative = 0;
		for (var i = 0; i < randomColourProbability.length; i++) {
			cumulative += randomColourProbability[i];
			if (random <= cumulative) {
				return randomColours[i];
			}
		}
	};


	var colourToPoints = [0, 0, 1.5, 1.5, 2, 4.5, 6];
	var colourPointsScale = 10;
	for (var i = 0; i < colourToPoints.length; i++) {
		colourToPoints[i] = Math.floor(colourToPoints[i] * colourPointsScale);
	}

	var getColourPoints = function (colour) {
		if (isLightColour(colour)) {
			colour = darkerColour(colour);
		}
		return colourToPoints[colour];
	};



	var lighterColour = function (colour) {
		if (colour === Colour.RED) {
			return Colour.LIGHT_RED;
		} else if (colour === Colour.GREEN) {
			return Colour.LIGHT_GREEN;
		} else if (colour === Colour.BLUE) {
			return Colour.LIGHT_BLUE;
		} else if (colour === Colour.YELLOW) {
			return Colour.LIGHT_YELLOW;
		} else if (colour === Colour.WILD) {
			return Colour.LIGHT_WILD;
		} else {
			return Colour.OUT_OF_BOUNDS;
		}
	};



	var darkerColour = function (colour) {
		if (colour === Colour.LIGHT_RED) {
			return Colour.RED;
		} else if (colour === Colour.LIGHT_GREEN) {
			return Colour.GREEN;
		} else if (colour === Colour.LIGHT_BLUE) {
			return Colour.BLUE;
		} else if (colour === Colour.LIGHT_YELLOW) {
			return Colour.YELLOW;
		} else if (colour === Colour.LIGHT_WILD) {
			return Colour.WILD;
		} else {
			return Colour.OUT_OF_BOUNDS;
		}
	};



	var isLightColour = function (colour) {
		return ((colour === Colour.LIGHT_RED) || (colour === Colour.LIGHT_GREEN)
			|| (colour === Colour.LIGHT_BLUE) || (colour === Colour.LIGHT_YELLOW)
			|| (colour === Colour.LIGHT_WILD));
	};

	
	
	window.ColourString = ColourString;
	window.Colour = Colour
	window.colourStringLookup = colourStringLookup;
	window.colourCount = colourCount;
	window.randomColour = randomColour;
	window.colourToPoints = colourToPoints;
	window.getColourPoints = getColourPoints;
	window.lighterColour = lighterColour;
	window.darkerColour = darkerColour;
	window.isLightColour = isLightColour;
})(window);