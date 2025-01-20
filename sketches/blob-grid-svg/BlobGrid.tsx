import { JSX } from 'preact/jsx-runtime';
import { useState, useEffect } from 'preact/hooks';
import { createGrid, getInteger, createPRNG } from './blob-grid-svg.utils';
import { createNoise2D } from 'simplex-noise';

type IDimensions = {
  width: number;
  height: number;
};

const prng = createPRNG(0);

function App(): JSX.Element {
  const [dimensions, setDimensions] = useState<IDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  console.log(dimensions);

  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;

  const backgroundColor = `lch(95% 40% ${backgroundHue})`;
  const fillColor = `lch(40% 50% ${formHue})`;

  const CELL_SIZE = 250;
  const RADIUS = 100;

  const grid = createGrid(dimensions.width, dimensions.height, CELL_SIZE);
  console.log(grid);

  return (
    <div class="blobs">
      {grid.map((point) => (
        <div class="blob" style={{ left: point[0], top: point[1] }}></div>
      ))}
    </div>
  );
}

export default App;
