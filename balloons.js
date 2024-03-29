/**
 * wcln.ca
 * Balloons - Significant Figures
 * @author Colin Perepelken (colin@perepelken.ca)
 * October 2017
 */

////////// VARIABLES ///////////

var mute = false;
var FPS = 24;

// constants (set in init function)
var STAGE_WIDTH;
var STAGE_HEIGHT;

// clouds
var cloudsArray = [];
var NUMBER_OF_CLOUDS = 10;

// balloons
var balloonsArray = [];
var NUMBER_OF_BALLOONS = 6;
var BALLOON_SPEED = 3.5;
var balloonSpritesArray = [];
var balloonsToPop = [];
var lastTimePopped = 0;

var gameStarted = false;
var score;
var scoreLastChangedAmount = 0;
var questionCounter;

// text
var scoreText;
var questionText, questionLabelText;
var titleText, descriptionText;

var respawning = false; // used to fix bug and ensure function completes


/*
 * Handles initialization of game components
 * Called from HTML body onload.
 */
function init() {
	// set constants
	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	// these have to go here otherwise they don't load fast enough (was causing bug where sprite was null)
	loadBalloonSpriteData("balloon_sprite_blue.png");
	loadBalloonSpriteData("balloon_sprite_yellow.png");
	loadBalloonSpriteData("balloon_sprite_green.png");
	loadBalloonSpriteData("balloon_sprite_red.png");
	loadBalloonSpriteData("balloon_sprite_orange.png");
	//loadBalloonSpriteData("balloon_sprite_purple.png");

	setupManifest(); // preloadJS
	startPreload();

	score = 0; // reset game score
	questionCounter = 0;
	stage.update();
}

/*
 * Main update function
 */
function update(event) {
 	if (gameStarted) {

 		updateClouds(); // updates cloud positions
 		updateBalloons(); // updates balloon positions
 		updateQuestion(); // moves to next question if required



 	}

	stage.update(event);
}

/*
 * Starts the game
 */
function startGame(event) {
	playSound("click");

	event.remove();



	// remove start screen from visible canvas
	//createjs.Tween.get(startText).to({x:-800}, 500).call(initGraphics);
	stage.removeChild(startScreenImage);
	stage.removeChild(descriptionText);
	stage.removeChild(titleText);
	startButtonImage.x = -300;
	startButtonPressedImage.x = -300;
	initGraphics();
}

/*
 * Displays the end game screen
 */
function endGame() {
	gameStarted = false; // stop calling update function

	stage.removeChild(questionText);
	stage.removeChild(questionLabelText);

	createjs.Tween.get(scoreText)
		.to({x: STAGE_WIDTH/2 - (scoreText.getMeasuredWidth()/2) * 3, y: STAGE_HEIGHT/2 - (scoreText.getMeasuredHeight()/2) * 3 - 20, scaleX: 3, scaleY: 3, color:"black"}, 800)
		.wait(200)
		.call(function() {
			var resetText = new createjs.Text("Click to Restart", '40px Lato', "black");
			resetText.x = STAGE_WIDTH/2 - resetText.getMeasuredWidth()/2;
			resetText.y = scoreText.y + 50 + scoreText.getMeasuredHeight();
			stage.addChild(resetText);
			stage.on("stagemousedown", function() {
				location.reload(); // reload the page
			}, null, false);
		});
}


/*
 * Adds images to stage and sets initial position
 */
function initGraphics() {

	initClouds();
	initBalloons();
	initScoreText();
	initQuestionText();
	initPlayPauseButtons();
	initMuteUnmuteButtons();


	gameStarted = true;
	displayLevelText("Level 1");
}

/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnmuteButtons() {
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
	muteButton.hitArea = unmuteButton.hitArea = hitArea;

	muteButton.x = unmuteButton.x = 45;
	muteButton.y = unmuteButton.y = 45;

	muteButton.on("click", toggleMute);
	unmuteButton.on("click", toggleMute);

	stage.addChild(muteButton);
}

