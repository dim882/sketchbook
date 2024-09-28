import { Rectangle, IPoint } from './color-blocks';
import { point } from './lib/Math';

export function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  const center = point(width / 2, height / 2);
  const rect = (width: number, height = width): Rectangle => {
    return [0, 0, width, height];
  };
  const dimensions = (rect: Rectangle) => ({
    width: rect[2],
    height: rect[3],
  });

  const shortSide = width / 3;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'hsl(42, 80%, 60%, .5)';

  const rectangle: Rectangle = rect(shortSide, shortSide * 2);

  const translation: IPoint = [center.x - dimensions(rectangle).width / 2, center.y - dimensions(rectangle).height / 2];
  context.translate(...translation);
  context.fillRect(...rectangle);
}
