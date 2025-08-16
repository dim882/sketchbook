export interface IPoint {
  x: number;
  y: number;
}

export interface IVector {
  x: number;
  y: number;
}

export interface IGrid {
  cols: number;
  rows: number;
  cellSize: number;
}

export interface IGridPosition {
  col: number;
  row: number;
}

export interface IDirection {
  dx: number;
  dy: number;
}
