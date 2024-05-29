let circles = [];
let circleDiameter = 180; // Diameter of the main circle, adjustable
let spacing = 35; // Spacing between circles, adjustable
let offsetX = -10; // Offset to move all circles to the left, adjustable
let offsetY = -20; // Offset to move all circles upward, adjustable

let specialCircleColor = [255, 255, 0]; // Color of the special circle, default yellow
let redLineStrokeWeight = 0.8; // Width of the red line, default 3
let redLineSpikes = 130; // Number of spikes in the red line, default 16
let goldLineStrokeWeight = 3; // Width of the gold line, default 3
let goldLineSpikes = 16; // Number of spikes in the gold line, default 16

let noiseOffset = 0.0;
let noiseScale = 0.1; // Noise scale for the wave effect

class AnimatedCircle {
  constructor(x, y, d, colors, startAngle, hasArc, styleType) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.colors = colors;
    this.startAngle = startAngle;
    this.hasArc = hasArc;
    this.styleType = styleType;
    this.isSpecial = false;
  }

  update() {
    this.x += map(noise(frameCount / 100 + this.x), 0, 1, -0.5, 0.5);
    this.y += map(noise(frameCount / 100 + this.y), 0, 1, -0.5, 0.5);
  }

  draw() {
    let radii = [this.d, this.d * 0.55, this.d * 0.5, this.d * 0.25, this.d * 0.15, this.d * 0.1, this.d * 0.05]; // Sizes of the main and inner circles

    if (this.isSpecial) {
      drawSpecialCirclePattern(this.x, this.y, radii, this.colors, this.styleType);
    } else {
      drawCirclePattern(this.x, this.y, radii, this.colors, this.styleType);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas adjusted to window size
  frameRate(30); // Set frame rate for smooth animation
  noStroke(); // No border when drawing circles

  // Initialize all circle information and add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  // Random starting angle
      let hasArc = random() > 0.5;  // 50% chance to decide if arc is present
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomly select style
      circles.push(new AnimatedCircle(
        x + offsetX,
        y + offsetY,
        circleDiameter,
        generateColors(),
        angle,
        hasArc,
        styleType
      ));
      x += circleDiameter + spacing;
    }
    y += circleDiameter + spacing;
  }

  // Randomly select two sets of concentric circles
  let selectedIndices = [];
  while (selectedIndices.length < 2) {
    let index = floor(random(circles.length));
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
  }

  // Update properties of these two concentric circles
  for (let i = 0; i < selectedIndices.length; i++) {
    circles[selectedIndices[i]].isSpecial = true;
  }
}

function draw() {
  background(50, 100, 150); // Set background color

  let noiseValue = noise(noiseOffset) * TWO_PI;
  noiseOffset += noiseScale;
  drawArcThroughCenter(width / 2, height / 2, 200, noiseValue); // Draw the arc at the center of the canvas

  // Update and draw all circles and other patterns
  for (let i = 0; i < circles.length; i++) {
    circles[i].update();
    circles[i].draw();
  }

  // Draw orange rings
  drawOrangeCircles(circles);

  // Draw patterns on the orange rings
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    drawPatternOnRing(c.x, c.y, c.d / 2 + 15);
  }

  // Finally, draw pink arcs, ensuring they are on top
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (c.hasArc) {  // Check if arc needs to be drawn
      drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
    }
  }

  // Draw red lines in the two sets of special concentric circles
  drawRedLinesInSpecialCircles();
}

