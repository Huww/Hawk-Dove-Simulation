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

//Used to slow the rate at which the generations are iterated through (high = slower)
let rate = 10;

let res;
let grid;
let counter = 0;
let generation = 1;
let hawkCount = 0;

function setup() {
	randomSeed(1);
	createCanvas(600, 401);
	//Create the initial grid
	grid = create2DArray(gridSize,gridSize);
	//Generate the initial positions of the hawks
	hawkList = generateHawks(hawkProb);

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
	//res is used to scale the size of the grid with the canvas size
	res = (canvas.height-1) / gridSize;

}

//Executes every frame
function draw() {
  background(255);

	//General Text
	fill(0);
	textSize(18);

	text('Generation: ' + str(generation), width - 180, 30);
	text('Beta: ' + str(beta), width - 180, 60);
	text('Doves: ' + str(round(((1-(hawkCount / pow(gridSize,2)))* 100)*10)/10) + "%", width - 180, 90);
	text('Hawks: ' + str(round(((hawkCount / pow(gridSize,2))* 100)*10)/10) + "%", width - 180, 120);

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
	if(counter % rate == 0){
		//nextGen();
	}
	counter++;

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
		nextGen();
  }
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
