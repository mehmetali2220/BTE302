const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const forceValue = document.getElementById("forceValue");

const square = {
  x: 100,
  y: 100,
  size: 25,
  vx: 0,
  vy: 0,
  friction: 0.96,
  color: "#3498db"
};

const target = {
  x: 700,
  y: 500,
  size: 40,
  color: "#2ecc71"
};

// Daha karmaşık labirent duvarları
const walls = [
  { x: 50, y: 50, width: 700, height: 20 },
  { x: 50, y: 50, width: 20, height: 500 },
  { x: 730, y: 50, width: 20, height: 500 },
  { x: 50, y: 530, width: 700, height: 20 },
  { x: 150, y: 100, width: 20, height: 300 },
  { x: 150, y: 350, width: 150, height: 20 },
  { x: 300, y: 200, width: 20, height: 150 },
  { x: 320, y: 200, width: 150, height: 20 },
  { x: 470, y: 100, width: 20, height: 250 },
  { x: 200, y: 450, width: 300, height: 20 },
  { x: 500, y: 300, width: 150, height: 20 },
  { x: 600, y: 300, width: 20, height: 150 },
  { x: 400, y: 370, width: 20, height: 160 },
];

function drawSquare() {
  ctx.fillStyle = square.color;
  ctx.fillRect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);
}

function drawTarget() {
  ctx.fillStyle = target.color;
  ctx.fillRect(target.x - target.size / 2, target.y - target.size / 2, target.size, target.size);
}

function drawWalls() {
  ctx.fillStyle = "#2c3e50";
  walls.forEach(wall => {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });
}

function drawPullLine() {
  if (isDragging) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(square.x, square.y);
    ctx.lineTo(dragCurrentX, dragCurrentY);
    ctx.stroke();
  }
}

function checkCollision() {
  walls.forEach(wall => {
    if (
      square.x + square.size / 2 > wall.x &&
      square.x - square.size / 2 < wall.x + wall.width &&
      square.y + square.size / 2 > wall.y &&
      square.y - square.size / 2 < wall.y + wall.height
    ) {
      const overlapX1 = square.x + square.size / 2 - wall.x;
      const overlapX2 = wall.x + wall.width - (square.x - square.size / 2);
      const overlapY1 = square.y + square.size / 2 - wall.y;
      const overlapY2 = wall.y + wall.height - (square.y - square.size / 2);

      const overlapX = Math.min(overlapX1, overlapX2);
      const overlapY = Math.min(overlapY1, overlapY2);

      if (overlapX < overlapY) {
        square.vx = -square.vx * 0.8;
        if (overlapX1 < overlapX2) {
          square.x = wall.x - square.size / 2 - 0.1;
        } else {
          square.x = wall.x + wall.width + square.size / 2 + 0.1;
        }
      } else {
        square.vy = -square.vy * 0.8;
        if (overlapY1 < overlapY2) {
          square.y = wall.y - square.size / 2 - 0.1;
        } else {
          square.y = wall.y + wall.height + square.size / 2 + 0.1;
        }
      }
    }
  });

  if (
    Math.abs(square.x - target.x) < (square.size + target.size) / 2 &&
    Math.abs(square.y - target.y) < (square.size + target.size) / 2
  ) {
    alert("Tebrikler! Hedefe ulaştınız 🎉");
    resetGame();
  }
}

function resetGame() {
  square.x = 100;
  square.y = 100;
  square.vx = 0;
  square.vy = 0;
}

let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragCurrentX = 0, dragCurrentY = 0;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX > square.x - square.size / 2 &&
    mouseX < square.x + square.size / 2 &&
    mouseY > square.y - square.size / 2 &&
    mouseY < square.y + square.size / 2
  ) {
    isDragging = true;
    dragStartX = mouseX;
    dragStartY = mouseY;
    dragCurrentX = mouseX;
    dragCurrentY = mouseY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    dragCurrentX = e.clientX - rect.left;
    dragCurrentY = e.clientY - rect.top;
    const dx = dragCurrentX - dragStartX;
    const dy = dragCurrentY - dragStartY;
    const force = Math.sqrt(dx * dx + dy * dy) / 10;
    forceValue.textContent = force.toFixed(2);
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDragging) {
    const dx = dragStartX - dragCurrentX;
    const dy = dragStartY - dragCurrentY;
    square.vx = dx / 10;
    square.vy = dy / 10;
    isDragging = false;
    forceValue.textContent = "0";
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  square.vx *= square.friction;
  square.vy *= square.friction;
  if (Math.abs(square.vx) < 0.05) square.vx = 0;
  if (Math.abs(square.vy) < 0.05) square.vy = 0;
  square.x += square.vx;
  square.y += square.vy;

  checkCollision();

  drawWalls();
  drawTarget();
  drawSquare();
  drawPullLine();

  requestAnimationFrame(gameLoop);
}

gameLoop();
