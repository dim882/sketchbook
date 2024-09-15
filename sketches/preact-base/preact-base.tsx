import { h, render } from 'preact';
import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.getElementById('app'));
});
