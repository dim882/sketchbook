import { Particle } from './Particle';
import { Vector } from './Vector';

export class Boid extends Particle {
  maxSpeed: number;
  maxForce: number;
  size: number;
  color: string;

  constructor(
    position: Vector,
    velocity?: Vector,
    mass: number = 1,
    maxSpeed: number = 4,
    maxForce: number = 0.1,
    size: number = 5,
    color: string = '#333'
  ) {
    super(position, velocity, mass);
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.size = size;
    this.color = color;
  }

  static create({
    position,
    velocity,
    mass = 1,
    maxSpeed = 4,
    maxForce = 0.1,
    size = 5,
    color = '#333',
  }: {
    position: Vector;
    velocity?: Vector;
    mass?: number;
    maxSpeed?: number;
    maxForce?: number;
    size?: number;
    color?: string;
  }): Boid {
    return new Boid(position, velocity, mass, maxSpeed, maxForce, size, color);
  }

  applyBehaviors(boids: Boid[], deltaTime: number): void {
    const separation = this.separate(boids);
    const alignment = this.align(boids);
    const cohesion = this.cohesion(boids);

    // Apply weights to behaviors
    separation.multiply(1.5);
    alignment.multiply(1.0);
    cohesion.multiply(1.0);

    // Apply forces
    this.applyForce({ force: separation, deltaTime });
    this.applyForce({ force: alignment, deltaTime });
    this.applyForce({ force: cohesion, deltaTime });
  }

  separate(boids: Boid[]): Vector {
    const desiredSeparation = this.size * 2;
    let steer = Vector.create(0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < desiredSeparation) {
        const diff = this.position.clone().subtract(other.position);
        diff.normalize().divide(distance); // Weight by distance
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.divide(count);
    }

    if (steer.magnitude() > 0) {
      steer.normalize().multiply(this.maxSpeed).subtract(this.velocity);
      steer.limit(this.maxForce);
    }

    return steer;
  }

  align(boids: Boid[]): Vector {
    const neighborDistance = 50;
    let sum = Vector.create(0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < neighborDistance) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.divide(count);
      sum.normalize().multiply(this.maxSpeed);

      const steer = sum.subtract(this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }

    return Vector.create(0, 0);
  }

  cohesion(boids: Boid[]): Vector {
    const neighborDistance = 50;
    let sum = Vector.create(0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < neighborDistance) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.divide(count);
      return this.seek(sum);
    }

    return Vector.create(0, 0);
  }

  seek(target: Vector): Vector {
    const desired = target.clone().subtract(this.position);
    desired.normalize().multiply(this.maxSpeed);

    const steer = desired.subtract(this.velocity);
    steer.limit(this.maxForce);

    return steer;
  }

  draw(context: CanvasRenderingContext2D): void {
    const angle = Math.atan2(this.velocity.y, this.velocity.x);

    context.save();
    context.translate(...this.position.toTuple());
    context.rotate(angle);

    // Draw triangular boid
    context.beginPath();
    context.moveTo(this.size, 0);
    context.lineTo(-this.size, this.size / 2);
    context.lineTo(-this.size, -this.size / 2);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();

    context.restore();
  }
}
