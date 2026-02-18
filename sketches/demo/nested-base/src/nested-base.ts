window.addEventListener('DOMContentLoaded', () => {
  const context = document.querySelector('canvas')?.getContext('2d');

  if (!context) {
    return;
  }

  render(context);
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  context.fillStyle = '#1a1a2e';
  context.fillRect(0, 0, width, height);

  const GRID_SIZE = 8;
  const cellW = width / GRID_SIZE;
  const cellH = height / GRID_SIZE;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const hue = ((row * GRID_SIZE + col) / (GRID_SIZE * GRID_SIZE)) * 360;
      const x = col * cellW + cellW / 2;
      const y = row * cellH + cellH / 2;
      const radius = Math.min(cellW, cellH) * 0.35;

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `hsl(${hue}, 70%, 60%)`;
      context.fill();
    }
  }
}
