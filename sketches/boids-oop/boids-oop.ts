import { Boid } from './Boid';
import { Vector } from './Vector';
import { getCanvas, getCanvasContext, loop, handleEdges } from './boids-oop.utils';

export const INITIAL_SPEED = 100;
export const FPS = 60;
export const DELTA_TIME = 1 / FPS;
export const BOID_COUNT = 400;
export const BACKGROUND_COLOR = '#f5f5f5';
export const BOID_COLOR = '#333';

interface ISketchData {
  boids: Boid[];
}

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;

  const boids: Boid[] = [];

  for (let i = 0; i < BOID_COUNT; i++) {
    const position = Vector.create(Math.random() * width, Math.random() * height);

    const initialAngle = Math.random() * Math.PI * 2;
    const velocity = Vector.fromAngle(initialAngle).multiply(INITIAL_SPEED);

    boids.push(
      Boid.create({
        position,
        velocity,
        maxSpeed: 3 + Math.random() * 2,
        maxForce: 0.05 + Math.random() * 0.05,
        size: 4 + Math.random() * 4,
        color: BOID_COLOR,
      })
    );
  }

  loop(render(context, { boids }), FPS);
};

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  const { boids } = data;

  // Clear canvas
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);

  // Update and draw boids
  for (const boid of boids) {
    // Apply flocking behaviors
    boid.applyBehaviors(boids, DELTA_TIME);

    // Apply edge forces
    boid.applyForce({
      force: handleEdges(boid, width, height),
      deltaTime: DELTA_TIME,
    });

    // Draw boid
    boid.draw(context);
  }
};
