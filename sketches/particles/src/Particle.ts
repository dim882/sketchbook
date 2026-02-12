import * as Vector from './Vector';

export interface IParticle {
  position: Vector.IVector;
  velocity: Vector.IVector;
  mass: number;
}

export const create = ({ position, velocity = Vector.create(0, 0), mass }: IParticle): IParticle => ({
  position,
  velocity,
  mass,
});

export const copy = (particle: IParticle): IParticle =>
  create({
    position: Vector.clone(particle.position),
    velocity: Vector.clone(particle.velocity),
    mass: particle.mass,
  });

export const applyForce = ({
  particle,
  force,
  deltaTime = 1,
  maxVelocity,
}: {
  particle: IParticle;
  force: Vector.IVector;
  deltaTime?: number;
  maxVelocity?: number;
}): IParticle => {
  const acceleration = Vector.divide(force, particle.mass);
  let newVelocity = Vector.add(particle.velocity, Vector.multiply(acceleration, deltaTime));

  if (maxVelocity !== undefined) {
    newVelocity = Vector.limit(newVelocity, maxVelocity);
  }

  const newPosition = Vector.add(particle.position, Vector.multiply(newVelocity, deltaTime));

  return {
    ...particle,
    velocity: newVelocity,
    position: newPosition,
  };
};
