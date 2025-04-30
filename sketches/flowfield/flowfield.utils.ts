import * as Vec from './Vector.js';

export type IPointTuple = [number, number];
export type IRenderFunc = (t: number) => void;

export function getCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;

  if (!canvas) {
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'canvas';
    newCanvas.width = window.innerWidth;
    newCanvas.height = window.innerHeight;
    document.body.appendChild(newCanvas);
    return newCanvas;
  }

  return canvas;
}

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  return context;
}

export function loop(renderFunc: IRenderFunc, fps = 60): void {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let frameCount = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    renderFunc(frameCount);
    frameCount++;
  }

  requestAnimationFrame(animate);
}
