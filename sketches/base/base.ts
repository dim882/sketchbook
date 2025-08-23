import prng from './pnrg';
import { ensureSeedInUrl, generateRandomSeed, setSeedInUrl, getFloat, getInteger, createSeedState } from './base.seed';
export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

// Initialize PRNG with seed
const seed = ensureSeedInUrl();
const seedState = createSeedState(seed, prng);

function handleSeedChange(context: CanvasRenderingContext2D | null) {
  return () => {
    const newRand = seedState.changeSeed(generateRandomSeed());

    if (context) {
      render(context, newRand);
    }
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  const changeSeedButton = document.querySelector('.change-seed') as HTMLButtonElement;

  if (changeSeedButton) {
    changeSeedButton.addEventListener('click', handleSeedChange(context));
  }

  if (context) {
    render(context, seedState.getRand());
  }
});

function render(context: CanvasRenderingContext2D, rand: PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(rand, 0, 270);
  const backgroundHue = formHue + 180;

  context.fillStyle = `lch(60% 50% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  const fillColor = 'rgb(87, 218, 92)'; //`lch(60% 30% ${formHue} / 1)`;

  context.fillStyle = fillColor;
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, ...center);

  context.restore();
}
