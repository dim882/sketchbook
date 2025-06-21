import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { navigateToSketch } from './NavUtils';

console.log('fooooo');

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
