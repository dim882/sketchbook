
export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;
export type IPointTuple = [number, number];

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  const frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let t = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(context, t); // Assuming `context` is accessible in this scope
    t++;
  }

  requestAnimationFrame(animate);
}

export const getCanvas = (): HTMLCanvasElement => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas element not found');

  return canvas;
};

export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context');

  return context;
};


