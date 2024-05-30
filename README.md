# 9103-major-project

This is my final individual work introduction.

## Part 1: Instructions on how to interact with the work

My interactive artwork creates a dynamic and visually engaging experience by utilizing the Berlin noise function to animate various circles and patterns. The code generates a grid of circles with different styles and colors, creating a vibrant display that continuously evolves over time. By applying Perlin noise, each frame introduces subtle changes in the positions and properties of the circles, making the artwork come alive with fluid and organic motion.

## Part 2: Details of your individual approach to animating the group code

- **2.1 I choose Perlin noise to drive my individual code**

- **2.2 Which properties of the image will be animated and how**

  - *Circle Positions:* The AnimatedCircle class uses Perlin noise to slightly alter the x and y coordinates of each circle in every frame, creating a gentle and natural-looking movement.

  - *Color Transitions:* The colors of the circles are randomly generated, and the transitions between colors are smooth and continuous due to the Perlin noise function.

  - *Arc Angles:* The arcs drawn through the center and other circles have start and end angles that are influenced by the noise function, giving them a fluid wave-like appearance.

  - *Red Lines:* The red lines in the special concentric circles have their spikes' positions adjusted by the noise function, making them jitter and appear more dynamic.

  - *Additional AnimatedCircle Class*: The newly added AnimatedCircle class provides additional animated elements within each circle, such as dynamic patterns and layered rings.

- **2.3 References to inspiration for animating your individual code**

![Changed flower effect1](assets/fleur0.jpg)
![Changed flower effect2](assets/fleur2.jpg)
![Code screenshot1](assets/codecut1.png)
![Code screenshot2](assets/codecut2.png)

[The final generated animation](https://blog.displate.com/optical-illusion-art/)

[The final](https://www.dreamstime.com/stock-illustration-green-blue-abstract-circle-element-optical-art-style-concentric-circle-shapes-gradient-background-mandala-calming-image78370643)


[chitang](https://www.scienceabc.com/eyeopeners/what-causes-ripples-in-water.html)

[yishujia1](https://www.researchgate.net/figure/Vera-Molnar-Hommage-a-Barbaud-Tribute-to-Barbaud-1974-Plotter-drawing-ink-on_fig1_338896073)


[yishujia2](https:https://www.mutualart.com/Artist/Casey-Reas/9FE1DB446CCAE7EA)

- **2.4 Technical explanation of how your individual code works to animate the image**

*Perlin Noise: The core technique used to animate the properties is Perlin noise, which generates smooth and continuous random values that are ideal for creating natural-looking motion.*

1. Noise Offset and Scale: The noiseOffset variable is incremented by noiseScale in each frame to create evolving noise values.

2. Smooth Movement: By mapping the noise values to the circle positions and arc angles, the movement appears smooth and cohesive.

*Circle Drawing:*

1. The draw() method in the AnimatedCircle class is where most of the animation magic happens. Each circle's position is perturbed by noise, and different drawing styles (e.g., zigzag lines, multi-layered rings) are applied based on random selection.

2. The fillDotsOnCircle, drawGoldZShape, drawMultiLayeredRings, and drawGreenLayeredRings methods are responsible for rendering specific patterns within the circles, with some parameters influenced by noise for dynamic variation.

*Arc Drawing:*

1. The drawArcThroughCenter function draws arcs with start and end points modulated by noise, adding a wave-like effect.

**Detailed Changes Made:**

*Perlin Noise Integration:* Added Perlin noise to influence the positions and angles of various elements, providing a fluid and organic motion.

*Dynamic Circle Drawing:* Enhanced the AnimatedCircle class to include different drawing styles for circles, with each style having elements that can be animated.

*Special Circle Identification:* Modified the setup to identify special circles and apply distinct animations to them, such as red line spikes with noise-induced jitter.

*Pattern and Color Variation:* Implemented methods to draw various patterns within circles, using random colors and ensuring smooth transitions.

*AnimatedCircle Class:* Introduced a new class (AnimatedCircle) to encapsulate animated elements within each circle, allowing for more complex and diverse animations. This class facilitates the creation of dynamic patterns and layered rings within circles, enhancing the visual richness of the artwork.
