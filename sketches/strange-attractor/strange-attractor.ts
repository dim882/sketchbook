import alea from 'alea';

import * as utils from './strange-attractor.utils';
import { type IPoint } from './types';

const BACKGROUND_COLOR = '#0f0f1a';
const POINT_COLOR = '#f7d486';
const POINT_SIZE = 0.5;
const POINT_OPACITY = 0.6;
const ITERATIONS = 100000;
const SKIP_ITERATIONS = 100;
const ATTRACTOR_TYPE = 'lorenz'; // 'lorenz', 'aizawa', 'rossler', 'thomas'

// Lorenz attractor parameters
const LORENZ_SIGMA = 10;
const LORENZ_RHO = 28;
const LORENZ_BETA = 8 / 3;

// Aizawa attractor parameters
const AIZAWA_A = 0.95;
const AIZAWA_B = 0.7;
const AIZAWA_C = 0.6;
const AIZAWA_D = 3.5;
const AIZAWA_E = 0.25;
const AIZAWA_F = 0.1;

// Rossler attractor parameters
const ROSSLER_A = 0.2;
const ROSSLER_B = 0.2;
const ROSSLER_C = 5.7;

// Thomas attractor parameters
const THOMAS_B = 0.19;

document.body.onload = () => {
  const canvas = utils.getCanvas();
  const context = utils.getCanvasContext(canvas);
  const { width, height } = canvas;

  const prng = alea('strange-attractor-seed');

  // Generate attractor points
  const points = utils.generateAttractorPoints({
    type: ATTRACTOR_TYPE,
    iterations: ITERATIONS,
    skipIterations: SKIP_ITERATIONS,
    parameters: {
      lorenz: { sigma: LORENZ_SIGMA, rho: LORENZ_RHO, beta: LORENZ_BETA },
      aizawa: { a: AIZAWA_A, b: AIZAWA_B, c: AIZAWA_C, d: AIZAWA_D, e: AIZAWA_E, f: AIZAWA_F },
      rossler: { a: ROSSLER_A, b: ROSSLER_B, c: ROSSLER_C },
      thomas: { b: THOMAS_B },
    },
    prng,
  });

  // Scale points to fit canvas
  const scaledPoints = utils.scalePointsToCanvas(points, width, height);

  // Render the attractor
  render(context, {
    points: scaledPoints,
    pointColor: POINT_COLOR,
    pointSize: POINT_SIZE,
    pointOpacity: POINT_OPACITY,
    backgroundColor: BACKGROUND_COLOR,
  });
};

interface ISketchData {
  points: IPoint[];
  pointColor: string;
  pointSize: number;
  pointOpacity: number;
  backgroundColor: string;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => {
  const { width, height } = context.canvas;
  const { points, pointColor, pointSize, pointOpacity, backgroundColor } = data;

  // Clear canvas and set background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  // Draw points
  context.fillStyle = pointColor;
  context.globalAlpha = pointOpacity;

  for (const point of points) {
    context.beginPath();
    context.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;
};
