import { IPointTuple } from './color-picker.utils';

// const prng = createPRNG(40502);
const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  //  Do work here
  context.fillStyle = 'blue';
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, ...center);
  context.restore();
}
