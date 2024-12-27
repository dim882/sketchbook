import * as Particle from './Particle';
import * as Vector from './Vector';

describe('Particle', () => {
  describe('create', () => {
    it('should create a particle with default values', () => {
      const position = Vector.create(0, 0);
      const particle = Particle.create({ position });

      expect(particle.position).toEqual(position);
      expect(particle.velocity).toEqual(Vector.create(0, 0));
      expect(particle.acceleration).toEqual(Vector.create(0, 0));
      expect(particle.radius).toBe(1);
    });
  });

  describe('update', () => {
    it('should update particle position and velocity', () => {
      // Test implementation
    });
  });

  describe('applyForce', () => {
    it('should apply force to particle acceleration', () => {
      // Test implementation
    });
  });

  // Add more test cases for other functions
});
