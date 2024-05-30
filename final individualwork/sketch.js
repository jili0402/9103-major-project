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

function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas adjusted to window size
  frameRate(30); // Set frame rate to control animation speed

  // Initialize all circle information and add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI); // Random starting angle
      let hasArc = random() > 0.5; // 50% chance to decide if arc is present
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomly select style
      circles.push(new AnimatedCircle(x + offsetX, y + offsetY, circleDiameter, generateColors(), angle, hasArc, styleType));
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

  let noiseValue = noise(noiseOffset) * TWO_PI;// Calculate noise value for wave effect
  noiseOffset += noiseScale;
  drawArcThroughCenter(width / 2, height / 2, 200, noiseValue); // Draw the arc at the center of the canvas

  // Draw all circles and other patterns
  for (let i = 0; i < circles.length; i++) {
    circles[i].draw(); // Draw each circle
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
    if (c.hasArc) { // Check if arc needs to be drawn
      drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
    }
  }

  // Draw red lines in the two sets of special concentric circles
  drawRedLinesInSpecialCircles();
}

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

  draw() {
    let radii = [this.d, this.d * 0.55, this.d * 0.5, this.d * 0.25, this.d * 0.15, this.d * 0.1, this.d * 0.05]; // Sizes of the main and inner circles
    for (let i = 0; i < radii.length; i++) {
      let noiseX = this.x + map(noise(frameCount / 100 + i), 0, 1, -5, 5);
      let noiseY = this.y + map(noise(frameCount / 100 + i + 1000), 0, 1, -5, 5);

      fill(this.colors[i % this.colors.length]); // Set fill color
      ellipse(noiseX, noiseY, radii[i], radii[i]); // Draw circle
      if (i == 0) { // Only draw white dots between the largest and second largest circles
        this.fillDotsOnCircle(noiseX, noiseY, radii[0] / 2, radii[1] / 2); // Fill dots on entire circle
      }
      if (i == 2 && i + 1 < radii.length) { // Draw according to style between the third and fourth largest circles
        if (this.styleType === 'goldZigzag') {
          this.drawGoldZShape(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
        } else if (this.styleType === 'multiLayeredRings') {
          this.drawMultiLayeredRings(noiseX, noiseY, radii[2] / 2, radii[3] / 2);
        }
      }
      if (this.styleType === 'multiLayeredRings' && i == 3 && i + 1 < radii.length) {
        this.drawGreenLayeredRings(noiseX, noiseY, radii[3] / 2, radii[4] / 2);
      }
    }
  }

  fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
    fill(255); // Set fill color to white
    let numCircles = 6; // Draw 6 circles in total
    let dotSize = 3.5; // Diameter of circles, adjustable
    let radiusStep = (outerRadius - innerRadius) / numCircles; // Calculate distance between circles

    for (let j = 0; j < numCircles; j++) {
      let currentRadius = innerRadius + j * radiusStep + radiusStep / 2; // Current radius
      let numDots = Math.floor(TWO_PI * currentRadius / (dotSize * 3)); // Calculate
      let angleStep = TWO_PI / numDots; // Angle between each circle
      for (let i = 0; i < numDots; i++) {
        let angle = i * angleStep;
        let x = cx + cos(angle) * currentRadius;
        let y = cy + sin(angle) * currentRadius;
        ellipse(x, y, dotSize, dotSize); // Draw circle
      }
    }
  }

  drawGoldZShape(cx, cy, thirdRadius, fourthRadius) {
    let numSpikes = goldLineSpikes; // Number of spikes
    let angleStep = TWO_PI / numSpikes; // Angle between each spike

    for (let i = 0; i < numSpikes; i++) {
      let angle = i * angleStep;
      let outerX = cx + cos(angle) * thirdRadius;
      let outerY = cy + sin(angle) * thirdRadius;
      vertex(outerX, outerY); // Add outer point

      let innerAngle = angle + angleStep / 2;
      let innerRadiusAdjust = fourthRadius + (thirdRadius - fourthRadius) * 0.3; // Adjust inner radius to avoid overly sharp spikes
      let innerX = cx + cos(innerAngle) * innerRadiusAdjust;
      let innerY = cy + sin(innerAngle) * innerRadiusAdjust;
      vertex(innerX, innerY); // Add inner point
    }
  }

  drawMultiLayeredRings(cx, cy, thirdRadius, fourthRadius) {
    let colors = [
      color(255, 0, 121), // Pink
      color(0, 179, 255) // Blue
    ];
    strokeWeight(3);
    noFill();
    let numRings = 5; // Number of rings
    let radiusStep = (thirdRadius - fourthRadius) / numRings; // Radius step

    for (let j = 0; j < numRings; j++) {
      stroke(colors[j % colors.length]); // Set stroke color
      ellipse(cx, cy, thirdRadius * 2 - j * radiusStep, thirdRadius * 2 - j * radiusStep);
    }
  }

  drawGreenLayeredRings(cx, cy, fourthRadius, fifthRadius) {
    let colors = [
      color(68, 106, 55), // Dark Green
      color(168, 191, 143) // Light Green
    ];
    strokeWeight(3);
    noFill();
    let numRings = 4; // Number of rings
    let radiusStep = (fourthRadius - fifthRadius) / numRings; // Radius step

    for (let j = 0; j < numRings; j++) {
      stroke(colors[j % colors.length]); // Set stroke color
      ellipse(cx, cy, fourthRadius * 2 - j * radiusStep, fourthRadius * 2 - j * radiusStep);
    }
  }
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let noiseValue = noise(noiseOffset) * 100;
    noiseOffset += noiseScale;
    let arcRadius = (c.d / 2 + 15) + noiseValue; // Radius of the arc, adjustable
    stroke(255, 165, 0); // Orange color
    strokeWeight(2.5);
    noFill();
    ellipse(c.x, c.y, arcRadius * 2, arcRadius * 2); // Draw complete circle
  }
}

