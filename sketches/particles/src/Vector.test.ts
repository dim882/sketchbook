import * as Vector from './Vector';

describe('Vector', () => {
  describe('fromRadians', () => {
    it('should create a vector from radians', () => {
      const v = Vector.fromRadians(Math.PI / 4);

      expect(v.x).toBeCloseTo(Math.sqrt(2) / 2);
      expect(v.y).toBeCloseTo(Math.sqrt(2) / 2);
    });
  });

  describe('multiply', () => {
    it('should multiply a vector by a scalar', () => {
      const v = Vector.create(2, 3);
      const result = Vector.multiply(v, 2);

      expect(result).toEqual({ x: 4, y: 6 });
    });

    it('should multiply two vectors', () => {
      const v1 = Vector.create(2, 3);
      const v2 = Vector.create(4, 5);
      const result = Vector.multiply(v1, v2);

      expect(result).toEqual({ x: 8, y: 15 });
    });
  });

  describe('divide', () => {
    it('should divide a vector by a scalar', () => {
      const v = Vector.create(4, 6);
      const result = Vector.divide(v, 2);

      expect(result).toEqual({ x: 2, y: 3 });
    });

    it('should divide two vectors', () => {
      const v1 = Vector.create(8, 15);
      const v2 = Vector.create(2, 3);
      const result = Vector.divide(v1, v2);

      expect(result).toEqual({ x: 4, y: 5 });
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      const v1 = Vector.create(1, 2, 3);
      const v2 = Vector.create(1, 2, 3);

      expect(Vector.equals(v1, v2)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const v1 = Vector.create(1, 2, 3);
      const v2 = Vector.create(1, 2, 4);

      expect(Vector.equals(v1, v2)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.normalize(v);

      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });
  });

  describe('getMagnitudeSquared', () => {
    it('should return the squared magnitude of a vector', () => {
      const v = Vector.create(3, 4);

      expect(Vector.getMagnitudeSquared(v)).toBe(25);
    });
  });

  describe('setMagnitude', () => {
    it('should set the magnitude of a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.setMagnitude(v, 10);

      expect(result.x).toBeCloseTo(6);
      expect(result.y).toBeCloseTo(8);
    });
  });

  describe('getMagnitude', () => {
    it('should return the magnitude of a vector', () => {
      const v = Vector.create(3, 4);

      expect(Vector.getMagnitude(v)).toBe(5);
    });
  });

  describe('limit', () => {
    it('should limit the magnitude of a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.limit(v, 4);

      expect(result.x).toBeCloseTo(2.4);
      expect(result.y).toBeCloseTo(3.2);
    });
  });

  describe('length', () => {
    it('should return the length of a vector', () => {
      const v = Vector.create(3, 4);

      expect(Vector.length(v)).toBe(5);
    });
  });

  describe('dot', () => {
    it('should return the dot product of two vectors', () => {
      const v1 = Vector.create(1, 2);
      const v2 = Vector.create(3, 4);

      expect(Vector.dot(v1, v2)).toBe(11);
    });
  });

  describe('toArray', () => {
    it('should convert a vector to an array', () => {
      const v = Vector.create(1, 2, 3);

      expect(Vector.toArray(v)).toEqual([1, 2, 3]);
    });
  });

  describe('clone', () => {
    it('should create a copy of a vector', () => {
      const v = Vector.create(1, 2, 3);
      const clone = Vector.clone(v);

      expect(clone).toEqual(v);
      expect(clone).not.toBe(v);
    });
  });

  describe('toAngle', () => {
    it('should return the angle of a vector', () => {
      const v = Vector.create(1, 1);

      expect(Vector.toAngle(v)).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('fromAngle', () => {
    it('should create a vector from an angle', () => {
      const v = Vector.fromAngle(Math.PI / 4, Math.sqrt(2));

      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(1);
    });
  });

  describe('fromTuple', () => {
    it('should create a vector from a tuple', () => {
      const v = Vector.fromTuple([1, 2]);

      expect(v).toEqual({ x: 1, y: 2 });
    });
  });

  describe('toTuple', () => {
    it('should convert a vector to a tuple', () => {
      const v = Vector.create(1, 2);

      expect(Vector.toTuple(v)).toEqual([1, 2]);
    });
  });
});
