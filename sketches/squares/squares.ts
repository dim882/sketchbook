import { pipe, curry, head } from 'ramda';
import { IPointTuple, getInteger } from './squares.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let color = localStorage.getItem('color');

  const $ = document.querySelectorAll.bind(document);

  const log = curry((tag: string, val) => (console.log(tag, val), val));

  console.log('foo!');

  // prettier-ignore
  pipe(
    () => document.querySelector('sc-toggle') as HTMLElement,
    (toggle: HTMLElement) => {
      console.log('element:', toggle);
      return toggle;
    },
    (toggle: HTMLElement) => {
      toggle.addEventListener('change', (e: CustomEvent) => console.log('Hello toggle?', e.detail.value));
      return toggle;
    }
  )();

  // prettier-ignore
  pipe(
    $('color-picker'), 
    head, 
    (colorPicker: HTMLElement) => {
      colorPicker.addEventListener('input', (e: CustomEvent) => console.log('input', e));
      colorPicker.addEventListener('change', (e: CustomEvent) => console.log('input', e));
      return colorPicker
    }
  )();

  render(context, color);
});

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
