import { captureAudioStream, drawWave, getAudioDevices, resizeCanvas, saveAndRestore } from './sinewaves.utils.js';
import { IPointTuple, loop } from './utils.js';

document.body.onload = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('VCV');
  const audioContext = new AudioContext();

  console.log(audioDevices);

  const renderers = await Promise.all(
    audioDevices.map(async (device, i) => {
      const audioStream = await captureAudioStream(device.deviceId);
      console.log(audioStream);
    })
  );

  function render(context: CanvasRenderingContext2D, t: number) {
    const { width, height } = context.canvas;
    const center: IPointTuple = [width / 2, height / 2];

    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    context.lineWidth = 30;
    context.lineCap = 'round';

    saveAndRestore(context, () => {
      context.strokeStyle = 'hsl(244, 89%, 69%)';
      context.translate(0, center[1] - 100);
      context.beginPath();
      drawWave(width, t, context);
      context.stroke();
    });

    saveAndRestore(context, () => {
      context.strokeStyle = 'hsl(15, 76%, 56%, .8)';
      context.translate(0, center[1] + 100);
      context.beginPath();
      drawWave(width, -t + 100, context);
      context.stroke();
    });
  }

  if (context) {
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));
    loop(context, render, 60);
  }
};
