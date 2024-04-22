export type PseudoRandomNumberGenerator = () => number;
export type IRange = [lower: number, upper: number];
export type I2DTuple = [number, number];

export type IPointTuple = [number, number];

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const getBoolean = (generateNumber: PseudoRandomNumberGenerator, probabilityTrue: number = 0.5) => {
  return generateNumber() < probabilityTrue;
};

type Range = (start: number, end: number, step?: number) => number[];

export const range: Range = (start, end, step = 1) => {
  const result: number[] = [];

  if (start > end && step > 0) {
    step = -step;
  }

  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }

  return result;
};

type PRNG = () => number;

export const createPRNG = (seed: number): PRNG => {
  // Constants for the LCG. These are common values used in numerical recipes
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  // Current state of the generator
  let state = seed;

  // The PRNG function that computes the next pseudorandom number
  const prng: PRNG = () => {
    // Update the state with the LCG formula
    state = (a * state + c) % m;
    // Normalize to the range 0 to 1 (exclusive)
    return state / m;
  };

  return prng;
};

export function tracePath(context: CanvasRenderingContext2D, points: IPointTuple[]) {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function applyColorMatrix(context: CanvasRenderingContext2D, matrix: number[][]) {
  const { width, height } = context.canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    data[i] = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2] + a * matrix[0][3] + matrix[0][4] * 255; // Red
    data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2] + a * matrix[1][3] + matrix[1][4] * 255; // Green
    data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2] + a * matrix[2][3] + matrix[2][4] * 255; // Blue
    data[i + 3] = r * matrix[3][0] + g * matrix[3][1] + b * matrix[3][2] + a * matrix[3][3] + matrix[3][4] * 255; // Alpha
  }

  context.putImageData(imageData, 0, 0);
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas.getContext('2d', { willReadFrequently: true });
}

export function applySVGFilterToCanvas(canvas: HTMLCanvasElement, svgString: string) {
  const dataUrl = canvas.toDataURL();
  console.log(dataUrl);

  const fullSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      ${svgString}
      <image filter="url(#svgFilter)" x="0" y="0" width="${canvas.width}" height="${canvas.height}" href="${dataUrl}"></svg>
  `;

  const blob = new Blob([fullSvgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
    URL.revokeObjectURL(url); // Clean up the blob URL
  };
  img.src = url;
}

export function maximizeOpacity(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // This is a Uint8ClampedArray

  // Loop through each pixel's data
  // Every pixel's data is in groups of four values: (R, G, B, A)
  for (let i = 3; i < data.length; i += 4) {
    // data[i] refers to the alpha component of each pixel
    if (data[i] > 0) {
      data[i] = 255;
    }
  }

  // Place the modified ImageData back to the canvas
  context.putImageData(imageData, 0, 0);
}

export function getAverageColorOfOpaquePixels(canvas: HTMLCanvasElement): { r: number; g: number; b: number } | null {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]; // Alpha channel

    if (alpha > 200) {
      // Check if the pixel is fully opaque
      sumR += data[i]; // Sum red component
      sumG += data[i + 1]; // Sum green component
      sumB += data[i + 2]; // Sum blue component
      count++;
    }
  }

  if (count === 0) {
    return null; // Return null if no opaque pixels are found
  }

  // Calculate average of each color component
  return {
    r: Math.round(sumR / count),
    g: Math.round(sumG / count),
    b: Math.round(sumB / count),
  };
}

export function flattenToColor(canvas: HTMLCanvasElement, color: { r: number; g: number; b: number }) {
  const context = canvas.getContext('2d');
  if (!context) return;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      // Check if the pixel is not completely transparent
      data[i] = color.r; // Set red component
      data[i + 1] = color.g; // Set green component
      data[i + 2] = color.b; // Set blue component
      // Alpha component data[i + 3] remains unchanged
    }
  }

  context.putImageData(imageData, 0, 0);
}