function drawCirclePattern(x, y, radii, colors, styleType) {
  let numRings = radii.length; // Number of concentric circles
  for (let i = 0; i < numRings; i++) {
    // Add Perlin noise to the position of each circle
    let noiseX = x + map(noise(frameCount / 100 + i), 0, 1, -5, 5);
    let noiseY = y + map(noise(frameCount / 100 + i + 1000), 0, 1, -5, 5);

    fill(colors[i % colors.length]); // Set fill color
    ellipse(noiseX, noiseY, radii[i], radii[i]); // Draw circle
    if (i == 0) { // Only draw white dots between the largest and second largest circles
      fillDotsOnCircle(noiseX, noiseY, radii[0] / 2, radii[1] / 2); // Fill dots on entire circle
    }
    if (i == 2 && i + 1 < numRings) { // Draw according to style between the third and fourth largest circles
      if (styleType === 'goldZigzag') {
        drawGoldZShape(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
      } else if (styleType === 'multiLayeredRings') {
        drawMultiLayeredRings(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
      }
    }
    if (styleType === 'multiLayeredRings' && i == 3 && i + 1 < numRings) {
      drawGreenLayeredRings(noiseX, noiseY, radii[3] / 2, radii[4] / 2);
    }
  }
}

function drawSpecialCirclePattern(x, y, radii, colors, styleType) {
  // Add Perlin noise to the position of the largest circle
  let noiseX = x + map(noise(frameCount / 100), 0, 1, -5, 5);
  let noiseY = y + map(noise(frameCount / 100 + 1000), 0, 1, -5, 5);

  fill(specialCircleColor); // Set largest circle to special color
  ellipse(noiseX, noiseY, radii[0], radii[0]); // Draw largest circle

  // Draw other circles, skip white small dots
  for (let i = 1; i < radii.length; i++) {
    fill(colors[i % colors.length]);
    ellipse(noiseX, noiseY, radii[i], radii[i]);
  }

  if (styleType === 'goldZigzag') {
    drawGoldZShape(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
  } else if (styleType === 'multiLayeredRings') {
    drawMultiLayeredRings(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
  }
}

function drawRedLinesInSpecialCircles() {
  let specialCircles = circles.filter(c => c.isSpecial);
  for (let i = 0; i < specialCircles.length; i++) {
    let c = specialCircles[i];
    // Add Perlin noise to the position of the red lines
    let noiseX = c.x + map(noise(frameCount / 100 + i), 0, 1, -5, 5);
    let noiseY = c.y + map(noise(frameCount / 100 + i + 1000), 0, 1, -5, 5);
    drawRedLine(noiseX, noiseY, c.d / 2, c.d * 0.55 / 2);
  }
}

function drawRedLine(cx, cy, outerRadius, innerRadius) {
  push();
  translate(cx, cy);
  rotate(noise(frameCount / 100) * TWO_PI);
  let angleStep = TWO_PI / redLineSpikes;
  stroke(255, 0, 0);
  strokeWeight(redLineStrokeWeight);
  for (let i = 0; i < redLineSpikes; i++) {
    let angle = i * angleStep;
    let outerX = cos(angle) * outerRadius;
    let outerY = sin(angle) * outerRadius;
    let innerX = cos(angle) * innerRadius;
    let innerY = sin(angle) * innerRadius;
    line(outerX, outerY, innerX, innerY);
  }
  pop();
}

function drawArcThroughCenter(cx, cy, r, angle) {
  noFill();
  stroke(255, 0, 150); // Pink color
  strokeWeight(2);
  let startAngle = angle;
  let endAngle = startAngle + PI;
  arc(cx, cy, r * 2, r * 2, startAngle, endAngle);
}

function generateColors() {
  let colors = [
    color(235, 152, 52, 220), // Orange
    color(235, 152, 52, 180),
    color(205, 127, 50, 180),
    color(107, 170, 167, 180), // Teal
    color(227, 110, 26, 180), // Dark orange
    color(163, 102, 61, 180), // Dark brown
    color(179, 204, 106, 180), // Light green
    color(87, 133, 133, 180)  // Dark teal
  ];
  return colors;
}

function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  let angleStep = TWO_PI / 25; // Number of white dots
  for (let angle = 0; angle < TWO_PI; angle += angleStep) {
    let midRadius = (outerRadius + innerRadius) / 2;
    let midX = cx + midRadius * cos(angle);
    let midY = cy + midRadius * sin(angle);
    fill(255); // White color
    ellipse(midX, midY, 5, 5); // Draw dot
  }
}

function drawGoldZShape(cx, cy, outerRadius, innerRadius) {
  let angleStep = TWO_PI / goldLineSpikes;
  let angle = random(TWO_PI);
  for (let i = 0; i < goldLineSpikes; i++) {
    let x1 = cx + outerRadius * cos(angle);
    let y1 = cy + outerRadius * sin(angle);
    let x2 = cx + innerRadius * cos(angle + angleStep / 2);
    let y2 = cy + innerRadius * sin(angle + angleStep / 2);
    let x3 = cx + outerRadius * cos(angle + angleStep);
    let y3 = cx + outerRadius * sin(angle + angleStep);
    stroke(255, 215, 0); // Gold color
    strokeWeight(goldLineStrokeWeight);
    line(x1, y1, x2, y2);
    line(x2, y2, x3, y3);
    angle += angleStep;
  }
}

function drawMultiLayeredRings(cx, cy, outerRadius, innerRadius) {
  let layerCount = 3;
  let radiusStep = (outerRadius - innerRadius) / layerCount;
  for (let i = 0; i < layerCount; i++) {
    let currentRadius = outerRadius - i * radiusStep;
    stroke(0, 255, 0, 200 - i * 50); // Green color with decreasing opacity
    strokeWeight(2);
    noFill();
    ellipse(cx, cy, currentRadius * 2, currentRadius * 2);
  }
}

function drawGreenLayeredRings(cx, cy, outerRadius, innerRadius) {
  let angleStep = TWO_PI / goldLineSpikes;
  let radiusStep = (outerRadius - innerRadius) / 2;
  for (let i = 0; i < 2; i++) {
    let currentRadius = outerRadius - i * radiusStep;
    stroke(0, 255, 0, 200 - i * 100); // Green color with decreasing opacity
    strokeWeight(2);
    noFill();
    ellipse(cx, cy, currentRadius * 2, currentRadius * 2);
  }
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (!c.isSpecial) { // Skip special circles
      fill(235, 152, 52, 100); // Semi-transparent orange
      ellipse(c.x, c.y, c.d + spacing / 2, c.d + spacing / 2); // Draw orange ring
    }
  }
}

function drawPatternOnRing(cx, cy, radius) {
  let patternCount = 8; // Number of patterns
  let angleStep = TWO_PI / patternCount;
  let currentAngle = frameCount * 0.05; // Angle step for animation
  for (let i = 0; i < patternCount; i++) {
    let x = cx + radius * cos(currentAngle + i * angleStep);
    let y = cy + radius * sin(currentAngle + i * angleStep);
    let colorValue = map(noise(frameCount * 0.05 + i), 0, 1, 50, 255); // Varying color
    fill(colorValue, 50, 150); // Varying pink color
    ellipse(x, y, 15, 15); // Draw pattern
  }
}
