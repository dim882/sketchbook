import { VNode } from 'snabbdom';

declare namespace JSX {
  interface Element extends VNode {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
