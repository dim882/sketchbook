export function getElement<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K][];
export function getElement(selector: string): HTMLElement[];
export function getElement(selector: string) {
  return Array.from(document.querySelectorAll(selector));
}

export function setup(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // Document has already loaded
    callback();
  }
}
