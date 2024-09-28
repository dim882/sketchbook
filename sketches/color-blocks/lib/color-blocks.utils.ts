export type Rectangle = [number, number, number, number];

export const rect = (width: number, height = width): Rectangle => {
  return [0, 0, width, height];
};

export const dimensions = (rect: Rectangle) => ({
  width: rect[2],
  height: rect[3],
});
