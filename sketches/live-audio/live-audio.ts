import {
  captureAudioStream,
  getAudioDevices,
  loop,
  IRenderFunc,
  createWaveformRenderer,
  saveAndRestore,
  translateY,
} from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const canvasContext = canvas.getContext('2d');
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#000000'];

  if (!canvasContext) return;

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

  const audioDevices = await getAudioDevices('QuickTime');
  console.log(audioDevices);

  const audioContext = new AudioContext();

  const waveRenderers = await Promise.all(
    audioDevices.map(async (device, i) =>
      // prettier-ignore
      createWaveformRenderer(
        audioContext, 
        await captureAudioStream(device.deviceId), 
        colors[i]
      )
    )
  );

  const render: IRenderFunc = (canvasContext, t) => {
    const { width, height } = canvasContext.canvas;

    canvasContext.clearRect(0, 0, width, height);

    translateY(canvasContext, -height / 3, () => {
      waveRenderers.forEach((renderWave, i) => {
        // prettier-ignore
        translateY(
          canvasContext, 
          (height / 4) * i, 
          () => renderWave(canvasContext, t)
        );
      });
    });
  };

  loop(canvasContext, render, 60);
});
