document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  render(ctx);
};

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;
  //  Do work here
  context.fillStyle = 'red';
  context.save();
  context.translate(width / 4, height / 4);
  context.fillRect(0, 0, width / 2, height / 2);
  context.restore();
}
