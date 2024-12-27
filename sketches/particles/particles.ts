import { getCanvas, getCanvasContext, type IPointTuple, loop } from './particles.utils.js';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);

  loop(context, render, 60);
};

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];
}
