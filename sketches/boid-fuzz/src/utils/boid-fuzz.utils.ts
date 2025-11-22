import * as Vector from './Vector';

export interface IPath extends Array<{ x: number; y: number }> {}

export interface IRenderFunc {
  (context: CanvasRenderingContext2D, t: number): void;
}

export interface ILoopHooks {
  onRAF?: (time: number) => void;
  onRenderStart?: () => void;
  onRenderEnd?: (time: number) => void;
}

export const bindEvent = (selector: string, eventName: string, callback: () => void) => {
  document.querySelector(selector)?.addEventListener(eventName, callback);
};

export const makeLoop = (context: CanvasRenderingContext2D, animateFn: () => void, hooks?: ILoopHooks) => () => {
  return loop(context, animateFn, 30, hooks);
};

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60, hooks?: ILoopHooks): void {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let frame = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    hooks?.onRAF?.(time);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    hooks?.onRenderStart?.();
    render(context, frame);
    hooks?.onRenderEnd?.(time);

    frame++;
  }

  requestAnimationFrame(animate);
}

export function drawPath(context: CanvasRenderingContext2D, color: string, path: IPath) {
  context.lineCap = 'round';
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 0.5;

  context.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    context.lineTo(path[i].x, path[i].y);
  }

  context.stroke();
}

export function appendPositionToPath(
  boidPaths: IPath[],
  index: number,
  position: Vector.IVector,
  pathLengthLimit: number
): IPath[] {
  const newPaths = [...boidPaths];
  newPaths[index].push(position);

  // Limit the path length
  if (newPaths[index].length > pathLengthLimit) {
    newPaths[index] = newPaths[index].slice(1);
  }

  return newPaths;
}
