import { h, render } from 'preact';
import Dataview from './Dataview/Dataview';

window.addEventListener('DOMContentLoaded', () => {
  const App = () => {
    return (
      <div>
        <Dataview />
      </div>
    );
  };

  render(<App />, document.getElementById('app'));
});
