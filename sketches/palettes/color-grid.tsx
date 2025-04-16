/** @jsx jsx */
import { createComponent, jsx, RenderFunc } from 'functron';
import { getPalette, IPalette } from './palettes/personal-site';
import './color-grid.css';

interface ICounterModel {
  palette: IPalette;
}

const initialModel: ICounterModel = {
  palette: getPalette(),
};

const handlers = {};

const render: RenderFunc<ICounterModel> = ({ palette }, {}) => {
  return (
    <div class={{ 'color-grid-container': true }}>
      {Object.entries(palette).flatMap(([colorName, colorValues]) => [
        <div class={{ 'color-name': true }}>{colorName}</div>,
        ...colorValues.map((color, index) => (
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
        )),
      ])}
    </div>
  );
};

const ColorGrid = createComponent<[], ICounterModel, typeof handlers, typeof render>({
  initialModel,
  render,
  cssPath: './palettes/dist/color-grid.css',
});

export default ColorGrid;
