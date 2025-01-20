import { getInteger, createGrid } from './blob-grid-svg.utils.js';
import { render } from 'preact';
import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  //
});

function run(context) {
  const { width, height } = context.canvas;

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  const backgroundColor = `lch(95% 40% ${backgroundHue})`;
  const fillColor = `lch(40% 50% ${formHue})`;

  const CELL_SIZE = 250;
  const RADIUS = 100;

  const grid = createGrid(width, height, CELL_SIZE);
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded?!');

  render(<App />, document.getElementById('app') as Element);
});
