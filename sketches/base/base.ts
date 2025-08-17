import prng from './pnrg';
export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

// Seed management functions
const getSeedFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('seed') || '';
};

const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

const setSeedInUrl = (seed: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  window.history.replaceState({}, '', url.toString());
};

const ensureSeedInUrl = (): string => {
  const existingSeed = getSeedFromUrl();
  if (existingSeed) {
    return existingSeed;
  }

  const newSeed = generateRandomSeed();
  setSeedInUrl(newSeed);
  return newSeed;
};

const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

// Initialize PRNG with seed
const seed = ensureSeedInUrl();
const makeRnd = prng(seed);

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  // Add event handler for change-seed button
  const changeSeedButton = document.querySelector('.change-seed') as HTMLButtonElement;
  if (changeSeedButton) {
    changeSeedButton.addEventListener('click', () => {
      const newSeed = generateRandomSeed();
      setSeedInUrl(newSeed);
      // Reinitialize PRNG with new seed
      const newMakeRnd = prng(newSeed);
      // Update the global makeRnd reference
      Object.assign(makeRnd, newMakeRnd);
      // Re-render with new seed
      if (context) {
        render(context);
      }
    });
  }

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(makeRnd, 0, 270);
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
