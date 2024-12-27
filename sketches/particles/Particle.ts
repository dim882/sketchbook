import * as Vector from './Vector';

export interface IParticle {
  previousPosition: Vector.IVector;
  position: Vector.IVector;
  velocity: Vector.IVector;
  acceleration: Vector.IVector;
  maxVelocity?: number;
  radius: number;
}

interface IParticleConstructor {
  position: Vector.IVector;
  velocity?: Vector.IVector;
  acceleration?: Vector.IVector;
  maxVelocity?: number;
  radius?: number;
}

export const createParticle = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  maxVelocity,
  radius = 1,
}: IParticleConstructor): IParticle => ({
  previousPosition: Vector.clone(position),
  position,
  velocity,
  acceleration,
  maxVelocity,
  radius,
});

export const updateParticle = (particle: IParticle, maxVelocity?: number): void => {
  Vector.add(particle.velocity, particle.acceleration);

  const mVelocity = maxVelocity ?? particle.maxVelocity;

  if (mVelocity) {
    Vector.limit(particle.velocity, mVelocity);
  }

  Vector.add(particle.position, particle.velocity);
  Vector.multiply(particle.acceleration, 0);
};

export const applyForceToParticle = (particle: IParticle, force: Vector.IVector): void => {
  Vector.add(particle.acceleration, force);
};

export const updateParticlePreviousPosition = (particle: IParticle): void => {
  particle.previousPosition = Vector.clone(particle.position);
};

export const copyParticle = (particle: IParticle): IParticle =>
  createParticle({ position: Vector.clone(particle.position) });

export default createParticle;
