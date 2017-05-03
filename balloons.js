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
	createjs.Tween.get(startText).to({x:-800}, 500).call(initGraphics);
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
 * Moves scrolling sky background
 */
function updateScrollingBackground() {

}

/*
 * Updates balloon position
 */
function updateBalloons() {

}