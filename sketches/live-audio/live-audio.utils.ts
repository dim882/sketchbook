export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  const frameDuration = 1000 / fps;
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
      // console.table(devices.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0)));

      return devices
        .filter((device) => device.label.match(`${labelPrefix}`))
        .filter((device) => device.kind === 'audioinput')
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
      channelCount: 2,
      deviceId: { exact: deviceId },
    },
  });
}

export function createWaveformRenderer(audioContext: AudioContext, stream: MediaStream, color: string) {
  const getTimeData = make_getTimeData(audioContext, stream);

  return (context: CanvasRenderingContext2D) => renderWaveform(context, getTimeData(), color);
}

export function make_getTimeData(audioContext: AudioContext, stream: MediaStream, fftSize = 2048) {
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  analyser.fftSize = fftSize;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  sourceNode.connect(analyser);

  return () => {
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  };
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

export function translateY(canvasContext: CanvasRenderingContext2D, yTranslate: number, callback: () => void) {
  saveAndRestore(canvasContext, () => {
    canvasContext.translate(0, yTranslate);
    callback();
  });
}

export function renderWaveform(context: CanvasRenderingContext2D, dataArray: Uint8Array, color = '#ff0000'): void {
  const { width, height } = context.canvas;

  context.beginPath();
  context.moveTo(0, height / 2);

  const sliceWidth = (width * 1.0) / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }

    x += sliceWidth;
  }

  context.lineTo(width, height / 2);
  context.strokeStyle = color;
  context.stroke();
}

export function getAmplitude(timeDomainData: Uint8Array) {
  let sumSquares = 0.0;

  for (let i = 0; i < timeDomainData.length; i++) {
    sumSquares += timeDomainData[i] * timeDomainData[i];
  }

  return Math.sqrt(sumSquares / timeDomainData.length);
}
