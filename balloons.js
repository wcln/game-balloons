/**
 * BCLearningNetwork.com
 * Greatest Common Factor
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * March 2017
 */

////////// VARIABLES ///////////

var mute = false;
var FPS = 24;

// unicode characters for exponents
var EXPONENT_2 = '\u00B2';
var EXPONENT_3 = '\u00B3';
var EXPONENT_4 = '\u2074';
var EXPONENT_5 = '\u2075';
var EXPONENT_6 = '\u2076';
var EXPONENT_7 = '\u2077';

var questions = [	
					{question:"15x + 18", answer:"3" , options:["3","6","7","8","2","5"]},
					{question:"8x - 20", answer:"", options:["5","8","2","3","4","6"]},
					{question:"15x + 10", answer:"", options:["5","9","10","8","15","3"]},
					{question:"7x + 21", answer:"", options:["21","8","3","7","9","5"]},
					{question:"10x - 15", answer:"", options:["6","2","5","0","4","7"]},
					{question:"7x - 21", answer:"", options:["7","4","8","0","2","5"]},
					{question:"6x - 14", answer:"", options:["8","4","2","6","5","3"]},
					{question:"6x + 15", answer:"", options:["2","3","15","4","6","9"]},
					{question:"6x + 9", answer:"", options:["6","3","7","0","9","2"]},
					{question:"12xy + 15y", answer:"", options:["3y","8","2x","5y","4x","7"]},
					{question:"27xy"+EXPONENT_5+" - "+"15y"+EXPONENT_2, answer:"", options:["3y"+EXPONENT_2,"3x","5y"+EXPONENT_2,"y","xy"+EXPONENT_2,"3"]},
					{question:"4x - 6xy", answer:"", options:["x","4x","2x","6y","1","3xy"]},
					{question:"5xy - 4y", answer:"", options:["4y","6y","1","2","y","5y"]},
					{question:"9x"+EXPONENT_6+" + "+"27x"+EXPONENT_3+"y", answer:"", options:["3x"+EXPONENT_2,"5y","2x"+EXPONENT_3,"9x"+EXPONENT_3,"4x","9"]}
					// LEFT OFF ON QUESTION 17, SELECTION 48
				];


// constants (set in init function)
var STAGE_WIDTH;
var STAGE_HEIGHT;

// clouds
var cloudsArray = [];
var NUMBER_OF_CLOUDS = 10;

// balloons
var balloonsArray = [];
var NUMBER_OF_BALLOONS = 6;
var BALLOON_SPEED = 2;
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

/*
 * Handles initialization of game components
 * Called from HTML body onload.
 */
function init() {
	// set constants
	STAGE_WIDTH = document.getElementById("gameCanvas").getAttribute("width");
	STAGE_HEIGHT = document.getElementById("gameCanvas").getAttribute("height");

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	setupManifest(); // preloadJS
	startPreload();

	score = 0; // reset game score
	questionCounter = 0;


    stage.on("stagemousedown", startGame, null, false);

}

/*
 * Main update function
 */
function update(event) {
 	if (gameStarted) {

 		updateClouds();
 		updateBalloons();


 	}

	stage.update(event);
}

/*
 * Starts the game
 */
function startGame(event) {
	playSound("click");

	event.remove();

	// ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function

	// remove start screen from visible canvas
	//createjs.Tween.get(startText).to({x:-800}, 500).call(initGraphics);
	initGraphics();
}

/*
 * Displays the end game screen
 */
function endGame() {

}

/*
 * Adds images to stage and sets initial position
 */
function initGraphics() {

	initClouds();
	initBalloons();
	initScoreText();
	initQuestionText();


	gameStarted = true;
}

/*
 * Adds the score text to the stage
 */
