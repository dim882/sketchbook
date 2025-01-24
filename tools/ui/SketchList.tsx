import { h, FunctionComponent } from 'preact';

export interface IDir {
  name: string;
  lastModified: number;
}

export interface SketchListProps {
  dirs: IDir[];
}

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => {
  console.log('SketchList');

  console.log(dirs);

  return (
    <div class="list">
      <h1>Sketches</h1>
      <button></button>
      <ul>
        {dirs.map((dir) => (
          <li key={dir}>
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
