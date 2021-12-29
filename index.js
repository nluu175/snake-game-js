const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");

const BOARD_SIZE = 600;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

// PROPERTIES
// - Game Settings (default)
const gameSettings = { gameMode: "classic", difficulty: "normal" };

// - Game properties
let noTiles = 30;
let speed = 7;
let difficultyStep = 3;
let timePassed = 0;
let tileSize = canvas.width / noTiles; // tileSize = 600 / 40 = 15
let score = 0;
// ---
let gameDifficulty = {};
// ---
let gameStarted = false;
// -----

// - Snake Settings
class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Snake
const snakeProps = {
  headX: noTiles / 2,
  headY: noTiles / 2,
  previousHeadX: noTiles / 2,
  previousHeadY: noTiles / 2,
  velocityX: 0,
  velocityY: 0,
};

let snakeTails = [];
let tailLength = 0;

// The reason for noTiles - 1 is if we start drawing at (noTiles, noTiles), we will
// end up with the food outside of the canvas (width + tileSize, height + tileSize)
const foodProps = {
  foodX: Math.floor(Math.random() * (noTiles - 1)),
  foodY: Math.floor(Math.random() * (noTiles - 1)),
};

// Mode Registering
const modeSetup = () => {};

// Difficulty Registering
const difficultySetup = () => {
  switch (gameSettings.difficulty) {
    case "easy":
      speed = 7;
      difficultyStep = 3;
      break;
    case "normal":
      speed = 10;
      difficultyStep = 4;
      break;
    case "hard":
      speed = 13;
      difficultyStep = 5;
      break;
  }
};

// Positive is DOWN RIGHT
const keyDown = (e) => {
  switch (e.keyCode) {
    // Direction Keys
    case 37:
    case 65:
      // LEFT
      if (snakeProps.velocityX === 1) {
        return;
      }
      snakeProps.velocityX = -1;
      snakeProps.velocityY = 0;
      break;

    case 38:
    case 87:
      // UP
      if (snakeProps.velocityY === 1) {
        return;
      }
      snakeProps.velocityX = 0;
      snakeProps.velocityY = -1;
      break;

    case 39:
    case 68:
      // RIGHT
      if (snakeProps.velocityX === -1) {
        return;
      }
      snakeProps.velocityX = 1;
      snakeProps.velocityY = 0;
      break;

    case 40:
    case 83:
      // DOWN
      if (snakeProps.velocityY === -1) {
        return;
      }
      snakeProps.velocityX = 0;
      snakeProps.velocityY = 1;
      break;

    case 13:
      // Enter
      if (!gameStarted) startGame();
      break;
  }
};

// Draw
const drawBoard = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawSnake = () => {
  ctx.fillStyle = "green";
  for (let i = 0; i < snakeTails.length; i++) {
    let part = snakeTails[i];
    ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
  }

  snakeTails.push(new SnakePart(snakeProps.headX, snakeProps.headY));
  while (snakeTails.length > tailLength) {
    snakeTails.shift();
  }

  ctx.fillStyle = "orange";
  ctx.fillRect(
    snakeProps.headX * tileSize,
    snakeProps.headY * tileSize,
    tileSize,
    tileSize
  );
};

const drawFood = () => {
  const foodsColor = ["orange", "pink", "red", "yellow", "purple"];
  const randomIndex = Math.floor(Math.random() * foodsColor.length);
  ctx.fillStyle = foodsColor[randomIndex];
  // ctx.fillStyle = "yellow";
  ctx.fillRect(
    foodProps.foodX * tileSize,
    foodProps.foodY * tileSize,
    tileSize,
    tileSize
  );
};

const drawGameOverMessage = () => {
  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0", "red");
  gradient.addColorStop("0.5", "pink");
  gradient.addColorStop("1.0", "blue");

  ctx.font = "50px JetBrains Mono";
  ctx.fillStyle = gradient;

  ctx.fillText("Game Over!", canvas.width / 2 - 140, canvas.height / 2);
};

// Game rules
const updateSnakePosition = () => {
  snakeProps.headX = snakeProps.headX + snakeProps.velocityX;
  snakeProps.headY = snakeProps.headY + snakeProps.velocityY;
};

const checkEatenFood = () => {
  if (
    snakeProps.headX === foodProps.foodX &&
    snakeProps.headY === foodProps.foodY
  ) {
    foodProps.foodX = Math.floor(Math.random() * (noTiles - 1));
    foodProps.foodY = Math.floor(Math.random() * (noTiles - 1));

    // Update length
    tailLength++;
    // Update Score
    score++;
    scoreBoard.textContent = score;
  }
};

const checkEndGame = () => {
  if (snakeProps.velocityX === 0 && snakeProps.velocityY === 0) {
    return false;
  }

  // Walls Collision
  if (
    snakeProps.headX < 0 ||
    snakeProps.headY < 0 ||
    snakeProps.headX >= noTiles ||
    snakeProps.headY >= noTiles
  ) {
    return true;
  }

  for (let i = 0; i < snakeTails.length; i++) {
    let part = snakeTails[i];
    if (part.x === snakeProps.headX && part.y === snakeProps.headY) {
      return true;
    }
  }

  return false;
};

// Game Flow Control
const newGame = () => {
  const name = prompt("Enter your name!!!");
  const playAgain = confirm("Do you want to play again?");
  console.log(playAgain);

  if (playAgain) {
    // reset to default
    // - Game Props
    noTiles = 30;
    speed = 10;
    timePassed = 0;
    tileSize = canvas.width / noTiles; // tileSize = 600 / 40 = 15
    score = 0;

    // - Snake Props
    snakeProps.headX = noTiles / 2;
    snakeProps.headY = noTiles / 2;
    snakeProps.velocityX = 0;
    snakeProps.velocityY = 0;

    snakeTails = [];
    tailLength = 2;

    gameLoop();
  } else {
    return;
  }
};

const setRecord = (name) => {
  localStorage.setItem("name");
};

const gameLoop = () => {
  updateSnakePosition();
  if (checkEndGame()) {
    drawGameOverMessage();
    setTimeout(newGame, 1000);
    return;
  }

  drawBoard();
  checkEatenFood();
  drawSnake();
  drawFood();
  setTimeout(gameLoop, 1000 / speed);
};

const startGame = () => {
  gameStarted = true;
  document.getElementById("startGame").textContent = "Restart";
  // document.getElementById("startGame").style.visibility = "Hidden";

  gameSettings.gameMode = document.getElementById("gameMode").value;
  gameSettings.difficulty = document.getElementById("difficulty").value;

  difficultySetup();

  gameLoop();
};

document.body.addEventListener("keydown", keyDown);
document.getElementById("startGame").addEventListener("click", startGame);
