import * as Vector from './Vector';
import * as Boid from './Boid';
import { IBoid } from './Boid';
import { IVector } from './Vector';

export type PseudoRandomNumberGenerator = () => number;

export const createFlock = (
  count: number,
  width: number,
  height: number,
  prng: PseudoRandomNumberGenerator
): IBoid[] => {
  const boids: IBoid[] = [];

  for (let i = 0; i < count; i++) {
    const position = Vector.create(prng() * width, prng() * height);

    const velocity = Vector.create((prng() * 2 - 1) * 2, (prng() * 2 - 1) * 2);

    boids.push(Boid.create({ position, velocity }));
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

  return Vector.create(0, 0);
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
  const sep = separation(boid, boids, params.separationDist);
  const ali = alignment(boid, boids, params.alignDist);
  const coh = cohesion(boid, boids, params.cohesionDist);

  const separationForce = Vector.multiply(sep, params.separationWeight);
  const alignmentForce = Vector.multiply(ali, params.alignmentWeight);
  const cohesionForce = Vector.multiply(coh, params.cohesionWeight);

  let newBoid = Boid.applyForce(boid, separationForce);
  newBoid = Boid.applyForce(newBoid, alignmentForce);
  newBoid = Boid.applyForce(newBoid, cohesionForce);

  const edgeForce = calculateEdgeForce(boid, width, height);
  newBoid = Boid.applyForce(newBoid, edgeForce);

  return newBoid;
};

export const drawBoid = (context: CanvasRenderingContext2D, boid: IBoid): void => {
  const { position, velocity, size, color } = boid;
  const angle = Math.atan2(velocity.y, velocity.x);

  context.save();
  context.translate(position.x, position.y);
  context.rotate(angle);

  // Draw a triangular boid with consistent proportions
  context.beginPath();
  context.moveTo(size * 2, 0);
  context.lineTo(-size, size);
  context.lineTo(-size, -size);
  context.closePath();

  context.fillStyle = color;
  context.fill();

  context.restore();
};

const calculateEdgeForce = (boid: IBoid, width: number, height: number): IVector => {
  const EDGE_FORCE_STRENGTH = 0.3;
  const EDGE_THRESHOLD = 100; // Distance from edge to start applying force
  let force = Vector.create(0, 0);

  if (boid.position.x < EDGE_THRESHOLD) {
    force = Vector.add(force, Vector.create(EDGE_FORCE_STRENGTH, 0));
  } else if (boid.position.x > width - EDGE_THRESHOLD) {
    force = Vector.add(force, Vector.create(-EDGE_FORCE_STRENGTH, 0));
  }

  if (boid.position.y < EDGE_THRESHOLD) {
    force = Vector.add(force, Vector.create(0, EDGE_FORCE_STRENGTH));
  } else if (boid.position.y > height - EDGE_THRESHOLD) {
    force = Vector.add(force, Vector.create(0, -EDGE_FORCE_STRENGTH));
  }

  return force;
};
