import { IPointTuple } from './utils.js';

// const prng = createPRNG(40502);
const prng = Math.random;

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  const fps = 60;
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
};

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const radius = Math.abs(Math.sin(t) * 100);
  console.log(t, radius);

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.arc(...center, radius, 0, 2 * Math.PI);
  context.fillStyle = 'red';
  context.fill();
}
