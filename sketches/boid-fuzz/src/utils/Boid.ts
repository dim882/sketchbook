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
  path: IVector[];
}

export interface IBoidCreateArgs extends Pick<IBoid, 'position'>, Partial<Omit<IBoid, 'position'>> {}

export const create = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  maxSpeed = 4,
  maxForce = 0.1,
  size = 5,
  color = '#333',
  path = [],
}: IBoidCreateArgs): IBoid => ({
  position,
  velocity,
  acceleration,
  maxSpeed,
  maxForce,
  size,
  color,
  path,
});

export const applyForce = (boid: IBoid, force: IVector): IBoid => {
  Vector.addInto(boid.acceleration, force);
  return boid;
};

export const updatePosition = (boid: IBoid): IBoid => {
  Vector.addInto(boid.velocity, boid.acceleration);
  Vector.limitInto(boid.velocity, boid.maxSpeed);
  Vector.addInto(boid.position, boid.velocity);
  boid.acceleration.x = 0;
  boid.acceleration.y = 0;

  return boid;
};
