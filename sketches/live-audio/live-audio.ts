import {
  captureAudioStream,
  createAnalyser,
  getAudioDevices,
  renderWaveform,
  setupAudioContext,
} from './live-audio.utils.js';
import { loop } from './utils.js';

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
