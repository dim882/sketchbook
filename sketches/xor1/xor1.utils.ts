export type IPointTuple = [number, number];

export function createOffscreenCanvas(width: number, height: number) {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  const offscreenContext = offscreenCanvas.getContext('2d');
  return { offscreenContext, offscreenCanvas };
}

export function drawConcentricRings(
  context: CanvasRenderingContext2D,
  center: IPointTuple,
  maxRadius: number,
  ringWidth: number,
  ringSpacing: number
) {
  for (let radius = ringWidth; radius <= maxRadius; radius += ringWidth + ringSpacing) {
    context.beginPath();
    context.arc(center[0], center[1], radius, 0, Math.PI * 2);
    context.lineWidth = ringWidth;
    context.strokeStyle = 'black';
    context.stroke();
  }
}

export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;
export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  let frameDuration = 1000 / fps;
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
