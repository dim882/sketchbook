import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as Particle from './Particle.js';
import * as Vector from './Vector.js';

describe('Particle', () => {
  describe('applyForce', () => {
    it('should update particle velocity and position correctly', () => {
      const particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(1, 1),
        mass: 2,
      });
      const force = Vector.create(4, 3);
      const dt = 0.5;

      const updatedParticle = Particle.applyForce({ particle, force, deltaTime: dt });

      assert.ok(Math.abs(updatedParticle.velocity.x - 2) < 0.0001);
      assert.ok(Math.abs(updatedParticle.velocity.y - 1.75) < 0.0001);
      assert.ok(Math.abs(updatedParticle.position.x - 1) < 0.0001);
      assert.ok(Math.abs(updatedParticle.position.y - 0.875) < 0.0001);
    });

    it('should limit velocity when maxVelocity is specified', () => {
      const particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(3, 4),
        mass: 1,
      });
      const force = Vector.create(100, 100);
      const dt = 1;
      const maxVelocity = 3;

      const updatedParticle = Particle.applyForce({ particle, force, deltaTime: dt, maxVelocity });

      const speed = Vector.getMagnitude(updatedParticle.velocity);
      assert.ok(Math.abs(speed - maxVelocity) < 0.0001);

      // With a large force, the velocity should be in the direction of the force, limited to maxVelocity
      const forceDirection = Vector.normalize(force);
      const actualDirection = Vector.normalize(updatedParticle.velocity);
      assert.ok(Math.abs(actualDirection.x - forceDirection.x) < 0.01);
      assert.ok(Math.abs(actualDirection.y - forceDirection.y) < 0.01);
    });
  });
});
