import { getFloat } from '@dim882/lib';
import { pipe, curry, head } from 'ramda';
import { I2DTuple, getInteger, addEvent, log } from './fuzz.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let color = localStorage.getItem('color');

  // prettier-ignore
  pipe(
    () => document.querySelector('sc-color-picker'),
    addEvent('input', (e: CustomEvent) => console.log('input', e)),
    addEvent('change', (e: CustomEvent) => console.log('change', e.detail.value)),
  )();

  render(context, color);
});

function render(context: CanvasRenderingContext2D, baseColor: string) {
  const { width, height } = context.canvas;
  const center: I2DTuple = [width / 2, height / 2];
}
