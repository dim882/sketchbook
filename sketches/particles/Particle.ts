import * as Vector from './Vector';

export interface IParticle {
  position: Vector.IVector;
  velocity: Vector.IVector;
  acceleration: Vector.IVector;
  maxVelocity?: number;
  radius: number;
}

interface IParticleCreateArgs {
  position: Vector.IVector;
  velocity?: Vector.IVector;
  acceleration?: Vector.IVector;
  radius?: number; // remove?
  maxVelocity?: number; // remove
}

export const create = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  maxVelocity,
  radius = 1,
}: IParticleCreateArgs): IParticle => ({
  position,
  velocity,
  acceleration,
  maxVelocity,
  radius,
});

export const applyForce = (particle: IParticle, force: Vector.IVector): IParticle => {
  Vector.add(particle.acceleration, force);

  return particle;
};

export const copy = (particle: IParticle): IParticle => create({ position: Vector.clone(particle.position) });

// This should use function composition
export const update = (particle: IParticle, maxVelocity?: number): void => {
  Vector.add(particle.velocity, particle.acceleration);

  const mVelocity = maxVelocity ?? particle.maxVelocity;

  if (mVelocity) {
    Vector.limit(particle.velocity, mVelocity);
  }

  Vector.add(particle.position, particle.velocity);
  Vector.multiply(particle.acceleration, 0);
};
