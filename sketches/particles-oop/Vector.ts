export type IPointTuple = [number, number];

export class Vector {
  x: number;
  y: number;
  z?: number;

  constructor(x: number, y: number, z?: number) {
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
    return new Vector(this.x + v.x, this.y + v.y, this.z !== undefined && v.z !== undefined ? this.z + v.z : this.z);
  }

  subtract(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y, this.z !== undefined && v.z !== undefined ? this.z - v.z : this.z);
  }

  multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z ? this.z * scalar : undefined);
  }

  divide(scalar: number): Vector {
    return new Vector(this.x / scalar, this.y / scalar, this.z ? this.z / scalar : undefined);
  }

  equals(v: Vector): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector {
    const mag = this.magnitude();
    return mag > 0 ? this.divide(mag) : new Vector(0, 0);
  }

  getMagnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + (this.z ? this.z * this.z : 0);
  }

  setMagnitude(magnitude: number): Vector {
    return this.normalize().multiply(magnitude);
  }

  getMagnitude(): number {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  limit(max: number): Vector {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return new Vector(this.x, this.y, this.z);
  }

  length(): number {
    return Math.sqrt(this.dot(this));
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + (this.z ? (v.z !== undefined ? this.z * v.z : 0) : 0);
  }

  distance(v: Vector): number {
    return this.subtract(v).magnitude();
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
    return this.clone();
  }

  static fromAngle(angleRadians: number, length = 1): Vector {
    const x = length * Math.cos(angleRadians);
    const y = length * Math.sin(angleRadians);
    return new Vector(x, y, 0);
  }

  static fromTuple([x, y]: IPointTuple): Vector {
    return new Vector(x, y);
  }

  toTuple(): IPointTuple {
    return [this.x, this.y];
  }
}
