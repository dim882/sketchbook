export interface ICreateComponentArgs<AttributeNames extends string[]> {
  constructor: (element: HTMLElement) => void;
  connectedCallback: (element: HTMLElement) => void;
  disconnectedCallback?: (element: HTMLElement) => void;
  attributeChangedCallback?: (element: HTMLElement, attrName: string, oldVal: string, newVal: string) => void;
  adoptedCallback?: (element: HTMLElement) => void;
  attributes?: AttributeNames;
}

export function createComponent<AttributeNames extends string[]>({
  attributes,
  constructor,
  connectedCallback,
  disconnectedCallback,
  attributeChangedCallback,
  adoptedCallback,
}: ICreateComponentArgs<AttributeNames>) {
  class Component extends HTMLElement {
    static get observedAttributes() {
      return attributes;
    }

    constructor() {
      console.log('--- constructor');

      super();
      constructor(this);
    }

    async connectedCallback() {
      console.log('--- connectedCallback');

      connectedCallback(this);
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
      console.log(`--- ?attributeChangedCallback: ${attrName}: from ${oldVal} to ${newVal}`);

      attributeChangedCallback(this, attrName, oldVal, newVal);
    }

    disconnectedCallback() {
      disconnectedCallback(this);
    }

    adoptedCallback() {
      adoptedCallback(this);
    }
  }

  return Component;
}
