export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function resizeCanvas(canvas: HTMLCanvasElement) {
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
