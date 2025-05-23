import * as Vector from './Vector';
import { IVector } from './Vector';

export interface IBoid {
  position: IVector;
  velocity: IVector;
  acceleration: IVector;
  maxSpeed: number;
  maxForce: number;
  size: number;
  color: string;
}

export interface IBoidCreateArgs {
  position: IVector;
  velocity?: IVector;
  acceleration?: IVector;
  maxSpeed?: number;
  maxForce?: number;
  size?: number;
  color?: string;
}

export const create = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  maxSpeed = 4,
  maxForce = 0.1,
  size = 5,
  color = '#333',
}: IBoidCreateArgs): IBoid => ({
  position,
  velocity,
  acceleration,
  maxSpeed,
  maxForce,
  size,
  color,
});

export const applyForce = (boid: IBoid, force: IVector): IBoid => ({
  ...boid,
  acceleration: Vector.add(boid.acceleration, force),
});

export const update = (boid: IBoid): IBoid => {
  const velocity = Vector.limit(Vector.add(boid.velocity, boid.acceleration), boid.maxSpeed);
  const position = Vector.add(boid.position, velocity);

  return {
    ...boid,
    position,
    velocity,
    acceleration: Vector.create(0, 0),
  };
};

export const wrap = (boid: IBoid, width: number, height: number): IBoid => {
  let x = boid.position.x;
  let y = boid.position.y;

  if (boid.position.x < 0) {
    x = 0;
  } else if (boid.position.x > width) {
    x = width;
  }

  if (boid.position.y < 0) {
    y = 0;
  } else if (boid.position.y > height) {
    y = height;
  }

  return {
    ...boid,
    position: Vector.create(x, y),
  };
};
