let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

let engine, world;
let box;
let isDragging = false;
let dragStart, dragEnd;
let lastForceMagnitude = 0;
let gameWon = false;
let exit;

let walls = [];

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  engine = Engine.create();
  world = engine.world;

  engine.world.gravity.y = 0;

  box = Bodies.rectangle(100, 300, 40, 40, {
    restitution: 0.6,
    friction: 0.1,
    frictionAir: 0.05,
    isStatic: false,
    render: { fillStyle: '#3498db' }
  });
  World.add(world, box);

  exit = Bodies.rectangle(750, 300, 60, 60, {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: '#2ecc71', visible: true }
  });
  World.add(world, exit);

  // Dış duvarlar
  walls.push(Bodies.rectangle(400, 30, 800, 20, { isStatic: true, render: { fillStyle: '#34495e' } }));
  walls.push(Bodies.rectangle(30, 300, 20, 600, { isStatic: true, render: { fillStyle: '#34495e' } }));
  walls.push(Bodies.rectangle(400, 570, 800, 20, { isStatic: true, render: { fillStyle: '#34495e' } }));
  walls.push(Bodies.rectangle(770, 300, 20, 600, { isStatic: true, render: { fillStyle: '#34495e' } }));

  // İç duvarlar
  walls.push(Bodies.rectangle(200, 100, 300, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(600, 150, 300, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(200, 200, 200, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(500, 250, 200, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(300, 350, 400, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(200, 400, 200, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(600, 450, 200, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(300, 500, 300, 20, { isStatic: true, render: { fillStyle: '#e74c3c' } }));

  walls.push(Bodies.rectangle(150, 150, 20, 100, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(350, 200, 20, 200, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(450, 150, 20, 150, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(550, 250, 20, 200, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(250, 300, 20, 150, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(650, 350, 20, 200, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(150, 450, 20, 100, { isStatic: true, render: { fillStyle: '#e74c3c' } }));
  walls.push(Bodies.rectangle(450, 400, 20, 150, { isStatic: true, render: { fillStyle: '#e74c3c' } }));

  World.add(world, walls);

  Matter.Events.on(engine, 'collisionStart', function(event) {
    let pairs = event.pairs;
    for (let pair of pairs) {
      if ((pair.bodyA === box && pair.bodyB === exit) ||
          (pair.bodyA === exit && pair.bodyB === box)) {
        gameWon = true;
      }
    }
  });
}

function draw() {
  background(240);
  Engine.update(engine);

  for (let wall of walls) drawBody(wall);
  drawBody(exit);
  drawBody(box);

  if (isDragging && dragStart) {
    stroke(255, 0, 0);
    strokeWeight(2);
    line(dragStart.x, dragStart.y, mouseX, mouseY);
    noStroke();
  }

  fill(0);
  textSize(16);
  text("Kutuyu tıklayıp, itme yönüne doğru hareket ettir.", 20, 30);
  if (lastForceMagnitude > 0) {
    text(`Uygulanan Kuvvet: ${nf(lastForceMagnitude, 1, 2)} N`, 20, 60);
  }

  if (gameWon) {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Tebrikler! Labirentten Çıktınız!", width / 2, height / 2);
    textSize(24);
    text("Sayfayı yenileyerek tekrar oynayabilirsiniz.", width / 2, height / 2 + 50);
    textAlign(LEFT, BASELINE);
  }

  constrainBox();
}

function drawBody(body) {
  if (body.render.visible !== false) {
    fill(body.render.fillStyle || '#ff0000');
    rectMode(CENTER);
    rect(body.position.x, body.position.y,
         body.bounds.max.x - body.bounds.min.x,
         body.bounds.max.y - body.bounds.min.y);
  }
}

function mousePressed() {
  if (gameWon) return;

  let d = dist(mouseX, mouseY, box.position.x, box.position.y);
  if (d < 30) {
    isDragging = true;
    dragStart = createVector(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (isDragging && !gameWon) {
    dragEnd = createVector(mouseX, mouseY);
    let forceVec = p5.Vector.sub(dragStart, dragEnd);
    forceVec.mult(0.008);
    Body.applyForce(box, box.position, { x: forceVec.x, y: forceVec.y });
    lastForceMagnitude = forceVec.mag() * 0.3;
    isDragging = false;
    dragStart = null;
    dragEnd = null;
  }
}

function constrainBox() {
  if (box.position.x < 40) {
    Body.setPosition(box, { x: 40, y: box.position.y });
  }
  if (box.position.x > width - 40) {
    Body.setPosition(box, { x: width - 40, y: box.position.y });
  }
  if (box.position.y < 40) {
    Body.setPosition(box, { x: box.position.x, y: 40 });
  }
  if (box.position.y > height - 40) {
    Body.setPosition(box, { x: box.position.x, y: height - 40 });
  }
}
