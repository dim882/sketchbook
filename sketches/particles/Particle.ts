import * as Vector from './Vector';

type OptionalExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

export interface IParticle {
  position: Vector.IVector;
  velocity: Vector.IVector;
  mass: number;
}

type IParticleCreateArgs = OptionalExcept<IParticle, 'position'>;

export const create = ({ position, velocity = Vector.create(0, 0), mass = 1 }: IParticleCreateArgs): IParticle => ({
  position,
  velocity,
  mass,
});

export const copy = (particle: IParticle): IParticle => create({ position: Vector.clone(particle.position) });

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
