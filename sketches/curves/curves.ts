export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

const LINE_SPACE = 100;
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (context) {
    render(context);
  }
});

function render(context: CanvasRenderingContext2D) {
  const { width, height } = context.canvas;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.save();

  context.translate(0, height / 2);

  const myPalette = palette.orange.slice().reverse();

  // prettier-ignore
  for (
    let y = height, i = 0; 
    y > LINE_SPACE && i < myPalette.length; 
    y -= LINE_SPACE, i++
  ) {
    drawCurve(context, width, y, -y, myPalette[i]);
  }

  context.restore();
}

function drawCurve(context: CanvasRenderingContext2D, width: number, y1: number, y2: number, color: string) {
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(width / 3, y1, (width * 2) / 3, y2, width, 0);
  context.fillStyle = color;
  context.fill();
}

const palette = {
  red: ['#1f1514', '#3d2a29', '#633936', '#8f443d', '#b94f46', '#c27770', '#d19994', '#e8ccc9', '#f7eeed'],
  blue: ['#2e3538', '#454f54', '#67777e', '#6c8693', '#8a9ea8', '#a6b5bd', '#c7ced1', '#e3e6e8', '#f7f8f8'],
  yellow: ['#3b382b', '#585441', '#757057', '#938c6c', '#b2aa80', '#c2bda3', '#d4d1c4', '#e9e8e2', '#938c6c'],
  orange: ['#2e261f', '#604d39', '#8a6642', '#b98046', '#d6995c', '#d9b38c', '#e5ccb2', '#e8d9c9', '#faf5f0'],
  violet: ['#382e30', '#5c3d42', '#854752', '#ac5362', '#c76b7a', '#d1949e', '#debac0', '#eddee0', '#e8d9c9'],
  indigo: ['#18181b', '#303136', '#454654', '#67697e', '#8f90a3', '#abacba', '#c7c8d1', '#e3e3e8', '#f9f9fa'],
  green: ['#2e3832', '#45544b', '#5c7064', '#8aa896', '#a4c3b1', '#b6c9be', '#c7d1cb', '#e3e8e5', '#f6f8f7'],
};
