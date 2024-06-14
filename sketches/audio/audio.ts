import { IPointTuple, loop } from './utils.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  const audioElement = document.getElementById('audioElement') as HTMLAudioElement;

  let audioContext: AudioContext;
  let track: MediaElementAudioSourceNode;
  let analyser: AnalyserNode;

  document.getElementById('transport').addEventListener('change', async (e: CustomEvent) => {
    const command = e.detail.value;

    audioContext = audioContext ? audioContext : new AudioContext();

    // track = track ? track : audioContext.createMediaElementSource(audioElement);
    analyser = analyser ? analyser : audioContext.createAnalyser();

    switch (command) {
      case 'play':
        audioElement.play();
        break;

      case 'pause':
        audioElement.pause();
        break;

      default:
        break;
    }
  });

  // loop(context, render, 60);
});

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
    source.start();

    console.log('Audio started playing');
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};