/*
 * Renders custom start screen text on the start screen.
 */
function initStartScreenText() {
	descriptionText = new createjs.Text(description, '18px Lato', 'black');
	descriptionText.textAlign = 'center';
	descriptionText.lineWidth = 560;
	descriptionText.x = STAGE_WIDTH/2;
	descriptionText.y = 240;
	stage.addChild(descriptionText);

	titleText = new createjs.Text(title, '31px Lato', 'white');
	titleText.maxWidth = 440;
	titleText.x = STAGE_WIDTH/2 - titleText.getMeasuredWidth()/2;
	titleText.y = 155;
	stage.addChild(titleText);
}

/*
 * Adds the play and pause buttons to the stage and defines listeners
 */
function initPlayPauseButtons() {

	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, playButton.image.width, playButton.image.height);
	playButton.hitArea = pauseButton.hitArea = hitArea;

	playButton.x = pauseButton.x = 5;
	playButton.y = pauseButton.y = 45;

	pauseButton.on("click", function() {
		stage.addChild(playButton);
		stage.removeChild(pauseButton);

		// remove all balloons to prevent user from pausing game for more time
		for (var balloon of balloonsArray) {
			balloon.sprite.set({visible:false});
			balloon.label.set({visible:false});
		}

		gameStarted = false;
	});

	playButton.on("click", function() {
		stage.addChild(pauseButton);
		stage.removeChild(playButton);

		// re-add the balloons
		for (var balloon of balloonsArray) {
			balloon.sprite.set({visible:true});
			balloon.label.set({visible:true});
		}

		gameStarted = true;
	});

	stage.addChild(pauseButton); // pause button is visible by default (game is playing already)
}


/*
 * Adds the score text to the stage
 */
function initScoreText() {
	scoreText = new createjs.Text("Score: " + score, '26px Lato', "white");
	scoreText.x = 5;
	scoreText.y = 5;
	stage.addChild(scoreText);
}

/*
 * Adds the question text to the stage
 */
function initQuestionText() {
	// question label (Ex. displays 'Question 1')
	questionLabelText = new createjs.Text("Question " + (questionCounter + 1), '16px Lato', "white");
	questionLabelText.x = STAGE_WIDTH/2 - questionLabelText.getMeasuredWidth()/2;
	questionLabelText.y = 5;
	stage.addChild(questionLabelText);

	// the actual question
	questionText = new createjs.Text(questions[questionCounter].question, '36px Lato', "white");
	questionText.x = STAGE_WIDTH/2 - questionText.getMeasuredWidth()/2;
	questionText.y = questionLabelText.y + questionLabelText.getMeasuredHeight() + 5;
	stage.addChild(questionText);
}

/*
 * Adds start button to stage and positions it
 */
function initStartButton() {
	startButtonImage.x = STAGE_WIDTH/2 - startButtonImage.getBounds().width/2;
	startButtonImage.y = 490;
	startButtonImage.cursor = "pointer";
	stage.addChild(startButtonImage);

	startButtonPressedImage.x = startButtonImage.x;
	startButtonPressedImage.y = startButtonImage.y;
	startButtonPressedImage.cursor = "pointer";

	// listeners
	startButtonImage.on("click", function(event) {
		startGame(event);
	});
	startButtonPressedImage.on("click", function(event) {
		startGame(event);
	});
	startButtonImage.on("mouseover", function() {
		stage.addChild(startButtonPressedImage);
		stage.removeChild(startButtonImage);
	});
	startButtonPressedImage.on("mouseout", function() {
		stage.addChild(startButtonImage);
		stage.removeChild(startButtonPressedImage);
	});
}


/*
 * Initializes balloon starting positions and objects
 */
