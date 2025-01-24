import { h, FunctionComponent } from 'preact';

interface SketchListProps {
  dirs: string[];
}

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => {
  return (
    <div class="list">
      <h1>Sketches</h1>
      <button></button>
      <ul>
        {dirs.map((dir) => (
          <li key={dir}>
            <a href={`/sketches/${dir}`} target="sketchFrame">
              {dir}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SketchList;
