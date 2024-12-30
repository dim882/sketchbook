import * as Particle from './Particle';
import * as Vector from './Vector';

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

      const updatedParticle = Particle.applyForce(particle, force, dt);

      expect(updatedParticle.velocity.x).toBeCloseTo(2);
      expect(updatedParticle.velocity.y).toBeCloseTo(1.75);
      expect(updatedParticle.position.x).toBeCloseTo(1);
      expect(updatedParticle.position.y).toBeCloseTo(0.875);
    });

    it('should limit velocity when maxVelocity is specified', () => {
      const particle = Particle.create({
        position: Vector.create(0, 0),
        velocity: Vector.create(3, 4),
        mass: 1,
      });
      const force = Vector.create(10, 10);
      const dt = 1;
      const maxVelocity = 6;

      const updatedParticle = Particle.applyForce(particle, force, dt, maxVelocity);

      const speed = Vector.getMagnitude(updatedParticle.velocity);
      expect(speed).toBeCloseTo(maxVelocity);
      expect(updatedParticle.velocity.x).toBeCloseTo(3.6);
      expect(updatedParticle.velocity.y).toBeCloseTo(4.8);
    });
  });
});
