import { pipe } from 'ramda';
import { I2DTuple, addEvent, log, makeFuzzer } from './fuzz.utils';

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

  const fuzzer = makeFuzzer({ context, prng });

  context.fillStyle = `#000`;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(100, 0 , 0, .3)';

  for (let i = 0; i < 80; i++) {
    fuzzer(...center);
  }
}
