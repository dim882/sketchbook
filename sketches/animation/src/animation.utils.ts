export type IRenderFunc = (t: number) => void;
export type IPointTuple = [number, number];

export function loop(renderFunc: IRenderFunc, fps = 60) {
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

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas.getContext('2d', { willReadFrequently: true });
}
