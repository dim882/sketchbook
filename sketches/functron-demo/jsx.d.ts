declare namespace JSX {
  interface Element {
    sel: string;
    data: any;
    children: Array<Element | string>;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