function initBalloons() {

	var BALLOON_SPACING = 35;

	for (var i = 0; i < balloonSpritesArray.length; i++) {
		var sprite = balloonSpritesArray[i];
		sprite.x = 60 + (sprite.getBounds().width + BALLOON_SPACING) * i;
		sprite.y = parseInt(STAGE_HEIGHT) + Math.floor(Math.random() * 40);
		sprite.name = questions[questionCounter].options[i];
		sprite.on("click", function(event) {balloonClickHandler(event);});
		sprite.cursor = "pointer";
		stage.addChild(sprite);

		// balloon label
		var label = new createjs.Text(questions[questionCounter].options[i], "36px Lato", "white");
		label.x = sprite.x + sprite.getBounds().width/2 - label.getMeasuredWidth()/2;
		label.y = sprite.y + sprite.getBounds().height/2 - label.getMeasuredHeight()/2;
		stage.addChild(label);

		balloonsArray.push({
			sprite: sprite,
			label: label,
			speed: BALLOON_SPEED + Math.random() * 0.7,
			removed: false
		});
	}
}

var backgroundCounter = 0;
function nextBackground() {
	backgroundCounter++;

	backgroundsArray[backgroundCounter].x = STAGE_WIDTH;

	stage.addChildAt(backgroundsArray[backgroundCounter], 1);

	createjs.Tween.get(backgroundsArray[backgroundCounter]).to({x: 0}, 1000);
	createjs.Tween.get(backgroundsArray[backgroundCounter - 1]).to({x: -STAGE_WIDTH}, 1000).call(function() {
		stage.removeChild(backgroundsArray[backgroundCounter - 1]);
	});

}

/*
 * Loads balloon sprites into sprite array
 */
function loadBalloonSpriteData(filename) {
	var spriteData = {
		images: ["images/" + filename],
		frames: {width:130, height:130, count:7, regX:0, regY:0, spacing:0, margin:0},
		animations: {
			normal: [0, false],
			pop: [0, 6, false]
		}
	};
	var sprite = new createjs.Sprite(new createjs.SpriteSheet(spriteData));

	balloonSpritesArray.push(sprite);

}

/*
 * Called when a balloon is clicked
 */
function balloonClickHandler(event) {
	var id = event.target.name; // get ID of the balloon that was clicked

	// prevents clicking on balloon if it is already removed (and performing animation)
	for (var balloon of balloonsArray) {
		if (balloon.label.text == id) {
			if (balloon.removed) {
				return;
			}
		}
	}

	// determine if got first one correct or not
	var anyRemoved = false;
	for (var balloon of balloonsArray) {
		if (balloon.removed) {
			anyRemoved = true;
		}
	}

	popBalloon(id);

	if (id == questions[questionCounter].answer) { // CORRECT ANSWER

		if (!anyRemoved) { // first one correct!

			updateScore(1000);
			playSound("good");
			showHitSplash(event.target.x, event.target.y);

		} else { // a balloon has already been popped
			updateScore(500);
			showHitSplash(event.target.x, event.target.y);
		}

		// pop all the other balloons remaining
		setTimeout(function() { popAllBalloonsExcept(id); }, 500);


	} else { // INCORRECT ANSWER

		updateScore(-200);
		showMissSplash(event.target.x, event.target.y);

	}
}


/*
 * Pops a balloon by performing animation and removing from stage
 */
function popBalloon(id) {
	for (var balloon of balloonsArray) {
		if (balloon.label.text == id) { // this is the balloon to pop
			balloon.removed = true;
			createjs.Tween.get(balloon.sprite).call(function animate() { 
					balloon.sprite.gotoAndPlay("pop");
					playSound("pop");
					displayScoreLabel(balloon.sprite.x, balloon.sprite.y);
				}).wait(300).call(function remove() { 
					stage.removeChild(balloon.sprite);
					stage.removeChild(balloon.label);
					balloon.sprite.y = -100;
				}
			);
			break;
		}
	}
}

/*
 * Pops all other non-removed balloons except the balloon with 'id'
 */
function popAllBalloonsExcept(id) {
	for (var balloon of balloonsArray) {
		if (balloon.sprite.name != id && !balloon.removed) {
			balloonsToPop.push(balloon.sprite.name);
		}
	}
	shuffle(balloonsToPop); // pop them in random order
}

