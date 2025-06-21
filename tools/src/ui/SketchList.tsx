import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { navigateToSketch } from './NavUtils';
import styles from './SketchList.module.css';

export interface IDir {
  name: string;
  lastModified: number;
}

export interface SketchListProps {
  dirs: IDir[];
  styles?: any; // For server-side rendering
}

type SortMethod = 'recent' | 'alpha';

function sortBy(sortMethod: string): (a: IDir, b: IDir) => number {
  return (a, b) => (sortMethod === 'recent' ? b.lastModified - a.lastModified : a.name.localeCompare(b.name));
}

const SketchList: FunctionComponent<SketchListProps> = ({ dirs, styles: serverStyles }) => {
  const [sortMethod, setSortMethod] = useState<SortMethod>('alpha');
  const handleSort = (method: SortMethod) => () => setSortMethod(method);

  const handleSketchClick = (sketchName: string) => (e: Event) => {
    e.preventDefault();
    navigateToSketch(sketchName);
  };

  // Use server styles if provided, otherwise use imported styles
  const classNames = serverStyles || styles;

  return (
    <div class={classNames.list}>
      <h1 class={classNames.title}>Sketches</h1>

      <div class={classNames.sortButtons}>
        <button
          class={`${classNames.sortButton} ${sortMethod === 'alpha' ? classNames.active : ''}`}
          onClick={handleSort('alpha')}
        >
          Alphabetical
        </button>
        <button
          class={`${classNames.sortButton} ${sortMethod === 'recent' ? classNames.active : ''}`}
          onClick={handleSort('recent')}
        >
          Recent
        </button>
      </div>

      <ul>
        {dirs.sort(sortBy(sortMethod)).map((dir) => (
          <li key={dir.name} class={classNames.listItem}>
            <a href={`/nav/${dir.name}`} onClick={handleSketchClick(dir.name)} class={classNames.link}>
              {dir.name}
            </a>
            &nbsp;
            <a href={`/sketches/${dir.name}`} target="_blank" rel="noopener noreferrer" class={classNames.externalLink}>
              ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SketchList;
