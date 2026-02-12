import { MutableRef } from 'preact/hooks';

export function drawColorWheel(canvasRef: MutableRef<HTMLCanvasElement>, lightness: number) {
  const canvas = canvasRef.current;

  if (canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      const { width, height } = canvas;
      const radius = Math.min(width, height) / 2;

      ctx.clearRect(0, 0, width, height);

      for (let angle = 0; angle < 360; angle++) {
        for (let r = 0; r < radius; r++) {
          const h = angle;
          const s = (r / radius) * 100;
          const l = lightness;

          ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;

          // Bring the dimensions in a bit to account for the rects that are bigger than 1x1
          const x = (width - 2) / 2 + Math.cos((angle * Math.PI) / 180) * r + 1;
          const y = (height - 2) / 2 + Math.sin((angle * Math.PI) / 180) * r + 1;

          // Make the rects bigger than 1x1, to avoid moire patterns
          ctx.fillRect(x - 1, y - 1, 2.2, 2.2);
        }
      }
    }
  }
}

export function convertLchToXy(lch: [number, number, number], radius: number): [number, number] {
  const [_, c, h] = lch;

  const angle = (h * Math.PI) / 180; // Convert hue to radians
  const x = radius + c * Math.cos(angle);
  const y = radius - c * Math.sin(angle);

  return [x, y];
}

export function getDistance(p1: [number, number], p2: [number, number]) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];

  return Math.sqrt(dx * dx + dy * dy);
}

export const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));

export function mapToRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  return toLow + ((toHigh - toLow) * (value - fromLow)) / (fromHigh - fromLow);
}

// E.g. if the range is 0 to 99 and the number is 20, the result should be 20 less than the high
export function invert(value: number, low: number, high: number) {
  return low + high - value;
}

export function inverseLerp(a: number, b: number, v: number) {
  return (v - a) / (b - a);
}

export function lerp(min: number, max: number, t: number) {
  return min * (1 - t) + max * t;
}
