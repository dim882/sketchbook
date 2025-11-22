import * as Vector from './Vector';
import * as Boid from './Boid';
import { IBoid } from './Boid';
import { IVector } from './Vector';
import { IFlockParams } from '../boid-fuzz.params';

export interface IPseudoRandomNumberGenerator {
  (): number;
}

export const createFlock = ({
  boidCount,
  center,
  distance,
  prng,
}: {
  boidCount: number;
  center: { x: number; y: number };
  distance: number;
  prng: IPseudoRandomNumberGenerator;
}): IBoid[] => {
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

export const separation = (boid: IBoid, boids: IBoid[], desiredSeparation: number): IVector => {
  let count = 0;
  let steer = Vector.create(0, 0);

  for (const other of boids) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < desiredSeparation) {
      const diff = Vector.normalize(Vector.subtract(boid.position, other.position));
      Vector.divideInto(diff, d);
      Vector.addInto(steer, diff);
      count++;
    }
  }

  if (count > 0) {
    Vector.divideInto(steer, count);
  }

  if (Vector.magnitude(steer) > 0) {
    Vector.normalizeInto(steer);
    Vector.multiplyInto(steer, boid.maxSpeed);
    Vector.subtractInto(steer, boid.velocity);
    Vector.limitInto(steer, boid.maxForce);
  }

  return steer;
};

export const alignment = (boid: IBoid, boids: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < neighborDistance) {
      Vector.addInto(sum, other.velocity);
      count++;
    }
  }

  if (count > 0) {
    Vector.divideInto(sum, count);
    Vector.normalizeInto(sum);
    Vector.multiplyInto(sum, boid.maxSpeed);
    Vector.subtractInto(sum, boid.velocity);
    Vector.limitInto(sum, boid.maxForce);
    return sum;
  }

  return sum;
};

export const cohesion = (boid: IBoid, boids: IBoid[], neighborDistance: number): IVector => {
  let count = 0;
  let sum = Vector.create(0, 0);

  for (const other of boids) {
    const d = Vector.distance(boid.position, other.position);

    if (d > 0 && d < neighborDistance) {
      Vector.addInto(sum, other.position);
      count++;
    }
  }

  if (count > 0) {
    Vector.divideInto(sum, count);
    return seek(boid, sum);
  }

  return Vector.create(0, 0);
};

export const seek = (boid: IBoid, target: IVector): IVector => {
  const desired = Vector.subtract(target, boid.position);
  Vector.normalizeInto(desired);
  Vector.multiplyInto(desired, boid.maxSpeed);
  Vector.subtractInto(desired, boid.velocity);
  Vector.limitInto(desired, boid.maxForce);
  return desired;
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

export const flock = ({
  boid,
  boids,
  params,
  width,
  height,
}: {
  boid: IBoid;
  boids: IBoid[];
  params: IFlockParams;
  width: number;
  height: number;
}): IBoid => {
  const sep = separation(boid, boids, params.separationDist);
  Vector.multiplyInto(sep, params.separationWeight);

  const align = alignment(boid, boids, params.alignDist);
  Vector.multiplyInto(align, params.alignmentWeight);

  const coh = cohesion(boid, boids, params.cohesionDist);
  Vector.multiplyInto(coh, params.cohesionWeight);

  const forces = [sep, align, coh, calculateEdgeForce(boid, width, height)];

  const boidWithForces = forces.reduce((currentBoid, force) => Boid.applyForce(currentBoid, force), boid);

  return Boid.updatePosition(boidWithForces);
};
