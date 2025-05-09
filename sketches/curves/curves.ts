export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  context.save();

  context.translate(0, height / 2);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(width / 2, 0);
  context.bezierCurveTo(width / 4, 0, (3 * width) / 4, 0, width, 0);
  context.stroke();

  context.restore();
}
