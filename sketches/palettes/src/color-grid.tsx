/** @jsx jsx */
import { createComponent, EventHandler, jsx, RenderFunc } from 'functron';
import { getPalette, IPalette } from './palettes/personal-site';
import './color-grid.css';

interface ICounterModel {
  palette: IPalette;
  copiedColor: string | null;
}

const initialModel: ICounterModel = {
  palette: getPalette(),
  copiedColor: null,
};

console.log(getPalette());

const copyToClipboard: EventHandler<ICounterModel, MouseEvent> = (event, model) => {
  console.log(model);

  const color = '';
  navigator.clipboard
    .writeText(color)
    .then(() => {
      return { ...model, copiedColor: color };
    })
    .catch((err) => {
      console.error('Failed to copy color: ', err);
      return model;
    });

  return model;
};

const handlers = { copyToClipboard };

const render: RenderFunc<ICounterModel, typeof handlers> = ({ palette, copiedColor }, { copyToClipboard }) => {
  return (
    <div class={{ 'color-grid-container': true }}>
      {Object.entries(palette).flatMap(([colorName, colorValues]) => [
        <div class={{ 'color-name': true }}>{colorName}</div>,
        ...colorValues.map((color, index) => (
          <div
            key={`${colorName}-${index}`}
            class={{
              'color-swatch': true,
              'dark-text': index < 4,
              'light-text': index >= 4,
              copied: copiedColor === color,
            }}
            style={{ backgroundColor: color }}
            on={{
              click: (event, model) => {
                console.log({ color });
                navigator.clipboard
                  .writeText(color)
                  .then(() => {
                    return { ...model, copiedColor: color };
                  })
                  .catch((err) => {
                    console.error('Failed to copy color: ', err);
                    return model;
                  });
              },
            }}
          >
            {copiedColor === color ? 'Copied!' : color}
          </div>
        )),
      ])}
    </div>
  );
};

const ColorGrid = createComponent<[], ICounterModel, typeof handlers, typeof render>({
  initialModel,
  handlers,
  render,
  cssPath: './palettes/dist/color-grid.css',
});

export default ColorGrid;
