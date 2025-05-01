import { render } from 'preact';
import ColorPicker from './ColorPicker/ColorPicker';
window.addEventListener('DOMContentLoaded', () => {
  const App = () => {
    const handleColorChange = (color: string) => {
      console.log({ color });
    };
    return <ColorPicker onChange={handleColorChange} lch={[60, 140, 10]} />;
  };

  render(<App />, document.getElementById('app'));
});
