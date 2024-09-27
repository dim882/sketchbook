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

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center = point(width / 2, height / 2);

  const squareSize = width / 3;
  const offset = 20;

  context.fillStyle = 'hsl(42, 80%, 60%)';

  // prettier-ignore
  context.fillRect(
    center.x - squareSize - offset / 2, 
    center.y - squareSize / 2, 
    squareSize, 
    squareSize
  );

  // prettier-ignore
  context.fillRect(
    center.x + offset / 2, 
    center.y - squareSize / 2, 
    squareSize, 
    squareSize
  );

  context.restore();
}
