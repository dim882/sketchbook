import { h, hydrate } from 'preact';
import SketchList, { IDir } from './SketchList';
import { loadSketch } from './NavUtils';

declare global {
  interface Window {
    __INITIAL_DATA__: {
      dirs: IDir[];
      initialSketch: string | null;
    };
  }
}

const initialData = window.__INITIAL_DATA__;

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.sketchName) {
    loadSketch(event.state.sketchName);
  } else {
    // If no sketch in state, clear the iframe
    const iframe = document.querySelector('iframe[name="sketchFrame"]') as HTMLIFrameElement;

    if (iframe) {
      iframe.src = 'about:blank';
    }
  }
});

// Load initial sketch if provided
if (initialData.initialSketch) {
  loadSketch(initialData.initialSketch);
}

hydrate(<SketchList dirs={initialData.dirs} />, document.getElementById('sketchList') as HTMLElement);
