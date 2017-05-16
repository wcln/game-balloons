/**
 * BCLearningNetwork.com
 * Greatest Common Factor
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * March 2017
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
var BALLOON_SPEED = 2;
var balloonSpritesArray = [];


var gameStarted = false;
var score;
var questionCounter;

// text
var scoreText;
var questionText;

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


	gameStarted = true;
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
		sprite.y = STAGE_HEIGHT - sprite.getBounds().height;
		console.log(sprite.y)
		stage.addChild(sprite);

		balloonsArray.push({
			sprite: sprite,
			label: 2
		});
	}
}

/*
 * Loads balloon sprites into sprite array
 */
function loadBalloonSpriteData(filename) {
	var spriteData = {
		images: ["images/" + filename],
		frames: {width:100, height:115, count:7, regX:0, regY:0, spacing:0, margin:0},
		animations: {
			normal: [0, false],
			pop: [0, 6, false]
		}
	};
	var sprite = new createjs.Sprite(new createjs.SpriteSheet(spriteData));

	balloonSpritesArray.push(sprite);
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

		cloudsArray.push({ // push a cloud object into array
			image: tempCloud,
			speed: tempCloud.scaleX // random cloud speed
		});
	}
	cloudsArray.sort(compare); // sort the clouds so that when they are added to stage they overlap correctly

	// add the clouds to the stage
	for (var cloud of cloudsArray) {
		stage.addChild(cloud.image);
	}
}

/*
 * Updates game score and displays updated score
 */
function updateScore(amount) {
	score += amount;
	scoreText.text = "Score:" + score;
	scoreText.x = sidebarImage.getBounds().width/2 - scoreText.getMeasuredWidth()/2;

	if (amount > 0) {
		// nice
	} else {
		// bad
	}
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
	for (var balloon of balloonsArray) {
		balloon.sprite.y-= BALLOON_SPEED;

		if (balloon.sprite.y + balloon.sprite.getBounds().height < 0) {
			balloon.sprite.y = STAGE_HEIGHT;
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