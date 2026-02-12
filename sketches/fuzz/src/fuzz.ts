import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { pipe, head } from 'ramda';
import { getElement, setup, IDrawNoise, addEvent, applyNoise, makeFuzzer, renderDebugNoise } from './fuzz.utils';

const prng = Math.random;

interface IRenderArgs {
  contexts: CanvasRenderingContext2D[];
  baseColor: string;
  noise2D: NoiseFunction2D;
}

setup(() => {
  const contexts = getElement('canvas')
    .map((canvas) => canvas.getContext('2d'))
    .filter((el) => el !== null);
  if (contexts.length < 1) {
    return;
  }
  const noise = createNoise2D();

  let color = localStorage.getItem('color') || '#fff';

  pipe(
    () => getElement('sc-color-picker'),
    head,
    addEvent('input', (e) => console.log('input', e)),
    addEvent('change', (e) => console.log('change', e.detail.value))
  )();

  render({ contexts, baseColor: color, noise2D: noise });
});

function render({ contexts, baseColor, noise2D }: IRenderArgs) {
  const [mainContext, noiseDebugContext, ...scratchContexts] = contexts;
  const { width, height } = mainContext.canvas;

  renderDebugNoise({ width, height, noise2D, context: noiseDebugContext, scale: 500 });

  const drawFuzz = makeFuzzer({ context: mainContext, prng, iterations: 1, radius: 150 });

  mainContext.strokeStyle = 'lch(50% 20 50 / .02)';

  const fuzzFromNoise: IDrawNoise = ({ value, context, x, y }) => {
    const normalValue = Math.floor((value + 1) * 50); // Normalize to [0, 100]

    if (normalValue > 60 && normalValue < 80) {
      drawFuzz(x, y);
    }

    if (normalValue > 60) {
      context.fillStyle = '#000';
      context.fillRect(x, y, 1, 1);
    }
  };

  mainContext.fillStyle = `#000`;
  mainContext.fillRect(0, 0, width, height);

  applyNoise({
    context: mainContext,
    width,
    height,
    noise2D,
    scale: 800,
    callback: fuzzFromNoise,
  });
}
