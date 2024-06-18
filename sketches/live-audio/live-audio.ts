import {
  captureAudioStream,
  createAnalyser,
  getAudioDevices,
  renderWaveform,
  setupAudioContext,
  loop,
  IRenderFunc,
} from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('ES-9');
  console.log({ audioDevices });

  audioDevices.map((device) => {});
  const deviceId = 'cfb9b5a09ecdbe210d3277457cb76ffcc83dca38555bd88b97982a333266df20';
  const stream = await captureAudioStream(deviceId);

  const renderWave = createWaveformRenderer(stream, '#ff0000');

  const render: IRenderFunc = (canvasContext, t) => {
    const { width, height } = canvasContext.canvas;

    canvasContext.clearRect(0, 0, width, height);
    renderWave(canvasContext, t);
  };

  loop(context, render, 60);
});

function createWaveformRenderer(stream: MediaStream, color: string) {
  const { audioContext, sourceNode } = setupAudioContext(stream);
  const analyser = createAnalyser(audioContext);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  sourceNode.connect(analyser);

  return (context: CanvasRenderingContext2D, _t: number) => {
    analyser.getByteTimeDomainData(dataArray);

    renderWaveform(context, dataArray, color);
  };
}
