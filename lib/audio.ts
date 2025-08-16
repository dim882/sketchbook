export async function fetchAudioFile(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  return await response.arrayBuffer();
}

export async function setupAudio(arrayBuffer: ArrayBuffer, audioContext: AudioContext): Promise<AudioBufferSourceNode> {
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  return source;
}

export function playAudio(source: AudioBufferSourceNode): void {
  source.start();
}

export function getAmplitude(timeDomainData: Uint8Array): number {
  let sumSquares = 0.0;

  for (let i = 0; i < timeDomainData.length; i++) {
    sumSquares += timeDomainData[i] * timeDomainData[i];
  }

  return Math.sqrt(sumSquares / timeDomainData.length);
}
