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

function makeVelocity(particle: IParticle, force: Vector.IVector) {
  const acceleration = Vector.add(particle.acceleration, force);

  return Vector.add(particle.velocity, acceleration);
}

export function limitVelocity(velocity: Vector.IVector, maxVelocity: number) {
  return maxVelocity ? Vector.limit(velocity, maxVelocity) : velocity;
}

export const applyForce = (particle: IParticle, force: Vector.IVector, maxVelocity?: number): IParticle => {
  return {
    ...particle,
    velocity: (() => {
      const velocity = makeVelocity(particle, force);
      return maxVelocity ? limitVelocity(velocity, maxVelocity) : velocity;
    })(),
    position: Vector.add(particle.position, particle.velocity),
    acceleration: Vector.multiply(particle.acceleration, 0),
  };
};
