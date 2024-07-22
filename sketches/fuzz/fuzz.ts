import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { pipe } from 'ramda';
import { I2DTuple, addEvent, log, makeFuzzer } from './fuzz.utils';

const prng = Math.random;

interface IRenderArgs {
  contexts: CanvasRenderingContext2D[];
  baseColor: string;
  noise: NoiseFunction2D;
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

  render({ contexts, baseColor: color, noise });
});

function render({ contexts, baseColor, noise }: IRenderArgs) {
  const [mainContext, ...scratchContexts] = contexts;
  const { width, height } = mainContext.canvas;
  const center: I2DTuple = [width / 2, height / 2];

  const drawFuzz = makeFuzzer({ context: mainContext, prng });

  mainContext.fillStyle = `#000`;
  mainContext.fillRect(0, 0, width, height);

  mainContext.strokeStyle = 'lch(50% 50 50 / .2)';

  for (let i = 0; i < 80; i++) {
    drawFuzz(...center);
  }
}
