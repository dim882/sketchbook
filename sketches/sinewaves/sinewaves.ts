import {
  captureAudioStream,
  createWaveformRenderer,
  drawWave,
  getAudioDevices,
  make_getTimeData,
  resizeCanvas,
  saveAndRestore,
} from './sinewaves.utils.js';
import { IPointTuple, loop } from './utils.js';

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const powerOfTwo = (n: number): number => {
  return Math.pow(2, Math.ceil(Math.log2(n)));
};

document.body.onload = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('VCV');
  const audioContext = new AudioContext();

  console.log(audioDevices);

  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));

  const renderers = await Promise.all(
    audioDevices.map(async (device, i) => {
      const audioStream = await captureAudioStream(device.deviceId);
      const getTimeData = make_getTimeData(audioContext, audioStream, powerOfTwo(clamp(canvas.width / 50, 32, 2046)));

      return createWaveformRenderer(context, getTimeData);
    })
  );

  console.log(renderers);

  function render(context: CanvasRenderingContext2D, t: number) {
    const { width, height } = context.canvas;
    const center: IPointTuple = [width / 2, height / 2];

    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    context.lineWidth = 30;
    context.lineCap = 'round';

    renderers[1]('hsl(244, 89%, 69%)');
  }

  loop(context, render, 60);
};
