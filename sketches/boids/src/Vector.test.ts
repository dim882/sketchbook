import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as Vector from './Vector.js';

describe('Vector', () => {
  describe('fromRadians', () => {
    it('should create a vector from radians', () => {
      const v = Vector.fromRadians(Math.PI / 4);

      assert.ok(Math.abs(v.x - Math.sqrt(2) / 2) < 0.0001);
      assert.ok(Math.abs(v.y - Math.sqrt(2) / 2) < 0.0001);
    });
  });

  describe('multiply', () => {
    it('should multiply a vector by a scalar', () => {
      const v = Vector.create(2, 3);
      const result = Vector.multiply(v, 2);

      assert.deepStrictEqual(result, { x: 4, y: 6 });
    });

    it('should multiply two vectors', () => {
      const v1 = Vector.create(2, 3);
      const v2 = Vector.create(4, 5);
      const result = Vector.multiplyVectors(v1, v2);

      assert.deepStrictEqual(result, { x: 8, y: 15 });
    });
  });

  describe('divide', () => {
    it('should divide a vector by a scalar', () => {
      const v = Vector.create(4, 6);
      const result = Vector.divide(v, 2);

      assert.deepStrictEqual(result, { x: 2, y: 3 });
    });

    it('should divide two vectors', () => {
      const v1 = Vector.create(8, 15);
      const v2 = Vector.create(2, 3);
      const result = Vector.divideVectors(v1, v2);

      assert.deepStrictEqual(result, { x: 4, y: 5 });
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      const v1 = Vector.create(1, 2, 3);
      const v2 = Vector.create(1, 2, 3);

      assert.strictEqual(Vector.equals(v1, v2), true);
    });

    it('should return false for different vectors', () => {
      const v1 = Vector.create(1, 2, 3);
      const v2 = Vector.create(1, 2, 4);

      assert.strictEqual(Vector.equals(v1, v2), false);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.normalize(v);

      assert.ok(Math.abs(result.x - 0.6) < 0.0001);
      assert.ok(Math.abs(result.y - 0.8) < 0.0001);
    });
  });

  describe('getMagnitudeSquared', () => {
    it('should return the squared magnitude of a vector', () => {
      const v = Vector.create(3, 4);

      assert.strictEqual(Vector.getMagnitudeSquared(v), 25);
    });
  });

  describe('setMagnitude', () => {
    it('should set the magnitude of a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.setMagnitude(v, 10);

      assert.ok(Math.abs(result.x - 6) < 0.0001);
      assert.ok(Math.abs(result.y - 8) < 0.0001);
    });
  });

  describe('getMagnitude', () => {
    it('should return the magnitude of a vector', () => {
      const v = Vector.create(3, 4);

      assert.strictEqual(Vector.getMagnitude(v), 5);
    });
  });

  describe('limit', () => {
    it('should limit the magnitude of a vector', () => {
      const v = Vector.create(3, 4);
      const result = Vector.limit(v, 4);

      assert.ok(Math.abs(result.x - 2.4) < 0.0001);
      assert.ok(Math.abs(result.y - 3.2) < 0.0001);
    });
  });

  describe('length', () => {
    it('should return the length of a vector', () => {
      const v = Vector.create(3, 4);

      assert.strictEqual(Vector.length(v), 5);
    });
  });

  describe('dot', () => {
    it('should return the dot product of two vectors', () => {
      const v1 = Vector.create(1, 2);
      const v2 = Vector.create(3, 4);

      assert.strictEqual(Vector.dot(v1, v2), 11);
    });
  });

  describe('toArray', () => {
    it('should convert a vector to an array', () => {
      const v = Vector.create(1, 2, 3);

      assert.deepStrictEqual(Vector.toArray(v), [1, 2, 3]);
    });
  });

  describe('clone', () => {
    it('should create a copy of a vector', () => {
      const v = Vector.create(1, 2, 3);
      const clone = Vector.clone(v);

      assert.deepStrictEqual(clone, v);
      assert.notStrictEqual(clone, v);
    });
  });

  describe('toAngle', () => {
    it('should return the angle of a vector', () => {
      const v = Vector.create(1, 1);

      assert.ok(Math.abs(Vector.toAngle(v) - Math.PI / 4) < 0.0001);
    });
  });

  describe('fromAngle', () => {
    it('should create a vector from an angle', () => {
      const v = Vector.fromAngle(Math.PI / 4, Math.sqrt(2));

      assert.ok(Math.abs(v.x - 1) < 0.0001);
      assert.ok(Math.abs(v.y - 1) < 0.0001);
    });
  });

  describe('fromTuple', () => {
    it('should create a vector from a tuple', () => {
      const v = Vector.fromTuple([1, 2]);

      assert.deepStrictEqual(v, { x: 1, y: 2 });
    });
  });

  describe('toTuple', () => {
    it('should convert a vector to a tuple', () => {
      const v = Vector.create(1, 2);

      assert.deepStrictEqual(Vector.toTuple(v), [1, 2]);
    });
  });
});
