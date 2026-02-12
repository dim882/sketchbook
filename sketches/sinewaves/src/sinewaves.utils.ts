export type IPointTuple = [number, number];

export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let t = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;

    lastFrameTime = time;

    render(context, t);
    t++;
  }

  requestAnimationFrame(animate);
}

export function drawWave(
  context: CanvasRenderingContext2D,
  options: {
    width: number;
    yOffset: number;
    time: number;
    color: string;
  }
) {
  saveAndRestore(context, () => {
    context.strokeStyle = options.color;
    context.translate(0, options.yOffset);

    for (let x = 0; x < options.width + 100; x += 50) {
      const y1 = Math.sin(x * 0.005 + options.time * 0.01) * 150;
      const y2 = Math.cos(x * 0.005 + options.time * 0.007) * 150;

      context.beginPath();
      context.moveTo(x, y1);
      context.lineTo(x, y2);
      context.stroke();
    }
  });
}
