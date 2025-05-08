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

  constructor(position: Vector, velocity?: Vector, mass: number = 1) {
    this.position = position;
    this.velocity = velocity || new Vector(0, 0);
    this.mass = mass;
  }

  static create({ position, velocity, mass = 1 }: { position: Vector; velocity?: Vector; mass?: number }): Particle {
    return new Particle(position, velocity, mass);
  }

  copy(): Particle {
    return new Particle(this.position.clone(), this.velocity.clone(), this.mass);
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

    this.position.add(Vector.multiplyStatic(this.velocity, deltaTime));

    return this;
  }

  update(deltaTime: number = 1, maxVelocity?: number): Particle {
    this.position.add(Vector.multiplyStatic(this.velocity, deltaTime));

    if (maxVelocity !== undefined) {
      this.velocity.limit(maxVelocity);
    }

    return this;
  }
}
