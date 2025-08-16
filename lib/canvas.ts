import type { IPointTuple } from './types';

export function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas element not found');
  return canvas;
}

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context');
  return context;
}

export function createCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d', { willReadFrequently: true });
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void): void {
  context.save();
  callback();
  context.restore();
}
