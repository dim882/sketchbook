import { h, hydrate } from 'preact';
import SketchList from './SketchList';

// Assume we're passing the dirs data through a global variable
declare global {
  interface Window {
    __INITIAL_DATA__: { dirs: string[] };
  }
}

const initialData = window.__INITIAL_DATA__;

hydrate(<SketchList dirs={initialData.dirs} />, document.getElementById('sketchList') as HTMLElement);
