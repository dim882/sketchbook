import { createComponent } from './createComponent.base';

export function createDecoratedComponent<AttributeNames extends string[], State>({
  render,
  css,
  cssPath,
  attributes,
  mapAttributesToState,
  shadowDomSettings = {
    mode: 'closed',
    delegatesFocus: true,
  },
}: {
  render: string | ((params: State) => string);
  css?: string;
  cssPath?: string;
  attributes?: AttributeNames;
  mapAttributesToState?: (attributes: Record<AttributeNames[number], string>, state: State) => State;
  shadowDomSettings?: ShadowRootInit;
}) {
  type Attributes = Record<AttributeNames[number], string>;

  let shadowRoot: ShadowRoot;
  let state: State;

  return createComponent({
    attributes,
    constructor(element) {
      shadowRoot = element.attachShadow(shadowDomSettings);
    },
    connectedCallback: async () => {
      const content = typeof render === 'function' ? render(state) : render;

      shadowRoot.innerHTML = content;

      await applyCss(shadowRoot, cssPath, css);
    },
    attributeChangedCallback: (element) => {
      if (mapAttributesToState) {
        const newState = mapAttributesToState(getAttributes(element), state);

        setState(newState);
      }
    },
  });

  function setState(newState: State) {
    state = {
      ...state,
      ...newState,
    };
  }

  function getAttributes(component: HTMLElement): Attributes {
    return Object.fromEntries(
      component.getAttributeNames().map((attrName) => {
        return [attrName, component.getAttribute(attrName)];
      })
    ) as Attributes;
  }
}

async function applyCss(dom: ShadowRoot, cssPath: string, css: string) {
  const style = document.createElement('style');

  dom.appendChild(style);

  style.textContent = cssPath ? await loadCss(cssPath) : css;
}

async function loadCss(cssFilePath: string) {
  console.log('loading ', cssFilePath);

  try {
    const response = await fetch(cssFilePath);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to fetch CSS:', error);
  }
}
