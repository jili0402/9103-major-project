// Class for generating Perlin noise
class NoiseGenerator {
  constructor(seed) {
    this.seed = seed;
    this.offsetX = random(1000);
    this.offsetY = random(1000);
  }

  // Generate Perlin noise value based on given x, y coordinates
  generateNoise(x, y) {
    noiseSeed(this.seed);
    return noise(x + this.offsetX, y + this.offsetY);
  }
}

let circles = [];
let noiseGenerator; // Declare global noise generator object

// Constants for circle properties
let circleDiameter = 180; // Diameter of main circle
let spacing = 35; // Spacing between circles
let offsetX = -10; // Offset for all circles to the left
let offsetY = -20; // Offset for all circles upward

function setup() {
  createCanvas(windowWidth, windowHeight); // Create canvas adjusting to window size
  noLoop(); // Stop continuous execution of draw function, freeze frame
  noStroke(); // Don't show borders when drawing circles

  // Initialize noise generator with a random seed
  noiseGenerator = new NoiseGenerator(floor(random(1000)));

  // Initialize all circle information and add to circles array
  let y = circleDiameter / 2;
  while (y < height + circleDiameter) {
    let x = circleDiameter / 2;
    while (x < width + circleDiameter) {
      let angle = random(TWO_PI);  // Random starting angle
      let hasArc = random() > 0.5;  // 50% chance of having an arc
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

  // Randomly select two concentric circle groups
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

  // Update noise generator offsets for animation
  noiseGenerator.offsetX += 0.01;
  noiseGenerator.offsetY += 0.01;

  // Update and draw all elements with Perlin noise
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    // Update circle position using Perlin noise
    c.x = noiseGenerator.generateNoise(c.x, c.y) * width;
    c.y = noiseGenerator.generateNoise(c.y, c.x) * height;

    let radii = [c.d, c.d * 0.55, c.d * 0.5, c.d * 0.25, c.d * 0.15, c.d * 0.1, c.d * 0.05]; // Sizes of main circle and inner circles

    if (c.isSpecial) {
      drawSpecialCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    } else {
      drawCirclePattern(c.x, c.y, radii, c.colors, c.styleType);
    }
  }

  // Draw orange circles
  drawOrangeCircles(circles);

  // Draw patterns on orange circles
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    drawPatternOnRing(c.x, c.y, c.d / 2 + 15);
  }

  // Finally, draw pink arcs to ensure they are on top
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    if (c.hasArc) {  // Check if arc needs to be drawn
      drawArcThroughCenter(c.x, c.y, c.d / 2, c.startAngle);
    }
  }

  // Draw red lines in two groups of concentric circles
  drawRedLinesInSpecialCircles();
}

function drawCirclePattern(x, y, radii, colors, styleType) {
  let numRings = radii.length; // Number of concentric circles
  for (let i = 0; i < numRings; i++) {
    fill(colors[i % colors.length]); // Set fill color
    ellipse(x, y, radii[i], radii[i]); // Draw circle
    if (i == 0) { // Draw white dots only between the largest circle and the second largest circle
      fillDotsOnCircle(x, y, radii[0] / 2, radii[1] / 2); // Fill dots around the entire circle
    }
    if (i == 2 && i + 1 < numRings) { // Draw according to style between the third largest and fourth largest circles
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

  // Draw other circles, skipping drawing white dots
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
    strokeWeight(redLineStrokeWeight); // Set line weight
    noFill(); // No fill
  
    let numSpikes = redLineSpikes; // Number of spikes
    let angleStep = TWO_PI / numSpikes; // Angle between each spike
  
    beginShape();
    for (let i = 0; i < numSpikes; i++) {
      // Calculate position of outer points (between the largest circle and the second largest circle)
      let angle = i * angleStep;
      let outerX = cx + cos(angle) * outerRadius;
      let outerY = cy + sin(angle) * outerRadius;
      vertex(outerX, outerY); // Add outer point
  
      // Calculate position of inner points (inset to form spikes)
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
    stroke(212, 175, 55); // Set color to gold
    strokeWeight(goldLineStrokeWeight); // Set line weight
    noFill(); // No fill
  
    let numSpikes = goldLineSpikes; // Number of spikes
    let angleStep = TWO_PI / numSpikes; // Angle between each spike
  
    beginShape();
    for (let i = 0; i < numSpikes; i++) {
      // Calculate position of outer points (on the outer edge of the third circle)
      let angle = i * angleStep;
      let outerX = cx + cos(angle) * thirdRadius;
      let outerY = cy + sin(angle) * thirdRadius;
      vertex(outerX, outerY); // Add outer point
  
      // Calculate position of inner points (on the inner edge of the fourth circle), but slightly inset to form spikes
      let innerAngle = angle + angleStep / 2;
      let innerRadiusAdjust = fourthRadius + (thirdRadius - fourthRadius) * 0.3; // Adjust inner radius to avoid very sharp spikes
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
      color(68, 106, 55),  // Dark green
      color(168, 191, 143) // Light green
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
    let numCircles = 6; // Draw a total of 6 circles
    let dotSize = 3.5; // Diameter of dots, can be adjusted
    let radiusStep = (outerRadius - innerRadius) / numCircles; // Calculate distance between circles
  
    for (let j = 0; j < numCircles; j++) {
      let currentRadius = innerRadius + j * radiusStep + radiusStep / 2; // Current radius
      let numDots = Math.floor(TWO_PI * currentRadius / (dotSize * 3)); // Calculate number of dots that can be placed on current radius
      let angleStep = TWO_PI / numDots; // Angle between each dot
      for (let i = 0; i < numDots; i++) {
        let angle = i * angleStep;
        let x = cx + cos(angle) * currentRadius;
        let y = cy + sin(angle) * currentRadius;
        ellipse(x, y, dotSize, dotSize); // Draw dot
      }
    }
  }
  
  function drawOrangeCircles(circles) {
    for (let i = 0; i < circles.length; i++) {
      let c = circles[i];
      let arcRadius = c.d / 2 + 15; // Radius of arc, can be adjusted as needed
      stroke(255, 165, 0); // Orange color
      strokeWeight(2.5);
      noFill(); // No fill
      let numArcs = 6; // Number of arcs to draw
      let angleStep = TWO_PI / numArcs; // Angle step between each arc
  
      for (let j = 0; j < numArcs; j++) {
        let startAngle = j * angleStep; // Starting angle of arc
        drawArcThroughCenter(c.x, c.y, arcRadius, startAngle); // Draw arc
      }
    }
  }
  
  function drawArcThroughCenter(cx, cy, radius, startAngle) {
    let endAngle = startAngle + PI / 2; // End angle of arc (90 degrees)
    let diameter = radius * 2; // Diameter of arc
    arc(cx, cy, diameter, diameter, startAngle, endAngle); // Draw arc
  }
  
  // Function to generate random colors for circles
  function generateColors() {
    let colors = [];
    for (let i = 0; i < 3; i++) {
      colors.push(color(random(255), random(255), random(255)));
    }
    return colors;
  }
  
  
