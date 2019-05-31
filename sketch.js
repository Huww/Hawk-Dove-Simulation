/*
Hawk = 0 - Dove = 1
	 0		1
0| 1-B  2
1|  0		1
*/
//Variables for the simulation
let gridSize = 40;
let hawkProb = 0.2;
let beta = 2.2;

//The matrix of values for the scores
let strats = [[1-beta,2],[0,1]];

let res;
let grid;
let counter = 0;
let generation = 1;
let hawkCount = 0;
let play = false;

//HTML Stuff
let startButton;
let nextButton;
let resetButton;
let speedSlider;
let seedCheckbox;
let betaSlider;
let hawkSlider;
let gridSlider;

function setup() {
	createCanvas(600, 401);
	initialiseHTML();
	resetSim();
	//res is used to scale the size of the grid with the canvas size
	console.log(width, height);
}

//Executes every frame
function draw() {
  background(255);

	betaText.html('Beta: ' + str(betaSlider.value()));
	hawkText.html('Hawks: ' + str(floor(hawkSlider.value()*100)) + '%');
	gridText.html('Grid Size: ' + str(gridSlider.value()));
	//General Text
	fill(0);
	textSize(18);

	text('Generation: ' + str(generation), width - 180, 30);
	text('Grid Size: ' + str(gridSize), width - 180, 60);
	text('Beta: ' + str(beta), width - 180, 90);
	text('Doves: ' + str(round(((1-(hawkCount / pow(gridSize,2)))* 100)*10)/10) + "%", width - 180, 120);
	text('Hawks: ' + str(round(((hawkCount / pow(gridSize,2))* 100)*10)/10) + "%", width - 180, 150);

	//Drawing the grid to the screen
	for (var i=0; i < gridSize; i++) {
		for (var j=0; j < gridSize; j++) {
			if(grid[i][j] == 0){
				fill(0);
			} else {
				fill(255);
			}
			rect(i*res, j*res, res, res);
		}
	}

	//Runs the next generation
	if(counter % (27-speedSlider.value()) == 0 && play){
		nextGen();
	}
	counter++;
	fill(0);
	textSize(12);
	text('100', width - 185, height - 220);
	text('0', width - 172, height - 30);
	textSize(14);
	text('%', width - 190, height - 125);

	text('Doves', width - 140, height-10);
	text('Hawks', width - 80, height-10);

	text(str(round(((1-(hawkCount / pow(gridSize,2)))* 100)*10)/10) + "%", width - 135, height - 32 - (1-(hawkCount / pow(gridSize,2)))* 200);
	text(str(round(((hawkCount / pow(gridSize,2))* 100)*10)/10) + "%", width - 75, height - 32 - (hawkCount / pow(gridSize,2))* 200);

	text('Hawks', width - 80, height-10);

	rect(width - 160, height-230, 2, 200);
	rect(width - 160, height-30, 140, 2);
	rect(width - 80, height - 30 - (hawkCount / pow(gridSize,2))* 200, 40, (hawkCount / pow(gridSize,2))* 200);
	rect(width - 140, height - 30 - (1-(hawkCount / pow(gridSize,2)))* 200, 40, (1-(hawkCount / pow(gridSize,2)))* 200);

}

//Computes the next generation
function nextGen(){
	generation++;
	//Create arrays to hold the scores and the updated grid
	let scoreGrid = create2DArray(gridSize,gridSize);
	let nextGrid = create2DArray(gridSize,gridSize);

	//Calculate the score for each cell in the grid
	for (var i=0; i < gridSize; i++) {
		for (var j=0; j < gridSize; j++) {
			scoreGrid[i][j] = sumNeighbours(grid, i, j);
		}
	}

	//Assign new strategies based on the neighbouring cell with maximum score
	hawkCount = 0;
	for (var i=0; i < gridSize; i++) {
		for (var j=0; j < gridSize; j++) {
			let maxPos = maxNeighbour(scoreGrid, i, j);
				nextGrid[i][j] = grid[maxPos[0]][maxPos[1]];
				if(nextGrid[i][j] == 0) {
					hawkCount++;
				}
			}
		}
		//Updates the grid
		grid = nextGrid;
}

