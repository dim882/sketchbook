import { JSX } from 'preact/jsx-runtime';
import { useState, useEffect } from 'preact/hooks';
import { createGrid, createPRNG } from './blob-grid-svg.utils';
import { createNoise3D } from 'simplex-noise';

type IDimensions = {
  width: number;
  height: number;
};

const prng = createPRNG(0);

const getNoise = createNoise3D(prng);

function App(): JSX.Element {
  const [dimensions, setDimensions] = useState<IDimensions>({ width: 0, height: 0 });
  const [wheelPosition, setWheelPosition] = useState(0);
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
    const handleWheel = (event: WheelEvent) => {
      setWheelPosition((prevPosition) => prevPosition + event.deltaY);
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  console.log(wheelPosition);

  return (
    <div class="blobs">
      {grid.map((point) => {
        const noise = getNoise(point[0] * NOISE_SCALE, point[1] * NOISE_SCALE, wheelPosition * NOISE_SCALE * 0.1) * 175;

        const style = {
          left: point[0],
          top: point[1],
          width: noise > SIZE_LIMIT ? SIZE_LIMIT : noise,
          height: noise > SIZE_LIMIT ? SIZE_LIMIT : noise,
          // backgroundColor: `rgba(100, 100, 100 )`,
          display: noise > 0 ? 'block' : 'none',
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
