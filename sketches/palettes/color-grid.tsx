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
    <div class={{ 'color-grid-container': true }}>
      {Object.entries(palette).map(([colorName, colorValues]) => (
        <div key={colorName} class={{ 'color-category': true }}>
          <h3 class={{ 'color-category-title': true }}>{colorName}</h3>
          <div class={{ 'color-swatches': true }}>
            {colorValues.map((color, index) => (
              <div
                key={`${colorName}-${index}`}
                class={{
                  'color-swatch': true,
                  'light-text': index < 4,
                  'dark-text': index >= 4,
                }}
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