//Calculates the score of a cell based on its 8 neighbours
//Includes a tie-breaking mechanism (adding a small random perturbation)
function sumNeighbours(arr, x, y) {
	let sum = 0.;
	for(var i = -1; i < 2; i++){
		for (var j = -1; j < 2; j++) {
			let col = (x + i + gridSize) % gridSize;
			let row = (y + j + gridSize) % gridSize;
			sum += strats[arr[x][y]][arr[col][row]];
		}
	}
	sum -= strats[arr[x][y]][arr[x][y]];
	return sum+random()*0.05;
}

//Calculates the maximum score of a neighbour given a matrix of scores
function maxNeighbour(grid, x, y) {
	let max = -Infinity;
	let maxCol=0;
	let maxRow=0;
	for(var i = -1; i < 2; i++){
		for (var j = -1; j < 2; j++) {
			let col = (x + i + gridSize) % gridSize;
			let row = (y + j + gridSize) % gridSize;
			if(grid[col][row] > max){
				max = grid[col][row];
				maxCol = col;
				maxRow = row;
			}
		}
	}
	return [maxCol, maxRow];
}

//Called whenever a key is pressed
function keyPressed() {
  //Spacebar
  if (keyCode === 32) {
		nextPressed();
  }
}

//Starts and stops the simulation
function startStop(){
	if(play) {
		startButton.html('Start');
		play = false;
	} else {
		startButton.html('Stop');
		beta = betaSlider.value();
		strats = [[1-beta,2],[0,1]];
		play = true;
	}
}

//Resets the simulation
function resetSim() {
	gridSize = gridSlider.value();
	generation = 1;
	if(play) startStop();
	hawkCount = 0;
	if(seedCheckbox.checked()) randomSeed(1);
	beta = betaSlider.value();
	hawkProb = hawkSlider.value();
	strats = [[1-beta,2],[0,1]];
	//Create the initial grid
	grid = create2DArray(gridSize,gridSize);
	//Generate the initial positions of the hawks
	hawkList = generateHawks(hawkProb);

	res = (height-1) / gridSize;

	//Assign each position in the grid as either a hawk or dove
	let count = 0;
	for (var i=0; i < gridSize; i++) {
		for (var j=0; j < gridSize; j++) {
			if(hawkList.indexOf(count) != -1) {
				grid[i][j] = 0;
				hawkCount++;
			} else {
				grid[i][j] = 1;
			}
			count++;
		}
	}
}

//Initialise all HTML elements
function initialiseHTML() {
	startButton = createButton('Start');
	startButton.position(5, height + 10);
	startButton.mousePressed(startStop);

	nextButton = createButton('Next');
	nextButton.position(50, height + 10)
	nextButton.mousePressed(nextPressed);

	resetButton = createButton('Reset');
	resetButton.position(95, height + 10)
	resetButton.mousePressed(resetSim);

	txt1 = createDiv('Speed: ');
  txt1.position(5, height + 35);
	speedSlider = createSlider(2,25,12);
	speedSlider.position(95, height + 35);

	betaSlider = createSlider(0,10,2.2,0.1);
	betaSlider.position(95, height + 60);
	betaText = createDiv('Beta: ' + str(betaSlider.value()));
  betaText.position(5, height + 60);

	hawkSlider = createSlider(0,1,0.2,0.01);
	hawkSlider.position(95, height + 85);
	hawkText = createDiv('Hawks: ' + str(floor(hawkSlider.value()*100)) + '%');
  hawkText.position(5, height + 85);

	gridSlider = createSlider(10,60,40,5);
	gridSlider.position(95, height + 110);
	gridText = createDiv('Grid Size: ' + str(gridSlider.value()));
  gridText.position(5, height + 110);

	seedCheckbox = createCheckbox('Use the same random seed?', false);
	seedCheckbox.position(5, height + 135);
}

//Called when the next button is pressed - used to update beta
function nextPressed() {
	beta = betaSlider.value();
	strats = [[1-beta,2],[0,1]];
	nextGen();
}
//Creates a matrix/2D Array
function create2DArray(rows, cols) {
	let arr = new Array(rows);
	for (var i = 0; i < arr.length; i++) {
		arr[i] = new Array(cols);
	}
	return arr;
}

//Generates an array of unique random positions for the hawks in the grid
function generateHawks(hawkProb){
	let noHawks = hawkProb * pow(gridSize,2);
	var arr = []
	while(arr.length < noHawks){
    var r = Math.floor(random(pow(gridSize,2)));
    if(arr.indexOf(r) === -1) arr.push(r);
	}
	return arr;

}
