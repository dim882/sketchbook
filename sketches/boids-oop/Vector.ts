export type IPointTuple = [number, number];

export class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static create(x: number, y: number, z?: number): Vector {
    return new Vector(x, y, z);
  }

  static fromRadians(angle: number): Vector {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  add(v: Vector): Vector {
    this.x += v.x;
    this.y += v.y;
    if (this.z !== undefined && v.z !== undefined) {
      this.z += v.z;
    }
    return this;
  }

  static add(v1: Vector, v2: Vector): Vector {
    const z = v1.z !== undefined && v2.z !== undefined ? v1.z + v2.z : v1.z;
    return new Vector(v1.x + v2.x, v1.y + v2.y, z);
  }

  subtract(v: Vector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    if (this.z !== undefined && v.z !== undefined) {
      this.z -= v.z;
    }
    return this;
  }

  static subtract(v1: Vector, v2: Vector): Vector {
    const z = v1.z !== undefined && v2.z !== undefined ? v1.z - v2.z : v1.z;
    return new Vector(v1.x - v2.x, v1.y - v2.y, z);
  }

  multiply(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    if (this.z) {
      this.z *= scalar;
    }
    return this;
  }

  static multiply(v: Vector, scalar: number): Vector {
    const z = v.z ? v.z * scalar : undefined;
    return new Vector(v.x * scalar, v.y * scalar, z);
  }

  divide(scalar: number): Vector {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
      this.z /= scalar;
    }
    return this;
  }

  static divide(v: Vector, scalar: number): Vector {
    const z = v.z ? v.z / scalar : undefined;
    return new Vector(v.x / scalar, v.y / scalar, z);
  }

  equals(v: Vector): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  static normalize(v: Vector): Vector {
    const mag = v.magnitude();
    if (mag > 0) {
      return Vector.divide(v, mag);
    }
    return new Vector(0, 0);
  }

  getMagnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + (this.z ? this.z * this.z : 0);
  }

  setMagnitude(magnitude: number): Vector {
    this.normalize().multiply(magnitude);
    return this;
  }

  static setMagnitude(v: Vector, magnitude: number): Vector {
    return Vector.multiply(Vector.normalize(v), magnitude);
  }

  getMagnitude(): number {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  limit(max: number): Vector {
    if (this.magnitude() > max) {
      this.normalize().multiply(max);
    }
    return this;
  }

  static limit(v: Vector, max: number): Vector {
    const mag = v.magnitude();
    if (mag > max) {
      return Vector.multiply(Vector.normalize(v), max);
    }
    return v.clone();
  }

  length(): number {
    return Math.sqrt(this.dot(this));
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + (this.z ? (v.z !== undefined ? this.z * v.z : 0) : 0);
  }

  distance(v: Vector): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  toArray(): number[] {
    return [this.x, this.y, this.z ?? 0];
  }

  clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  toAngle(): number {
    return Math.atan2(this.y, this.x);
  }

  copy(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  static fromAngle(angleRadians: number, length = 1): Vector {
    const x = length * Math.cos(angleRadians);
    const y = length * Math.sin(angleRadians);
    return new Vector(x, y, 0);
  }

  static fromTuple([x, y, z = 0]: [number, number, number?]): Vector {
    return new Vector(x, y, z);
  }

  toTuple(): [number, number] {
    return [this.x, this.y];
  }
}
