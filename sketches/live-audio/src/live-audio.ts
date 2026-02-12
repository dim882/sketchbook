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
  const audioDevices = await getAudioDevices('VCV');
  const audioContext = new AudioContext();

  console.log(audioDevices);

  const waveRenderers = await Promise.all(
    audioDevices.map(async (device, i) => {
      const audioStream = await captureAudioStream(device.deviceId);
      console.log(audioStream);

      return createWaveformRenderer(audioContext, audioStream, colors[i]);
    })
  );

  const render: IRenderFunc = (canvasContext, t) => {
    const { width, height } = canvasContext.canvas;

    canvasContext.clearRect(0, 0, width, height);

    // TODO: Change translations to  be based on the number of wave renderers
    translateY(canvasContext, -height / 3, () => {
      waveRenderers.forEach((renderWave, i) => {
        // prettier-ignore
        translateY(
          canvasContext, 
          (height / 4) * i, 
          () => renderWave(canvasContext)
        );
      });
    });
  };

  loop(canvasContext, render, 60);
});
