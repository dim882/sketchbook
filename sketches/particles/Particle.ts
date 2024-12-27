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
}

export const create = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  radius = 1,
}: IParticleCreateArgs): IParticle => ({
  position,
  velocity,
  acceleration,
  radius,
});

export const copy = (particle: IParticle): IParticle => create({ position: Vector.clone(particle.position) });

function makeVelocity(particle: IParticle, force: Vector.IVector, maxVelocity: number | undefined) {
  const acceleration = Vector.add(particle.acceleration, force);
  const velocity = Vector.add(particle.velocity, acceleration);
  const mVelocity = maxVelocity ?? particle.maxVelocity;

  if (mVelocity) {
    return Vector.limit(velocity, mVelocity);
  }

  return velocity;
}

export const applyForce = (particle: IParticle, force: Vector.IVector, maxVelocity?: number): IParticle => {
  particle.velocity = makeVelocity(particle, force, maxVelocity);
  particle.position = Vector.add(particle.position, particle.velocity);
  particle.acceleration = Vector.multiply(particle.acceleration, 0);

  return particle;
};
