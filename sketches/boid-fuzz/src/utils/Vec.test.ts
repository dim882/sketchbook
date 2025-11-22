import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as Vec from './Vec.js';

describe('Vec', () => {
  describe('vec', () => {
    it('should create a vector with x and y', () => {
      using v = Vec.vec(1, 2);
      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
    });
  });

  describe('add', () => {
    it('should add two vectors', () => {
      using a = Vec.vec(1, 2);
      using b = Vec.vec(3, 4);
      using result = Vec.add(a, b);

      assert.strictEqual(result.x, 4);
      assert.strictEqual(result.y, 6);
    });
  });

  describe('sub', () => {
    it('should subtract two vectors', () => {
      using a = Vec.vec(5, 7);
      using b = Vec.vec(2, 3);
      using result = Vec.sub(a, b);

      assert.strictEqual(result.x, 3);
      assert.strictEqual(result.y, 4);
    });
  });

  describe('scale', () => {
    it('should scale a vector by a scalar', () => {
      using a = Vec.vec(2, 3);
      using result = Vec.scale(a, 2);

      assert.strictEqual(result.x, 4);
      assert.strictEqual(result.y, 6);
    });
  });

  describe('multiply', () => {
    it('should multiply a vector by a scalar', () => {
      using a = Vec.vec(2, 3);
      using result = Vec.multiply(a, 2);

      assert.strictEqual(result.x, 4);
      assert.strictEqual(result.y, 6);
    });
  });

  describe('divide', () => {
    it('should divide a vector by a scalar', () => {
      using a = Vec.vec(4, 6);
      using result = Vec.divide(a, 2);

      assert.strictEqual(result.x, 2);
      assert.strictEqual(result.y, 3);
    });
  });

  describe('multiplyVectors', () => {
    it('should multiply two vectors component-wise', () => {
      using a = Vec.vec(2, 3);
      using b = Vec.vec(4, 5);
      using result = Vec.multiplyVectors(a, b);

      assert.strictEqual(result.x, 8);
      assert.strictEqual(result.y, 15);
    });
  });

  describe('divideVectors', () => {
    it('should divide two vectors component-wise', () => {
      using a = Vec.vec(8, 15);
      using b = Vec.vec(2, 3);
      using result = Vec.divideVectors(a, b);

      assert.strictEqual(result.x, 4);
      assert.strictEqual(result.y, 5);
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      using a = Vec.vec(1, 2);
      using b = Vec.vec(1, 2);

      assert.strictEqual(Vec.equals(a, b), true);
    });

    it('should return false for different vectors', () => {
      using a = Vec.vec(1, 2);
      using b = Vec.vec(1, 3);

      assert.strictEqual(Vec.equals(a, b), false);
    });
  });

  describe('magnitude', () => {
    it('should return the magnitude of a vector', () => {
      using v = Vec.vec(3, 4);

      assert.strictEqual(Vec.magnitude(v), 5);
    });

    it('should return 0 for zero vector', () => {
      using v = Vec.vec(0, 0);

      assert.strictEqual(Vec.magnitude(v), 0);
    });
  });

  describe('magnitudeSquared', () => {
    it('should return the squared magnitude of a vector', () => {
      using v = Vec.vec(3, 4);

      assert.strictEqual(Vec.magnitudeSquared(v), 25);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      using v = Vec.vec(3, 4);
      using result = Vec.normalize(v);

      assert.ok(Math.abs(result.x - 0.6) < 0.0001);
      assert.ok(Math.abs(result.y - 0.8) < 0.0001);
    });

    it('should return zero vector for zero vector', () => {
      using v = Vec.vec(0, 0);
      using result = Vec.normalize(v);

      assert.strictEqual(result.x, 0);
      assert.strictEqual(result.y, 0);
    });
  });

  describe('setMagnitude', () => {
    it('should set the magnitude of a vector', () => {
      using v = Vec.vec(3, 4);
      using result = Vec.setMagnitude(v, 10);

      assert.ok(Math.abs(result.x - 6) < 0.0001);
      assert.ok(Math.abs(result.y - 8) < 0.0001);
    });
  });

  describe('limit', () => {
    it('should limit the magnitude of a vector when exceeding max', () => {
      using v = Vec.vec(3, 4);
      using result = Vec.limit(v, 4);

      assert.ok(Math.abs(result.x - 2.4) < 0.0001);
      assert.ok(Math.abs(result.y - 3.2) < 0.0001);
    });

    it('should return a copy when within limit', () => {
      using v = Vec.vec(1, 2);
      using result = Vec.limit(v, 10);

      assert.strictEqual(result.x, 1);
      assert.strictEqual(result.y, 2);
    });
  });

  describe('length', () => {
    it('should return the length of a vector', () => {
      using v = Vec.vec(3, 4);

      assert.strictEqual(Vec.length(v), 5);
    });
  });

  describe('dot', () => {
    it('should return the dot product of two vectors', () => {
      using a = Vec.vec(1, 2);
      using b = Vec.vec(3, 4);

      assert.strictEqual(Vec.dot(a, b), 11);
    });

    it('should return 0 for perpendicular vectors', () => {
      using a = Vec.vec(1, 0);
      using b = Vec.vec(0, 1);

      assert.strictEqual(Vec.dot(a, b), 0);
    });
  });

  describe('distance', () => {
    it('should return the distance between two vectors', () => {
      using a = Vec.vec(0, 0);
      using b = Vec.vec(3, 4);

      assert.strictEqual(Vec.distance(a, b), 5);
    });

    it('should return 0 for identical vectors', () => {
      using a = Vec.vec(1, 2);
      using b = Vec.vec(1, 2);

      assert.strictEqual(Vec.distance(a, b), 0);
    });
  });

  describe('toArray', () => {
    it('should convert a vector to an array', () => {
      using v = Vec.vec(1, 2);

      assert.deepStrictEqual(Vec.toArray(v), [1, 2]);
    });
  });

  describe('clone', () => {
    it('should create a copy of a vector', () => {
      using v = Vec.vec(1, 2);
      using cloned = Vec.clone(v);

      assert.strictEqual(cloned.x, v.x);
      assert.strictEqual(cloned.y, v.y);
      assert.notStrictEqual(cloned, v);
    });
  });

  describe('toAngle', () => {
    it('should return the angle of a vector', () => {
      using v = Vec.vec(1, 1);

      assert.ok(Math.abs(Vec.toAngle(v) - Math.PI / 4) < 0.0001);
    });

    it('should return 0 for vector pointing right', () => {
      using v = Vec.vec(1, 0);

      assert.strictEqual(Vec.toAngle(v), 0);
    });
  });

  describe('fromAngle', () => {
    it('should create a vector from an angle', () => {
      using v = Vec.fromAngle(Math.PI / 4, Math.sqrt(2));

      assert.ok(Math.abs(v.x - 1) < 0.0001);
      assert.ok(Math.abs(v.y - 1) < 0.0001);
    });

    it('should use default length of 1', () => {
      using v = Vec.fromAngle(0);

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 0);
    });
  });

  describe('fromRadians', () => {
    it('should create a vector from radians', () => {
      using v = Vec.fromRadians(Math.PI / 4);

      assert.ok(Math.abs(v.x - Math.sqrt(2) / 2) < 0.0001);
      assert.ok(Math.abs(v.y - Math.sqrt(2) / 2) < 0.0001);
    });
  });

  describe('fromTuple', () => {
    it('should create a vector from a tuple', () => {
      using v = Vec.fromTuple([1, 2]);

      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 2);
    });
  });

  describe('toTuple', () => {
    it('should convert a vector to a tuple', () => {
      using v = Vec.vec(1, 2);

      assert.deepStrictEqual(Vec.toTuple(v), [1, 2]);
    });
  });

  describe('pooling', () => {
    it('should reuse vectors from pool', () => {
      const v1 = Vec.vec(1, 2);
      const v2 = Vec.vec(3, 4);
      const v3 = Vec.vec(5, 6);

      // Dispose vectors to return them to pool
      v1[Symbol.dispose]();
      v2[Symbol.dispose]();
      v3[Symbol.dispose]();

      // Create new vectors - should reuse from pool
      using a = Vec.vec(10, 20);
      using b = Vec.vec(30, 40);
      using c = Vec.vec(50, 60);

      assert.strictEqual(a.x, 10);
      assert.strictEqual(a.y, 20);
      assert.strictEqual(b.x, 30);
      assert.strictEqual(b.y, 40);
      assert.strictEqual(c.x, 50);
      assert.strictEqual(c.y, 60);
    });
  });
});

