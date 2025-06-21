// Shared function to load a sketch into the iframe

export function loadSketch(sketchName: string) {
  const iframe = document.querySelector('iframe[name="sketchFrame"]') as HTMLIFrameElement;
  if (iframe) {
    iframe.src = `/sketches/${sketchName}`;
  }
}
// Function to update URL and load sketch
export function navigateToSketch(sketchName: string) {
  // Update URL without page reload
  const newUrl = `/nav/${sketchName}`;
  window.history.pushState({ sketchName }, '', newUrl);

  // Load the sketch
  loadSketch(sketchName);
}
