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
    <div class={styles.list}>
      <h1 class={styles.title}>Sketches</h1>

      <div class={styles.sortButtons}>
        <button
          class={`${styles.sortButton} ${sortMethod === 'alpha' ? styles.active : ''}`}
          onClick={handleSort('alpha')}
        >
          Alphabetical
        </button>
        <button
          class={`${styles.sortButton} ${sortMethod === 'recent' ? styles.active : ''}`}
          onClick={handleSort('recent')}
        >
          Recent
        </button>
      </div>

      <ul>
        {dirs.sort(sortBy(sortMethod)).map((dir) => (
          <li key={dir.name} class={styles.listItem}>
            <a href={`/nav/${dir.name}`} onClick={handleSketchClick(dir.name)} class={styles.link}>
              {dir.name}
            </a>
            &nbsp;
            <a href={`/sketches/${dir.name}`} target="_blank" rel="noopener noreferrer" class={styles.externalLink}>
              ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SketchList;
