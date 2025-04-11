export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

import Counter from './counter';

customElements.define('ui-counter', Counter);

console.log('hi!!');
