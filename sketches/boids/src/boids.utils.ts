import * as Vector from './Vector';
import * as Boid from './Boid';
import { IBoid } from './Boid';
import { IVector } from './Vector';

export type PseudoRandomNumberGenerator = () => number;

export type IBoidPaths = {
  x: number;
  y: number;
}[][];

export function drawWoim(context: CanvasRenderingContext2D, newBoid: Boid.IBoid, boidPaths: IBoidPaths, index: number) {
  context.beginPath();
  context.strokeStyle = newBoid.color;
  context.lineWidth = 0.5;

  if (boidPaths[index].length > 1) {
    context.moveTo(boidPaths[index][0].x, boidPaths[index][0].y);

    for (let i = 1; i < boidPaths[index].length; i++) {
      context.lineTo(boidPaths[index][i].x, boidPaths[index][i].y);
    }
  }

  context.stroke();
}

export const createFlock = (
  count: number,
  width: number,
  height: number,
  prng: PseudoRandomNumberGenerator
): IBoid[] => {
  const boids: IBoid[] = [];

  for (let i = 0; i < count; i++) {
    boids.push(
      Boid.create({
        position: Vector.create(prng() * width, prng() * height),
        velocity: Vector.create((prng() * 2 - 1) * 2, (prng() * 2 - 1) * 2),
      })
    );
  }

  return boids;
};

export const separation = (boid: IBoid, boids: IBoid[], desiredSeparation: number): IVector => {
  let count = 0;
  let steer = Vector.create(0, 0);

  for (const other of boids) {
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

export const alignment = (boid: IBoid, boids: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids) {
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

export const cohesion = (boid: IBoid, boids: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids) {
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
  boids: IBoid[],
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
    Vector.multiply(separation(boid, boids, params.separationDist), params.separationWeight),
    Vector.multiply(alignment(boid, boids, params.alignDist), params.alignmentWeight),
    Vector.multiply(cohesion(boid, boids, params.cohesionDist), params.cohesionWeight),
    calculateEdgeForce(boid, width, height),
  ];

  const boidWithForces = forces.reduce((currentBoid, force) => Boid.applyForce(currentBoid, force), boid);
  return Boid.update(boidWithForces);
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
