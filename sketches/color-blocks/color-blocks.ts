import { rgb, hsl } from 'culori';
import { setup } from './lib/DOM';
import { point } from './lib/Math';

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

type Rectangle = [number, number, number, number];

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center = point(width / 2, height / 2);
  const rect = (width: number, height = width): Rectangle => {
    return [0, 0, width, height];
  };
  console.log(center);

  const shortSide = width / 3;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'hsl(42, 80%, 60%, .5)';

  const rectangle: Rectangle = rect(shortSide, shortSide * 2);

  context.translate(center.x, center.y);
  context.fillRect(...rectangle);

  context.restore();
}
