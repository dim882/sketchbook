import {
  captureAudioStream,
  createAnalyser,
  getAudioDevices,
  renderWaveform,
  setupAudioContext,
  loop,
} from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('ES-9');
  console.log({ audioDevices });

  audioDevices.forEach((device) => {});
  const deviceId = 'cfb9b5a09ecdbe210d3277457cb76ffcc83dca38555bd88b97982a333266df20';
  const stream = await captureAudioStream(deviceId);
  startRenderingWaveformForDevice(context, stream);
});

async function startRenderingWaveformForDevice(
  canvasContext: CanvasRenderingContext2D,
  stream: MediaStream
): Promise<void> {
  const { audioContext, sourceNode } = setupAudioContext(stream);
  const analyser = createAnalyser(audioContext);
  sourceNode.connect(analyser);

  const renderFunction = (context: CanvasRenderingContext2D, _t: number) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    renderWaveform(context, dataArray);
  };

  loop(canvasContext, renderFunction, 60); // Assuming 60 FPS
}
