export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  let frameDuration = 1000 / fps;
  let lastFrameTime = 0;

  let t = 0;
  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(context, t); // Assuming `context` is accessible in this scope
    t++;
  }

  requestAnimationFrame(animate);
}

export function getAudioDevices(labelPrefix: string): Promise<Promise<MediaStream>[]> {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      console.table(devices);
      const deviceTracks = devices
        .filter((device) => device.label.match(`${labelPrefix}:`))
        .sort((a, b) => (a.label < b.label ? -1 : 0));
      return deviceTracks;
    })
    .then((deviceTracks) => {
      console.table(deviceTracks);

      if (deviceTracks.length > 0) {
        return deviceTracks.map((device) =>
          navigator.mediaDevices.getUserMedia({ audio: { deviceId: device.deviceId } })
        );
      } else {
        console.error('QuickTime device not found');
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

export function setupAudioContext(stream: MediaStream): {
  audioContext: AudioContext;
  sourceNode: MediaStreamAudioSourceNode;
} {
  const audioContext = new AudioContext();
  const sourceNode = audioContext.createMediaStreamSource(stream);
  return { audioContext, sourceNode };
}

export function createAnalyser(audioContext: AudioContext): AnalyserNode {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // Adjust FFT size for frequency analysis
  return analyser;
}

export function renderWaveform(ctx: CanvasRenderingContext2D, dataArray: Uint8Array): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
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
  ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
  ctx.stroke();
}
