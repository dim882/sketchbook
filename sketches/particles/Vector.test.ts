import * as Vector from './Vector';

describe('Vector', () => {
  describe('create', () => {
    it('should create a 2D vector', () => {
      const v = Vector.create(1, 2);
      expect(v).toEqual({ x: 1, y: 2 });
    });

    it('should create a 3D vector', () => {
      const v = Vector.create(1, 2, 3);
      expect(v).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('add', () => {
    it('should add two vectors', () => {
      const v1 = Vector.create(1, 2);
      const v2 = Vector.create(3, 4);
      const result = Vector.add(v1, v2);

      expect(result).toEqual({ x: 4, y: 6 });
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors', () => {
      const v1 = Vector.create(5, 5);
      const v2 = Vector.create(2, 3);
      const result = Vector.subtract(v1, v2);

      expect(result).toEqual({ x: 3, y: 2 });
    });
  });

  // Add more test cases for other vector functions
});
