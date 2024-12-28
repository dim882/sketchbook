import * as Particle from './Particle';
import * as Vector from './Vector';

describe('Particle', () => {
  describe('applyForce', () => {
    it('should update particle position and velocity', () => {
      let particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(1, 1),
      });

      particle = Particle.applyForce(particle, Vector.create(0.5, 0.5));

      expect(particle).toEqual({
        velocity: Vector.create(1.5, 1.5),
        position: Vector.create(1.5, 1.5),
        acceleration: Vector.create(0, 0),
      });
    });

    xit('should limit velocity when maxVelocity is provided', () => {
      let particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(2, 2),
        acceleration: Vector.create(1, 1),
      });

      particle = Particle.applyForce(particle, Vector.create(2, 2));

      const velocityMagnitude = Vector.getMagnitude(particle.velocity);
      expect(velocityMagnitude).toBeLessThanOrEqual(2);
      expect(Vector.equals(particle.velocity, Vector.setMagnitude(particle.velocity, 2))).toBe(true);
    });
  });
});
