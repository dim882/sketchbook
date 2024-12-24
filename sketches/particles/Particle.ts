import {
  type IVector,
  clone as cloneVector,
  multiply as multiplyVector,
  limit as limitVector,
  add as addVector,
  createVector,
} from './Vector';

export interface IParticle {
  previousPosition: IVector;
  position: IVector;
  velocity: IVector;
  acceleration: IVector;
  maxVelocity?: number;
  radius: number;
}

interface IParticleConstructor {
  position: IVector;
  velocity?: IVector;
  acceleration?: IVector;
  maxVelocity?: number;
  radius?: number;
}

export const createParticle = ({
  position,
  velocity = createVector(0, 0),
  acceleration = createVector(0, 0),
  maxVelocity,
  radius = 1,
}: IParticleConstructor): IParticle => ({
  previousPosition: cloneVector(position),
  position,
  velocity,
  acceleration,
  maxVelocity,
  radius,
});

export const updateParticle = (particle: IParticle, maxVelocity?: number): void => {
  addVector(particle.velocity, particle.acceleration);

  const mVelocity = maxVelocity ?? particle.maxVelocity;

  if (mVelocity) {
    limitVector(particle.velocity, mVelocity);
  }

  addVector(particle.position, particle.velocity);
  multiplyVector(particle.acceleration, 0);
};

export const applyForceToParticle = (particle: IParticle, force: IVector): void => {
  addVector(particle.acceleration, force);
};

export const updateParticlePreviousPosition = (particle: IParticle): void => {
  particle.previousPosition = cloneVector(particle.position);
};

export const copyParticle = (particle: IParticle): IParticle =>
  createParticle({ position: cloneVector(particle.position) });

export default createParticle;
