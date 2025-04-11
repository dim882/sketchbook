/** @jsx jsx */
import { createComponent, EventHandler, jsx, RenderFunc } from 'functron';
import { getPalette, IPalette } from './palettes/personal-site';
import './color-grid.css';

interface ICounterModel {
  count: number;
  palette: IPalette;
}

const initialModel: ICounterModel = {
  count: 0,
  palette: getPalette(),
};

const incrementCounter: EventHandler<ICounterModel, MouseEvent> = (event, model) => ({
  ...model,
  count: model.count + 1,
});

const handlers = {
  incrementCounter,
};

const render: RenderFunc<ICounterModel, typeof handlers> = ({ count, palette }, {}) => (
  <div>
    <div>{count}</div>
    <div className="color-grid-container">
      {Object.entries(palette).map(([colorName, colorValues]) => (
        <div key={colorName} className="color-category">
          <h3 className="color-category-title">{colorName}</h3>
          <div className="color-swatches">
            {colorValues.map((color, index) => (
              <div
                key={`${colorName}-${index}`}
                className={`color-swatch ${index < 4 ? 'light-text' : 'dark-text'}`}
                style={{ backgroundColor: color }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ColorGrid = createComponent<[], ICounterModel, typeof handlers, typeof render>({
  initialModel,
  handlers,
  render,
  cssPath: './palettes/dist/color-grid.css',
});

export default ColorGrid;
