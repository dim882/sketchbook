import {
  captureAudioStream,
  createAnalyser,
  getAudioDevices,
  renderWaveform,
  loop,
  IRenderFunc,
} from './live-audio.utils.js';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  const audioDevices = await getAudioDevices('ES-9');
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#000000'];

  const audioContext = new AudioContext();

  const waveRenderers = await Promise.all(
    audioDevices.map(async (device, i) => {
      const stream = await captureAudioStream(device.deviceId);
      const renderWave = createWaveformRenderer(audioContext, stream, colors[i]);

      return renderWave;
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

function createWaveformRenderer(audioContext: AudioContext, stream: MediaStream, color: string) {
  const getDataArray = createGetDataArray(audioContext, stream);

  return (context: CanvasRenderingContext2D, _t: number) => {
    renderWaveform(context, getDataArray(), color);
  };
}

function createGetDataArray(audioContext: AudioContext, stream: MediaStream) {
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyser = createAnalyser(audioContext);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  sourceNode.connect(analyser);

  return () => {
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  };
}
