/** @jsx jsx */
import { createComponent, EventHandler, jsx, RenderFunc } from 'functron';
import { getPalette, IPalette } from './palettes/personal-site';

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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '0',
        padding: '16px',
      }}
    >
      {Object.entries(palette).map(([colorName, colorValues]) => (
        <div key={colorName}>
          <h3 style={{ margin: '0 0 8px 0' }}>{colorName}</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0',
            }}
          >
            {colorValues.map((color, index) => (
              <div
                key={`${colorName}-${index}`}
                style={{
                  backgroundColor: color,
                  height: '32px',
                  borderRadius: '0',
                }}
              ></div>
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
});

export default ColorGrid;
