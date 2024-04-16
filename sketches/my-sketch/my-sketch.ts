document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  render(ctx);
};

function render(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
}
