export type IPointTuple = [number, number];

export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function resizeCanvas(canvas: HTMLCanvasElement) {
  console.log('width', window.innerWidth);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function saveAndRestore(context: CanvasRenderingContext2D, callback: () => void) {
  context.save();
  callback();
  context.restore();
}

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
      deviceId: { exact: deviceId },
    },
  });
}

export function make_getTimeData(audioContext: AudioContext, stream: MediaStream, fftSize = 2048) {
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  analyser.fftSize = fftSize;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  console.log('length', dataArray.length);

  sourceNode.connect(analyser);

  return () => {
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  };
}

export function getAmplitude(timeDomainData: Uint8Array) {
  let sumSquares = 0.0;

  for (let i = 0; i < timeDomainData.length; i++) {
    sumSquares += timeDomainData[i] * timeDomainData[i];
  }

  return Math.sqrt(sumSquares / timeDomainData.length);
}

export function createWaveformRenderer(context: CanvasRenderingContext2D, getDataArray: () => Uint8Array) {
  return (color = '#ff0000') => {
    const { width, height } = context.canvas;
    const dataArray = getDataArray();
    const sliceWidth = (width + 100) / dataArray.length;

    saveAndRestore(context, () => {
      context.strokeStyle = color;
      context.lineWidth = 30;
      context.lineCap = 'round';
      context.translate(0, height / 2);

      for (let i = 0; i < dataArray.length; i++) {
        const x = i * sliceWidth;
        const normalizedValue = dataArray[i] / 128.0 - 1;

        if (normalizedValue < 0.01 && normalizedValue > -0.01) {
          break;
        }

        const y1 = normalizedValue * 1000;
        const y2 = -normalizedValue * 1000;

        context.beginPath();
        context.moveTo(x, y1);
        context.lineTo(x, y2);
        context.stroke();
      }
    });
  };
}

export function drawWave(
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
