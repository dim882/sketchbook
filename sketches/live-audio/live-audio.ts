import { captureAudioStream, getAudioDevices, loop, IRenderFunc, createWaveformRenderer } from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#000000'];

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

  const audioDevices = await getAudioDevices('ES-9');
  const audioContext = new AudioContext();
  const waveRenderers = await Promise.all(
    audioDevices.map(async (device, i) => {
      const stream = await captureAudioStream(device.deviceId);

      return createWaveformRenderer(audioContext, stream, colors[i]);
    })
  );

  const render: IRenderFunc = (canvasContext, t) => {
    const { width, height } = canvasContext.canvas;

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.save();
    canvasContext.translate(0, -height / 3);
    waveRenderers.forEach((renderWave, i) => {
      canvasContext.save();
      canvasContext.translate(0, (height / 4) * i);
      renderWave(canvasContext, t);
      canvasContext.restore();
    });
    canvasContext.restore();
  };

  loop(context, render, 60);
});