function drawPatternOnRing(cx, cy, radius) {
  let numPatterns = 8; // Number of patterns, reducing density
  let angleStep = TWO_PI / numPatterns; // Angle between each pattern

  for (let i = 0; i < numPatterns; i++) {
    let angle = i * angleStep + noise(noiseOffset) * TWO_PI;
    noiseOffset += noiseScale;
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    // Draw red circle
    fill(200, 0, 0);
    ellipse(x, y, 10, 10);
    // Draw yellow circle
    let angleOffset = angleStep / 3;
    let xOffset = cx + cos(angle + angleOffset) * radius;
    let yOffset = cy + sin(angle + angleOffset) * radius;
    fill(255, 255, 0);
    ellipse(xOffset, yOffset, 6, 6);
    // Draw black ring
    let angleOffset2 = angleStep / 3 * 2;
    let xOffset2 = cx + cos(angle + angleOffset2) * radius;
    let yOffset2 = cy + sin(angle + angleOffset2) * radius;
    fill(0);
    ellipse(xOffset2, yOffset2, 21, 21);
    fill(255);
    ellipse(xOffset2, yOffset2, 7, 7);
  }
}

function drawArcThroughCenter(x, y, radius, startAngle) {
  let baseColor = color(255, 20, 147); // Original pink color
  let shadowColor = lerpColor(baseColor, color(0), 0.25); // Generate darker pink shadow

  strokeWeight(6); // Set line width
  noFill(); // No fill

  // Calculate start and end points of the arc based on startAngle
  let startX = x + cos(startAngle - PI / 4 + noise(noiseOffset) * TWO_PI) * radius * 1.5;
  let startY = y + sin(startAngle - PI / 4 + noise(noiseOffset) * TWO_PI) * radius * 1.5;
  let endX = x + cos(startAngle + PI / 4 + noise(noiseOffset) * TWO_PI) * radius * 1.5;
  let endY = y + sin(startAngle + PI / 4 + noise(noiseOffset) * TWO_PI) * radius * 1.5;
  noiseOffset += noiseScale;

  stroke(baseColor); // Set stroke color to pink
  arc(x, y, radius * 3, radius * 3, atan2(startY - y, startX - x), atan2(endY - y, endX - x)); // Draw main arc

  stroke(shadowColor); // Set stroke color to pink shadow
  arc(x, y, radius * 3, radius * 3, atan2(startY - y, startX - x) + PI / 64, atan2(endY - y, endX - x) + PI / 64); // Draw shadow arc
}

function generateColors() {
  let numColors = floor(random(2, 5)); // Random number of colors between 2 and 4
  let colors = [];
  for (let i = 0; i < numColors; i++) {
    colors.push(color(random(255), random(255), random(255))); // Add random colors to the array
  }
  return colors;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawRedLinesInSpecialCircles() {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (c.isSpecial) { // Check if the circle is special
      strokeWeight(redLineStrokeWeight); // Set stroke weight
      stroke(255, 0, 0); // Set stroke color to red
      let noiseValue = noise(noiseOffset) * 20; // Adjust noise value for variation
      noiseOffset += noiseScale;
      let x1 = c.x + noiseValue;
      let y1 = c.y + noiseValue;
      let x2 = x1 + random(-10, 10);
      let y2 = y1 + random(-10, 10);
      for (let j = 0; j < redLineSpikes; j++) { // Draw spikes
        let angle = map(j, 0, redLineSpikes, 0, TWO_PI);
        let spikeLength = random(20, 50); // Vary spike length
        let spikeX = x2 + cos(angle) * spikeLength;
        let spikeY = y2 + sin(angle) * spikeLength;
        line(x2, y2, spikeX, spikeY); // Draw spike
      }
    }
  }
}








