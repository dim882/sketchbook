export interface IFPSStats {
  rafFPS: number;
  renderFPS: number;
  frameTimeMs: number;
}

export interface IFPSTracker {
  onRAF: (time: number) => void;
  onRenderStart: () => void;
  onRenderEnd: (time: number) => void;
  getStats: () => IFPSStats;
}

const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
};

export const createFPSTracker = (sampleSize = 60): IFPSTracker => {
  let lastRAFTime = 0;
  let lastRenderTime = 0;
  let renderStartTime = 0;

  const rafDeltas: number[] = [];
  const renderDeltas: number[] = [];
  const frameTimes: number[] = [];

  const onRAF = (time: number) => {
    if (lastRAFTime > 0) {
      const rafDelta = time - lastRAFTime;

      rafDeltas.push(rafDelta);

      if (rafDeltas.length > sampleSize) {
        rafDeltas.shift();
      }
    }

    lastRAFTime = time;
  };

  const onRenderStart = () => {
    renderStartTime = performance.now();
  };

  const onRenderEnd = (time: number) => {
    const frameTime = performance.now() - renderStartTime;

    frameTimes.push(frameTime);

    if (frameTimes.length > sampleSize) {
      frameTimes.shift();
    }

    if (lastRenderTime > 0) {
      const renderDelta = time - lastRenderTime;

      renderDeltas.push(renderDelta);

      if (renderDeltas.length > sampleSize) {
        renderDeltas.shift();
      }
    }

    lastRenderTime = time;
  };

  const getStats = (): IFPSStats => {
    const avgRAFDelta = calculateAverage(rafDeltas);
    const avgRenderDelta = calculateAverage(renderDeltas);
    const avgFrameTime = calculateAverage(frameTimes);

    return {
      rafFPS: avgRAFDelta > 0 ? 1000 / avgRAFDelta : 0,
      renderFPS: avgRenderDelta > 0 ? 1000 / avgRenderDelta : 0,
      frameTimeMs: avgFrameTime,
    };
  };

  return {
    onRAF,
    onRenderStart,
    onRenderEnd,
    getStats,
  };
};