/*
 * Pops balloons with delay (when popping all balloons)... so that they don't all pop at same time
 */
function popBalloonsWithDelay() {
	if (balloonsToPop.length > 0) {
		var currentTime = new Date().getTime();

		if (currentTime - lastTimePopped > 100) {
			popBalloon(balloonsToPop.pop());
			updateScore(100);
			lastTimePopped = new Date().getTime();
		}
	}
}

/*
 * Sets up the cloud images and initial positions (called by initGraphics)
 */
function initClouds() {
	for (var i = 0; i < NUMBER_OF_CLOUDS; i++) {
		var tempCloud = Object.create(cloudImagesArray[Math.floor(Math.random()*cloudImagesArray.length)]); // get random cloud image
		tempCloud.x = Math.floor(Math.random() * STAGE_WIDTH) + 50; // between 50 and stage width
		tempCloud.y = Math.floor(Math.random() * 400) + 100;
		tempCloud.scaleX = Math.random() * 1.2 + 0.5;
		tempCloud.scaleY = tempCloud.scaleX;
		tempCloud.alpha = 0;

		cloudsArray.push({ // push a cloud object into array
			image: tempCloud,
			speed: tempCloud.scaleX // random cloud speed
		});
	}
	cloudsArray.sort(compare); // sort the clouds so that when they are added to stage they overlap correctly

	// add the clouds to the stage
	for (var cloud of cloudsArray) {
		stage.addChild(cloud.image);
		createjs.Tween.get(cloud.image).to({alpha: 1}, 1500); // fade the clouds in
	}
}

/*
 * Updates game score and displays updated score
 */
function updateScore(amount) {
	score += amount;
	scoreText.text = "Score: " + score;

	if (amount > 0) { // nice
		createjs.Tween.get(scoreText).to({color:"#1dfc19"},1).wait(500).to({color:"white"}); // flash green
	} else { // bad
		createjs.Tween.get(scoreText).to({color:"red"},1).wait(500).to({color:"white"}); // flash red
	}
	scoreLastChangedAmount = amount;
}

function displayLevelText(text) {
	var levelText = new createjs.Text(text, "60px Lato", "white");
	levelText.x = STAGE_WIDTH/2 - levelText.getMeasuredWidth()/2;
	levelText.y = STAGE_HEIGHT;
	stage.addChild(levelText);
	createjs.Tween.get(levelText).to({y:-levelText.getMeasuredHeight(), alpha:0.4}, 3000).wait(3000).call(function(){stage.removeChild(levelText)});
}

/*
 * Displays score change near popped balloon
 */
function displayScoreLabel(x, y) {

	var tempLabel = new createjs.Text("", "22px Lato", "white");
	tempLabel.x = x;
	tempLabel.y = y;
	tempLabel.alpha = 0;

	if (scoreLastChangedAmount > 0) {
		tempLabel.text = "+" + scoreLastChangedAmount;
		tempLabel.color = "#1dfc19";
	} else {
		tempLabel.text = scoreLastChangedAmount;
		tempLabel.color = "red";
	}

	stage.addChild(tempLabel);
	createjs.Tween.get(tempLabel).to({alpha:1}, 200).wait(200).to({alpha:0}, 200).call(function remove() { stage.removeChild(tempLabel); });
}

/*
 * Shows the hit splash image when a question is answered
 */
function showHitSplash(x, y) {
	y = y - hitSplashImage.getBounds().height;
	hitSplashImage.x = x;
	hitSplashImage.y = y;
	hitSplashImage.alpha = 0;
	stage.addChild(hitSplashImage);
	createjs.Tween.get(hitSplashImage).to({alpha:1}, 400).to({alpha:0}, 800).call(function() {
		stage.removeChild(hitSplashImage);
	})
}

/*
 * Shows the miss splash image (wrong answer)
 */
