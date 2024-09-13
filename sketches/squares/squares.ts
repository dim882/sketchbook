import { getFloat } from '@dim882/lib';
import { pipe } from 'ramda';
import { IPointTuple, getInteger } from './squares.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  console.log('random', getFloat(Math.random));

  let color = localStorage.getItem('color');

  const log =
    <T>(tag: string) =>
    (val: T) => (console.log(tag, val), val);

  const addEvent = (eventName: string, handler: (e: CustomEvent) => void) => (el: Element) => {
    el.addEventListener(eventName, handler);
    return el;
  };

  // prettier-ignore
  pipe(
    () => document.querySelector('sc-toggle'),
    log('set up toggle'),
    addEvent('change', handleToggle)
  )();

  // prettier-ignore
  pipe(
    () => document.querySelector('sc-color-picker'),
    addEvent('input', (e: CustomEvent) => console.log('input', e)),
    addEvent('change', (e: CustomEvent) => console.log('change', e.detail.value)),
  )();

  render(context, color);
});

function handleToggle(this: HTMLElement, e: CustomEvent) {
  console.log('toggle!', e.detail.value);
}

function render(context: CanvasRenderingContext2D, baseColor: string) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  context.fillStyle = `lch(60% 10% ${backgroundHue})`;
  context.fillRect(0, 0, width, height);

  const fillColor = 'rgb(87, 218, 92)'; //`lch(60% 30% ${formHue} / 1)`;

  context.fillStyle = fillColor;
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, ...center);

  context.restore();
}
