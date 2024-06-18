export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let t = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;

    lastFrameTime = time;

    render(context, t);
    t++;
  }

  requestAnimationFrame(animate);
}

export function getAudioDevices(labelPrefix: string) {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      return devices
        .filter((device) => device.label.match(`${labelPrefix}:`))
        .sort((a, b) => (a.label < b.label ? -1 : 0));
    })
    .then((devices) => {
      if (devices.length > 0) {
        return devices;
      } else {
        console.error(`${labelPrefix} device not found`);
        return [];
      }
    });
}

export async function captureAudioStream(deviceId: string): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      deviceId: { exact: deviceId },
    },
  });
}

function setupAudioContext(stream: MediaStream): {
  audioContext: AudioContext;
  sourceNode: MediaStreamAudioSourceNode;
} {
  const audioContext = new AudioContext();
  const sourceNode = audioContext.createMediaStreamSource(stream);
  return { audioContext, sourceNode };
}

export function createAnalyser(audioContext: AudioContext, fftSize = 2048): AnalyserNode {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;

  return analyser;
}

export function renderWaveform(ctx: CanvasRenderingContext2D, dataArray: Uint8Array, color = '#ff0000'): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);

  const sliceWidth = (width * 1.0) / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function createWaveformRenderer(audioContext: AudioContext, stream: MediaStream, color: string) {
  const getDataArray = createGetDataArray(audioContext, stream);

  return (context: CanvasRenderingContext2D, _t: number) => {
    renderWaveform(context, getDataArray(), color);
  };
}

export function createGetDataArray(audioContext: AudioContext, stream: MediaStream) {
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyser = createAnalyser(audioContext);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  sourceNode.connect(analyser);

  return () => {
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  };
}
