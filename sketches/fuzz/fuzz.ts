import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { pipe } from 'ramda';
import { I2DTuple, IDrawNoise, addEvent, applyNoise, log, makeFuzzer, renderDebugNoise } from './fuzz.utils';

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

  const drawFuzz = makeFuzzer({ context: mainContext, prng, iterations: 1, radius: 150 });

  mainContext.strokeStyle = 'lch(50% 50 50 / .02)';
  const fuzzFromNoise: IDrawNoise = ({ value, context, x, y }) => {
    const normalValue = Math.floor((value + 1) * 50); // Normalize to [0, 100]

    if (normalValue > 60 && normalValue < 90) {
      drawFuzz(x, y);
    }
  };

  mainContext.fillStyle = `#000`;
  mainContext.fillRect(0, 0, width, height);
  applyNoise({
    context: mainContext,
    width,
    height,
    noise2D,
    scale: 500,
    callback: fuzzFromNoise,
  });
  // mainContext.strokeStyle = 'lch(50% 50 50 / .2)';

  // for (let i = 0; i < 80; i++) {
  //   drawFuzz(...center);
  // }
}
