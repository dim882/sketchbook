import { captureAudioStream, getAudioDevices, resizeCanvas, saveAndRestore } from './sinewaves.utils.js';
import { IPointTuple, loop } from './utils.js';

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

  loop(context, render, 60);

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

    drawWave(context, {
      width,
      yOffset: center[1] - 100,
      time: t,
      color: 'hsl(244, 89%, 69%)',
    });

    drawWave(context, {
      width,
      yOffset: center[1] + 100,
      time: -t + 100,
      color: 'hsl(15, 76%, 56%, .8)',
    });
  }

  function drawWave(
    context: CanvasRenderingContext2D,
    options: {
      width: number;
      yOffset: number;
      time: number;
      color: string;
    }
  ) {
    saveAndRestore(context, () => {
      context.strokeStyle = options.color;
      context.translate(0, options.yOffset);

      for (let x = 0; x < options.width + 100; x += 50) {
        const y1 = Math.sin(x * 0.005 + options.time * 0.01) * 150;
        const y2 = Math.cos(x * 0.005 + options.time * 0.007) * 150;

        context.beginPath();
        context.moveTo(x, y1);
        context.lineTo(x, y2);
        context.stroke();
      }
    });
  }
};
