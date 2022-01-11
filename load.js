/**
 * wcln.ca
 * Greatest Common Factor
 * @author Colin Perepelken (colin@perepelken.ca)
 * March 2017
 */

// THIS FILE FOR LOADING ALL ASSETS FOR 'GREATEST COMMON FACTOR' GAME //

// bitmap variables
var backgroundImage;


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