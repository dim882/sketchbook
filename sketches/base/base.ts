document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  ctx.fillStyle = 'red';
  ctx.save();
  ctx.translate(width / 4, height / 4);
  ctx.fillRect(0, 0, width / 2, height / 2);
  ctx.restore();
};
