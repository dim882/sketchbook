import { captureAudioStream, getAudioDevices, loop, IRenderFunc, createWaveformRenderer } from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const canvasContext = canvas.getContext('2d');
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#00000'];

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

  const audioDevices = await getAudioDevices('ES-9');
  const audioContext = new AudioContext();

  const waveRenderers = await Promise.all(
    audioDevices.map(async (device, i) =>
      createWaveformRenderer(audioContext, await captureAudioStream(device.deviceId), colors[i])
    )
  );

  const render: IRenderFunc = (canvasContext, t) => {
    const { width, height } = canvasContext.canvas;

    canvasContext.clearRect(0, 0, width, height);

    canvasContext.save();
    canvasContext.translate(0, -height / 3);

    waveRenderers.forEach((renderWave, i) => {
      // prettier-ignore
      translateY(
        canvasContext, 
        (height / 4) * i, 
        () => renderWave(canvasContext, t)
      );
    });

    canvasContext.restore();
  };

  loop(canvasContext, render, 60);
});

function translateY(canvasContext: CanvasRenderingContext2D, yTranslate: number, callback: () => void) {
  canvasContext.save();
  canvasContext.translate(0, yTranslate);
  callback();
  canvasContext.restore();
}
