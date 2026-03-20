const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// אלמנטים של מסך סיום
const gameOverContainer = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");
const finalScoreText = document.getElementById("final-score");

let score = 0;
let isPaused = false; // משתנה שקובע אם המשחק רץ או נעצר

const brickRowCount = 9;
const brickColumnCount = 5;
const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFF333"];

// הגדרות כדור
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};

// הגדרות מחבט
const paddle = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 20,
  w: 100,
  h: 12,
  speed: 8,
  dx: 0,
};

// הגדרות לבנים
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// יצירת מערך הלבנים
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

// פונקציות ציור
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "20px 'Segoe UI'";
  ctx.fillStyle = "white";
  ctx.fillText(`ניקוד: ${score}`, canvas.width - 100, 30);
}

function drawBricks() {
  bricks.forEach((column, i) => {
    column.forEach((brick, j) => {
      if (brick.visible) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.w, brick.h);
        ctx.fillStyle = colors[j % colors.length];
        ctx.fill();
        ctx.closePath();
      }
    });
  });
}

// לוגיקת תנועה
function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
  if (paddle.x < 0) paddle.x = 0;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // התנגשות קירות
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0)
    ball.dx *= -1;
  if (ball.y - ball.size < 0) ball.dy *= -1;

  // התנגשות במחבט
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  // התנגשות בלבנים
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.w &&
          ball.y - ball.size < brick.y + brick.h &&
          ball.y + ball.size > brick.y
        ) {
          ball.dy *= -1;
          brick.visible = false;
          increaseScore();
        }
      }
    });
  });

  // פסילה - נגיעה ברצפה
  if (ball.y + ball.size > canvas.height) {
    showGameOver();
  }
}

// ניהול מצבי משחק
function showGameOver() {
  isPaused = true; // עוצר את הלוגיקה ב-update
  finalScoreText.innerText = `הניקוד שלך: ${score}`;
  gameOverContainer.classList.add("show");
}

function restartGame() {
  score = 0;
  isPaused = false;

  // איפוס נתונים
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 4;
  ball.dx = 4;
  ball.dy = -4;
  paddle.x = canvas.width / 2 - 50;

  showAllBricks();
  gameOverContainer.classList.remove("show");
}

function increaseScore() {
  score++;
  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
    increaseDifficulty();
  }
}

function increaseDifficulty() {
  ball.speed += 0.5;
  ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
  ball.dy = ball.dy > 0 ? ball.speed : -ball.speed;
}

function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// לולאת המשחק המרכזית
function update() {
  if (!isPaused) {
    movePaddle();
    moveBall();
  }

  // תמיד מציירים כדי שהמסך לא יהיה ריק בהפסקה
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();

  requestAnimationFrame(update);
}

// אירועי מקלדת וכפתורים
function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight") paddle.dx = paddle.speed;
  else if (e.key === "Left" || e.key === "ArrowLeft") paddle.dx = -paddle.speed;
}

function keyUp(e) {
  if (["ArrowRight", "Right", "ArrowLeft", "Left"].includes(e.key))
    paddle.dx = 0;
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
restartBtn.addEventListener("click", restartGame);
rulesBtn.addEventListener("click", () => rules.classList.add("show"));
closeBtn.addEventListener("click", () => rules.classList.remove("show"));

// הפעלת המשחק
update();