function initScoreText() {
	scoreText = new createjs.Text("Score: " + score, '20px Lato', "white");
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
 * Initializes balloon starting positions and objects
 */
function initBalloons() {

	var BALLOON_SPACING = 70;

	loadBalloonSpriteData("balloon_blue.png");
	loadBalloonSpriteData("balloon_yellow.png");
	loadBalloonSpriteData("balloon_green.png");
	loadBalloonSpriteData("balloon_red.png");
	loadBalloonSpriteData("balloon_orange.png");
	loadBalloonSpriteData("balloon_purple.png");

	for (var i = 0; i < balloonSpritesArray.length; i++) {
		var sprite = balloonSpritesArray[i];
		sprite.x = 60 + (sprite.getBounds().width + 35) * i;
		sprite.y = parseInt(STAGE_HEIGHT) + Math.floor(Math.random() * 40);
		sprite.name = questions[questionCounter].options[i];
		sprite.on("click", function(event) {balloonClickHandler(event);});
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

/*
 * Loads balloon sprites into sprite array
 */
function loadBalloonSpriteData(filename) {
	var spriteData = {
		images: ["images/" + filename],
		frames: {width:100, height:115, count:7, regX:0, regY:0, spacing:5, margin:0},
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
async function balloonClickHandler(event) {
	var id = event.target.name; // get ID of the balloon that was clicked

	popBalloon(id);

	if (id == questions[questionCounter].answer) { // CORRECT ANSWER

		// determine if got first one correct or not
		var anyRemoved = false;
		for (var balloon of balloonsArray) {
			if (balloon.removed) {
				anyRemoved = true;
			}
		}

		if (!anyRemoved) { // first one correct!
			updateScore(1000);



		} else { // a balloon has already been popped
			updateScore(500);
		}

		// pop all the other balloons remaining
		setTimeout(function() { popAllBalloonsExcept(id); }, 500);


	} else { // INCORRECT ANSWER

		updateScore(-500);

	}
}


/*
 * Pops a balloon by performing animation and removing from stage
 */
function popBalloon(id) {
	for (var balloon of balloonsArray) {
		if (balloon.label.text == id) { // this is the balloon to pop
			createjs.Tween.get(balloon.sprite).call(function animate() { 
					balloon.sprite.gotoAndPlay("pop");
					playSound("pop");
					displayScoreLabel(balloon.sprite.x, balloon.sprite.y);
				}).wait(300).call(function remove() { 
					stage.removeChild(balloon.sprite);
					stage.removeChild(balloon.label);
					balloon.sprite.y = -100;
					balloon.removed = true;
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
			updateScore(500);
			lastTimePopped = new Date().getTime();
		}
	}
}

/*
 * Sets up the cloud images and initial positions (called by initGraphics)
 */
function initClouds() {
	for (var i = 0; i < NUMBER_OF_CLOUDS; i++) {
		var tempCloud = Object.create(cloudImage);
		tempCloud.x = Math.floor(Math.random() * STAGE_WIDTH) + 50; // between 50 and stage width
		tempCloud.y = Math.floor(Math.random() * 400) + 0;
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
 * Updates the question text and maintains center position
 */
function updateQuestionText(text) {
	// TODO
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
	var resetBalloons = true;
	for (var balloon of balloonsArray) {
		balloon.sprite.y -= balloon.speed;
		balloon.label.y = balloon.sprite.y + balloon.sprite.getBounds().height/2 - balloon.label.getMeasuredHeight()/2 - 4;

		if (balloon.sprite.y + balloon.sprite.getBounds().height > 0) {
			resetBalloons = false;
		}
	}
	if (resetBalloons) {
		for (var balloon of balloonsArray) {
			balloon.sprite.y = parseInt(STAGE_HEIGHT) + Math.floor(Math.random() * 40);
			balloon.speed = BALLOON_SPEED + Math.random() * 0.7;
			balloon.label.y = balloon.sprite.y + balloon.sprite.getBounds().height/2 - balloon.label.getMeasuredHeight()/2;

			if (balloon.removed) {
				balloon.removed = false;
				balloon.sprite.gotoAndPlay("normal");
				stage.addChild(balloon.sprite);
				stage.addChild(balloon.label);
			}
		}
	}
	
	popBalloonsWithDelay();
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
var backgroundImage;
var cloudImage;


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
			src: "images/background.jpg",
			id: "background"
		},
		{
			src: "images/cloud.png",
			id: "cloud"
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
   	if (event.item.id == "background") {
   		backgroundImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "cloud") {
   		cloudImage = new createjs.Bitmap(event.result);
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

    stage.addChild(backgroundImage);
    stage.update();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS