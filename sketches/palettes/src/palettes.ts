export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

import ColorGrid from './color-grid';

customElements.define('sk-color-grid', ColorGrid);
