import { getInteger } from './lib';
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
  // const [x, y] = center;
  const { x, y } = center;
  console.log(x, y);

  console.log(x, y, center.x, center.y);

  const squareSize = width / 3;
  const offset = 20;

  context.fillStyle = 'yellow';

  // prettier-ignore
  context.fillRect(
    width / 2 - squareSize - offset / 2, 
    height / 2 - squareSize / 2, 
    squareSize, 
    squareSize
  );

  // prettier-ignore
  context.fillRect(
    width / 2 + offset / 2, 
    height / 2 - squareSize / 2, 
    squareSize, 
    squareSize
  );

  context.restore();
}
