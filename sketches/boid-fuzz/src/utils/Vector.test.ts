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

  describe('addInto', () => {
    it('should add v2 into v1 and return v1', () => {
      const v1 = Vector.create(2, 3);
      const v2 = Vector.create(4, 5);
      const result = Vector.addInto(v1, v2);

      assert.strictEqual(result, v1);
      assert.deepStrictEqual(v1, { x: 6, y: 8 });
    });
  });

  describe('subtractInto', () => {
    it('should subtract v2 from v1 and return v1', () => {
      const v1 = Vector.create(8, 10);
      const v2 = Vector.create(3, 4);
      const result = Vector.subtractInto(v1, v2);

      assert.strictEqual(result, v1);
      assert.deepStrictEqual(v1, { x: 5, y: 6 });
    });
  });

  describe('multiplyInto', () => {
    it('should multiply v by scalar and return v', () => {
      const v = Vector.create(2, 3);
      const result = Vector.multiplyInto(v, 2);

      assert.strictEqual(result, v);
      assert.deepStrictEqual(v, { x: 4, y: 6 });
    });
  });

  describe('divideInto', () => {
    it('should divide v by scalar and return v', () => {
      const v = Vector.create(8, 12);
      const result = Vector.divideInto(v, 2);

      assert.strictEqual(result, v);
      assert.deepStrictEqual(v, { x: 4, y: 6 });
    });
  });

  describe('multiplyVectorsInto', () => {
    it('should multiply v1 by v2 and return v1', () => {
      const v1 = Vector.create(2, 3);
      const v2 = Vector.create(4, 5);
      const result = Vector.multiplyVectorsInto(v1, v2);

      assert.strictEqual(result, v1);
      assert.deepStrictEqual(v1, { x: 8, y: 15 });
    });
  });

  describe('divideVectorsInto', () => {
    it('should divide v1 by v2 and return v1', () => {
      const v1 = Vector.create(8, 15);
      const v2 = Vector.create(2, 3);
      const result = Vector.divideVectorsInto(v1, v2);

      assert.strictEqual(result, v1);
      assert.deepStrictEqual(v1, { x: 4, y: 5 });
    });
  });

  describe('normalizeInto', () => {
    it('should normalize v and return v', () => {
      const v = Vector.create(3, 4);
      const result = Vector.normalizeInto(v);

      assert.strictEqual(result, v);
      assert.ok(Math.abs(v.x - 0.6) < 0.0001);
      assert.ok(Math.abs(v.y - 0.8) < 0.0001);
    });

    it('should set zero vector when magnitude is zero', () => {
      const v = Vector.create(0, 0);
      const result = Vector.normalizeInto(v);

      assert.strictEqual(result, v);
      assert.deepStrictEqual(v, { x: 0, y: 0 });
    });
  });

  describe('setMagnitudeInto', () => {
    it('should set the magnitude of v and return v', () => {
      const v = Vector.create(3, 4);
      const result = Vector.setMagnitudeInto(v, 10);

      assert.strictEqual(result, v);
      assert.ok(Math.abs(v.x - 6) < 0.0001);
      assert.ok(Math.abs(v.y - 8) < 0.0001);
    });

    it('should set zero vector when original magnitude is zero', () => {
      const v = Vector.create(0, 0);
      const result = Vector.setMagnitudeInto(v, 10);

      assert.strictEqual(result, v);
      assert.deepStrictEqual(v, { x: 0, y: 0 });
    });
  });

  describe('limitInto', () => {
    it('should limit the magnitude of v and return v when magnitude exceeds max', () => {
      const v = Vector.create(3, 4);
      const result = Vector.limitInto(v, 4);

      assert.strictEqual(result, v);
      assert.ok(Math.abs(v.x - 2.4) < 0.0001);
      assert.ok(Math.abs(v.y - 3.2) < 0.0001);
    });

    it('should not modify v when magnitude is less than max', () => {
      const v = Vector.create(1, 2);
      const originalX = v.x;
      const originalY = v.y;
      const result = Vector.limitInto(v, 10);

      assert.strictEqual(result, v);
      assert.strictEqual(v.x, originalX);
      assert.strictEqual(v.y, originalY);
    });
  });
});
