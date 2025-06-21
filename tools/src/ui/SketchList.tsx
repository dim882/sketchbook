import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

export interface IDir {
  name: string;
  lastModified: number;
}

export interface SketchListProps {
  dirs: IDir[];
}

type SortMethod = 'recent' | 'alpha';

function sortBy(sortMethod: string): (a: IDir, b: IDir) => number {
  return (a, b) => (sortMethod === 'recent' ? b.lastModified - a.lastModified : a.name.localeCompare(b.name));
}

// Shared function to load a sketch into the iframe
export function loadSketch(sketchName: string) {
  const iframe = document.querySelector('iframe[name="sketchFrame"]') as HTMLIFrameElement;
  if (iframe) {
    iframe.src = `/sketches/${sketchName}`;
  }
}

// Function to update URL and load sketch
function navigateToSketch(sketchName: string) {
  // Update URL without page reload
  const newUrl = `/nav/${sketchName}`;
  window.history.pushState({ sketchName }, '', newUrl);

  // Load the sketch
  loadSketch(sketchName);
}

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => {
  const [sortMethod, setSortMethod] = useState<SortMethod>('alpha');
  const handleSort = (method: SortMethod) => () => setSortMethod(method);

  const handleSketchClick = (sketchName: string) => (e: Event) => {
    e.preventDefault();
    navigateToSketch(sketchName);
  };

  return (
    <div class="list">
      <h1>Sketches</h1>

      <button onClick={handleSort('alpha')}>Alphabetical</button>
      <button onClick={handleSort('recent')}>Recent</button>

      <ul>
        {dirs.sort(sortBy(sortMethod)).map((dir) => (
          <li key={dir.name}>
            <a href={`/nav/${dir.name}`} onClick={handleSketchClick(dir.name)}>
              {dir.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SketchList;
