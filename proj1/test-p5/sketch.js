let cols, rows;
let spacing = 15; // distance between squares
let t = 0; // time variable
let lastHitX, lastHitY;

let pulseRadius = 0;
let pulses = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  cols = width / spacing;
  rows = height / spacing;
  lastHitX = random(width);
  lastHitY = random(height);
  
  pulses.push(createPulse(width / 2, height / 2));
}

function createPulse(x, y) {
  let maxDistance = distToFurthestCorner(x, y);
  return { x, y, radius: 0, maxDistance };
}

function distToFurthestCorner(x, y) {
  let corners = [
    createVector(0, 0),
    createVector(width, 0),
    createVector(width, height),
    createVector(0, height),
  ];
  return max(corners.map(c => dist(x, y, c.x, c.y)));
}

function draw1() {
  // centered elliptical pulsations
  background(20);

  t += map(noise(0.01), -1, 1, 0.01, 0.05);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * spacing + spacing / 2;
      let y = j * spacing + spacing / 2;

      let dx = x - width / 2;
      let dy = y - height / 2; // these set it to circular dimensions

      // normalizing for elliptical range
      dx /= width / 2;
      dy /= height / 2;
      let distFromCenter = sqrt(dx * dx + dy * dy);

      let ellipseScale = width / height;

      let falloff = 1 - (distFromCenter * ellipseScale) / 2; // 1 in center to 0 at edge (distFromCenter / maxDistance)
      falloff = constrain(falloff, 0.4, 0.7); // clamp so it never goes negative

      let modifiedDist = random(distFromCenter);

      let angle = distFromCenter * 5 - t;
      let wave = noise(angle);

      let r = map(noise(i * 0.1, j * 0.1, t), 0, 1, 100, 255);
      let g = map(noise(i * 0.1 + 100, j * 0.1, t), 0, 1, 100, 255);
      let b = map(noise(i * 0.1, j * 0.1 + 100, t), 0, 1, 100, 255);

      let pixelSize = map(wave, 0.5, 0.7, 0, spacing) * pow(falloff, 2);

      fill(r, g, b);
      ellipse(x, y, pixelSize, pixelSize);
    }
  }
}

function draw2() {
  background(20);

  t += map(noise(0.01), -1, 1, 0.01, 0.05);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * spacing + spacing / 2;
      let y = j * spacing + spacing / 2;

      let dx = x - width / 2;
      let dy = y - height / 2; // these set it to circular dimensions

      // normalizing for elliptical range
      // dx /= width / 2;
      // dy /= height / 2;
      let distFromCenter = sqrt(dx * dx + dy * dy);

      // let ellipseScale = width/height;

      let maxDistance = width / 2;

      let falloff = 1 - distFromCenter / maxDistance; // * ellipseScale / 2;  // 1 in center to 0 at edge (distFromCenter / maxDistance)
      falloff = constrain(falloff, 0.4, 0.7); // clamp so it never goes negative

      let modifiedDist = random(distFromCenter);

      let angle = distFromCenter * 5 - t;
      let wave = noise(angle);

      let r = map(noise(i * 0.1, j * 0.1, t), 0, 1, 100, 255);
      let g = map(noise(i * 0.1 + 100, j * 0.1, t), 0, 1, 100, 255);
      let b = map(noise(i * 0.1, j * 0.1 + 100, t), 0, 1, 100, 255);

      let pixelSize = map(wave, 0.5, 0.7, 0, spacing) * pow(falloff, 2);

      fill(r, g, b);
      ellipse(x, y, pixelSize, pixelSize);
    }
  }
}

function draw() {
  background(20);

  // Advance the pulse
  t += 0.02;
  pulseRadius += 2;

  // Calculate max distance to the edge from current pulse center
  let corners = [
    createVector(0, 0),
    createVector(width, 0),
    createVector(width, height),
    createVector(0, height),
  ];

  let maxDistance = 0;
  for (let corner of corners) {
    let d = dist(lastHitX, lastHitY, corner.x, corner.y);
    if (d > maxDistance) maxDistance = d;
  }

  // If pulse reaches the edge, start a new pulse
  if (pulseRadius >= maxDistance) {
    // Calculate angle of expansion to determine edge point
    let angle = random(TWO_PI);
    let newX = lastHitX + cos(angle) * maxDistance;
    let newY = lastHitY + sin(angle) * maxDistance;

    // Clamp new hit to stay within canvas
    lastHitX = constrain(newX, 0, width);
    lastHitY = constrain(newY, 0, height);

    pulseRadius = 0;
    t = 0; // reset time for wave noise
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * spacing + spacing / 2;
      let y = j * spacing + spacing / 2;

      let dx = x - lastHitX;
      let dy = y - lastHitY;
      let distFromCenter = sqrt(dx * dx + dy * dy);

      // Create a ring effect around the pulse radius
      let diff = abs(distFromCenter - pulseRadius);
      let falloff = map(diff, 0, 100, 1, 0); // stronger at the edge of pulse
      falloff = constrain(falloff, 0, 1);

      // Animate wave within pulse edge
      let wave = noise(i * 0.1, j * 0.1, t);
      let pixelSize = map(wave, 0.5, 0.7, 0, spacing) * falloff;

      // Color
      let r = map(noise(i * 0.1, j * 0.1, t), 0, 1, 100, 255);
      let g = map(noise(i * 0.1 + 100, j * 0.1, t), 0, 1, 100, 255);
      let b = map(noise(i * 0.1, j * 0.1 + 100, t), 0, 1, 100, 255);

      fill(r, g, b);
      ellipse(x, y, pixelSize, pixelSize);
    }
  }
}