(function (window) {
	var Menu = function () {
		this.waitTime = 2;
		this.currentTime = 0;

		this.titleWidth = 720;
		this.titleHeight = 320;
		this.titleCanvas = createCanvas(this.titleWidth, this.titleHeight);

		this.buttons = [getTranslation("MENU_PLAY"), getTranslation("MENU_HIGHSCORES"), getTranslation("MENU_SETTINGS"), getTranslation("MENU_HELP")];
		this.buttonColours = [Colour.RED, Colour.GREEN, Colour.BLUE, Colour.YELLOW];
		this.selectedButton = -1;

		this.keyDownWaitTime = 0.25;
		this.keyDownCooldown = 0;

		this.titleHorizontalPadding = 1;
		this.titleVerticalPadding = 1;
		this.titleRenderHeight = 1;

		this.buttonStepHeight = 1;
		this.buttonStartHeight = 1;
		this.halfButtonStepHeight = 0.5;
		this.buttonMaxWidth = 1;
	};

	Menu.prototype = new Screen();
	Menu.prototype.constructor = Menu;



	Menu.prototype.init = function () {
		this.renderTitle();
	};



	Menu.prototype.onResize = function () {
		this.titleHorizontalPadding = canvasWidth * 0.02;
		this.titleVerticalPadding = canvasHeight * 0.02;
		this.titleRenderHeight = canvasHeight * 0.25;

		this.buttonStepHeight = canvasHeight * 0.15;
		this.buttonStartHeight = this.titleRenderHeight + (this.buttonStepHeight * 0.5);
		this.buttonMaxWidth = canvasWidth * 0.95;
		this.halfButtonStepHeight = this.buttonStepHeight / 2;
	};



	Menu.prototype.update = function (dt) {
		this.keyDownCooldown -= dt;
		if (this.keyDownCooldown <= 0) {
			this.keyDownCooldown = 0;
		}
		if (!isKeyDown(Key.UP) && !isKeyDown(Key.DOWN)) {
			this.keyDownCooldown = 0;
		}

		var mouseX = getMouseX();
		var mouseY = getMouseY();

		if ((mouseY >= this.buttonStartHeight) && (mouseY <= this.buttonStartHeight + (this.buttons.length * this.buttonStepHeight))
			&& (mouseX >= canvasWidth * 0.1) && (mouseX <= canvasWidth * 0.9)) {
			if (isMouseDown()) {
				clearKeys();
			}

			mouseY -= this.buttonStartHeight;
			var newSelected = Math.floor(mouseY / this.buttonStepHeight);

			if (newSelected < this.buttons.length) {
				this.selectedButton = newSelected;

				if (isMouseDown() && wasMouseUp()) {
					this.performButtonClick();
				}
			}
		
		}/* else {
			this.selectedButton = -1;
		}*/
		else if (this.keyDownCooldown <= 0) {
			var direction = 0;

			if (isKeyDown(Key.UP)) {
				direction--;
			}

			if (isKeyDown(Key.DOWN)) {
				direction++;
			}

			if (direction != 0) {
				this.keyDownCooldown = this.keyDownWaitTime;
				this.selectedButton += direction;

				if (this.selectedButton < 0) {
					this.selectedButton = this.buttons.length - 1;
				}

				if (this.selectedButton >= this.buttons.length) {
					this.selectedButton = 0;
				}
			}
		}

		if (isKeyDown(Key.ENTER)) {
			this.performButtonClick();
		}
	};



	Menu.prototype.performButtonClick = function () {
		switch (this.selectedButton) {
			case 0: {
				changeScreen(new Game());
				break;
			}
		}
	};



	Menu.prototype.renderTitle = function () {
		var titleContext = this.titleCanvas.getContext("2d");

		titleContext.textBaseline = "top"
		titleContext.font = "italic bolder 82pt sans-serif";
		titleContext.fillStyle = ColourString.RED;
		titleContext.textAlign = "left";
		titleContext.fillText(getTranslation("TITLE_WORD_ONE"), 0, 0);

		titleContext.fillStyle = ColourString.GREEN;
		titleContext.textAlign = "right";
		titleContext.fillText(getTranslation("TITLE_WORD_TWO"), this.titleWidth, this.titleHeight / 2);
	};



	Menu.prototype.render = function () {
		context.fillStyle = ColourString.NONE;
		context.fillRect(0, 0, canvasWidth, canvasHeight);

		context.drawImage(this.titleCanvas, this.titleHorizontalPadding, this.titleVerticalPadding, canvasWidth - (2 * this.titleHorizontalPadding), this.titleRenderHeight);

		context.textAlign = "center";
		context.textBaseline = "middle"
		

		for (var i = 0; i < this.buttons.length; i++) {
			var buttonText = this.buttons[i];
			if (i === this.selectedButton) {
				context.fillStyle = colourStringLookup[lighterColour(this.buttonColours[this.selectedButton])];
				context.font = "bolder 38pt sans-serif";
				// buttonText = "> " + buttonText + " <";
			} else {
				context.fillStyle = colourStringLookup[this.buttonColours[i]];
				context.font = "38pt sans-serif";
			}
			context.fillText(buttonText, canvasWidth / 2, this.buttonStartHeight + this.halfButtonStepHeight + (i * this.buttonStepHeight), this.buttonMaxWidth);
		}

		// context.fillStyle = colourStringLookup[lighterColour(this.buttonColours[this.selectedButton])];
		// context.font = "bolder 38pt sans-serif";
		// context.fillText("> " + this.buttons[this.selectedButton] + " <", canvasWidth / 2, this.buttonStartHeight + this.halfButtonStepHeight + (this.selectedButton * this.buttonStepHeight), this.buttonMaxWidth);
	};



	window.Menu = Menu;
})(window);