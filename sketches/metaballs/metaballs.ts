import { IPointTuple, loop, createCanvas } from './utils';
import * as Vec from './Vector';
import { IVector } from './Vector';

interface IMetaball {
  position: IVector;
  velocity: IVector;
  radius: number;
}

const createMetaball = (x: number, y: number, vx: number, vy: number, radius: number): IMetaball => ({
  position: { x, y },
  velocity: { x: vx, y: vy },
  radius,
});

const updateMetaball = (metaball: IMetaball, width: number, height: number): IMetaball => {
  const newPosition = Vec.add(metaball.position, metaball.velocity);
  const newVelocity = { ...metaball.velocity };

  if (newPosition.x - metaball.radius < 0 || newPosition.x + metaball.radius > width) {
    newVelocity.x = -newVelocity.x;
  }

  if (newPosition.y - metaball.radius < 0 || newPosition.y + metaball.radius > height) {
    newVelocity.y = -newVelocity.y;
  }

  return {
    position: Vec.add(metaball.position, newVelocity),
    velocity: newVelocity,
    radius: metaball.radius,
  };
};

const calculateMetaballField = (x: number, y: number, metaballs: IMetaball[], threshold: number): boolean => {
  const sum = metaballs.reduce((acc, ball) => {
    const dx = x - ball.position.x;
    const dy = y - ball.position.y;
    const distanceSquared = dx * dx + dy * dy;

    return acc + (ball.radius * ball.radius) / distanceSquared;
  }, 0);

  return sum > threshold;
};

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) return;

  const width = canvas.width;
  const height = canvas.height;

  // Create metaballs
  const metaballs: IMetaball[] = [];
  const metaballCount = 5;
  const threshold = 1.0;

  for (let i = 0; i < metaballCount; i++) {
    const radius = 30 + Math.random() * 20;
    const x = radius + Math.random() * (width - 2 * radius);
    const y = radius + Math.random() * (height - 2 * radius);
    const vx = (Math.random() * 2 - 1) * 2;
    const vy = (Math.random() * 2 - 1) * 2;

    metaballs.push(createMetaball(x, y, vx, vy, radius));
  }

  // Create an offscreen canvas for the metaball field
  const offscreenContext = createCanvas(width, height);

  if (!offscreenContext) return;

  loop(context, render(metaballs, offscreenContext, threshold, width, height), 60);
};

const render =
  (
    metaballs: IMetaball[],
    offscreenContext: CanvasRenderingContext2D,
    threshold: number,
    width: number,
    height: number
  ) =>
  (context: CanvasRenderingContext2D, t: number) => {
    // Update metaballs
    for (let i = 0; i < metaballs.length; i++) {
      metaballs[i] = updateMetaball(metaballs[i], width, height);
    }

    // Clear the offscreen canvas
    offscreenContext.clearRect(0, 0, width, height);

    // Draw metaball field to offscreen canvas
    const imageData = offscreenContext.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Sample the metaball field at each pixel
    const resolution = 1; // Increase for better performance, decrease for better quality

    for (let y = 0; y < height; y += resolution) {
      for (let x = 0; x < width; x += resolution) {
        const index = (y * width + x) * 4;
        const isInside = calculateMetaballField(x, y, metaballs, threshold);

        if (isInside) {
          // Inside the metaball field - use a blue color
          data[index] = 0; // R
          data[index + 1] = 120; // G
          data[index + 2] = 255; // B
          data[index + 3] = 255; // A

          // Fill the resolution square if resolution > 1
          if (resolution > 1) {
            for (let ry = 0; ry < resolution && y + ry < height; ry++) {
              for (let rx = 0; rx < resolution && x + rx < width; rx++) {
                const fillIndex = ((y + ry) * width + (x + rx)) * 4;
                data[fillIndex] = 0; // R
                data[fillIndex + 1] = 120; // G
                data[fillIndex + 2] = 255; // B
                data[fillIndex + 3] = 255; // A
              }
            }
          }
        }
      }
    }

    offscreenContext.putImageData(imageData, 0, 0);

    // Draw to main canvas
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.drawImage(offscreenContext.canvas, 0, 0);

    // Debug: draw metaball centers
    if (false) {
      // Set to true to see metaball centers
      metaballs.forEach((ball) => {
        context.beginPath();
        context.arc(ball.position.x, ball.position.y, 5, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();
      });
    }
  };
