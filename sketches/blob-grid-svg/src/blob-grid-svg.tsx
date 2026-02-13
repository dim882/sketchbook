import { render } from 'preact';
import BlobGrid from './BlobGrid.js';

window.addEventListener('DOMContentLoaded', () => {
  render(<BlobGrid />, document.getElementById('app') as Element);
});
