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
    let newVelocity = this.velocity.add(acceleration.multiply(deltaTime));

    if (maxVelocity !== undefined) {
      newVelocity = newVelocity.limit(maxVelocity);
    }

    const newPosition = this.position.add(newVelocity.multiply(deltaTime));

    return new Particle(newPosition, newVelocity, this.mass);
  }
}
