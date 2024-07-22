import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { pipe } from 'ramda';
import { I2DTuple, addEvent, log, makeFuzzer } from './fuzz.utils';

const prng = Math.random;

interface IRenderArgs {
  contexts: CanvasRenderingContext2D[];
  baseColor: string;
  noise2D: NoiseFunction2D;
}

window.addEventListener('DOMContentLoaded', () => {
  const contexts = Array.from(document.querySelectorAll('canvas')).map((canvas) => canvas.getContext('2d'));
  console.log({ contexts });
  const noise = createNoise2D();

  let color = localStorage.getItem('color');

  // prettier-ignore
  pipe(
    () => document.querySelector('sc-color-picker'),
    addEvent('input', (e: CustomEvent) => console.log('input', e)),
    addEvent('change', (e: CustomEvent) => console.log('change', e.detail.value)),
  )();

  console.log('hi!');

  render({ contexts, baseColor: color, noise2D: noise });
});

function render({ contexts, baseColor, noise2D }: IRenderArgs) {
  const [mainContext, noiseDebugContext, ...scratchContexts] = contexts;
  const { width, height } = mainContext.canvas;
  const center: I2DTuple = [width / 2, height / 2];

  renderDebugNoise({ width, height, noise2D, context: noiseDebugContext, scale: 500 });

  const drawFuzz = makeFuzzer({ context: mainContext, prng });

  mainContext.fillStyle = `#000`;
  mainContext.fillRect(0, 0, width, height);
  mainContext.strokeStyle = 'lch(50% 50 50 / .2)';

  for (let i = 0; i < 80; i++) {
    drawFuzz(...center);
  }
}

function renderDebugNoise({
  width,
  height,
  noise2D,
  context,
  scale = 100,
}: {
  width: number;
  height: number;
  noise2D: NoiseFunction2D;
  context: CanvasRenderingContext2D;
  scale?: number;
}) {
  applyNoise({ context, width, height, noise2D, scale });
}

interface IApplyNoiseArgs {
  width: number;
  height: number;
  noise2D: NoiseFunction2D;
  scale: number;
  context: CanvasRenderingContext2D;
}

function applyNoise({ width, height, noise2D, scale, context }: IApplyNoiseArgs) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = noise2D(x / scale, y / scale);

      drawNoise({ value, context, x, y });
    }
  }
}

interface IDrawNoiseArgs {
  value: number;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
}

type IDrawNoise = (args: IDrawNoiseArgs) => void;

const drawNoise: IDrawNoise = ({ value, context, x, y }) => {
  const color = Math.floor((value + 1) * 128); // Normalize to [0, 255]

  if (color > 180 && color < 255) {
    context.fillStyle = `rgb(${color}, ${color}, ${color})`;
    context.fillRect(x, y, 1, 1);
  }
};
