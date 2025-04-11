/** @jsx jsx */
import { createComponent, EventHandler, jsx, RenderFunc } from 'functron';

interface ICounterModel {
  count: number;
}

const initialModel: ICounterModel = { count: 0 };

const incrementCounter: EventHandler<ICounterModel, MouseEvent> = (event, model) => ({
  ...model,
  count: model.count + 1,
});

const handlers = {
  incrementCounter,
};

const render: RenderFunc<ICounterModel, typeof handlers> = ({ count }, { incrementCounter }) => (
  <div>
    <button on={{ click: incrementCounter }}>Add 1??</button>
    <div>{count}</div>
  </div>
);

const ColorGrid = createComponent<[], ICounterModel, typeof handlers, typeof render>({
  initialModel,
  handlers,
  render,
});

export default ColorGrid;
