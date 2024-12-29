import * as Vector from './Vector';

type OptionalExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// type Debug<T> = { [P in keyof T]: T[P] };
// type ExpandedType = Debug<IParticleCreateArgs>;
// let _: ExpandedType = null!;

export interface IParticle {
  position: Vector.IVector;
  velocity: Vector.IVector;
  acceleration: Vector.IVector;
  mass: number;
}

type IParticleCreateArgs = OptionalExcept<IParticle, 'position'>;

export const create = ({
  position,
  velocity = Vector.create(0, 0),
  acceleration = Vector.create(0, 0),
  mass = 1,
}: IParticleCreateArgs): IParticle => ({
  position,
  velocity,
  acceleration,
  mass,
});

export const copy = (particle: IParticle): IParticle => create({ position: Vector.clone(particle.position) });

function makeVelocity(particle: IParticle, force: Vector.IVector) {
  const acceleration = Vector.add(particle.acceleration, force);

  return Vector.add(particle.velocity, acceleration);
}

export function limitVelocity(velocity: Vector.IVector, maxVelocity: number) {
  return maxVelocity ? Vector.limit(velocity, maxVelocity) : velocity;
}

export const applyForce = (particle: IParticle, force: Vector.IVector): IParticle => {
  return {
    ...particle,
    velocity: makeVelocity(particle, force),
    position: Vector.add(particle.position, particle.velocity),
    acceleration: Vector.multiply(particle.acceleration, 0),
  };
};
