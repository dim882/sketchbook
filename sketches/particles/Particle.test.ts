import * as Particle from './Particle';
import * as Vector from './Vector';

describe('Particle', () => {
  describe('applyForce', () => {
    it('should apply force to particle acceleration', () => {
      const particle = Particle.create({ position: Vector.create(0, 0) });
      const force = Vector.create(1, 1);

      const updatedParticle = Particle.applyForce(particle, force);

      expect(updatedParticle.acceleration).toEqual(Vector.create(1, 1));
    });
  });

  describe('update', () => {
    it('should update particle position and velocity', () => {
      const particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(1, 1),
        acceleration: Vector.create(0.5, 0.5),
      });

      Particle.update(particle);

      expect(particle.velocity).toEqual(Vector.create(1.5, 1.5));
      expect(particle.position).toEqual(Vector.create(1.5, 1.5));
      expect(particle.acceleration).toEqual(Vector.create(0, 0));
    });

    it('should limit velocity when maxVelocity is provided', () => {
      const particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(2, 2),
        acceleration: Vector.create(1, 1),
      });

      Particle.update(particle, 2);

      const velocityMagnitude = Vector.getMagnitude(particle.velocity);
      expect(velocityMagnitude).toBeLessThanOrEqual(2);
      expect(Vector.equals(particle.velocity, Vector.setMagnitude(particle.velocity, 2))).toBe(true);
    });
  });
});
