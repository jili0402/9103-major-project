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
  noLoop(); // Stop draw function from looping, static display
  noStroke(); // No border when drawing circles

  // Initialize all circle information and add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI); // Random starting angle
      let hasArc = random() > 0.5; // 50% chance to decide if arc is present
      let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomly select style
      circles.push({
        x: x + offsetX,
        y: y + offsetY,
        d: circleDiameter,
        colors: generateColors(),
        startAngle: angle,
        hasArc: hasArc,
        styleType: styleType // Store style type
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

  let noiseValue = noise(noiseOffset) * TWO_PI;
  noiseOffset += noiseScale;
  drawArcThroughCenter(width / 2, height / 2, 200, noiseValue); // Draw the arc at the center of the canvas

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
    if (c.hasArc) { // Check if arc needs to be drawn
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
  stroke(255, 0, 0); // Red color
  strokeWeight(redLineStrokeWeight); // Set line width
  noFill(); // No fill

  let numSpikes = redLineSpikes; // Number of spikes
  let angleStep = TWO_PI / numSpikes; // Angle between each spike

  beginShape();
  for (let i = 0; i < numSpikes; i++) {
    // Calculate outer point position (between the largest and second largest circles)
    let angle = i * angleStep;
    // Add Perlin noise to the position of the outer points
    let noiseOuterX = cx + cos(angle) * outerRadius + map(noise(frameCount / 100 + i), 0, 1, -5, 5);
    let noiseOuterY = cy + sin(angle) * outerRadius + map(noise(frameCount / 100 + i + 1000), 0, 1, -5, 5);
    vertex(noiseOuterX, noiseOuterY); // Add outer point

    // Calculate inner point position (inward to form spikes)
    let innerAngle = angle + angleStep / 2;
    let innerRadiusAdjust = innerRadius + (outerRadius - innerRadius) * 0.3;
    // Add Perlin noise to the position of the inner points
    let noiseInnerX = cx + cos(innerAngle) * innerRadiusAdjust + map(noise(frameCount / 100 + i + 2000), 0, 1, -5, 5);
    let noiseInnerY = cy + sin(innerAngle) * innerRadiusAdjust + map(noise(frameCount / 100 + i + 3000), 0, 1, -5, 5);
    vertex(noiseInnerX, noiseInnerY); // Add inner point
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

  pop(); // Restore previous drawing settings
}

function drawGreenLayeredRings(cx, cy, fourthRadius, fifthRadius) {
  push();
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

  pop(); // Restore previous drawing settings
}

function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  let numCircles = 6; // Draw 6 circles in total
  let dotSize = 3.5; // Diameter of circles, adjustable
  let radiusStep = (outerRadius - innerRadius) / numCircles; // Calculate distance between circles

  for (let j = 0; j < numCircles; j++) {
    let currentRadius = innerRadius + j * radiusStep + radiusStep / 2; // Current radius
    let numDots = Math.floor(TWO_PI * currentRadius / (dotSize * 3)); // Calculate number of circles that can be placed on the current radius
    let angleStep = TWO_PI / numDots; // Angle between each circle
    for (let i = 0; i < numDots; i++) {
      let angle = i * angleStep; // Calculate angle
      let x = cx + cos(angle) * currentRadius; // Calculate x coordinate
      let y = cy + sin(angle) * currentRadius; // Calculate y coordinate
      ellipse(x, y, dotSize, dotSize); // Draw circle
    }
  }
}

function drawArcThroughCenter(cx, cy, radius, angle) {
  let startAngle = angle - PI / 4; // Starting angle
  let endAngle = angle + PI / 4; // Ending angle
  let arcStep = TWO_PI / 50; // Angle step
  let arcRadius = radius * 1.5; // Arc radius
  let arcWidth = 10; // Arc width
  let noiseRadius = radius + 5; // Noise radius

  noFill(); // No fill
  strokeWeight(3); // Set stroke weight
  stroke(255, 192, 203); // Set stroke color to pink

  beginShape();
  for (let a = startAngle; a < endAngle; a += arcStep) {
    let xoff = map(cos(a), -1, 1, 0, noiseRadius); // Map x coordinate of Perlin noise
    let yoff = map(sin(a), -1, 1, 0, noiseRadius); // Map y coordinate of Perlin noise
    let r = map(noise(xoff, yoff, noiseOffset), 0, 1, arcRadius - arcWidth / 2, arcRadius + arcWidth / 2); // Map noise to radius
    let x = cx + r * cos(a); // Calculate x coordinate
    let y = cy + r * sin(a); // Calculate y coordinate
    vertex(x, y); // Add vertex to shape
  }
  endShape(CLOSE);

  noiseOffset += 0.01; // Increase noise offset for animation
}

function generateColors() {
  // Use Perlin noise to generate random RGB colors
  let noiseR = noise(random(1000));
  let noiseG = noise(random(2000));
  let noiseB = noise(random(3000));
  return [
    color(255 * noiseR, 255 * noiseG, 255 * noiseB), // Main circle color
    color(255 * noiseG, 255 * noiseB, 255 * noiseR), // Secondary circle color
    color(255 * noiseB, 255 * noiseR, 255 * noiseG), // Tertiary circle color
    color(255 * noiseR, 255 * noiseG, 255 * noiseB), // Fourth circle color
    color(255 * noiseG, 255 * noiseB, 255 * noiseR), // Fifth circle color
    color(255 * noiseB, 255 * noiseR, 255 * noiseG), // Sixth circle color
    color(255 * noiseR, 255 * noiseG, 255 * noiseB) // Seventh circle color
  ];
}

function drawOrangeCircles(circles) {
  // Draw orange circles on the outer boundary
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    stroke(255, 165, 0); // Orange color
    strokeWeight(1); // Set stroke weight
    noFill(); // No fill
    ellipse(c.x, c.y, c.d + 40, c.d + 40); // Draw orange circles
  }
}

function drawPatternOnRing(cx, cy, radius) {
  let numDots = 20; // Number of dots
  let dotSize = 3; // Dot size
  let angleStep = TWO_PI / numDots; // Angle step

  // Draw dots in a circle
  for (let i = 0; i < numDots; i++) {
    let angle = i * angleStep; // Calculate angle
    let x = cx + cos(angle) * radius; // Calculate x coordinate
    let y = cy + sin(angle) * radius; // Calculate y coordinate
    fill(255); // White fill color
    noStroke(); // No stroke
    ellipse(x, y, dotSize, dotSize); // Draw dot
  }
}




