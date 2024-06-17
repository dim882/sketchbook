import {
  captureAudioStream,
  createAnalyser,
  getAudioDevices,
  renderWaveform,
  setupAudioContext,
} from './live-audio.utils.js';
import { IPointTuple, loop } from './utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('ES-9');
  console.log({ audioDevices });

  // loop(context, render, 60);
  startRenderingWaveformForDevice(context, 'cfb9b5a09ecdbe210d3277457cb76ffcc83dca38555bd88b97982a333266df20');
});

async function startRenderingWaveformForDevice(
  canvasContext: CanvasRenderingContext2D,
  deviceId: string
): Promise<void> {
  const stream = await captureAudioStream(deviceId);
  const { audioContext, sourceNode } = setupAudioContext(stream);
  const analyser = createAnalyser(audioContext);
  sourceNode.connect(analyser);

  // Closure to encapsulate waveform data fetching and rendering
  const renderFunction = (context: CanvasRenderingContext2D, _t: number) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    renderWaveform(context, dataArray);
  };

  // Integrate with the existing animation loop
  loop(canvasContext, renderFunction, 60); // Assuming 60 FPS
}
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
    const audioBuffer = await createAudioBuffer(audioElement, audioContext);

    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

    console.log('Audio started playing');
  } catch (error) {
    console.error('Error playing audio:', error);
  }
  return source;
};

async function createAudioBuffer(audioElement: HTMLAudioElement, audioContext: AudioContext) {
  const track = await fetch(audioElement.src);
  const arrayBuffer = await track.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}
