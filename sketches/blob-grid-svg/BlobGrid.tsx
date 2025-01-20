import { JSX } from 'preact/jsx-runtime';
import { useState, useEffect } from 'preact/hooks';
import { createGrid, getInteger, createPRNG } from './blob-grid-svg.utils';
import { createNoise2D } from 'simplex-noise';

type IDimensions = {
  width: number;
  height: number;
};

const prng = createPRNG(0);

const getNoise = createNoise2D(prng);

function App(): JSX.Element {
  const [dimensions, setDimensions] = useState<IDimensions>({ width: 0, height: 0 });
  const [scrollY, setScrollY] = useState(0);
  const formHue = getInteger(prng, 0, 270);
  const backgroundHue = formHue + 180;
  const backgroundColor = `lch(95% 40% ${backgroundHue})`;
  const fillColor = `lch(40% 50% ${formHue})`;
  const CELL_SIZE = 100;
  const SIZE_LIMIT = 120;
  const NOISE_SCALE = 0.001;

  const grid = createGrid(dimensions.width, dimensions.height, CELL_SIZE);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  console.log(scrollY);

  return (
    <div class="blobs">
      {grid.map((point) => {
        const size = getNoise(point[0] * NOISE_SCALE, point[1] * NOISE_SCALE) * 200;

        const style = {
          left: point[0],
          top: point[1],
          width: size > SIZE_LIMIT ? SIZE_LIMIT : size,
          height: size > SIZE_LIMIT ? SIZE_LIMIT : size,
          backgroundColor: `rgba(100, 100, 100 )`,
          display: size > 0 ? 'block' : 'none',
        };

        return (
          <div class="blob" style={style}>
            {/* {size.toString().substring(0, 4)} */}
          </div>
        );
      })}
    </div>
  );
}

export default App;
