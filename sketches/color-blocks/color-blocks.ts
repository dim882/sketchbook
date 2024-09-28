import { rgb, hsl } from 'culori';
import { setup } from './lib/DOM';
import { point } from './lib/Math';
import { dimensions, rect, Rectangle } from './lib/color-blocks.utils';
export type IPoint = [number, number];

export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const prng = Math.random;

setup(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center = point(width / 2, height / 2);

  const shortSide = width / 3;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'hsl(42, 80%, 60%, .5)';

  const rectangle: Rectangle = rect(shortSide, shortSide * 2);

  const translation: IPoint = [center.x - dimensions(rectangle).width / 2, center.y - dimensions(rectangle).height / 2];
  context.translate(...translation);
  context.fillRect(...rectangle);
}
