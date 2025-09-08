import * as Vector from './Vector';
import * as Boid from './Boid';
import { IBoid } from './Boid';
import { IVector } from './Vector';

export type PseudoRandomNumberGenerator = () => number;

export type IPath = {
  x: number;
  y: number;
}[];

export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export const bindEvent = (selector: string, eventName: string, callback: () => void) => {
  document.querySelector(selector)?.addEventListener(eventName, callback);
};

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60, duration?: number) {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let animationId: number | null = null;
  let t = 0;

  const startTime = Date.now();

  function animate(time: number) {
    // Check if duration has been exceeded
    if (animationId && duration && Date.now() - startTime >= duration) {
      cancelAnimationFrame(animationId);
      animationId = null;

      return;
    }

    animationId = requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(context, t);
    t++;
  }

  animationId = requestAnimationFrame(animate);

  return animationId;
}

export function drawPath(context: CanvasRenderingContext2D, color: string, path: IPath) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 0.5;

  context.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    context.lineTo(path[i].x, path[i].y);
  }

  context.stroke();
}

export const createFlock = (
  boidCount: number,
  center: { x: number; y: number },
  distance: number,
  prng: PseudoRandomNumberGenerator
): IBoid[] => {
  return Array(boidCount)
    .fill(null)
    .map(() => {
      const angle = prng() * Math.PI * 2;
      const randomDistance = prng() * distance;

      const x = center.x + Math.cos(angle) * randomDistance;
      const y = center.y + Math.sin(angle) * randomDistance;

      return Boid.create({
        position: Vector.create(x, y),
        velocity: Vector.create((prng() * 2 - 1) * 2, (prng() * 2 - 1) * 2),
      });
    });
};

export const separation = (boid: IBoid, boids2: IBoid[], desiredSeparation: number): IVector => {
  let count = 0;
  let steer = Vector.create(0, 0);

  for (const other of boids2) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < desiredSeparation) {
      const diff = Vector.normalize(Vector.subtract(boid.position, other.position));

      steer = Vector.add(steer, Vector.divide(diff, d));
      count++;
    }
  }

  if (count > 0) {
    steer = Vector.divide(steer, count);
  }

  if (Vector.magnitude(steer) > 0) {
    steer = Vector.multiply(Vector.normalize(steer), boid.maxSpeed);
    steer = Vector.subtract(steer, boid.velocity);
    steer = Vector.limit(steer, boid.maxForce);
  }

  return steer;
};

export const alignment = (boid: IBoid, boids2: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids2) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < neighborDistance) {
      sum = Vector.add(sum, other.velocity);
      count++;
    }
  }

  if (count > 0) {
    sum = Vector.divide(sum, count);
    sum = Vector.normalize(sum);
    sum = Vector.multiply(sum, boid.maxSpeed);
    const steer = Vector.subtract(sum, boid.velocity);

    return Vector.limit(steer, boid.maxForce);
  }

  return sum;
};

export const cohesion = (boid: IBoid, boids2: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids2) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < neighborDistance) {
      sum = Vector.add(sum, other.position);
      count++;
    }
  }

  if (count > 0) {
    sum = Vector.divide(sum, count);
    return seek(boid, sum);
  }

  return Vector.create(0, 0);
};

export const seek = (boid: IBoid, target: IVector): IVector => {
  const desired = Vector.subtract(target, boid.position);
  const normalized = Vector.normalize(desired);
  const scaled = Vector.multiply(normalized, boid.maxSpeed);
  const steer = Vector.subtract(scaled, boid.velocity);

  return Vector.limit(steer, boid.maxForce);
};

export const flock = (
  boid: IBoid,
  boids2: IBoid[],
  params: {
    separationDist: number;
    alignDist: number;
    cohesionDist: number;
    separationWeight: number;
    alignmentWeight: number;
    cohesionWeight: number;
  },
  width: number,
  height: number
): IBoid => {
  const forces = [
    Vector.multiply(separation(boid, boids2, params.separationDist), params.separationWeight),
    Vector.multiply(alignment(boid, boids2, params.alignDist), params.alignmentWeight),
    Vector.multiply(cohesion(boid, boids2, params.cohesionDist), params.cohesionWeight),
    calculateEdgeForce(boid, width, height),
  ];

  const boidWithForces = forces.reduce((currentBoid, force) => Boid.applyForce(currentBoid, force), boid);

  return Boid.updatePosition(boidWithForces);
};

const calculateEdgeForce = (boid: IBoid, width: number, height: number): IVector => {
  const edgeForce = 0.3;
  const distance = 100;
  const { x, y } = boid.position;

  return Vector.create(
    x < distance ? edgeForce : x > width - distance ? -edgeForce : 0,
    y < distance ? edgeForce : y > height - distance ? -edgeForce : 0
  );
};

export function appendPositionToPath(
  boidPaths: IPath[],
  index: number,
  position: Vector.IVector,
  pathLengthLimit: number
): IPath[] {
  const newPaths = [...boidPaths];
  newPaths[index].push(position);

  // Limit the path length
  if (newPaths[index].length > pathLengthLimit) {
    newPaths[index] = newPaths[index].slice(1);
  }

  return newPaths;
}
