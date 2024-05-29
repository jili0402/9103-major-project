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

function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas adjusted to window size
  noLoop(); // Stop draw function from looping, static display
  noStroke(); // No border when drawing circles

  // Initialize all circle information and add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  // Random starting angle
      let hasArc = random() > 0.5;  // 50% chance to decide if arc is present
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomly select style
      circles.push({
        x: x + offsetX,
        y: y + offsetY,
        d: circleDiameter,
        colors: generateColors(),
        startAngle: angle,
        hasArc: hasArc,
        styleType: styleType  // Store style type
      });
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

  // Draw all circles and other patterns
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let radii = [c.d, c.d * 0.55, c.d * 0.5, c.d * 0.25, c.d * 0.15, c.d * 0.1, c.d * 0.05]; // Sizes of the main and inner circles

    if (c.isSpecial) {
      drawSpecialCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    } else {
      drawCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    }
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
    fill(colors[i % colors.length]); // Set fill color
    ellipse(x, y, radii[i], radii[i]); // Draw circle
    if (i == 0) { // Only draw white dots between the largest and second largest circles
      fillDotsOnCircle(x, y, radii[0] / 2, radii[1] / 2); // Fill dots on entire circle
    }
    if (i == 2 && i + 1 < numRings) { // Draw according to style between the third and fourth largest circles
      if (styleType === 'goldZigzag') {
        drawGoldZShape(x, y, radii[2] / 2, radii[3] / 2);
      } else if (styleType === 'multiLayeredRings') {
        drawMultiLayeredRings(x, y, radii[2] / 2, radii[3] / 2);
      }
    }
    if (styleType === 'multiLayeredRings' && i == 3 && i + 1 < numRings) {
      drawGreenLayeredRings(x, y, radii[3] / 2, radii[4] / 2);
    }
  }
}

function drawSpecialCirclePattern(x, y, radii, colors, styleType) {
  fill(specialCircleColor); // Set largest circle to special color
  ellipse(x, y, radii[0], radii[0]); // Draw largest circle

  // Draw other circles, skip white small dots
  for (let i = 1; i < radii.length; i++) {
    fill(colors[i % colors.length]);
    ellipse(x, y, radii[i], radii[i]);
  }

  if (styleType === 'goldZigzag') {
    drawGoldZShape(x, y, radii[2] / 2, radii[3] / 2);
  } else if (styleType === 'multiLayeredRings') {
    drawMultiLayeredRings(x, y, radii[2] / 2, radii[3] / 2);
  }
}

function drawRedLinesInSpecialCircles() {
  let specialCircles = circles.filter(c => c.isSpecial);
  for (let i = 0; i < specialCircles.length; i++) {
    let c = specialCircles[i];
    drawRedLine(c.x, c.y, c.d / 2, c.d * 0.55 / 2);
  }
}

function drawRedLine(cx, cy, outerRadius, innerRadius) {
  push();
  stroke(255, 0, 0); // Red color
  strokeWeight(redLineStrokeWeight); // Set line width
  noFill(); // No fill

  let numSpikes = redLineSpikes; // Number of spikes
  let angleStep = TWO_PI / numSpikes; // Angle between each spike

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate outer point position (between the largest and second largest circles)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius;
    let outerY = cy + sin(angle) * outerRadius;
    vertex(outerX, outerY); // Add outer point

    // Calculate inner point position (inward to form spikes)
    let innerAngle = angle + angleStep / 2;
    let innerRadiusAdjust = innerRadius + (outerRadius - innerRadius) * 0.3;
    let innerX = cx + cos(innerAngle) * innerRadiusAdjust;
    let innerY = cy + sin(innerAngle) * innerRadiusAdjust;
    vertex(innerX, innerY); // Add inner point
  }
  endShape(CLOSE);

  pop(); // Restore previous drawing settings
}

function drawGoldZShape(cx, cy, thirdRadius, fourthRadius) {
  push();
  stroke(212, 175, 55); // Set stroke color to gold
  strokeWeight(goldLineStrokeWeight); // Set line width
  noFill(); // No fill

  let numSpikes = goldLineSpikes; // Number of spikes
  let angleStep = TWO_PI / numSpikes; // Angle between each spike

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate outer point position (outer circle of the third circle)
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * thirdRadius;
    let outerY = cy + sin(angle) * thirdRadius;
    vertex(outerX, outerY); // Add outer point

    // Calculate inner point position (inner circle of the fourth circle), but slightly inward to form spikes
    let innerAngle = angle + angleStep / 2;
    let innerRadiusAdjust = fourthRadius + (thirdRadius - fourthRadius) * 0.3; // Adjust inner radius to avoid overly sharp spikes
    let innerX = cx + cos(innerAngle) * innerRadiusAdjust;
    let innerY = cy + sin(innerAngle) * innerRadiusAdjust;
    vertex(innerX, innerY); // Add inner point
  }
  endShape(CLOSE);

  pop(); // Restore previous drawing settings
}