function showMissSplash(x, y) {
	y = y - hitSplashImage.getBounds().height;
	missSplashImage.x = x;
	missSplashImage.y = y;
	missSplashImage.alpha = 0;
	stage.addChild(missSplashImage);
	createjs.Tween.get(missSplashImage).to({alpha:1}, 400).to({alpha:0}, 800).call(function() {
		stage.removeChild(missSplashImage);
	})
}

/*
 * Updates the question text and maintains center position
 */
function updateQuestionText() {
	if (questionCounter < questions.length) {

		questionText.text = questions[questionCounter].question;
		questionText.x = STAGE_WIDTH/2 - questionText.getMeasuredWidth()/2;

		questionLabelText.text = "Question " + (questionCounter + 1);
		questionLabelText.x = STAGE_WIDTH/2 - questionLabelText.getMeasuredWidth()/2;
	}

}

/*
 * Updates the scrolling clouds
 */
function updateClouds() {
	for (var cloud of cloudsArray) {
		cloud.image.x -= cloud.speed;
		if (cloud.image.x < -cloud.image.getBounds().width * cloud.image.scaleX) {
			cloud.image.x = STAGE_WIDTH;
			cloud.image.y = Math.floor(Math.random() * 400) + 0;
		}
	}
}

/*
 * Updates balloon position
 */
function updateBalloons() {

	for (var balloon of balloonsArray) {
		balloon.sprite.y -= balloon.speed;
		balloon.label.y = balloon.sprite.y + balloon.sprite.getBounds().height/2 - balloon.label.getMeasuredHeight()/2 - 4;
	}
	
	popBalloonsWithDelay();
}

/*
 * Increments the question if required
 */
function updateQuestion() {

	// check if all balloons are past
	var resetBalloons = true;
	for (var balloon of balloonsArray) {
		if (balloon.sprite.y + balloon.sprite.getBounds().height > 0) {
			resetBalloons = false;
		}
	}

	if (resetBalloons) {

		var movedToNextQuestion = false;

		// check if question was answered and if balloon info should be updated
		for (var balloon of balloonsArray) {
			if (balloon.label.text === questions[questionCounter].answer) {
				if (balloon.removed && !respawning) { // then question has been answered
					respawning = true;
					movedToNextQuestion = true;

					// update balloon info
					questionCounter++;
					if (questionCounter == questions.length) { // check for GAME COMPLETE
						endGame();
					} else if (questions[questionCounter].hasOwnProperty("name")) { // new LEVEL
						displayLevelText(questions[questionCounter].name)
						BALLOON_SPEED += parseInt(questions[questionCounter].speed);
						nextBackground();
					}

					updateQuestionText();

					for (var i = 0; i < balloonsArray.length; i++) {
						balloonsArray[i].sprite.name = questions[questionCounter].options[i];
						balloonsArray[i].label.text = questions[questionCounter].options[i];
						balloonsArray[i].label.x = balloonsArray[i].sprite.x + balloonsArray[i].sprite.getBounds().width/2 - balloonsArray[i].label.getMeasuredWidth()/2;
					}
				} else if (!balloon.removed && !respawning) { // if balloons reach top and not answered
					updateScore(-500);
					playSound("bad");
				}
			}
		}
		
		respawnAllBalloons(movedToNextQuestion);
	}
}

/*
 * Moves balloons back to bottom of screen and resets animations and adds to stage
 */
function respawnAllBalloons(movedToNextQuestion) {
	for (var balloon of balloonsArray) {


		if (!balloon.removed && !movedToNextQuestion) {
			balloon.sprite.y = parseInt(STAGE_HEIGHT) + Math.floor(Math.random() * 40);
			balloon.speed = BALLOON_SPEED + Math.random() * 0.7;
			balloon.label.y = balloon.sprite.y + balloon.sprite.getBounds().height/2 - balloon.label.getMeasuredHeight()/2;
		}


		if (balloon.removed && movedToNextQuestion) {

			balloon.sprite.y = parseInt(STAGE_HEIGHT) + Math.floor(Math.random() * 40);
			balloon.speed = BALLOON_SPEED + Math.random() * 0.7;
			balloon.label.y = balloon.sprite.y + balloon.sprite.getBounds().height/2 - balloon.label.getMeasuredHeight()/2;
			
			balloon.removed = false;
			balloon.sprite.gotoAndPlay("normal");
			stage.addChild(balloon.sprite);
			stage.addChild(balloon.label);
			respawning = false;
		}
	}
}


