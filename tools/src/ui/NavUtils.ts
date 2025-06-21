export function loadSketch(sketchName: string) {
  const iframe = document.querySelector('iframe[name="sketchFrame"]') as HTMLIFrameElement;

  if (iframe) {
    iframe.src = `/sketches/${sketchName}`;
  }
}

export function navigateToSketch(sketchName: string) {
  window.history.pushState({ sketchName }, '', `/nav/${sketchName}`);

  loadSketch(sketchName);
}
