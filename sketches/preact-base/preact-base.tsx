import { render } from 'preact';
import App from './App';

console.log('hello!!!??');

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.getElementById('app'));
});
