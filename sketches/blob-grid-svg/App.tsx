import { JSX } from 'preact/jsx-runtime';
import { useState, useEffect } from 'preact/hooks';

function App(): JSX.Element {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  return (
    <div class="blobs">
      <div class="blob"></div>
      <div class="blob"></div>
      <div class="blob"></div>
      <div class="blob"></div>
    </div>
  );
}

export default App;
