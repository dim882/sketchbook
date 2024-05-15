import { IPointTuple } from './squares.utils';

const prng = Math.random;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  let color = localStorage.getItem('color');

  const picker = document.getElementById('color-picker');

  if (!color && picker) {
    color = picker.getAttribute('color');
    console.log('initial color', color);

    picker.setAttribute('color', color);
    console.log('set color', picker.getAttribute('color'));
  }
  if (color) {
    picker.setAttribute('color', color);
    console.log('set color', picker.getAttribute('color'));
  }

  if (picker) {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'color') {
          const newColor = picker.getAttribute('color');
          localStorage.setItem('color', newColor);

          render(context, newColor);
        }
      }
      console.log(picker.getAttribute('color'));
    });

    observer.observe(picker, { attributes: true });
  }

  render(context, color);
});

function render(context: CanvasRenderingContext2D, baseColor: string) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  //  Do work here
  context.fillStyle = baseColor;
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, ...center);
  context.restore();
}
