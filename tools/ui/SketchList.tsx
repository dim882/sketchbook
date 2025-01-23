import { h, FunctionComponent } from 'preact';

interface SketchListProps {
  dirs: string[];
}

const SketchList: FunctionComponent<SketchListProps> = ({ dirs }) => (
  <div class="list">
    <h1>Sketches</h1>
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

export default SketchList;
