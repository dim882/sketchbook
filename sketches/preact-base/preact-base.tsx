import { render } from 'preact';
import App from './App';
import { useTransition } from 'preact/compat';

window.addEventListener('DOMContentLoaded', () => {
  render(<App />, document.getElementById('app') as Element);
});
