import { Vector } from './Vector';

export interface IParticle {
  position: Vector;
  velocity: Vector;
  mass: number;
}

export class Particle {
  position: Vector;
  velocity: Vector;
  mass: number;

  constructor({ position, velocity, mass = 1 }: { position: Vector; velocity?: Vector; mass?: number }) {
    this.position = position;
    this.velocity = velocity || new Vector(0, 0);
    this.mass = mass;
  }

  copy(): Particle {
    return new Particle({ position: this.position.clone(), velocity: this.velocity.clone(), mass: this.mass });
  }

  applyForce({
    force,
    deltaTime = 1,
    maxVelocity,
  }: {
    force: Vector;
    deltaTime?: number;
    maxVelocity?: number;
  }): Particle {
    const acceleration = force.divide(this.mass);
    this.velocity.add(acceleration.multiply(deltaTime));

    if (maxVelocity !== undefined) {
      this.velocity.limit(maxVelocity);
    }

    this.position.add(this.velocity.clone().multiply(deltaTime));

    return this;
  }
}