/*
 * Sorts cloud objects by their size so that they are added to stage in correct order and will overlap correctly.
 */
function compare(a, b) {
	if (a.speed < b.speed) {
		return -1;
	} else if (a.speed > b.speed) {
		return 1;
	}
	return 0;
}

//////////////////////////////////////////////////////// PRE LOAD JS STUFF

// bitmap variables
var skyImage;
var backgroundsArray = [];
var cloudImagesArray = [];
var startScreenImage, startButtonImage, startButtonPressedImage; // start screen stuff
var hitSplashImage, missSplashImage;
var playButton, pauseButton;
var muteButton, unmuteButton;


// PRELOAD JS FUNCTIONS

function setupManifest() {
	manifest = [
		{
			src: "sounds/click.mp3",
			id: "click"
		},
		{
			src: "sounds/pop.mp3",
			id: "pop"
		},
		{
			src: "sounds/good.mp3",
			id: "good"
		},
		{
			src: "sounds/bad.mp3",
			id: "bad"
		},
		{
			src: "images/background.jpg",
			id: "sky"
		},
		{
			src: "images/cloud1.png",
			id: "cloud1"
		},
		{
			src: "images/cloud2.png",
			id: "cloud2"
		},
		{
			src: "images/cloud3.png",
			id: "cloud3"
		},
		{
			src: "images/cloud4.png",
			id: "cloud4"
		},
		{
			src: "images/startscreen_empty.png",
			id: "startscreen"
		},
		{
			src: "images/start_button.png",
			id: "start_button"
		},
		{
			src: "images/start_button_pressed.png",
			id: "start_button_pressed"
		},
		{
			src: "images/hit_splash.png",
			id: "hit_splash"
		},
		{
			src: "images/miss_splash.png",
			id: "miss_splash"
		},
		{
			src: "images/pause.png",
			id: "pause"
		},
		{
			src: "images/play.png",
			id: "play"
		},
		{
			src: "images/mute.png",
			id: "mute"
		},
		{
			src: "images/unmute.png",
			id: "unmute"
		},
		{
			src: "images/background1.png",
			id: "background1"
		},
		{
			src: "images/background2.png",
			id: "background2"
		},
		{
			src: "images/background3.png",
			id: "background3"
		},
		{
			src: "images/background4.png",
			id: "background4"
		},
		{
			src: "images/background5.png",
			id: "background5"
		},
		{
			src: "images/background6.png",
			id: "background6"
		},
		{
			src: "images/background7.png",
			id: "background7"
		},
		{
			src: "images/background8.png",
			id: "background8"
		}
	];
}

function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);          
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
   	if (event.item.id.includes("background")) {
   		backgroundsArray.push(new createjs.Bitmap(event.result));
   	} else if (event.item.id.includes("cloud")) {
   		cloudImagesArray.push(new createjs.Bitmap(event.result));
   	} else if (event.item.id == "startscreen") {
   		startScreenImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "start_button") {
   		startButtonImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "start_button_pressed") {
   		startButtonPressedImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "hit_splash") {
   		hitSplashImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "miss_splash") {
   		missSplashImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "pause") {
   		pauseButton = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "play") {
   		playButton = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "mute") {
   		muteButton = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "unmute") {
   		unmuteButton = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "sky") {
   		skyImage = new createjs.Bitmap(event.result);
   	}
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {
    /*progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();*/
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    // ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function

	stage.addChild(skyImage);
    stage.addChild(backgroundsArray[0]);
    stage.addChild(startScreenImage);
    initStartScreenText();
    initStartButton();
    stage.update();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS