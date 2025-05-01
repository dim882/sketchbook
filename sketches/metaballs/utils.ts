export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;
export type IPointTuple = [number, number];

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;

  let t = 0;
  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(context, t);
    t++;
  }

  requestAnimationFrame(animate);
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas.getContext('2d', { willReadFrequently: true });
}

async function fetchAudioFile(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  return await response.arrayBuffer();
}

async function setupAudio(arrayBuffer: ArrayBuffer, audioContext: AudioContext): Promise<AudioBufferSourceNode> {
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  return source;
}

function playAudio(source: AudioBufferSourceNode): void {
  source.start();
}

// Example usage
// const audioContext = new AudioContext();

// fetchAudioFile('path/to/your/audiofile.mp3')
//   .then((arrayBuffer) => setupAudio(arrayBuffer, audioContext))
//   .then((source) => playAudio(source))
//   .catch((error) => console.error('Error in audio processing pipeline:', error));
