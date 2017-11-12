<!DOCTYPE html>
<html>
<head>
	<title><?=rawurldecode($_GET['title'])?></title>
	<meta charset="utf-8"/>
	<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Lato"><!-- google web font -->
	<link rel="stylesheet" type="text/css" href="style/style.css"/>
	<link rel="shortcut icon" href="images/favicon.ico"/>
	<script src="https://bclearningnetwork.com/lib/jquery/jquery-3.1.0.min.js"></script><!-- CreateJS library hosted on BCLN server -->
	<script src="https://bclearningnetwork.com/lib/createjs/createjs-2015.11.26.min.js"></script><!-- CreateJS library hosted on BCLN server -->
	<script type="text/javascript" src="helper.js"></script><!-- contains helper functions which do not call functions in balloon.js -->

	<!-- load data from version JSON file -->
	<script>

		var questions = [];
		var title, description;
		$.getJSON("versions/<?=$_GET['title']?>.json", function(json) {

			let numlevels = json['numlevels'];
			let numquestions = json['numquestions'];

			title = json['title'];
			description = json['description'];


			for (var i = 0; i <= numlevels; i++) {



				for (var j = 0; j <= numquestions; j++) {

					let options = [];
					for (var k = 0; k < 4; k++) {
						options[k] = json['o_'+i+''+j+''+k];
					}
					options[4] = json['a_'+i+''+j]; // add the answer as an option
					shuffle(options);

					if (j == 0) {
						questions.push({name: json['levelname'+i], speed: json['levelspeed'+i], question: json['q_'+i+''+j], answer: json['a_'+i+''+j], options: options});
					} else {
						questions.push({question: json['q_'+i+''+j], answer: json['a_'+i+''+j], options: options});
					}

				}
			}

		});


	</script>
	<script type="text/javascript" src="balloons.js"></script><!-- The main game JS file -->
</head>
<body onload="init();"><!-- body onload calls function to initialize game -->

	<canvas id="gameCanvas" width="900" height="700">
		<!-- game will be rendered here -->
	</canvas>
	
</body>
</html>