function drawMultiLayeredRings(cx, cy, thirdRadius, fourthRadius) {
  push();
  let colors = [
    color(255, 0, 121),  // Pink
    color(0, 179, 255)    // Blue
  ];
  strokeWeight(3);
  noFill();
  let numRings = 5; // Number of rings
  let radiusStep = (thirdRadius - fourthRadius) / numRings; // Radius step

  for (let j = 0; j < numRings; j++) {
    stroke(colors[j % colors.length]); // Set stroke color
    ellipse(cx, cy, thirdRadius * 2 - j * radiusStep, thirdRadius * 2 - j * radiusStep);
  }

  pop(); // Restore previous drawing settings
}

function drawGreenLayeredRings(cx, cy, fourthRadius, fifthRadius) {
  push();
  let colors = [
    color(68, 106, 55),  // Dark Green
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

  pop(); // Restore previous drawing settings
}

function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  fill(255); // Set fill color to white
  let numCircles = 6; // Draw 6 circles in total
  let dotSize = 3.5; // Diameter of circles, adjustable
  let radiusStep = (outerRadius - innerRadius) / numCircles; // Calculate distance between circles

  for (let j = 0; j < numCircles; j++) {
    let currentRadius = innerRadius + j * radiusStep + radiusStep / 2; // Current radius
    let numDots = Math.floor(TWO_PI * currentRadius / (dotSize * 3)); // Calculate number of circles that can be placed on the current radius
    let angleStep = TWO_PI / numDots; // Angle between each circle
    for (let i = 0; i < numDots; i++) {
      let angle = i * angleStep;
      let x = cx + cos(angle) * currentRadius;
      let y = cy + sin(angle) * currentRadius;
      ellipse(x, y, dotSize, dotSize); // Draw circle
    }
  }
}

function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let arcRadius = c.d / 2 + 15; // Radius of the arc, adjustable
    stroke(255, 165, 0); // Orange color
    strokeWeight(2.5);
    noFill();
    ellipse(c.x, c.y, arcRadius * 2, arcRadius * 2); // Draw complete circle
  }
}

function drawPatternOnRing(cx, cy
  , radius) {
  let numPatterns = 8; // Number of patterns, reducing density
  let angleStep = TWO_PI / numPatterns; // Angle between each pattern

  for (let i = 0; i < numPatterns; i++) {
    let angle = i * angleStep;
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
  push();
  let baseColor = color(255, 20, 147); // Original pink color
  let shadowColor = lerpColor(baseColor, color(0), 0.25); // Generate darker pink shadow

  strokeWeight(6); // Set line width
  noFill(); // No fill

  // Calculate start and end points of the arc based on startAngle
  let endX = x + cos(startAngle - PI / 4) * radius * 1.5;
  let endY = y + sin(startAngle - PI / 4) * radius * 1.5;

  // Draw shadow
  stroke(shadowColor); // Use darker pink as shadow color
  drawCurvedLine(x, y + 3, endX, endY + 3);

  // Draw main arc
  stroke(baseColor); // Use original pink
  drawCurvedLine(x, y, endX, endY);

  pop(); // Restore previous drawing settings
}

function drawCurvedLine(x1, y1, x2, y2) {
  // Calculate control points to make the curve arc-shaped
  let cx1 = (x1 + x2) / 2 + (y2 - y1) * 0.5;
  let cy1 = (y1 + y2) / 2 - (x2 - x1) * 0.5;

  // Use quadratic bezier curve to draw the arc
  noFill();
  beginShape();
  vertex(x1, y1);
  quadraticVertex(cx1, cy1, x2, y2);
  endShape();
}

function generateColors() {
  // Generate random color array to assign colors to each circle
  return [
    [random(255), random(255), random(255)],
    [random(255), random(255, 255)],
    [random(255), random(255, 255)]
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = [];
  setup(); // Regenerate circles
  redraw();
}
