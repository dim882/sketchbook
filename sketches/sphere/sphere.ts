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
  const center: IPointTuple = [width / 2, height / 2];

  const radius = Math.min(width, height) * 0.3;
  const [centerX, centerY] = center;

  const gradient = context.createRadialGradient(
    centerX - radius * 0.5, // Light source offset (top-left)
    centerY - radius * 0.5,
    0,
    centerX,
    centerY,
    radius
  );

  gradient.addColorStop(0, '#ffffff'); // Bright highlight
  gradient.addColorStop(0.3, '#f0f0f0'); // Light area
  gradient.addColorStop(0.6, '#d0d0d0'); // Mid-tone
  gradient.addColorStop(0.8, '#a0a0a0'); // Shadow area
  gradient.addColorStop(1, '#606060'); // Dark shadow

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();

  // Add a subtle outline for definition
  context.strokeStyle = '#404040';
  context.lineWidth = 1;
  context.stroke();
}
