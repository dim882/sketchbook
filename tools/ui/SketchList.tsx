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

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => {
  const [sortMethod, setSortMethod] = useState<SortMethod>('alpha');
  const handleRecentSort = () => setSortMethod('recent');
  const handleAlphaSort = () => setSortMethod('alpha');

  const sortedDirs = [...dirs].sort((a, b) =>
    sortMethod === 'recent' ? b.lastModified - a.lastModified : a.name.localeCompare(b.name)
  );

  return (
    <div class="list">
      <h1>Sketches</h1>
      <button onClick={handleRecentSort} class={sortMethod === 'recent' ? 'active' : ''}>
        Recent
      </button>
      <button onClick={handleAlphaSort} class={sortMethod === 'alpha' ? 'active' : ''}>
        Alphabetical
      </button>
      <ul>
        {sortedDirs.map((dir) => (
          <li key={dir.name}>
            <a href={`/sketches/${dir.name}`} target="sketchFrame">
              {dir.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SketchList;
