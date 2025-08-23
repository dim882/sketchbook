import prng from './pnrg';
import { ensureSeedInUrl, generateRandomSeed, setSeedInUrl } from './base.seed';
export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

// Initialize PRNG with seed
const seed = ensureSeedInUrl();
let makeRand = prng(seed);

// Standalone event handler function
function handleSeedChange(context: CanvasRenderingContext2D | null) {
  return () => {
    const newSeed = generateRandomSeed();
    setSeedInUrl(newSeed);
    makeRand = prng(newSeed);

    if (context) {
      render(context, makeRand);
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
    render(context, makeRand);
  }
});

function render(context: CanvasRenderingContext2D, rand: PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(makeRand, 0, 270);
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
