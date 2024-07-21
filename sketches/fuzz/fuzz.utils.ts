export type PseudoRandomNumberGenerator = () => number;
export type IPointTuple = [number, number];

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const addEvent = (eventName: string, handler: (e: CustomEvent) => void) => (el: Element) => {
  el.addEventListener(eventName, handler);
  return el;
};

export const log =
  <T>(tag: string) =>
  (val: T) => (console.log(tag, val), val);
