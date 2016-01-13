(function (window) {
	var Language = {
		ENGLISH: "en",
		JAPANESE: "jap"
	};

	var language = Language.ENGLISH;



	var translations = {
		"en": {
			"TITLE": "Iroiro Burēkā!",
			"TITLE_WORD_ONE": "Iroiro",
			"TITLE_WORD_TWO": "Burēkā!",

			"MENU_PLAY": "Play",
			"MENU_HIGHSCORES": "Highscores",
			"MENU_SETTINGS": "Settings",
			"MENU_HELP": "Help",

			"GAME_SCORE": "Score: %d pts",
			"GAME_SCORE_EXTRA": "Score: %d pts + %d",
			"GAME_NEXT_PIECE": "Next: ",
			"GAME_PAUSED": "Paused",
			"GAME_BACK_MENU": "Back to menu",
			"GAME_SURE_LEAVE": "Are you sure?",
			"GAME_YES": "Yes",
			"GAME_OVER": "Game over!",
		},



		"jap": {
			"TITLE": "イロイロ・ブレーカー！",
			"TITLE_WORD_ONE": "イロイロ",
			"TITLE_WORD_TWO": "ブレーカー！",

			"MENU_PLAY": "スタート",
			"MENU_HIGHSCORES": "スコア記録",
			"MENU_SETTINGS": "設定",
			"MENU_HELP": "ヘルプ",

			"GAME_SCORE": "スコア: %dポイント",
			"GAME_SCORE_EXTRA": "スコア: %dポイント + %d",
			"GAME_NEXT_PIECE": "次: ",
			"GAME_PAUSED": "一時停止",
			"GAME_BACK_MENU": "トップに戻る",
			"GAME_SURE_LEAVE": "本当によろしですか？",
			"GAME_YES": "はい",
			"GAME_OVER": "ゲームオーバー"
		}
	};



	var setLanguage = function (newLanguage) {
		if (newLanguage in translations) {
			language = newLanguage;
			document.title = getTranslation("TITLE");
		} else {
			// console.log("Unknown language " + newLanguage);
		}
	};



	var getTranslation = function (key) { 
		if (key in translations[language]) {
			return translations[language][key];
		} else if (key in translations[Language.ENGLISH]) {
			// console.log("No translation for " + key + " in " + language + ". Using English");
			return translations[Language.ENGLISH][key];
		} else {
			// console.log("Unknown translation lookup key " + key + " in " + language + ((language !=== Language.ENGLISH) ? (" or " + Language.ENGLISH) : ""));
			return "No translation available";
		}
	};



	window.Language = Language;
	window.setLanguage = setLanguage;
	window.getTranslation = getTranslation;
})(window);