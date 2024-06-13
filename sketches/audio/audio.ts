import { IPointTuple, loop } from './utils.js';

document.body.onload = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  const audioElement = document.getElementById('audioElement') as HTMLAudioElement;

  document.getElementById('transport').addEventListener('change', (e: CustomEvent) => {
    const command = e.detail.value;
    let source: AudioBufferSourceNode;

    switch (command) {
      case 'play':
        const audioContext = new AudioContext();
        source = audioContext.createBufferSource();
        playAudio(audioContext, source, audioElement).catch(console.error);

        break;

      case 'pause':
        source.stop();

      default:
        break;
    }
  });

  // loop(context, render, 60);
};

function render(context: CanvasRenderingContext2D, t: number) {
  const { width, height } = context.canvas;
  const center: IPointTuple = [width / 2, height / 2];

  const radius = Math.floor(Math.abs(Math.sin(t * 0.05) * 100));

  context.clearRect(0, 0, width, height);

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  context.beginPath();
  context.arc(...center, radius, 0, 2 * Math.PI);
  context.fillStyle = 'red';
  context.fill();
}

const playAudio = async (audioContext: AudioContext, source: AudioBufferSourceNode, audioElement: HTMLAudioElement) => {
  try {
    const track = await fetch(audioElement.src);
    const arrayBuffer = await track.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

    console.log('Audio started playing');
  } catch (error) {
    console.error('Error playing audio:', error);
  }
  return source;
};

function getAudioObjects() {
  return { audioContext, source };
}
