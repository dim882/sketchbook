import { createSeedState } from './base.seed';
import { getInteger } from './base.utils';
export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const bindEvent = (selector: string, eventName: string, callback: () => void) => {
  document.querySelector(selector)?.addEventListener(eventName, callback);
};

const seedState = createSeedState();

window.addEventListener('DOMContentLoaded', () => {
  const context = document.querySelector('canvas')?.getContext('2d');

  if (!context) {
    return;
  }

  bindEvent(
    '.change-seed',
    'click',
    seedState.handleSeedChange((newRand) => render(context, newRand))
  );

  render(context, seedState.getRand());
});

function render(context: CanvasRenderingContext2D, rand: PseudoRandomNumberGenerator) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(rand, 0, 270);
  const backgroundHue = formHue + 180;

  context.fillStyle = `lch(60% 50% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  const fillColor = 'rgb(87, 218, 92)';

  context.fillStyle = fillColor;
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, ...center);

  context.restore();
}
