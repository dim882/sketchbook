import { h, render } from 'preact';

window.addEventListener('DOMContentLoaded', () => {
  const App = () => {
    return <div>dataview</div>;
  };

  render(<App />, document.getElementById('app'));
});
