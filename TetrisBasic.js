let canvas;
let ctx;
let gameBoard;
let gBArrayHeight = 20;
let gBArrayWidth = 12;
let startX = 4;
let startY = 0;
let score = 0;
let level = 1;
let winOrLose = "Playing";
let tetrisLogo;
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));         // to create an array with y(gBArrayHeight) and x(gBArrayWidth)
let currTetromino = [[1,0], [0,1], [1,1], [2,1]];
let isPause = false;
let ghostTetromino = [];
const size = 40;
const image = document.getElementById('image');
const retryButton = document.getElementById('retry');

let tetrominos = [];
let tetrominoColors = ['#00f0f0', '#f0f000', '#a000f0', '#0000f0', '#f0a000', '#00f000', '#f00000'];
let currTetrominoColor;

let gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
 
let direction;

// let drawRect = (x, y, 280, 560, color) => {
//     ctx.fillStyle = color;
//     ctx.fillRect(x, y, width, height);
// };


class Coordinates{
    constructor(x, y){      //to populate x and y values later in the code
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', SetupCanvas);

function CreateCoordArray(){        //function to populate coordinates
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23){      //9 pixels from top, 446 from top to bottom
        for(let x = 11; x <= 264; x += 23){   //11 pixels from left, 264 pixels from left to right
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
}

function SetupCanvas(){
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    ctx.scale(2,2);

    ctx.fillStyle = '#3d304d';
    ctx.fillRect(8, 8, 280, 462);

    DrawGrid();

    ctx.strokeStyle = 'white';
    ctx.strokeRect(8, 8, 280, 462);

    document.fonts.ready.then(() => {
       
        drawUI();

        document.addEventListener('keydown', HandleKeyPress);
        CreateTetrominos();
        CreateTetromino();
        CreateCoordArray();
        DrawTetromino();
    });
};

function drawUI() {
    

    ctx.fillStyle = 'white';
    ctx.font = '54px MyCustomFont';
    ctx.fillText("TETRIS", 300, 60);

    ctx.font = '21px MyCustomFont';
    ctx.fillText("SCORE:", 300, 98);
    ctx.strokeRect(300, 107, 161, 24);
    
    ctx.clearRect(301, 108, 159, 22);
    ctx.fillText(score.toString(), 310, 127);

    ctx.fillText("LEVEL:", 300, 157);
    ctx.strokeRect(300, 171, 161, 24);
    ctx.fillText(level.toString(), 310, 190);

    ctx.fillText("CONTROLS", 300, 221);
    ctx.strokeRect(300, 232, 161, 95);
    ctx.fillText("A : MOVE LEFT", 310, 254);
    ctx.fillText("D : MOVE RIGHT", 310, 275);
    ctx.fillText("S : MOVE DOWN", 310, 296);
    ctx.fillText("W : ROTATE", 310, 317);

    
    ctx.fillText("PRESS Q TO RESTART", 300, 355);

}

function DrawTetromino() {
    for (let i = 0; i < currTetromino.length; i++) {
        let x = currTetromino[i][0] + startX;
        let y = currTetromino[i][1] + startY;
        gameBoardArray[x][y] = 1; // Mark the board position

        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;

        // Call the new helper function for a much cleaner look
        drawRoundedSquare(coorX, coorY, currTetrominoColor);
    }
}

function drawRoundedSquare(coorX, coorY, color) {
    const cornerRadius = 5; // Adjust this value for more or less rounding
    const size = 21;

    ctx.fillStyle = color;
    
    // --- Custom rounded rectangle drawing logic ---
    ctx.beginPath();
    ctx.moveTo(coorX + cornerRadius, coorY);
    ctx.lineTo(coorX + size - cornerRadius, coorY);
    ctx.arcTo(coorX + size, coorY, coorX + size, coorY + cornerRadius, cornerRadius);
    ctx.lineTo(coorX + size, coorY + size - cornerRadius);
    ctx.arcTo(coorX + size, coorY + size, coorX + size - cornerRadius, coorY + size, cornerRadius);
    ctx.lineTo(coorX + cornerRadius, coorY + size);
    ctx.arcTo(coorX, coorY + size, coorX, coorY + size - cornerRadius, cornerRadius);
    ctx.lineTo(coorX, coorY + cornerRadius);
    ctx.arcTo(coorX, coorY, coorX + cornerRadius, coorY, cornerRadius);
    ctx.closePath();
    ctx.fill();
}

function printGameOver(){
    if(winOrLose === "Game Over"){
        ctx.fillStyle = 'white';
        ctx.font = '50px MyCustomFont';
        ctx.fillText("GAME OVER", 60, 250);
    }
}

function HandleKeyPress(key){
    if(winOrLose != "Game Over"){
        if(key.keyCode === 65 && !isPause){
            direction = DIRECTION.LEFT;
            if(!HittingWall() && !CheckForHorizontalCollision()){
                DeleteTetromino();      //delete the previous position square
                startX--;               //decrement the starting x point to go left
                DrawTetromino();
            }
        }else if(key.keyCode === 68 && !isPause){
            direction = DIRECTION.RIGHT;
            if(!HittingWall() && !CheckForHorizontalCollision()){
                DeleteTetromino();
                startX++;           //increase the starting x point to go right
                DrawTetromino();
            }
        }else if(key.keyCode === 83 && !isPause){
            MoveTetrominoDown();
        }else if(key.keyCode === 87 && !isPause){
            RotateTetromino();
        }else if(key.keyCode === 80){
            isPause = !isPause;
        }
    }
    if(winOrLose === "Game Over" || winOrLose != "Game Over"){
        if(key.keyCode === 81){
            resetGame();
        }
        return;    
    }     
}

function MoveTetrominoDown(){
    direction = DIRECTION.DOWN  
    score += 20;    //increase the y coordinate towards down direction
    if(!CheckForVerticalCollision()){
        DeleteTetromino();
        startY++;
        DrawTetromino();
    }
}

window.setInterval(function(){
    if(winOrLose != "Game Over"){
        MoveTetrominoDown();
    }
}, 1000);

function DeleteTetromino(){
    for(let i = 0; i < currTetromino.length; i++){
        let x = currTetromino[i][0] + startX;
        let y = currTetromino[i][1] + startY;
        gameBoardArray[x][y] = 0;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = '#3d304d';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function CreateTetrominos(){
    // T
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // Square
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}

function CreateTetromino(){
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    currTetromino = tetrominos[randomTetromino];
    currTetrominoColor = tetrominoColors[randomTetromino];
}

function HittingWall(){
    for(let i = 0; i < currTetromino.length; i++){
        //checking if the new position is inside the wall
        let newX = currTetromino[i][0] + startX;
        if(newX <= 0 && direction === DIRECTION.LEFT){
            return true;
        }else if(newX >= 11 && direction === DIRECTION.RIGHT){
            return true;
        }
    }
    return false;
}

function CheckForVerticalCollision() {
    let tetrominoCopy = currTetromino;
    // Loop through each square of the tetromino
    for (let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;

        // Check if the piece is at the very bottom or if there's a stopped piece below
        if (y + 1 >= gBArrayHeight || (stoppedShapeArray[x][y + 1] && typeof stoppedShapeArray[x][y + 1] === 'string')) {
            // If the piece collides at the very top, it's game over
            if (startY <= 0) {
                winOrLose = "Game Over";
                ctx.fillStyle = 'white';
                
                printGameOver();
                
            } else {
                // Otherwise, lock the current piece in place
                for (let i = 0; i < currTetromino.length; i++) {
                    let square = currTetromino[i];
                    let x = square[0] + startX;
                    let y = square[1] + startY;
                    stoppedShapeArray[x][y] = currTetrominoColor;
                    gameBoardArray[x][y] = 1;
                }
                // Check for any completed rows
                CheckForCompletedRows();
                // Create the next tetromino
                CreateTetromino();
                // Reset position and draw the new piece
                direction = DIRECTION.IDLE;
                startX = 4;
                startY = 0;
                DrawTetromino();
            }
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function CheckForHorizontalCollision(){
    let tetrominoCopy = currTetromino;
    let collision = false;
    for(let i = 0; i < tetrominoCopy.length; i++){
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;

        if(direction === DIRECTION.LEFT){
            x--;
        }else if(direction === DIRECTION.RIGHT){
            x++;
        }
        var stoppedShapeVal = stoppedShapeArray[x][y];
        if(typeof stoppedShapeVal === 'string'){
            collision = true;
            break;
        }
    }
    return collision;
}

function CheckForCompletedRows(){
    let rowsToDelete = 0;
    let startOfDeletion = 0;
    for(let y = 0; y < gBArrayHeight; y++){
        let completed = true;
        for(let x = 0; x < gBArrayWidth; x++){
            let square = stoppedShapeArray[x][y];
            if(square === 0 || (typeof square === 'undefined')){
                completed = false;
                break;
            }
        }
        //deleting the row if its completed
        if(completed){
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;
            for(let i = 0; i < gBArrayWidth; i++){
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y] = 0;
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                ctx.fillStyle = '#3d304d';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    //updating the score
    if(rowsToDelete > 0){
        score + 800;
        drawUI();
        ctx.fillText(score.toString(), 310, 127);
        MoveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}

//move all rows down after deletion
function MoveAllRowsDown(rowsToDelete, startOfDeletion) {
    for (var i = startOfDeletion - 1; i >= 0; i--) {
        for (var x = 0; x < gBArrayWidth; x++) {
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];
            if (typeof square === 'string') {
                nextSquare = square;
                gameBoardArray[x][y2] = 1;
                stoppedShapeArray[x][y2] = square;
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;

                drawRoundedSquare(coorX, coorY, nextSquare);

                square = 0;
                gameBoardArray[x][i] = 0;
                stoppedShapeArray[x][i] = 0;
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = '#3d304d';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

function RotateTetromino(){
    let newRotation = new Array();
    let tetrominoCopy = currTetromino;
    let curTetrominoBU;
    for(let i = 0; i < tetrominoCopy.length; i++){
        curTetrominoBU = [...currTetromino];
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    DeleteTetromino();
    //try and catch to make sure new tetrominos dont go outside the board
    try{
        currTetromino = newRotation;
        DrawTetromino();
    }catch(e){
        if(e instanceof TypeError){     //TypeError: when you work with value or instance which does not exist
            currTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

function GetLastSquareX(){
    let lastX = 0;
    for(let i = 0; i < currTetromino.length; i++){
        let square = currTetromino[i];
        if(square[0] > lastX) lastX = square[0];
    }
    return lastX;
}

function resetGame() {
    // 1. Reset all game state variables
    score = 0;
    level = 1;
    winOrLose = "Playing"; // Match case for consistency
    startX = 4;
    startY = 0;

    // 2. Clear all board arrays
    gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
    stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

    // 3. Clear the canvas for a fresh start
    ctx.fillStyle = '#3d304d';
    ctx.fillRect(8, 8, 280, 462);

    // 4. Redraw the grid AND the border for a consistent look
    DrawGrid();
    ctx.strokeStyle = 'white'; // Redraw the white border around the play area
    ctx.strokeRect(8, 8, 280, 462);

    // 5. Redraw all the UI text elements
    drawUI();
    // 6. IMPORTANT: Clear old tetromino definitions and create a new set
    tetrominos = [];
    CreateTetrominos();

    // 7. IMPORTANT: Create a new piece before trying to draw it
    CreateTetromino();
    DrawTetromino();
}

function DrawGrid() {
    // Define the properties of the grid based on your game's variables
    const boardStartX = 10;
    const boardStartY = 8;
    const cellWidth = 23;  
    const cellHeight = 23; 

    // Set a color for the grid lines
    ctx.strokeStyle = '#464646'; // A light gray is good for grids
    ctx.lineWidth = 2;           // Make the lines thin so they don't stand out too much

    // A beginPath() is good practice to ensure settings from other drawings don't leak in
    ctx.beginPath();

    // Draw all the vertical lines
    for (let i = 0; i <= gBArrayWidth; i++) {
        const x = boardStartX + (i * cellWidth);
        ctx.moveTo(x, boardStartY);
        ctx.lineTo(x, boardStartY + (gBArrayHeight * cellHeight));
    }

    // Draw all the horizontal lines
    for (let j = 0; j <= gBArrayHeight; j++) {
        const y = boardStartY + (j * cellHeight);
        ctx.moveTo(boardStartX, y);
        ctx.lineTo(boardStartX + (gBArrayWidth * cellWidth), y);
    }

    // Render the lines on the canvas
    ctx.stroke();

    // Reset line width for other drawings
    ctx.lineWidth = 1;
}

